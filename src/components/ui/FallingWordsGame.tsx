"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import confetti from "canvas-confetti";
import { updateStudentProgress } from "@/lib/db";

interface FallingWord {
  id: string;
  word: string;
  matchedChars: number;
  xPercent: number; // 10% to 85%
  yPercent: number; // 0% to 100%
  speed: number;
  color: string;
}

const WORD_BANK = [
  "CLICK", "SWITCH", "KEYCAP", "STEM", "SPRING", "LINEAR", "TACTILE",
  "CLICKY", "LUBED", "SPACE", "ENTER", "SPEED", "SHIFT", "LASER",
  "NEON", "PIXEL", "RGB", "TURBO", "BLAST", "POWER", "MATRIX",
  "CODE", "SMOKE", "GHOST", "SOUND", "ACOUSTIC", "METEOR", "CHERRY"
];

const COLORS = ["#f97316", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#eab308"];

export function FallingWordsGame({
  theme,
  colorZones,
  onOpenThemeSidebar,
  onBackToHub,
}: {
  theme: KeyboardTheme;
  colorZones?: boolean;
  onOpenThemeSidebar?: () => void;
  onBackToHub: () => void;
}) {
  const isDark = false;

  const [gameState, setGameState] = useState<"ready" | "playing" | "gameover">("ready");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [wave, setWave] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [wordsDestroyed, setWordsDestroyed] = useState<number>(0);
  const [activeWords, setActiveWords] = useState<FallingWord[]>([]);
  const [targetWordId, setTargetWordId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const requestRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const waveRef = useRef<number>(wave);
  waveRef.current = wave;
  const scoreRef = useRef<number>(score);
  scoreRef.current = score;
  const activeWordsRef = useRef<FallingWord[]>(activeWords);
  activeWordsRef.current = activeWords;
  const targetWordIdRef = useRef<string | null>(targetWordId);
  targetWordIdRef.current = targetWordId;

  // Format MM:SS for user live countup timer
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  // Live Countup Timer Effect
  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Spawns a word at the top with randomized horizontal position & speed based on wave
  const spawnWord = useCallback(() => {
    const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    const id = `${word}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    // Horizontal random placement bounded to 12% - 78% so words stay cleanly inside the arena
    const xPercent = 12 + Math.random() * 66;
    const currentWave = waveRef.current;
    // Speed in percentage of arena height per second:
    // Wave 1: ~14-17%/sec (takes ~5-6s to fall)
    // Wave 2: ~17-20%/sec
    // Wave 3: ~20-24%/sec, scaling up progressively
    const speed = 13 + currentWave * 2.8 + Math.random() * 3.5;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    setActiveWords((prev) => [
      ...prev,
      { id, word, matchedChars: 0, xPercent, yPercent: 0, speed, color },
    ]);
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setWave(1);
    setStreak(0);
    setWordsDestroyed(0);
    setActiveWords([]);
    setTargetWordId(null);
    setElapsedSeconds(0);
    setGameState("playing");
    lastSpawnRef.current = Date.now();
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

      const currentWave = waveRef.current;
      const spawnInterval = Math.max(1300, 3200 - currentWave * 320);
      const now = Date.now();

      // Spawn word when timer fires and arena is not overcrowded
      if (now - lastSpawnRef.current > spawnInterval && activeWordsRef.current.length < 3 + Math.min(4, currentWave)) {
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
            if (nextL <= 0) {
              setGameState("gameover");
              updateStudentProgress({
                gameType: "meteorDefense",
                details: { score: scoreRef.current, wave: waveRef.current },
              });
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
  }, [gameState, spawnWord]);

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
              if (newMatched >= target.word.length) {
                // Word completed and destroyed!
                soundEngine.playKeySound("Enter");
                setScore((s) => s + target.word.length * 20 * (1 + streak * 0.1));
                setStreak((st) => st + 1);
                setTargetWordId(null);
                setWordsDestroyed((prevCount) => {
                  const newCount = prevCount + 1;
                  // Increase wave level every 4 words destroyed!
                  if (newCount % 4 === 0) {
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
          soundEngine.playKeySound(upperChar);

          if (target.word.length === 1) {
            setScore((s) => s + 30);
            setStreak((st) => st + 1);
            setTargetWordId(null);
            setWordsDestroyed((c) => c + 1);
            return prev.filter((w) => w.id !== target.id);
          } else {
            return prev.map((w) =>
              w.id === target.id ? { ...w, matchedChars: 1 } : w
            );
          }
        }

        return prev;
      });
    },
    [gameState, streak, targetWordId]
  );

  // Global Keydown Listener
  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        processLetter(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, processLetter]);

  return (
    <div className="relative z-10 w-full max-w-5xl px-3 sm:px-5 py-3 flex flex-col items-center justify-between gap-3 animate-in fade-in duration-300 select-none">
      {/* Top Header Navigation Bar (Standardized Suite Header) */}
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
            <Crosshair className="w-5 h-5 text-blue-600" />
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">
              Key Meteor Defense
            </span>
          </div>

          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Arcade Survival
          </span>
        </div>

        {/* Lives, Timer, Wave & Score Counter */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Live Countup Timer */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-blue-200 bg-white text-slate-800 text-xs font-mono font-bold shadow-xs"
            title="Mission Survival Timer"
          >
            <Timer className={`w-3.5 h-3.5 text-blue-600 ${gameState === "playing" ? "animate-pulse" : ""}`} />
            <span>{formatTimer(elapsedSeconds)}</span>
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

      {/* METEOR SKY ARENA (FALLING WORDS CONTAINER) */}
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

        {/* READY SCREEN OVERLAY */}
        {gameState === "ready" && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-4 text-center p-6 z-30">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25">
              <Crosshair className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Key Meteor Defense
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Type the letters on the falling words to fire defense lasers and prevent keycap impacts!
              </p>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase flex items-center gap-2 shadow-xl shadow-blue-500/30 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START DEFENSE MISSION</span>
            </button>
          </div>
        )}

        {/* GAME OVER SCREEN OVERLAY */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center p-6 z-30 animate-in zoom-in duration-200">
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-500 shadow-xl">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                DEFENSE BREACHED
              </span>
              <h3 className="text-2xl font-black text-white">Mission Over</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Surv Time: <span className="font-mono font-bold text-emerald-400">{formatTimer(elapsedSeconds)}</span> • Final Score: <span className="font-mono font-bold text-blue-400">{score} PTS</span> • Wave {wave}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={startGame}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-lg cursor-pointer hover:scale-105 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              <button
                onClick={onBackToHub}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Exit to Hub
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3D MECHANICAL KEYBOARD ENGINE */}
      <div className="w-full flex flex-col items-center justify-center relative mt-0">
        <Keyboard
          className="mx-auto"
          theme={theme}
          colorZones={colorZones}
          allowMouseClick={true}
          onKeyPress={(key) => processLetter(key)}
          onOpenThemeSidebar={onOpenThemeSidebar}
        />
      </div>
    </div>
  );
}
