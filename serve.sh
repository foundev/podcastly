#!/bin/bash
# Script simple pour servir les fichiers statiques de Podcastly

PORT=8000
DIR="web"

# Vérifier quel serveur est disponible
if command -v python3 &> /dev/null; then
    echo "Démarrage du serveur avec Python sur http://127.0.0.1:${PORT}"
    python3 -m http.server ${PORT} --directory ${DIR}
elif command -v node &> /dev/null && command -v npx &> /dev/null; then
    echo "Démarrage du serveur avec Node.js sur http://127.0.0.1:${PORT}"
    npx http-server ${DIR} -p ${PORT}
elif command -v php &> /dev/null; then
    echo "Démarrage du serveur avec PHP sur http://127.0.0.1:${PORT}"
    php -S 127.0.0.1:${PORT} -t ${DIR}
else
    echo "Erreur: Aucun serveur HTTP disponible."
    echo "Veuillez installer Python, Node.js ou PHP, ou utiliser un autre serveur HTTP statique."
    exit 1
fi

