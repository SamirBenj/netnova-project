import { NavLink } from "react-router-dom";

const links = [
    { to: "/slack", label: "Simulation Slack" },
    { to: "/pentest", label: "Pentest AD" },
    { to: "/rapport", label: "Rapport" },
];

function Sidebar() {
    return (
        <aside className="w-64 h-screen bg-[#150303] flex flex-col p-6 gap-2">
            <h1 className="text-white text-xl font-semibold mb-8">NetNova Pentest</h1>
            {links.map((link) => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                        `px-4 py-3 rounded-lg text-sm transition-colors ${isActive
                            ? "bg-[#AB152E] text-white font-medium"
                            : "text-white/60 hover:text-white hover:bg-white/10"
                        }`
                    }
                >
                    {link.label}
                </NavLink>
            ))}
        </aside>
    );
}

export default Sidebar;