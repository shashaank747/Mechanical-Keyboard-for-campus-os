"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Keyboard from "./keyboard";
import type { KeyboardTheme } from "@/lib/themes";
import { soundEngine } from "@/lib/sound";
import {
  Volume2,
  EyeOff,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Flame,
  ChevronRight,
  Headphones,
  Check,
  X,
} from "lucide-react";
import { updateStudentProgress } from "@/lib/db";
import { recordBlindTypingPhraseResult } from "@/lib/userStats";

export interface BlindPhraseItem {
  id: number;
  text: string;
  tier: "5-10" | "10-15" | "15-20";
}

// Full 60 curated sentences across 3 word-length tiers
export const ALL_BLIND_PHRASES: BlindPhraseItem[] = [
  // -------------------------------------------------------------
  // 5–10 Words (20 Sentences)
  // -------------------------------------------------------------
  { id: 1, tier: "5-10", text: "The morning sky looked bright and peaceful." },
  { id: 2, tier: "5-10", text: "Keep your hands relaxed while typing." },
  { id: 3, tier: "5-10", text: "A small bird landed near the window." },
  { id: 4, tier: "5-10", text: "Practice makes typing faster and easier." },
  { id: 5, tier: "5-10", text: "The train arrived exactly on time." },
  { id: 6, tier: "5-10", text: "Fresh ideas often come from simple moments." },
  { id: 7, tier: "5-10", text: "My keyboard feels smooth and comfortable." },
  { id: 8, tier: "5-10", text: "The little garden was full of flowers." },
  { id: 9, tier: "5-10", text: "Everyone enjoyed the quiet evening walk." },
  { id: 10, tier: "5-10", text: "A cup of tea sat beside the laptop." },
  { id: 11, tier: "5-10", text: "Stay hungry. Stay foolish." },
  { id: 12, tier: "5-10", text: "It always seems impossible until it's done." },
  { id: 13, tier: "5-10", text: "The future depends on what you do today." },
  { id: 14, tier: "5-10", text: "Believe you can and you're halfway there." },
  { id: 15, tier: "5-10", text: "Well done is better than well said." },
  { id: 16, tier: "5-10", text: "Do what you can, with what you have." },
  { id: 17, tier: "5-10", text: "The secret of getting ahead is getting started." },
  { id: 18, tier: "5-10", text: "Success is not final, failure is not fatal." },
  { id: 19, tier: "5-10", text: "Keep your face always toward the sunshine." },
  { id: 20, tier: "5-10", text: "Great things never come from comfort zones." },

  // -------------------------------------------------------------
  // 10–15 Words (20 Sentences)
  // -------------------------------------------------------------
  { id: 21, tier: "10-15", text: "The old clock on the wall suddenly started ticking again." },
  { id: 22, tier: "10-15", text: "She opened the window and watched the rain fall outside." },
  { id: 23, tier: "10-15", text: "Learning something new becomes easier when practice becomes a daily habit." },
  { id: 24, tier: "10-15", text: "The computer finished processing the file after several minutes of waiting." },
  { id: 25, tier: "10-15", text: "A group of students gathered around the table to discuss their project." },
  { id: 26, tier: "10-15", text: "The road was quiet except for a few passing vehicles." },
  { id: 27, tier: "10-15", text: "He carefully checked every detail before submitting the final report." },
  { id: 28, tier: "10-15", text: "The colorful lights made the small room feel warm and welcoming." },
  { id: 29, tier: "10-15", text: "Sometimes the simplest solution is hidden behind a complicated problem." },
  { id: 30, tier: "10-15", text: "The notebook contained several useful ideas written during yesterday's meeting." },
  { id: 31, tier: "10-15", text: "The only way to do great work is to love what you do." },
  { id: 32, tier: "10-15", text: "You miss one hundred percent of the shots you don't take." },
  { id: 33, tier: "10-15", text: "If you can dream it, you can do it." },
  { id: 34, tier: "10-15", text: "Great things are done by a series of small things brought together." },
  { id: 35, tier: "10-15", text: "Don't watch the clock; do what it does. Keep going." },
  { id: 36, tier: "10-15", text: "Hardships often prepare ordinary people for an extraordinary destiny." },
  { id: 37, tier: "10-15", text: "It does not matter how slowly you go as long as you do not stop." },
  { id: 38, tier: "10-15", text: "The best way to predict the future is to create it." },
  { id: 39, tier: "10-15", text: "You have power over your mind, not outside events." },
  { id: 40, tier: "10-15", text: "Success usually comes to those who are too busy to be looking for it." },

  // -------------------------------------------------------------
  // 15–20 Words (20 Sentences)
  // -------------------------------------------------------------
  { id: 41, tier: "15-20", text: "The student opened the laptop, connected to the internet, and started working on the assignment." },
  { id: 42, tier: "15-20", text: "After completing the experiment, the team recorded their observations and discussed the results together." },
  { id: 43, tier: "15-20", text: "The city becomes surprisingly peaceful late at night when most people have already returned home." },
  { id: 44, tier: "15-20", text: "She organized all the files into separate folders so everything would be easier to find later." },
  { id: 45, tier: "15-20", text: "A good typing speed comes from accuracy first, followed by consistent practice and gradual improvement." },
  { id: 46, tier: "15-20", text: "The engineer carefully tested the circuit before connecting the final component to the power supply." },
  { id: 47, tier: "15-20", text: "Every small mistake during practice provides an opportunity to understand the process and improve." },
  { id: 48, tier: "15-20", text: "The weather changed suddenly, so everyone decided to finish the outdoor activity before evening." },
  { id: 49, tier: "15-20", text: "He wrote down the important instructions because remembering every detail without notes was difficult." },
  { id: 50, tier: "15-20", text: "The new system automatically stores the information and displays the results on the screen." },
  { id: 51, tier: "15-20", text: "Our greatest glory is not in never falling, but in rising every time we fall." },
  { id: 52, tier: "15-20", text: "Whether you think you can, or you think you can't - you're right." },
  { id: 53, tier: "15-20", text: "The journey of a thousand miles begins with one step." },
  { id: 54, tier: "15-20", text: "A person who never made a mistake never tried anything new." },
  { id: 55, tier: "15-20", text: "Success is walking from failure to failure with no loss of enthusiasm." },
  { id: 56, tier: "15-20", text: "You are never too old to set another goal or to dream a new dream." },
  { id: 57, tier: "15-20", text: "Start where you are. Use what you have. Do what you can." },
  { id: 58, tier: "15-20", text: "Opportunities don't happen. You create them." },
  { id: 59, tier: "15-20", text: "The harder I work, the luckier I get." },
  { id: 60, tier: "15-20", text: "There is no substitute for hard work." },
];

type ValidationState = "typing" | "perfect" | "minor_errors" | "major_errors" | "reveal_answer";

interface BlindTypingGameProps {
  theme: KeyboardTheme;
  colorZones: boolean;
  onOpenThemeSidebar?: () => void;
  onBackToHub: () => void;
}

// Website and games remain on the clean White, Blue, and Black palette
export const isPunctuation = (ch: string): boolean => {
  if (!ch) return false;
  return ch !== " " && !/[a-zA-Z0-9]/.test(ch);
};

export const getInitialTyped = (_phrase?: string): string => {
  return "";
};

export function BlindTypingGame({
  theme,
  colorZones,
  onOpenThemeSidebar,
  onBackToHub,
}: BlindTypingGameProps) {
  // Indirect Tier Management (5-10 -> 10-15 -> 15-20)
  // NEVER display "Level" anywhere in UI
  const [currentTier, setCurrentTier] = useState<"5-10" | "10-15" | "15-20">("5-10");
  const [tierSuccessCount, setTierSuccessCount] = useState<number>(0);

  // Filter pool by current indirect tier
  const getPoolForTier = useCallback((tier: "5-10" | "10-15" | "15-20") => {
    return ALL_BLIND_PHRASES.filter((p) => p.tier === tier);
  }, []);

  // Pick initial random sentence strictly from 5-10 words tier
  const [currentPhraseObj, setCurrentPhraseObj] = useState<BlindPhraseItem>(() => {
    const tierPool = ALL_BLIND_PHRASES.filter((p) => p.tier === "5-10");
    const initialIndex = Math.floor(Math.random() * tierPool.length);
    return tierPool[initialIndex] || ALL_BLIND_PHRASES[0];
  });

  const [typedInput, setTypedInput] = useState<string>(() => getInitialTyped(currentPhraseObj.text));
  const [validationState, setValidationState] = useState<ValidationState>("typing");
  const [activeChunk, setActiveChunk] = useState<1 | 2>(1); // 1 = First 7-8 words, 2 = Remaining words
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [lineFailCount, setLineFailCount] = useState<number>(0); // Tracks failed attempts on the current line
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [speechMode, setSpeechMode] = useState<"words" | "spelling">("words");
  const [streak, setStreak] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPhrase = currentPhraseObj.text;

  // Chunking logic for long sentences (>11 words / 15-20 tier)
  const words = currentPhrase.split(" ");
  const isMultiPart = words.length >= 12; // 15-20 words tier
  const splitWordIndex = isMultiPart ? Math.min(8, Math.max(6, Math.floor(words.length / 2))) : words.length;

  const part1Words = words.slice(0, splitWordIndex);
  const part2Words = words.slice(splitWordIndex);

  const part1Text = part1Words.join(" ");
  const part2Text = part2Words.join(" ");
  const part1EndCharIndex = part1Text.length; // Character index where Part 1 ends

  // Helper to speak custom voice prompt
  const speakVoiceRemark = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.05;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => {
      setIsSpeaking(false);
      onDone?.();
    };
    utter.onerror = () => {
      setIsSpeaking(false);
      onDone?.();
    };
    window.speechSynthesis.speak(utter);
  }, []);

  // Text-to-speech engine for speaking specific part or full sentence
  const speakPart = useCallback(
    (partNumber: 1 | 2) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();

      const textToSpeak = isMultiPart
        ? partNumber === 1
          ? part1Text
          : part2Text
        : currentPhrase;

      if (speechMode === "spelling") {
        const spelledText = textToSpeak
          .split("")
          .map((ch) => (ch === " " ? " space " : ` ${ch} `))
          .join("");
        const utter = new SpeechSynthesisUtterance(spelledText);
        utter.rate = speechRate * 0.85;
        utter.pitch = 1.0;
        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      } else {
        const utter = new SpeechSynthesisUtterance(textToSpeak);
        utter.rate = speechRate;
        utter.pitch = 1.0;
        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      }
    },
    [isMultiPart, part1Text, part2Text, currentPhrase, speechRate, speechMode]
  );

  // Advance to next phrase with indirect tier progression
  const nextRandomPhrase = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    // Determine target tier based on progression
    let nextTier = currentTier;
    // Advance tier every 3 successful completions (5-10 -> 10-15 -> 15-20)
    if (currentTier === "5-10" && tierSuccessCount >= 3) {
      nextTier = "10-15";
      setCurrentTier("10-15");
      setTierSuccessCount(0);
    } else if (currentTier === "10-15" && tierSuccessCount >= 3) {
      nextTier = "15-20";
      setCurrentTier("15-20");
      setTierSuccessCount(0);
    }

    const tierPool = getPoolForTier(nextTier);
    const otherPool = tierPool.filter((p) => p.id !== currentPhraseObj.id);
    const candidatePool = otherPool.length > 0 ? otherPool : tierPool;
    const randomIdx = Math.floor(Math.random() * candidatePool.length);
    
    setLineFailCount(0); // Reset mistake count for new line
    setCurrentPhraseObj(candidatePool[randomIdx]);
  }, [currentTier, tierSuccessCount, currentPhraseObj.id, getPoolForTier]);

  // Reset and speak Part 1 when phrase changes
  useEffect(() => {
    setTypedInput("");
    setValidationState("typing");
    setActiveChunk(1);
    setMistakesCount(0);
    setErrorIndices(new Set());
    setShowHint(false);
    setStartTime(null);
    setEndTime(null);

    const timer = setTimeout(() => {
      speakPart(1);
    }, 350);

    return () => {
      clearTimeout(timer);
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentPhraseObj, speakPart]);

  const resetCurrentPhrase = useCallback(() => {
    setTypedInput("");
    setValidationState("typing");
    setActiveChunk(1);
    setMistakesCount(0);
    setErrorIndices(new Set());
    setShowHint(false);
    setStartTime(null);
    setEndTime(null);
    speakPart(1);
  }, [speakPart]);

  // Handle revealing the answer ONLY when requested by the student
  const triggerRevealAnswer = useCallback(() => {
    setValidationState("reveal_answer");
    soundEngine.playKeySound("Backspace");
    const speechText = `This is how it should be: ${currentPhrase}`;
    speakVoiceRemark(speechText);
  }, [currentPhrase, speakVoiceRemark]);

  // Backspace handler: strips exactly one character from typedInput
  const handleBackspace = useCallback(() => {
    if (validationState !== "typing") return;
    setTypedInput((prev) => {
      if (prev.length === 0) return prev;
      soundEngine.playKeySound("Backspace");
      return prev.slice(0, -1);
    });
  }, [validationState]);

  // Main keystroke handler: appends EXACTLY what the student typed without auto-fills
  const handleCharTyped = useCallback(
    (char: string) => {
      if (validationState !== "typing") return;

      if (!startTime) {
        setStartTime(Date.now());
      }

      setTypedInput((prev) => {
        if (prev.length >= currentPhrase.length) {
          return prev;
        }

        // Match case of expected char if the same letter (natural typing feel)
        const targetExpected = currentPhrase[prev.length];
        let charToAdd = char;
        if (targetExpected && char.toLowerCase() === targetExpected.toLowerCase()) {
          charToAdd = targetExpected;
        }

        const next = prev + charToAdd;
        soundEngine.playKeySound(char === " " ? "Space" : char);

        // Multi-part pacing: when student reaches Part 1 boundary, trigger Part 2 speech
        if (isMultiPart && activeChunk === 1 && next.length >= part1EndCharIndex) {
          setActiveChunk(2);
          setTimeout(() => {
            speakPart(2);
          }, 250);
        }

        // Sentence length reached: check accuracy
        if (next.length >= currentPhrase.length) {
          const end = Date.now();
          setEndTime(end);

          const targetLength = currentPhrase.length;
          let errors = 0;
          const errorIdxSet = new Set<number>();

          for (let i = 0; i < targetLength; i++) {
            if (next[i]?.toLowerCase() !== currentPhrase[i]?.toLowerCase()) {
              errors++;
              errorIdxSet.add(i);
            }
          }

          setMistakesCount(errors);
          setErrorIndices(errorIdxSet);

          // Update XP according to rules: 0 err -> +0.5 XP, 1 err -> +0.25 XP, >1 err -> -0.5 XP
          try {
            recordBlindTypingPhraseResult(errors);
          } catch {}

          if (errors === 0) {
            setValidationState("perfect");
            setStreak((p) => p + 1);
            setTierSuccessCount((p) => p + 1);
            setLineFailCount(0);
            soundEngine.playKeySound("Enter");
            speakVoiceRemark("Perfect match! Well done.");

            updateStudentProgress({
              gameType: "blindTyping",
              details: { lines: 1 },
            });
          } else {
            const newFailCount = lineFailCount + 1;
            setLineFailCount(newFailCount);

            if (errors <= 2) {
              setValidationState("minor_errors");
              soundEngine.playKeySound("Backspace");
              speakVoiceRemark("Not a perfect match. Would you like to retry?");
            } else {
              setValidationState("major_errors");
              soundEngine.playKeySound("Backspace");
              speakVoiceRemark("Mistakes made. Would you like to retry?");
            }
          }
        }

        return next;
      });
    },
    [
      validationState,
      startTime,
      currentPhrase,
      isMultiPart,
      activeChunk,
      part1EndCharIndex,
      speakPart,
      lineFailCount,
      speakVoiceRemark,
    ]
  );

  // Unified global keyboard listener for physical keystrokes and navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an external modal/input is active
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;

      if (validationState === "minor_errors" || validationState === "major_errors") {
        if (e.key.toLowerCase() === "y" || e.key === "Enter") {
          e.preventDefault();
          resetCurrentPhrase();
        } else if (e.key.toLowerCase() === "n" || e.key === "Escape") {
          e.preventDefault();
          nextRandomPhrase();
        } else if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          triggerRevealAnswer();
        }
        return;
      }

      if (validationState === "reveal_answer") {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
          e.preventDefault();
          nextRandomPhrase();
        }
        return;
      }

      if (validationState !== "typing") return;

      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        handleCharTyped(" ");
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        handleCharTyped(e.key);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    validationState,
    handleBackspace,
    handleCharTyped,
    resetCurrentPhrase,
    nextRandomPhrase,
    triggerRevealAnswer,
  ]);

  // Virtual 3D Mechanical Keyboard click handler (strictly for virtual mouse/touch clicks)
  const handleVirtualKeyPress = useCallback(
    (key?: string, code?: string, isVirtual?: boolean) => {
      // Suppress physical key events dispatched by Keyboard component to prevent double-typing
      if (isVirtual === false) return;
      if (validationState !== "typing") return;

      if (code === "Backspace") {
        handleBackspace();
      } else if (code === "Space" || key === "SPACE") {
        handleCharTyped(" ");
      } else if (key && key.length === 1) {
        handleCharTyped(key.toLowerCase());
      }
    },
    [validationState, handleBackspace, handleCharTyped]
  );

  // Metrics calculation
  const targetChars = currentPhrase.split("");
  const typedChars = typedInput.split("");
  const durationSec = startTime && endTime ? Math.max(1, (endTime - startTime) / 1000) : 1;
  const wordCount = currentPhrase.split(" ").length;
  const wpm = Math.round((wordCount / durationSec) * 60);
  const targetLetterCount = targetChars.length;
  const correctCount = Math.max(0, targetLetterCount - mistakesCount);
  const accuracy = Math.round((correctCount / (targetLetterCount || 1)) * 100);

  return (
    <div className="relative z-10 w-full max-w-5xl px-3 sm:px-6 py-2 flex flex-col items-center gap-3 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-blue-200">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToHub}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Games Hub</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 shadow-xs">
            <img src="/blindtypingicon.png" alt="Blind Typing" className="w-7 h-7 object-contain rounded-lg shadow-2xs hover:scale-135 transition-transform duration-200 cursor-pointer" />
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">
              Blind Typing
            </span>
          </div>
        </div>

        {/* Right HUD Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-blue-200 bg-white text-slate-900 text-xs font-mono font-bold shadow-xs">
            <Flame className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span>Streak: {streak}</span>
          </div>

          {onOpenThemeSidebar && (
            <button
              onClick={onOpenThemeSidebar}
              className="p-1.5 rounded-xl border border-blue-200 bg-white text-slate-800 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all cursor-pointer shadow-xs"
              title="Themes"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
            </button>
          )}
        </div>
      </div>

      {/* Ultra-Compact Audio HUD Card */}
      <div
        className={`w-full px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-md flex flex-col gap-2.5 transition-all ${
          validationState === "perfect"
            ? "bg-emerald-50 border-emerald-300 text-slate-900"
            : validationState === "reveal_answer"
            ? "bg-blue-50 border-blue-400 text-slate-900"
            : validationState === "minor_errors"
            ? "bg-amber-50 border-amber-300 text-slate-900"
            : validationState === "major_errors"
            ? "bg-rose-50 border-rose-300 text-slate-900 animate-shake"
            : "bg-white border-blue-200 text-slate-900"
        }`}
      >
        {/* Controls Row */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isSpeaking && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isSpeaking ? "bg-purple-500" : "bg-slate-400"
                }`}
              ></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {isSpeaking
                  ? isMultiPart
                    ? `Speaking Part ${activeChunk} of 2...`
                    : "Speaking Audio..."
                  : validationState === "reveal_answer"
                  ? "This is how it should be • Moving to Next..."
                  : validationState === "minor_errors"
                  ? `Mistake on line (${lineFailCount}/3) • Retype or Continue?`
                  : validationState === "major_errors"
                  ? `Attempt ${lineFailCount}/3 • Retype or Reveal?`
                  : isMultiPart
                  ? `Part ${activeChunk}/2 • ${activeChunk === 1 ? `First ${splitWordIndex} Words` : "Remaining Words"} (${wordCount} total words)`
                  : `Audio Phrase #${currentPhraseObj.id} (${wordCount} words)`}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                speakPart(activeChunk);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              title={isMultiPart ? `Hear Part ${activeChunk} again` : "Hear the phrase again"}
            >
              <Volume2 className="w-3 h-3" />
              <span>{isMultiPart ? `Hear Part ${activeChunk}` : "Hear Again"}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSpeechMode((prev) => (prev === "words" ? "spelling" : "words"));
              }}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                speechMode === "spelling"
                  ? "bg-blue-100 border-blue-400 text-blue-800"
                  : "bg-white border-blue-200 text-slate-800 hover:bg-blue-50"
              }`}
            >
              Mode: {speechMode === "words" ? "Words" : "Spell"}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSpeechRate((prev) => (prev === 0.75 ? 0.95 : prev === 0.95 ? 1.15 : 0.75));
              }}
              className="px-2 py-1 rounded-lg border border-blue-200 bg-white text-slate-800 hover:bg-blue-50 text-[10px] font-mono font-bold transition-all cursor-pointer"
            >
              {speechRate === 0.75 ? "0.75x" : speechRate === 0.95 ? "1.0x" : "1.2x"}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                resetCurrentPhrase();
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              title="Reset phrase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: ACTIVE BLINDFOLD TYPING PROGRESS (CHUNK-HIGHLIGHTED) */}
        {/* ============================================================ */}
        {validationState === "typing" && (
          <div className="w-full flex flex-col items-center gap-1.5 pt-1 border-t border-blue-100">
            {/* Masked Dots Progress Bar with Chunk Highlight Boundaries */}
            <div className="w-full flex flex-wrap items-center justify-center gap-1 p-2 rounded-xl bg-blue-50/50 border border-blue-200/80">
              {targetChars.map((char, idx) => {
                const isTyped = idx < typedChars.length;
                const typedChar = typedChars[idx];
                const isSpace = char === " ";
                const isPart1Slot = isMultiPart && idx < part1EndCharIndex;
                const isCurrentActivePart = isMultiPart
                  ? (activeChunk === 1 && isPart1Slot) || (activeChunk === 2 && !isPart1Slot)
                  : true;

                if (isSpace) {
                  return (
                    <div
                      key={idx}
                      className={`w-3 h-6 flex items-center justify-center font-mono text-[11px] rounded transition-all ${
                        isTyped
                          ? "bg-blue-200 text-blue-800 font-bold border border-blue-400"
                          : idx === part1EndCharIndex && isMultiPart
                          ? "border-r-2 border-dashed border-purple-500/60 mx-1 text-purple-400 font-black"
                          : "text-slate-400 opacity-40"
                      }`}
                      title={isTyped ? "Space typed" : "Space"}
                    >
                      ␣
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`min-w-5 h-6 px-1 rounded flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      isTyped
                        ? "bg-blue-600 text-white border border-blue-700 shadow-xs"
                        : isCurrentActivePart
                        ? "bg-blue-50 border-2 border-blue-500 text-blue-800 shadow-xs"
                        : "bg-slate-100 border border-slate-200 text-slate-400 opacity-40"
                    }`}
                  >
                    {isTyped ? (showHint ? typedChar : "●") : "○"}
                  </div>
                );
              })}
            </div>

            {/* Bottom Progress & Chunk Indicator */}
            <div className="w-full flex items-center justify-between text-[11px] font-mono px-1">
              <span className="text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span>
                  Progress: <strong className="text-blue-600">{typedChars.length}</strong> / {targetChars.length} chars
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                  Exact Keystroke Input
                </span>
                {isMultiPart && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                      activeChunk === 1
                        ? "bg-purple-500/20 text-purple-700 border border-purple-300"
                        : "bg-emerald-500/20 text-emerald-700 border border-emerald-300"
                    }`}
                  >
                    {activeChunk === 1 ? `Part 1 (First ${splitWordIndex} Words)` : "Part 2 (Next Words)"}
                  </span>
                )}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint((prev) => !prev);
                }}
                className="text-slate-500 hover:text-blue-600 underline transition-colors cursor-pointer text-[10px] font-bold"
              >
                {showHint ? "Hide Peek" : "Peek Typed Letters"}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: PERFECT MATCH (0 ERRORS)                             */}
        {/* ============================================================ */}
        {validationState === "perfect" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-emerald-500/20"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="px-3 py-1 rounded-xl font-mono text-xs font-bold border bg-emerald-50 text-emerald-900 border-emerald-300">
                {currentPhrase}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                {wpm} WPM
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                100% Match
              </span>

              <button
                onClick={nextRandomPhrase}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Next Phrase</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* ============================================================ */}
        {/* VIEW 3: MINOR ERRORS (1 OR 2 ERRORS) -> RETRY PROMPT         */}
        {/* ============================================================ */}
        {validationState === "minor_errors" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-2.5 pt-1 border-t border-amber-500/20"
          >
            {/* Diff View showing what the user typed with mistakes highlighted */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="px-3 py-1 rounded-xl font-mono text-xs font-bold border bg-amber-50 border-amber-300 text-slate-900">
                  <span className="text-slate-500 mr-2 text-[11px] font-sans">You typed:</span>
                  {typedChars.map((char, idx) => {
                    const isError = errorIndices.has(idx);
                    return (
                      <span
                        key={idx}
                        className={
                          isError
                            ? "text-rose-700 underline font-black bg-rose-100 px-0.5 rounded border border-rose-300"
                            : "text-emerald-700 font-bold"
                        }
                      >
                        {char === " " ? "␣" : char}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-900 px-2 py-0.5 rounded bg-amber-100 border border-amber-300">
                  {mistakesCount} {mistakesCount === 1 ? "mistake" : "mistakes"} ({accuracy}%)
                </span>
              </div>
            </div>

            {/* User action options */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white border-2 border-amber-300 shadow-xs text-xs">
              <span className="font-extrabold text-amber-950 text-xs sm:text-sm">
                Not a perfect match. What would you like to do?
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetCurrentPhrase}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-xs transition-all cursor-pointer"
                  title="Press 'Y' or click to re-type"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Retry [Y]</span>
                </button>

                <button
                  onClick={triggerRevealAnswer}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black shadow-xs transition-all cursor-pointer"
                  title="Press 'R' or click to show the sentence"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reveal Answer [R]</span>
                </button>

                <button
                  onClick={nextRandomPhrase}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black shadow-xs transition-all cursor-pointer"
                  title="Press 'N' or click to continue"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Next [N]</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* VIEW 4: MAJOR ERRORS (3+ ERRORS ON ATTEMPT) -> RETRY LINE    */}
        {/* ============================================================ */}
        {validationState === "major_errors" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col gap-2.5 p-3 rounded-xl bg-white border-2 border-rose-400 text-rose-950 font-extrabold shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-sm font-black text-rose-700">
                    {mistakesCount} mistakes made ({accuracy}% accuracy).
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Would you like to try this sentence again?
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetCurrentPhrase}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-xs transition-all cursor-pointer"
                  title="Press 'Y' or click to retry"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Retry [Y]</span>
                </button>

                <button
                  onClick={triggerRevealAnswer}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black shadow-xs transition-all cursor-pointer"
                  title="Press 'R' or click to reveal answer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reveal Answer [R]</span>
                </button>

                <button
                  onClick={nextRandomPhrase}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black shadow-xs transition-all cursor-pointer"
                  title="Press 'N' or click to continue"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Next [N]</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* VIEW 5: REVEAL ANSWER (WHEN REQUESTED)                       */}
        {/* ============================================================ */}
        {validationState === "reveal_answer" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col gap-2.5 pt-1.5 border-t border-purple-500/30"
          >
            {/* Header remark */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-purple-400">
                  This is how it should be:
                </span>
              </div>

              <button
                onClick={nextRandomPhrase}
                className="flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prominent Revealed Words Display */}
            <div className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50/80 shadow-sm flex flex-wrap items-center justify-center gap-2">
              {words.map((word, wIdx) => (
                <span
                  key={wIdx}
                  className="px-2.5 py-1 rounded-lg font-mono text-sm font-bold border bg-white border-blue-200 text-slate-900 shadow-xs"
                >
                  {word}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Prominent 3D Mechanical Keyboard Front and Center */}
      <div className="flex w-full items-center justify-center p-0 sm:p-2">
        <Keyboard
          className="mx-auto"
          theme={theme}
          colorZones={colorZones}
          allowMouseClick={true}
          onlyVirtualKeyPress={true}
          onKeyPress={handleVirtualKeyPress}
          onOpenThemeSidebar={onOpenThemeSidebar}
        />
      </div>
    </div>
  );
}

export default BlindTypingGame;
