use std::process::Command;
use reqwest::blocking::Client;
use std::collections::HashMap;

// Config — tu changes ces valeurs quand tout est prêt
const LEGACY_AD: &str = "IP-DU-LEG-DC01";
const LEGACY_DOMAIN: &str = "NETNOVA-LEGACY";        // NetBIOS name — ne pas modifier
const LEGACY_USER: &str = "Administrator";            // Compte admin legacy — ne pas modifier
const LEGACY_PASSWORD: &str = "MOT-DE-PASSE-LEGACY"; 

// Active Directory Durci (ad.netnova.fr)
const DURCI_AD: &str = "IP-DU-DURCI";
const DURCI_DOMAIN: &str = "ad.netnova.fr";
const DURCI_USER: &str = "hugo";                     // Compte standard non privilégié — ne pas modifier
const DURCI_PASSWORD: &str = "MOT-DE-PASSE-DURCI";  

// Wazuh
const WAZUH_URL: &str = "https://wazuh-server:55500/";  

// Slack
const SLACK_BOT_TOKEN: &str = "xoxb-...";           // Bot token Slack (commence par xoxb-)
const SLACK_CHANNEL: &str = "general";               // Channel Slack cible

// Scénario 1 — comportement normal (1 message — aucune alerte Wazuh)
#[tauri::command]
fn scenario_normal() -> Vec<String> {
    let client = Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();

    let mut logs = vec![];

    let mut body = HashMap::new();
    body.insert("channel", SLACK_CHANNEL);
    body.insert("text", "Bonjour, voici le rapport du jour.");

    let res = client
        .post("https://slack.com/api/chat.postMessage")
        .bearer_auth(SLACK_BOT_TOKEN)
        .json(&body)
        .send();

    match res {
        Ok(r) => {
            let json: serde_json::Value = r.json().unwrap_or_default();
            if json["ok"].as_bool().unwrap_or(false) {
                logs.push("✓ Message envoyé dans #general".to_string());
            } else {
                logs.push(format!("Erreur Slack : {}", json["error"].as_str().unwrap_or("inconnu")));
            }
        },
        Err(e) => logs.push(format!("Erreur : {}", e)),
    }

    logs
}

// Scénario 2 — Channel Recon (règle Wazuh 100011 level 10)
#[tauri::command]
fn scenario_bourrin() -> Vec<String> {
    let client = Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();

    let mut logs = vec![];

    for i in 1..=25 {
        let mut body = HashMap::new();
        let channel = format!("C_DEMO_{:03}", i);
        body.insert("channel", channel.clone());

        let res = client
            .post("https://slack.com/api/conversations.join")
            .bearer_auth(SLACK_BOT_TOKEN)
            .json(&body)
            .send();

        match res {
            Ok(r) => {
                let json: serde_json::Value = r.json().unwrap_or_default();
                if json["ok"].as_bool().unwrap_or(false) {
                    logs.push(format!("✓ Channel #{} rejoint", i));
                } else {
                    logs.push(format!("⚠ Channel #{} : {}", i, json["error"].as_str().unwrap_or("inconnu")));
                }
            },
            Err(e) => logs.push(format!("Erreur #{} : {}", i, e)),
        }
    }

    logs.push("→ Règle Wazuh 100011 attendue (level 10)".to_string());
    logs
}

// Scénario 3 — File Exfil (règles Wazuh 100021 + 100026)
#[tauri::command]
fn scenario_3() -> Vec<String> {
    let client = Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();

    let mut logs = vec![];

    for i in 1..=25 {
        let mut body = HashMap::new();
        body.insert("channels", SLACK_CHANNEL);
        let file_id = format!("F_DEMO_{:03}", i);
        body.insert("file", &file_id);

        let res = client
            .post("https://slack.com/api/files.share")
            .bearer_auth(SLACK_BOT_TOKEN)
            .json(&body)
            .send();

        match res {
            Ok(r) => {
                let json: serde_json::Value = r.json().unwrap_or_default();
                if json["ok"].as_bool().unwrap_or(false) {
                    logs.push(format!("✓ Fichier #{} partagé", i));
                } else {
                    logs.push(format!("⚠ Fichier #{} : {}", i, json["error"].as_str().unwrap_or("inconnu")));
                }
            },
            Err(e) => logs.push(format!("Erreur fichier #{} : {}", i, e)),
        }
    }

    for i in 1..=6 {
        let mut body = HashMap::new();
        let file_id = format!("F_PUB_{:03}", i);
        body.insert("file", file_id.as_str());

        let res = client
            .post("https://slack.com/api/files.sharedPublicURL")
            .bearer_auth(SLACK_BOT_TOKEN)
            .json(&body)
            .send();

        match res {
            Ok(r) => {
                let json: serde_json::Value = r.json().unwrap_or_default();
                if json["ok"].as_bool().unwrap_or(false) {
                    logs.push(format!("✓ Fichier #{} rendu public", i));
                } else {
                    logs.push(format!("⚠ Public #{} : {}", i, json["error"].as_str().unwrap_or("inconnu")));
                }
            },
            Err(e) => logs.push(format!("Erreur public #{} : {}", i, e)),
        }
    }

    logs.push("→ Règles Wazuh 100021 + 100026 attendues".to_string());
    logs
}

// Lancement pentest AD
#[tauri::command]
fn run_pentest(target: &str, attack: &str) -> Vec<String> {
    let (host, domain, user, password) = if target == "legacy" {
        (LEGACY_AD, LEGACY_DOMAIN, LEGACY_USER, LEGACY_PASSWORD)
    } else {
        (DURCI_AD, DURCI_DOMAIN, DURCI_USER, DURCI_PASSWORD)
    };

    let script = match attack {
        "kerberoasting" => "kerberoasting.sh",
        "pth" => "pass-the-hash.sh",
        "bloodhound" => "enumeration-ldap.sh",
        _ => return vec![format!("Attaque inconnue : {}", attack)],
    };

    let script_path = format!("{}/scripts/{}", env!("CARGO_MANIFEST_DIR"), script);

    let output = Command::new("bash")
        .arg(&script_path)
        .arg(host)
        .arg(domain)
        .arg(user)
        .arg(password)
        .output();

    match output {
        Ok(o) => {
            let stdout = String::from_utf8_lossy(&o.stdout);
            let stderr = String::from_utf8_lossy(&o.stderr);
            let mut logs: Vec<String> = stdout.lines().map(|l| l.to_string()).collect();
            if logs.is_empty() {
                logs.push(format!("Stderr: {}", stderr));
            }
            logs
        },
        Err(e) => vec![format!("Erreur : {}", e)],
    }
}

// Récupérer les alertes Wazuh
#[tauri::command]
fn fetch_wazuh_alerts() -> serde_json::Value {
    let client = Client::builder()
        .danger_accept_invalid_certs(true)
        .build()
        .unwrap();

    let res = client
        .get(format!("{}/alerts", WAZUH_URL))
        .basic_auth("admin", Some("SecretPassword"))
        .send();

    match res {
        Ok(r) => r.json::<serde_json::Value>().unwrap_or(serde_json::json!({
            "error": "Impossible de parser la réponse Wazuh"
        })),
        Err(e) => serde_json::json!({
            "error": format!("Connexion Wazuh échouée : {}", e)
        }),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scenario_normal,
            scenario_bourrin,
            scenario_3,
            run_pentest,
            fetch_wazuh_alerts
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}