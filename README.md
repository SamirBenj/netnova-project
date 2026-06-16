# NetNova Pentest — UI
 
Application desktop de simulation de pentest et de détection de comportements suspects sur Slack, développée avec Tauri (React + TypeScript + Rust).
 
## Stack technique
 
- React 18 + TypeScript + Vite
- Tauri 2 (backend Rust)
- Tailwind CSS v4
- React Router DOM
- reqwest (appels HTTP Rust)
---
 
## Prérequis
 
**Node.js** (v18+) — https://nodejs.org/
 
**Bun** :
```bash
curl -fsSL https://bun.sh/install | bash
```
 
**Rust** :
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
 
**impacket** (pour les scripts pentest AD) :
```bash
pip install impacket --break-system-packages
```
 
---
 
## Installation
 
```bash
git clone <url-du-repo>
cd netnova-pentest
bun install
```
 
---
 
## Configuration
 
Ouvre `src-tauri/src/lib.rs` et remplace les constantes en haut du fichier :
 
```rust
// Active Directory Legacy 
const LEGACY_AD: &str = "IP-DU-LEGACY";
const LEGACY_DOMAIN: &str = "NETNOVA-LEGACY";
const LEGACY_USER: &str = "Administrator";
const LEGACY_PASSWORD: &str = "MOT-DE-PASSE-LEGACY"; 
 
// Active Directory Durci (ad.netnova.fr)
const DURCI_AD: &str = "IP-DU-DURCI";
const DURCI_DOMAIN: &str = "";
const DURCI_USER: &str = "hugo";
const DURCI_PASSWORD: &str = "MOT-DE-PASSE-DURCI"; 
 
// Wazuh
const WAZUH_URL: &str = "https://wazuh-server:55500/";
 
// Slack
const SLACK_BOT_TOKEN: &str = "xoxb-...";           // Bot token Slack (commence par xoxb-)
const SLACK_CHANNEL: &str = "general";               // Channel Slack cible
```
 
---
 
## Lancer l'app
 
```bash
bun tauri dev
```
 
## Build production
 
```bash
bun tauri build
```
 
Génère un `.dmg` (Mac) ou `.exe` (Windows) dans `src-tauri/target/release/bundle/`.
 
---
 
## Architecture du projet
 
```
src/
  pages/
    SlackSimulation.tsx   — 3 scénarios Slack
    PentestAD.tsx         — Scripts pentest sur les 2 AD
    Rapport.tsx           — Rapport comparatif legacy vs durci
  components/
    SideBar.tsx           — Navigation
 
src-tauri/
  src/
    lib.rs                — Backend Rust — appels API Slack/Wazuh + scripts bash
  scripts/
    kerberoasting.sh      — Kerberoasting via impacket-GetUserSPNs
    pass-the-hash.sh      — Pass-the-Hash via impacket-secretsdump + impacket-smbclient
    enumeration-ldap.sh   — Énumération LDAP via impacket-GetADUsers + impacket-lookupsid
```
 
---
 
## Fonctionnement de l'app
 
### Page 1 — Simulation Slack
 
3 scénarios qui font de vraies requêtes sur l'API Slack :
 
| Scénario | Action | Règle Wazuh déclenchée |
|---|---|---|
| Mode normal | 1 message dans #general | Aucune alerte |
| Channel Recon | Rejoindre 25 channels en masse | 100011 (level 10) |
| File Exfil | Partager 25 fichiers + 6 publics | 100021 + 100026 (level 10 + 12) |
 
### Page 2 — Pentest Active Directory
 
3 attaques réelles via impacket sur les 2 AD :
 
| Attaque | Outil | Legacy | Durci |
|---|---|---|---|
| Kerberoasting | impacket-GetUserSPNs | ✅ Fonctionne (svc_backup en DA) | ❌ Bloqué |
| Pass-the-Hash | impacket-secretsdump + smbclient | ✅ Fonctionne | ❌ Bloqué (GPO Deny-Logon) |
| Énumération LDAP | impacket-GetADUsers + lookupsid | ✅ Structure plate visible | ❌ Limité (tiering T0/T1) |
 
### Page 3 — Rapport comparatif
 
Récupère les alertes depuis l'API Wazuh et affiche le comparatif legacy vs durci.
 
---
 
## Contexte des 2 Active Directory
 
| | netnova-legacy (LEG-DC01) | netnova durci (ad.netnova.fr) |
|---|---|---|
| Tiering | ❌ Aucun | ✅ T0/T1 |
| Domain Admins | Surpeuplé + svc_backup | 1 seul compte |
| Mot de passe | Politique faible | 14 car., expiration 90j |
| LAPS | ❌ | ✅ |
| Pass-the-Hash | ✅ Possible | ❌ Bloqué par GPO |
| Audit | ❌ Pas de stratégie | ✅ Avancée |
 
---
 
## Flux complet
 
```
UI Tauri → scénarios Slack (API Slack) → connecteur Wazuh-Slack → Wazuh détecte → Rapport
UI Tauri → scripts bash impacket (AD legacy / durci) → Wazuh détecte → Rapport
```
 