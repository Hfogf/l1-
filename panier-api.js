// Configuration API avec détection automatique
const API_URL = window.API_CONFIG ? window.API_CONFIG.API_URL : 'http://localhost:3000/api';
const API_BASES = window.API_CONFIG ? (window.API_CONFIG.API_URLS || [API_URL]) : [API_URL];
const API_TIMEOUT = window.API_CONFIG ? window.API_CONFIG.TIMEOUT : 10000;
const RETRY_ATTEMPTS = window.API_CONFIG ? window.API_CONFIG.RETRY_ATTEMPTS : 3;

// Fonction pour faire des requêtes avec retry
async function fetchWithRetry(url, options = {}, attempts = RETRY_ATTEMPTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
        console.log(`📤 Tentative ${RETRY_ATTEMPTS - attempts + 1}/${RETRY_ATTEMPTS}: GET ${url}`);
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeout);
        console.log(`📥 Réponse reçue: ${response.status} ${response.statusText}`);
        return response;
    } catch (error) {
        clearTimeout(timeout);
        console.error(`❌ Erreur réseau: ${error.message}`);
        if (attempts > 1) {
            console.log(`⚠️ Tentative échouée, ${attempts - 1} tentatives restantes... Attente 1s`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchWithRetry(url, options, attempts - 1);
        }
        throw error;
    }
}

// Essayer plusieurs bases API (utile pour accès réseau)
async function fetchFromBases(path, options = {}) {
    let lastError;
    for (const base of API_BASES) {
        try {
            const response = await fetchWithRetry(`${base}${path}`, options);
            if (!response.ok) {
                lastError = new Error(`HTTP ${response.status}`);
                continue;
            }
            console.log(`✅ Réussi via ${base}`);
            return { response, base };
        } catch (err) {
            lastError = err;
            console.warn(`⚠️ Échec sur ${base}: ${err.message}`);
        }
    }
    throw lastError || new Error('Aucune base API disponible');
}

// ===== CHARGEMENT DES PRODUITS DEPUIS L'API =====
let productsFromAPI = [];

async function loadProductsFromAPI() {
    try {
        console.log('🔧 Config API:', window.API_CONFIG);
        console.log('📡 Chargement des produits depuis:', API_URL);
        const { response, base } = await fetchFromBases('/products');
        productsFromAPI = await response.json();
        console.log(`✅ ${productsFromAPI.length} produits chargés via ${base}`);
        renderProductsFromAPI();
    } catch (error) {
        console.error('❌ Erreur COMPLÈTE:', error);
        console.error('❌ Message:', error.message);
        console.error('❌ Stack:', error.stack);
        console.log('ℹ️ Mode hors ligne - utilisation des produits statiques');
        // Afficher un message d'erreur à l'utilisateur
        if (document.querySelector('.product-wrapper')) {
            document.querySelector('.product-wrapper').insertAdjacentHTML('afterbegin', 
                `<div style="background:#ffcccc;border:1px solid red;padding:15px;margin:10px;border-radius:5px;color:#cc0000;">
                    ⚠️ <strong>Erreur de connexion au serveur</strong><br>
                    API: ${API_URL}<br>
                    ${error.message}<br>
                    Ouvrez F12 pour plus de détails
                </div>`
            );
        }
    }
}

function renderProductsFromAPI() {
    if (productsFromAPI.length === 0) return;
    
    // Grouper les produits par catégorie
    const categories = {
        manettes: [],
        accessoires: [],
        moniteurs: [],
        airpods: [],
        cables: [],
        vape: []
    };
    
    productsFromAPI.forEach(product => {
        if (categories[product.category]) {
            categories[product.category].push(product);
        }
    });
    
    // Rendre chaque catégorie
    Object.keys(categories).forEach(category => {
        const section = document.getElementById(category);
        if (section && categories[category].length > 0) {
            const grid = section.querySelector('.product-grid');
            if (grid) {
                grid.innerHTML = categories[category].map(product => `
                    <article class="product-card"
                             data-id="${product.id}"
                             data-name="${product.name}"
                             data-price="${product.price}"
                             data-image="${product.image || ''}">
                        <img src="${product.image || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(product.name)}" 
                             alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>${product.description || ''}</p>
                        <div class="price">${product.price.toFixed(2)} $</div>
                        ${product.stock !== undefined ? `<small style="opacity:.7;">Stock: ${product.stock}</small>` : ''}
                        <button class="product-btn add-to-cart">Ajouter au panier</button>
                    </article>
                `).join('');
                
                // Réattacher les événements
                attachCartEvents();
            }
        }
    });
}

// ===== LOGIQUE DU PANIER =====
const cart = [];

const cartCountEl  = document.getElementById('cart-count');
const cartOverlay  = document.getElementById('cart-overlay');
const cartItemsEl  = document.getElementById('cart-items');
const cartTotalEl  = document.getElementById('cart-total');
const openCartBtn  = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');
const emailBtn     = document.getElementById('cart-email');
const whatsappBtn  = document.getElementById('cart-whatsapp');

// Ouvrir / fermer le panneau panier
openCartBtn.addEventListener('click', () => {
    cartOverlay.classList.remove('hidden');
});

closeCartBtn.addEventListener('click', () => {
    cartOverlay.classList.add('hidden');
});

cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) {
        cartOverlay.classList.add('hidden');
    }
});

// Fonction pour attacher les événements d'ajout au panier
function attachCartEvents() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.removeEventListener('click', handleAddToCart); // Éviter les doublons
        btn.addEventListener('click', handleAddToCart);
    });
}

function handleAddToCart(e) {
    const btn = e.target;
    const card  = btn.closest('.product-card');
    const id    = card.dataset.id;
    const name  = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const image = card.dataset.image || card.querySelector('img')?.src || '';

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1, image });
    }

    renderCart();
    cartOverlay.classList.remove('hidden');  // ouvrir directement après ajout
}

// Initialiser les événements au chargement
attachCartEvents();

// Affiche le contenu du panier
function renderCart() {
    cartItemsEl.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p style="opacity:.6;text-align:center;padding:20px">Votre panier est vide</p>';
        cartTotalEl.textContent = '$ 0.00';
        cartCountEl.textContent = '0';
        return;
    }
    
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>$ ${item.price.toFixed(2)}</span>
            </div>
            <div class="cart-item-controls">
                <div class="qty-controls">
                    <button class="qty-btn" data-id="${item.id}" data-action="minus">-</button>
                    <span class="cart-item-qty">${item.qty}</span>
                    <button class="qty-btn" data-id="${item.id}" data-action="plus">+</button>
                </div>
                <button class="remove-item" data-id="${item.id}">Retirer</button>
            </div>
        `;
        cartItemsEl.appendChild(itemDiv);
    });
    
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartTotalEl.textContent = '$ ' + total.toFixed(2);
    
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = totalItems;
    
    attachCartControls();
}

// Attacher les contrôles du panier (quantité et suppression)
function attachCartControls() {
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const action = btn.dataset.action;
            const item = cart.find(i => i.id === id);
            
            if (!item) return;
            
            if (action === 'plus') {
                item.qty += 1;
            } else if (action === 'minus') {
                item.qty -= 1;
                if (item.qty <= 0) {
                    const index = cart.indexOf(item);
                    cart.splice(index, 1);
                }
            }
            renderCart();
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const index = cart.findIndex(i => i.id === id);
            if (index !== -1) {
                cart.splice(index, 1);
            }
            renderCart();
        });
    });
}

// ===== ENVOI DE LA COMMANDE =====

// Fonction pour envoyer la commande à l'API
async function sendOrderToAPI(orderData) {
    try {
        console.log('📤 Envoi de la commande à l\'API...');
        const response = await fetchWithRetry(`${API_BASES[0]}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            console.log('✅ Commande enregistrée dans la base de données');
            return true;
        } else {
            console.error('❌ Erreur lors de l\'enregistrement:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur de connexion lors de l\'enregistrement de la commande:', error.message);
        alert('⚠️ La commande sera envoyée mais n\'a pas pu être sauvegardée sur le serveur.');
        return false;
    }
}

// Envoyer par Email
emailBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }
    
    const customerName = prompt('Votre nom complet :');
    if (!customerName) return;
    
    const phone = prompt('Votre numéro de téléphone :');
    if (!phone) return;
    
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    // Enregistrer la commande dans l'API
    const orderData = {
        customerName,
        phone,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.qty
        })),
        total,
        method: 'email'
    };
    
    await sendOrderToAPI(orderData);
    
    // Créer le message email
    let message = `Nouvelle commande de ${customerName}%0D%0A`;
    message += `Téléphone: ${phone}%0D%0A%0D%0A`;
    message += `PRODUITS:%0D%0A`;
    
    cart.forEach(item => {
        message += `- ${item.name} x${item.qty} = $${(item.price * item.qty).toFixed(2)}%0D%0A`;
    });
    
    message += `%0D%0ATOTAL: $${total.toFixed(2)}`;
    
    const mailtoLink = `mailto:l1triangle.info@gmail.com?subject=Commande L1triangle_store&body=${message}`;
    window.location.href = mailtoLink;
    
    // Vider le panier
    cart.length = 0;
    renderCart();
    cartOverlay.classList.add('hidden');
});

// Envoyer par WhatsApp
whatsappBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }
    
    const customerName = prompt('Votre nom complet :');
    if (!customerName) return;
    
    const phone = prompt('Votre numéro de téléphone :');
    if (!phone) return;
    
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    // Enregistrer la commande dans l'API
    const orderData = {
        customerName,
        phone,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.qty
        })),
        total,
        method: 'whatsapp'
    };
    
    await sendOrderToAPI(orderData);
    
    // Créer le message WhatsApp
    let message = `*Nouvelle commande de ${customerName}*%0A`;
    message += `Téléphone: ${phone}%0A%0A`;
    message += `*PRODUITS:*%0A`;
    
    cart.forEach(item => {
        message += `• ${item.name} x${item.qty} = $${(item.price * item.qty).toFixed(2)}%0A`;
    });
    
    message += `%0A*TOTAL: $${total.toFixed(2)}*`;
    
    const whatsappLink = `https://wa.me/50939945794?text=${message}`;
    window.open(whatsappLink, '_blank');
    
    // Vider le panier
    cart.length = 0;
    renderCart();
    cartOverlay.classList.add('hidden');
});

// Charger les produits depuis l'API au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromAPI();
});
