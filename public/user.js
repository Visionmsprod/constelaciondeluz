document.addEventListener('DOMContentLoaded', () => {
    // Reemplaza esta URL por la de tu servidor real en Render
    const socket = io('https://constelaciondeluz.onrender.com');

    // --- ELEMENTOS DEL DOM ---
    const skyContainer = document.getElementById('sky-container');
    const prologueContainer = document.getElementById('prologue-container');
    const mainInterface = document.getElementById('main-interface');
    const finalMessage = document.getElementById('final-message');
    const recordButton = document.getElementById('record-button');
    const sendButton = document.getElementById('send-button');
    const exploreButton = document.getElementById('explore-button');
    const audioPlayback = document.getElementById('audio-playback');
    const recordingControls = document.getElementById('recording-controls');
    const prologueBtns = document.querySelectorAll('.prologue-btn');
    const startExperienceBtn = document.getElementById('start-experience-btn');

    let mediaRecorder;
    let audioChunks = [];
    let isExploring = false;
    let waitingForMyStar = false; // ¡NUEVA VARIABLE CLAVE!
    let singleAudioPlayer = new Audio();

    // --- LÓGICA DEL PRÓLOGO (Correcta y Funcional) ---
    function showPrologueStep(stepNumber) {
        document.querySelectorAll('.prologue-step').forEach(step => {
            step.classList.toggle('active', parseInt(step.dataset.step) === stepNumber);
        });
    }
    prologueBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const stepNum = parseInt(btn.parentElement.dataset.step);
            if (stepNum < 3) {
                showPrologueStep(stepNum + 1);
            } else {
                prologueContainer.classList.add('fading-out');
                setTimeout(() => {
                    prologueContainer.classList.remove('active');
                    mainInterface.classList.add('active');
                    prologueContainer.classList.remove('fading-out');
                }, 800);
            }
        });
    });

    // --- LÓGICA DE GRABACIÓN (Correcta y Funcional) ---
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

    // --- LÓGICA DE ENVÍO (¡ACTUALIZADA!) ---
    sendButton.addEventListener('click', async () => {
        sendButton.disabled = true;
        sendButton.textContent = "Tejiendo tu luz...";

        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
            const response = await fetch('https://constelaciondeluz.onrender.com/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('El servidor no pudo procesar el audio.');

            // Transición: Ocultamos la interfaz de grabación y nos preparamos para ver la estrella
            mainInterface.classList.add('fading-out');
            setTimeout(() => {
                mainInterface.classList.remove('active');
                mainInterface.classList.remove('fading-out');
            }, 800);
            
            waitingForMyStar = true; // ¡Activamos la espera de nuestra estrella!

        } catch (error) {
            console.error('Error al enviar el audio:', error);
            alert('Hubo un problema al enviar tu luz. Por favor, inténtalo de nuevo.');
            sendButton.disabled = false;
            sendButton.textContent = "Enviar a la constelación ✨";
        }
    });

    // --- LÓGICA DE CREACIÓN DE ESTRELLAS Y EXPLORACIÓN ---
    function createStar(starData, isNew = false) {
        const starEl = document.createElement('div');
        starEl.className = 'star';
        starEl.style.left = `${starData.coords.x}%`;
        starEl.style.top = `${starData.coords.y}%`;
        const size = Math.random() * 3 + 1;
        starEl.style.width = `${size}px`;
        starEl.style.height = `${size}px`;
        starEl.classList.add('visible');
        if (isNew) {
            starEl.classList.add('newly-born');
        }

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

    // --- LÓGICA DE SOCKETS (¡ACTUALIZADA!) ---
    socket.on('add-star', (starData) => {
        // Si estábamos esperando nuestra propia estrella...
        if (waitingForMyStar) {
            createStar(starData, true); // La creamos con la animación especial
            waitingForMyStar = false; // Dejamos de esperar

            // Después de 2 segundos, mostramos el mensaje final
            setTimeout(() => {
                finalMessage.classList.add('active');
            }, 2000);
        } 
        // Si ya estamos en modo exploración, simplemente añadimos la estrella de otro
        else if (isExploring) {
            createStar(starData, false);
        }
    });

    socket.on('initial-state', (initialData) => {
        if (isExploring) {
            skyContainer.innerHTML = '';
            initialData.stars.forEach(star => createStar(star, false));
        }
    });

    socket.on('project-reset', () => {
        skyContainer.innerHTML = '';
    });
});
        }
    });
});

