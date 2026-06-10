import { useState } from "react";

type Mode = "idle" | "normal" | "bourrin";

function SlackSimulation() {
    const [mode, setMode] = useState<Mode>("idle");
    const [logs, setLogs] = useState<string[]>([]);
    // À mettre en place si on veut faire du vrai bourrin avec backend Rust + Wazuh
    // const handleBourrin = async () => {
    //     setMode("bourrin");
    //     const result = await invoke<string[]>("simulate_bourrin");
    //     setLogs(result);
    // };
    // const handleNormal = async () => {
    //     setMode("normal");
    //     const result = await invoke<string[]>("simulate_normal");
    //     setLogs(result);
    // };
    const handleNormal = () => {
        setMode("normal");
        setLogs([
            "Connexion de john.doe depuis 192.168.1.12",
            "Message envoyé dans #general",
            "Fichier partagé : rapport_q1.pdf",
            "Déconnexion de john.doe",
        ]);
    };


    const handleBourrin = () => {
        setMode("bourrin");
        setLogs([
            "Connexion de john.doe depuis 185.220.101.34",
            "52 messages envoyés en 3 secondes",
            "Téléchargement massif : 47 fichiers en 10 secondes",
            "Tentative de rejoindre 12 channels simultanément",
            "Mention @everyone répétée 8 fois",
            "Connexion depuis une nouvelle IP inconnue",
            "Activité détectée à 03h14",
        ]);
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-medium mb-2">Simulation Slack</h1>
                <p className="text-[#150303]/60 text-sm">
                    Simule un utilisateur sur le workspace Slack et transmet les logs à Wazuh.
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleNormal}
                    className={`flex-1 py-4 rounded-xl text-sm font-medium transition-all border ${mode === "normal"
                        ? "bg-[#150303] text-white border-[#150303]"
                        : "bg-white text-[#150303] border-[#150303]/20 hover:border-[#150303]/60"
                        }`}
                >
                    Mode normal
                    <p className="text-xs font-normal opacity-60 mt-1">
                        Comportement classique — Wazuh ne réagit pas
                    </p>
                </button>

                <button
                    onClick={handleBourrin}
                    className={`flex-1 py-4 rounded-xl text-sm font-medium transition-all border ${mode === "bourrin"
                        ? "bg-[#AB152E] text-white border-[#AB152E]"
                        : "bg-white text-[#150303] border-[#150303]/20 hover:border-[#AB152E]/60"
                        }`}
                >
                    Mode bourrin
                    <p className="text-xs font-normal opacity-60 mt-1">
                        Actions suspectes en masse — Wazuh détecte
                    </p>
                </button>
            </div>

            {logs.length > 0 && (
                <div className="bg-[#150303] rounded-xl p-6">
                    <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">Logs générés</p>
                    <div className="flex flex-col gap-2">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <span className={`text-xs mt-0.5 ${mode === "bourrin" ? "text-[#AB152E]" : "text-green-400"}`}>
                                    {mode === "bourrin" ? "⚠" : "✓"}
                                </span>
                                <span className="text-white/80 text-sm font-mono">{log}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SlackSimulation;