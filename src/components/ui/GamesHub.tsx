"use client";

import React from "react";
import { motion } from "framer-motion";
import { type KeyboardTheme } from "@/lib/themes";
import {
  Sparkles,
  Flame,
  Crosshair,
  Headphones,
  BookOpen,
  ArrowRight,
  Trophy,
  Zap,
  Gamepad2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Code2,
  Settings,
  BarChart3,
} from "lucide-react";
import { getLatestPlayedGameId, setLatestPlayedGameId } from "@/lib/userStats";

export type GameId = "academy" | "codesprint" | "blindtyping" | "speedtest" | "fallingwords" | "soundmatrix" | "shortcuts";

export interface GameCardInfo {
  id: GameId;
  title: string;
  tagline: string;
  category: string;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
  gradient: string;
  metrics: string[];
  buttonText: string;
  locked?: boolean;
  lockedLabel?: string;
}

export function CodeSprintIcon({ className }: { className?: string }) {
  return (
    <img
      src="/codesprintemblem.png"
      alt="Code Sprint & Dev Syntax"
      className={`object-contain rounded-xl shadow-2xs transition-transform duration-300 ease-out hover:scale-120 ${className || "w-9 h-9"}`}
    />
  );
}

export function BlindTypingIcon({ className }: { className?: string }) {
  return (
    <img
      src="/blindtypingicon.png"
      alt="Blind Typing Dojo"
      className={`object-contain rounded-xl shadow-2xs transition-transform duration-300 ease-out hover:scale-120 ${className || "w-9 h-9"}`}
    />
  );
}

export function SpeedTypingIcon({ className }: { className?: string }) {
  return (
    <img
      src="/speedtypingemblem.png"
      alt="Speed Typing Arena"
      className={`object-contain rounded-xl shadow-2xs transition-transform duration-300 ease-out hover:scale-120 ${className || "w-9 h-9"}`}
    />
  );
}

export function TouchTypingIcon({ className }: { className?: string }) {
  return (
    <img
      src="/touchtypingemblem.png"
      alt="Touch Typing Academy"
      className={`object-contain rounded-xl shadow-2xs transition-transform duration-300 ease-out hover:scale-120 ${className || "w-9 h-9"}`}
    />
  );
}

const ARCADE_GAMES: GameCardInfo[] = [
  {
    id: "codesprint",
    title: "Code Sprint & Dev Syntax",
    tagline: "Dual-Compiler Logic & Code Typing Dojo",
    category: "Coding & Logic",
    description: "Dual-pane IDE compiler with problem templates, missing logical blanks, smart auto-indentation, and multi-language challenges across Python, JS, Java, C, C++, HTML, CSS & SQL.",
    icon: CodeSprintIcon,
    badgeColor: "bg-blue-600 text-white",
    gradient: "from-blue-600/20 via-indigo-600/10 to-transparent",
    metrics: ["8 Languages", "Dual Compiler IDE", "Code Template Blanks", "Real Auto-Indent"],
    buttonText: "START CODE SPRINT",
  },
  {
    id: "academy",
    title: "Touch Typing Academy",
    tagline: "16-Level Curriculum • Left & Right Hand Mastery",
    category: "Structured Training",
    description: "Master home row anchors, 10-finger mapping, dedicated Left-Hand (5 levels) and Right-Hand (5 levels) word drills, and live finger visualizers with donut progress charts.",
    icon: TouchTypingIcon,
    badgeColor: "bg-blue-500 text-white",
    gradient: "from-blue-500/20 via-sky-500/10 to-transparent",
    metrics: ["16 Master Levels", "Left & Right Only", "Dual-Hands HUD", "Donut Pie Charts"],
    buttonText: "PLAY TOUCH TYPING ACADEMY",
  },
  {
    id: "blindtyping",
    title: "Blind Typing Dojo",
    tagline: "Pure Audio Dictation • Words Hidden",
    category: "Pure Muscle Memory",
    description: "Lines of easy, generally used words are spoken aloud without showing any text on screen. Listen carefully and type blind directly on your 3D mechanical keyboard.",
    icon: BlindTypingIcon,
    badgeColor: "bg-blue-600 text-white",
    gradient: "from-blue-600/20 via-indigo-500/10 to-transparent",
    metrics: ["Hidden Words", "Spoken Easy Lines", "100% Muscle Memory", "Instant Reveal"],
    buttonText: "PLAY BLIND TYPING",
  },
  {
    id: "speedtest",
    title: "Speed Typing Arena",
    tagline: "Live Words-Per-Minute & Accuracy Benchmark",
    category: "Speed & Reflexes",
    description: "Test your raw typing speed across real-time dynamic sentences. Includes instantaneous WPM calculation, streak tracking, and celebratory confetti effects.",
    icon: SpeedTypingIcon,
    badgeColor: "bg-blue-600 text-white",
    gradient: "from-blue-600/20 via-indigo-500/10 to-transparent",
    metrics: ["Live WPM Meter", "Real-Time Accuracy", "Instant Acoustics", "Streak Tracker"],
    buttonText: "ENTER SPEED ARENA",
  },
  {
    id: "fallingwords",
    title: "Key Meteor Defense",
    tagline: "Falling Words Arcade Survival",
    category: "Arcade Action",
    description: "Blast falling words and keycaps before they breach your mechanical keyboard perimeter! Keep your 3 lives safe and chain score combos with high-speed typing.",
    icon: Crosshair,
    badgeColor: "bg-emerald-500 text-white",
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    metrics: ["Falling Words", "3 Shield Lives", "Combo Multipliers", "Wave Escalation"],
    buttonText: "LAUNCH METEOR DEFENSE",
  },
  {
    id: "soundmatrix",
    title: "Echo Matrix Voice Dictation",
    tagline: "Speech Synthesis & Audio Dictation Typing",
    category: "Auditory Training",
    description: "Listen as the website reads aloud letters and spaces continuously (or speaks full words). Type along in rhythm on your 3D mechanical keyboard.",
    icon: Headphones,
    badgeColor: "bg-purple-500 text-white",
    gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    metrics: ["Voice Dictation", "Spell & 'Space'", "Read Full Words", "Paced Speeds"],
    buttonText: "AVAILABLE SOON",
    locked: true,
    lockedLabel: "Available Soon",
  },
  {
    id: "shortcuts",
    title: "Keyboard Shortcuts Dojo",
    tagline: "Power User & Developer Hotkeys",
    category: "Productivity",
    description: "Master essential multi-key hotkeys, window management shortcuts, developer command palettes, and navigation combinations on your 3D mechanical keyboard.",
    icon: BookOpen,
    badgeColor: "bg-indigo-500 text-white",
    gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
    metrics: ["Developer Hotkeys", "OS Commands", "Interactive Reference", "Fast Recall"],
    buttonText: "ENTER SHORTCUTS DOJO",
  },
];

export function GamesHub({
  onSelectGame,
  onOpenDashboard,
}: {
  theme?: KeyboardTheme;
  onSelectGame: (gameId: GameId) => void;
  onOpenDashboard?: () => void;
}) {
  const [latestGameId, setLatestGameId] = React.useState<GameId>(() => {
    return (getLatestPlayedGameId() as GameId) || "codesprint";
  });

  React.useEffect(() => {
    const current = (getLatestPlayedGameId() as GameId) || "codesprint";
    setLatestGameId(current);

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ gameId: GameId }>;
      if (custom.detail?.gameId) {
        setLatestGameId(custom.detail.gameId);
      } else {
        const updated = (getLatestPlayedGameId() as GameId) || "codesprint";
        setLatestGameId(updated);
      }
    };

    window.addEventListener("setu_latest_game_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("setu_latest_game_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const heroGame = ARCADE_GAMES.find((g) => g.id === latestGameId) || ARCADE_GAMES[0];
  const otherGames = ARCADE_GAMES.filter((g) => g.id !== heroGame.id);

  const handleLaunchGame = (gameId: GameId) => {
    setLatestPlayedGameId(gameId);
    setLatestGameId(gameId);
    onSelectGame(gameId);
  };

  return (
    <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 py-8 flex flex-col items-center gap-8 animate-in fade-in duration-300">
      {/* Arcade Header Banner */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6 border-blue-100">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black tracking-wider uppercase w-fit border border-blue-200 shadow-2xs">
            <Gamepad2 className="w-3.5 h-3.5 text-blue-600" />
            <span>3D Keyboard Arcade & Training Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            Choose Your Keyboard Game
          </h2>
          <p className="text-xs sm:text-sm max-w-2xl text-slate-600">
            Select from structured academy drills, speed challenges, arcade meteor defense, or auditory memory games powered by your 3D mechanical keyboard.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto">
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 hover:bg-white text-slate-800 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_10px_24px_-4px_rgba(37,99,235,0.15)] hover:-translate-y-0.5 transition-all cursor-pointer group"
              title="Open User Activity Dashboard"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">User Data</span>
                <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  Dashboard
                </span>
              </div>
            </button>
          )}

          <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] shrink-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)]">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Available Modes</span>
              <span className="text-sm font-black font-mono text-blue-600">
                7 Interactive Games
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Primary Card: DYNAMIC LATEST PLAYED GAME (HERO GAME) */}
      {(() => {
        const Icon = heroGame.icon;
        const isRecentlyPlayed = heroGame.id === latestGameId;

        return (
          <motion.div
            key={heroGame.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleLaunchGame(heroGame.id)}
            className="w-full rounded-3xl border border-slate-200/90 transition-all duration-300 cursor-pointer relative overflow-hidden bg-white shadow-[0_14px_38px_-6px_rgba(15,23,42,0.09),0_4px_12px_-2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_26px_55px_-10px_rgba(37,99,235,0.2),0_10px_20px_-5px_rgba(15,23,42,0.06)] hover:border-blue-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 group ring-1 ring-black/[0.03]"
          >
            {/* Top Bevel Colored Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

            {/* Subtle soft gradient surface accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="flex-1 flex flex-col gap-3.5 z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.3)] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{isRecentlyPlayed ? "RECENTLY PLAYED • LATEST GAME" : "FEATURED • FLAGSHIP ACADEMY"}</span>
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {heroGame.category}
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300 ease-out hover:scale-135 hover:shadow-[0_16px_36px_rgba(37,99,235,0.45)] hover:z-30 flex items-center justify-center p-2 shrink-0 cursor-pointer">
                  <Icon className="w-11 h-11 transition-transform duration-300 ease-out hover:scale-115" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    {heroGame.title}
                  </h3>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">
                    {heroGame.tagline}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed max-w-2xl text-slate-600">
                {heroGame.description}
              </p>

              {/* Badges / Metrics */}
              <div className="flex flex-wrap gap-2 pt-1">
                {heroGame.metrics.map((m, mIdx) => (
                  <span
                    key={mIdx}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold border border-slate-200/90 bg-slate-50/90 text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{m}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Launch Button */}
            <div className="shrink-0 z-10 w-full md:w-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLaunchGame(heroGame.id);
                }}
                className="w-full md:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_6px_20px_rgba(37,99,235,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_10px_26px_rgba(37,99,235,0.5)] group-hover:scale-103 active:scale-97 transition-all cursor-pointer ring-2 ring-blue-400/50"
              >
                <span>{heroGame.buttonText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        );
      })()}

      {/* Grid for Other Arcade Games */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {otherGames.map((game) => {
          const Icon = game.icon;
          const isLocked = Boolean(game.locked);

          return (
            <motion.div
              key={game.id}
              whileHover={isLocked ? {} : { y: -5 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                if (!isLocked) {
                  handleLaunchGame(game.id);
                }
              }}
              className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden ${
                isLocked
                  ? "bg-slate-50/90 border-slate-200 text-slate-400 opacity-80 cursor-not-allowed shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
                  : "bg-white border-slate-200/90 hover:border-blue-400 text-slate-900 cursor-pointer shadow-[0_10px_28px_-6px_rgba(15,23,42,0.08),0_4px_10px_-2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_22px_45px_-10px_rgba(37,99,235,0.18),0_8px_18px_-4px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.03]"
              }`}
            >
              {/* Card Main Body */}
              <div className="p-6 sm:p-7 flex flex-col gap-4 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-2xs ${game.badgeColor}`}>
                      {game.category}
                    </span>
                    {isLocked && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                        <Lock className="w-3 h-3" />
                        <span>Available Soon</span>
                      </span>
                    )}
                  </div>
                  {isLocked && (
                    <Lock className="w-5 h-5 text-amber-500/70" />
                  )}
                </div>

                <div className="flex items-center gap-3.5">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center p-2 shrink-0 relative transition-all duration-300 ease-out hover:scale-135 hover:shadow-[0_12px_28px_rgba(37,99,235,0.35)] hover:z-30 cursor-pointer ${
                    isLocked
                      ? "bg-slate-100 border-slate-200 text-slate-400"
                      : "bg-gradient-to-b from-blue-50 to-blue-100/70 border-blue-200 text-blue-600 shadow-[0_2px_6px_rgba(37,99,235,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] group-hover:scale-105"
                  } transition-all duration-200`}>
                    <Icon className="w-10 h-10 transition-transform duration-300 ease-out hover:scale-115" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black tracking-tight group-hover:text-blue-600 transition-colors ${isLocked ? "text-slate-600" : "text-slate-900"}`}>
                      {game.title}
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">{game.tagline}</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                  {game.description}
                </p>

                {/* Metrics Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1 mt-auto">
                  {game.metrics.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-bold border border-slate-200/90 bg-slate-50 text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dedicated Card Footer Deck */}
              <div className="px-6 sm:px-7 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center">
                <button
                  disabled={isLocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLocked) {
                      handleLaunchGame(game.id);
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-200 border ${
                    isLocked
                      ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-90"
                      : "bg-white border-blue-200/90 hover:bg-blue-600 hover:border-blue-600 text-blue-700 hover:text-white shadow-[0_2px_6px_rgba(15,23,42,0.04)] hover:shadow-[0_6px_18px_rgba(37,99,235,0.35)] active:translate-y-0.5 cursor-pointer"
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-amber-600">AVAILABLE SOON</span>
                    </>
                  ) : (
                    <>
                      <span>{game.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

