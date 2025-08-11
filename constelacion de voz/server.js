// Pega aquí el código del servidor que te voy a proporcionar ahora.
// Este código es nuevo y esencial.
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- DATOS EN MEMORIA (Para el prototipo) ---
// En un proyecto real, esto estaría en una base de datos.
let starCatalog = [{x:28,y:75},{x:26,y:142},{x:59,y:19},{x:77,y:38},{x:21,y:46},{x:21,y:98},{x:32,y:5},{x:24,y:7},{x:82,y:8},{x:19,y:16}];
let usedStars = [];
let audioUrls = [];
let settings = {
    maxConcurrentAudios: 5,
    inactivityTimeout: 120000 // 2 minutos
};

function resetState() {
    starCatalog = [{x:28,y:75},{x:26,y:142},{x:59,y:19},{x:77,y:38},{x:21,y:46},{x:21,y:98},{x:32,y:5},{x:24,y:7},{x:82,y:8},{x:19,y:16}];
    usedStars = [];
    audioUrls = [];
}

// Servir los archivos estáticos de la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado:', socket.id);

    // Evento para obtener el estado inicial
    socket.on('get-initial-state', () => {
        socket.emit('initial-state', { stars: usedStars, audios: audioUrls });
        socket.emit('update-settings', settings);
    });

    // Evento al recibir un nuevo mensaje
    socket.on('new-message', (audioBlob) => {
        // En un proyecto real:
        // 1. Aquí subirías el audioBlob a Cloudinary.
        // 2. Cloudinary te devolvería una URL.
        // 3. Guardarías esa URL.
        
        // Para este prototipo, simulamos una URL y no guardamos el audio.
        const audioUrl = "simulated_audio_url.mp3"; // URL simulada
        audioUrls.push(audioUrl);
        
        // Asignar una nueva estrella
        if (starCatalog.length > 0) {
            const newStarCoords = starCatalog.pop();
            const newStar = { coords: newStarCoords, audioUrl: audioUrl };
            usedStars.push(newStar);
            
            // Notificar a TODOS los clientes
            io.emit('add-star', newStar);
        }
    });
    
    // --- Eventos del Admin ---
    socket.on('admin-update-settings', (newSettings) => {
        settings = newSettings;
        io.emit('update-settings', settings); // Notificar al proyector
        console.log("Configuración actualizada por admin:", settings);
    });
    
    socket.on('admin-reset-project', () => {
        resetState();
        io.emit('project-reset'); // Notificar a todos para que se refresquen
        console.log("Proyecto reiniciado por admin.");
    });

    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));