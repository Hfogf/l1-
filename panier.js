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

// ouvrir / fermer le panneau panier
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

// ajout au panier
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const card  = btn.closest('.product-card');
        const id    = card.dataset.id;
        const name  = card.dataset.name;
        const price = parseFloat(card.dataset.price);
        const image = card.dataset.image || card.querySelector('img').src;

        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id, name, price, qty: 1, image });
        }

        renderCart();
        cartOverlay.classList.remove('hidden');  // ouvrir directement après ajout
    });
});

// affiche le contenu du panier
function renderCart() {
    cartItemsEl.innerHTML = '';
    let total = 0;
    let totalQty = 0;

    cart.forEach(item => {
        const sub = item.price * item.qty;
        total += sub;
        totalQty += item.qty;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" class="cart-item-img" alt="">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>Prix unité: ${item.price.toFixed(2)} $</span>
            </div>
            <div class="cart-item-controls">
                <div class="qty-controls">
                    <button class="qty-btn minus">-</button>
                    <span class="cart-item-qty">${item.qty}</span>
                    <button class="qty-btn plus">+</button>
                </div>
                <div>${sub.toFixed(2)} $</div>
                <button class="remove-item">Supprimer</button>
            </div>
        `;

        div.querySelector('.minus').addEventListener('click', () => {
            if (item.qty > 1) {
                item.qty--;
            } else {
                cart.splice(cart.indexOf(item), 1);
            }
            renderCart();
        });

        div.querySelector('.plus').addEventListener('click', () => {
            item.qty++;
            renderCart();
        });

        div.querySelector('.remove-item').addEventListener('click', () => {
            cart.splice(cart.indexOf(item), 1);
            renderCart();
        });

        cartItemsEl.appendChild(div);
    });

    cartTotalEl.textContent = total.toFixed(2);
    cartCountEl.textContent = totalQty;
}

// texte de commande
function buildOrderText() {
    if (!cart.length) return '';

    let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    let lines = ['Commande L1triangle_store', ''];

    cart.forEach(item => {
        lines.push(
            `- ${item.name} x${item.qty} : ${item.price.toFixed(2)} $ ` +
            `(sous-total ${(item.price * item.qty).toFixed(2)} $)`
        );
    });

    lines.push('');
    lines.push(`Total : ${total.toFixed(2)} $`);

    return lines.join('\n');
}

// bouton Email
emailBtn.addEventListener('click', () => {
    if (!cart.length) {
        alert('Votre panier est vide.');
        return;
    }

    const email   = ' l1triangle.info@gmail.com'; // 🔁 mets ton mail ici
    const subject = 'Commande L1triangle_store';
    const body    = buildOrderText();

    window.location.href =
        `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// bouton WhatsApp
whatsappBtn.addEventListener('click', () => {
    if (!cart.length) {
        alert('Votre panier est vide.');
        return;
    }

    const phone   = '50939945794'; // 🔁 ton numéro WhatsApp (sans +)
    const message = buildOrderText();
    const url     = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
});
