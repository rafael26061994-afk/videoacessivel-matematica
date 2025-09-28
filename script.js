// --- Variáveis Globais ---
const body = document.body;
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('video-file-input');
const feedbackMessage = document.getElementById('feedback-message');
const contentArea = document.getElementById('content-area');
const userVideo = document.getElementById('user-video');
const transcriptionOutput = document.getElementById('transcription-output');
const vlibrasButton = document.getElementById('vlibras-button');
const downloadButton = document.getElementById('download-button');
const tutorialSection = document.getElementById('tutorial');

let currentFontSize; // inicializada em loadAccessibilitySettings

// --- Funções de Acessibilidade ---
function toggleContrast() {
  body.classList.toggle('high-contrast');
  localStorage.setItem('high-contrast', body.classList.contains('high-contrast'));
}

function changeFontSize(step) {
  const minSize = 14;
  const maxSize = 24;
  let newSize = Math.max(minSize, Math.min(maxSize, currentFontSize + step));

  if (newSize !== currentFontSize) {
    currentFontSize = newSize;
    body.style.fontSize = `${currentFontSize}px`;
    localStorage.setItem('font-size', currentFontSize);
  }
}

function loadAccessibilitySettings() {
  if (localStorage.getItem('high-contrast') === 'true') {
    body.classList.add('high-contrast');
  }
  const savedFontSize = localStorage.getItem('font-size');
  if (savedFontSize) {
    currentFontSize = parseFloat(savedFontSize);
    body.style.fontSize = `${currentFontSize}px`;
  } else {
    currentFontSize = parseFloat(getComputedStyle(body).fontSize);
  }
}

// Feedback visual
function showFeedback(message, type = 'info') {
  feedbackMessage.textContent = message;
  feedbackMessage.className = `feedback-${type}`;
}

// --- Funções de Vídeo e Transcrição ---
function handleVideoLoad(file) {
  tutorialSection.classList.add('hidden');
  contentArea.classList.remove('hidden');

  const videoURL = URL.createObjectURL(file);
  userVideo.src = videoURL;
  userVideo.load();

  showFeedback(`Vídeo carregado: ${file.name}. Iniciando simulação de transcrição...`, 'loading');
  
  simulateTranscriptionProcess(file);

  userVideo.onloadeddata = () => URL.revokeObjectURL(videoURL);
}

// Simula backend Whisper
function simulateTranscriptionProcess(videoFile) {
  transcriptionOutput.innerHTML = '<p>Processando (simulação)... Aguarde 5 segundos.</p>';
  vlibrasButton.classList.add('hidden');

  setTimeout(() => {
    const simulatedText = "Olá, professores e alunos! Esta é uma transcrição de teste para demonstrar a funcionalidade. Clique no avatar do VLibras para iniciar a tradução em Libras.";
    displayTranscription(simulatedText);
    showFeedback('Transcrição pronta!', 'success');
  }, 5000); 
}

function displayTranscription(text) {
  transcriptionOutput.innerHTML = `<p class="vlibras-text-target">${text}</p>`;
  vlibrasButton.classList.remove('hidden'); 
}

function downloadTranscription() {
  const textElement = transcriptionOutput.querySelector('.vlibras-text-target');
  const text = textElement ? textElement.innerText : "Transcrição vazia.";

  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'transcricao_videoacessivel.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showFeedback('Transcrição baixada!', 'success');
}

// --- Reconhecimento de Fala (Web Speech API) ---
function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Web Speech API não disponível.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // cria botão 🎤
  let micBtn = document.createElement('button');
  micBtn.id = 'micBtn';
  micBtn.innerText = '🎤 Gravar fala';
  micBtn.className = 'button';
  transcriptionOutput.parentNode.insertBefore(micBtn, transcriptionOutput);

  let listening = false;
  micBtn.addEventListener('click', () => {
    if (!listening) {
      recognition.start();
      micBtn.innerText = '⏺️ Gravando... clique para parar';
      listening = true;
    } else {
      recognition.stop();
    }
  });

  recognition.onresult = (ev) => {
    const text = ev.results[0][0].transcript;
    displayTranscription(text);
    showFeedback('Transcrição por voz pronta!', 'success');
  };

  recognition.onerror = (ev) => {
    showFeedback('Erro no reconhecimento de fala: ' + (ev.error || 'desconhecido'), 'error');
  };

  recognition.onend = () => {
    listening = false;
    micBtn.innerText = '🎤 Gravar fala';
  };
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', () => {
  loadAccessibilitySettings();

  // Acessibilidade
  document.getElementById('toggle-contrast').addEventListener('click', toggleContrast);
  document.getElementById('increase-font').addEventListener('click', () => changeFontSize(2));
  document.getElementById('decrease-font').addEventListener('click', () => changeFontSize(-2));

  // Atalhos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'c' || e.key === 'C') toggleContrast();
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); changeFontSize(2); }
    else if (e.key === '-') { e.preventDefault(); changeFontSize(-2); }
  });

  // Upload de arquivo
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleVideoLoad(e.target.files[0]);
      fileInput.value = '';
    }
  });

  // Drag & drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
  });

  uploadArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      handleVideoLoad(files[0]);
    } else {
      showFeedback('Por favor, solte um arquivo de vídeo.', 'error');
    }
  }, false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Botões de ação
  downloadButton.addEventListener('click', downloadTranscription);
  vlibrasButton.addEventListener('click', () => {
    showFeedback('Texto pronto! Clique no avatar (bonequinho) do VLibras para traduzir a transcrição.', 'info');
  });

  // Reconhecimento de fala
  setupSpeechRecognition();

  // PWA
  setupPWA();
});

// --- PWA Service Worker ---
function setupPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registrado:', registration.scope);
        })
        .catch(error => {
          console.error('Falha no registro do ServiceWorker:', error);
        });
    });
  }
}
