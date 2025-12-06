const https = require('https');

// Ignorer les erreurs de certificat
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const options = {
    hostname: 'localhost',
    port: 3443,
    path: '/api/products',
    method: 'GET'
};

console.log('🔍 Test HTTPS sur localhost...');

const req = https.request(options, (res) => {
    console.log(`✅ Status: ${res.statusCode}`);
    res.on('data', () => {});
    res.on('end', () => console.log('✅ Connexion OK'));
});

req.on('error', (err) => {
    console.error('❌ Erreur:', err.message);
});

req.setTimeout(5000);
req.end();
