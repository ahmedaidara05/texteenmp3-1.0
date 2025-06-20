// server.js
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.static('public')); // Dossier contenant vos fichiers
app.listen(3000, () => console.log('Serveur sur http://localhost:3000'));
