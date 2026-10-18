// User & Student Analytics Database Engine with Supabase Cloud & Local Sync
import { supabase } from "./supabase";

export interface StudentProgress {
  codeSprint: {
    completedLevels: Record<string, { completedAt: string; wpm: number; timeSecs: number }>; // e.g. "python_1"
    totalSolved: number;
    languagesPracticed: string[];
    bestWpm: number;
  };
  academy: {
    completedLevels: number[];
    highestLevel: number;
    avgAccuracy: number;
  };
  speedTest: {
    testsTaken: number;
    bestWpm: number;
    avgAccuracy: number;
  };
  meteorDefense: {
    highScore: number;
    highestWave: number;
  };
  blindTyping: {
    completedLines: number;
    accuracy: number;
  };
  shortcutsDojo: {
    shortcutsMastered: number;
  };
  summary: {
    totalGamesPlayed: number;
    totalLevelsMastered: number;
    lastActiveGame: string;
    lastActivityTime: string;
  };
}

export interface UserPreferences {
  themeId: string;
  colorZones: boolean;
  lastUpdated?: string;
}

export interface UserRecord {
  userId: string;
  username: string;
  email: string;
  password: string;
  ipAddress: string;
  createdAt: string;
  lastLoginAt: string;
  progress: StudentProgress;
  themeId?: string;
  colorZones?: boolean;
  preferences?: UserPreferences;
}

const LOCAL_STORAGE_KEY = "setu_users_database_v1";

export function createDefaultProgress(): StudentProgress {
  return {
    codeSprint: {
      completedLevels: {},
      totalSolved: 0,
      languagesPracticed: [],
      bestWpm: 0,
    },
    academy: {
      completedLevels: [],
      highestLevel: 0,
      avgAccuracy: 0,
    },
    speedTest: {
      testsTaken: 0,
      bestWpm: 0,
      avgAccuracy: 0,
    },
    meteorDefense: {
      highScore: 0,
      highestWave: 0,
    },
    blindTyping: {
      completedLines: 0,
      accuracy: 0,
    },
    shortcutsDojo: {
      shortcutsMastered: 0,
    },
    summary: {
      totalGamesPlayed: 0,
      totalLevelsMastered: 0,
      lastActiveGame: "None",
      lastActivityTime: new Date().toISOString(),
    },
  };
}

// Helper to get client IP address from IP service
export async function fetchClientIp(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.ip) return data.ip;
    }
  } catch {
    // Fallback if offline or blocked
  }
  return "127.0.0.1 (Local Client)";
}

// SHA-256 Client-side Password Encryption Engine
export async function hashClientPassword(password: string): Promise<string> {
  try {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(password + "_salt_setu_arcade_2026");
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return "sha256$" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // fallback
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `sha256$legacy_${Math.abs(hash)}`;
}

export async function verifyClientPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  if (!storedHash.startsWith("sha256$") && !storedHash.startsWith("pbkdf2$")) {
    return password === storedHash;
  }
  const computed = await hashClientPassword(password);
  return computed === storedHash;
}

// Generate unique User ID (e.g. USR-7A9B2C4D)
export function generateUserId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 8; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `USR-${randomPart}`;
}

// Get all users from LocalStorage fallback
function getLocalUsers(): UserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save users to LocalStorage fallback
function saveLocalUsers(users: UserRecord[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

// REGISTER USER
export async function registerUser(params: {
  username: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
  try {
    const ipAddress = await fetchClientIp();
    const payload = {
      username: params.username.trim(),
      email: params.email.trim().toLowerCase(),
      password: params.password,
      ipAddress,
    };

    const passwordHash = await hashClientPassword(payload.password);
    const userId = generateUserId();
    const defaultProgress = createDefaultProgress();

    // 1. Attempt Supabase Cloud Registration
    try {
      // Check existing in Supabase
      const { data: existingSupa } = await supabase
        .from("students")
        .select("id, username, email")
        .or(`username.ilike.${payload.username},email.ilike.${payload.email}`)
        .limit(1);

      if (existingSupa && existingSupa.length > 0) {
        return {
          success: false,
          error: "A user with this username or email already exists.",
        };
      }

      // Insert directly into Supabase (with schema-adaptive fallback if optional preference columns are absent)
      const insertPayload: Record<string, any> = {
        user_id: userId,
        username: payload.username,
        email: payload.email,
        password_hash: passwordHash,
        ip_address: ipAddress,
        total_games_played: 0,
        total_levels_mastered: 0,
        last_active_game: "Registered",
        progress_json: {
          ...defaultProgress,
          preferences: { themeId: "studio-light", colorZones: false },
        },
      };

      let { error: insertErr } = await supabase.from("students").insert({
        ...insertPayload,
        theme_id: "studio-light",
        color_zones: false,
        preferences_json: { themeId: "studio-light", colorZones: false },
      });

      if (insertErr && (insertErr.code === "PGRST204" || insertErr.message?.includes("column"))) {
        const retryResult = await supabase.from("students").insert(insertPayload);
        insertErr = retryResult.error;
      }

      if (insertErr) {
        console.error("[Supabase Error] Registration insert failed:", insertErr);
        if (insertErr.code === "23505") {
          return {
            success: false,
            error: "A user with this username or email already exists.",
          };
        }
      } else {
        console.log("[Supabase Sync] Successfully registered student in Supabase Cloud:", payload.username);
      }
    } catch (supaErr) {
      console.warn("[Supabase Warning] Could not reach Supabase:", supaErr);
    }

    // 2. Try server API / local DB sync
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          themeId: "studio-light",
          colorZones: false,
        }),
      });
    } catch {
      // ignore
    }

    const newUser: UserRecord = {
      userId,
      username: payload.username,
      email: payload.email,
      password: passwordHash,
      ipAddress: payload.ipAddress,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      progress: defaultProgress,
      themeId: "studio-light",
      colorZones: false,
      preferences: {
        themeId: "studio-light",
        colorZones: false,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Save to LocalStorage fallback
    const users = getLocalUsers();
    if (!users.find((u) => u.userId === userId)) {
      users.push(newUser);
      saveLocalUsers(users);
    }

    return { success: true, user: newUser };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected database error",
    };
  }
}

// LOGIN USER
export async function loginUser(params: {
  loginIdentifier: string; // username or email
  password: string;
}): Promise<{ success: boolean; user?: UserRecord; error?: string }> {
  try {
    const ipAddress = await fetchClientIp();
    const identifier = params.loginIdentifier.trim().toLowerCase();

    // 1. Try Supabase Cloud Login first
    try {
      const { data: supaUser } = await supabase
        .from("students")
        .select("*")
        .or(`email.ilike.${identifier},username.ilike.${identifier}`)
        .maybeSingle();

      if (supaUser) {
        const isValid = await verifyClientPassword(params.password, supaUser.password_hash);
        if (!isValid) {
          return { success: false, error: "Incorrect password. Please verify your credentials." };
        }

        // Update login timestamp & IP in Supabase
        await supabase
          .from("students")
          .update({
            last_login_at: new Date().toISOString(),
            ip_address: ipAddress,
          })
          .eq("user_id", supaUser.user_id);

        const rawUser = supaUser as any;
        const savedThemeId =
          rawUser.theme_id ||
          rawUser.preferences_json?.themeId ||
          rawUser.progress_json?.preferences?.themeId ||
          "studio-light";
        const savedColorZones = Boolean(
          rawUser.color_zones ??
          rawUser.preferences_json?.colorZones ??
          rawUser.progress_json?.preferences?.colorZones ??
          false
        );

        const user: UserRecord = {
          userId: supaUser.user_id,
          username: supaUser.username,
          email: supaUser.email,
          password: supaUser.password_hash,
          ipAddress,
          createdAt: supaUser.created_at || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          progress: supaUser.progress_json || createDefaultProgress(),
          themeId: savedThemeId,
          colorZones: savedColorZones,
          preferences: rawUser.preferences_json || rawUser.progress_json?.preferences || {
            themeId: savedThemeId,
            colorZones: savedColorZones,
          },
        };

        // Cache in local
        const local = getLocalUsers();
        const idx = local.findIndex((u) => u.userId === user.userId);
        if (idx >= 0) local[idx] = user;
        else local.push(user);
        saveLocalUsers(local);

        return { success: true, user };
      }
    } catch {
      // Supabase check failed, continue to API / local
    }

    // 2. Try server API
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginIdentifier: params.loginIdentifier.trim(),
          password: params.password,
          ipAddress,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          // Sync local
          const local = getLocalUsers();
          const idx = local.findIndex((u) => u.userId === data.user.userId);
          if (idx >= 0) {
            local[idx] = data.user;
            saveLocalUsers(local);
          } else {
            saveLocalUsers([...local, data.user]);
          }
          return { success: true, user: data.user };
        }
      }
    } catch {
      // Fallback to local DB
    }

    // 3. Local DB lookup fallback
    const users = getLocalUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === identifier ||
        u.username.toLowerCase() === identifier
    );

    if (!user) {
      return {
        success: false,
        error: "No user found with that username or email address.",
      };
    }

    const isValid = await verifyClientPassword(params.password, user.password);
    if (!isValid) {
      return {
        success: false,
        error: "Incorrect password. Please verify your credentials.",
      };
    }

    if (!user.progress) {
      user.progress = createDefaultProgress();
    }
    if (!user.themeId) {
      user.themeId = user.preferences?.themeId || "studio-light";
    }
    if (user.colorZones === undefined) {
      user.colorZones = user.preferences?.colorZones || false;
    }

    // Update IP & login time
    user.ipAddress = ipAddress;
    user.lastLoginAt = new Date().toISOString();
    saveLocalUsers(users);

    // 4. Auto-sync to Supabase Cloud if not yet present
    try {
      const upsertPayload: Record<string, any> = {
        user_id: user.userId,
        username: user.username,
        email: user.email,
        password_hash: user.password,
        ip_address: ipAddress,
        total_games_played: user.progress.summary.totalGamesPlayed || 0,
        total_levels_mastered: user.progress.summary.totalLevelsMastered || 0,
        last_active_game: user.progress.summary.lastActiveGame || "None",
        progress_json: {
          ...user.progress,
          preferences: user.preferences || {
            themeId: user.themeId || "studio-light",
            colorZones: user.colorZones ?? false,
          },
        },
        last_login_at: user.lastLoginAt,
      };

      let { error: upsertErr } = await supabase.from("students").upsert({
        ...upsertPayload,
        theme_id: user.themeId || "studio-light",
        color_zones: user.colorZones ?? false,
        preferences_json: user.preferences || {
          themeId: user.themeId || "studio-light",
          colorZones: user.colorZones ?? false,
        },
      }, { onConflict: "user_id" });

      if (upsertErr && (upsertErr.code === "PGRST204" || upsertErr.message?.includes("column"))) {
        const retryResult = await supabase.from("students").upsert(upsertPayload, { onConflict: "user_id" });
        upsertErr = retryResult.error;
      }

      if (upsertErr) {
        console.warn("[Supabase Sync Error] Upsert failed:", upsertErr);
      } else {
        console.log("[Supabase Sync] Synced student to Supabase Cloud on login:", user.username);
      }
    } catch (supaErr) {
      console.warn("[Supabase Warning] Could not sync user to Supabase on login:", supaErr);
    }

    return { success: true, user };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected login error",
    };
  }
}

// VALIDATE ACTIVE USER SESSION (CHECKS SUPABASE)
export async function validateUserExists(username: string): Promise<boolean> {
  if (!username) return false;
  const target = username.trim().toLowerCase();

  try {
    const { data: supaUser, error } = await supabase
      .from("students")
      .select("id, username, email")
      .or(`username.ilike.${target},email.ilike.${target}`)
      .maybeSingle();

    if (error) {
      console.warn("[Session Validation Error]:", error);
      return true; // Keep session if network/offline error
    }

    return Boolean(supaUser);
  } catch {
    return true; // Network offline fallback
  }
}

// RESET PASSWORD (SUPABASE + SERVER + LOCAL)
export async function resetPassword(params: {
  loginIdentifier: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const identifier = params.loginIdentifier.trim().toLowerCase();
    const newHash = await hashClientPassword(params.newPassword);

    let updated = false;

    // 1. Update in Supabase Cloud
    try {
      const { data } = await supabase
        .from("students")
        .update({ password_hash: newHash })
        .or(`email.ilike.${identifier},username.ilike.${identifier}`)
        .select();

      if (data && data.length > 0) {
        updated = true;
      }
    } catch {
      // ignore
    }

    // 2. Update in server API
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginIdentifier: params.loginIdentifier.trim(),
          newPassword: params.newPassword,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) updated = true;
      }
    } catch {
      // ignore
    }

    // 3. Update in local storage fallback
    const users = getLocalUsers();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === identifier ||
        u.username.toLowerCase() === identifier
    );
    if (user) {
      user.password = newHash;
      saveLocalUsers(users);
      updated = true;
    }

    if (!updated) {
      return {
        success: false,
        error: "No account found matching that username or email address.",
      };
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Password reset failed",
    };
  }
}

// RECORD STUDENT ACTIVITY & PROGRESS UPDATE (SUPABASE + SERVER + LOCAL)
export async function updateStudentProgress(params: {
  username?: string;
  gameType: "codeSprint" | "academy" | "speedTest" | "meteorDefense" | "blindTyping" | "shortcutsDojo";
  details: Record<string, unknown>;
}): Promise<void> {
  const activeUser = params.username || (typeof window !== "undefined" ? localStorage.getItem("setu_active_user") : null);
  if (!activeUser) return;

  const nowIso = new Date().toISOString();
  const payload = {
    username: activeUser,
    gameType: params.gameType,
    details: params.details,
    timestamp: nowIso,
  };

  // 1. Send to local dev server API if available
  try {
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // ignore
  }

  // 2. Update local storage record
  const users = getLocalUsers();
  const user = users.find((u) => u.username.toLowerCase() === activeUser.toLowerCase() || u.email.toLowerCase() === activeUser.toLowerCase());
  
  if (user) {
    if (!user.progress) user.progress = createDefaultProgress();

    if (params.gameType === "codeSprint") {
      const lang = params.details.lang as string;
      const levelId = params.details.levelId as number;
      const wpm = (params.details.wpm as number) || 0;
      const timeSecs = (params.details.timeSecs as number) || 0;

      const key = `${lang}_${levelId}`;
      user.progress.codeSprint.completedLevels[key] = {
        completedAt: nowIso,
        wpm,
        timeSecs,
      };
      user.progress.codeSprint.totalSolved = Object.keys(user.progress.codeSprint.completedLevels).length;
      if (!user.progress.codeSprint.languagesPracticed.includes(lang)) {
        user.progress.codeSprint.languagesPracticed.push(lang);
      }
      if (wpm > user.progress.codeSprint.bestWpm) {
        user.progress.codeSprint.bestWpm = wpm;
      }
      user.progress.summary.lastActiveGame = `Code Sprint (${lang.toUpperCase()} Lvl ${levelId})`;
    } else if (params.gameType === "speedTest") {
      const wpm = (params.details.wpm as number) || 0;
      const accuracy = (params.details.accuracy as number) || 100;
      user.progress.speedTest.testsTaken += 1;
      if (wpm > user.progress.speedTest.bestWpm) user.progress.speedTest.bestWpm = wpm;
      user.progress.speedTest.avgAccuracy = accuracy;
      user.progress.summary.lastActiveGame = `Speed Arena (${wpm} WPM)`;
    } else if (params.gameType === "academy") {
      const levelId = params.details.levelId as number;
      if (!user.progress.academy.completedLevels.includes(levelId)) {
        user.progress.academy.completedLevels.push(levelId);
      }
      user.progress.academy.highestLevel = Math.max(user.progress.academy.highestLevel, levelId);
      user.progress.summary.lastActiveGame = `Typing Academy (Lvl ${levelId})`;
    } else if (params.gameType === "meteorDefense") {
      const score = (params.details.score as number) || 0;
      const wave = (params.details.wave as number) || 1;
      if (score > user.progress.meteorDefense.highScore) user.progress.meteorDefense.highScore = score;
      if (wave > user.progress.meteorDefense.highestWave) user.progress.meteorDefense.highestWave = wave;
      user.progress.summary.lastActiveGame = `Meteor Defense (Wave ${wave})`;
    } else if (params.gameType === "blindTyping") {
      const lines = (params.details.lines as number) || 1;
      user.progress.blindTyping.completedLines += lines;
      user.progress.summary.lastActiveGame = `Blind Typing (${user.progress.blindTyping.completedLines} lines)`;
    } else if (params.gameType === "shortcutsDojo") {
      const count = (params.details.count as number) || 1;
      user.progress.shortcutsDojo.shortcutsMastered += count;
      user.progress.summary.lastActiveGame = `Shortcuts Dojo (${user.progress.shortcutsDojo.shortcutsMastered} mastered)`;
    }

    user.progress.summary.totalGamesPlayed =
      user.progress.codeSprint.totalSolved +
      user.progress.academy.completedLevels.length +
      user.progress.speedTest.testsTaken +
      (user.progress.meteorDefense.highestWave > 0 ? 1 : 0);

    user.progress.summary.totalLevelsMastered =
      user.progress.codeSprint.totalSolved + user.progress.academy.completedLevels.length;
    
    user.progress.summary.lastActivityTime = nowIso;
    saveLocalUsers(users);

    // 3. Sync to Supabase Cloud in Real-time
    try {
      await supabase
        .from("students")
        .update({
          total_games_played: user.progress.summary.totalGamesPlayed,
          total_levels_mastered: user.progress.summary.totalLevelsMastered,
          code_sprint_solved: user.progress.codeSprint.totalSolved,
          code_sprint_best_wpm: user.progress.codeSprint.bestWpm,
          code_sprint_langs: user.progress.codeSprint.languagesPracticed,
          code_sprint_data: user.progress.codeSprint.completedLevels,
          academy_highest_level: user.progress.academy.highestLevel,
          academy_completed_levels: user.progress.academy.completedLevels,
          speed_best_wpm: user.progress.speedTest.bestWpm,
          speed_tests_taken: user.progress.speedTest.testsTaken,
          meteor_high_score: user.progress.meteorDefense.highScore,
          meteor_highest_wave: user.progress.meteorDefense.highestWave,
          blind_completed_lines: user.progress.blindTyping.completedLines,
          shortcuts_mastered: user.progress.shortcutsDojo.shortcutsMastered,
          last_active_game: user.progress.summary.lastActiveGame,
          last_activity_at: nowIso,
          progress_json: user.progress,
        })
        .or(`username.ilike.${activeUser},email.ilike.${activeUser}`);
    } catch {
      // ignore
    }
  }
}

// UPDATE USER THEME & PALETTE PREFERENCES (SUPABASE + SERVER + LOCAL)
export async function updateUserTheme(params: {
  username?: string;
  themeId: string;
  colorZones?: boolean;
}): Promise<void> {
  const activeUser = params.username || (typeof window !== "undefined" ? localStorage.getItem("setu_active_user") : null);
  if (!activeUser) return;

  const nowIso = new Date().toISOString();
  const themeId = params.themeId;
  const colorZones = Boolean(params.colorZones);

  // 1. Send to local dev server API if available
  try {
    fetch("/api/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: activeUser,
        themeId,
        colorZones,
        timestamp: nowIso,
      }),
    }).catch(() => {});
  } catch {
    // ignore
  }

  // 2. Update local storage record
  const users = getLocalUsers();
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === activeUser.toLowerCase() ||
      u.email.toLowerCase() === activeUser.toLowerCase()
  );

  if (user) {
    user.themeId = themeId;
    user.colorZones = colorZones;
    user.preferences = {
      themeId,
      colorZones,
      lastUpdated: nowIso,
    };
    saveLocalUsers(users);
  }

  // Cache user theme locally for instant warm boot
  if (typeof window !== "undefined") {
    localStorage.setItem(`setu_theme_${activeUser.toLowerCase()}`, themeId);
    localStorage.setItem(`setu_colorzones_${activeUser.toLowerCase()}`, String(colorZones));
  }

  // 3. Sync to Supabase Cloud in Real-time
  try {
    let { error: updateErr } = await supabase
      .from("students")
      .update({
        theme_id: themeId,
        color_zones: colorZones,
        preferences_json: {
          themeId,
          colorZones,
          lastUpdated: nowIso,
        },
        last_activity_at: nowIso,
      })
      .or(`username.ilike.${activeUser},email.ilike.${activeUser}`);

    if (updateErr && (updateErr.code === "PGRST204" || updateErr.message?.includes("column"))) {
      const { data: existing } = await supabase
        .from("students")
        .select("progress_json")
        .or(`username.ilike.${activeUser},email.ilike.${activeUser}`)
        .maybeSingle();

      const existingProgress =
        existing?.progress_json && typeof existing.progress_json === "object"
          ? existing.progress_json
          : {};

      await supabase
        .from("students")
        .update({
          progress_json: {
            ...existingProgress,
            preferences: { themeId, colorZones, lastUpdated: nowIso },
          },
          last_activity_at: nowIso,
        })
        .or(`username.ilike.${activeUser},email.ilike.${activeUser}`);
    }
    console.log("[Supabase Sync] Synced theme & palette preference to Supabase Cloud for:", activeUser, { themeId, colorZones });
  } catch (supaErr) {
    console.warn("[Supabase Warning] Could not sync theme preference to Supabase:", supaErr);
  }
}

// GET SAVED USER PREFERENCES (SUPABASE + LOCAL)
export async function getUserPreferences(
  username: string
): Promise<{ themeId: string; colorZones: boolean } | null> {
  if (!username) return null;
  const target = username.trim().toLowerCase();

  // Try Supabase first
  try {
    const { data: supaUser, error } = await supabase
      .from("students")
      .select("*")
      .or(`username.ilike.${target},email.ilike.${target}`)
      .maybeSingle();

    if (supaUser && !error) {
      const rawUser = supaUser as any;
      const themeId =
        rawUser.theme_id ||
        rawUser.preferences_json?.themeId ||
        rawUser.progress_json?.preferences?.themeId ||
        "studio-light";
      const colorZones = Boolean(
        rawUser.color_zones ??
        rawUser.preferences_json?.colorZones ??
        rawUser.progress_json?.preferences?.colorZones ??
        false
      );
      return { themeId, colorZones };
    }
  } catch {
    // fallback
  }

  // Try local users
  const users = getLocalUsers();
  const localUser = users.find(
    (u) =>
      u.username.toLowerCase() === target ||
      u.email.toLowerCase() === target
  );
  if (localUser) {
    const themeId = localUser.themeId || localUser.preferences?.themeId || "studio-light";
    const colorZones = Boolean(localUser.colorZones ?? localUser.preferences?.colorZones ?? false);
    return { themeId, colorZones };
  }

  return null;
}
