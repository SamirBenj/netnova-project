const fakeData = {
    slack: {
        detected: true,
        details: "Comportement suspect détecté — connexion IP inconnue, activité à 03h14",
    },
    legacy: {
        kerberoasting: { detected: false },
        pth: { detected: false },
        bloodhound: { detected: false },
    },
    durci: {
        kerberoasting: { detected: true, time: "2s" },
        pth: { detected: true, time: "4s" },
        bloodhound: { detected: true, time: "1s" },
    },
};

const attacks = [
    { id: "kerberoasting", label: "Kerberoasting" },
    { id: "pth", label: "Pass-the-Hash" },
    { id: "bloodhound", label: "Énumération LDAP" },
];

function Rapport() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-medium mb-2">Rapport comparatif</h1>
                <p className="text-[#150303]/60 text-sm">
                    Résultats de détection Wazuh — legacy vs durci.
                </p>
            </div>

            {/* Slack */}
            <div className="bg-[#150303] rounded-xl p-6">
                <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">Détection Slack</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white text-sm font-medium">Utilisateur suspect</p>
                        <p className="text-white/40 text-xs">{fakeData.slack.details}</p>
                    </div>
                    <span className="text-[#AB152E] text-sm">⚠ Détecté</span>
                </div>
            </div>

            {/* Comparatif AD */}
            <div className="bg-[#150303] rounded-xl p-6">
                <p className="text-white/40 text-xs mb-4 uppercase tracking-wider">Comparatif Active Directory</p>

                {/* Header */}
                <div className="grid grid-cols-3 mb-4">
                    <p className="text-white/40 text-xs uppercase tracking-wider">Attaque</p>
                    <p className="text-white/40 text-xs uppercase tracking-wider text-center">netnova-legacy.local</p>
                    <p className="text-white/40 text-xs uppercase tracking-wider text-center">netnova.local</p>
                </div>

                {/* Rows */}
                <div className="flex flex-col gap-4">
                    {attacks.map((attack) => {
                        const legacy = fakeData.legacy[attack.id as keyof typeof fakeData.legacy];
                        const durci = fakeData.durci[attack.id as keyof typeof fakeData.durci];
                        return (
                            <div key={attack.id} className="grid grid-cols-3 items-center">
                                <p className="text-white text-sm">{attack.label}</p>
                                <p className={`text-sm text-center ${legacy.detected ? "text-[#AB152E]" : "text-green-400"}`}>
                                    {legacy.detected ? "⚠ Détecté" : "✓ Non détecté"}
                                </p>
                                <p className={`text-sm text-center ${durci.detected ? "text-[#AB152E]" : "text-green-400"}`}>
                                    {durci.detected ? `⚠ Détecté (${durci.time})` : "✓ Non détecté"}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Rapport;