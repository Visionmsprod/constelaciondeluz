document.addEventListener('DOMContentLoaded', () => {
    // Reemplaza esta URL por la de tu servidor real en Render
    const socket = io('https://constelaciondeluz.onrender.com'); 

    // --- ELEMENTOS DEL DOM ---
    const prologueContainer = document.getElementById('prologue-container');
    const steps = document.querySelectorAll('.prologue-step');
    const mainInterface = document.getElementById('main-interface');
    const finalMessage = document.getElementById('final-message');
    const recordButton = document.getElementById('record-button');
    const sendButton = document.getElementById('send-button');
    const exploreButton = document.getElementById('explore-button');
    const audioPlayback = document.getElementById('audio-playback');
    const skyContainer = document.getElementById('sky-container');
    const recordingControls = document.getElementById('recording-controls');

    let currentStep = 1;
    let mediaRecorder;
    let audioChunks = [];
    let isExploring = false;
    let singleAudioPlayer = new Audio();

    // --- LÓGICA DEL PRÓLOGO (CORREGIDA Y SIMPLIFICADA) ---
    function showPrologueStep(stepNumber) {
        steps.forEach(step => {
            if (parseInt(step.dataset.step) === stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Añadir eventos a los botones del prólogo
    steps.forEach(step => {
        const btn = step.querySelector('.prologue-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                const stepNum = parseInt(step.dataset.step);
                if (stepNum < 3) {
                    // Transición entre pasos 1 y 2
                    showPrologueStep(stepNum + 1);
                } else {
                    // Es el último botón ("DEJA TU LUZ")
                    prologueContainer.classList.add('fading-out'); // Inicia la animación de salida
                    setTimeout(() => {
                        prologueContainer.classList.remove('active');
                        mainInterface.classList.add('active');
                        prologueContainer.classList.remove('fading-out');
                    }, 800); // Duración de la animación en CSS
                }
            });
        }
    });


    // --- LÓGICA DE GRABACIÓN (COMPLETA Y CORRECTA) ---
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
                recordingControls.classList.remove('hidden');
            });
        } catch (err) {
            alert("No se pudo acceder al micrófono. Por favor, otorga los permisos necesarios.");
        }
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


    // --- LÓGICA DE ENVÍO ---
    sendButton.addEventListener('click', async () => {
        sendButton.disabled = true;
        sendButton.textContent = "Enviando...";

        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
            const response = await fetch('https://constelaciondeluz.onrender.com/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('El servidor no pudo procesar el audio.');

            // Transición elegante
            mainInterface.classList.add('fading-out');
            setTimeout(() => {
                mainInterface.classList.remove('active');
                finalMessage.classList.add('active');
                mainInterface.classList.remove('fading-out');
            }, 800);

        } catch (error) {
            console.error('Error al enviar el audio:', error);
            alert('Hubo un problema al enviar tu luz. Por favor, inténtalo de nuevo.');
        } finally {
            sendButton.disabled = false;
            sendButton.textContent = "Enviar a la constelación ✨";
        }
    });


    // --- LÓGICA DE EXPLORACIÓN ---
    exploreButton.addEventListener('click', () => {
        finalMessage.classList.add('fading-out');
        setTimeout(() => {
            finalMessage.classList.remove('active');
            finalMessage.classList.remove('fading-out');
        }, 800);
        
        skyContainer.style.cursor = 'pointer';
        isExploring = true;
        socket.emit('get-initial-state');
    });

    function createStar(starData) {
        const starEl = document.createElement('div');
        starEl.className = 'star';
        starEl.style.left = `${starData.coords.x}%`;
        starEl.style.top = `${starData.coords.y}%`;
        const size = Math.random() * 3 + 1;
        starEl.style.width = `${size}px`;
        starEl.style.height = `${size}px`;
        starEl.classList.add('visible');
        starEl.dataset.audioUrl = starData.audioUrl;

        starEl.addEventListener('click', () => {
            if (isExploring) {
                singleAudioPlayer.src = starEl.dataset.audioUrl;
                singleAudioPlayer.play().catch(e => console.error("Error al reproducir audio:", e));
                starEl.classList.add('newly-born');
                setTimeout(() => starEl.classList.remove('newly-born'), 2000);
            }
        });
        skyContainer.appendChild(starEl);
    }

    // --- LÓGICA DE SOCKETS PARA EL USUARIO ---
    socket.on('initial-state', (initialData) => {
        if (isExploring) {
            skyContainer.innerHTML = '';
            initialData.stars.forEach(star => createStar(star));
        }
    });

    socket.on('add-star', (starData) => {
        if (isExploring) {
            createStar(starData);
        }
    });

    socket.on('project-reset', () => {
        if (isExploring) {
            skyContainer.innerHTML = '';
        }
    });
});
