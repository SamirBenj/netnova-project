use std::process::Command;

// Config — tu changes ces valeurs quand l'infra est prête
const LEGACY_AD: &str = "netnova-legacy.local";
const DURCI_AD: &str = "netnova.local";
const WAZUH_URL: &str = "https://wazuh-server:55000";
const SLACK_TOKEN: &str = "xoxb-ton-token-slack";

// Simulation Slack mode normal
#[tauri::command]
fn simulate_normal() -> Vec<String> {
    vec![
        format!("Connexion de john.doe depuis 192.168.1.12"),
        format!("Message envoyé dans #general"),
        format!("Fichier partagé : rapport_q1.pdf"),
        format!("Déconnexion de john.doe"),
    ]
}

// Simulation Slack mode bourrin
#[tauri::command]
fn simulate_bourrin() -> Vec<String> {
    // Envoie de vraies requêtes à l'API Slack avec SLACK_TOKEN
    // ex: envoyer 50 messages, télécharger des fichiers, etc.
    // et retourne les vrais logs générés
    vec![
        format!("Connexion de john.doe depuis 185.220.101.34"),
        format!("52 messages envoyés en 3 secondes"),
        format!("Téléchargement massif : 47 fichiers en 10 secondes"),
        format!("Tentative de rejoindre 12 channels simultanément"),
        format!("Mention @everyone répétée 8 fois"),
        format!("Activité détectée à 03h14"),
    ]
}

// Lancement pentest AD
#[tauri::command]
fn run_pentest(target: &str, attack: &str) -> Vec<String> {
    let host = if target == "legacy" { LEGACY_AD } else { DURCI_AD };

    let script = match attack {
        "kerberoasting" => "src-tauri/scripts/kerberoasting.sh",
        "pth" => "src-tauri/scripts/pass-the-hash.sh",
        "bloodhound" => "src-tauri/scripts/enumeration-ldap.sh",
        _ => return vec![format!("Attaque inconnue : {}", attack)],
    };

    let output = Command::new("bash")
        .arg(script)
        .arg(host)
        .output();

    match output {
        Ok(o) => String::from_utf8_lossy(&o.stdout)
            .lines()
            .map(|l| l.to_string())
            .collect(),
        Err(e) => vec![format!("Erreur : {}", e)],
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            simulate_normal,
            simulate_bourrin,
            run_pentest
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}