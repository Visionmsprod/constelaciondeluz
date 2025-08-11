const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const cors = require('cors'); // Importamos el paquete 'cors'

const app = express();
app.use(cors()); // Usamos cors para permitir conexiones desde otros dominios (como Netlify)

const server = http.createServer(app);

// Configuramos Socket.IO para permitir conexiones desde cualquier origen
const io = new Server(server, {
  cors: {
    origin: "*", // Permite que cualquier sitio (como tu Netlify) se conecte
    methods: ["GET", "POST"]
  }
});

// ... (El resto del código de server.js que ya teníamos es idéntico) ...
let starCatalog = [{x:28,y:75},{x:26,y:142},{x:59,y:19},{x:77,y:38},{x:21,y:46},{x:21,y:98},{x:32,y:5},{x:24,y:7},{x:82,y:8},{x:19,y:16}];
let usedStars = [];
let audioUrls = [];
let settings = { maxConcurrentAudios: 5, inactivityTimeout: 120000 };

function resetState() { /* ... */ }

app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', (socket) => { /* ... (Toda la lógica de sockets es idéntica) ... */ });
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
