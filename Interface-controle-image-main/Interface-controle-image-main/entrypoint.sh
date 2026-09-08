#!/bin/sh
set -e

# Service d'upload HD → S3, en interne uniquement (nginx le proxy via /s3-upload/).
# Boucle de redémarrage : si le process meurt (crash, erreur réseau...), il repart
# tout seul au lieu de laisser /s3-upload/ mort silencieusement.
(
  while true; do
    node /srv/s3-upload-service/server.js
    echo "[s3-upload-service] arrêté (code $?), redémarrage dans 2s..." >&2
    sleep 2
  done
) &

# nginx au premier plan = process principal du conteneur
exec nginx -g "daemon off;"
