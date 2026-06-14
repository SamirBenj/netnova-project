# NetNova Pentest — UI
 
Application desktop de simulation de pentest et de détection de comportements suspects sur Slack, développée avec Tauri (React + TypeScript + Rust).
 
## Stack technique
 
- React 18 + TypeScript + Vite
- Tauri 2 (backend Rust)
- Tailwind CSS v4
- React Router DOM
- reqwest (appels HTTP Rust)
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
 
## Installation
 
```bash
git clone <url-du-repo>
cd netnova-pentest
bun install
```
 
## Configuration
 
Ouvre `src-tauri/src/lib.rs` et remplace les 5 constantes en haut du fichier :
 
```rust
const LEGACY_AD: &str = "IP-de-netnova-legacy.local";
const DURCI_AD: &str = "IP-de-netnova.local";
const WAZUH_URL: &str = "https://IP-wazuh:55500";
const SLACK_BOT_TOKEN: &str = "xoxb-ton-token";
const SLACK_CHANNEL: &str = "general";
```
 
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
    kerberoasting.sh      — Script bash Kerberoasting
    pass-the-hash.sh      — Script bash Pass-the-Hash
    enumeration-ldap.sh   — Script bash Énumération LDAP
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
 
3 scripts bash lancés depuis l'UI sur les 2 AD :
 
| Attaque | Description |
|---|---|
| Kerberoasting | Demande des tickets TGS pour cracker des comptes de service |
| Pass-the-Hash | Réutilisation de hash NTLM pour s'authentifier sans mot de passe |
| Énumération LDAP | Requêtes LDAP massives pour mapper la structure AD |
 
### Page 3 — Rapport comparatif
 
Récupère les alertes depuis l'API Wazuh et affiche le comparatif legacy vs durci.
 
---
 
## Flux complet
 
```
UI Tauri → scénarios Slack (API Slack) → Wazuh détecte → Rapport
UI Tauri → scripts bash (AD legacy / durci) → Wazuh détecte → Rapport
```