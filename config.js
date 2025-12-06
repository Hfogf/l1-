// Configuration automatique de l'URL de l'API
(function() {
    // Déterminer l'URL de l'API en fonction de l'environnement
    const hostname = window.location.hostname;
    
    // TOUJOURS utiliser HTTP (pas HTTPS) pour éviter les problèmes de certificat
    let apiUrl;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        apiUrl = `http://localhost:3000/api`;
    } else {
        // Pour tous les autres cas (Netlify, IP, etc.), utiliser l'IP locale
        apiUrl = 'http://172.29.192.1:3000/api';
    }
    
    // Liste de toutes les adresses IP possibles du serveur
    const apiUrls = [
        'http://172.29.192.1:3000/api',  // IP principale
        'http://10.115.107.126:3000/api', // IP secondaire
        'http://localhost:3000/api',      // Localhost
        apiUrl
    ];
    
    const uniqueApiUrls = apiUrls.filter((v, idx, arr) => v && arr.indexOf(v) === idx);

    // Exposer la configuration globalement
    window.API_CONFIG = {
        API_URL: apiUrl,
        API_URLS: uniqueApiUrls,
        TIMEOUT: 10000, // 10 secondes
        RETRY_ATTEMPTS: 3
    };
    
    console.log('🔧 API configurée (primaire):', apiUrl);
    console.log('🌐 Fallbacks possibles:', apiUrls);
})();
