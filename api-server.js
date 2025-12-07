const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS ultra-permissive pour développement local
app.use(cors({
    origin: function (origin, callback) {
        // Accepter TOUTES les origines (y compris null pour file://)
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Headers CORS supplémentaires avant les routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.header('Access-Control-Max-Age', '86400'); // 24h cache pour preflight
    
    // Répondre immédiatement aux requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.')); // Servir les fichiers statiques

// Logging middleware
app.use((req, res, next) => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📨 ${req.method} ${req.path}`);
    console.log(`Origin: ${req.headers.origin || 'N/A'}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`Body: ${JSON.stringify(req.body).substring(0, 100)}`);
    }
    next();
});

// Fonction pour obtenir l'adresse IP locale
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Fichier de base de données JSON
const DB_FILE = path.join(__dirname, 'database.json');

// Initialiser la base de données
function initDatabase() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const initialData = {
                products: [],
                orders: [],
                logs: []
            };
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
            console.log('✅ Base de données créée');
        }
    } catch (error) {
        console.error('❌ Erreur init DB:', error.message);
    }
}

// Lire la base de données
function readDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('❌ Erreur lecture DB:', error.message);
    }
    return { products: [], orders: [], logs: [] };
}

// Écrire dans la base de données
function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        console.log('💾 Base de données sauvegardée');
        return true;
    } catch (error) {
        console.error('❌ Erreur écriture DB:', error.message);
        return false;
    }
}

// ==================== CONFIGURATION DE SÉCURITÉ ====================

// CODE ADMIN SÉCURISÉ (stocké côté serveur, PAS VISIBLE EN CLIENT)
const ADMIN_CODE = 'L1_TRIANGLE';

// Sessions actives (en mémoire - considérez une vraie base pour production)
const activeSessions = new Map();

// Middleware pour vérifier l'authentification
function verifyAuth(req, res, next) {
    const sessionId = req.headers['x-session-id'] || req.body?.sessionId;
    
    if (!sessionId || !activeSessions.has(sessionId)) {
        return res.status(401).json({ error: 'Non authentifié' });
    }
    
    req.sessionId = sessionId;
    next();
}

// ==================== ROUTE HEALTH CHECK ====================

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: '✅ Serveur API actif'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: '✅ API v1 active'
    });
});

// ==================== AUTHENTIFICATION ADMIN ====================

// Endpoint LOGIN - Vérifie le code et crée une session
app.post('/api/admin/login', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        console.log('❌ Tentative login sans code');
        return res.status(400).json({ error: 'Code requis' });
    }
    
    if (code !== ADMIN_CODE) {
        console.log('❌ Tentative login avec mauvais code');
        return res.status(401).json({ error: 'Code invalide' });
    }
    
    // Créer une session unique
    const sessionId = uuidv4();
    activeSessions.set(sessionId, {
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    });
    
    console.log('✅ Admin authentifié - Session créée');
    res.json({ 
        success: true, 
        sessionId,
        message: '✅ Authentification réussie'
    });
});

// Endpoint LOGOUT - Invalide la session
app.post('/api/admin/logout', verifyAuth, (req, res) => {
    activeSessions.delete(req.sessionId);
    console.log('✅ Session fermée');
    res.json({ success: true, message: 'Déconnecté' });
});

// Endpoint CHECK SESSION - Vérifie si la session est valide
app.get('/api/admin/check', (req, res) => {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId || !activeSessions.has(sessionId)) {
        return res.json({ authenticated: false });
    }
    
    const session = activeSessions.get(sessionId);
    
    // Vérifier expiration
    if (new Date() > session.expiresAt) {
        activeSessions.delete(sessionId);
        return res.json({ authenticated: false });
    }
    
    res.json({ authenticated: true });
});

// ==================== ROUTES PRODUITS ====================

// Obtenir tous les produits
app.get('/api/products', (req, res) => {
    try {
        const db = readDatabase();
        console.log(`✅ ${db.products.length} produits retournés`);
        res.json(db.products);
    } catch (error) {
        console.error('❌ Erreur GET /api/products:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir un produit par ID
app.get('/api/products/:id', (req, res) => {
    try {
        const db = readDatabase();
        const product = db.products.find(p => p.id === req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Produit non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Créer un nouveau produit (PROTÉGÉ - Admin seulement)
app.post('/api/products', verifyAuth, (req, res) => {
    try {
        const db = readDatabase();
        const newProduct = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        db.products.push(newProduct);
        
        if (!writeDatabase(db)) {
            throw new Error('Erreur sauvegarde DB');
        }
        
        console.log(`✅ Produit créé: ${newProduct.name}`);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('❌ Erreur POST /api/products:', error.message);
        res.status(500).json({ error: 'Erreur serveur: ' + error.message });
    }
});

// Modifier un produit (PROTÉGÉ - Admin seulement)
app.put('/api/products/:id', verifyAuth, (req, res) => {
    try {
        const db = readDatabase();
        const index = db.products.findIndex(p => p.id === req.params.id);
        
        if (index !== -1) {
            const updatedProduct = {
                ...db.products[index],
                ...req.body,
                updatedAt: new Date().toISOString()
            };
            db.products[index] = updatedProduct;
            
            if (!writeDatabase(db)) {
                throw new Error('Erreur sauvegarde DB');
            }
            
            console.log(`✅ Produit modifié: ${updatedProduct.name}`);
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Produit non trouvé' });
        }
    } catch (error) {
        console.error('❌ Erreur PUT /api/products:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer un produit (PROTÉGÉ - Admin seulement)
app.delete('/api/products/:id', verifyAuth, (req, res) => {
    try {
        const db = readDatabase();
        const product = db.products.find(p => p.id === req.params.id);
        
        if (product) {
            db.products = db.products.filter(p => p.id !== req.params.id);
            
            if (!writeDatabase(db)) {
                throw new Error('Erreur sauvegarde DB');
            }
            
            console.log(`✅ Produit supprimé: ${product.name}`);
            res.json({ message: 'Produit supprimé', deleted: product });
        } else {
            res.status(404).json({ error: 'Produit non trouvé' });
        }
    } catch (error) {
        console.error('❌ Erreur DELETE /api/products:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ==================== ROUTES COMMANDES ====================

// Obtenir toutes les commandes
app.get('/api/orders', (req, res) => {
    try {
        const db = readDatabase();
        console.log(`✅ ${db.orders.length} commandes retournées`);
        res.json(db.orders);
    } catch (error) {
        console.error('❌ Erreur GET /api/orders:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir une commande par ID
app.get('/api/orders/:id', (req, res) => {
    try {
        const db = readDatabase();
        const order = db.orders.find(o => o.id === req.params.id);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Commande non trouvée' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Créer une nouvelle commande
app.post('/api/orders', (req, res) => {
    try {
        const db = readDatabase();
        const newOrder = {
            id: uuidv4(),
            ...req.body,
            date: new Date().toISOString()
        };
        db.orders.push(newOrder);
        
        if (!writeDatabase(db)) {
            throw new Error('Erreur sauvegarde DB');
        }
        
        console.log(`✅ Commande créée: ${newOrder.id}`);
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('❌ Erreur POST /api/orders:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer une commande
app.delete('/api/orders/:id', (req, res) => {
    try {
        const db = readDatabase();
        const order = db.orders.find(o => o.id === req.params.id);
        
        if (order) {
            db.orders = db.orders.filter(o => o.id !== req.params.id);
            
            if (!writeDatabase(db)) {
                throw new Error('Erreur sauvegarde DB');
            }
            
            console.log(`✅ Commande supprimée: ${req.params.id}`);
            res.json({ message: 'Commande supprimée' });
        } else {
            res.status(404).json({ error: 'Commande non trouvée' });
        }
    } catch (error) {
        console.error('❌ Erreur DELETE /api/orders:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ==================== ROUTES LOGS ====================

// Obtenir tous les logs
app.get('/api/logs', (req, res) => {
    try {
        const db = readDatabase();
        res.json(db.logs);
    } catch (error) {
        console.error('❌ Erreur GET /api/logs:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Effacer tous les logs
app.delete('/api/logs', (req, res) => {
    try {
        const db = readDatabase();
        db.logs = [];
        
        if (!writeDatabase(db)) {
            throw new Error('Erreur sauvegarde DB');
        }
        
        res.json({ message: 'Historique effacé' });
    } catch (error) {
        console.error('❌ Erreur DELETE /api/logs:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ==================== ROUTE STATS ====================

// Obtenir les statistiques
app.get('/api/stats', (req, res) => {
    try {
        const db = readDatabase();
        const stats = {
            totalProducts: db.products.length,
            totalOrders: db.orders.length,
            totalRevenue: db.orders.reduce((sum, order) => sum + (order.total || 0), 0),
            totalLogs: db.logs.length
        };
        res.json(stats);
    } catch (error) {
        console.error('❌ Erreur GET /api/stats:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Gestion des erreurs (DOIT être avant app.listen)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erreur serveur' });
});

// ==================== DÉMARRAGE DU SERVEUR ====================

console.log('🔄 Initialisation de la base de données...');
try {
    initDatabase();
    console.log('✅ Base de données initialisée');
    const localIP = getLocalIPAddress();
    console.log(`📡 IP locale détectée: ${localIP}`);
    console.log(`🚀 Démarrage du serveur sur 0.0.0.0:${PORT}...`);
    
    // Serveur HTTP uniquement (accessible depuis tous les appareils)
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║     🚀 L1TRIANGLE API EN LIGNE           ║
║                                           ║
║     Port: ${PORT}                            ║
║                                           ║
║     📱 Accès depuis cet appareil:        ║
║     http://localhost:${PORT}                 ║
║                                           ║
║     📱 Accès depuis autres appareils:    ║
║     http://${localIP}:${PORT}              ║
║                                           ║
║     📊 Dashboard Admin:                  ║
║     http://${localIP}:${PORT}/admin-login.html ║
║                                           ║
║     🛍️  Boutique:                        ║
║     http://${localIP}:${PORT}/index.html      ║
║                                           ║
║     💡 Partagez l'URL ci-dessus avec    ║
║        les autres appareils sur le       ║
║        même réseau WiFi                  ║
║                                           ║
╚═══════════════════════════════════════════╝

✅ Serveur prêt - Accepte les connexions de tous les appareils
📱 URL à partager: http://${localIP}:${PORT}
        `);
    });
} catch (err) {
    console.error('❌ Erreur lors de l\'initialisation:', err.message);
    process.exit(1);
}

module.exports = app;
