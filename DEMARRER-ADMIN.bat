@echo off
chcp 65001 >nul
color 0A
title L1TRIANGLE - Démarrage Serveur

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          🚀 L1TRIANGLE - DÉMARRAGE DU SERVEUR             ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📍 Emplacement: %CD%
echo.

:: Vérifier si Node.js est installé
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ❌ ERREUR: Node.js n'est pas installé!
    echo.
    echo 📥 Téléchargez Node.js sur: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js détecté: 
node --version
echo.

:: Tuer tout processus Node existant sur le port 3000
echo 🔄 Vérification des processus existants...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ⚠️  Arrêt des processus Node en cours...
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 2 >nul
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  🌟 SERVEUR EN COURS DE DÉMARRAGE...                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Démarrer le serveur
start "L1TRIANGLE Server" /MIN cmd /c "node api-server.js"

:: Attendre que le serveur démarre
echo ⏳ Attente du démarrage du serveur...
timeout /t 3 >nul

:: Ouvrir le navigateur sur la page admin
echo.
echo 🌐 Ouverture du navigateur...
start http://localhost:3000/admin.html

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║  ✅ SERVEUR DÉMARRÉ AVEC SUCCÈS!                          ║
echo ║                                                            ║
echo ║  📱 URLs disponibles:                                     ║
echo ║                                                            ║
echo ║  🏠 Accueil:    http://localhost:3000/start.html          ║
echo ║  🔐 Admin:      http://localhost:3000/admin.html          ║
echo ║  🛍️  Boutique:   http://localhost:3000/index.html         ║
echo ║                                                            ║
echo ║  🔑 Code Admin: L1_TRIANGLE                               ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ⚠️  NE FERMEZ PAS cette fenêtre!
echo    Le serveur s'arrêtera si vous la fermez.
echo.
echo 💡 Pour arrêter le serveur: Appuyez sur Ctrl+C
echo.

pause
