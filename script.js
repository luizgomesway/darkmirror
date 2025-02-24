const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const soundButton = document.getElementById('soundButton');

let audioContext;
let oscillators = [];
let isSoundOn = false;

// Acessa a câmera frontal
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    .then((stream) => {
        video.srcObject = stream;
        video.play();
    })
    .catch((error) => {
        console.error('Erro ao acessar a câmera:', error);
    });

// Processa o vídeo e aplica o overlay
function processVideo() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Desenha o vídeo no canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Converte a imagem para preto e branco
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = brightness; // Vermelho
            data[i + 1] = brightness; // Verde
            data[i + 2] = brightness; // Azul
        }
        ctx.putImageData(imageData, 0, 0);
    }

    requestAnimationFrame(processVideo);
}

// Inicia o processamento do vídeo
video.addEventListener('play', () => {
    processVideo();
});

// Cria uma melodia psicodélica e perturbadora
function createSpookyMelody() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Cria múltiplos osciladores para tons dissonantes
    const frequencies = [110, 130, 98, 87, 73, 146, 220, 196]; // Frequências dissonantes
    const gains = [0.3, 0.2, 0.25, 0.15, 0.1, 0.2, 0.3, 0.25]; // Volumes diferentes

    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sawtooth'; // Tipo de onda para um som mais áspero
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        gainNode.gain.setValueAtTime(gains[index], audioContext.currentTime);

        // Conecta os nós
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Inicia o oscilador
        oscillator.start();
        oscillators.push(oscillator);
    });

    // Adiciona um efeito de modulação para criar uma sensação psicodélica
    const modulator = audioContext.createOscillator();
    const modulationGain = audioContext.createGain();

    modulator.type = 'sine'; // Onda senoidal para modulação suave
    modulator.frequency.setValueAtTime(0.5, audioContext.currentTime); // Frequência de modulação lenta
    modulationGain.gain.setValueAtTime(0.5, audioContext.currentTime); // Intensidade da modulação

    // Conecta o modulador ao ganho dos osciladores
    oscillators.forEach((oscillator) => {
        modulationGain.connect(oscillator.frequency);
    });

    // Inicia o modulador
    modulator.start();

    // Adiciona um efeito de reverberação
    const reverb = audioContext.createConvolver();
    const reverbGain = audioContext.createGain();

    // Cria uma resposta de impulso simples para a reverberação
    const bufferLength = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(2, bufferLength, audioContext.sampleRate);
    const channelDataLeft = buffer.getChannelData(0);
    const channelDataRight = buffer.getChannelData(1);

    for (let i = 0; i < bufferLength; i++) {
        channelDataLeft[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferLength, 2);
        channelDataRight[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferLength, 2);
    }

    reverb.buffer = buffer;
    reverbGain.gain.setValueAtTime(0.5, audioContext.currentTime);

    // Conecta a reverberação
    oscillators.forEach((oscillator) => {
        oscillator.connect(reverb);
    });
    reverb.connect(reverbGain);
    reverbGain.connect(audioContext.destination);
}

// Liga ou desliga o som
function toggleSound() {
    if (isSoundOn) {
        // Desliga o som
        oscillators.forEach((oscillator) => oscillator.stop());
        oscillators = [];
        isSoundOn = false;
        soundButton.textContent = '🔇'; // Ícone de som desligado
    } else {
        // Liga o som
        createSpookyMelody();
        isSoundOn = true;
        soundButton.textContent = '🔊'; // Ícone de som ligado
    }
}

// Adiciona o evento de clique ao botão de som
soundButton.addEventListener('click', toggleSound);

// Inicia o som automaticamente após uma interação do usuário
document.addEventListener('click', () => {
    if (!isSoundOn) {
        toggleSound();
    }
}, { once: true });