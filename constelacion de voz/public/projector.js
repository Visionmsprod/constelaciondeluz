document.addEventListener('DOMContentLoaded', () => {
   const socket = io('https://tu-servidor-en-render.onrender.com');
    const skyContainer = document.getElementById('sky-container');
    const projectorPrompt = document.getElementById('projector-prompt');

    let audioQueue = [];
    let maxConcurrentAudios = 5;
    let isPlaying = false;
    let inactivityTimer;
    let inactivityTimeout = 120000; // 2 minutos por defecto

    function showInvitation() {
        skyContainer.classList.add('dimmed');
        projectorPrompt.classList.add('visible');
    }

    function hideInvitation() {
        skyContainer.classList.remove('dimmed');
        projectorPrompt.classList.remove('visible');
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        hideInvitation();
        inactivityTimer = setTimeout(showInvitation, inactivityTimeout);
    }

    function createStar(coords, isVisible, isNew = false) {
        const starEl = document.createElement('div');
        starEl.className = 'star';
        starEl.style.left = `${coords.x}%`;
        starEl.style.top = `${coords.y}%`;
        const size = Math.random() * 3 + 1;
        starEl.style.width = `${size}px`;
        starEl.style.height = `${size}px`;
        starEl.style.animationDelay = `${Math.random() * 4}s`;
        if (isVisible) starEl.classList.add('visible');
        if (isNew) starEl.classList.add('newly-born');
        skyContainer.appendChild(starEl);
    }

    function playAmbientChorus() {
        isPlaying = true;
        if (audioQueue.length === 0) { isPlaying = false; return; }
        const audiosToPlay = audioQueue.sort(() => 0.5 - Math.random()).slice(0, maxConcurrentAudios);
        audiosToPlay.forEach(audio => {
            audio.volume = Math.random() * 0.4 + 0.1;
            setTimeout(() => { audio.play().catch(e => {}); }, Math.random() * 3000);
        });
        setTimeout(playAmbientChorus, 7000);
    }

    socket.on('connect', () => {
        socket.emit('get-initial-state');
        resetInactivityTimer();
    });

    socket.on('initial-state', (initialData) => {
        skyContainer.innerHTML = '';
        initialData.stars.forEach(star => createStar(star.coords, true));
        audioQueue = initialData.audios.map(url => new Audio(url));
        if (!isPlaying && audioQueue.length > 0) playAmbientChorus();
    });

    socket.on('add-star', (starData) => {
        createStar(starData.coords, true, true);
        const newAudio = new Audio(starData.audioUrl);
        audioQueue.push(newAudio);
        if (!isPlaying) playAmbientChorus();
        resetInactivityTimer();
    });

    socket.on('update-settings', (settings) => {
        maxConcurrentAudios = settings.maxConcurrentAudios;
        inactivityTimeout = settings.inactivityTimeout;
        resetInactivityTimer();
    });

    socket.on('project-reset', () => {
        skyContainer.innerHTML = '';
        audioQueue = [];
        isPlaying = false;
        resetInactivityTimer();
    });

});
