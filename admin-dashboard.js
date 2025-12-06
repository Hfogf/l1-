// Vérifier l'authentification
if (sessionStorage.getItem('adminAuth') !== 'true') {
    window.location.href = 'admin-login.html';
}

// Configuration de l'API avec détection automatique
const API_URL = window.API_CONFIG ? window.API_CONFIG.API_URL : 'http://localhost:3000/api';
const API_BASES = window.API_CONFIG ? (window.API_CONFIG.API_URLS || [API_URL]) : [API_URL];
const API_TIMEOUT = window.API_CONFIG ? window.API_CONFIG.TIMEOUT : 10000;
const RETRY_ATTEMPTS = window.API_CONFIG ? window.API_CONFIG.RETRY_ATTEMPTS : 3;

// Fonction pour faire des requêtes avec retry
async function fetchWithRetry(url, options = {}, attempts = RETRY_ATTEMPTS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeout);
        return response;
    } catch (error) {
        clearTimeout(timeout);
        if (attempts > 1) {
            console.log(`⚠️ Tentative échouée, ${attempts - 1} tentatives restantes...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchWithRetry(url, options, attempts - 1);
        }
        throw error;
    }
}

// Essayer plusieurs bases API (utile pour accès réseau multi-appareils)
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

// État de l'application
let currentSection = 'dashboard';
let products = [];
let orders = [];
let logs = [];
let autoSyncInterval = null;

// Auto-sync toutes les 5 secondes
function startAutoSync() {
    console.log('▶️ Auto-sync ACTIVÉ');
    autoSyncInterval = setInterval(async () => {
        try {
            await loadAllData();
            console.log('🔄 Sync automatique effectuée');
        } catch (error) {
            console.error('❌ Erreur sync automatique:', error);
        }
    }, 5000); // 5 secondes
}

function stopAutoSync() {
    console.log('⏹️ Auto-sync DÉSACTIVÉ');
    if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Afficher le nom de l'admin
    document.getElementById('adminName').textContent = sessionStorage.getItem('adminUsername') || 'Admin';
    
    // Charger les données
    loadAllData();
    
    // Event listeners
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.addEventListener('click', function() {
            switchSection(this.dataset.section);
        });
    });
    
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Produits
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    document.getElementById('refreshProductsBtn').addEventListener('click', loadProducts);
    
    // Commandes
    document.getElementById('refreshOrdersBtn').addEventListener('click', loadOrders);
    
    // Logs
    document.getElementById('refreshLogsBtn').addEventListener('click', loadLogs);
    document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
    
    // Modal
    document.getElementById('closeModalBtn').addEventListener('click', closeProductModal);
    document.getElementById('cancelModalBtn').addEventListener('click', closeProductModal);
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // Auto-sync
    const autoSyncToggle = document.getElementById('autoSyncToggle');
    if (autoSyncToggle) {
        autoSyncToggle.addEventListener('change', function() {
            if (this.checked) {
                startAutoSync();
            } else {
                stopAutoSync();
            }
        });
    }
}

// Navigation entre sections
function switchSection(section) {
    currentSection = section;
    
    // Mettre à jour les boutons de menu
    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === section) {
            btn.classList.add('active');
        }
    });
    
    // Afficher la section appropriée
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    document.getElementById(`${section}-section`).classList.remove('hidden');
    
    // Charger les données de la section
    switch(section) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'products':
            displayProducts();
            break;
        case 'orders':
            displayOrders();
            break;
        case 'logs':
            displayLogs();
            break;
    }
}

// Déconnexion
function logout() {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminLoginTime');
    window.location.href = 'admin-login.html';
}

// ==================== CHARGEMENT DES DONNÉES ====================

async function loadAllData() {
    await Promise.all([
        loadProducts(),
        loadOrders(),
        loadLogs()
    ]);
    updateDashboard();
}

async function loadProducts() {
    try {
        console.log('📡 Chargement des produits...');
        const { response, base } = await fetchFromBases('/products');
        products = await response.json();
        console.log(`✅ ${products.length} produits chargés via ${base}`);
        displayProducts();
        updateDashboard();
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        showNotification('❌ Impossible de charger les produits. Vérifiez la connexion au serveur.', 'error');
    }
}

async function loadOrders() {
    try {
        console.log('📡 Chargement des commandes...');
        const { response, base } = await fetchFromBases('/orders');
        orders = await response.json();
        console.log(`✅ ${orders.length} commandes chargées via ${base}`, orders);
        displayOrders();
        updateDashboard();
    } catch (error) {
        console.error('❌ Erreur lors du chargement des commandes:', error.message);
        console.error('URL tentée:', `${API_URL}/orders`);
        orders = [];
        displayOrders();
        updateDashboard();
        showNotification('⚠️ Impossible de charger les commandes', 'warning');
    }
}

async function loadLogs() {
    try {
        console.log('📡 Chargement des logs...');
        const { response, base } = await fetchFromBases('/logs');
        logs = await response.json();
        console.log(`✅ ${logs.length} logs chargés via ${base}`, logs);
        displayLogs();
        updateDashboard();
    } catch (error) {
        console.error('❌ Erreur lors du chargement des logs:', error.message);
        console.error('URL tentée:', `${API_URL}/logs`);
        // Afficher quand même les logs vides
        logs = [];
        displayLogs();
        updateDashboard();
        showNotification('⚠️ Impossible de charger l\'historique (mode offline)', 'warning');
    }
}

// ==================== TABLEAU DE BORD ====================

function updateDashboard() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalLogs').textContent = logs.length;
    
    // Afficher les dernières commandes
    const recentOrdersDiv = document.getElementById('recentOrders');
    const recentOrders = orders.slice(-5).reverse();
    
    if (recentOrders.length === 0) {
        recentOrdersDiv.innerHTML = '<p style="opacity:.6;text-align:center;padding:20px;">Aucune commande pour le moment</p>';
        return;
    }
    
    recentOrdersDiv.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Téléphone</th>
                    <th>Produits</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${recentOrders.map(order => `
                    <tr>
                        <td>${new Date(order.date).toLocaleDateString('fr-FR')}</td>
                        <td>${order.customerName}</td>
                        <td>${order.phone}</td>
                        <td>${order.items.length} produit(s)</td>
                        <td>${order.total.toFixed(2)} $</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ==================== GESTION DES PRODUITS ====================

function displayProducts() {
    const container = document.getElementById('productsTableContainer');
    
    if (products.length === 0) {
        container.innerHTML = '<p style="opacity:.6;text-align:center;padding:20px;">Aucun produit. Cliquez sur "Nouveau produit" pour commencer.</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td>
                            ${product.image ? `<img src="${product.image}" class="product-img-thumb" alt="${product.name}">` : '🖼️'}
                        </td>
                        <td><strong>${product.name}</strong></td>
                        <td>${product.category}</td>
                        <td>${product.price.toFixed(2)} $</td>
                        <td>${product.stock || 0}</td>
                        <td>
                            <button class="btn btn-secondary" style="padding:6px 12px;font-size:12px;margin-right:5px;" onclick="editProduct('${product.id}')">
                                ✏️ Modifier
                            </button>
                            <button class="btn btn-danger" style="padding:6px 12px;font-size:12px;" onclick="deleteProduct('${product.id}')">
                                🗑️ Supprimer
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            title.textContent = 'Modifier le produit';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock || 0;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productImage').value = product.image || '';
        }
    } else {
        title.textContent = 'Nouveau produit';
        document.getElementById('productId').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value) || 0,
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value
    };
    
    try {
        let response;
        if (productId) {
            // Modifier un produit existant
            console.log('📝 Modification du produit:', productId);
            response = await fetchWithRetry(`${API_BASES[0]}/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            // Créer un nouveau produit
            console.log('➕ Création d\'un nouveau produit');
            response = await fetchWithRetry(`${API_BASES[0]}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }
        
        if (response.ok) {
            showNotification(productId ? '✅ Produit modifié avec succès' : '✅ Produit ajouté avec succès', 'success');
            closeProductModal();
            await loadProducts();
            await loadLogs();
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erreur ${response.status}`);
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('❌ ' + error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    try {
        console.log('🗑️ Suppression du produit:', productId);
        const response = await fetchWithRetry(`${API_BASES[0]}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('✅ Produit supprimé avec succès', 'success');
            await loadProducts();
            await loadLogs();
        } else {
            throw new Error(`Erreur ${response.status}`);
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('❌ Erreur lors de la suppression', 'error');
    }
}

// Rendre les fonctions accessibles globalement
window.editProduct = openProductModal;
window.deleteProduct = deleteProduct;

// ==================== GESTION DES COMMANDES ====================

function displayOrders() {
    const container = document.getElementById('ordersTableContainer');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p style="opacity:.6;text-align:center;padding:20px;">Aucune commande pour le moment</p>';
        return;
    }
    
    try {
        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Client</th>
                        <th>Téléphone</th>
                        <th>Produits</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => {
                        try {
                            const dateStr = order.date || order.timestamp || new Date().toISOString();
                            const dateObj = new Date(dateStr);
                            const formattedDate = dateObj.toLocaleString('fr-FR');
                            
                            return `
                                <tr>
                                    <td>${order.id.substring(0, 8)}...</td>
                                    <td>${formattedDate}</td>
                                    <td>${order.customerName || 'N/A'}</td>
                                    <td>${order.phone || 'N/A'}</td>
                                    <td>
                                        ${(order.items || []).map(item => `${item.name} (x${item.quantity})`).join('<br>')}
                                    </td>
                                    <td><strong>${(order.total || 0).toFixed(2)} $</strong></td>
                                    <td>
                                        <button class="btn btn-danger" style="padding:6px 12px;font-size:12px;" onclick="deleteOrder('${order.id}')">
                                            🗑️ Supprimer
                                        </button>
                                    </td>
                                </tr>
                            `;
                        } catch (e) {
                            console.error('Erreur affichage commande:', e, order);
                            return `<tr><td colspan="7" style="color:red;">Erreur affichage commande</td></tr>`;
                        }
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('❌ Erreur lors de l\'affichage des commandes:', error);
        container.innerHTML = '<p style="color:red;text-align:center;padding:20px;">❌ Erreur lors de l\'affichage des commandes. Consultez la console (F12).</p>';
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASES[0]}/orders/${orderId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Commande supprimée avec succès', 'success');
            await loadOrders();
            await loadLogs();
        } else {
            showNotification('Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion au serveur', 'error');
    }
}

window.deleteOrder = deleteOrder;

// ==================== GESTION DES LOGS ====================

function displayLogs() {
    const container = document.getElementById('logsTableContainer');
    
    if (logs.length === 0) {
        container.innerHTML = '<p style="opacity:.6;text-align:center;padding:20px;">Aucun historique</p>';
        return;
    }
    
    const sortedLogs = [...logs].reverse(); // Plus récent en premier
    
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Détails</th>
                    <th>Admin</th>
                </tr>
            </thead>
            <tbody>
                ${sortedLogs.map(log => `
                    <tr>
                        <td>${new Date(log.timestamp).toLocaleString('fr-FR')}</td>
                        <td><strong>${log.action}</strong></td>
                        <td>${log.details}</td>
                        <td>${log.admin}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function clearLogs() {
    if (!confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASES[0]}/logs`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification('Historique effacé', 'success');
            await loadLogs();
        } else {
            showNotification('Erreur lors de l\'effacement', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion au serveur', 'error');
    }
}

// ==================== NOTIFICATIONS ====================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,.5);
    `;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #f87171, #ef4444)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #60a5fa, #3b82f6)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .content-section.hidden {
        display: none;
    }
`;
document.head.appendChild(style);
