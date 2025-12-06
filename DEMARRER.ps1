# L1TRIANGLE STORE - Script de démarrage PowerShell
# Usage: .\DEMARRER.ps1

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 L1TRIANGLE STORE                 ║" -ForegroundColor Cyan
Write-Host "║  Démarrage du serveur...              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Vérifier Node.js
Write-Host "⏳ Vérification de Node.js..." -ForegroundColor Yellow
$nodeCheck = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js $nodeCheck détecté`n" -ForegroundColor Green
} else {
    Write-Host "❌ ERREUR: Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "Téléchargez depuis: https://nodejs.org`n" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Vérifier npm
$npmCheck = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm $npmCheck détecté`n" -ForegroundColor Green
} else {
    Write-Host "❌ ERREUR: npm n'est pas installé!" -ForegroundColor Red
    exit 1
}

# Installer les dépendances si nécessaire
if (-not (Test-Path "node_modules")) {
    Write-Host "⏳ Installation des dépendances..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dépendances installées!`n" -ForegroundColor Green
}

# Afficher les informations de démarrage
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  DÉMARRAGE DU SERVEUR API            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📱 Accès LOCAL:" -ForegroundColor Magenta
Write-Host "   http://localhost:3000`n" -ForegroundColor White

Write-Host "📱 Accès RÉSEAU (autres appareils):" -ForegroundColor Magenta
Write-Host "   http://172.29.192.1:3000`n" -ForegroundColor White

Write-Host "📊 Admin Dashboard:" -ForegroundColor Magenta
Write-Host "   http://172.29.192.1:3000/admin-login.html`n" -ForegroundColor White

Write-Host "🛍️  Boutique:" -ForegroundColor Magenta
Write-Host "   http://172.29.192.1:3000/index.html`n" -ForegroundColor White

Write-Host "🔐 Code Admin: " -ForegroundColor Magenta -NoNewline
Write-Host "L1_TRIANGLE`n" -ForegroundColor Yellow

Write-Host "💡 Astuces:" -ForegroundColor Cyan
Write-Host "   - Partagez l'URL http://172.29.192.1:3000" -ForegroundColor White
Write-Host "   - avec les autres appareils sur le MÊME WiFi" -ForegroundColor White
Write-Host "   - Appuyez sur Ctrl+C pour arrêter`n" -ForegroundColor White

Write-Host "════════════════════════════════════════`n" -ForegroundColor Cyan

# Démarrer le serveur
npm start
