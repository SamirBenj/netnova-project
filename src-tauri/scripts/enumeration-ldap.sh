#!/bin/bash
TARGET=$1
LOG_FILE="/tmp/netnova_ldap.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Énumération LDAP lancée sur $TARGET" >> $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Requêtes LDAP massives en cours..." >> $LOG_FILE

# Simulation — mapping structure AD
mkdir -p /tmp/netnova_attack
echo "OU=Users,DC=netnova,DC=local" > /tmp/netnova_attack/ldap_map.txt
echo "OU=Admins,DC=netnova,DC=local" >> /tmp/netnova_attack/ldap_map.txt
echo "OU=Servers,DC=netnova,DC=local" >> /tmp/netnova_attack/ldap_map.txt
echo "CN=Domain Admins,CN=Users,DC=netnova,DC=local" >> /tmp/netnova_attack/ldap_map.txt

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Structure AD mappée — $(wc -l < /tmp/netnova_attack/ldap_map.txt) objets trouvés" >> $LOG_FILE
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Énumération LDAP terminée sur $TARGET" >> $LOG_FILE

cat $LOG_FILE