const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(cors());
const server = http.createServer(app);

// Configurar Socket.IO para permitir conexiones desde cualquier origen
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Servir los archivos estáticos de la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Multer para guardar los audios en una carpeta temporal
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '.wav')
});
const upload = multer({ storage: storage });

// --- DATOS EN MEMORIA (El estado de nuestra constelación) ---
let starCatalog = [{x:28,y:75},{x:26,y:142},{x:59,y:19},{x:77,y:38},{x:21,y:46},{x:21,y:98},{x:32,y:5},{x:24,y:7},{x:82,y:8},{x:19,y:16},{x:56,y:111},{x:68,y:126},{x:32,y:28},{x:95,y:129},{x:86,y:45},{x:42,y:12}];
let usedStars = [];
let settings = { maxConcurrentAudios: 5, inactivityTimeout: 120000 };

// --- ENDPOINT PARA SUBIR AUDIOS (La forma correcta) ---
app.post('/upload', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se recibió archivo de audio.' });
    }

    // En un proyecto real, aquí subirías el archivo a Cloudinary y borrarías el local.
    // Para este prototipo, simplemente usaremos la ruta local.
    const audioUrl = `/${req.file.filename}`;
    
    // Aquí es donde notificamos a todos
    if (starCatalog.length > 0) {
        const newStarCoords = starCatalog.pop();
        const newStar = { coords: newStarCoords, audioUrl: audioUrl };
        usedStars.push(newStar);
        
        io.emit('add-star', newStar); // ¡Notificar a todos los clientes (proyector y usuarios)!
    }

    res.status(200).json({ message: 'Audio recibido', audioUrl: audioUrl });
});

// --- LÓGICA DE SOCKETS (Ahora más simple) ---
io.on('connection', (socket) => {
    socket.on('get-initial-state', () => {
        socket.emit('initial-state', { stars: usedStars, audios: usedStars.map(s => s.audioUrl) });
        socket.emit('update-settings', settings);
    });

    socket.on('admin-update-settings', (newSettings) => {
        settings = newSettings;
        io.emit('update-settings', settings);
    });

    socket.on('admin-reset-project', () => {
        // ... (La lógica de resetear que ya tenías)
        io.emit('project-reset');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
