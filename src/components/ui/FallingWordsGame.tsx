"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Keyboard } from "./keyboard";
import { type KeyboardTheme } from "@/lib/themes";
import { soundEngine } from "@/lib/sound";
import {
  Sparkles,
  Trophy,
  Flame,
  RotateCcw,
  ArrowLeft,
  Heart,
  Zap,
  ShieldAlert,
  Play,
  Crosshair,
  Timer,
  Clock,
  Gauge,
  Hourglass,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { updateStudentProgress } from "@/lib/db";
import { recordMeteorDefenseResult } from "@/lib/userStats";

export type DurationOption = "2min" | "5min" | "unlimited";
export type EndReason = "time_up" | "lives_depleted";
export type SpeedPace = "relaxed" | "balanced" | "rapid";

export interface PaceConfig {
  id: SpeedPace;
  label: string;
  sub: string;
  badge: string;
  description: string;
  baseSpeed: number; // percentage of arena height per second
  waveStep: number;  // added speed per wave
  randomVariation: number;
  initialSpawnInterval: number; // ms
  minSpawnInterval: number; // ms
  spawnWaveReduction: number; // ms reduction per wave
}

export const SPEED_PACES: Record<SpeedPace, PaceConfig> = {
  relaxed: {
    id: "relaxed",
    label: "Relaxed",
    sub: "Flow / Gentle",
    badge: "🍃 Relaxed Pace",
    description: "Gentle falling speed (~15s fall time). Ideal for getting into the rhythm, warming up, and casual flow.",
    baseSpeed: 4.8,
    waveStep: 0.6,
    randomVariation: 0.8,
    initialSpawnInterval: 4800,
    minSpawnInterval: 2400,
    spawnWaveReduction: 250,
  },
  balanced: {
    id: "balanced",
    label: "Balanced",
    sub: "Recommended",
    badge: "⚡ Balanced Pace",
    description: "Smooth starting speed (~12s fall time) with gradual wave ramp-up. Perfect balance of flow and challenge.",
    baseSpeed: 6.2,
    waveStep: 0.85,
    randomVariation: 1.0,
    initialSpawnInterval: 4200,
    minSpawnInterval: 1800,
    spawnWaveReduction: 280,
  },
  rapid: {
    id: "rapid",
    label: "Rapid",
    sub: "Arcade Sprint",
    badge: "🔥 Rapid Pace",
    description: "High-speed arcade action (~8s fall time) for sharp reflexes and seasoned speed typists.",
    baseSpeed: 9.2,
    waveStep: 1.3,
    randomVariation: 1.4,
    initialSpawnInterval: 3200,
    minSpawnInterval: 1400,
    spawnWaveReduction: 300,
  },
};

interface FallingWord {
  id: string;
  word: string;
  matchedChars: number;
  xPercent: number; // 10% to 85%
  yPercent: number; // 0% to 100%
  speed: number;
  color: string;
}

// Progressive Tiered Words:
// Wave 1 features accessible 3-4 letter words so players immediately hit keys and enter the flow!
const WORDS_SHORT = [
  "KEY", "CAP", "RUN", "FLOW", "SKY", "TAP", "CODE", "NEON", "GLOW",
  "STEM", "CORE", "CHIP", "RGB", "WAVE", "TYPE", "ZOOM", "MINT", "BEAT",
  "LINE", "WARP", "SYNC", "GRID", "ECHO", "FIRE", "BLUE", "FAST"
];

const WORDS_MEDIUM = [
  "CLICK", "SPACE", "ENTER", "SPEED", "SHIFT", "LASER", "PIXEL", "TURBO",
  "BLAST", "POWER", "SOUND", "LUBED", "GHOST", "PULSE", "SMOKE", "FLASH",
  "GAMER", "BOARD", "SWITCH", "DRIVE", "SPRING"
];

const WORDS_ADVANCED = [
  "TACTILE", "LINEAR", "MECHANIC", "KEYCAP", "MATRIX", "ACOUSTIC",
  "CHERRY", "OVERDRIVE", "VELOCITY", "KEYSTROKE", "PERIMETER"
];

const COLORS = ["#f97316", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#eab308"];

export function FallingWordsGame({
  theme,
  colorZones,
  onOpenThemeSidebar: _onOpenThemeSidebar,
  onBackToHub,
}: {
  theme: KeyboardTheme;
  colorZones?: boolean;
  onOpenThemeSidebar?: () => void;
  onBackToHub: () => void;
}) {
  const isDark = false;

  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>("2min");
  const [activeDuration, setActiveDuration] = useState<DurationOption>("2min");
  const [selectedPace, setSelectedPace] = useState<SpeedPace>("balanced");
  const [activePace, setActivePace] = useState<SpeedPace>("balanced");
  const [endReason, setEndReason] = useState<EndReason>("lives_depleted");
  const [displayTimer, setDisplayTimer] = useState<string>("02:00:00");

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [wave, setWave] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [wordsDestroyed, setWordsDestroyed] = useState<number>(0);
  const [totalKeysTyped, setTotalKeysTyped] = useState<number>(0);
  const [totalErrors, setTotalErrors] = useState<number>(0);
  const [finalDurationSecs, setFinalDurationSecs] = useState<number>(0);
  const [finalWpm, setFinalWpm] = useState<number>(0);
  const [finalAccuracy, setFinalAccuracy] = useState<number>(100);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  const [activeWords, setActiveWords] = useState<FallingWord[]>([]);
  const [targetWordId, setTargetWordId] = useState<string | null>(null);

  const startTimeRef = useRef<number>(0);
  const durationModeRef = useRef<DurationOption>("2min");
  const paceRef = useRef<SpeedPace>("balanced");
  const livesRef = useRef<number>(3);
  livesRef.current = lives;
  const totalKeysTypedRef = useRef<number>(0);
  const totalErrorsRef = useRef<number>(0);
  const wordsDestroyedRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const waveRef = useRef<number>(wave);
  waveRef.current = wave;
  const scoreRef = useRef<number>(score);
  scoreRef.current = score;
  const activeWordsRef = useRef<FallingWord[]>(activeWords);
  activeWordsRef.current = activeWords;
  const targetWordIdRef = useRef<string | null>(targetWordId);
  targetWordIdRef.current = targetWordId;

  // Format MM:SS helper
  const formatDurationDisplay = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${String(secs).padStart(2, "0")}s`;
  };

  // Spawns a word at the top with randomized horizontal position & speed based on wave & pace
  const spawnWord = useCallback(() => {
    const currentWave = waveRef.current;
    
    // Progressive word difficulty:
    // Wave 1 gives concise 3-4 letter words to quickly get fingers in motion and into flow
    let wordPool = WORDS_SHORT;
    const roll = Math.random();
    if (currentWave === 1) {
      wordPool = roll < 0.85 ? WORDS_SHORT : WORDS_MEDIUM;
    } else if (currentWave === 2) {
      wordPool = roll < 0.45 ? WORDS_SHORT : roll < 0.9 ? WORDS_MEDIUM : WORDS_ADVANCED;
    } else {
      wordPool = roll < 0.2 ? WORDS_SHORT : roll < 0.7 ? WORDS_MEDIUM : WORDS_ADVANCED;
    }

    const word = wordPool[Math.floor(Math.random() * wordPool.length)];
    const id = `${word}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    // Horizontal random placement bounded to 12% - 78% so words stay cleanly inside the arena
    const xPercent = 12 + Math.random() * 66;

    const pace = SPEED_PACES[paceRef.current];
    // Smooth, gentle starting speed that scales comfortably per wave
    const speed = pace.baseSpeed + (currentWave - 1) * pace.waveStep + Math.random() * pace.randomVariation;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    setActiveWords((prev) => [
      ...prev,
      { id, word, matchedChars: 0, xPercent, yPercent: 0, speed, color },
    ]);
  }, []);

  // End Game Handler with exact mathematical WPM and stats calculation
  const handleEndGame = useCallback((reason: EndReason) => {
    setGameState("gameover");
    setEndReason(reason);

    const elapsedMs = Math.max(1000, performance.now() - startTimeRef.current);
    const elapsedSecs = Math.max(1, Math.round(elapsedMs / 1000));
    setFinalDurationSecs(elapsedSecs);

    const keys = totalKeysTypedRef.current;
    const errors = totalErrorsRef.current;
    const attempts = keys + errors;
    const acc = attempts > 0 ? Math.round((keys / attempts) * 100) : 100;
    setFinalAccuracy(acc);

    // Standard Typing Formula: 1 word = 5 keystrokes
    // WPM = (Keystrokes / 5) / (Elapsed Time in Minutes)
    const durationMinutes = Math.max(elapsedSecs / 60, 0.05);
    const calculatedWpm = Math.round((keys / 5) / durationMinutes);
    setFinalWpm(calculatedWpm);

    updateStudentProgress({
      gameType: "meteorDefense",
      details: {
        score: scoreRef.current,
        wave: waveRef.current,
        wpm: calculatedWpm,
        keysTyped: keys,
        duration: elapsedSecs,
      },
    });

    const remainingHearts = reason === "lives_depleted" ? 0 : livesRef.current;
    try {
      const res = recordMeteorDefenseResult({
        duration: durationModeRef.current,
        heartsRemaining: remainingHearts,
        elapsedSecs,
        score: scoreRef.current,
        wpm: calculatedWpm,
        accuracy: acc,
      });
      setEarnedXp(res.xpGained);
    } catch {}

    if (reason === "time_up") {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
      });
    }
  }, []);

  // Start game with selected duration & speed pace
  const startGame = (
    duration: DurationOption = selectedDuration,
    pace: SpeedPace = selectedPace
  ) => {
    setActiveDuration(duration);
    durationModeRef.current = duration;
    setActivePace(pace);
    paceRef.current = pace;
    setScore(0);
    setLives(3);
    livesRef.current = 3;
    setEarnedXp(0);
    setWave(1);
    waveRef.current = 1;
    setStreak(0);
    setWordsDestroyed(0);
    wordsDestroyedRef.current = 0;
    setTotalKeysTyped(0);
    totalKeysTypedRef.current = 0;
    setTotalErrors(0);
    totalErrorsRef.current = 0;
    setActiveWords([]);
    setTargetWordId(null);
    targetWordIdRef.current = null;

    startTimeRef.current = performance.now();
    // Smooth start: give user 1000ms breathing room before first word drops
    lastSpawnRef.current = Date.now() - (SPEED_PACES[pace].initialSpawnInterval - 1000);

    if (duration === "2min") setDisplayTimer("02:00:00");
    else if (duration === "5min") setDisplayTimer("05:00:00");
    else setDisplayTimer("00:00");

    setGameState("playing");
  };

  // Main 60fps Game Loop
  useEffect(() => {
    if (gameState !== "playing") return;

    let lastTime = performance.now();
    let animId: number;

    const loop = (time: number) => {
      // Calculate delta time in seconds, capped to 80ms to avoid jumps
      const delta = Math.min((time - lastTime) / 1000, 0.08);
      lastTime = time;

      // Update Live Countdown / Countup Timer with millisecond precision
      const nowPerf = performance.now();
      const elapsedMs = nowPerf - startTimeRef.current;
      const mode = durationModeRef.current;

      if (mode === "unlimited") {
        const totalSecs = Math.floor(elapsedMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setDisplayTimer(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
      } else {
        const totalLimitMs = mode === "2min" ? 120000 : 300000;
        const remainingMs = totalLimitMs - elapsedMs;

        if (remainingMs <= 0) {
          setDisplayTimer("00:00:00");
          handleEndGame("time_up");
          return;
        }

        const remainingTotalSecs = Math.floor(remainingMs / 1000);
        const mins = Math.floor(remainingTotalSecs / 60);
        const secs = remainingTotalSecs % 60;
        const centis = Math.floor((remainingMs % 1000) / 10);
        setDisplayTimer(
          `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(centis).padStart(2, "0")}`
        );
      }

      const currentWave = waveRef.current;
      const pace = SPEED_PACES[paceRef.current];
      const spawnInterval = Math.max(
        pace.minSpawnInterval,
        pace.initialSpawnInterval - (currentWave - 1) * pace.spawnWaveReduction
      );
      const now = Date.now();

      // Early waves: limit concurrent words so player is never swamped early on
      // Wave 1: max 2 words; Wave 2: max 3 words; Wave 3+: max 4 words
      const maxConcurrent = currentWave <= 1 ? 2 : currentWave <= 2 ? 3 : 4;

      // Spawn word when timer fires and arena is not overcrowded
      if (now - lastSpawnRef.current > spawnInterval && activeWordsRef.current.length < maxConcurrent) {
        spawnWord();
        lastSpawnRef.current = now;
      }

      // Smoothly advance falling positions downwards
      setActiveWords((prev) => {
        const nextWords: FallingWord[] = [];
        let hitCount = 0;

        for (const w of prev) {
          // Continuous downward position update
          const newY = w.yPercent + w.speed * delta;
          if (newY >= 85) {
            hitCount++;
            soundEngine.playKeySound("Backspace");
          } else {
            nextWords.push({ ...w, yPercent: newY });
          }
        }

        if (hitCount > 0) {
          setLives((l) => {
            const nextL = l - hitCount;
            livesRef.current = Math.max(0, nextL);
            if (nextL <= 0) {
              handleEndGame("lives_depleted");
            }
            return Math.max(0, nextL);
          });
          setStreak(0);
          // If targeted word reached perimeter, release lock
          if (targetWordIdRef.current && !nextWords.some((w) => w.id === targetWordIdRef.current)) {
            setTargetWordId(null);
          }
        }

        return nextWords;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, spawnWord, handleEndGame]);

  // Update high score
  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  // Handle typing input (both physical and virtual keyboard)
  const processLetter = useCallback(
    (char: string) => {
      if (gameState !== "playing") return;
      const upperChar = char.toUpperCase();

      setActiveWords((prev) => {
        // If we already have an active targeted word, advance its matched characters
        if (targetWordId) {
          const target = prev.find((w) => w.id === targetWordId);
          if (target) {
            const expectedChar = target.word[target.matchedChars];
            if (expectedChar === upperChar) {
              const newMatched = target.matchedChars + 1;
              totalKeysTypedRef.current += 1;
              setTotalKeysTyped((k) => k + 1);

              if (newMatched >= target.word.length) {
                // Word completed and destroyed!
                soundEngine.playKeySound("Enter");
                setScore((s) => s + target.word.length * 20 * (1 + streak * 0.1));
                setStreak((st) => st + 1);
                setTargetWordId(null);
                targetWordIdRef.current = null;
                setWordsDestroyed((prevCount) => {
                  const newCount = prevCount + 1;
                  wordsDestroyedRef.current = newCount;
                  // Increase wave level every 6 words destroyed for smoother flow!
                  if (newCount % 6 === 0) {
                    setWave((w) => w + 1);
                    soundEngine.playKeySound("Space");
                  }
                  return newCount;
                });
                return prev.filter((w) => w.id !== target.id);
              } else {
                // Character matched!
                soundEngine.playKeySound(upperChar);
                return prev.map((w) => (w.id === target.id ? { ...w, matchedChars: newMatched } : w));
              }
            } else {
              // Missed char
              totalErrorsRef.current += 1;
              setTotalErrors((e) => e + 1);
              setStreak(0);
              return prev;
            }
          }
        }

        // If no target word yet, lock onto the lowest word matching the typed starting letter
        const candidates = prev
          .filter((w) => w.word[0] === upperChar)
          .sort((a, b) => b.yPercent - a.yPercent);

        if (candidates.length > 0) {
          const target = candidates[0];
          setTargetWordId(target.id);
          targetWordIdRef.current = target.id;
          soundEngine.playKeySound(upperChar);
          totalKeysTypedRef.current += 1;
          setTotalKeysTyped((k) => k + 1);

          if (target.word.length === 1) {
            setScore((s) => s + 30);
            setStreak((st) => st + 1);
            setTargetWordId(null);
            targetWordIdRef.current = null;
            setWordsDestroyed((c) => {
              const newC = c + 1;
              wordsDestroyedRef.current = newC;
              return newC;
            });
            return prev.filter((w) => w.id !== target.id);
          } else {
            return prev.map((w) => (w.id === target.id ? { ...w, matchedChars: 1 } : w));
          }
        }

        // Missed key press with no target matching
        totalErrorsRef.current += 1;
        setTotalErrors((e) => e + 1);
        setStreak(0);
        return prev;
      });
    },
    [gameState, targetWordId, streak]
  );

  // Keyboard Event Listener for Physical Hardware Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        processLetter(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, processLetter]);

  return (
    <div className="relative z-10 w-full max-w-5xl px-3 sm:px-5 py-3 flex flex-col items-center justify-between gap-3 animate-in fade-in duration-300 select-none">
      {/* ========================================================================= */}
      {/* 1. SELECTION / READY MODAL OVERLAY (BLURRED SCREEN BACKGROUND)           */}
      {/* ========================================================================= */}
      {gameState === "ready" && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white rounded-3xl border border-blue-200 shadow-2xl p-6 sm:p-7 flex flex-col items-center gap-4 text-center text-slate-900 ring-1 ring-black/[0.04]">
            {/* Header Icon */}
            <img
              src="/meteordefenseemblem.png"
              alt="Key Meteor Defense"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl shadow-xl hover:scale-110 transition-transform duration-300 cursor-pointer"
            />

            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-950">
                Key Meteor Defense
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                Type letters on falling words to fire defense lasers and prevent keycap impact.
              </p>
            </div>

            {/* Duration Selector */}
            <div className="w-full flex flex-col gap-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" />
                Mission Duration
              </span>
              <div className="w-full flex items-center gap-2 p-1.5 rounded-2xl bg-blue-50/80 border border-blue-200">
                {(
                  [
                    { id: "2min", label: "2 Min", sub: "Countdown" },
                    { id: "5min", label: "5 Min", sub: "Countdown" },
                    { id: "unlimited", label: "Unlimited", sub: "Survival" },
                  ] as const
                ).map((item) => {
                  const isSelected = selectedDuration === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedDuration(item.id)}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102"
                          : "bg-white text-slate-700 hover:bg-blue-100/50 hover:text-blue-700 border border-transparent"
                      }`}
                    >
                      <span className="text-xs font-black">{item.label}</span>
                      <span className={`text-[9.5px] font-bold ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                        {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speed & Flow Pace Selector */}
            <div className="w-full flex flex-col gap-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3 h-3 text-blue-600" />
                Falling Speed & Flow Pace
              </span>
              <div className="w-full flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200">
                {(
                  [
                    { id: "relaxed", label: "🍃 Relaxed", sub: "~15s Fall" },
                    { id: "balanced", label: "⚡ Balanced", sub: "Recommended" },
                    { id: "rapid", label: "🔥 Rapid", sub: "~8s Fall" },
                  ] as const
                ).map((item) => {
                  const isSelected = selectedPace === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPace(item.id)}
                      className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102"
                          : "bg-white text-slate-700 hover:bg-slate-200/70 hover:text-blue-700 border border-transparent"
                      }`}
                    >
                      <span className="text-xs font-black">{item.label}</span>
                      <span
                        className={`text-[9.5px] font-bold ${
                          isSelected ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-600 font-medium px-1 leading-snug">
                {SPEED_PACES[selectedPace].description}
              </p>
            </div>

            {/* Start Button & Hub Return */}
            <div className="w-full flex flex-col gap-2 pt-1">
              <button
                onClick={() => startGame(selectedDuration, selectedPace)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-blue-500/35 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START DEFENSE MISSION</span>
              </button>
              <button
                onClick={onBackToHub}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
              >
                Return to Games Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MEDIUM-SIZED GAME COMPLETION MODAL (BLURRED SCREEN BACKGROUND)         */}
      {/* ========================================================================= */}
      {gameState === "gameover" && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="max-w-xl w-full bg-white rounded-3xl border border-blue-200 shadow-2xl p-6 sm:p-8 flex flex-col gap-5 text-slate-900 ring-1 ring-black/[0.04]">
            {/* Header Status */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div
                className={`p-3 rounded-2xl border ${
                  endReason === "time_up"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-md shadow-emerald-500/20"
                    : "bg-rose-50 border-rose-200 text-rose-600 shadow-md shadow-rose-500/20"
                }`}
              >
                {endReason === "time_up" ? <Trophy className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      endReason === "time_up"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {endReason === "time_up" ? "MISSION ACCOMPLISHED" : "DEFENSE BREACHED"}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    Mode: {activeDuration === "unlimited" ? "Unlimited" : activeDuration}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {SPEED_PACES[activePace].badge}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-950 tracking-tight mt-0.5">
                  {endReason === "time_up" ? "Time Completed Successfully!" : "Perimeter Overrun"}
                </h3>
              </div>
            </div>

            {/* 4 PRIMARY METRICS (TOTAL KEYS, TOTAL WORDS, WPM, DURATION) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Total Keys Typed */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Keys Typed
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-950">
                  {totalKeysTyped}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Valid strokes</span>
              </div>

              {/* Total Words Typed */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-blue-600" />
                  Words Typed
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-950">
                  {wordsDestroyed}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Meteors blasted</span>
              </div>

              {/* Exact Reference WPM */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                  Velocity
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600">
                  {finalWpm}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Timer-based WPM</span>
              </div>

              {/* Total Duration */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Hourglass className="w-3.5 h-3.5 text-indigo-600" />
                  Duration
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-950">
                  {formatDurationDisplay(finalDurationSecs)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Active defense</span>
              </div>
            </div>

            {/* Secondary Score & Accuracy Strip */}
            <div className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Final Score:</span>
                <span className="text-sm font-black font-mono text-blue-600">{score} PTS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Max Wave:</span>
                <span className="text-sm font-black font-mono text-slate-900">Wave {wave}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Accuracy:</span>
                <span className="text-sm font-black font-mono text-emerald-600">{finalAccuracy}%</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-bold text-amber-700">XP Earned:</span>
                <span className="text-sm font-black font-mono text-amber-600">+{earnedXp} XP</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => startGame(activeDuration, activePace)}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again ({SPEED_PACES[activePace].label})</span>
              </button>

              <button
                onClick={() => setGameState("ready")}
                className="py-3 px-4 rounded-2xl border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Change Game Settings"
              >
                <Sliders className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={onBackToHub}
                className="py-3 px-4 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                Exit to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TOP STANDARDIZED SUITE HEADER BAR                                      */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-200">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Back to Games Hub"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Games Hub</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 shadow-xs">
            <img
              src="/meteordefenseemblem.png"
              alt="Key Meteor Defense"
              className="w-7 h-7 object-contain rounded-lg shadow-2xs hover:scale-135 transition-transform duration-200 cursor-pointer"
            />
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">
              Key Meteor Defense
            </span>
          </div>

          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {activeDuration === "unlimited" ? "Arcade Survival" : `${activeDuration} Mission`}
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Gauge className="w-3 h-3 text-blue-600" />
            {SPEED_PACES[activePace].label} Pace
          </span>
        </div>

        {/* Lives, Timer, Wave & Score Counter */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Live Countdown / Count-up Precision Timer */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-blue-200 bg-white text-slate-900 text-xs font-mono font-black shadow-xs min-w-[90px] justify-center"
            title={activeDuration === "unlimited" ? "Count-up Survival Timer" : "Countdown Timer (MM:SS:ms)"}
          >
            <Timer className={`w-3.5 h-3.5 text-blue-600 ${gameState === "playing" ? "animate-pulse" : ""}`} />
            <span>{displayTimer}</span>
          </div>

          {/* Lives Hearts */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl border border-blue-200 bg-white shadow-xs">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-3.5 h-3.5 transition-all ${
                  heart <= lives
                    ? "text-rose-500 fill-rose-500 animate-pulse"
                    : "text-slate-300 opacity-40"
                }`}
              />
            ))}
          </div>

          {/* Wave */}
          <span className="px-2.5 py-1 rounded-xl border border-blue-200 bg-white text-slate-700 text-xs font-bold font-mono shadow-xs">
            Wave {wave}
          </span>

          {/* Score */}
          <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono text-xs font-black shadow-xs">
            {score} PTS
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. METEOR SKY ARENA (FALLING WORDS CONTAINER)                             */}
      {/* ========================================================================= */}
      <div
        className="relative w-full h-[280px] sm:h-[320px] rounded-3xl border-2 border-blue-200 overflow-hidden shadow-lg bg-gradient-to-b from-slate-50 to-blue-50/30 flex flex-col justify-end"
      >
        {/* Star / Meteor Dust Background Grid */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Defense Barrier Line */}
        <div className="absolute inset-x-0 bottom-5 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent flex items-center justify-center">
          <span className="text-[10px] font-mono font-black tracking-widest text-rose-700 uppercase bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-300 shadow-xs">
            Keyboard Defense Perimeter
          </span>
        </div>

        {/* Falling Word Items */}
        {activeWords.map((item) => {
          const isTargeted = item.id === targetWordId;

          return (
            <div
              key={item.id}
              style={{
                left: `${item.xPercent}%`,
                top: `${item.yPercent}%`,
                transform: "translate(-50%, 0)",
              }}
              className={`absolute flex flex-col items-center select-none pointer-events-none ${
                isTargeted ? "scale-110 z-20" : "z-10"
              }`}
            >
              <div
                style={{
                  borderColor: isTargeted ? "#2563eb" : item.color,
                  boxShadow: isTargeted ? `0 0 16px ${item.color}` : `0 2px 8px ${item.color}33`,
                }}
                className="px-3 py-1.5 rounded-xl border-2 font-mono font-black text-sm tracking-wider flex items-center gap-0.5 bg-white text-slate-900 shadow-sm"
              >
                {item.word.split("").map((c, cIdx) => {
                  const isTyped = cIdx < item.matchedChars;
                  return (
                    <span
                      key={cIdx}
                      className={
                        isTyped
                          ? "text-emerald-600 underline font-extrabold"
                          : isTargeted && cIdx === item.matchedChars
                          ? "text-blue-600 font-extrabold animate-pulse"
                          : "text-slate-800"
                      }
                    >
                      {c}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 5. 3D MECHANICAL KEYBOARD ENGINE                                          */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-col items-center justify-center relative mt-0">
        <Keyboard
          className="mx-auto"
          theme={theme}
          colorZones={colorZones}
          allowMouseClick={true}
          onKeyPress={(key) => processLetter(key)}
        />
      </div>
    </div>
  );
}
