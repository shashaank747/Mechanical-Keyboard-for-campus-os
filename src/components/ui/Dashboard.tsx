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
} from "lucide-react";
import { getUserStats, type UserStatsData, type GamePlayRecord } from "@/lib/userStats";
import { type KeyboardTheme } from "@/lib/themes";

const GAME_META: Record<
  string,
  { title: string; category: string; icon: React.ElementType; color: string; barGradient: string }
> = {
  speedtest: {
    title: "Speed Typing Arena",
    category: "Speed & Reflexes",
    icon: Flame,
    color: "#f43f5e",
    barGradient: "from-rose-500 to-orange-500",
  },
  academy: {
    title: "Touch Typing Academy",
    category: "Curriculum",
    icon: Sparkles,
    color: "#f97316",
    barGradient: "from-orange-500 to-amber-500",
  },
  codesprint: {
    title: "Code Sprint & Dev Syntax",
    category: "Coding & Logic",
    icon: Code2,
    color: "#eab308",
    barGradient: "from-amber-500 to-yellow-400",
  },
  fallingwords: {
    title: "Key Meteor Defense",
    category: "Arcade Action",
    icon: Crosshair,
    color: "#10b981",
    barGradient: "from-emerald-500 to-teal-400",
  },
  blindtyping: {
    title: "Blind Typing Dojo",
    category: "Muscle Memory",
    icon: Headphones,
    color: "#d946ef",
    barGradient: "from-fuchsia-500 to-pink-500",
  },
  shortcuts: {
    title: "Shortcuts Dojo",
    category: "Productivity",
    icon: BookOpen,
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
  const totalPlays = stats.totalPlays || 1;
  const gameCounts = Object.entries(stats.gamesCount);
  
  // Find top played game
  let topGameId = "speedtest";
  let topCount = 0;
  gameCounts.forEach(([id, count]) => {
    if (count > topCount) {
      topCount = count;
      topGameId = id;
    }
  });

  const maxPlays = Math.max(...Object.values(stats.gamesCount), 1);

  // Line graph calculations
  const trendData = stats.dailyWpmTrend || [];
  const maxWpm = Math.max(...trendData.map((d) => d.wpm), 80);
  const minWpm = Math.max(0, Math.min(...trendData.map((d) => d.wpm), 30) - 10);
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

  const linePathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaPathD = points.length > 0
    ? `${linePathD} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`
    : "";

  return (
    <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8 animate-in fade-in duration-300">
      {/* Top Navigation & Profile Bar */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5 border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGames}
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-orange-500 transition-all shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Return to Games Hub"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Games</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                User Activity Dashboard
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 uppercase">
                Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {loggedInUser ? `Logged in as @${loggedInUser}` : "Guest Player Session"} • Real-time game history & metrics
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-orange-500" />
            <span>Analytics & Charts</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "history"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>Play History ({stats.history.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Plays */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Games Played</span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {stats.totalPlays}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold ml-2">Active sessions</span>
          </div>
        </div>

        {/* Most Played Game */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Most Played</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-sm sm:text-base font-black text-slate-900 truncate">
              {GAME_META[topGameId]?.title || "Speed Arena"}
            </div>
            <span className="text-[11px] text-slate-500 font-bold font-mono">
              {topCount} times played ({Math.round((topCount / totalPlays) * 100)}%)
            </span>
          </div>
        </div>

        {/* Best WPM */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Peak Speed</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {Math.max(...trendData.map((d) => d.wpm), 78)}
            </span>
            <span className="text-xs text-rose-500 font-bold ml-1">WPM</span>
            <span className="text-[11px] text-slate-400 font-medium block">Personal Best</span>
          </div>
        </div>

        {/* Average Accuracy */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Avg Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {Math.round(trendData.reduce((acc, d) => acc + d.accuracy, 0) / (trendData.length || 1))}%
            </span>
            <span className="text-[11px] text-emerald-600 font-bold ml-2">High Precision</span>
          </div>
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Dual Charts Grid: Bar Graph + Line Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. BAR GRAPH: What games are played and how many times played */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
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
                <p className="text-xs text-slate-500 mb-6">
                  Frequency of each arcade game played by the user
                </p>

                {/* Vertical Interactive Bars */}
                <div className="h-56 flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-100">
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
                            className="absolute -top-10 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-lg whitespace-nowrap z-20 pointer-events-none"
                          >
                            {meta.title}: <span className="font-mono text-orange-400">{count}</span> plays
                          </motion.div>
                        )}

                        {/* Play Count Label above bar */}
                        <span className="text-[10px] font-mono font-bold text-slate-500 mb-1.5">
                          {count}
                        </span>

                        {/* Bar Pillar */}
                        <div className="w-full max-w-[40px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex flex-col justify-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`w-full rounded-t-xl bg-gradient-to-t ${meta.barGradient} transition-all ${
                              isHovered ? "brightness-110 shadow-md" : "opacity-90"
                            }`}
                          />
                        </div>

                        {/* Game Icon & Short Label */}
                        <div className="mt-2.5 flex flex-col items-center gap-1">
                          <meta.icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-orange-500 transition-colors" />
                          <span className="text-[9px] font-bold text-slate-500 truncate max-w-[42px] text-center">
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
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                  Real-time play counters active
                </span>
                <span className="font-mono font-bold text-slate-700">
                  7 Active Games Tracked
                </span>
              </div>
            </div>

            {/* 2. LINE GRAPH: WPM & Accuracy Performance Trajectory */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Typing Speed & WPM (Line Graph)
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    +36 WPM Growth
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Words-per-minute trajectory plotted across practice sessions
                </p>

                {/* SVG Line Graph */}
                <div className="relative w-full h-56 bg-slate-50/50 rounded-2xl border border-slate-100 p-2 flex items-center justify-center overflow-hidden">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="wpmAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
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
                            fill="#94a3b8"
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
                        stroke="#ea580c"
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
                            stroke="#ea580c"
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
                      className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-lg border border-slate-800 flex items-center gap-3 z-20 pointer-events-none"
                    >
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          {points[hoveredPoint].label} Session
                        </div>
                        <div className="font-extrabold text-sm font-mono text-orange-400">
                          {points[hoveredPoint].wpm} WPM
                        </div>
                      </div>
                      <div className="pl-2 border-l border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</div>
                        <div className="font-extrabold text-sm font-mono text-emerald-400">
                          {points[hoveredPoint].accuracy}%
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Line Graph Summary Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Accuracy benchmark: 96% avg
                </span>
                <span className="font-mono text-slate-700 font-bold">
                  Peak: {maxWpm} WPM
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Per Game Grid with Action Button */}
          <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Game Performance Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Complete breakdown of games played and user practice stats
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
                {Object.keys(GAME_META).length} Modules Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(GAME_META).map(([id, meta]) => {
                const count = stats.gamesCount[id] || 0;
                const percent = Math.round((count / totalPlays) * 100);

                return (
                  <div
                    key={id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-xl text-white shadow-xs"
                        style={{ backgroundColor: meta.color }}
                      >
                        <meta.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors">
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
                      <div className="text-[10px] font-bold text-orange-600">
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
        <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Recent Gameplay History Log
              </h3>
              <p className="text-xs text-slate-500">
                Detailed record of all rounds and typing tests completed by the user
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
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
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg text-white"
                        style={{ backgroundColor: meta?.color || "#f97316" }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          {rec.gameTitle}
                        </div>
                        <div className="text-[10px] text-slate-400">
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
                          <span className="text-[10px] text-slate-400 ml-1">acc</span>
                        </div>
                      )}
                      {rec.score !== undefined && (
                        <div className="text-right">
                          <span className="font-mono font-bold text-orange-600">{rec.score}</span>
                          <span className="text-[10px] text-slate-400 ml-1">pts</span>
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
