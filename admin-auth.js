// Authentication pour l'admin
const ADMIN_CODE = 'L1_TRIANGLE';

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');
    
    if (password === ADMIN_CODE) {
        // Stocker la session admin
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminUsername', username);
        sessionStorage.setItem('adminLoginTime', new Date().toISOString());
        
        // Rediriger vers le dashboard
        window.location.href = 'admin-dashboard.html';
    } else {
        errorDiv.textContent = 'Code de sécurité incorrect';
        errorDiv.classList.remove('hidden');
        
        // Effacer le message après 3 secondes
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 3000);
    }
});
