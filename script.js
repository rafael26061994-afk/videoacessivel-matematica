const INITIAL_STATE = ['R', 'R', 'R', 'E', 'L', 'L', 'L'];
const WIN_STATE = ['L', 'L', 'L', 'E', 'R', 'R', 'R'];

let currentState = [...INITIAL_STATE];
let moves = 0;
let fontScale = 1.0; 
let isSpeaking = false;

function renderPond3D() {
    const pond = document.getElementById('pond-container');
    pond.innerHTML = '';

    currentState.forEach((state, index) => {
        const pad3D = document.createElement('div');
        pad3D.className = 'pad-3d';
        pad3D.id = `pad-${index}`;
        pad3D.onclick = () => handlePadClick(index);

        const topFace = document.createElement('div');
        topFace.className = 'pad-face-top';

        if (state === 'R') {
            topFace.innerHTML = `
                <div class="frog-illustration-container" id="frog-${index}">
                    <img src="sapo-verde.png" alt="Sapo Verde virado para a direita" class="frog-img">
                </div>
            `;
        } else if (state === 'L') {
            topFace.innerHTML = `
                <div class="frog-illustration-container" id="frog-${index}">
                    <img src="sapo-amarelo.png" alt="Sapo Amarelo virado para a esquerda" class="frog-img">
                </div>
            `;
        }

        pad3D.appendChild(topFace);
        pond.appendChild(pad3D);
    });

    document.getElementById('move-count').textContent = moves;
    
    if (!checkWinCondition()) {
        checkDeadlock();
    }
}

function handlePadClick(index) {
    const frogType = currentState[index];
    if (frogType === 'E') return;

    let targetIndex = -1;
    let jumpDistance = 0;

    if (frogType === 'R') {
        if (index + 1 < 7 && currentState[index + 1] === 'E') {
            targetIndex = index + 1;
            jumpDistance = 1;
        } else if (index + 2 < 7 && currentState[index + 2] === 'E') {
            targetIndex = index + 2;
            jumpDistance = 2;
        }
    } else if (frogType === 'L') {
        if (index - 1 >= 0 && currentState[index - 1] === 'E') {
            targetIndex = index - 1;
            jumpDistance = 1;
        } else if (index - 2 >= 0 && currentState[index - 2] === 'E') {
            targetIndex = index - 2;
            jumpDistance = 2;
        }
    }

    if (targetIndex === -1) {
        restartGame();
        return;
    }

    const frogElement = document.getElementById(`frog-${index}`);
    const direction = (frogType === 'R') ? 'right' : 'left';
    const physicalJumpClass = `jump-${direction}-${jumpDistance}`;
    
    if (frogElement) {
        frogElement.className = ''; 
        frogElement.classList.add('frog-illustration-container', physicalJumpClass);
    }

    const delayTime = (jumpDistance === 2) ? 600 : 500;
    setTimeout(() => {
        swap(index, targetIndex);
    }, delayTime);
}

function swap(fromIndex, toIndex) {
    currentState[toIndex] = currentState[fromIndex];
    currentState[fromIndex] = 'E';
    moves++;
    renderPond3D();
}

function checkWinCondition() {
    const isWin = currentState.every((val, index) => val === WIN_STATE[index]);
    const winMsg = document.getElementById('win-message');
    if (winMsg) {
        if (isWin) {
            winMsg.classList.remove('hidden');
            return true;
        } else {
            winMsg.classList.add('hidden');
        }
    }
    return false;
}

function checkDeadlock() {
    let hasMoves = false;

    for (let i = 0; i < currentState.length; i++) {
        if (currentState[i] === 'R') {
            if ((i + 1 < 7 && currentState[i + 1] === 'E') || (i + 2 < 7 && currentState[i + 2] === 'E')) {
                hasMoves = true;
                break;
            }
        } else if (currentState[i] === 'L') {
            if ((i - 1 >= 0 && currentState[i - 1] === 'E') || (i - 2 >= 0 && currentState[i - 2] === 'E')) {
                hasMoves = true;
                break;
            }
        }
    }

    if (!hasMoves) {
        restartGame();
    }
}

function restartGame() {
    currentState = [...INITIAL_STATE];
    moves = 0;
    renderPond3D();
}

function changeFontSize(dir) {
    fontScale += (dir * 0.1);
    if (fontScale < 0.7) fontScale = 0.7;
    if (fontScale > 1.6) fontScale = 1.6;
    document.documentElement.style.fontSize = (fontScale * 100) + "%";
}

function toggleContrast() {
    document.body.classList.remove('white-bg');
    document.body.classList.toggle('high-contrast');
}

function toggleWhiteBackground() {
    document.body.classList.remove('high-contrast');
    document.body.classList.toggle('white-bg');
}

function toggleAudio() {
    const icon = document.getElementById('audio-icon');
    if (!isSpeaking) {
        const textToRead = document.getElementById('instructions').innerText;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'pt-BR';
        utterance.onend = () => { isSpeaking = false; icon.textContent = '🔊'; };
        window.speechSynthesis.speak(utterance);
        isSpeaking = true;
        icon.textContent = '⏹️';
    } else {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        icon.textContent = '🔊';
    }
}

function toggleLibras() {
    const librasWidget = document.querySelector('[vw-access-button]');
    if (librasWidget) {
        librasWidget.click();
    }
}

renderPond3D();