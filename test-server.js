const express = require('express');
const app = express();
const PORT = 3000;

app.get('/test', (req, res) => {
    res.json({ status: 'OK', message: 'Serveur de test fonctionne !' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur de test sur http://localhost:${PORT}`);
    console.log(`📡 Accessible depuis: http://172.29.192.1:${PORT}`);
});
