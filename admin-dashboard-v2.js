// ==================== ADMIN DASHBOARD ULTRA-ROBUSTE ====================

class AdminClient extends window.APIClient || class {} {
    // Utilise la même classe API que panier-api-v2.js
}

const adminAPI = new AdminClient();

// ==================== AUTHENTICATION ====================

const ADMIN_CODE = 'L1_TRIANGLE';

function checkAdmin() {
    const sessionAdmin = sessionStorage.getItem('admin_authenticated');
    if (sessionAdmin === ADMIN_CODE) {
        showDashboard();
        return true;
    }
    showLoginForm();
    return false;
}

function showLoginForm() {
    document.body.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
        ">
            <div style="
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                max-width: 400px;
                width: 90%;
            ">
                <h1 style="text-align: center; color: #333; margin-bottom: 30px;">🔐 Admin L1Triangle</h1>
                
                <input type="password" id="admin-code" placeholder="Code d'accès" style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 20px;
                    border: 2px solid #ddd;
                    border-radius: 5px;
                    font-size: 16px;
                    box-sizing: border-box;
                ">
                
                <button onclick="adminLogin()" style="
                    width: 100%;
                    padding: 12px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                ">Connexion</button>
                
                <p style="
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 14px;
                ">
                    Code: <strong>L1_TRIANGLE</strong>
                </p>
            </div>
        </div>
    `;
    
    document.getElementById('admin-code').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adminLogin();
    });
}

function adminLogin() {
    const code = document.getElementById('admin-code')?.value;
    if (code === ADMIN_CODE) {
        sessionStorage.setItem('admin_authenticated', ADMIN_CODE);
        showDashboard();
    } else {
        alert('❌ Code invalide');
    }
}

function logout() {
    sessionStorage.removeItem('admin_authenticated');
    checkAdmin();
}

// ==================== DASHBOARD ====================

function showDashboard() {
    document.body.innerHTML = `
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            header h1 { margin: 0; }
            header button { background: white; color: #667eea; border: none; padding: 10px 20px; border-radius: 3px; cursor: pointer; font-weight: bold; }
            
            .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
            .tab-btn { padding: 10px 20px; background: white; border: 2px solid #ddd; cursor: pointer; border-radius: 3px; font-weight: bold; transition: all 0.3s; }
            .tab-btn.active { background: #667eea; color: white; border-color: #667eea; }
            
            .container { max-width: 1200px; margin: 0 auto; }
            .section { display: none; background: white; padding: 20px; border-radius: 5px; }
            .section.active { display: block; }
            
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, textarea, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 3px; box-sizing: border-box; font-size: 14px; }
            textarea { resize: vertical; min-height: 100px; }
            
            button { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 3px; cursor: pointer; font-weight: bold; }
            button:hover { background: #5568d3; }
            button.danger { background: #e74c3c; }
            button.danger:hover { background: #c0392b; }
            
            table { width: 100%; border-collapse: collapse; }
            table td, table th { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
            table th { background: #f0f0f0; font-weight: bold; }
            table tr:hover { background: #f9f9f9; }
            
            .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 3px; margin-bottom: 10px; }
            .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 3px; margin-bottom: 10px; }
            .loading { color: #667eea; font-weight: bold; }
        </style>
        
        <div class="container">
            <header>
                <h1>📊 Admin Dashboard L1Triangle</h1>
                <button onclick="logout()">Déconnexion</button>
            </header>
            
            <div class="tabs">
                <button class="tab-btn active" onclick="switchTab('products')">🛍️ Produits</button>
                <button class="tab-btn" onclick="switchTab('orders')">📦 Commandes</button>
                <button class="tab-btn" onclick="switchTab('logs')">📋 Logs</button>
            </div>
            
            <div id="products" class="section active"></div>
            <div id="orders" class="section"></div>
            <div id="logs" class="section"></div>
        </div>
    `;
    
    loadProductsAdmin();
    loadOrdersAdmin();
    loadLogsAdmin();
}

function switchTab(tab) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    document.querySelector(`[onclick*="${tab}"]`).classList.add('active');
}

// ==================== PRODUITS ====================

async function loadProductsAdmin() {
    const el = document.getElementById('products');
    el.innerHTML = '<p class="loading">⏳ Chargement des produits...</p>';
    
    try {
        const products = await adminAPI.get('/products');
        
        el.innerHTML = `
            <h2>Gestion des Produits</h2>
            <h3>Ajouter un nouveau produit</h3>
            <form onsubmit="handleAddProduct(event)" style="display: grid; gap: 10px;">
                <div class="form-group">
                    <label>Nom *</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Catégorie *</label>
                    <select name="category" required>
                        <option>manettes</option>
                        <option>accessoires</option>
                        <option>moniteurs</option>
                        <option>airpods</option>
                        <option>cables</option>
                        <option>vape</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Prix ($) *</label>
                    <input type="number" name="price" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Stock *</label>
                    <input type="number" name="stock" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description"></textarea>
                </div>
                <div class="form-group">
                    <label>URL Image</label>
                    <input type="url" name="image">
                </div>
                <button type="submit">➕ Ajouter le produit</button>
            </form>
            
            <h3 style="margin-top: 30px;">Produits existants (${products.length})</h3>
            <div id="products-list"></div>
        `;
        
        const listEl = document.getElementById('products-list');
        listEl.innerHTML = (products || []).map(p => `
            <div style="background: #f9f9f9; padding: 15px; margin-bottom: 10px; border-radius: 3px; border: 1px solid #ddd;">
                <h4>${p.name}</h4>
                <p><strong>Catégorie:</strong> ${p.category} | <strong>Prix:</strong> $${p.price} | <strong>Stock:</strong> ${p.stock}</p>
                <p><strong>Description:</strong> ${p.description || 'N/A'}</p>
                <button onclick="handleEditProduct('${p.id}')" style="margin-right: 10px;">✏️ Modifier</button>
                <button onclick="handleDeleteProduct('${p.id}')" class="danger">🗑️ Supprimer</button>
            </div>
        `).join('');
        
    } catch (error) {
        el.innerHTML = `<div class="error">❌ Erreur: ${error.message}</div>`;
    }
}

async function handleAddProduct(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    const product = {
        name: data.get('name'),
        category: data.get('category'),
        price: parseFloat(data.get('price')),
        stock: parseInt(data.get('stock')),
        description: data.get('description'),
        image: data.get('image') || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(data.get('name'))
    };
    
    try {
        await adminAPI.post('/products', product);
        document.getElementById('products').innerHTML = '<div class="success">✅ Produit ajouté! Rechargement...</div>';
        setTimeout(() => loadProductsAdmin(), 1000);
    } catch (error) {
        alert(`❌ Erreur: ${error.message}`);
    }
}

async function handleDeleteProduct(id) {
    if (!confirm('Êtes-vous sûr?')) return;
    
    try {
        await adminAPI.delete(`/products/${id}`);
        alert('✅ Produit supprimé');
        loadProductsAdmin();
    } catch (error) {
        alert(`❌ Erreur: ${error.message}`);
    }
}

async function handleEditProduct(id) {
    alert('✏️ Fonctionnalité de modification à implémenter');
}

// ==================== COMMANDES ====================

async function loadOrdersAdmin() {
    const el = document.getElementById('orders');
    el.innerHTML = '<p class="loading">⏳ Chargement des commandes...</p>';
    
    try {
        const orders = await adminAPI.get('/orders');
        
        el.innerHTML = `
            <h2>Commandes (${(orders || []).length})</h2>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Détails</th>
                </tr>
                ${(orders || []).map(o => `
                    <tr>
                        <td>${o.id || 'N/A'}</td>
                        <td>${o.customerName || 'Anonyme'}</td>
                        <td>$${o.total ? o.total.toFixed(2) : '0.00'}</td>
                        <td>${new Date(o.date).toLocaleDateString()}</td>
                        <td><button onclick="alert('${JSON.stringify(o.items || []).replace(/"/g, '\\"')}')">Voir</button></td>
                    </tr>
                `).join('')}
            </table>
        `;
        
    } catch (error) {
        el.innerHTML = `<div class="error">❌ Erreur: ${error.message}</div>`;
    }
}

// ==================== LOGS ====================

async function loadLogsAdmin() {
    const el = document.getElementById('logs');
    el.innerHTML = '<p class="loading">⏳ Chargement des logs...</p>';
    
    try {
        const logs = await adminAPI.get('/logs');
        
        el.innerHTML = `
            <h2>Logs Système (${(logs || []).length})</h2>
            <table>
                <tr>
                    <th>Type</th>
                    <th>Message</th>
                    <th>Date</th>
                </tr>
                ${(logs || []).map(l => `
                    <tr>
                        <td>${l.type || 'INFO'}</td>
                        <td>${l.message || ''}</td>
                        <td>${new Date(l.date).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </table>
        `;
        
    } catch (error) {
        el.innerHTML = `<div class="error">❌ Erreur: ${error.message}</div>`;
    }
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', checkAdmin);
