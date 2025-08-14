document.addEventListener('DOMContentLoaded', () => {
    // Reemplaza esta URL por la de tu servidor real en Render
    const socket = io('https://constelaciondeluz.onrender.com');

    // --- ELEMENTOS DEL DOM ---
    const prologueContainer = document.getElementById('prologue-container');
    const steps = document.querySelectorAll('.prologue-step');
    const mainInterface = document.getElementById('main-interface');
    const finalMessage = document.getElementById('final-message');
    // ... (El resto de las referencias al DOM son las mismas que ya tenías)

    let currentStep = 1;
    let mediaRecorder;
    let audioChunks = [];
    let isExploring = false;
    let singleAudioPlayer = new Audio();

    // --- NUEVA FUNCIÓN DE TRANSICIÓN COREOGRAFIADA ---
    function transitionTo(outgoingElement, incomingElement) {
        if (outgoingElement) {
            outgoingElement.classList.add('fading-out');
            setTimeout(() => {
                outgoingElement.classList.remove('active');
                outgoingElement.classList.remove('fading-out');
            }, 800); // Coincide con la duración de la transición en CSS
        }
        
        setTimeout(() => {
            if (incomingElement) {
                incomingElement.classList.add('active');
            }
        }, outgoingElement ? 400 : 0); // Empieza a aparecer a la mitad de la transición de salida
    }

    // --- LÓGICA DEL PRÓLOGO (Actualizada) ---
    steps.forEach(step => {
        const btn = step.querySelector('.prologue-btn');
        btn.addEventListener('click', () => {
            const nextStepNum = parseInt(step.dataset.step) + 1;
            const nextStepEl = document.querySelector(`.prologue-step[data-step="${nextStepNum}"]`);

            if (nextStepEl) {
                step.classList.remove('active');
                nextStepEl.classList.add('active');
            } else {
                // Es el último botón, transicionamos a la interfaz principal
                transitionTo(prologueContainer, mainInterface);
            }
        });
    });

    // --- LÓGICA DE GRABACIÓN (Sin cambios) ---
    // ... (Pega aquí la lógica completa de grabación que ya tenías)
    
    // --- LÓGICA DE ENVÍO (Actualizada para usar la nueva transición) ---
    const sendButton = document.getElementById('send-button');
    sendButton.addEventListener('click', async () => {
        // ... (la lógica interna de 'fetch' y 'formData' se mantiene igual) ...

        try {
            // ... (código de fetch) ...
            
            // Al tener éxito, usamos la nueva transición
            transitionTo(mainInterface, finalMessage);

        } catch (error) {
            // ... (manejo de errores) ...
        }
    });

    // --- LÓGICA DE EXPLORACIÓN (Actualizada) ---
    const exploreButton = document.getElementById('explore-button');
    exploreButton.addEventListener('click', () => {
        // Simplemente ocultamos el mensaje final. La exploración es sobre el cielo.
        finalMessage.classList.remove('active');
        document.getElementById('sky-container').style.cursor = 'pointer';
        isExploring = true;
        socket.emit('get-initial-state');
    });

    // --- El resto del código de user.js (createStar, lógica de sockets) se mantiene igual ---
    // ... (Pega aquí el resto de las funciones que ya tenías)
});
    // --- Lógica de Exploración (idéntica a la que me pasaste) ---
    // ...
});

