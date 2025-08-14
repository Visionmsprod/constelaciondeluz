document.addEventListener('DOMContentLoaded', () => {
    const socket = io('https://constelaciondeluz.onrender.com'); 

    // Referencias a los elementos del DOM (igual que antes)
    const prologueContainer = document.getElementById('prologue-container');
    const mainInterface = document.getElementById('main-interface');
    const finalMessage = document.getElementById('final-message');
    const recordButton = document.getElementById('record-button');
    const sendButton = document.getElementById('send-button');
    const exploreButton = document.getElementById('explore-button');
    const audioPlayback = document.getElementById('audio-playback');
    const prologueBtns = document.querySelectorAll('.prologue-btn');
    const startExperienceBtn = document.getElementById('start-experience-btn');
    const skyContainer = document.getElementById('sky-container');

    let currentStep = 1;
    let mediaRecorder;
    let audioChunks = [];
    let isExploring = false;
    let singleAudioPlayer = new Audio();

    // Lógica del Prólogo (idéntica a la que me pasaste, pero completa)
    function showPrologueStep(step) {
        document.querySelectorAll('.prologue-step').forEach(el => el.classList.remove('active'));
        document.querySelector(`.prologue-step[data-step="${step}"]`).classList.add('active');
    }
    prologueBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep++;
            if (currentStep <= 3) showPrologueStep(currentStep);
        });
    });
    startExperienceBtn.addEventListener('click', () => {
        prologueContainer.classList.remove('active');
        mainInterface.classList.add('active');
    });
    
    // Lógica de Grabación (idéntica, pero completa)
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            audioChunks = [];
            mediaRecorder.addEventListener("dataavailable", event => audioChunks.push(event.data));
            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayback.src = audioUrl;
                recordButton.classList.add('hidden');
                document.getElementById('recording-controls').classList.remove('hidden');
            });
        } catch (err) { alert("No se pudo acceder al micrófono."); }
    }
    recordButton.addEventListener('pointerdown', () => {
        recordButton.classList.add('recording');
        startRecording();
    });
    recordButton.addEventListener('pointerup', () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            recordButton.classList.remove('recording');
        }
    });

    // Lógica de Envío (¡LA PARTE CORREGIDA!)
    sendButton.addEventListener('click', async () => {
        sendButton.disabled = true;
        sendButton.textContent = "Enviando...";

        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
            // Usamos fetch para enviar el archivo al nuevo endpoint del servidor
            const response = await fetch('https://constelaciondeluz.onrender.com/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('El servidor no pudo procesar el audio.');
            }

            mainInterface.classList.remove('active');
            finalMessage.classList.add('active');

        } catch (error) {
            console.error('Error al enviar el audio:', error);
            alert('Hubo un problema al enviar tu luz. Por favor, inténtalo de nuevo.');
        } finally {
            sendButton.disabled = false;
            sendButton.textContent = "Enviar a la constelación ✨";
        }
    });

    // --- Lógica de Exploración (idéntica a la que me pasaste) ---
    // ...
});
