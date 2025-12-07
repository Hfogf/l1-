// ==================== CONFIGURATION API ROBUSTE ====================

class APIClient {
    constructor() {
        // Toujours essayer localhost en premier
        this.baseUrls = [
            'http://localhost:3000/api',
            'http://172.29.192.1:3000/api',
            'http://10.115.107.126:3000/api'
        ];
        
        // Filtrer pour local dev seulement
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.log('🌐 Mode distant - essayer localhost en priorité');
        }
        
        this.timeout = 15000;
        this.retries = 5;
        this.currentIndex = 0;
    }

    async request(endpoint, options = {}) {
        const method = options.method || 'GET';
        const body = options.body ? JSON.stringify(options.body) : null;
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📡 [${method}] ${endpoint}`);
        console.log(`${'='.repeat(60)}`);

        let lastError = null;

        // Essayer chaque URL en rotation
        for (let urlAttempt = 0; urlAttempt < this.baseUrls.length; urlAttempt++) {
            const baseUrl = this.baseUrls[urlAttempt];

            // Essayer X fois pour chaque URL
            for (let attempt = 1; attempt <= this.retries; attempt++) {
                const fullUrl = `${baseUrl}${endpoint}`;
                
                try {
                    console.log(`\n⏳ Tentative ${attempt}/${this.retries} sur ${baseUrl}`);
                    
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                    
                    const response = await fetch(fullUrl, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body,
                        mode: 'cors',
                        credentials: 'omit',
                        cache: 'no-store',
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    // Parser la réponse
                    let data = null;
                    const contentType = response.headers.get('content-type');
                    
                    if (contentType && contentType.includes('application/json')) {
                        data = await response.json();
                    } else {
                        data = await response.text();
                    }

                    console.log(`✅ SUCCÈS [${method}] ${endpoint}`);
                    console.log(`📦 Données reçues:`, data);
                    console.log(`${'='.repeat(60)}\n`);
                    
                    return data;

                } catch (error) {
                    lastError = error;
                    console.error(`❌ Tentative ${attempt} échouée: ${error.message}`);
                    
                    if (attempt < this.retries) {
                        const delay = 500 * attempt;
                        console.log(`⏰ Attente ${delay}ms avant nouvelle tentative...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
            }
        }

        // Tous les essais ont échoué
        console.error(`${'='.repeat(60)}`);
        console.error(`🔴 ERREUR TOTALE: Impossible de se connecter après ${this.baseUrls.length * this.retries} tentatives`);
        console.error(`Dernière erreur: ${lastError?.message}`);
        console.error(`${'='.repeat(60)}\n`);
        
        throw new Error(`Connexion API échouée: ${lastError?.message}`);
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    }

    async put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Instance globale
window.apiClient = new APIClient();

// ==================== PRODUITS ====================

async function loadProducts() {
    try {
        console.log('🚀 Démarrage du chargement des produits');
        const products = await window.apiClient.get('/products');
        
        if (!Array.isArray(products)) {
            throw new Error('Format invalide: expected array');
        }

        console.log(`📊 ${products.length} produits reçus`);
        renderProducts(products);
        return products;

    } catch (error) {
        console.error('💥 ERREUR CRITIQUE:', error);
        showError(`Impossible de charger les produits: ${error.message}`);
        return [];
    }
}

function renderProducts(products) {
    if (!products || products.length === 0) {
        console.warn('⚠️ Aucun produit à afficher');
        return;
    }

    // Grouper par catégorie
    const grouped = {};
    products.forEach(p => {
        const cat = p.category || 'autres';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
    });

    console.log('📑 Catégories:', Object.keys(grouped));

    // Rendre chaque catégorie
    Object.entries(grouped).forEach(([category, items]) => {
        const section = document.getElementById(category);
        if (!section) return;

        const grid = section.querySelector('.product-grid');
        if (!grid) return;

        grid.innerHTML = items.map(p => `
            <article class="product-card"
                     data-id="${p.id}"
                     data-name="${encodeURIComponent(p.name)}"
                     data-price="${p.price}"
                     data-image="${encodeURIComponent(p.image || '')}">
                <img src="${p.image || 'https://via.placeholder.com/300x200?text=Produit'}" 
                     alt="${p.name}"
                     onerror="this.src='https://via.placeholder.com/300x200?text=Image'">
                <h3>${p.name}</h3>
                <p>${p.description || ''}</p>
                <div class="price">${parseFloat(p.price).toFixed(2)} $</div>
                <small style="opacity:.7;">Stock: ${p.stock || 'N/A'}</small>
                <button class="product-btn add-to-cart">Ajouter au panier</button>
            </article>
        `).join('');

        attachCartButtons();
    });

    console.log('✅ Interface produits mise à jour');
}

// ==================== PANIER ====================

const cart = [];
let cartCountEl = document.getElementById('cart-count');
let cartOverlay = document.getElementById('cart-overlay');
let cartItemsEl = document.getElementById('cart-items');
let cartTotalEl = document.getElementById('cart-total');

function attachCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.onclick = null; // Nettoyer les anciens événements
        btn.addEventListener('click', addToCart);
    });
}

function addToCart(e) {
    const card = e.target.closest('.product-card');
    const id = card.dataset.id;
    const name = decodeURIComponent(card.dataset.name);
    const price = parseFloat(card.dataset.price);
    const image = decodeURIComponent(card.dataset.image) || card.querySelector('img')?.src;

    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id, name, price, image, qty: 1 });
    }

    renderCart();
    cartOverlay.classList.remove('hidden');
    console.log(`✅ Produit ajouté: ${name} (total: ${cart.length})`);
}

function renderCart() {
    if (!cartItemsEl || !cartTotalEl || !cartCountEl) return;

    cartItemsEl.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>$ ${item.price.toFixed(2)}</span>
            </div>
            <div class="qty-controls">
                <button class="qty-btn minus" data-id="${item.id}">-</button>
                <span class="qty">${item.qty}</span>
                <button class="qty-btn plus" data-id="${item.id}">+</button>
            </div>
            <button class="remove-item" data-id="${item.id}">✕</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartTotalEl.textContent = '$ ' + total.toFixed(2);
    
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = count;

    attachCartControls();
}

function attachCartControls() {
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
        btn.onclick = null;
        btn.addEventListener('click', () => {
            const item = cart.find(i => i.id === btn.dataset.id);
            if (item) item.qty++;
            renderCart();
        });
    });

    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
        btn.onclick = null;
        btn.addEventListener('click', () => {
            const item = cart.find(i => i.id === btn.dataset.id);
            if (item) {
                item.qty--;
                if (item.qty <= 0) {
                    cart.splice(cart.indexOf(item), 1);
                }
            }
            renderCart();
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.onclick = null;
        btn.addEventListener('click', () => {
            const idx = cart.findIndex(i => i.id === btn.dataset.id);
            if (idx !== -1) cart.splice(idx, 1);
            renderCart();
        });
    });
}

// ==================== COMMANDES ====================

async function submitOrder(method) {
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }

    const name = prompt('Votre nom:');
    if (!name) return;

    const order = {
        id: Date.now().toString(),
        customerName: name,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
        date: new Date().toISOString(),
        method: method
    };

    console.log('📝 Nouvelle commande:', order);

    try {
        await window.apiClient.post('/orders', order);
        console.log('✅ Commande sauvegardée');
        alert(`✅ Commande enregistrée!\nTotal: $ ${order.total.toFixed(2)}`);
        cart.length = 0;
        renderCart();
    } catch (error) {
        console.error('⚠️ Commande non sauvegardée (hors ligne):', error);
        alert(`⚠️ Commande créée mais non sauvegardée\nTotal: $ ${order.total.toFixed(2)}`);
    }
}

// ==================== UI ====================

function showError(message) {
    const errorDiv = document.querySelector('.error-message') || (() => {
        const div = document.createElement('div');
        div.className = 'error-message';
        div.style.cssText = `
            background: #fee;
            border: 2px solid #f00;
            color: #f00;
            padding: 15px;
            margin: 10px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
        `;
        document.body.insertBefore(div, document.body.firstChild);
        return div;
    })();
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Page chargée, initialisation');
    loadProducts();
    
    // Gérer l'ouverture/fermeture du panier
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            if (cartOverlay) {
                cartOverlay.classList.remove('hidden');
                console.log('🛒 Panier ouvert');
            }
        });
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            if (cartOverlay) {
                cartOverlay.classList.add('hidden');
                console.log('✕ Panier fermé');
            }
        });
    }
    
    // Fermer le panier en cliquant sur l'overlay
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                cartOverlay.classList.add('hidden');
                console.log('✕ Panier fermé (click overlay)');
            }
        });
    }
});
