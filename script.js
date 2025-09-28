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

let currentFontSize = parseFloat(getComputedStyle(body).fontSize); // Pega o tamanho inicial

// --- Funções de Acessibilidade ---

/**
 * Alterna entre o modo normal e o modo de alto contraste.
 */
function toggleContrast() {
    body.classList.toggle('high-contrast');
    const isHighContrast = body.classList.contains('high-contrast');
    // Salva a preferência
    localStorage.setItem('high-contrast', isHighContrast);
    // Feedback Sonoro
    playAudioFeedback('click');
}

/**
 * Altera o tamanho da fonte em um passo.
 * @param {number} step - O valor para adicionar (positivo para aumentar, negativo para diminuir).
 */
function changeFontSize(step) {
    const minSize = 14; // Tamanho mínimo de fonte
    const maxSize = 24; // Tamanho máximo de fonte

    // Calcula o novo tamanho, limitando entre min e max
    let newSize = Math.max(minSize, Math.min(maxSize, currentFontSize + step));

    if (newSize !== currentFontSize) {
        currentFontSize = newSize;
        body.style.fontSize = `${currentFontSize}px`;
        // Salva a preferência
        localStorage.setItem('font-size', currentFontSize);
        // Feedback Sonoro
        playAudioFeedback('click');
    }
}

/**
 * Carrega as configurações de acessibilidade salvas.
 */
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
        // Se não houver salvo, inicializa com o tamanho padrão do CSS
        currentFontSize = parseFloat(getComputedStyle(body).fontSize);
    }
}


// --- Funções de Feedback ---

/**
 * Reproduz um som para feedback visual.
 * @param {string} type - 'success', 'error', 'loading', 'click'.
 */
function playAudioFeedback(type) {
    let audio = new Audio();
    switch (type) {
        case 'success':
            // Som de sucesso simples (pode ser substituído por um arquivo .mp3 ou .wav)
            // Exemplo de tom sintetizado (não é compatível em todos os navegadores, prefira um arquivo!)
            // new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAABKAAIAb3JpZ2luYWx....').play();
            break;
        case 'click':
            // Um bip ou clique simples
            break;
        case 'loading':
            // Som de carregamento
            break;
        default:
            return;
    }
    // Para ambientes com recursos limitados, pode-se desativar o som e usar apenas o feedback visual.
}

/**
 * Exibe uma mensagem de feedback na interface.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - 'info', 'success', 'error'.
 */
function showFeedback(message, type = 'info') {
    feedbackMessage.textContent = message;
    // Adiciona classe para estilização de cor (opcional)
    feedbackMessage.className = `feedback-${type}`;
}

// --- Funções de Vídeo e Transcrição ---

/**
 * Lida com o carregamento do arquivo de vídeo.
 * @param {File} file - O arquivo de vídeo.
 */
function handleVideoLoad(file) {
    tutorialSection.classList.add('hidden'); // Esconde o tutorial

    // 1. Exibe a área de conteúdo
    contentArea.classList.remove('hidden');

    // 2. Cria URL local para exibição do vídeo (Funciona 100% offline!)
    const videoURL = URL.createObjectURL(file);
    userVideo.src = videoURL;
    userVideo.load();

    showFeedback(`Vídeo carregado: ${file.name}. Iniciando transcrição...`, 'loading');
    playAudioFeedback('loading');

    // 3. Simula a chamada de Transcrição (PLACEHOLDER REAL)
    simulateTranscriptionProcess(file);

    // 4. Limpeza de URLs após a saída (boa prática, mas o navegador limpa ao fechar)
    userVideo.onloadeddata = () => URL.revokeObjectURL(videoURL);
}

/**
 * **IMPORTANTE: ESTA É A PARTE QUE REQUER UM SERVIDOR BACKEND.**
 * Esta função apenas SIMULA o processo que você precisa implementar no seu servidor.
 *
 * @param {File} videoFile - O arquivo de vídeo para enviar.
 */
function simulateTranscriptionProcess(videoFile) {
    // --- PASSO REAL (A SER IMPLEMENTADO EM UM SERVIDOR) ---
    /*
    const formData = new FormData();
    formData.append('video', videoFile);

    fetch('/api/transcribe', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Exemplo: data.transcription
        displayTranscription(data.transcription);
    })
    .catch(error => {
        console.error('Erro na API de Transcrição:', error);
        displayTranscription("ERRO: Não foi possível obter a transcrição. Verifique a conexão com a API do Whisper.");
        showFeedback('ERRO na Transcrição.', 'error');
        playAudioFeedback('error');
    });
    */
    // --- FIM DO PASSO REAL ---

    // --- SIMULAÇÃO (PARA TESTAR O FRONT-END OFFLINE) ---
    transcriptionOutput.innerHTML = '<p>Processando (simulação)... Aguarde 5 segundos.</p>';
    vlibrasButton.classList.add('hidden');

    setTimeout(() => {
        const simulatedText = "Olá, professores e alunos! Esta é uma transcrição de teste para demonstrar a funcionalidade. O site está pronto para exibir o texto com letras grandes. Agora você pode clicar em 'Ver em Libras' para traduzir o texto, ou usar os botões para mudar o tamanho da fonte e o contraste. Lembre-se, a transcrição real exige a API do Whisper da OpenAI rodando em um servidor.";
        displayTranscription(simulatedText);
        showFeedback('Transcrição pronta!', 'success');
        playAudioFeedback('success');
    }, 5000); // 5 segundos de espera simulada
    // --- FIM DA SIMULAÇÃO ---
}

/**
 * Exibe o texto da transcrição.
 * @param {string} text - O texto da transcrição.
 */
function displayTranscription(text) {
    // Para o VLibras funcionar bem, é melhor colocar o texto em uma div simples ou um <p>
    // e remover qualquer HTML adicional (como a mensagem de "carregando")
    transcriptionOutput.innerHTML = `<p class="vlibras-text-target">${text}</p>`;
    vlibrasButton.classList.remove('hidden'); // Habilita o botão VLibras
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
    playAudioFeedback('success');
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
            e.preventDefault(); // Impede o zoom do navegador
            changeFontSize(2);
        } else if (e.key === '-') {
            e.preventDefault(); // Impede o zoom do navegador
            changeFontSize(-2);
        }
    });

    // 3. Upload de Arquivo (Input)
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleVideoLoad(e.target.files[0]);
            fileInput.value = ''; // Permite carregar o mesmo arquivo novamente
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
            playAudioFeedback('error');
        }
    }, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 5. Botões de Ação
    downloadButton.addEventListener('click', downloadTranscription);

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

// O botão "Ver em Libras" usa o plugin VLibras.
// O plugin se integra automaticamente a elementos marcados pelo script,
// ou você pode disparar a tradução via JavaScript.

// Para que o VLibras comece a traduzir o texto da transcrição, você precisa clicar
// no botão de acessibilidade dele (o bonequinho flutuante).
// O botão "Ver em Libras" no nosso código é um atalho que você pode usar para
// tentar focar ou interagir com o plugin VLibras de alguma forma
// ou apenas informar ao usuário que o texto abaixo está pronto para tradução.

// Como o plugin VLibras funciona externamente, o botão 'Ver em Libras' é mais
// um indicador e um facilitador. Se quiser que ele dispare a tradução,
// você precisará de um código mais avançado para interagir com a API do plugin.
// Por enquanto, ele apenas remove a classe 'hidden'.

// Exemplo simples de ação do botão:
vlibrasButton.addEventListener('click', () => {
    // Apenas garante que o texto está na tela e pronto.
    // O usuário deve interagir com o widget VLibras flutuante para iniciar.
    showFeedback('Pronto para tradução em Libras. Use o widget flutuante do VLibras.', 'info');
});