/**
 * ==============================================================================
 * ⚠️ DEVELOPER NOTICE: TEMPORARY AUTHENTICATION CARD & GAME GATE
 * ==============================================================================
 * STATUS: TEMPORARY / PROTOTYPE ONLY
 *
 * NOTE FOR DEVELOPERS:
 * This component and its game-play gating are temporary developer bridges used
 * to demonstrate student registration, login, and telemetry syncing during current development phases.
 *
 * ⚠️ In final production release:
 *  1. This login card will NOT be present.
 *  2. Games will be playable freely without mandatory authentication.
 *
 * To remove prior to final production release:
 *  1. Delete this file: src/components/ui/TemporaryLoginCard.tsx
 *  2. Remove its import and usage in src/App.tsx
 *  3. Remove the temporary login check in GamesHub.tsx and App.tsx
 * ==============================================================================
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LogIn,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Gamepad2,
  ShieldCheck,
  Code2,
} from "lucide-react";
import confetti from "canvas-confetti";
import type { KeyboardTheme } from "@/lib/themes";
import {
  loginUser,
  registerUser,
  resetPassword,
  type UserRecord,
} from "@/lib/db";

export interface TemporaryLoginCardProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserRecord) => void;
  warningMessage?: string | null;
  onClearWarning?: () => void;
  currentTheme?: KeyboardTheme;
  colorZones?: boolean;
  onKeyTriggered?: (key: string, code: string) => void;
}

export function TemporaryLoginCard({
  isOpen,
  onClose,
  onLoginSuccess,
  warningMessage,
  onClearWarning,
  currentTheme,
  colorZones,
  onKeyTriggered,
}: TemporaryLoginCardProps) {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);
  const [internalError, setInternalError] = useState<string | null>(null);

  const activeWarning = internalError || warningMessage;

  const clearErrors = () => {
    setInternalError(null);
    onClearWarning?.();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = loginEmail.trim();
    if (!identifier || !loginPassword) return;

    if (identifier.includes("@") && !identifier.toLowerCase().endsWith(".com")) {
      setInternalError("Email address must end with '.com' (e.g. user@gmail.com).");
      return;
    }

    clearErrors();
    const res = await loginUser({
      loginIdentifier: identifier,
      password: loginPassword,
    });

    if (res.success && res.user) {
      setLoginEmail("");
      setLoginPassword("");
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
      onLoginSuccess(res.user);
    } else {
      setInternalError(res.error || "Login failed. Please check your credentials.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupPassword) {
      setInternalError("Username and password are required.");
      return;
    }

    const rawEmail = signupEmail.trim();
    if (!rawEmail) {
      setInternalError("Email address is required.");
      return;
    }

    if (!rawEmail.toLowerCase().endsWith(".com")) {
      setInternalError("Email address must end with '.com' (e.g. user@gmail.com).");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.com$/i.test(rawEmail)) {
      setInternalError("Please enter a valid email format ending with '.com' (e.g. user@gmail.com).");
      return;
    }

    clearErrors();
    const res = await registerUser({
      username: signupName.trim(),
      email: rawEmail.toLowerCase(),
      password: signupPassword,
    });

    if (res.success && res.user) {
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
      onLoginSuccess(res.user);
    } else {
      setInternalError(
        res.error || "Registration failed. Username/Email may already be registered."
      );
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = forgotEmail.trim();
    if (!identifier) {
      setInternalError("Please enter your registered username or email.");
      return;
    }
    if (identifier.includes("@") && !identifier.toLowerCase().endsWith(".com")) {
      setInternalError("Email address must end with '.com' (e.g. user@gmail.com).");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setInternalError("New password must be at least 6 characters long.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setInternalError("Passwords do not match. Please retype carefully.");
      return;
    }

    clearErrors();
    const res = await resetPassword({
      loginIdentifier: identifier,
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
        setForgotSuccessMessage(null);
      }, 2200);
    } else {
      setInternalError(res.error || "Failed to reset password. User not found.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              clearErrors();
              onClose();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-y-auto"
        >
          {/* Main Card Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="w-full max-w-xl p-6 sm:p-8 rounded-3xl border-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] relative z-20 flex flex-col gap-5 bg-white border-blue-200 text-slate-900 my-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                clearErrors();
                onClose();
              }}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer z-30"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ⚠️ DEVELOPER NOTICE CALLOUT BANNER */}
            <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-bold uppercase tracking-wider text-amber-900">
                  Developer Notice:
                </span>
                <span>
                  This login card &amp; game gate are temporary for development testing.{" "}
                  <strong>DO NOT include in final production.</strong>
                </span>
              </div>
              <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 font-bold">
                TEMP_COMPONENT
              </span>
            </div>

            {/* Warning Alert if triggered */}
            {activeWarning && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce text-amber-600" />
                  <span>{activeWarning}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase hidden sm:inline">
                  Authentication Required
                </span>
              </motion.div>
            )}

            {/* Top Header Row: Title & Mode Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-blue-100">
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
                    clearErrors();
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
                    clearErrors();
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
                className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
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

            {/* Form by Mode */}
            {authMode === "signin" ? (
              <form onSubmit={handleSignIn} className="flex flex-col gap-4">
                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="example@gmail.com or username"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                  />
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("forgot");
                        clearErrors();
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
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-blue-500/25 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In & Play</span>
                </button>
              </form>
            ) : authMode === "signup" ? (
              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name / Username
                  </label>
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
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address
                    </label>
                    <span className="text-[10.5px] font-mono font-bold text-blue-600 lowercase">
                      must end with .com
                    </span>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
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
                      {showSignupPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-wider uppercase shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Play</span>
                </button>
              </form>
            ) : (
              /* Forgot / Reset Password Form */
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                {/* Account Identifier */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Registered Email or Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Registered username or email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      New Password
                    </label>
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
                        {showForgotNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Retype password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all bg-slate-50 border-blue-200 focus:border-blue-600 text-slate-900"
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-wider uppercase shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password & Sign In</span>
                </button>

                <div className="flex justify-start pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      clearErrors();
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
            <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs border-blue-100 text-slate-600">
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
                  <span>Cloud Telemetry Active</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export default TemporaryLoginCard;

