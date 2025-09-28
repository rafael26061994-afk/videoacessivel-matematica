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

let currentFontSize; // Será inicializada em loadAccessibilitySettings

// --- Funções de Acessibilidade ---

function toggleContrast() {
    body.classList.toggle('high-contrast');
    localStorage.setItem('high-contrast', body.classList.contains('high-contrast'));
    // Feedback Sonoro (simulado)
}

function changeFontSize(step) {
    const minSize = 14;
    const maxSize = 24;
    let newSize = Math.max(minSize, Math.min(maxSize, currentFontSize + step));

    if (newSize !== currentFontSize) {
        currentFontSize = newSize;
        body.style.fontSize = `${currentFontSize}px`;
        localStorage.setItem('font-size', currentFontSize);
        // Feedback Sonoro (simulado)
    }
}

function loadAccessibilitySettings() {
    // Carregar Contraste
    if (localStorage.getItem('high-contrast') === 'true') {
        body.classList.add('high-contrast');
    }
    // Carregar Fonte
    const savedFontSize = localStorage.getItem('font-size');
    if (savedFontSize) {
        currentFontSize = parseFloat(savedFontSize);
        body.style.fontSize = `${currentFontSize}px`;
    } else {
        // Inicializa com o tamanho padrão do CSS (18px)
        currentFontSize = parseFloat(getComputedStyle(body).fontSize);
    }
}

// Funções de Feedback (Apenas visual, áudio removido para simplicidade de PWA)
function showFeedback(message, type = 'info') {
    feedbackMessage.textContent = message;
    feedbackMessage.className = `feedback-${type}`;
}

// --- Funções de Vídeo e Transcrição ---

/**
 * Lida com o carregamento do arquivo de vídeo.
 */
function handleVideoLoad(file) {
    tutorialSection.classList.add('hidden');
    contentArea.classList.remove('hidden');

    // Cria URL local (funciona offline!)
    const videoURL = URL.createObjectURL(file);
    userVideo.src = videoURL;
    userVideo.load();

    showFeedback(`Vídeo carregado: ${file.name}. Iniciando simulação de transcrição...`, 'loading');
    
    // Inicia a simulação
    simulateTranscriptionProcess(file);

    userVideo.onloadeddata = () => URL.revokeObjectURL(videoURL);
}

/**
 * SIMULAÇÃO: Esta é a parte que exige um servidor para a API Whisper REAL.
 */
function simulateTranscriptionProcess(videoFile) {
    transcriptionOutput.innerHTML = '<p>Processando (simulação)... Aguarde 5 segundos.</p>';
    vlibrasButton.classList.add('hidden');

    // Simulação de espera de 5 segundos
    setTimeout(() => {
        const simulatedText = "Olá, professores e alunos! Esta é uma transcrição de teste para demonstrar a funcionalidade. O site está pronto para exibir o texto com letras grandes e acessível. Agora, clique no avatar do VLibras para iniciar a tradução em tempo real. Lembre-se, a transcrição automática real precisa de um servidor backend com a API Whisper.";
        displayTranscription(simulatedText);
        showFeedback('Transcrição pronta!', 'success');
    }, 5000); 
}

/**
 * Exibe o texto da transcrição.
 */
function displayTranscription(text) {
    // Adiciona o texto em um parágrafo para o VLibras ler facilmente
    transcriptionOutput.innerHTML = `<p class="vlibras-text-target">${text}</p>`;
    vlibrasButton.classList.remove('hidden'); 
}

/**
 * Baixa o texto da transcrição como um arquivo .txt.
 */
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

// --- Event Listeners e Inicialização ---

document.addEventListener('DOMContentLoaded', () => {
    loadAccessibilitySettings();

    // 1. Controles de Acessibilidade
    document.getElementById('toggle-contrast').addEventListener('click', toggleContrast);
    document.getElementById('increase-font').addEventListener('click', () => changeFontSize(2));
    document.getElementById('decrease-font').addEventListener('click', () => changeFontSize(-2));

    // 2. Atalhos de Teclado
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'c' || e.key === 'C') {
            toggleContrast();
        } else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            changeFontSize(2);
        } else if (e.key === '-') {
            e.preventDefault();
            changeFontSize(-2);
        }
    });

    // 3. Upload de Arquivo
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleVideoLoad(e.target.files[0]);
            fileInput.value = '';
        }
    });

    // 4. Drag and Drop
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

    // 5. Botões de Ação
    downloadButton.addEventListener('click', downloadTranscription);
    vlibrasButton.addEventListener('click', () => {
        showFeedback('Texto pronto! Clique no avatar flutuante (bonequinho) do VLibras para começar a tradução do texto da transcrição.', 'info');
    });


    // 6. Configuração PWA (Service Worker)
    setupPWA();
});

/**
 * Configura o Service Worker para o PWA (Instalação e Cache Offline).
 */
function setupPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker registrado com sucesso:', registration.scope);
                })
                .catch(error => {
                    console.error('Falha no registro do ServiceWorker:', error);
                });
        });
    }
}