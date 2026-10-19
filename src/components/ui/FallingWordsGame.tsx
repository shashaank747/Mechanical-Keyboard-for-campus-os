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
  const [activeWords, setActiveWords] = useState<FallingWord[]>([]);
  const [targetWordId, setTargetWordId] = useState<string | null>(null);

  const requestRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);

  const spawnWord = useCallback(() => {
    const word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    const id = `${word}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const xPercent = 12 + Math.random() * 72;
    const speed = 0.28 + wave * 0.05 + Math.random() * 0.15;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    setActiveWords((prev) => [
      ...prev,
      { id, word, matchedChars: 0, xPercent, yPercent: 0, speed, color },
    ]);
  }, [wave]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setWave(1);
    setStreak(0);
    setActiveWords([]);
    setTargetWordId(null);
    setGameState("playing");
    lastSpawnRef.current = Date.now();
  };

  // Main game loop (tick)
  useEffect(() => {
    if (gameState !== "playing") return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Spawn timer
      const spawnInterval = Math.max(1200, 3000 - wave * 250);
      if (Date.now() - lastSpawnRef.current > spawnInterval && activeWords.length < 5 + wave) {
        spawnWord();
        lastSpawnRef.current = Date.now();
      }

      // Update falling positions
      setActiveWords((prev) => {
        const nextWords: FallingWord[] = [];
        let hitBottom = false;

        for (const w of prev) {
          const newY = w.yPercent + w.speed * delta * 15;
          if (newY >= 88) {
            hitBottom = true;
            soundEngine.playKeySound("Backspace");
          } else {
            nextWords.push({ ...w, yPercent: newY });
          }
        }

        if (hitBottom) {
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setGameState("gameover");
              updateStudentProgress({
                gameType: "meteorDefense",
                details: { score, wave },
              });
            }
            return Math.max(0, nextL);
          });
          setStreak(0);
        }

        return nextWords;
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activeWords.length, gameState, spawnWord, wave]);

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
        // If we already have an active targeted word, try matching the next char
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
                if ((score + 100) % 500 === 0) setWave((w) => w + 1);
                return prev.filter((w) => w.id !== target.id);
              } else {
                // Char matched
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

        // If no target word yet, find the lowest word matching the typed starting letter
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
    [gameState, score, streak, targetWordId]
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
      {/* Top Header & HUD */}
      <div className="w-full flex items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHub}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all shadow-2xs cursor-pointer ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Games Hub</span>
          </button>

          <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs uppercase tracking-wider flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Meteor Defense</span>
          </span>
        </div>

        {/* Lives & Score Counter */}
        <div className="flex items-center gap-3">
          {/* Lives Hearts */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heart) => (
              <Heart
                key={heart}
                className={`w-4 h-4 transition-all ${
                  heart <= lives
                    ? "text-rose-500 fill-rose-500 animate-pulse"
                    : "text-slate-600 opacity-40"
                }`}
              />
            ))}
          </div>

          {/* Wave */}
          <span className={`px-2 py-0.5 rounded-lg border text-xs font-bold font-mono ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
          }`}>
            Wave {wave}
          </span>

          {/* Score */}
          <span className="px-3 py-0.5 rounded-lg bg-blue-600 text-white font-mono text-xs font-black shadow-xs">
            {score} PTS
          </span>
        </div>
      </div>

      {/* METEOR SKY ARENA (FALLING WORDS CONTAINER) */}
      <div
        className={`relative w-full h-[230px] sm:h-[260px] rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col justify-end ${
          isDark
            ? "bg-slate-950/90 border-slate-800 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
            : "bg-slate-100/95 border-slate-300 shadow-inner"
        }`}
      >
        {/* Star / Meteor Dust Background Grid */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Defense Barrier Line */}
        <div className="absolute inset-x-0 bottom-4 h-[2px] bg-gradient-to-r from-transparent via-rose-500/80 to-transparent flex items-center justify-center">
          <span className="text-[9px] font-mono font-bold tracking-widest text-rose-400 uppercase bg-slate-950/80 px-2 py-0.5 rounded-full border border-rose-500/30">
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
              className={`absolute transition-all duration-75 flex flex-col items-center select-none ${
                isTargeted ? "scale-110 z-20" : "z-10"
              }`}
            >
              <div
                style={{
                  borderColor: isTargeted ? "#f97316" : item.color,
                  boxShadow: isTargeted ? `0 0 20px ${item.color}` : `0 0 10px ${item.color}44`,
                }}
                className={`px-3 py-1.5 rounded-xl border-2 font-mono font-black text-sm tracking-wider flex items-center gap-0.5 transition-all ${
                  isDark ? "bg-slate-900/95 text-white" : "bg-white text-slate-900"
                }`}
              >
                {item.word.split("").map((c, cIdx) => {
                  const isTyped = cIdx < item.matchedChars;
                  return (
                    <span
                      key={cIdx}
                      className={
                        isTyped
                          ? "text-emerald-400 underline font-extrabold drop-shadow-[0_0_8px_#10b981]"
                          : isTargeted && cIdx === item.matchedChars
                          ? "text-blue-400 font-extrabold animate-pulse"
                          : "opacity-80"
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
                Final Score: <span className="font-mono font-bold text-blue-400">{score} PTS</span> • Wave {wave}
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
