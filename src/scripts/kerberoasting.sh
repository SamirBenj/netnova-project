#!/bin/bash
TARGET=$1
LOG_FILE="/tmp/netnova_kerberoasting.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Kerberoasting lancé sur $TARGET" >> $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Recherche des comptes de service..." >> $LOG_FILE

# Simulation — création de fichiers suspects
mkdir -p /tmp/netnova_attack
echo "svc_backup:hash_ntlm_fake_1234" > /tmp/netnova_attack/krb_hashes.txt
echo "svc_sql:hash_ntlm_fake_5678" >> /tmp/netnova_attack/krb_hashes.txt
echo "svc_admin:hash_ntlm_fake_9012" >> /tmp/netnova_attack/krb_hashes.txt

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 3 hashes récupérés — fichier : /tmp/netnova_attack/krb_hashes.txt" >> $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Kerberoasting terminé sur $TARGET" >> $LOG_FILE

cat $LOG_FILE