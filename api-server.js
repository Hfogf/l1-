const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
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
async function initDatabase() {
    try {
        await fs.access(DB_FILE);
    } catch {
        const initialData = {
            products: [],
            orders: [],
            logs: []
        };
        await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
        console.log('✅ Base de données initialisée');
    }
}

// Lire la base de données
async function readDatabase() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lecture DB:', error);
        return { products: [], orders: [], logs: [] };
    }
}

// Écrire dans la base de données
async function writeDatabase(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erreur écriture DB:', error);
        return false;
    }
}

// Logger une action admin
async function logAction(action, details, admin = 'Admin') {
    const db = await readDatabase();
    const logEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action,
        details,
        admin
    };
    db.logs.push(logEntry);
    await writeDatabase(db);
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

// ==================== ROUTES PRODUITS ====================

// Obtenir tous les produits
app.get('/api/products', async (req, res) => {
    try {
        const db = await readDatabase();
        console.log(`✅ ${db.products.length} produits retournés`);
        res.json(db.products);
    } catch (error) {
        console.error('❌ Erreur GET /api/products:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir un produit par ID
app.get('/api/products/:id', async (req, res) => {
    const db = await readDatabase();
    const product = db.products.find(p => p.id === req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Produit non trouvé' });
    }
});

// Créer un nouveau produit
app.post('/api/products', async (req, res) => {
    try {
        const db = await readDatabase();
        const newProduct = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        db.products.push(newProduct);
        await writeDatabase(db);
        await logAction('AJOUT_PRODUIT', `Produit ajouté: ${newProduct.name}`);
        console.log(`✅ Produit créé: ${newProduct.id}`);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('❌ Erreur POST /api/products:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Modifier un produit
app.put('/api/products/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        const index = db.products.findIndex(p => p.id === req.params.id);
        
        if (index !== -1) {
            const updatedProduct = {
                ...db.products[index],
                ...req.body,
                updatedAt: new Date().toISOString()
            };
            db.products[index] = updatedProduct;
            await writeDatabase(db);
            await logAction('MODIFICATION_PRODUIT', `Produit modifié: ${updatedProduct.name}`);
            console.log(`✅ Produit modifié: ${req.params.id}`);
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Produit non trouvé' });
        }
    } catch (error) {
        console.error('❌ Erreur PUT /api/products:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        const product = db.products.find(p => p.id === req.params.id);
        
        if (product) {
            db.products = db.products.filter(p => p.id !== req.params.id);
            await writeDatabase(db);
            await logAction('SUPPRESSION_PRODUIT', `Produit supprimé: ${product.name}`);
            console.log(`✅ Produit supprimé: ${req.params.id}`);
            res.json({ message: 'Produit supprimé' });
        } else {
            res.status(404).json({ error: 'Produit non trouvé' });
        }
    } catch (error) {
        console.error('❌ Erreur DELETE /api/products:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ==================== ROUTES COMMANDES ====================

// Obtenir toutes les commandes
app.get('/api/orders', async (req, res) => {
    try {
        const db = await readDatabase();
        console.log(`✅ ${db.orders.length} commandes retournées`);
        res.json(db.orders);
    } catch (error) {
        console.error('❌ Erreur GET /api/orders:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Obtenir une commande par ID
app.get('/api/orders/:id', async (req, res) => {
    const db = await readDatabase();
    const order = db.orders.find(o => o.id === req.params.id);
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: 'Commande non trouvée' });
    }
});

// Créer une nouvelle commande
app.post('/api/orders', async (req, res) => {
    try {
        const db = await readDatabase();
        const newOrder = {
            id: uuidv4(),
            ...req.body,
            date: new Date().toISOString()
        };
        db.orders.push(newOrder);
        await writeDatabase(db);
        await logAction('NOUVELLE_COMMANDE', `Commande de ${newOrder.customerName} - ${newOrder.total}`, 'Système');
        console.log(`✅ Commande créée: ${newOrder.id}`);
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('❌ Erreur POST /api/orders:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer une commande
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        const order = db.orders.find(o => o.id === req.params.id);
        
        if (order) {
            db.orders = db.orders.filter(o => o.id !== req.params.id);
            await writeDatabase(db);
            await logAction('SUPPRESSION_COMMANDE', `Commande supprimée: ${order.id}`);
            console.log(`✅ Commande supprimée: ${req.params.id}`);
            res.json({ message: 'Commande supprimée' });
        } else {
            res.status(404).json({ error: 'Commande non trouvée' });
        }
    } catch (error) {
        console.error('❌ Erreur DELETE /api/orders:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ==================== ROUTES LOGS ====================

// Obtenir tous les logs
app.get('/api/logs', async (req, res) => {
    const db = await readDatabase();
    res.json(db.logs);
});

// Effacer tous les logs
app.delete('/api/logs', async (req, res) => {
    const db = await readDatabase();
    db.logs = [];
    await writeDatabase(db);
    res.json({ message: 'Historique effacé' });
});

// ==================== ROUTE STATS ====================

// Obtenir les statistiques
app.get('/api/stats', async (req, res) => {
    const db = await readDatabase();
    const stats = {
        totalProducts: db.products.length,
        totalOrders: db.orders.length,
        totalRevenue: db.orders.reduce((sum, order) => sum + (order.total || 0), 0),
        totalLogs: db.logs.length
    };
    res.json(stats);
});

// Gestion des erreurs (DOIT être avant app.listen)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erreur serveur' });
});

// ==================== DÉMARRAGE DU SERVEUR ====================

console.log('🔄 Initialisation de la base de données...');
initDatabase().then(() => {
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
}).catch((err) => {
    console.error('❌ Erreur lors de l\'initialisation:', err);
    process.exit(1);
});

module.exports = app;
