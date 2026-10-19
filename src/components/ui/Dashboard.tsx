"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Gamepad2,
  Trophy,
  Zap,
  Target,
  Clock,
  ArrowLeft,
  Sparkles,
  Flame,
  Crosshair,
  Headphones,
  BookOpen,
  Code2,
  RotateCcw,
  CheckCircle2,
  Activity,
  Calendar,
  Layers,
  Award,
  Star,
  Command,
} from "lucide-react";
import {
  getUserStats,
  clearUserStats,
  type UserStatsData,
  type GamePlayRecord,
  calculateUserXp,
  type XpStats,
} from "@/lib/userStats";
import { type KeyboardTheme } from "@/lib/themes";

function CodeSprintIcon({ className }: { className?: string }) {
  return (
    <img
      src="/codesprintemblem.png"
      alt="Code Sprint & Dev Syntax"
      className={`object-contain rounded-xs ${className || "w-4 h-4"}`}
    />
  );
}

function BlindTypingIcon({ className }: { className?: string }) {
  return (
    <img
      src="/blindtypingicon.png"
      alt="Blind Typing Dojo"
      className={`object-contain rounded-xs ${className || "w-4 h-4"}`}
    />
  );
}

function SpeedTypingIcon({ className }: { className?: string }) {
  return (
    <img
      src="/speedtypingemblem.png"
      alt="Speed Typing Arena"
      className={`object-contain rounded-xs ${className || "w-4 h-4"}`}
    />
  );
}

function TouchTypingIcon({ className }: { className?: string }) {
  return (
    <img
      src="/touchtypingemblem.png"
      alt="Touch Typing Academy"
      className={`object-contain rounded-xs ${className || "w-4 h-4"}`}
    />
  );
}

function MeteorDefenseIcon({ className }: { className?: string }) {
  return (
    <img
      src="/meteordefenseemblem.png"
      alt="Key Meteor Defense"
      className={`object-contain rounded-xs ${className || "w-4 h-4"}`}
    />
  );
}

function ShortcutsDojoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/shortcutsdojoemblem.png"
      alt="Keyboard Shortcuts Dojo"
      className={`object-contain rounded-xs ${className || "w-4 h-4"}`}
    />
  );
}

const GAME_META: Record<
  string,
  { title: string; category: string; icon: React.ElementType; color: string; barGradient: string }
> = {
  speedtest: {
    title: "Speed Typing Arena",
    category: "Speed & Reflexes",
    icon: SpeedTypingIcon,
    color: "#2563eb",
    barGradient: "from-blue-600 to-indigo-500",
  },
  academy: {
    title: "Touch Typing Academy",
    category: "Curriculum",
    icon: TouchTypingIcon,
    color: "#3b82f6",
    barGradient: "from-blue-500 to-cyan-400",
  },
  codesprint: {
    title: "Code Sprint & Dev Syntax",
    category: "Coding & Logic",
    icon: CodeSprintIcon,
    color: "#60a5fa",
    barGradient: "from-indigo-500 to-blue-500",
  },
  fallingwords: {
    title: "Key Meteor Defense",
    category: "Arcade Action",
    icon: MeteorDefenseIcon,
    color: "#10b981",
    barGradient: "from-emerald-500 to-teal-400",
  },
  blindtyping: {
    title: "Blind Typing Dojo",
    category: "Muscle Memory",
    icon: BlindTypingIcon,
    color: "#2563eb",
    barGradient: "from-blue-600 to-indigo-500",
  },
  shortcuts: {
    title: "Keyboard Shortcuts Dojo",
    category: "Productivity",
    icon: ShortcutsDojoIcon,
    color: "#6366f1",
    barGradient: "from-indigo-500 to-blue-500",
  },
  soundmatrix: {
    title: "Echo Matrix Voice",
    category: "Audio Dictation",
    icon: Headphones,
    color: "#a855f7",
    barGradient: "from-purple-500 to-indigo-500",
  },
};

interface DashboardProps {
  theme: KeyboardTheme;
  loggedInUser?: string | null;
  onBackToGames: () => void;
  onPlayGame?: (gameId: string) => void;
}

export function Dashboard({
  theme,
  loggedInUser,
  onBackToGames,
  onPlayGame,
}: DashboardProps) {
  const [stats, setStats] = useState<UserStatsData>(getUserStats());
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    setStats(getUserStats());
  }, []);

  // Compute key stats
  const totalPlays = stats.totalPlays || 0;
  const gameCounts = Object.entries(stats.gamesCount);
  const xpStats = calculateUserXp(stats);
  
  // Find top played game
  let topGameId = "speedtest";
  let topCount = 0;
  if (totalPlays > 0) {
    gameCounts.forEach(([id, count]) => {
      if (count > topCount) {
        topCount = count;
        topGameId = id;
      }
    });
  }

  const maxPlays = Math.max(...Object.values(stats.gamesCount), 1);

  // Line graph calculations
  const trendData = stats.dailyWpmTrend || [];
  const maxWpm = trendData.length > 0 ? Math.max(...trendData.map((d) => d.wpm), 60) : 60;
  const minWpm = trendData.length > 0 ? Math.max(0, Math.min(...trendData.map((d) => d.wpm)) - 10) : 0;
  const wpmRange = maxWpm - minWpm || 1;

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = trendData.map((d, index) => {
    const x = paddingX + (index / (trendData.length - 1 || 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d.wpm - minWpm) / wpmRange) * chartHeight;
    return { x, y, ...d };
  });

  const linePathD = points.length > 0 ? points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "") : "";

  const areaPathD = points.length > 0
    ? `${linePathD} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`
    : "";

  return (
    <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8 animate-in fade-in duration-300">
      {/* Top Header Navigation Bar (Standardized Suite Header) */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-200">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onBackToGames}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Return to Games Hub"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Games Hub</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 shadow-xs">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">
              User Activity Dashboard
            </span>
          </div>

          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {loggedInUser ? `@${loggedInUser}` : "Guest Session"} • Live Analytics
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Award className="w-3 h-3 text-amber-600" />
            Lvl {xpStats.level} • {xpStats.rankBadge}
          </span>
        </div>

        {/* Tab switcher & Reset Button */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-blue-50/70 border border-blue-200 flex-1 sm:flex-initial">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${activeTab === "overview" ? "text-white" : "text-blue-600"}`} />
              <span>Analytics & Charts</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${activeTab === "history" ? "text-white" : "text-blue-600"}`} />
              <span>Play History ({stats.history.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              const fresh = clearUserStats();
              setStats(fresh);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Reset testing data to zero"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (5 Columns with XP Card) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Total Experience & Level */}
        <div className="p-4 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              Typing XP
            </span>
            <div className="p-2 rounded-xl bg-amber-100/90 text-amber-700 border border-amber-300 shadow-2xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {xpStats.totalXp.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-black text-amber-600 uppercase">XP</span>
            </div>

            {/* Micro Level Progress */}
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-amber-800 flex items-center gap-1 font-mono">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                  Level {xpStats.level}
                </span>
                <span className="text-slate-500 font-mono text-[9.5px]">
                  {xpStats.currentLevelXp}/{xpStats.nextLevelXp}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-amber-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${xpStats.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Total Plays */}
        <div className="p-4 rounded-2xl border-2 border-blue-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Total Games</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {stats.totalPlays}
            </span>
            <span className="text-[11px] text-blue-600 font-bold ml-2">Sessions</span>
          </div>
        </div>

        {/* 3. Most Played Game */}
        <div className="p-4 rounded-2xl border-2 border-blue-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Most Played</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm sm:text-base font-black text-slate-900 truncate">
              {totalPlays > 0 ? (GAME_META[topGameId]?.title || "Speed Arena") : "None Yet"}
            </div>
            <span className="text-[11px] text-slate-600 font-bold font-mono">
              {totalPlays > 0 ? `${topCount} plays (${Math.round((topCount / totalPlays) * 100)}%)` : "0 plays (0%)"}
            </span>
          </div>
        </div>

        {/* 4. Best WPM */}
        <div className="p-4 rounded-2xl border-2 border-blue-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Peak Speed</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {trendData.length > 0 ? Math.max(...trendData.map((d) => d.wpm)) : 0}
            </span>
            <span className="text-xs text-blue-600 font-bold ml-1">WPM</span>
            <span className="text-[11px] text-slate-500 font-medium block">
              {trendData.length > 0 ? "Personal Best" : "No Tests Recorded"}
            </span>
          </div>
        </div>

        {/* 5. Average Accuracy */}
        <div className="p-4 rounded-2xl border-2 border-blue-200 bg-white shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Avg Accuracy</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {trendData.length > 0
                ? `${Math.round(trendData.reduce((acc, d) => acc + d.accuracy, 0) / trendData.length)}%`
                : "0%"}
            </span>
            <span className="text-[11px] text-blue-600 font-bold ml-2">
              {trendData.length > 0 ? "High Precision" : "No Sessions"}
            </span>
          </div>
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Dedicated Typing Mastery & XP Progression Banner Card */}
          <div className="w-full p-5 sm:p-6 rounded-3xl border-2 border-amber-200/90 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 shadow-sm relative overflow-hidden">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-200/25 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
              {/* Left: Avatar Badge & Title */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center">
                    <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-center text-white">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-300">Level</span>
                      <span className="text-2xl sm:text-3xl font-black font-mono leading-none text-white mt-0.5">
                        {xpStats.level}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-slate-950 shadow-xs border-2 border-white">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                      {xpStats.rankBadge} Typist Tier
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {xpStats.totalXp.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Lifetime XP
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 mt-1">
                    {xpStats.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Live dynamic XP engine tracking shortcuts, academy mastery, blind typing precision, and meteor defense.
                  </p>
                </div>
              </div>

              {/* Right: Milestone & Recent Gains */}
              <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
                <div className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-white border border-amber-200/90 shadow-2xs flex flex-col items-center sm:items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Next Milestone</span>
                  <span className="text-sm font-black font-mono text-amber-600">
                    {Number((xpStats.nextLevelXp - xpStats.currentLevelXp).toFixed(2))} XP to Lvl {xpStats.level + 1}
                  </span>
                </div>
                <div className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs flex flex-col items-center sm:items-end">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Round Gain</span>
                  <span className="text-sm font-black font-mono text-emerald-600">
                    +{xpStats.recentGain} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Level Progression Bar */}
            <div className="mt-5 pt-4 border-t border-amber-100/90 flex flex-col gap-2 relative z-10">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5 font-mono">
                  <span>Level {xpStats.level}</span>
                  <span className="text-slate-400 font-normal">({xpStats.currentLevelXp} XP)</span>
                </span>
                <span className="text-amber-700 font-mono font-black">
                  {xpStats.progressPercent}% Completed
                </span>
                <span className="text-slate-700 flex items-center gap-1.5 font-mono">
                  <span>Level {xpStats.level + 1}</span>
                  <span className="text-slate-400 font-normal">({xpStats.nextLevelXp} XP)</span>
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-amber-100/80 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 shadow-sm transition-all duration-500"
                  style={{ width: `${xpStats.progressPercent}%` }}
                />
              </div>

              {/* Daily Attendance Requirement Banner */}
              <div className="mt-2 p-3 rounded-2xl bg-white/95 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl border ${
                      xpStats.breakdown.unplayedGamesToday.length === 0
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-amber-50 text-amber-600 border-amber-200"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Daily Attendance: {xpStats.breakdown.playedGamesToday.length} of {xpStats.breakdown.allActiveGamesCount} Games Played Today
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Rule: All 7 games need to be played everyday, else 5 XP is deducted for each unplayed game.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  {xpStats.breakdown.todayMissedPenalty > 0 ? (
                    <span className="px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black font-mono">
                      -{xpStats.breakdown.todayMissedPenalty} XP Pending Penalty
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black font-mono">
                      ✓ Daily Requirement Met
                    </span>
                  )}
                </div>
              </div>

              {/* Exact Rules XP Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                {/* 1. Shortcuts Dojo */}
                <div className="p-3 rounded-2xl bg-white/95 border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-700 flex items-center gap-1">
                      <Command className="w-3.5 h-3.5 text-blue-600" />
                      Shortcuts Dojo
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-600">0.25 XP/cmd</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-black font-mono text-slate-900">
                      +{xpStats.breakdown.shortcutsXp} XP
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {xpStats.breakdown.shortcutsCountToday} cmds today
                    </span>
                  </div>
                </div>

                {/* 2. Touch Typing Academy */}
                <div className="p-3 rounded-2xl bg-white/95 border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-700 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      Academy Levels
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-600">2 XP/lvl</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-black font-mono text-slate-900">
                      +{xpStats.breakdown.academyXp} XP
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {xpStats.breakdown.academyCompletedCount} completed
                    </span>
                  </div>
                </div>

                {/* 3. Blind Typing */}
                <div className="p-3 rounded-2xl bg-white/95 border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-700 flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                      Blind Typing
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-600">+0.5/+0.25/-0.5</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-black font-mono text-slate-900">
                      {xpStats.breakdown.blindTypingXp >= 0 ? "+" : ""}{xpStats.breakdown.blindTypingXp} XP
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {xpStats.breakdown.blindTypingStats.perfect}P • {xpStats.breakdown.blindTypingStats.minor}M
                    </span>
                  </div>
                </div>

                {/* 4. Meteor Defense */}
                <div className="p-3 rounded-2xl bg-white/95 border border-amber-200/80 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-700 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                      Meteor Defense
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-600">Hearts & Time</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-black font-mono text-slate-900">
                      +{xpStats.breakdown.meteorDefenseXp} XP
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      0.5 - 20 XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Dual Charts Grid: Bar Graph + Line Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. BAR GRAPH: What games are played and how many times played */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border-2 border-blue-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Games Played (Bar Graph)
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Total: {stats.totalPlays} plays
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-6">
                  Frequency of each arcade game played by the user
                </p>

                {/* Vertical Interactive Bars */}
                <div className="h-56 flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 border-b border-blue-100">
                  {Object.entries(GAME_META).map(([id, meta]) => {
                    const count = stats.gamesCount[id] || 0;
                    const heightPercent = Math.max(12, Math.round((count / maxPlays) * 100));
                    const isHovered = hoveredBar === id;

                    return (
                       <div
                        key={id}
                        onMouseEnter={() => setHoveredBar(id)}
                        onMouseLeave={() => setHoveredBar(null)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                      >
                        {/* Tooltip on Hover */}
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -top-10 px-2.5 py-1 rounded-lg bg-white border border-blue-300 text-slate-900 text-[10px] font-bold shadow-md whitespace-nowrap z-20 pointer-events-none"
                          >
                            {meta.title}: <span className="font-mono text-blue-600">{count}</span> plays
                          </motion.div>
                        )}

                        {/* Play Count Label above bar */}
                        <span className="text-[10px] font-mono font-bold text-slate-600 mb-1.5">
                          {count}
                        </span>

                        {/* Bar Pillar */}
                        <div className="w-full max-w-[40px] bg-blue-50 rounded-t-xl overflow-hidden h-full flex flex-col justify-end border-t border-x border-blue-100">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`w-full rounded-t-xl bg-gradient-to-t ${meta.barGradient} transition-all ${
                              isHovered ? "brightness-105 shadow-md" : "opacity-90"
                            }`}
                          />
                        </div>

                        {/* Game Icon & Short Label */}
                        <div className="mt-2.5 flex flex-col items-center gap-1">
                          <meta.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                          <span className="text-[9px] font-bold text-slate-600 group-hover:text-blue-600 truncate max-w-[42px] text-center">
                            {id === "codesprint" ? "Code" : id === "fallingwords" ? "Meteor" : id === "speedtest" ? "Speed" : id === "blindtyping" ? "Blind" : id === "shortcuts" ? "Hotkeys" : id === "academy" ? "Academy" : "Echo"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bar Graph Summary Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  Real-time play counters active
                </span>
                <span className="font-mono font-bold text-slate-700">
                  7 Active Games Tracked
                </span>
              </div>
            </div>

            {/* 2. LINE GRAPH: WPM & Accuracy Performance Trajectory */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border-2 border-blue-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Typing Speed & WPM (Line Graph)
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {trendData.length >= 2
                      ? `${trendData[trendData.length - 1].wpm - trendData[0].wpm >= 0 ? "+" : ""}${trendData[trendData.length - 1].wpm - trendData[0].wpm} WPM Growth`
                      : "Baseline (0 WPM)"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Words-per-minute trajectory plotted across practice sessions
                </p>

                {/* SVG Line Graph or Empty State */}
                <div className="relative w-full h-56 bg-slate-50/70 rounded-2xl border border-blue-150 p-2 flex items-center justify-center overflow-hidden">
                  {trendData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 gap-2">
                      <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-1">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">
                        No Practice Sessions Logged Yet
                      </span>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Complete your first typing test, speed run, or code sprint to plot your live WPM trajectory here!
                      </p>
                    </div>
                  ) : (
                    <>
                      <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="wpmAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                          const y = paddingY + chartHeight * pct;
                          const val = Math.round(maxWpm - pct * wpmRange);
                          return (
                            <g key={idx}>
                              <line
                                x1={paddingX}
                                y1={y}
                                x2={svgWidth - paddingX}
                                y2={y}
                                stroke="#e2e8f0"
                                strokeDasharray="4 4"
                                strokeWidth="1"
                              />
                              <text
                                x={paddingX - 8}
                                y={y + 3}
                                textAnchor="end"
                                fontSize="10"
                                fill="#64748b"
                                fontFamily="monospace"
                              >
                                {val}
                              </text>
                            </g>
                          );
                        })}

                        {/* Filled Area below line */}
                        {areaPathD && <path d={areaPathD} fill="url(#wpmAreaGradient)" />}

                        {/* Main Line */}
                        {linePathD && (
                          <path
                            d={linePathD}
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Interactive Points on Line */}
                        {points.map((p, idx) => {
                          const isHovered = hoveredPoint === idx;
                          return (
                            <g
                              key={idx}
                              onMouseEnter={() => setHoveredPoint(idx)}
                              onMouseLeave={() => setHoveredPoint(null)}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={isHovered ? 6.5 : 4}
                                fill="#ffffff"
                                stroke="#2563eb"
                                strokeWidth="2.5"
                                className="transition-all"
                              />
                              {/* Day Label on X Axis */}
                              <text
                                x={p.x}
                                y={svgHeight - 8}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#64748b"
                                fontWeight="bold"
                              >
                                {p.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Tooltip for Hovered Line Point */}
                      {hoveredPoint !== null && points[hoveredPoint] && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-4 right-4 p-2.5 rounded-xl bg-white text-slate-900 text-xs shadow-md border border-blue-200 flex items-center gap-3 z-20 pointer-events-none"
                        >
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">
                              {points[hoveredPoint].label} Session
                            </div>
                            <div className="font-extrabold text-sm font-mono text-blue-600">
                              {points[hoveredPoint].wpm} WPM
                            </div>
                          </div>
                          <div className="pl-2 border-l border-blue-100">
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Accuracy</div>
                            <div className="font-extrabold text-sm font-mono text-emerald-600">
                              {points[hoveredPoint].accuracy}%
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Line Graph Summary Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Accuracy benchmark:{" "}
                  {trendData.length > 0
                    ? `${Math.round(trendData.reduce((acc, d) => acc + d.accuracy, 0) / trendData.length)}% avg`
                    : "No logs"}
                </span>
                <span className="font-mono text-slate-700 font-bold">
                  Peak: {trendData.length > 0 ? maxWpm : 0} WPM
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Per Game Grid with Action Button */}
          <div className="p-5 sm:p-6 rounded-3xl border-2 border-blue-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Game Performance Directory
                </h3>
                <p className="text-xs text-slate-600">
                  Complete breakdown of games played and user practice stats
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                {Object.keys(GAME_META).length} Modules Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(GAME_META).map(([id, meta]) => {
                const count = stats.gamesCount[id] || 0;
                const percent = totalPlays > 0 ? Math.round((count / totalPlays) * 100) : 0;

                return (
                  <div
                    key={id}
                    className="p-3.5 rounded-2xl border border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between gap-3 group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                        <meta.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                          {meta.title}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {meta.category}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black font-mono text-sm text-slate-900">
                        {count} <span className="text-[10px] font-normal text-slate-500">times</span>
                      </div>
                      <div className="text-[10px] font-bold text-blue-600">
                        {percent}% of total
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* HISTORY TAB */
        <div className="p-5 sm:p-6 rounded-3xl border-2 border-blue-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Recent Gameplay History Log
              </h3>
              <p className="text-xs text-slate-600">
                Detailed record of all rounds and typing tests completed by the user
              </p>
            </div>
          </div>

          <div className="divide-y divide-blue-100">
            {stats.history.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No games played yet. Play any game in the Arcade to log your first session!
              </div>
            ) : (
              stats.history.map((rec) => {
                const meta = GAME_META[rec.gameId];
                const Icon = meta?.icon || Gamepad2;
                const dateStr = new Date(rec.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={rec.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-blue-50/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg text-white"
                        style={{ backgroundColor: meta?.color || "#2563eb" }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {rec.gameTitle}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Played at {dateStr}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      {rec.wpm !== undefined && (
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900">{rec.wpm}</span>
                          <span className="text-[10px] text-slate-500 ml-1">WPM</span>
                        </div>
                      )}
                      {rec.accuracy !== undefined && (
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-600">{rec.accuracy}%</span>
                          <span className="text-[10px] text-slate-500 ml-1">acc</span>
                        </div>
                      )}
                      {rec.score !== undefined && (
                        <div className="text-right">
                          <span className="font-mono font-bold text-blue-600">{rec.score}</span>
                          <span className="text-[10px] text-slate-500 ml-1">pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
