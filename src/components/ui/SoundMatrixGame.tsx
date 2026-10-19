"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard } from "./keyboard";
import { type KeyboardTheme } from "@/lib/themes";
import { soundEngine } from "@/lib/sound";
import {
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowLeft,
  Play,
  Pause,
  Zap,
  Headphones,
  CheckCircle2,
  Settings2,
  Type,
  BookOpen,
  ArrowRight,
  Flame,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";

export type DictationMode = "spell" | "words";

export interface PracticeLine {
  id: number;
  category: "Beginner" | "Acoustics" | "Phrases" | "Speed" | "Code";
  text: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const PRACTICE_LINES: PracticeLine[] = [
  {
    id: 1,
    category: "Beginner",
    text: "home row keys anchor your fingers",
    difficulty: "Easy",
  },
  {
    id: 2,
    category: "Beginner",
    text: "type fast with rhythm and flow",
    difficulty: "Easy",
  },
  {
    id: 3,
    category: "Acoustics",
    text: "mechanical switches give deep tactile clacks",
    difficulty: "Medium",
  },
  {
    id: 4,
    category: "Phrases",
    text: "the quick brown fox jumps over the lazy dog",
    difficulty: "Medium",
  },
  {
    id: 5,
    category: "Acoustics",
    text: "lubed linear stems glide with zero friction",
    difficulty: "Medium",
  },
  {
    id: 6,
    category: "Speed",
    text: "muscle memory unlocks lightning typing velocity",
    difficulty: "Hard",
  },
  {
    id: 7,
    category: "Code",
    text: "const echo = sound matrix speech synthesis",
    difficulty: "Hard",
  },
  {
    id: 8,
    category: "Phrases",
    text: "listen to the voice and echo every single letter",
    difficulty: "Hard",
  },
];

// Map character to physical keyboard code
function charToKeyCode(char: string): string {
  if (!char) return "";
  if (char === " ") return "Space";
  if (char === ",") return "Comma";
  if (char === ".") return "Period";
  if (char === ";") return "Semicolon";
  if (char === "'") return "Quote";
  if (char === "/") return "Slash";
  if (char === "-") return "Minus";
  if (char === "=") return "Equal";
  if (char >= "0" && char <= "9") return `Digit${char}`;
  const upper = char.toUpperCase();
  if (upper >= "A" && upper <= "Z") return `Key${upper}`;
  return "";
}

// Global active utterance array to prevent browser GC bug
const activeUtteranceQueue: SpeechSynthesisUtterance[] = [];

export function SoundMatrixGame({
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
  // Website and games remain on the sleek White, Blue, and Black palette
  const isDark = false;

  // Game Settings
  const [dictationMode, setDictationMode] = useState<DictationMode>("spell"); // 'spell' or 'words'
  const [speechRate, setSpeechRate] = useState<number>(0.85); // Paced dictation cadence
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0);

  // Active Session State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTypedText, setCurrentTypedText] = useState<string>("");
  const [speakingIndex, setSpeakingIndex] = useState<number>(-1);
  const [speakingWordIndex, setSpeakingWordIndex] = useState<number>(-1);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [shakeWrong, setShakeWrong] = useState<boolean>(false);

  const activeLine = PRACTICE_LINES[selectedLineIndex] || PRACTICE_LINES[0];
  const targetText = activeLine.text;
  const currentTargetChar = targetText[currentTypedText.length] || "";
  const targetKeyCode = charToKeyCode(currentTargetChar);

  // References for continuous speech loop
  const isPlayingRef = useRef<boolean>(false);
  const speakingIndexRef = useRef<number>(-1);
  const targetTextRef = useRef<string>(targetText);
  const dictationModeRef = useRef<DictationMode>(dictationMode);
  const speechRateRef = useRef<number>(speechRate);
  const isVoiceMutedRef = useRef<boolean>(isVoiceMuted);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    targetTextRef.current = targetText;
  }, [targetText]);

  useEffect(() => {
    dictationModeRef.current = dictationMode;
  }, [dictationMode]);

  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  useEffect(() => {
    isVoiceMutedRef.current = isVoiceMuted;
  }, [isVoiceMuted]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const cancelSpeech = () => {
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    activeUtteranceQueue.length = 0;
  };

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  // Continuous loop that moves forward through the entire line regardless of user typing
  const runContinuousStep = useCallback(() => {
    if (!isPlayingRef.current) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const currentMode = dictationModeRef.current;
    const fullText = targetTextRef.current;

    if (currentMode === "spell") {
      // Advance to next letter
      const nextIdx = speakingIndexRef.current + 1;

      if (nextIdx >= fullText.length) {
        // Line reached end of dictation: wait a moment and re-loop if user is still typing
        speakingIndexRef.current = -1;
        setSpeakingIndex(-1);
        stepTimerRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            runContinuousStep();
          }
        }, 1500);
        return;
      }

      speakingIndexRef.current = nextIdx;
      setSpeakingIndex(nextIdx);

      const char = fullText[nextIdx];
      let spokenText = char.toUpperCase();
      if (char === " ") {
        spokenText = "Space";
      } else if (char === ".") {
        spokenText = "Period";
      } else if (char === ",") {
        spokenText = "Comma";
      }

      if (!isVoiceMutedRef.current) {
        const u = new SpeechSynthesisUtterance(spokenText);
        u.rate = Math.max(0.7, speechRateRef.current * 1.1);
        u.pitch = 1.0;
        u.lang = "en-US";

        activeUtteranceQueue.push(u);

        const onFinished = () => {
          const idx = activeUtteranceQueue.indexOf(u);
          if (idx !== -1) activeUtteranceQueue.splice(idx, 1);
        };

        u.onend = onFinished;
        u.onerror = onFinished;

        window.speechSynthesis.speak(u);
      }

      // Time gap to next letter continuously (e.g. 750ms / speed rate)
      const letterInterval = Math.max(380, Math.round(720 / speechRateRef.current));
      stepTimerRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          runContinuousStep();
        }
      }, letterInterval);
    } else {
      // Word by word continuous mode
      const words = fullText.split(" ");
      const nextWordIdx = (speakingIndexRef.current + 1);

      if (nextWordIdx >= words.length) {
        speakingIndexRef.current = -1;
        setSpeakingWordIndex(-1);
        stepTimerRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            runContinuousStep();
          }
        }, 1800);
        return;
      }

      speakingIndexRef.current = nextWordIdx;
      setSpeakingWordIndex(nextWordIdx);

      const word = words[nextWordIdx];
      const isLastWord = nextWordIdx === words.length - 1;
      const spokenText = isLastWord ? word : `${word}, space`;

      if (!isVoiceMutedRef.current) {
        const u = new SpeechSynthesisUtterance(spokenText);
        u.rate = speechRateRef.current;
        u.pitch = 1.0;
        u.lang = "en-US";

        activeUtteranceQueue.push(u);

        const onFinished = () => {
          const idx = activeUtteranceQueue.indexOf(u);
          if (idx !== -1) activeUtteranceQueue.splice(idx, 1);
        };

        u.onend = onFinished;
        u.onerror = onFinished;

        window.speechSynthesis.speak(u);
      }

      const wordInterval = Math.max(700, Math.round(1350 / speechRateRef.current));
      stepTimerRef.current = setTimeout(() => {
        if (isPlayingRef.current) {
          runContinuousStep();
        }
      }, wordInterval);
    }
  }, []);

  // Start / Resume Continuous Voice Dictation
  const startSession = () => {
    cancelSpeech();
    setIsPlaying(true);
    isPlayingRef.current = true;
    speakingIndexRef.current = -1;
    setSpeakingIndex(-1);
    setSpeakingWordIndex(-1);
    if (!startTime) setStartTime(Date.now());

    // Begin continuous loop
    setTimeout(() => {
      runContinuousStep();
    }, 150);
  };

  const pauseSession = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    cancelSpeech();
  };

  const restartSession = () => {
    cancelSpeech();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentTypedText("");
    speakingIndexRef.current = -1;
    setSpeakingIndex(-1);
    setSpeakingWordIndex(-1);
    setStreak(0);
    setMistakes(0);
    setStartTime(null);
    setShowCompleteModal(false);
  };

  // Replay current line from start
  const replayFromStart = () => {
    startSession();
  };

  // Handle typing input
  const processKey = useCallback((char: string) => {
    if (showCompleteModal) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    const expectedChar = targetText[currentTypedText.length];
    if (!expectedChar) return;

    if (char.toLowerCase() === expectedChar.toLowerCase()) {
      // Correct character hit!
      soundEngine.playKeySound(expectedChar === " " ? "Space" : expectedChar.toUpperCase());
      const nextTyped = currentTypedText + expectedChar;
      setCurrentTypedText(nextTyped);
      setStreak((prev) => {
        const n = prev + 1;
        if (n > maxStreak) setMaxStreak(n);
        return n;
      });

      // Check if finished
      if (nextTyped === targetText) {
        cancelSpeech();
        setIsPlaying(false);
        isPlayingRef.current = false;
        setShowCompleteModal(true);
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.55 },
          });
        } catch {}
      }
    } else {
      // Wrong character hit
      soundEngine.playKeySound("Backspace");
      setStreak(0);
      setMistakes((prev) => prev + 1);
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 300);
    }
  }, [currentTypedText, maxStreak, showCompleteModal, startTime, targetText]);

  // Global physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showCompleteModal) return;

      if (e.code === "Space") {
        e.preventDefault();
        processKey(" ");
        return;
      }

      if (e.code === "Backspace") {
        e.preventDefault();
        if (currentTypedText.length > 0) {
          setCurrentTypedText((prev) => prev.slice(0, -1));
          soundEngine.playKeySound("Backspace");
        }
        return;
      }

      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        processKey(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTypedText, processKey, showCompleteModal]);

  // Break text into organized words for clean responsive layout
  const wordsList = targetText.split(" ");
  let charGlobalCounter = 0;

  // Metrics
  const totalTyped = currentTypedText.length + mistakes;
  const accuracy = totalTyped > 0 ? Math.round((currentTypedText.length / totalTyped) * 100) : 100;
  const durationMin = startTime ? (Date.now() - startTime) / 60000 : 0.001;
  const wordCount = currentTypedText.trim().split(/\s+/).filter(Boolean).length;
  const liveWpm = Math.round(wordCount / (durationMin || 0.001));

  return (
    <div className="relative z-10 w-full max-w-5xl px-3 sm:px-5 py-2 flex flex-col items-center justify-between gap-3 animate-in fade-in duration-300 select-none">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              cancelSpeech();
              onBackToHub();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all shadow-2xs cursor-pointer ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Games Hub</span>
          </button>

          <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-2xs uppercase tracking-wider flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5" />
            <span>Echo Matrix Voice Dictation</span>
          </span>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
            isDark ? "bg-slate-900 border-slate-800 text-emerald-400" : "bg-white border-slate-200 text-emerald-600"
          }`}>
            <span>Acc:</span>
            <span>{accuracy}%</span>
          </div>

          <div className="px-2.5 py-0.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono text-xs font-black flex items-center gap-1">
            <Flame className="w-3 h-3 text-blue-400 fill-blue-400" />
            <span>{streak}x</span>
          </div>
        </div>
      </div>

      {/* Voice Control & Dictation Mode Switcher Toolbar */}
      <div className={`w-full p-3 sm:p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-md ${
        isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white/90 border-slate-200 text-slate-900"
      }`}>
        {/* Left: Mode Selection (Spell Letters vs Read Words) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voice Mode:</span>
          <div className="flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => {
                cancelSpeech();
                setDictationMode("spell");
                if (isPlaying) {
                  setTimeout(() => startSession(), 100);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                dictationMode === "spell"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Spell Letters ("Space")</span>
            </button>

            <button
              onClick={() => {
                cancelSpeech();
                setDictationMode("words");
                if (isPlaying) {
                  setTimeout(() => startSession(), 100);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                dictationMode === "words"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Read Full Words</span>
            </button>
          </div>
        </div>

        {/* Center: Play / Pause / Replay Buttons */}
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={startSession}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Continuous Reading</span>
            </button>
          ) : (
            <button
              onClick={pauseSession}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-white" />
              <span>Pause Continuous Reading</span>
            </button>
          )}

          <button
            onClick={replayFromStart}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-cyan-400" : "bg-slate-100 border-slate-300 hover:bg-slate-200 text-cyan-600"
            }`}
            title="Replay Voice From Start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Speech Rate Speed & Line Selector */}
        <div className="flex items-center gap-3">
          {/* Speed Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Speed:</span>
            {[0.7, 0.85, 1.1].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  speechRate === rate
                    ? "bg-purple-600 text-white"
                    : isDark
                    ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Line Index Nav */}
          <div className="flex items-center gap-1">
            <button
              disabled={selectedLineIndex === 0}
              onClick={() => {
                setSelectedLineIndex((prev) => Math.max(0, prev - 1));
                restartSession();
              }}
              className="px-2 py-1 rounded-lg border text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              ◀
            </button>
            <span className="text-xs font-mono font-bold px-1.5">
              {selectedLineIndex + 1}/{PRACTICE_LINES.length}
            </span>
            <button
              disabled={selectedLineIndex >= PRACTICE_LINES.length - 1}
              onClick={() => {
                setSelectedLineIndex((prev) => Math.min(PRACTICE_LINES.length - 1, prev + 1));
                restartSession();
              }}
              className="px-2 py-1 rounded-lg border text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Main Dictation Reading & Interactive Typing Line Display */}
      <div className={`w-full p-5 sm:p-7 rounded-3xl border shadow-xl flex flex-col items-center justify-center gap-3 text-center transition-all ${
        shakeWrong ? "animate-shake" : ""
      } ${
        isDark
          ? "bg-slate-900/95 border-slate-800 text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-white border-slate-200 text-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
      }`}>
        {/* Line Category and Difficulty Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
            {activeLine.category}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 border border-slate-700/50">
            {activeLine.difficulty}
          </span>
          {isPlaying ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 animate-pulse">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Dictating Continuously...</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 italic">
              (Click 'Start Continuous Reading' to listen & type)
            </span>
          )}
        </div>

        {/* Clean, Word-Grouped Kinetic Text Stream */}
        <div className="w-full flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-3 p-2 font-mono font-black text-2xl sm:text-3xl select-none">
          {(() => {
            let globalCharIdx = 0;
            return wordsList.map((word, wIdx) => {
              const wordStartIdx = globalCharIdx;
              const wordChars = word.split("");
              const isCurrentWordSpoken = dictationMode === "words" && speakingWordIndex === wIdx && isPlaying;

              const wordNodes = (
                <div
                  key={wIdx}
                  className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                    isCurrentWordSpoken
                      ? "bg-cyan-500/20 ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                      : ""
                  }`}
                >
                  {wordChars.map((char, cIdx) => {
                    const charIdx = wordStartIdx + cIdx;
                    const isTyped = charIdx < currentTypedText.length;
                    const isTargetToType = charIdx === currentTypedText.length;
                    const isSpokenLetter = dictationMode === "spell" && charIdx === speakingIndex && isPlaying;

                    return (
                      <span
                        key={cIdx}
                        className={`relative inline-flex items-center justify-center w-7 h-9 sm:w-8 sm:h-10 rounded-lg transition-all duration-100 ${
                          isTyped
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                            : isTargetToType
                            ? isDark
                              ? "text-blue-300 bg-blue-500/25 ring-2 ring-blue-400 scale-105 shadow-md"
                              : "text-blue-600 bg-blue-100 ring-2 ring-blue-500 scale-105 shadow-md"
                            : isSpokenLetter
                            ? "text-cyan-300 bg-cyan-500/25 ring-2 ring-cyan-400 animate-pulse scale-105"
                            : isDark
                            ? "text-slate-500 bg-slate-950/60 border border-slate-800/80"
                            : "text-slate-400 bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {char}

                        {/* Visual cursor below the active letter user needs to type */}
                        {isTargetToType && (
                          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1 bg-blue-400 rounded-full animate-bounce" />
                        )}

                        {/* Speaker beacon icon above the currently spoken letter */}
                        {isSpokenLetter && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                        )}
                      </span>
                    );
                  })}

                  {/* Space indicator badge after each word (except the last word) */}
                  {wIdx < wordsList.length - 1 && (() => {
                    const spaceIdx = wordStartIdx + wordChars.length;
                    const isSpaceTyped = spaceIdx < currentTypedText.length;
                    const isTargetSpace = spaceIdx === currentTypedText.length;
                    const isSpokenSpace = dictationMode === "spell" && spaceIdx === speakingIndex && isPlaying;

                    return (
                      <span
                        className={`relative ml-1 px-1.5 py-1 rounded-md text-[10px] font-sans font-bold tracking-tight uppercase transition-all ${
                          isSpaceTyped
                            ? "text-emerald-400 bg-emerald-500/15 border border-emerald-500/30"
                            : isTargetSpace
                            ? isDark
                              ? "text-blue-300 bg-blue-500/25 ring-2 ring-blue-400"
                              : "text-blue-600 bg-blue-100 ring-2 ring-blue-500"
                            : isSpokenSpace
                            ? "text-cyan-300 bg-cyan-500/30 ring-2 ring-cyan-400 animate-pulse"
                            : isDark
                            ? "text-slate-500 bg-slate-950/40 border border-slate-800/60"
                            : "text-slate-400 bg-slate-100 border border-slate-200"
                        }`}
                      >
                        [SPACE]
                        {isTargetSpace && (
                          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1 bg-blue-400 rounded-full animate-bounce" />
                        )}
                      </span>
                    );
                  })()}
                </div>
              );

              globalCharIdx += wordChars.length + 1; // +1 for the space
              return wordNodes;
            });
          })()}
        </div>

        {/* Legend / Status indicator */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Typed Correctly</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-1 ring-amber-400" />
            <span className="text-slate-400">Target to Type: <strong className="text-amber-400">{currentTargetChar === " " ? "SPACEBAR" : currentTargetChar.toUpperCase() || "DONE"}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">Voice Continuous Dictation</span>
          </div>
        </div>
      </div>

      {/* 3D MECHANICAL KEYBOARD ENGINE WITH REAL-TIME ECHO TARGET LIGHTING */}
      <div className="w-full flex flex-col items-center justify-center relative mt-0">
        <Keyboard
          className="mx-auto"
          theme={theme}
          colorZones={colorZones}
          allowMouseClick={true}
          targetKeyCode={targetKeyCode}
          onKeyPress={(key) => processKey(key === "SPACE" ? " " : key)}
          onOpenThemeSidebar={onOpenThemeSidebar}
        />
      </div>

      {/* Level Completion Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl text-center flex flex-col items-center gap-5 ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl shadow-purple-500/30">
                <Trophy className="w-12 h-12 animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-purple-400 block mb-1">
                  ECHO LINE COMPLETED!
                </span>
                <h3 className="text-2xl font-black tracking-tight">Flawless Audio Dictation</h3>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  You echoed every character and space with supreme acoustic timing!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Accuracy</span>
                  <span className="text-lg font-black font-mono text-emerald-400">{accuracy}%</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Max Streak</span>
                  <span className="text-lg font-black font-mono text-blue-400">{maxStreak}x</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Speed</span>
                  <span className="text-lg font-black font-mono text-indigo-400">{liveWpm} WPM</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={restartSession}
                  className={`w-1/2 py-3 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repeat Line</span>
                </button>

                <button
                  onClick={() => {
                    const nextIdx = (selectedLineIndex + 1) % PRACTICE_LINES.length;
                    setSelectedLineIndex(nextIdx);
                    restartSession();
                    setTimeout(() => startSession(), 200);
                  }}
                  className="w-1/2 py-3 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
                >
                  <span>Next Line</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
