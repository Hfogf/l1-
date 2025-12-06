const https = require('https');

// Ignorer les erreurs de certificat pour le test
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const options = {
    hostname: '172.29.192.1',
    port: 3443,
    path: '/api/products',
    method: 'GET'
};

console.log('🔍 Test de connexion HTTPS...');
console.log(`   URL: https://${options.hostname}:${options.port}${options.path}`);

const req = https.request(options, (res) => {
    console.log(`✅ Connexion réussie!`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`   Données reçues: ${data.substring(0, 100)}...`);
    });
});

req.on('error', (err) => {
    console.error('❌ Erreur de connexion:', err.message);
});

req.setTimeout(5000, () => {
    console.error('❌ Timeout après 5 secondes');
    req.destroy();
});

req.end();
