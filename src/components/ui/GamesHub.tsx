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
} from "lucide-react";

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

const ARCADE_GAMES: GameCardInfo[] = [
  {
    id: "codesprint",
    title: "Code Sprint & Dev Syntax",
    tagline: "Dual-Compiler Logic & Code Typing Dojo",
    category: "Coding & Logic",
    description: "Dual-pane IDE compiler with problem templates, missing logical blanks, smart auto-indentation, and multi-language challenges across Python, JS, Java, C, C++, HTML, CSS & SQL.",
    icon: Code2,
    badgeColor: "bg-amber-500 text-white",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    metrics: ["8 Languages", "Dual Compiler IDE", "Code Template Blanks", "Real Auto-Indent"],
    buttonText: "START CODE SPRINT",
  },
  {
    id: "academy",
    title: "Touch Typing Academy",
    tagline: "16-Level Curriculum • Left & Right Hand Mastery",
    category: "Structured Training",
    description: "Master home row anchors, 10-finger mapping, dedicated Left-Hand (5 levels) and Right-Hand (5 levels) word drills, and live finger visualizers with donut progress charts.",
    icon: Sparkles,
    badgeColor: "bg-orange-500 text-white",
    gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
    metrics: ["16 Master Levels", "Left & Right Only", "Dual-Hands HUD", "Donut Pie Charts"],
    buttonText: "PLAY TOUCH TYPING ACADEMY",
  },
  {
    id: "blindtyping",
    title: "Blind Typing Dojo",
    tagline: "Pure Audio Dictation • Words Hidden",
    category: "Pure Muscle Memory",
    description: "Lines of easy, generally used words are spoken aloud without showing any text on screen. Listen carefully and type blind directly on your 3D mechanical keyboard.",
    icon: Headphones,
    badgeColor: "bg-fuchsia-500 text-white",
    gradient: "from-fuchsia-500/20 via-purple-500/10 to-transparent",
    metrics: ["Hidden Words", "Spoken Easy Lines", "100% Muscle Memory", "Instant Reveal"],
    buttonText: "PLAY BLIND TYPING",
  },
  {
    id: "speedtest",
    title: "Speed Typing Arena",
    tagline: "Live Words-Per-Minute & Accuracy Benchmark",
    category: "Speed & Reflexes",
    description: "Test your raw typing speed across real-time dynamic sentences. Includes instantaneous WPM calculation, streak tracking, and celebratory confetti effects.",
    icon: Flame,
    badgeColor: "bg-rose-500 text-white",
    gradient: "from-rose-500/20 via-orange-500/10 to-transparent",
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
  theme,
  onSelectGame,
}: {
  theme: KeyboardTheme;
  onSelectGame: (gameId: GameId) => void;
}) {
  const isDark = theme.isDark || theme.category === "Dark";

  return (
    <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 py-8 flex flex-col items-center gap-8 animate-in fade-in duration-300">
      {/* Arcade Header Banner */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6 border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 text-orange-500 text-xs font-black tracking-wider uppercase w-fit border border-orange-500/20">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>3D Keyboard Arcade & Training Hub</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Choose Your Keyboard Game
          </h2>
          <p className={`text-xs sm:text-sm max-w-2xl ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Select from structured academy drills, speed challenges, arcade meteor defense, or auditory memory games powered by your 3D mechanical keyboard.
          </p>
        </div>

        <div className={`flex items-center gap-3 p-3.5 rounded-2xl border shrink-0 ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-200 shadow-xs"
        }`}>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Available Modes</span>
            <span className="text-sm font-black font-mono text-orange-500">
              7 Interactive Games
            </span>
          </div>
        </div>
      </div>

      {/* Featured Primary Card: TOUCH TYPING ACADEMY (HERO GAME) */}
      {(() => {
        const academyGame = ARCADE_GAMES[0];
        const Icon = academyGame.icon;

        return (
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelectGame(academyGame.id)}
            className={`w-full p-6 sm:p-8 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group ${
              isDark
                ? "bg-gradient-to-r from-orange-950/60 via-slate-900/95 to-slate-900 border-orange-500/60 shadow-[0_8px_32px_rgba(234,88,12,0.25)] hover:border-orange-500 ring-1 ring-orange-500/30"
                : "bg-gradient-to-r from-orange-50/80 via-white to-white border-orange-500/60 shadow-[0_8px_32px_rgba(234,88,12,0.1)] hover:border-orange-500 ring-1 ring-orange-300"
            }`}
          >
            {/* Glow accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex-1 flex flex-col gap-3 z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white shadow-xs">
                  FEATURED • FLAGSHIP ACADEMY
                </span>
                <span className="text-xs font-bold text-orange-500">
                  {academyGame.category}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/30 group-hover:rotate-6 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    {academyGame.title}
                  </h3>
                  <p className="text-xs font-bold text-orange-500 mt-0.5">
                    {academyGame.tagline}
                  </p>
                </div>
              </div>

              <p className={`text-xs sm:text-sm leading-relaxed max-w-2xl ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {academyGame.description}
              </p>

              {/* Badges / Metrics */}
              <div className="flex flex-wrap gap-2 pt-1">
                {academyGame.metrics.map((m, mIdx) => (
                  <span
                    key={mIdx}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${
                      isDark
                        ? "bg-slate-950/80 border-slate-800 text-slate-300"
                        : "bg-white border-slate-200 text-slate-700 shadow-2xs"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
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
                  onSelectGame(academyGame.id);
                }}
                className="w-full md:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-xl shadow-orange-500/30 group-hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-orange-400/40"
              >
                <span>{academyGame.buttonText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        );
      })()}

      {/* Grid for Other Arcade Games */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
        {ARCADE_GAMES.slice(1).map((game) => {
          const Icon = game.icon;
          const isLocked = Boolean(game.locked);

          return (
            <motion.div
              key={game.id}
              whileHover={isLocked ? {} : { y: -3 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                if (!isLocked) {
                  onSelectGame(game.id);
                }
              }}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between gap-5 group shadow-xl relative overflow-hidden ${
                isLocked
                  ? isDark
                    ? "bg-slate-900/60 border-slate-800 text-slate-400 opacity-85 cursor-not-allowed"
                    : "bg-slate-50/80 border-slate-200 text-slate-500 opacity-85 cursor-not-allowed"
                  : isDark
                  ? "bg-slate-900/90 border-slate-800 hover:border-slate-700 text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)] cursor-pointer"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.04)] cursor-pointer"
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${game.badgeColor}`}>
                      {game.category}
                    </span>
                    {isLocked && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Lock className="w-3 h-3" />
                        <span>Available Soon</span>
                      </span>
                    )}
                  </div>
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-amber-500/70" />
                  ) : (
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl border ${
                    isLocked
                      ? isDark
                        ? "bg-slate-950 border-slate-800 text-slate-500"
                        : "bg-slate-100 border-slate-200 text-slate-400"
                      : isDark
                      ? "bg-slate-950 border-slate-800 text-orange-400 group-hover:scale-110"
                      : "bg-slate-50 border-slate-200 text-orange-600 group-hover:scale-110"
                  } transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black tracking-tight ${isLocked ? (isDark ? "text-slate-300" : "text-slate-700") : ""}`}>
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold">{game.tagline}</p>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {game.description}
                </p>

                {/* Metrics Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {game.metrics.map((m, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                        isDark
                          ? "bg-slate-950/80 border-slate-800 text-slate-400"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                <button
                  disabled={isLocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLocked) {
                      onSelectGame(game.id);
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black tracking-wide uppercase flex items-center justify-center gap-2 transition-all border ${
                    isLocked
                      ? isDark
                        ? "bg-slate-950/90 border-slate-800 text-slate-500 cursor-not-allowed opacity-90"
                        : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-90"
                      : isDark
                      ? "bg-slate-800/90 border-slate-700 hover:bg-slate-700 text-white cursor-pointer"
                      : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800 cursor-pointer"
                  }`}
                >
                  {isLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-amber-500/90">AVAILABLE SOON</span>
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
