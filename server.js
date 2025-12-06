// server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// --- CONFIG ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'change-me-please', // à changer en prod
  resave: false,
  saveUninitialized: false
}));

// Servir les fichiers du dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// --- "Base de données" en mémoire (à remplacer par MySQL, etc.) ---
let products = [
  { id: 1, name: 'Cupcake Chocolat', price: 2.5 },
  { id: 2, name: 'Tarte aux fruits', price: 3.0 }
];

// --- Middleware de protection admin ---
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin === true) {
    return next();
  }
  return res.status(401).json({ error: 'Accès non autorisé' });
}

// --- API publique : tout le monde peut lire les produits ---
app.get('/api/products', (req, res) => {
  res.json(products);
});

// --- Login admin avec un simple "code d’accès" ---
const ADMIN_CODE = 'ROYALS-SECRET-123'; // ton code d’accès

app.post('/admin/login', (req, res) => {
  const { code } = req.body;
  if (code === ADMIN_CODE) {
    req.session.isAdmin = true;
    return res.json({ success: true, message: 'Connecté en admin' });
  }
  return res.status(401).json({ success: false, message: 'Code invalide' });
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// --- API admin : création / suppression de produits ---
app.post('/admin/products', requireAdmin, (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Nom et prix obligatoires' });
  }
  const newProduct = {
    id: Date.now(),
    name,
    price: parseFloat(price)
  };
  products.push(newProduct);
  res.json(newProduct);
});

app.delete('/admin/products/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  products = products.filter(p => p.id !== id);
  res.json({ success: true });
});

// --- Lancer le serveur ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
