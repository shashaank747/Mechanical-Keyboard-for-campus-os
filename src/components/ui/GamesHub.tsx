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
  X,
  HelpCircle,
  Info,
  Calendar,
  Play,
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

export function MeteorDefenseIcon({ className }: { className?: string }) {
  return (
    <img
      src="/meteordefenseemblem.png"
      alt="Key Meteor Defense"
      className={`object-contain rounded-xl shadow-2xs transition-transform duration-300 ease-out hover:scale-120 ${className || "w-9 h-9"}`}
    />
  );
}

export function ShortcutsDojoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/shortcutsdojoemblem.png"
      alt="Keyboard Shortcuts Dojo"
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
    icon: MeteorDefenseIcon,
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
    description: "Master essential multi-key hotkeys across Excel, Python, Browsers, and OS navigation with live meaning guides and 3D mechanical keyboard visualizers.",
    icon: ShortcutsDojoIcon,
    badgeColor: "bg-indigo-500 text-white",
    gradient: "from-indigo-500/20 via-blue-500/10 to-transparent",
    metrics: ["Developer Hotkeys", "OS Commands", "Interactive Reference", "Fast Recall"],
    buttonText: "ENTER SHORTCUTS DOJO",
  },
];

export interface GameGuideItem {
  id: GameId;
  title: string;
  tagline: string;
  category: string;
  icon: React.ElementType;
  summary: string;
  howToPlay: string[];
  xpRules: string;
  buttonText: string;
}

const GAME_GUIDES: GameGuideItem[] = [
  {
    id: "academy",
    title: "Touch Typing Academy",
    tagline: "16-Level Curriculum • Left & Right Hand Mastery",
    category: "Structured Training",
    icon: TouchTypingIcon,
    summary: "Comprehensive 16-level curriculum teaching proper 10-finger posture, home row tactile bumps, dedicated left & right hand drills, and full keyboard fluency.",
    howToPlay: [
      "Rest your index fingers on the 'F' and 'J' keycap tactile bumps.",
      "Look at screen prompts and glowing key guides on the 3D keyboard without looking down at your hands.",
      "Type the target characters using the recommended fingers to complete each step with high precision.",
    ],
    xpRules: "Earn +2 XP for every level completed (awarded strictly upon level completion).",
    buttonText: "Play Touch Typing Academy",
  },
  {
    id: "codesprint",
    title: "Code Sprint & Dev Syntax",
    tagline: "Dual-Pane Real-Time IDE Compiler & Coding Dojo",
    category: "Coding & Logic",
    icon: CodeSprintIcon,
    summary: "Dual-pane IDE coding simulator designed for developers to practice real-world programming syntax, brackets, punctuation, and code flow across Python, JS, TypeScript, HTML, CSS, C, C++, and SQL.",
    howToPlay: [
      "Select your preferred language (Python, TypeScript, HTML, etc.) and difficulty mode.",
      "Type the real-world code snippet accurately, paying close attention to indentation, quotes, and symbols.",
      "Check the live compiler output panel as your code executes upon successful completion.",
    ],
    xpRules: "Earn +1 XP for every completed code sprint module.",
    buttonText: "Start Code Sprint",
  },
  {
    id: "blindtyping",
    title: "Blind Typing Dojo",
    tagline: "Pure Audio Dictation • Words Hidden",
    category: "Muscle Memory",
    icon: BlindTypingIcon,
    summary: "Speech synthesis dictation challenge where target phrases are hidden from the screen. Train pure auditory-to-fingertip muscle memory.",
    howToPlay: [
      "Listen closely as the voice dictation speaks the target sentence (or click Play Audio to replay).",
      "Type the sentence into the input field completely from memory without looking at visual cues.",
      "Hit Enter to submit and check your accuracy breakdown.",
    ],
    xpRules: "+0.5 XP for 0 errors (Perfect), +0.25 XP for 1 error, and -0.5 XP deduction if more than 1 error.",
    buttonText: "Play Blind Typing",
  },
  {
    id: "speedtest",
    title: "Speed Typing Arena",
    tagline: "Live Words-Per-Minute & Accuracy Benchmark",
    category: "Speed & Reflexes",
    icon: SpeedTypingIcon,
    summary: "Real-time WPM speedometer and live character accuracy benchmark testing raw keyboard speed across curated quotes and phrases.",
    howToPlay: [
      "Read the challenge phrase presented on the screen.",
      "Begin typing into the input bar—the high-precision timer automatically starts on your first keystroke.",
      "Complete the sentence to lock in your live WPM, accuracy percentage, and streak.",
    ],
    xpRules: "Earn +1 XP for each completed speed test phrase.",
    buttonText: "Enter Speed Arena",
  },
  {
    id: "fallingwords",
    title: "Key Meteor Defense",
    tagline: "Falling Words Arcade Survival",
    category: "Arcade Action",
    icon: MeteorDefenseIcon,
    summary: "Action-packed arcade game where incoming word meteors drop from the sky toward your mechanical keyboard perimeter. Blast words before they breach your shield.",
    howToPlay: [
      "Select your mission duration (2 min, 5 min, or Unlimited) and speed pace (Relaxed, Balanced, Rapid).",
      "Type the first letter of a falling word to target it, then finish typing the word to destroy the meteor.",
      "Keep your 3 shield hearts safe—each meteor that breaches your bottom perimeter costs 1 heart.",
    ],
    xpRules: "2min: 3 hearts = 2 XP, 2 hearts = 1 XP, 1 heart = 0.5 XP. 5min: 3 hearts = 5 XP, 2 hearts = 3 XP, 1 heart = 1 XP. Unlimited: >10 min (up to 10 XP), >15 min (15 XP), >20 min (20 XP).",
    buttonText: "Launch Meteor Defense",
  },
  {
    id: "soundmatrix",
    title: "Echo Matrix Voice Dictation",
    tagline: "Switch Acoustic Simon Says & Auditory Recall",
    category: "Auditory Training",
    icon: Headphones,
    summary: "Auditory pattern memory game powered by procedural mechanical switch acoustics. Listen to notes and re-strike the exact keys in sequence.",
    howToPlay: [
      "Click Start and listen carefully to the acoustic switch sound sequence and visual key flashes.",
      "Re-type the exact key sequence on your keyboard in the proper order.",
      "Advance through escalating memory waves as the sequence grows longer.",
    ],
    xpRules: "Earn +1 XP for each completed sequence round.",
    buttonText: "Play Sound Matrix",
  },
  {
    id: "shortcuts",
    title: "Keyboard Shortcuts Dojo",
    tagline: "Developer Productivity & System Hotkeys",
    category: "Productivity",
    icon: ShortcutsDojoIcon,
    summary: "Practice essential IDE, browser, terminal, and operating system shortcuts with hardware key interception and live keyboard visualizers.",
    howToPlay: [
      "Select a hotkeys category (VS Code, Chrome, Terminal, Windows/Mac, Figma).",
      "Read the target command prompt (e.g., 'Ctrl + Shift + P' for Command Palette).",
      "Press the physical combination on your hardware keyboard; the dojo detects and validates your keystrokes live.",
    ],
    xpRules: "Earn +0.25 XP for every shortcut command practiced (resets daily).",
    buttonText: "Enter Shortcuts Dojo",
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

  const [isHelpModalOpen, setIsHelpModalOpen] = React.useState(false);
  const [selectedGuideGameId, setSelectedGuideGameId] = React.useState<GameId | "all">("all");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsHelpModalOpen(false);
      }
    };
    if (isHelpModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHelpModalOpen]);

  const displayedGuides =
    selectedGuideGameId === "all"
      ? GAME_GUIDES
      : GAME_GUIDES.filter((g) => g.id === selectedGuideGameId);

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

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-stretch sm:self-auto justify-end">
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

          <div className="hidden md:flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] shrink-0">
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

          {/* Top-Right Rounded Square Box with "?" */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-blue-200 bg-white hover:border-blue-500 hover:bg-blue-50 text-blue-600 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06),0_2px_6px_-1px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-lg hover:shadow-blue-500/15 hover:scale-105 active:scale-95 transition-all flex items-center justify-center font-black text-xl sm:text-2xl font-mono cursor-pointer shrink-0 group"
            title="How to Play & Game Directory (?)"
            aria-label="How to Play & Game Directory"
          >
            <span className="group-hover:scale-115 transition-transform text-blue-600 font-black font-mono">
              ?
            </span>
          </button>
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
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.06),0_2px_6px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out hover:scale-135 hover:shadow-[0_16px_36px_rgba(37,99,235,0.2)] hover:border-blue-400 hover:z-30 flex items-center justify-center p-2 shrink-0 cursor-pointer">
                  <Icon className="w-12 h-12 transition-transform duration-300 ease-out hover:scale-115" />
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
                  <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center p-2 shrink-0 relative transition-all duration-300 ease-out hover:scale-135 hover:shadow-[0_12px_28px_rgba(37,99,235,0.2)] hover:z-30 cursor-pointer ${
                    isLocked
                      ? "bg-slate-100 border-slate-200 text-slate-400"
                      : "bg-white border-slate-200/90 text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:border-blue-400 group-hover:scale-105"
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

      {/* ========================================================================= */}
      {/* MID-SIZED MODAL: GAME GUIDE & HOW TO PLAY (BLURRED SCREEN BACKGROUND)     */}
      {/* ========================================================================= */}
      {isHelpModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHelpModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
        >
          <div className="max-w-3xl w-full bg-white rounded-3xl border-2 border-blue-200 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden relative ring-1 ring-black/[0.05]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-blue-100 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 via-white to-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-mono font-black text-lg sm:text-xl shadow-md shadow-blue-500/25">
                  ?
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                      Arcade Game Guide & How To Play
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      7 Games
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">
                    Select any game below to review how it works, how to play, and XP scoring rules.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
                title="Close Guide (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Filter Navigation Pills */}
            <div className="px-4 py-2.5 border-b border-blue-100 bg-slate-50/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedGuideGameId("all")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedGuideGameId === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/90"
                }`}
              >
                All 7 Games
              </button>
              {GAME_GUIDES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGuideGameId(g.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    selectedGuideGameId === g.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/90"
                  }`}
                >
                  <g.icon className="w-3.5 h-3.5" />
                  <span>{g.title}</span>
                </button>
              ))}
            </div>

            {/* Scrollable Game Cards Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-4 divide-y divide-blue-100/70">
              {displayedGuides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <div key={guide.id} className="pt-4 first:pt-0 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200 shadow-2xs">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-black text-slate-950">
                              {guide.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                              {guide.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {guide.tagline}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsHelpModalOpen(false);
                          handleLaunchGame(guide.id);
                        }}
                        className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-102 active:scale-98 transition-all shrink-0"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Launch Game</span>
                      </button>
                    </div>

                    {/* Summary Description */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
                      {guide.summary}
                    </p>

                    {/* How to Play Step-by-Step */}
                    <div className="flex flex-col gap-1.5 bg-blue-50/40 p-3 rounded-2xl border border-blue-150">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        How To Play
                      </span>
                      <ol className="flex flex-col gap-1 text-xs text-slate-700 pl-4 list-decimal font-medium">
                        {guide.howToPlay.map((step, idx) => (
                          <li key={idx} className="leading-snug">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* XP Rules Pill */}
                    <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2 text-xs text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 fill-amber-400" />
                      <div>
                        <span className="font-black text-amber-800 mr-1.5">XP Reward:</span>
                        <span className="font-medium text-amber-900">{guide.xpRules}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Deck */}
            <div className="p-3.5 sm:p-4 border-t border-blue-100 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-600">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Daily Attendance Rule:</strong> Play all 7 games everyday to prevent the -5 XP unplayed penalty per game!
                </span>
              </div>

              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="self-stretch sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

