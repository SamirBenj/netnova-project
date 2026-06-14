import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type Mode = "idle" | "normal" | "bourrin" | "scenario3";

const scenarios = [
    {
        id: "normal",
        label: "Mode normal",
        description: "Comportement classique — aucune alerte Wazuh",
        color: "normal",
    },
    {
        id: "bourrin",
        label: "Channel Recon",
        description: "25 channels rejoints en masse — règle Wazuh 100011 (level 10)",
        color: "danger",
    },
    {
        id: "scenario3",
        label: "File Exfil",
        description: "25 fichiers partagés + 6 publics — règles Wazuh 100021 + 100026",
        color: "danger",
    },
];

function SlackSimulation() {
    const [mode, setMode] = useState<Mode>("idle");
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleScenario = async (id: string) => {
        setMode(id as Mode);
        setLoading(true);
        setLogs([]);

        const command = id === "normal" ? "scenario_normal"
            : id === "bourrin" ? "scenario_bourrin"
                : "scenario_3";

        const result = await invoke<string[]>(command);
        setLogs(result);
        setLoading(false);
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
                {scenarios.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => handleScenario(s.id)}
                        disabled={loading}
                        className={`flex-1 py-4 rounded-xl text-sm font-medium transition-all border ${mode === s.id
                            ? s.color === "danger"
                                ? "bg-[#AB152E] text-white border-[#AB152E]"
                                : "bg-[#150303] text-white border-[#150303]"
                            : s.color === "danger"
                                ? "bg-white text-[#150303] border-[#150303]/20 hover:border-[#AB152E]/60"
                                : "bg-white text-[#150303] border-[#150303]/20 hover:border-[#150303]/60"
                            } disabled:opacity-40`}
                    >
                        {s.label}
                        <p className="text-xs font-normal opacity-60 mt-1">{s.description}</p>
                    </button>
                ))}
            </div>

            {loading && (
                <div className="bg-[#150303] rounded-xl p-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#AB152E] animate-pulse" />
                    <span className="text-white/60 text-sm font-mono">Simulation en cours...</span>
                </div>
            )}

            {!loading && logs.length > 0 && (
                <div className="bg-[#150303] rounded-xl p-6">
                    <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">Logs générés</p>
                    <div className="flex flex-col gap-2">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <span className={`text-xs mt-0.5 ${mode === "normal" ? "text-green-400" : "text-[#AB152E]"}`}>
                                    {mode === "normal" ? "✓" : "⚠"}
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