"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Keyboard from "@/components/ui/keyboard";
import { KeyboardGame } from "@/components/ui/KeyboardGame";
import { GamesHub } from "@/components/ui/GamesHub";
import { Dashboard } from "@/components/ui/Dashboard";
import { FallingWordsGame } from "@/components/ui/FallingWordsGame";
import { SoundMatrixGame } from "@/components/ui/SoundMatrixGame";
import { BlindTypingGame } from "@/components/ui/BlindTypingGame";
import { CodeSprintGame } from "@/components/ui/CodeSprintGame";
import { ShortcutsGame } from "@/components/ui/ShortcutsGame";
import { TemporaryLoginCard } from "@/components/ui/TemporaryLoginCard";
import { KEYBOARD_THEMES, type KeyboardTheme } from "@/lib/themes";
import { registerUser, loginUser, resetPassword, validateUserExists, updateStudentProgress, updateUserTheme, getUserPreferences, type UserRecord } from "@/lib/db";
import { recordGamePlay, setLatestPlayedGameId } from "@/lib/userStats";
import { 
  Keyboard as KeyboardIcon, Sparkles, 
  Check, RotateCcw, Flame, Palette,
  Gamepad2, ShieldCheck, LogIn, User, X, AlertTriangle, UserPlus,
  Eye, EyeOff, LogOut, ChevronDown, KeyRound, CheckCircle2, ArrowLeft,
  BarChart3
} from "lucide-react";
import confetti from "canvas-confetti";
// import { MusicPlayer } from "@/components/ui/MusicPlayer";
// import { bgMusic } from "@/lib/bgMusic";
import { soundEngine } from "@/lib/sound";

export type AppPage = "start" | "academy" | "codesprint" | "speedtest" | "fallingwords" | "soundmatrix" | "blindtyping" | "shortcuts" | "dashboard";

export default function KeyboardLandingPage() {
  const [currentPage, setCurrentPage] = useState<AppPage>("start");
  const [currentTheme, setCurrentTheme] = useState<KeyboardTheme>(KEYBOARD_THEMES[0]);
  
  // Authentication & Session
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("setu_active_user") || null;
    }
    return null;
  });
  const [loginWarningMessage, setLoginWarningMessage] = useState<string | null>(null);

  const [colorZones, setColorZones] = useState<boolean>(false);
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [lastTriggeredKey, setLastTriggeredKey] = useState<{ key: string; code: string; time: number } | null>(null);

  // Validate active session against database on startup / mount & restore user's saved theme
  useEffect(() => {
    if (loggedInUser) {
      validateUserExists(loggedInUser).then((exists) => {
        if (!exists) {
          console.warn("[Session] Active user does not exist in local database. Resetting session.");
          setLoggedInUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("setu_active_user");
          }
        }
      });

      // Restore user's saved keyboard theme & color zones from database
      getUserPreferences(loggedInUser).then((prefs) => {
        if (prefs) {
          const matched = KEYBOARD_THEMES.find((t) => t.id === prefs.themeId);
          if (matched) setCurrentTheme(matched);
          setColorZones(Boolean(prefs.colorZones));
        }
      });
    }
  }, [loggedInUser]);

  // Keep track of the latest played game whenever user enters a game
  useEffect(() => {
    if (currentPage !== "start" && currentPage !== "dashboard") {
      setLatestPlayedGameId(currentPage);
    }
  }, [currentPage]);

  // Navigation: Directly opens Arcade & Games
  const handleLaunchArcade = useCallback((targetPage: AppPage = "start") => {
    setCurrentPage(targetPage);
  }, []);

  // Lock scroll when login modal is open
  useEffect(() => {
    if (isLoginModalOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isLoginModalOpen]);

  // Speed test state
  const testPhrases = [
    "The quick brown fox jumps over the lazy dog.",
    "Tactile mechanical switches provide supreme typing accuracy and satisfaction.",
    "Antigravity AI empowers developers to build and test next-generation web apps.",
    "Clean 3D design and proportional layouts create stunning user experiences.",
    "Precision keycaps with smooth linear stems enable lightning-fast typing records.",
    "Master touch typing through rhythm, finger positioning, and muscle memory.",
  ];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [typedInput, setTypedInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number>(100);
  const autoNextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup pending timer on unmount
  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
      }
    };
  }, []);

  const targetPhrase = testPhrases[currentPhraseIndex];

  const handleKeyTriggered = (key: string, code: string) => {
    setLastTriggeredKey({ key, code, time: Date.now() });
  };

  const handleTestTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!startTime) {
      setStartTime(Date.now());
    }
    setTypedInput(val);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetPhrase[i]) correct++;
    }
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setAccuracy(acc);

    // Check completion
    if (val === targetPhrase) {
      const durationMin = (Date.now() - (startTime || Date.now())) / 60000;
      const wordCount = targetPhrase.split(" ").length;
      const calculatedWpm = Math.round(wordCount / (durationMin || 0.01));
      setWpm(calculatedWpm);

      // Record to database table report
      updateStudentProgress({
        gameType: "speedTest",
        details: { wpm: calculatedWpm, accuracy: acc },
      });

      // Record to user game analytics stats
      recordGamePlay({
        gameId: "speedtest",
        gameTitle: "Speed Typing Arena",
        wpm: calculatedWpm,
        accuracy: acc,
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      // Clear any existing pending auto-transition
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
      }

      // Automatically advance to the next phrase after a brief celebratory pause
      autoNextTimeoutRef.current = setTimeout(() => {
        setTypedInput("");
        setStartTime(null);
        setCurrentPhraseIndex((prev) => (prev + 1) % testPhrases.length);
      }, 700);
    }
  };

  const resetSpeedTest = () => {
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
    }
    setTypedInput("");
    setStartTime(null);
    setWpm(null);
    setAccuracy(100);
    setCurrentPhraseIndex((prev) => (prev + 1) % testPhrases.length);
  };


  // Website theme is permanently locked to the clean White, Blue, and Black palette;
  // Keyboard themes only customize the visual colors of the 3D mechanical keyboard itself.
  const isDark = false;

  return (
    <div
      className="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col items-center justify-start selection:bg-blue-600 selection:text-white relative overflow-x-clip"
    >
      {/* ============================================================ */}
      {/* PAGE: USER ACTIVITY DASHBOARD (BAR & LINE GRAPHS)             */}
      {/* ============================================================ */}
      {currentPage === "dashboard" && (
        <Dashboard
          theme={currentTheme}
          loggedInUser={loggedInUser}
          onBackToGames={() => setCurrentPage("start")}
          onPlayGame={(gameId) => setCurrentPage(gameId as AppPage)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* ============================================================ */}
      {/* PAGE: LET'S START - ARCADE GAMES HUB SELECTOR                 */}
      {/* ============================================================ */}
      {currentPage === "start" && (
        <GamesHub
          theme={currentTheme}
          loggedInUser={loggedInUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={() => {
            setLoggedInUser(null);
            if (typeof window !== "undefined") {
              localStorage.removeItem("setu_active_user");
            }
          }}
          onSelectGame={(gameId) => {
            setLatestPlayedGameId(gameId);
            setCurrentPage(gameId as AppPage);
          }}
          onOpenDashboard={() => setCurrentPage("dashboard")}
        />
      )}

      {/* ============================================================ */}
      {/* GAME: CODE SPRINT & DEV SYNTAX (DUAL-PANE COMPILER & TYPING) */}
      {/* ============================================================ */}
      {currentPage === "codesprint" && (
        <CodeSprintGame
          theme={currentTheme}
          onBackToHub={() => setCurrentPage("start")}
        />
      )}

      {/* ============================================================ */}
      {/* GAME 1: TOUCH TYPING ACADEMY (16-LEVEL COMPREHENSIVE ENGINE) */}
      {/* ============================================================ */}
      {currentPage === "academy" && (
        <KeyboardGame
          theme={currentTheme}
          colorZones={colorZones}
          onBackToHome={() => setCurrentPage("start")}
        />
      )}

      {/* ============================================================ */}
      {/* GAME 2: METEOR DEFENSE (FALLING WORDS ARCADE)                */}
      {/* ============================================================ */}
      {currentPage === "fallingwords" && (
        <FallingWordsGame
          theme={currentTheme}
          colorZones={colorZones}
          onBackToHub={() => setCurrentPage("start")}
        />
      )}

      {/* ============================================================ */}
      {/* GAME 3: SOUND MATRIX ECHO (SWITCH ACOUSTIC SIMON SAYS)       */}
      {/* ============================================================ */}
      {currentPage === "soundmatrix" && (
        <SoundMatrixGame
          theme={currentTheme}
          colorZones={colorZones}
          onBackToHub={() => setCurrentPage("start")}
        />
      )}

      {/* ============================================================ */}
      {/* GAME 4: BLIND TYPING DOJO (PURE AUDIO DICTATION)             */}
      {/* ============================================================ */}
      {currentPage === "blindtyping" && (
        <BlindTypingGame
          theme={currentTheme}
          colorZones={colorZones}
          onBackToHub={() => setCurrentPage("start")}
        />
      )}

      {/* ============================================================ */}
      {/* GAME 4: SPEED TEST ARENA PAGE                                */}
      {/* ============================================================ */}
      {currentPage === "speedtest" && (
        <section className="relative z-10 w-full max-w-5xl px-4 py-8 flex flex-col items-center gap-6 animate-in fade-in duration-300">
          {/* Top Header Navigation Bar (Standardized Suite Header) */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-200">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setCurrentPage("start")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Back to Games Hub"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Games Hub</span>
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 shadow-xs">
                <img src="/speedtypingemblem.png" alt="Speed Typing Arena" className="w-7 h-7 object-contain rounded-lg shadow-2xs hover:scale-135 transition-transform duration-200 cursor-pointer" />
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">
                  Speed Typing Arena
                </span>
              </div>

              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                WPM & Live Accuracy
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetSpeedTest}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Next Phrase</span>
              </button>
            </div>
          </div>

          {/* Speed Test Banner */}
          <div className="w-full p-6 sm:p-8 border border-slate-200/90 rounded-3xl shadow-[0_16px_40px_-8px_rgba(15,23,42,0.1),0_4px_14px_-2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] flex flex-col md:flex-row items-stretch gap-6 bg-white text-slate-900 ring-1 ring-black/[0.03]">
            {/* Left / Main Typing Area */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4" /> Live Typing Challenge
                </span>
                <button
                  onClick={resetSpeedTest}
                  className="text-xs flex items-center gap-1 transition-colors font-semibold cursor-pointer text-slate-500 hover:text-slate-900"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Next Phrase
                </button>
              </div>

              {/* Target phrase */}
              <div className="text-base sm:text-lg font-medium font-mono p-5 rounded-2xl border border-blue-100 tracking-wide select-none leading-relaxed bg-slate-50 text-slate-900">
                {targetPhrase.split("").map((char, index) => {
                  let color = "text-slate-400";
                  if (index < typedInput.length) {
                    color = typedInput[index] === char ? "text-emerald-600 font-bold" : "text-rose-600 bg-rose-100 rounded px-0.5";
                  }
                  return (
                    <span key={index} className={color}>
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* Input field */}
              <input
                type="text"
                value={typedInput}
                onChange={handleTestTyping}
                placeholder="Start typing the phrase above..."
                className="w-full p-4 border-2 border-blue-200 focus:border-blue-600 focus:outline-none rounded-2xl font-mono text-sm transition-all shadow-xs bg-white text-slate-900 placeholder-slate-400"
                autoFocus
              />
            </div>

            {/* Right Side Vertical Metrics Panel */}
            <div className="w-full md:w-56 flex flex-row md:flex-col items-center justify-around p-5 rounded-2xl border-2 border-blue-200 gap-3 bg-blue-50/50">
              <div className="text-center w-full">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-0.5">WPM Speed</span>
                <span className="text-3xl font-black font-mono text-blue-600 block">{wpm !== null ? `${wpm}` : "--"}</span>
              </div>
              <div className="w-[1px] md:w-full h-8 md:h-[1px] bg-blue-200" />
              <div className="text-center w-full">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-0.5">Accuracy</span>
                <span className={`text-3xl font-black font-mono block ${accuracy > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{accuracy}%</span>
              </div>
              <div className="w-[1px] md:w-full h-8 md:h-[1px] bg-blue-200" />
              <div className="text-center w-full">
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider block mb-0.5">Status</span>
                <span className="text-xs font-black font-mono text-blue-600 block truncate">{typedInput === targetPhrase ? "COMPLETED! 🎉" : "TYPING..."}</span>
              </div>
            </div>
          </div>

          {/* Interactive Keyboard in Speed Test Page */}
          <div className="flex w-full items-center justify-center p-2 sm:p-4 mt-2">
            <Keyboard
              className="mx-auto"
              theme={currentTheme}
              colorZones={colorZones}
              onKeyPress={handleKeyTriggered}
            />
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* GAME 5: KEYBOARD SHORTCUTS DOJO                              */}
      {/* ============================================================ */}
      {currentPage === "shortcuts" && (
        <ShortcutsGame
          theme={currentTheme}
          colorZones={colorZones}
          onBackToHome={() => setCurrentPage("start")}
        />
      )}

      {/* ============================================================ */}
      {/* ⚠️ DEVELOPER NOTICE: TEMPORARY AUTHENTICATION CARD           */}
      {/* (NOT TO BE INCLUDED IN FINAL PRODUCTION RELEASE)             */}
      {/* ============================================================ */}
      <TemporaryLoginCard
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginWarningMessage(null);
        }}
        onLoginSuccess={(user) => {
          setLoggedInUser(user.username);
          if (typeof window !== "undefined") {
            localStorage.setItem("setu_active_user", user.username);
          }
          if (user.themeId) {
            const matched = KEYBOARD_THEMES.find((t) => t.id === user.themeId);
            if (matched) setCurrentTheme(matched);
          }
          if (user.colorZones !== undefined) {
            setColorZones(Boolean(user.colorZones));
          }
          setIsLoginModalOpen(false);
          setLoginWarningMessage(null);
        }}
        warningMessage={loginWarningMessage}
        onClearWarning={() => setLoginWarningMessage(null)}
        currentTheme={currentTheme}
        colorZones={colorZones}
        onKeyTriggered={handleKeyTriggered}
      />
    </div>
  );
}
