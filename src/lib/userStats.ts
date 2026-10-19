// User Game Analytics & Session Statistics Storage
export interface GamePlayRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  timestamp: string;
  wpm?: number;
  accuracy?: number;
  score?: number;
  durationSecs?: number;
  xpGained?: number;
}

export interface BlindTypingStats {
  perfect: number; // 0 errors (+0.5 XP)
  minor: number;   // 1 error (+0.25 XP)
  major: number;   // >1 errors (-0.5 XP)
}

export interface XpBreakdown {
  shortcutsXp: number;
  shortcutsCountToday: number;
  academyXp: number;
  academyCompletedCount: number;
  blindTypingXp: number;
  blindTypingStats: BlindTypingStats;
  meteorDefenseXp: number;
  otherGamesXp: number;
  dailyAttendancePenalty: number;
  todayMissedPenalty: number;
  pastMissedPenalty: number;
  playedGamesToday: string[];
  unplayedGamesToday: string[];
  allActiveGamesCount: number;
}

export interface UserStatsData {
  totalPlays: number;
  gamesCount: Record<string, number>;
  history: GamePlayRecord[];
  dailyWpmTrend: { label: string; wpm: number; accuracy: number }[];

  // Custom XP System Fields
  shortcutsPracticeDate?: string;
  shortcutsTodayCount?: number;
  academyCompletedLevels?: number[];
  blindTypingXp?: number;
  blindTypingStats?: BlindTypingStats;
  meteorDefenseXp?: number;
  otherGamesXp?: number;
  dailyAttendance?: Record<string, string[]>; // date ("YYYY-MM-DD") -> array of played gameIds
}

export const STATS_STORAGE_KEY = "setu_user_game_stats_v2";

export const DEFAULT_GAMES = [
  { id: "academy", title: "Touch Typing Academy", defaultPlays: 0 },
  { id: "speedtest", title: "Speed Typing Arena", defaultPlays: 0 },
  { id: "codesprint", title: "Code Sprint & Dev Syntax", defaultPlays: 0 },
  { id: "fallingwords", title: "Key Meteor Defense", defaultPlays: 0 },
  { id: "blindtyping", title: "Blind Typing Dojo", defaultPlays: 0 },
  { id: "shortcuts", title: "Keyboard Shortcuts Dojo", defaultPlays: 0 },
  { id: "soundmatrix", title: "Echo Matrix Voice", defaultPlays: 0 },
];

export const ALL_GAME_IDS = DEFAULT_GAMES.map((g) => g.id);

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getInitialUserStats(): UserStatsData {
  const gamesCount: Record<string, number> = {};
  DEFAULT_GAMES.forEach((g) => {
    gamesCount[g.id] = 0;
  });

  return {
    totalPlays: 0,
    gamesCount,
    history: [],
    dailyWpmTrend: [],
    shortcutsPracticeDate: getTodayDateString(),
    shortcutsTodayCount: 0,
    academyCompletedLevels: [],
    blindTypingXp: 0,
    blindTypingStats: { perfect: 0, minor: 0, major: 0 },
    meteorDefenseXp: 0,
    otherGamesXp: 0,
    dailyAttendance: {},
  };
}

export function saveUserStats(stats: UserStatsData): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
      window.dispatchEvent(new CustomEvent("setu_user_stats_updated", { detail: stats }));
    } catch {
      // ignore
    }
  }
}

export function clearUserStats(): UserStatsData {
  const initial = getInitialUserStats();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(initial));
      localStorage.removeItem("setu_user_game_stats_v1");
      localStorage.removeItem(LATEST_PLAYED_GAME_KEY);
      window.dispatchEvent(new CustomEvent("setu_user_stats_cleared"));
    } catch {
      // ignore
    }
  }
  return initial;
}

export function getUserStats(): UserStatsData {
  if (typeof window === "undefined") {
    return getInitialUserStats();
  }

  try {
    if (localStorage.getItem("setu_user_game_stats_v1")) {
      localStorage.removeItem("setu_user_game_stats_v1");
    }

    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialUserStats();
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      ...getInitialUserStats(),
      ...parsed,
      gamesCount: {
        ...getInitialUserStats().gamesCount,
        ...(parsed.gamesCount || {}),
      },
      blindTypingStats: {
        perfect: 0,
        minor: 0,
        major: 0,
        ...(parsed.blindTypingStats || {}),
      },
    };
  } catch {
    return getInitialUserStats();
  }
}

/**
 * Mark a game as played today in daily attendance record
 */
function markGamePlayedToday(stats: UserStatsData, gameId: string): Record<string, string[]> {
  const today = getTodayDateString();
  const attendance = { ...(stats.dailyAttendance || {}) };
  const currentToday = new Set(attendance[today] || []);
  currentToday.add(gameId);
  attendance[today] = Array.from(currentToday);
  return attendance;
}

/**
 * 1. KEYBOARD SHORTCUTS DOJO:
 * Practice for students that resets every day.
 * Every 1 command practiced awards +0.25 XP.
 */
export function recordShortcutCommandPracticed(): { xpGained: number; totalToday: number; totalXp: number } {
  const current = getUserStats();
  const today = getTodayDateString();
  const dateChanged = current.shortcutsPracticeDate !== today;
  const newCount = (dateChanged ? 0 : (current.shortcutsTodayCount || 0)) + 1;
  const attendance = markGamePlayedToday(current, "shortcuts");

  const updated: UserStatsData = {
    ...current,
    shortcutsPracticeDate: today,
    shortcutsTodayCount: newCount,
    dailyAttendance: attendance,
    gamesCount: {
      ...current.gamesCount,
      shortcuts: (current.gamesCount.shortcuts || 0) + 1,
    },
    totalPlays: (current.totalPlays || 0) + 1,
  };

  saveUserStats(updated);
  return {
    xpGained: 0.25,
    totalToday: newCount,
    totalXp: calculateUserXp(updated).totalXp,
  };
}

/**
 * 2. TOUCH TYPING ACADEMY:
 * For all levels: each level completed awards 2 XP (only when completed).
 */
export function recordAcademyLevelCompleted(levelId: number): { xpGained: number; totalXp: number } {
  const current = getUserStats();
  const completed = new Set(current.academyCompletedLevels || []);
  const isNew = !completed.has(levelId);
  completed.add(levelId);
  const attendance = markGamePlayedToday(current, "academy");

  const updated: UserStatsData = {
    ...current,
    academyCompletedLevels: Array.from(completed),
    dailyAttendance: attendance,
    gamesCount: {
      ...current.gamesCount,
      academy: (current.gamesCount.academy || 0) + 1,
    },
    totalPlays: (current.totalPlays || 0) + 1,
  };

  saveUserStats(updated);
  return {
    xpGained: isNew ? 2 : 0,
    totalXp: calculateUserXp(updated).totalXp,
  };
}

/**
 * 3. BLIND TYPING:
 * - Correct phrase without any errors: +0.5 XP
 * - Phrase with 1 error: +0.25 XP
 * - More than 1 error: -0.5 XP (deduction)
 */
export function recordBlindTypingPhraseResult(errors: number): { xpDelta: number; totalXp: number } {
  const current = getUserStats();
  let xpDelta = 0;
  const stats: BlindTypingStats = {
    perfect: current.blindTypingStats?.perfect || 0,
    minor: current.blindTypingStats?.minor || 0,
    major: current.blindTypingStats?.major || 0,
  };

  if (errors === 0) {
    xpDelta = 0.5;
    stats.perfect += 1;
  } else if (errors === 1) {
    xpDelta = 0.25;
    stats.minor += 1;
  } else {
    xpDelta = -0.5;
    stats.major += 1;
  }

  const attendance = markGamePlayedToday(current, "blindtyping");

  const updated: UserStatsData = {
    ...current,
    blindTypingXp: Number(((current.blindTypingXp || 0) + xpDelta).toFixed(2)),
    blindTypingStats: stats,
    dailyAttendance: attendance,
    gamesCount: {
      ...current.gamesCount,
      blindtyping: (current.gamesCount.blindtyping || 0) + 1,
    },
    totalPlays: (current.totalPlays || 0) + 1,
  };

  saveUserStats(updated);
  return {
    xpDelta,
    totalXp: calculateUserXp(updated).totalXp,
  };
}

/**
 * 4. KEY METEOR DEFENSE GAME XP FORMULA:
 * - 2 mins duration:
 *     3 hearts -> 2 XP
 *     2 hearts -> 1 XP
 *     1 heart  -> 0.5 XP
 * - 5 mins duration:
 *     3 hearts -> 5 XP
 *     2 hearts -> 3 XP
 *     1 heart  -> 1 XP
 * - Unlimited duration:
 *     > 10 mins:
 *       3 hearts -> 10 XP
 *       2 hearts -> 5 XP
 *       1 heart  -> 2 XP
 *     > 15 mins (up to 20 mins) -> 15 XP (any hearts)
 *     > 20 mins -> 20 XP (any hearts)
 */
export function calculateMeteorDefenseXp(
  duration: "2min" | "5min" | "unlimited",
  heartsRemaining: number,
  elapsedSecs: number
): number {
  if (duration === "2min") {
    if (heartsRemaining >= 3) return 2;
    if (heartsRemaining === 2) return 1;
    if (heartsRemaining === 1) return 0.5;
    return 0;
  }

  if (duration === "5min") {
    if (heartsRemaining >= 3) return 5;
    if (heartsRemaining === 2) return 3;
    if (heartsRemaining === 1) return 1;
    return 0;
  }

  if (duration === "unlimited") {
    if (elapsedSecs >= 1200) {
      // More than 20 minutes played: 20 XP given regardless of hearts
      return 20;
    }
    if (elapsedSecs >= 900) {
      // More than 15 minutes played
      return 15;
    }
    if (elapsedSecs >= 600) {
      // More than 10 minutes played
      if (heartsRemaining >= 3) return 10;
      if (heartsRemaining === 2) return 5;
      if (heartsRemaining === 1) return 2;
      return 0;
    }
    return 0;
  }

  return 0;
}

export function recordMeteorDefenseResult(params: {
  duration: "2min" | "5min" | "unlimited";
  heartsRemaining: number;
  elapsedSecs: number;
  score?: number;
  wpm?: number;
  accuracy?: number;
}): { xpGained: number; totalXp: number } {
  const current = getUserStats();
  const xpGained = calculateMeteorDefenseXp(params.duration, params.heartsRemaining, params.elapsedSecs);
  const attendance = markGamePlayedToday(current, "fallingwords");

  const newRecord: GamePlayRecord = {
    id: `rec-${Date.now()}`,
    gameId: "fallingwords",
    gameTitle: "Key Meteor Defense",
    timestamp: new Date().toISOString(),
    wpm: params.wpm,
    accuracy: params.accuracy,
    score: params.score,
    durationSecs: params.elapsedSecs,
    xpGained,
  };

  const newCounts = {
    ...current.gamesCount,
    fallingwords: (current.gamesCount.fallingwords || 0) + 1,
  };

  const updated: UserStatsData = {
    ...current,
    meteorDefenseXp: Number(((current.meteorDefenseXp || 0) + xpGained).toFixed(2)),
    dailyAttendance: attendance,
    gamesCount: newCounts,
    totalPlays: (current.totalPlays || 0) + 1,
    history: [newRecord, ...current.history].slice(0, 30),
  };

  saveUserStats(updated);
  return {
    xpGained,
    totalXp: calculateUserXp(updated).totalXp,
  };
}

export function recordGamePlay(record: {
  gameId: string;
  gameTitle: string;
  wpm?: number;
  accuracy?: number;
  score?: number;
  durationSecs?: number;
  xpGained?: number;
}): UserStatsData {
  const current = getUserStats();

  const newCounts = {
    ...current.gamesCount,
    [record.gameId]: (current.gamesCount[record.gameId] || 0) + 1,
  };

  const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);

  // Default modest XP for completion of unprescribed games (Speedtest, Codesprint, Soundmatrix)
  const isStandardRewardGame =
    record.gameId === "speedtest" || record.gameId === "codesprint" || record.gameId === "soundmatrix";
  const defaultXp = record.xpGained !== undefined ? record.xpGained : isStandardRewardGame ? 1 : 0;

  const newRecord: GamePlayRecord = {
    id: `rec-${Date.now()}`,
    gameId: record.gameId,
    gameTitle: record.gameTitle,
    timestamp: new Date().toISOString(),
    wpm: record.wpm,
    accuracy: record.accuracy,
    score: record.score,
    durationSecs: record.durationSecs || 60,
    xpGained: defaultXp,
  };

  const newHistory = [newRecord, ...current.history].slice(0, 30);

  let newTrends = [...current.dailyWpmTrend];
  if (record.wpm && record.wpm > 0) {
    const last = newTrends[newTrends.length - 1];
    if (last) {
      newTrends[newTrends.length - 1] = {
        ...last,
        wpm: Math.round((last.wpm + record.wpm) / 2),
        accuracy: record.accuracy ? Math.round((last.accuracy + record.accuracy) / 2) : last.accuracy,
      };
    }
  }

  const attendance = markGamePlayedToday(current, record.gameId);

  const updated: UserStatsData = {
    ...current,
    totalPlays: newTotal,
    gamesCount: newCounts,
    history: newHistory,
    dailyWpmTrend: newTrends,
    dailyAttendance: attendance,
    otherGamesXp: isStandardRewardGame ? (current.otherGamesXp || 0) + defaultXp : current.otherGamesXp,
  };

  saveUserStats(updated);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LATEST_PLAYED_GAME_KEY, record.gameId);
      window.dispatchEvent(new CustomEvent("setu_latest_game_changed", { detail: { gameId: record.gameId } }));
    } catch {
      // ignore
    }
  }

  return updated;
}

export const LATEST_PLAYED_GAME_KEY = "setu_latest_played_game";

export function getLatestPlayedGameId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(LATEST_PLAYED_GAME_KEY);
    if (saved) return saved;
    const stats = getUserStats();
    if (stats.history && stats.history.length > 0) {
      return stats.history[0].gameId;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setLatestPlayedGameId(gameId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LATEST_PLAYED_GAME_KEY, gameId);
    window.dispatchEvent(new CustomEvent("setu_latest_game_changed", { detail: { gameId } }));
  } catch {
    // ignore
  }
}

export interface XpStats {
  totalXp: number;
  netRawXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  title: string;
  rankBadge: string;
  rankColor: string;
  recentGain: number;
  breakdown: XpBreakdown;
}

export function calculateUserXp(stats: UserStatsData): XpStats {
  const today = getTodayDateString();

  // 1. Keyboard Shortcuts Dojo: 0.25 XP per command practiced today (resets daily)
  const shortcutsCount = stats.shortcutsPracticeDate === today ? (stats.shortcutsTodayCount || 0) : 0;
  const shortcutsXp = Number((shortcutsCount * 0.25).toFixed(2));

  // 2. Touch Typing Academy: 2 XP per completed level
  const academyCompletedLevels = stats.academyCompletedLevels || [];
  const academyCompletedCount = academyCompletedLevels.length;
  const academyXp = academyCompletedCount * 2;

  // 3. Blind Typing: net phrase XP (+0.5 for 0 errors, +0.25 for 1 error, -0.5 for >1 error)
  const blindTypingXp = Number((stats.blindTypingXp || 0).toFixed(2));
  const blindTypingStats = stats.blindTypingStats || { perfect: 0, minor: 0, major: 0 };

  // 4. Key Meteor Defense Game: duration & hearts survival XP
  const meteorDefenseXp = Number((stats.meteorDefenseXp || 0).toFixed(2));

  // 5. Other Games XP (Speed Test, Code Sprint, Sound Matrix: 1 XP per completed round)
  const otherGamesXp = Number((stats.otherGamesXp || 0).toFixed(2));

  // 6. Daily Attendance Penalty: 5 XP deducted for each game not played everyday
  const dailyAttendance = stats.dailyAttendance || {};
  const playedGamesToday = dailyAttendance[today] || [];
  const unplayedGamesToday = ALL_GAME_IDS.filter((id) => !playedGamesToday.includes(id));

  // Active user penalty: only applies if user has played at least 1 session
  const hasEverPlayed = (stats.totalPlays || 0) > 0 || Object.keys(dailyAttendance).length > 0;
  const todayMissedPenalty = hasEverPlayed ? unplayedGamesToday.length * 5 : 0;

  let pastMissedPenalty = 0;
  Object.entries(dailyAttendance).forEach(([date, games]) => {
    if (date !== today) {
      const missed = ALL_GAME_IDS.filter((id) => !games.includes(id)).length;
      pastMissedPenalty += missed * 5;
    }
  });

  const dailyAttendancePenalty = todayMissedPenalty + pastMissedPenalty;

  const grossXp = shortcutsXp + academyXp + blindTypingXp + meteorDefenseXp + otherGamesXp;
  const netRawXp = Number((grossXp - dailyAttendancePenalty).toFixed(2));
  const totalXp = Math.max(0, netRawXp);

  // Progressive Level Scaling: Each level requires 25 XP
  const XP_PER_LEVEL = 25;
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = Number((totalXp % XP_PER_LEVEL).toFixed(2));
  const nextLevelXp = XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

  // Typist Rank Titles based on level
  let title = "Novice Keystroke Typist";
  let rankBadge = "Bronze";
  let rankColor = "#b45309";

  if (level >= 25) {
    title = "Apex Keystroke Grandmaster";
    rankBadge = "Grandmaster";
    rankColor = "#7c3aed";
  } else if (level >= 20) {
    title = "Mechanical Switch Virtuoso";
    rankBadge = "Diamond";
    rankColor = "#0284c7";
  } else if (level >= 15) {
    title = "Speed Demon Keystroke Specialist";
    rankBadge = "Platinum";
    rankColor = "#0d9488";
  } else if (level >= 10) {
    title = "Tactile Keyboard Master";
    rankBadge = "Gold";
    rankColor = "#d97706";
  } else if (level >= 5) {
    title = "Acoustic Touch Typist";
    rankBadge = "Silver";
    rankColor = "#64748b";
  }

  let recentGain = 0;
  if (stats.history && stats.history.length > 0) {
    recentGain = stats.history[0].xpGained || 0;
  }

  return {
    totalXp,
    netRawXp,
    level,
    currentLevelXp,
    nextLevelXp,
    progressPercent,
    title,
    rankBadge,
    rankColor,
    recentGain,
    breakdown: {
      shortcutsXp,
      shortcutsCountToday: shortcutsCount,
      academyXp,
      academyCompletedCount,
      blindTypingXp,
      blindTypingStats,
      meteorDefenseXp,
      otherGamesXp,
      dailyAttendancePenalty,
      todayMissedPenalty,
      pastMissedPenalty,
      playedGamesToday,
      unplayedGamesToday,
      allActiveGamesCount: ALL_GAME_IDS.length,
    },
  };
}
