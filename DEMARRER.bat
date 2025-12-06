@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ========================================
REM    L1TRIANGLE STORE - DEMARRAGE
REM ========================================

cls
echo.
echo ╔═══════════════════════════════════════╗
echo ║                                       ║
echo ║   🚀 L1TRIANGLE STORE               ║
echo ║   Démarrage du serveur...             ║
echo ║                                       ║
echo ╚═══════════════════════════════════════╝
echo.

REM Vérifier Node.js
echo ⏳ Vérification de Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERREUR: Node.js n'est pas installé!
    echo.
    echo Téléchargez Node.js depuis: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js détecté!
echo.

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo ⏳ Installation des dépendances...
    call npm install
    echo ✅ Dépendances installées!
    echo.
)

REM Démarrer le serveur
echo ╔═══════════════════════════════════════╗
echo ║   DÉMARRAGE DU SERVEUR API           ║
echo ╚═══════════════════════════════════════╝
echo.
echo 📱 Accès LOCAL:
echo    http://localhost:3000
echo.
echo 📱 Accès RÉSEAU (autres appareils):
echo    http://172.29.192.1:3000
echo.
echo 📊 Admin Dashboard:
echo    http://172.29.192.1:3000/admin-login.html
echo.
echo 🛍️  Boutique:
echo    http://172.29.192.1:3000/index.html
echo.
echo 🔐 Code Admin: L1_TRIANGLE
echo.
echo 💡 Astuces:
echo    - Partagez l'URL http://172.29.192.1:3000
echo    - avec les autres appareils sur le MÊME WiFi
echo    - Appuyez sur Ctrl+C pour arrêter
echo.
echo ════════════════════════════════════════
echo.

call npm start

pause
