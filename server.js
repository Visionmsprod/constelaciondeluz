const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const cors = require('cors');
const multer = require('multer'); // Para manejar la subida de archivos
const fs = require('fs');

const app = express();
app.use(cors());

// --- SERVIR ARCHIVOS ESTÁTICOS ---
// Esto permite que el navegador acceda a los archivos de la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- CONFIGURACIÓN DE MULTER (para guardar los audios) ---
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- DATOS EN MEMORIA (El estado de nuestra constelación) ---
let starCatalog = [{x:28,y:75},{x:26,y:142},{x:59,y:19},{x:77,y:38},{x:21,y:46},{x:21,y:98},{x:32,y:5},{x:24,y:7},{x:82,y:8},{x:19,y:16},{x:56,y:111},{x:68,y:126},{x:32,y:28},{x:95,y:129},{x:86,y:45},{x:42,y:12}];
let usedStars = [];
let settings = { maxConcurrentAudios: 5, inactivityTimeout: 120000 };

function resetState() {
    starCatalog = [{x:28,y:75},{x:26,y:142},{x:59,y:19},{x:77,y:38},{x:21,y:46},{x:21,y:98},{x:32,y:5},{x:24,y:7},{x:82,y:8},{x:19,y:16},{x:56,y:111},{x:68,y:126},{x:32,y:28},{x:95,y:129},{x:86,y:45},{x:42,y:12}];
    usedStars = [];
    // Borrar archivos físicos
    fs.readdir(uploadsDir, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(uploadsDir, file), err => {
                if (err) throw err;
            });
        }
    });
}

// --- ENDPOINT PARA SUBIR AUDIOS ---
// El usuario no llama a esto directamente. Es para el prototipo.
// socket.emit('new-message', audioBlob) lo manejará
io.on('new-message', upload.single('audio-blob'), (socket, audioBlob) => {
    // Esta parte es conceptual. El blob se enviaría y se guardaría
    const audioUrl = `/uploads/${Date.now()}.wav`;
    fs.writeFile(path.join(__dirname, 'public', audioUrl), audioBlob, (err) => {
        if (err) { return console.log(err); }

        if (starCatalog.length > 0) {
            const newStarCoords = starCatalog.pop();
            const newStar = { coords: newStarCoords, audioUrl: audioUrl };
            usedStars.push(newStar);
            io.emit('add-star', newStar);
        }
    });
});


// --- LÓGICA DE SOCKETS ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    socket.on('get-initial-state', () => {
        socket.emit('initial-state', { stars: usedStars, audios: usedStars.map(s => ({url: s.audioUrl})) });
    });

    socket.on('new-message', (audioBlob) => {
        const audioUrl = `/uploads/${Date.now()}.wav`;
        fs.writeFile(path.join(__dirname, 'public', audioUrl), audioBlob, (err) => {
            if (err) { return console.log(err); }

            if (starCatalog.length > 0) {
                const newStarCoords = starCatalog.pop();
                const newStar = { coords: newStarCoords, audioUrl: audioUrl };
                usedStars.push(newStar);
                io.emit('add-star', newStar); // Notificar a todos los clientes
            }
        });
    });

    socket.on('admin-update-settings', (newSettings) => {
        settings = newSettings;
        io.emit('update-settings', settings);
    });

    socket.on('admin-reset-project', () => {
        resetState();
        io.emit('project-reset');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
