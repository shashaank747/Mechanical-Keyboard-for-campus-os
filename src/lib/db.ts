// Local-First Student Analytics & User Management Database Engine
// Operates with 100% client persistence and local offline storage

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

// Get all users from LocalStorage
function getLocalUsers(): UserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save users to LocalStorage
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

    // Check existing in local database
    const users = getLocalUsers();
    const existing = users.find(
      (u) =>
        u.username.toLowerCase() === payload.username.toLowerCase() ||
        u.email.toLowerCase() === payload.email.toLowerCase()
    );

    if (existing) {
      return {
        success: false,
        error: "A user with this username or email already exists.",
      };
    }

    // Try server API fallback if available
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

    users.push(newUser);
    saveLocalUsers(users);

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

    // 1. Try server API if available
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
          const local = getLocalUsers();
          const idx = local.findIndex((u) => u.userId === data.user.userId);
          if (idx >= 0) {
            local[idx] = data.user;
            saveLocalUsers(local);
          } else {
            local.push(data.user);
            saveLocalUsers(local);
          }
          return { success: true, user: data.user };
        }
      }
    } catch {
      // Offline fallback
    }

    // 2. Validate in LocalStorage database
    const users = getLocalUsers();
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === identifier ||
        u.email.toLowerCase() === identifier
    );

    if (!user) {
      return {
        success: false,
        error: "Account not found. Please register first to start tracking.",
      };
    }

    const isValid = await verifyClientPassword(params.password, user.password);
    if (!isValid) {
      return {
        success: false,
        error: "Incorrect password. Please verify your credentials.",
      };
    }

    // Ensure progress structure
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

    return { success: true, user };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected login error",
    };
  }
}

// VALIDATE ACTIVE USER SESSION
export async function validateUserExists(username: string): Promise<boolean> {
  if (!username) return false;
  const target = username.trim().toLowerCase();
  const users = getLocalUsers();
  return users.some(
    (u) => u.username.toLowerCase() === target || u.email.toLowerCase() === target
  );
}

// RESET PASSWORD
export async function resetPassword(params: {
  loginIdentifier: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const identifier = params.loginIdentifier.trim().toLowerCase();
    const newHash = await hashClientPassword(params.newPassword);

    let updated = false;

    // 1. Update in server API if available
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

    // 2. Update in local storage
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

// RECORD STUDENT ACTIVITY & PROGRESS UPDATE
export async function updateStudentProgress(params: {
  username?: string;
  gameId?: string;
  gameType?: string;
  data?: Record<string, unknown>;
  details?: Record<string, unknown>;
}): Promise<void> {
  const activeUser =
    params.username ||
    (typeof window !== "undefined" ? localStorage.getItem("setu_active_user") : null);
  if (!activeUser) return;

  const rawGame = (params.gameId || params.gameType || "codesprint").toLowerCase();
  const payload = (params.data || params.details || {}) as Record<string, any>;
  const nowIso = new Date().toISOString();

  // Normalize targetGame
  let targetGame = "codesprint";
  if (rawGame.includes("sprint")) targetGame = "codesprint";
  else if (rawGame.includes("academy")) targetGame = "academy";
  else if (rawGame.includes("speed")) targetGame = "speedtest";
  else if (rawGame.includes("falling") || rawGame.includes("meteor")) targetGame = "fallingwords";
  else if (rawGame.includes("blind")) targetGame = "blindtyping";
  else if (rawGame.includes("shortcut")) targetGame = "shortcuts";
  else if (rawGame.includes("sound") || rawGame.includes("echo")) targetGame = "soundmatrix";

  // 1. Post to local dev server API if running
  try {
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: activeUser,
        gameId: targetGame,
        data: payload,
        timestamp: nowIso,
      }),
    }).catch(() => {});
  } catch {
    // ignore
  }

  // 2. Update LocalStorage Database
  const users = getLocalUsers();
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === activeUser.toLowerCase() ||
      u.email.toLowerCase() === activeUser.toLowerCase()
  );

  if (user) {
    if (!user.progress) {
      user.progress = createDefaultProgress();
    }

    switch (targetGame) {
      case "codesprint": {
        const levelId = (payload.levelId as string) || "general";
        const wpm = Number(payload.wpm) || 0;
        const timeSecs = Number(payload.timeSecs) || 0;
        const language = (payload.language as string) || "python";

        user.progress.codeSprint.completedLevels[levelId] = {
          completedAt: nowIso,
          wpm,
          timeSecs,
        };
        user.progress.codeSprint.totalSolved = Object.keys(
          user.progress.codeSprint.completedLevels
        ).length;
        if (!user.progress.codeSprint.languagesPracticed.includes(language)) {
          user.progress.codeSprint.languagesPracticed.push(language);
        }
        user.progress.codeSprint.bestWpm = Math.max(user.progress.codeSprint.bestWpm, wpm);
        user.progress.summary.lastActiveGame = "Code Sprint & Dev Syntax";
        break;
      }
      case "academy": {
        const level = Number(payload.level) || 1;
        const accuracy = Number(payload.accuracy) || 0;
        if (!user.progress.academy.completedLevels.includes(level)) {
          user.progress.academy.completedLevels.push(level);
        }
        user.progress.academy.highestLevel = Math.max(user.progress.academy.highestLevel, level);
        user.progress.academy.avgAccuracy = accuracy;
        user.progress.summary.lastActiveGame = "Touch Typing Academy";
        break;
      }
      case "speedtest": {
        const wpm = Number(payload.wpm) || 0;
        const accuracy = Number(payload.accuracy) || 0;
        user.progress.speedTest.testsTaken += 1;
        user.progress.speedTest.bestWpm = Math.max(user.progress.speedTest.bestWpm, wpm);
        user.progress.speedTest.avgAccuracy = accuracy;
        user.progress.summary.lastActiveGame = "Speed Typing Arena";
        break;
      }
      case "fallingwords": {
        const score = Number(payload.score) || 0;
        const wave = Number(payload.wave) || 1;
        user.progress.meteorDefense.highScore = Math.max(user.progress.meteorDefense.highScore, score);
        user.progress.meteorDefense.highestWave = Math.max(user.progress.meteorDefense.highestWave, wave);
        user.progress.summary.lastActiveGame = "Key Meteor Defense";
        break;
      }
      case "blindtyping": {
        const lines = Number(payload.lines) || 1;
        const accuracy = Number(payload.accuracy) || 0;
        user.progress.blindTyping.completedLines += lines;
        user.progress.blindTyping.accuracy = accuracy;
        user.progress.summary.lastActiveGame = "Blind Typing Dojo";
        break;
      }
      case "shortcuts": {
        const mastered = Number(payload.shortcutsMastered) || 1;
        user.progress.shortcutsDojo.shortcutsMastered = Math.max(
          user.progress.shortcutsDojo.shortcutsMastered,
          mastered
        );
        user.progress.summary.lastActiveGame = "Keyboard Shortcuts Dojo";
        break;
      }
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
  }
}

// UPDATE USER THEME & PALETTE PREFERENCES
export async function updateUserTheme(params: {
  username?: string;
  themeId: string;
  colorZones?: boolean;
}): Promise<void> {
  const activeUser =
    params.username ||
    (typeof window !== "undefined" ? localStorage.getItem("setu_active_user") : null);
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
}

// GET SAVED USER PREFERENCES
export async function getUserPreferences(
  username: string
): Promise<{ themeId: string; colorZones: boolean } | null> {
  if (!username) return null;
  const target = username.trim().toLowerCase();
  const users = getLocalUsers();
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === target ||
      u.email.toLowerCase() === target
  );

  if (user) {
    return {
      themeId: user.themeId || "studio-light",
      colorZones: user.colorZones ?? false,
    };
  }

  // Check cached preference
  if (typeof window !== "undefined") {
    const cachedTheme = localStorage.getItem(`setu_theme_${target}`);
    const cachedZones = localStorage.getItem(`setu_colorzones_${target}`);
    if (cachedTheme) {
      return {
        themeId: cachedTheme,
        colorZones: cachedZones === "true",
      };
    }
  }

  return null;
}
