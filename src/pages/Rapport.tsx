import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

const attacks = [
    { id: "kerberoasting", label: "Kerberoasting" },
    { id: "pth", label: "Pass-the-Hash" },
    { id: "bloodhound", label: "Énumération LDAP" },
];

type AttackResult = { detected: boolean; time?: string };
type RapportData = {
    slack: { detected: boolean; details: string };
    legacy: Record<string, AttackResult>;
    durci: Record<string, AttackResult>;
};

function Rapport() {
    const [data, setData] = useState<RapportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRefresh = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await invoke<any>("fetch_wazuh_alerts");
            if (result.error) {
                setError(result.error);
            } else {
                // Parser les alertes Wazuh en format rapport
                setData(parseWazuhAlerts(result));
            }
        } catch (e) {
            setError("Erreur de connexion Wazuh");
        }
        setLoading(false);
    };

    const parseWazuhAlerts = (raw: any): RapportData => {
        // À adapter selon le format exact des alertes Wazuh
        return {
            slack: {
                detected: raw?.slack_alerts?.length > 0,
                details: raw?.slack_alerts?.[0]?.description || "Aucune alerte Slack",
            },
            legacy: {
                kerberoasting: { detected: raw?.legacy?.kerberoasting ?? false },
                pth: { detected: raw?.legacy?.pth ?? false },
                bloodhound: { detected: raw?.legacy?.bloodhound ?? false },
            },
            durci: {
                kerberoasting: { detected: raw?.durci?.kerberoasting ?? false, time: raw?.durci?.kerberoasting_time },
                pth: { detected: raw?.durci?.pth ?? false, time: raw?.durci?.pth_time },
                bloodhound: { detected: raw?.durci?.bloodhound ?? false, time: raw?.durci?.bloodhound_time },
            },
        };
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-medium mb-2">Rapport comparatif</h1>
                    <p className="text-[#150303]/60 text-sm">Résultats de détection Wazuh — legacy vs durci.</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#150303] text-white hover:bg-[#AB152E] transition-all disabled:opacity-40"
                >
                    {loading ? "Chargement..." : "Rafraîchir Wazuh"}
                </button>
            </div>

            {error && (
                <div className="bg-[#AB152E]/10 border border-[#AB152E]/30 rounded-xl p-4">
                    <p className="text-[#AB152E] text-sm font-mono">{error}</p>
                </div>
            )}

            {!data && !error && !loading && (
                <div className="bg-[#150303] rounded-xl p-6">
                    <p className="text-white/40 text-sm text-center">Cliquez sur "Rafraîchir Wazuh" pour charger les alertes.</p>
                </div>
            )}

            {data && (
                <>
                    {/* Slack */}
                    <div className="bg-[#150303] rounded-xl p-6">
                        <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">Détection Slack</p>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white text-sm font-medium">Utilisateur suspect</p>
                                <p className="text-white/40 text-xs">{data.slack.details}</p>
                            </div>
                            <span className={`text-sm ${data.slack.detected ? "text-[#AB152E]" : "text-green-400"}`}>
                                {data.slack.detected ? "⚠ Détecté" : "✓ Non détecté"}
                            </span>
                        </div>
                    </div>

                    {/* Comparatif AD */}
                    <div className="bg-[#150303] rounded-xl p-6">
                        <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">Comparatif Active Directory</p>
                        <div className="grid grid-cols-3 mb-4">
                            <p className="text-white/40 text-xs uppercase tracking-wider">Attaque</p>
                            <p className="text-white/40 text-xs uppercase tracking-wider text-center">netnova-legacy.local</p>
                            <p className="text-white/40 text-xs uppercase tracking-wider text-center">netnova.local</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            {attacks.map((attack) => {
                                const legacy = data.legacy[attack.id];
                                const durci = data.durci[attack.id];
                                return (
                                    <div key={attack.id} className="grid grid-cols-3 items-center">
                                        <p className="text-white text-sm">{attack.label}</p>
                                        <p className={`text-sm text-center ${legacy.detected ? "text-[#AB152E]" : "text-green-400"}`}>
                                            {legacy.detected ? "⚠ Détecté" : "✓ Non détecté"}
                                        </p>
                                        <p className={`text-sm text-center ${durci.detected ? "text-[#AB152E]" : "text-green-400"}`}>
                                            {durci.detected ? `⚠ Détecté (${durci.time || ""})` : "✓ Non détecté"}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Rapport;