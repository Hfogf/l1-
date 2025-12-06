// Script pour ajouter des produits de démonstration
// Exécuter avec: node add-demo-products.js

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = path.join(__dirname, 'database.json');

const demoProducts = [
    {
        name: "Manette Sans Fil Pro",
        category: "manettes",
        price: 65.00,
        stock: 15,
        description: "Manette ergonomique sans fil avec batterie longue durée. Compatible PC, PS4, PS5.",
        image: "https://via.placeholder.com/300x200?text=Manette+Pro"
    },
    {
        name: "Moniteur Gaming 144Hz",
        category: "moniteurs",
        price: 250.00,
        stock: 8,
        description: "Écran 24 pouces, 144Hz, 1ms, design borderless. Parfait pour le gaming compétitif.",
        image: "https://via.placeholder.com/300x200?text=Moniteur+144Hz"
    },
    {
        name: "Casque Gaming RGB",
        category: "accessoires",
        price: 45.00,
        stock: 20,
        description: "Casque avec son surround 7.1, micro antibruit et éclairage RGB personnalisable.",
        image: "https://via.placeholder.com/300x200?text=Casque+RGB"
    },
    {
        name: "AirPods Pro",
        category: "airpods",
        price: 85.00,
        stock: 12,
        description: "Écouteurs sans fil avec réduction active du bruit (ANC) et excellente autonomie.",
        image: "https://via.placeholder.com/300x200?text=AirPods+Pro"
    },
    {
        name: "Câble USB-C Rapide",
        category: "cables",
        price: 12.00,
        stock: 50,
        description: "Câble de charge rapide 3A, résistant, longueur 2m. Compatible tous appareils USB-C.",
        image: "https://via.placeholder.com/300x200?text=Cable+USB-C"
    },
    {
        name: "Vape Kit Premium",
        category: "vape",
        price: 35.00,
        stock: 25,
        description: "Kit vape 5000 puffs, recharge rapide, multiple saveurs disponibles.",
        image: "https://via.placeholder.com/300x200?text=Vape+Kit"
    }
];

async function addDemoProducts() {
    try {
        // Lire la base de données actuelle
        const data = await fs.readFile(DB_FILE, 'utf8');
        const db = JSON.parse(data);

        // Ajouter les produits de démo
        demoProducts.forEach(product => {
            db.products.push({
                id: uuidv4(),
                ...product,
                createdAt: new Date().toISOString()
            });
        });

        // Ajouter un log
        db.logs.push({
            id: uuidv4(),
            timestamp: new Date().toISOString(),
            action: 'INITIALISATION',
            details: `${demoProducts.length} produits de démonstration ajoutés`,
            admin: 'Système'
        });

        // Sauvegarder
        await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));

        console.log('✅ Produits de démonstration ajoutés avec succès!');
        console.log(`📦 ${demoProducts.length} produits ajoutés`);
        demoProducts.forEach(p => {
            console.log(`   - ${p.name} (${p.category}) - ${p.price} HTG`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

addDemoProducts();
