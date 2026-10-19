export interface KeyboardTheme {
  id: string;
  name: string;
  tagline: string;
  category: "Light" | "Retro" | "Dark" | "Pastel" | "Vibrant";
  isDark?: boolean;
  previewColors: [string, string, string, string]; // [Chassis, Base, Mod, Accent]
  appBg: string;
  appText: string;
  headerBorder: string;
  cardBg: string;
  cardBorder: string;
  chassis: string;
  plate: string;
  keyBase: string;
  keyMod: string;
  keyAccent: string;
  keyAccentBlue: string;
  keyActive: string;
  accentBadgeBg: string;
  accentBadgeText: string;
  iconBg: string;
  iconColor: string;
}

export const KEYBOARD_THEMES: KeyboardTheme[] = [
  {
    id: "studio-light",
    name: "Studio Light",
    tagline: "Crisp architectural white & slate with solar orange accents",
    category: "Light",
    isDark: false,
    previewColors: ["#ffffff", "#f1f5f9", "#cbd5e1", "#f97316"],
    appBg: "bg-[#f1f5f9]",
    appText: "text-[#0f172a]",
    headerBorder: "border-slate-200",
    cardBg: "bg-white/90",
    cardBorder: "border-slate-200",
    chassis:
      "bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#e2e8f0] border-[#cbd5e1] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.18),0_20px_0_0_#cbd5e1,0_26px_25px_rgba(15,23,42,0.15)]",
    plate: "bg-gradient-to-b from-[#e2e8f0] to-[#cbd5e1] shadow-[inset_0_5px_12px_rgba(15,23,42,0.22)]",
    keyBase:
      "bg-gradient-to-b from-[#ffffff] via-[#ffffff] to-[#f1f5f9] text-[#1e293b] border-[#cbd5e1] border-b-[5px] border-b-[#94a3b8] shadow-[0_4px_10px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]",
    keyMod:
      "bg-gradient-to-b from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] text-[#334155] border-[#94a3b8] border-b-[5px] border-b-[#64748b] shadow-[0_4px_10px_rgba(15,23,42,0.1)]",
    keyAccent:
      "bg-gradient-to-b from-[#f97316] via-[#ea580c] to-[#c2410c] text-white border-[#ea580c] border-b-[5px] border-b-[#9a3412] shadow-[0_4px_12px_rgba(234,88,12,0.3)]",
    keyAccentBlue:
      "bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985] text-white border-[#0369a1] border-b-[5px] border-b-[#0c4a6e] shadow-[0_4px_12px_rgba(2,132,199,0.3)]",
    keyActive:
      "!translate-y-1 !border-b-[1px] !shadow-[0_1px_3px_rgba(15,23,42,0.2),inset_0_2px_4px_rgba(0,0,0,0.15)]",
    accentBadgeBg: "bg-orange-100",
    accentBadgeText: "text-orange-700 border border-orange-200",
    iconBg: "bg-white",
    iconColor: "text-orange-600",
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    tagline: "Obsidian night chassis, electric magenta & laser cyan",
    category: "Dark",
    isDark: true,
    previewColors: ["#0f172a", "#1e293b", "#ec4899", "#06b6d4"],
    appBg: "bg-[#0b0f19]",
    appText: "text-slate-100",
    headerBorder: "border-slate-800",
    cardBg: "bg-slate-900/90",
    cardBorder: "border-slate-800",
    chassis:
      "bg-gradient-to-b from-[#1e1b4b] via-[#0f172a] to-[#020617] border-[#4338ca] shadow-[0_30px_60px_-15px_rgba(236,72,153,0.25),0_20px_0_0_#312e81,0_26px_25px_rgba(6,182,212,0.2)]",
    plate: "bg-gradient-to-b from-[#0f172a] to-[#020617] shadow-[inset_0_5px_12px_rgba(0,0,0,0.8)]",
    keyBase:
      "bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] text-[#38bdf8] border-[#334155] border-b-[5px] border-b-[#1e293b] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]",
    keyMod:
      "bg-gradient-to-b from-[#312e81] via-[#1e1b4b] to-[#0f172a] text-[#f472b6] border-[#4338ca] border-b-[5px] border-b-[#1e1b4b] shadow-[0_4px_10px_rgba(0,0,0,0.5)]",
    keyAccent:
      "bg-gradient-to-b from-[#ec4899] via-[#db2777] to-[#9d174d] text-white border-[#db2777] border-b-[5px] border-b-[#831843] shadow-[0_4px_16px_rgba(236,72,153,0.5)]",
    keyAccentBlue:
      "bg-gradient-to-b from-[#06b6d4] via-[#0891b2] to-[#0e7490] text-white border-[#0891b2] border-b-[5px] border-b-[#155e75] shadow-[0_4px_16px_rgba(6,182,212,0.5)]",
    keyActive:
      "!translate-y-1 !border-b-[1px] !shadow-[0_1px_3px_rgba(236,72,153,0.4),inset_0_2px_4px_rgba(0,0,0,0.6)]",
    accentBadgeBg: "bg-fuchsia-950",
    accentBadgeText: "text-fuchsia-300 border border-fuchsia-800",
    iconBg: "bg-slate-900",
    iconColor: "text-cyan-400",
  },
];
