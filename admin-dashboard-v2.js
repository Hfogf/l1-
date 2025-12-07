// Admin Dashboard v4 - SÉCURISÉ AVEC SESSION

console.log('✅ admin-dashboard-v2.js chargé');

// Configuration API
const API_URLs = [
    'http://localhost:3000/api',
    'http://172.29.192.1:3000/api'
];

// ==================== API CLIENT AVEC SESSION ====================

async function apiCall(endpoint, method = 'GET', body = null) {
    const sessionId = sessionStorage.getItem('admin_sessionId');

    if (!sessionId) {
        console.error('❌ Pas de session ID trouvée');
        window.location.href = '/admin-login-v2.html';
        throw new Error('Non authentifié - redirection vers login');
    }

    console.log('🔗 Tentative API:', endpoint, 'avec sessionId');

    for (let url of API_URLs) {
        try {
            const fullUrl = `${url}${endpoint}`;
            console.log('📡 Essai:', fullUrl);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(fullUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-Id': sessionId  // ← Passer la session au serveur
                },
                body: body ? JSON.stringify(body) : null,
                mode: 'cors',
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (response.status === 401) {
                console.error('❌ Session expirée');
                sessionStorage.removeItem('admin_sessionId');
                window.location.href = '/admin-login-v2.html';
                throw new Error('Session expirée');
            }

            if (response.ok) {
                console.log('✅ Réponse OK de:', fullUrl);
                return await response.json();
            }

            console.log('⚠️ Statut non-OK:', response.status);
        } catch (e) {
            console.error(`❌ Erreur avec ${url}:`, e.message);
        }
    }

    throw new Error(`API échouée pour ${endpoint}`);
}

// ==================== AUTHENTIFICATION ====================

function logout() {
    try {
        sessionStorage.removeItem('admin_sessionId');
        window.location.href = '/admin-login-v2.html';
    } catch (e) {
        console.error('Erreur logout:', e);
        location.reload();
    }
}

function checkAuthentication() {
    const sessionId = sessionStorage.getItem('admin_sessionId');
    if (!sessionId) {
        console.log('🔒 Pas authentifié');
        window.location.href = '/admin-login-v2.html';
        return false;
    }
    return true;
}

function logout() {
    try {
        sessionStorage.removeItem('admin_sessionId');
        window.location.href = '/admin-login-v2.html';
    } catch (e) {
        console.error('Erreur logout:', e);
        location.reload();
    }
}

// ==================== DASHBOARD DISPLAY ====================

function showDashboard() {
    try {
        console.log('📊 Affichage du dashboard...');
        
        document.body.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #ff6b3d; color: white; padding: 10px 15px; border-radius: 6px; font-size: 12px; z-index: 1000;">
                ✅ Dashboard sécurisé
            </div>
            
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto; background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%); color: #e8e8e8; display: flex; min-height: 100vh; }
                .admin-container { display: flex; width: 100%; height: 100vh; }
                .sidebar { width: 260px; background: linear-gradient(180deg, rgba(20, 25, 40, 0.98) 0%, rgba(15, 20, 35, 0.98) 100%); border-right: 1px solid rgba(255, 107, 61, 0.15); padding: 25px 18px; display: flex; flex-direction: column; gap: 25px; }
                .sidebar h2 { font-size: 22px; color: #ff6b3d; margin-bottom: 8px; letter-spacing: 1.5px; }
                .sidebar-menu { display: flex; flex-direction: column; gap: 8px; flex: 1; }
                .menu-item { padding: 11px 14px; background: rgba(255, 107, 61, 0.08); border: 1.5px solid rgba(255, 107, 61, 0.15); color: rgba(255, 177, 151, 0.85); border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.25s; }
                .menu-item:hover { background: rgba(255, 107, 61, 0.12); border-color: rgba(255, 107, 61, 0.35); color: #ffb197; }
                .menu-item.active { background: linear-gradient(135deg, rgba(255, 107, 61, 0.25), rgba(255, 107, 61, 0.12)); border-color: #ff6b3d; color: #ff9966; box-shadow: inset 0 0 12px rgba(255, 107, 61, 0.15); }
                .logout-btn { padding: 10px 14px; background: linear-gradient(135deg, rgba(255, 107, 61, 0.15), rgba(255, 107, 61, 0.08)); border: 1.5px solid rgba(255, 107, 61, 0.3); color: #ff9966; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.3s; }
                .logout-btn:hover { background: linear-gradient(135deg, #ff6b3d, rgba(255, 107, 61, 0.7)); border-color: #ff6b3d; color: #fff; }
                .main-content { flex: 1; overflow-y: auto; padding: 35px 40px; background: linear-gradient(135deg, rgba(5, 6, 8, 0.5) 0%, rgba(15, 25, 40, 0.5) 100%); }
                .content-header h1 { font-size: 28px; color: #ff6b3d; margin-bottom: 8px; font-weight: 600; }
                .content-header p { color: rgba(255, 177, 151, 0.65); font-size: 13px; }
                .section { display: none; animation: fadeIn 0.3s ease-out; }
                .section.active { display: block; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .section-card { background: linear-gradient(135deg, rgba(30, 40, 60, 0.6), rgba(20, 30, 50, 0.4)); border: 1px solid rgba(255, 107, 61, 0.12); border-radius: 12px; padding: 28px; margin-bottom: 24px; }
                h2 { font-size: 18px; color: #ff9966; margin-bottom: 18px; font-weight: 600; border-bottom: 1px solid rgba(255, 107, 61, 0.1); padding-bottom: 12px; }
                h3 { font-size: 15px; color: #ffb197; margin: 18px 0 14px 0; font-weight: 600; }
                h4 { color: #ff9966; margin-bottom: 6px; font-size: 14px; font-weight: 600; }
                .form-group { margin-bottom: 16px; }
                label { display: block; margin-bottom: 6px; font-weight: 600; color: #ffb197; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                input, textarea, select { width: 100%; padding: 10px 12px; border: 1px solid rgba(255, 107, 61, 0.2); background: rgba(255, 255, 255, 0.04); color: #e8e8e8; border-radius: 6px; font-size: 13px; font-family: inherit; }
                input:focus, textarea:focus, select:focus { outline: none; border-color: rgba(255, 107, 61, 0.6); background: rgba(255, 107, 61, 0.08); }
                textarea { resize: vertical; min-height: 90px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                button { padding: 10px 20px; background: linear-gradient(135deg, #ff6b3d, rgba(255, 107, 61, 0.8)); border: none; color: #fff; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s; font-size: 13px; }
                button:hover { transform: translateY(-2px); }
                .btn-danger { background: linear-gradient(135deg, rgba(255, 50, 50, 0.7), rgba(255, 100, 100, 0.5)); }
                table { width: 100%; border-collapse: collapse; }
                table th { background: rgba(255, 107, 61, 0.1); padding: 12px 14px; color: #ff9966; font-weight: 600; border-bottom: 1.5px solid rgba(255, 107, 61, 0.15); font-size: 12px; }
                table td { padding: 11px 14px; border-bottom: 1px solid rgba(255, 107, 61, 0.08); color: rgba(232, 232, 232, 0.9); font-size: 13px; }
                table tr:hover { background: rgba(255, 107, 61, 0.06); }
                .product-item { background: linear-gradient(135deg, rgba(255, 107, 61, 0.1), rgba(255, 107, 61, 0.05)); padding: 14px; margin-bottom: 12px; border-radius: 8px; border-left: 3px solid #ff6b3d; border: 1px solid rgba(255, 107, 61, 0.15); }
                .loading { color: #ff6b3d; font-weight: 600; font-size: 13px; }
            </style>
            
            <div class="admin-container">
                <aside class="sidebar">
                    <div>
                        <h2>▲ L1 TRIANGLE</h2>
                        <p style="font-size: 12px; color: rgba(255, 177, 151, 0.7);">Admin Dashboard</p>
                    </div>
                    
                    <nav class="sidebar-menu">
                        <button class="menu-item active" data-tab="products">🛍️ PRODUITS</button>
                        <button class="menu-item" data-tab="orders">📦 COMMANDES</button>
                        <button class="menu-item" data-tab="logs">📋 LOGS</button>
                    </nav>
                    
                    <button class="logout-btn" onclick="logout()">🚪 DÉCONNEXION</button>
                </aside>
                
                <main class="main-content">
                    <div class="content-header" style="margin-bottom: 32px;">
                        <h1>📊 DASHBOARD ADMIN</h1>
                        <p>Bienvenue dans votre espace d'administration L1TRIANGLE</p>
                    </div>
                    
                    <div id="products" class="section active"></div>
                    <div id="orders" class="section"></div>
                    <div id="logs" class="section"></div>
                </main>
            </div>
        `;
        
        // Attache les événements
        document.querySelectorAll('.menu-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                switchTab(tab);
            });
        });
        
        console.log('✅ Interface rendue');
        loadProductsAdmin();
        loadOrdersAdmin();
        loadLogsAdmin();
        
    } catch (e) {
        console.error('❌ Erreur showDashboard:', e);
        document.body.innerHTML = `<div style="padding: 40px; color: red; font-family: monospace;">❌ ERREUR CRITIQUE: ${e.message}<pre>${e.stack}</pre></div>`;
    }
}

function switchTab(tab) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
}

// ==================== API CLIENT ====================

async function apiCall(endpoint, method = 'GET', body = null) {
    // Déterminer les URLs à essayer
    let urls = [];
    
    // Toujours essayer localhost en premier (local development)
    urls.push('http://localhost:3000/api');
    
    // Si on n'est pas en local, essayer aussi les IPs
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        urls.push('http://172.29.192.1:3000/api');
        urls.push('http://10.115.107.126:3000/api');
    }
    
    console.log('🔗 Tentative API pour:', endpoint, 'URLs:', urls);
    
    for (let url of urls) {
        try {
            const fullUrl = `${url}${endpoint}`;
            console.log('📡 Essai:', fullUrl);
            
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(fullUrl, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : null,
                mode: 'cors',
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            
            if (response.ok) {
                console.log('✅ Réponse OK de:', fullUrl);
                return await response.json();
            }
            console.log('⚠️ Statut non-OK:', response.status);
        } catch (e) {
            console.error(`❌ Erreur avec ${url}:`, e.message);
        }
    }
    throw new Error(`API échouée pour ${endpoint} - Vérifiez que le serveur est lancé sur http://localhost:3000`);
}

// ==================== PRODUITS ====================

async function loadProductsAdmin() {
    const el = document.getElementById('products');
    el.innerHTML = '<div class="section-card"><p class="loading">⏳ Chargement...</p></div>';
    
    try {
        const products = await apiCall('/products');
        el.innerHTML = `
            <div class="section-card">
                <h2>🛍️ GESTION DES PRODUITS</h2>
                <h3>➕ AJOUTER</h3>
                <form onsubmit="handleAddProduct(event)">
                    <div class="form-row">
                        <div class="form-group"><label>Nom *</label><input type="text" name="name" required></div>
                        <div class="form-group"><label>Catégorie *</label><select name="category" required><option>manettes</option><option>accessoires</option><option>moniteurs</option></select></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Prix ($) *</label><input type="number" name="price" step="0.01" required></div>
                        <div class="form-group"><label>Stock *</label><input type="number" name="stock" required></div>
                    </div>
                    <div class="form-group"><label>Description</label><textarea name="description"></textarea></div>
                    <button type="submit" style="width: 100%;">AJOUTER</button>
                </form>
            </div>
            
            <div class="section-card">
                <h3>📋 PRODUITS (${products.length})</h3>
                ${(products || []).map(p => `
                    <div class="product-item">
                        <h4>${p.name}</h4>
                        <p style="margin: 5px 0; color: rgba(255, 177, 151, 0.8); font-size: 12px;">Cat: ${p.category} | Prix: $${p.price} | Stock: ${p.stock}</p>
                        <button class="btn-danger" onclick="handleDeleteProduct('${p.id}')" style="margin-top: 10px;">SUPPRIMER</button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        el.innerHTML = `<div class="section-card" style="color: red;">❌ ${error.message}</div>`;
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const product = {
        name: data.get('name'),
        category: data.get('category'),
        price: parseFloat(data.get('price')),
        stock: parseInt(data.get('stock')),
        description: data.get('description'),
        image: 'https://via.placeholder.com/300x200?text=Produit'
    };
    
    try {
        await apiCall('/products', 'POST', product);
        alert('✅ Produit ajouté!');
        loadProductsAdmin();
    } catch (error) {
        alert(`❌ ${error.message}`);
    }
}

async function handleDeleteProduct(id) {
    if (!confirm('Êtes-vous sûr?')) return;
    try {
        await apiCall(`/products/${id}`, 'DELETE');
        alert('✅ Supprimé!');
        loadProductsAdmin();
    } catch (error) {
        alert(`❌ ${error.message}`);
    }
}

// ==================== COMMANDES ====================

async function loadOrdersAdmin() {
    const el = document.getElementById('orders');
    el.innerHTML = '<div class="section-card"><p class="loading">⏳ Chargement...</p></div>';
    
    try {
        const orders = await apiCall('/orders');
        el.innerHTML = `
            <div class="section-card">
                <h2>📦 COMMANDES (${(orders || []).length})</h2>
                <table>
                    <thead><tr><th>ID</th><th>Client</th><th>Total</th><th>Date</th></tr></thead>
                    <tbody>
                        ${(orders || []).map(o => `<tr><td>${o.id}</td><td>${o.customerName || 'Anonyme'}</td><td style="color: #6bff6b;">$${o.total?.toFixed(2) || '0'}</td><td>${new Date(o.date).toLocaleDateString()}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        el.innerHTML = `<div class="section-card" style="color: red;">❌ ${error.message}</div>`;
    }
}

// ==================== LOGS ====================

async function loadLogsAdmin() {
    const el = document.getElementById('logs');
    el.innerHTML = '<div class="section-card"><p class="loading">⏳ Chargement...</p></div>';
    
    try {
        const logs = await apiCall('/logs');
        el.innerHTML = `
            <div class="section-card">
                <h2>📋 LOGS (${(logs || []).length})</h2>
                <table>
                    <thead><tr><th>Type</th><th>Message</th><th>Date</th></tr></thead>
                    <tbody>
                        ${(logs || []).map(l => `<tr><td style="color: ${l.type === 'ERROR' ? '#ff6b6b' : '#6bff6b'};">${l.type}</td><td>${l.message}</td><td style="font-size: 12px;">${new Date(l.date).toLocaleString()}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        el.innerHTML = `<div class="section-card" style="color: red;">❌ ${error.message}</div>`;
    }
}

// ==================== INIT ====================

console.log('✅ Script chargé, vérification auth...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - vérification');

    if (checkAuthentication()) {
        console.log('✅ Utilisateur authentifié');
        showDashboard();
    }
});