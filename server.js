const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Carpeta para guardar los audios
const uploadsDir = path.join(__dirname, 'uploads');

// Crear carpeta si no existe
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configuración de Multer para guardar los audios
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.wav';
        cb(null, Date.now() + ext);
    }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());

// 📌 Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(uploadsDir));

// 📌 Ruta para subir un audio
app.post('/upload', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se subió ningún archivo.');
    }
    
    // URL pública que el cliente podrá usar para reproducir
    const audioUrl = `/uploads/${req.file.filename}`;
    res.json({ audioUrl });
});

// 📌 Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor activo y listo para recibir audios.');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
