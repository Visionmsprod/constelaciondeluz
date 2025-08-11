document.addEventListener('DOMContentLoaded', () => {
    // Conexión al servidor que estará en tu propio computador
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

    let mediaRecorder;
    let audioChunks = [];
    let isExploring = false;
    let singleAudioPlayer = new Audio(); // Un único reproductor para escuchar estrellas

    // --- LÓGICA DEL PRÓLOGO (sin cambios) ---
    // ... (pega aquí la lógica del prólogo que ya teníamos)

    // --- LÓGICA DE GRABACIÓN (sin cambios) ---
    // ... (pega aquí la lógica de grabación que ya teníamos)

    // --- LÓGICA DE ENVÍO ---
    sendButton.addEventListener('click', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        socket.emit('new-message', audioBlob); // Enviamos el audio
        
        mainInterface.classList.remove('active');
        finalMessage.classList.add('active');
    });

    // --- LÓGICA DE EXPLORACIÓN ---
    exploreButton.addEventListener('click', () => {
        finalMessage.classList.remove('active');
        skyContainer.style.cursor = 'pointer'; // Cambia el cursor para indicar que es explorable
        isExploring = true;
        // Pedir el estado actual del cielo para mostrarlo
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
        starEl.classList.add('visible'); // Todas las estrellas son visibles en modo exploración

        // Guardamos la URL del audio en el propio elemento de la estrella
        starEl.dataset.audioUrl = starData.audioUrl;

        // Añadimos el evento de clic para reproducir el audio
        starEl.addEventListener('click', () => {
            if (isExploring) {
                singleAudioPlayer.src = starEl.dataset.audioUrl;
                singleAudioPlayer.play().catch(e => console.error("Error al reproducir audio:", e));
                
                // Efecto visual al hacer clic
                starEl.classList.add('newly-born');
                setTimeout(() => starEl.classList.remove('newly-born'), 2000);
            }
        });

        skyContainer.appendChild(starEl);
    }

    // --- LÓGICA DE SOCKETS PARA EL USUARIO ---

    // Este evento actualiza el cielo en MODO EXPLORACIÓN
    socket.on('initial-state', (initialData) => {
        if (isExploring) {
            skyContainer.innerHTML = ''; // Limpiar el cielo antes de dibujar
            initialData.stars.forEach(star => createStar(star));
        }
    });

    // Este evento añade estrellas en tiempo real MIENTRAS estamos explorando
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
