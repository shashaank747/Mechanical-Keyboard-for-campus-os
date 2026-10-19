"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Keyboard from "@/components/ui/keyboard";
import { ThemeSidebar } from "@/components/ui/ThemeSidebar";
import { KeyboardGame } from "@/components/ui/KeyboardGame";
import { GamesHub } from "@/components/ui/GamesHub";
import { Dashboard } from "@/components/ui/Dashboard";
import { FallingWordsGame } from "@/components/ui/FallingWordsGame";
import { SoundMatrixGame } from "@/components/ui/SoundMatrixGame";
import { BlindTypingGame } from "@/components/ui/BlindTypingGame";
import { CodeSprintGame } from "@/components/ui/CodeSprintGame";
import { ShortcutsGame } from "@/components/ui/ShortcutsGame";
import { KEYBOARD_THEMES, type KeyboardTheme } from "@/lib/themes";
import { registerUser, loginUser, resetPassword, validateUserExists, updateStudentProgress, updateUserTheme, getUserPreferences, type UserRecord } from "@/lib/db";
import { recordGamePlay, setLatestPlayedGameId } from "@/lib/userStats";
import { 
  Keyboard as KeyboardIcon, Sparkles, 
  Check, RotateCcw, Flame, Palette,
  Menu, Gamepad2, ShieldCheck, LogIn, User, X, AlertTriangle, UserPlus,
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
  const [isThemeSidebarOpen, setIsThemeSidebarOpen] = useState(false);
  
  // Authentication & Session
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("setu_active_user") || null;
    }
    return null;
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
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


      {/* Floating Hamburger Icon for Settings (Top Left) - Toggles Sidebar Open / Close */}
      <button
        onClick={() => setIsThemeSidebarOpen((prev) => !prev)}
        className="fixed top-3.5 left-3.5 z-[60] p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 hover:text-blue-600 border border-blue-200 shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center group"
        aria-label={isThemeSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        title={isThemeSidebarOpen ? "Close Menu" : "Menu & Settings"}
      >
        {isThemeSidebarOpen ? (
          <X className="w-5 h-5 text-slate-900 group-hover:text-blue-600 transition-transform group-hover:scale-110" />
        ) : (
          <Menu className="w-5 h-5 text-slate-900 group-hover:text-blue-600 transition-transform group-hover:scale-110" />
        )}
      </button>

      {/* ============================================================ */}
      {/* PAGE: USER ACTIVITY DASHBOARD (BAR & LINE GRAPHS)             */}
      {/* ============================================================ */}
      {currentPage === "dashboard" && (
        <Dashboard
          theme={currentTheme}
          loggedInUser={loggedInUser}
          onBackToGames={() => setCurrentPage("start")}
          onPlayGame={(gameId) => setCurrentPage(gameId as AppPage)}
        />
      )}

      {/* ============================================================ */}
      {/* PAGE: LET'S START - ARCADE GAMES HUB SELECTOR                 */}
      {/* ============================================================ */}
      {currentPage === "start" && (
        <GamesHub
          theme={currentTheme}
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
          onOpenThemeSidebar={() => setIsThemeSidebarOpen(true)}
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
          onOpenThemeSidebar={() => setIsThemeSidebarOpen(true)}
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
          onOpenThemeSidebar={() => setIsThemeSidebarOpen(true)}
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
          onOpenThemeSidebar={() => setIsThemeSidebarOpen(true)}
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
              onOpenThemeSidebar={() => setIsThemeSidebarOpen(true)}
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


      {/* Slide-over Theme Sidebar Drawer */}
      <ThemeSidebar
        isOpen={isThemeSidebarOpen}
        onClose={() => setIsThemeSidebarOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(theme) => {
          setCurrentTheme(theme);
          updateUserTheme({
            username: loggedInUser || undefined,
            themeId: theme.id,
            colorZones,
          });
        }}
        currentPage={currentPage}
        onNavigate={(page) => {
          handleLaunchArcade(page);
        }}
        colorZones={colorZones}
        onToggleColorZones={() => {
          const nextZones = !colorZones;
          setColorZones(nextZones);
          updateUserTheme({
            username: loggedInUser || undefined,
            themeId: currentTheme.id,
            colorZones: nextZones,
          });
        }}
      />

      {/* ============================================================ */}
      {/* TOP-CENTER WING AUTHENTICATION MODAL WITH LIVE 3D KEYBOARD   */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-2 sm:p-4 bg-slate-950/40 backdrop-blur-xl overflow-hidden">
            {/* Enriched & Spacious Authentication Wing Card */}
            <motion.div
              initial={{ opacity: 0, y: -25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-5xl p-6 sm:p-8 rounded-3xl border-2 shadow-[0_20px_50px_rgba(37,99,235,0.15)] relative z-20 backdrop-blur-2xl flex flex-col gap-6 bg-white border-blue-200 text-slate-900"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setLoginWarningMessage(null);
                }}
                className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer z-30"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Warning Alert if triggered without login */}
              {loginWarningMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                    <span>{loginWarningMessage}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-80 uppercase hidden sm:inline">Authentication Required</span>
                </motion.div>
              )}

              {/* Top Header Row: Branding & Mode Switcher Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
                <div className="flex items-center gap-3.5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                        {authMode === "signin"
                          ? "Student & Developer Sign In"
                          : authMode === "signup"
                          ? "Create SETU Account"
                          : "Reset Account Password"}
                      </h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono uppercase font-black">
                        SETU
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {authMode === "signin"
                        ? "Sign in to unlock the Arcade, save typing metrics, and access all 16 levels"
                        : authMode === "signup"
                        ? "Join SETU to track muscle memory streaks, personal best WPM, and leaderboards"
                        : "Enter your registered email or username to choose a new password"}
                    </p>
                  </div>
                </div>

                {/* Mode Switcher Pill */}
                <div className="flex rounded-2xl p-1 bg-slate-100 border border-blue-200 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setLoginWarningMessage(null);
                      setForgotSuccessMessage(null);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      authMode === "signin"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setLoginWarningMessage(null);
                      setForgotSuccessMessage(null);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      authMode === "signup"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* Forgot Password Success Banner */}
              {forgotSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{forgotSuccessMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setForgotSuccessMessage(null);
                    }}
                    className="px-3 py-1 bg-emerald-500 text-white text-[11px] font-black rounded-lg hover:bg-emerald-600 transition-all cursor-pointer uppercase shrink-0"
                  >
                    Sign In Now
                  </button>
                </motion.div>
              )}

              {/* Forms by Mode */}
              {authMode === "signin" ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (loginEmail.trim() && loginPassword) {
                      setLoginWarningMessage(null);
                      const res = await loginUser({
                        loginIdentifier: loginEmail,
                        password: loginPassword,
                      });
                      if (res.success && res.user) {
                        setLoggedInUser(res.user.username);
                        if (typeof window !== "undefined") {
                          localStorage.setItem("setu_active_user", res.user.username);
                        }
                        if (res.user.themeId) {
                          const matched = KEYBOARD_THEMES.find((t) => t.id === res.user?.themeId);
                          if (matched) setCurrentTheme(matched);
                        }
                        if (res.user.colorZones !== undefined) {
                          setColorZones(Boolean(res.user.colorZones));
                        }
                        setIsLoginModalOpen(false);
                        setLoginWarningMessage(null);
                        setLoginEmail("");
                        setLoginPassword("");
                        confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
                      } else {
                        setLoginWarningMessage(res.error || "Login failed. Please check your credentials.");
                      }
                    }
                  }}
                  className="flex flex-col gap-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    {/* Email Input */}
                    <div className="sm:col-span-5 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email or Username</label>
                      <input
                        type="text"
                        required
                        placeholder="example@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                      />
                    </div>

                    {/* Password Input */}
                    <div className="sm:col-span-4 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("forgot");
                            setLoginWarningMessage(null);
                            setForgotSuccessMessage(null);
                            setForgotEmail(loginEmail);
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-4 pr-11 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title={showLoginPassword ? "Hide password" : "Show password"}
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="sm:col-span-3 flex flex-col justify-end">
                      <button
                        type="submit"
                        className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-blue-500/25 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In & Play</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : authMode === "signup" ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (signupName.trim() && signupPassword) {
                      setLoginWarningMessage(null);
                      const res = await registerUser({
                        username: signupName,
                        email: signupEmail || `${signupName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                        password: signupPassword,
                      });
                      if (res.success && res.user) {
                        setLoggedInUser(res.user.username);
                        if (typeof window !== "undefined") {
                          localStorage.setItem("setu_active_user", res.user.username);
                        }
                        if (res.user.themeId) {
                          const matched = KEYBOARD_THEMES.find((t) => t.id === res.user?.themeId);
                          if (matched) setCurrentTheme(matched);
                        }
                        if (res.user.colorZones !== undefined) {
                          setColorZones(Boolean(res.user.colorZones));
                        }
                        setIsLoginModalOpen(false);
                        setLoginWarningMessage(null);
                        setSignupName("");
                        setSignupEmail("");
                        setSignupPassword("");
                        confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
                      } else {
                        setLoginWarningMessage(res.error || "Registration failed. Username/Email may already be registered.");
                      }
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    {/* Full Name */}
                    <div className="sm:col-span-4 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                      />
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-3 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                      <input
                        type="text"
                        placeholder="example@gmail.com (optional)"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                      />
                    </div>

                    {/* Password */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full pl-4 pr-11 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title={showSignupPassword ? "Hide password" : "Show password"}
                        >
                          {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Create Button */}
                    <div className="sm:col-span-3 flex flex-col justify-end">
                      <button
                        type="submit"
                        className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-md shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Create & Play</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* Forgot / Reset Password Form */
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!forgotEmail.trim()) {
                      setLoginWarningMessage("Please enter your registered username or email.");
                      return;
                    }
                    if (forgotNewPassword.length < 6) {
                      setLoginWarningMessage("New password must be at least 6 characters long.");
                      return;
                    }
                    if (forgotNewPassword !== forgotConfirmPassword) {
                      setLoginWarningMessage("Passwords do not match. Please retype carefully.");
                      return;
                    }

                    setLoginWarningMessage(null);
                    const res = await resetPassword({
                      loginIdentifier: forgotEmail.trim(),
                      newPassword: forgotNewPassword,
                    });

                    if (res.success) {
                      setForgotSuccessMessage("Password reset successfully!");
                      setLoginEmail(forgotEmail.trim());
                      setLoginPassword("");
                      setForgotNewPassword("");
                      setForgotConfirmPassword("");
                      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
                      setTimeout(() => {
                        setAuthMode("signin");
                      }, 2200);
                    } else {
                      setLoginWarningMessage(res.error || "Failed to reset password. User not found.");
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    {/* Account Identifier */}
                    <div className="sm:col-span-4 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email or Username</label>
                      <input
                        type="text"
                        required
                        placeholder="Registered username or email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                      />
                    </div>

                    {/* New Password */}
                    <div className="sm:col-span-3 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Password</label>
                      <div className="relative">
                        <input
                          type={showForgotNewPassword ? "text" : "password"}
                          required
                          placeholder="Min 6 characters"
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          className="w-full pl-4 pr-11 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotNewPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title={showForgotNewPassword ? "Hide password" : "Show password"}
                        >
                          {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm</label>
                      <input
                        type="password"
                        required
                        placeholder="Retype password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                      />
                    </div>

                    {/* Reset Button */}
                    <div className="sm:col-span-3 flex flex-col justify-end">
                      <button
                        type="submit"
                        className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-md shadow-blue-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signin");
                        setLoginWarningMessage(null);
                        setForgotSuccessMessage(null);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 hover:underline"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Bottom Feature Perks Row */}
              <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs border-blue-100 text-slate-600">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Instant High-Score Sync</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unlocks All 7 Arcade Games</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Live 3D Mech Feedback Active</span>
                  </span>
                </div>

                <span className="font-mono text-[11px] text-blue-600 font-bold">
                  Type on keyboard below anytime ↵
                </span>
              </div>
            </motion.div>

            {/* Prominent 3D Mechanical Keyboard Displayed Live on Screen while Logging in */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center justify-center p-0 pointer-events-auto"
            >
              <Keyboard
                className="mx-auto scale-90 sm:scale-100"
                theme={currentTheme}
                colorZones={colorZones}
                allowMouseClick={true}
                onKeyPress={handleKeyTriggered}
                onOpenThemeSidebar={() => setIsThemeSidebarOpen(true)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
