document.addEventListener('DOMContentLoaded', () => {
    // Conexión al servidor que estará en tu propio computador
    const socket = io('https://constelaciondeluz.onrender.com'); 

    // --- ELEMENTOS DEL DOM ---
    const prologueContainer = document.getElementById('prologue-container');
    const mainInterface = document.getElementById('main-interface');
    const finalMessage = document.getElementById('final-message');
    const prologueBtns = document.querySelectorAll('.prologue-btn');
    const startExperienceBtn = document.getElementById('start-experience-btn');
    const recordButton = document.getElementById('record-button');
    const recordingControls = document.getElementById('recording-controls');
    const audioPlayback = document.getElementById('audio-playback');
    const sendButton = document.getElementById('send-button');
    
    let currentStep = 1;
    let mediaRecorder;
    let audioChunks = [];

    // Lógica del Prólogo
    function showPrologueStep(step) {
        document.querySelectorAll('.prologue-step').forEach(el => el.classList.remove('active'));
        document.querySelector(`.prologue-step[data-step="${step}"]`).classList.add('active');
    }

    prologueBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep++;
            if (currentStep <= 3) {
                showPrologueStep(currentStep);
            }
        });
    });

    startExperienceBtn.addEventListener('click', () => {
        prologueContainer.classList.remove('active');
        mainInterface.classList.add('active');
    });

    // Lógica de Grabación
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            
            audioChunks = [];
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });
            
            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayback.src = audioUrl;
                recordButton.classList.add('hidden');
                recordingControls.classList.remove('hidden');
            });

        } catch (err) { alert("No se pudo acceder al micrófono. Por favor, otorga los permisos necesarios."); }
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

    // Lógica de Envío
    sendButton.addEventListener('click', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        socket.emit('new-message', audioBlob);

        mainInterface.classList.remove('active');
        finalMessage.classList.add('active');
    });

});

