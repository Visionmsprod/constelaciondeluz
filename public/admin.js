const socket = io('https://constelaciondeluz.onrender.com');

const maxAudiosInput = document.getElementById('max-audios');
const timeoutInput = document.getElementById('timeout');
const updateBtn = document.getElementById('update-settings');
const resetBtn = document.getElementById('reset-project');
const statusDiv = document.getElementById('status');

updateBtn.addEventListener('click', () => {
    const settings = {
        maxConcurrentAudios: parseInt(maxAudiosInput.value, 10),
        inactivityTimeout: parseInt(timeoutInput.value, 10) * 1000 // Convertir a ms
    };
    socket.emit('admin-update-settings', settings);
});

resetBtn.addEventListener('click', () => {
    if (confirm("¿ESTÁS SEGURO? Esta acción borrará todas las estrellas y audios permanentemente.")) {
        socket.emit('admin-reset-project');
    }
});

socket.on('settings-updated', (settings) => {
    statusDiv.textContent = `¡Configuración actualizada! Audios: ${settings.maxConcurrentAudios}, Timeout: ${settings.inactivityTimeout / 1000}s`;
    setTimeout(() => statusDiv.textContent = '', 3000);
});

socket.on('project-reset', () => {
    statusDiv.textContent = '¡El proyecto ha sido reiniciado!';
    setTimeout(() => statusDiv.textContent = '', 3000);

});

