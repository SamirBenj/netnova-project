#!/bin/bash
TARGET=$1
LOG_FILE="/tmp/netnova_pth.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pass-the-Hash lancé sur $TARGET" >> $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Récupération du hash NTLM..." >> $LOG_FILE

# Simulation — accès fichiers sensibles
mkdir -p /tmp/netnova_attack
echo "administrator:hash_ntlm_fake_admin" > /tmp/netnova_attack/pth_credentials.txt
cat /tmp/netnova_attack/pth_credentials.txt >> $LOG_FILE

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Authentification simulée sur $TARGET avec hash NTLM" >> $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Accès obtenu — Pass-the-Hash terminé" >> $LOG_FILE

cat $LOG_FILE