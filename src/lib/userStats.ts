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
}

export interface UserStatsData {
  totalPlays: number;
  gamesCount: Record<string, number>;
  history: GamePlayRecord[];
  dailyWpmTrend: { label: string; wpm: number; accuracy: number }[];
}

const STATS_STORAGE_KEY = "setu_user_game_stats_v1";

const DEFAULT_GAMES = [
  { id: "academy", title: "Touch Typing Academy", defaultPlays: 14 },
  { id: "speedtest", title: "Speed Typing Arena", defaultPlays: 22 },
  { id: "codesprint", title: "Code Sprint & Dev Syntax", defaultPlays: 9 },
  { id: "fallingwords", title: "Key Meteor Defense", defaultPlays: 12 },
  { id: "blindtyping", title: "Blind Typing Dojo", defaultPlays: 7 },
  { id: "shortcuts", title: "Keyboard Shortcuts Dojo", defaultPlays: 6 },
  { id: "soundmatrix", title: "Echo Matrix Voice", defaultPlays: 3 },
];

export function getInitialUserStats(): UserStatsData {
  const gamesCount: Record<string, number> = {};
  DEFAULT_GAMES.forEach((g) => {
    gamesCount[g.id] = g.defaultPlays;
  });

  const totalPlays = Object.values(gamesCount).reduce((a, b) => a + b, 0);

  const dailyWpmTrend = [
    { label: "Mon", wpm: 42, accuracy: 92 },
    { label: "Tue", wpm: 48, accuracy: 94 },
    { label: "Wed", wpm: 55, accuracy: 93 },
    { label: "Thu", wpm: 53, accuracy: 96 },
    { label: "Fri", wpm: 64, accuracy: 97 },
    { label: "Sat", wpm: 71, accuracy: 98 },
    { label: "Sun", wpm: 78, accuracy: 99 },
  ];

  const history: GamePlayRecord[] = [
    {
      id: "rec-1",
      gameId: "speedtest",
      gameTitle: "Speed Typing Arena",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      wpm: 78,
      accuracy: 99,
      durationSecs: 60,
    },
    {
      id: "rec-2",
      gameId: "academy",
      gameTitle: "Touch Typing Academy",
      timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
      wpm: 68,
      accuracy: 97,
      score: 1450,
      durationSecs: 180,
    },
    {
      id: "rec-3",
      gameId: "codesprint",
      gameTitle: "Code Sprint (Python)",
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      wpm: 62,
      accuracy: 96,
      score: 1200,
      durationSecs: 240,
    },
    {
      id: "rec-4",
      gameId: "fallingwords",
      gameTitle: "Key Meteor Defense",
      timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      score: 3420,
      accuracy: 94,
      durationSecs: 150,
    },
    {
      id: "rec-5",
      gameId: "blindtyping",
      gameTitle: "Blind Typing Dojo",
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      wpm: 58,
      accuracy: 93,
      durationSecs: 120,
    },
    {
      id: "rec-6",
      gameId: "shortcuts",
      gameTitle: "Shortcuts Dojo",
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      score: 12,
      accuracy: 100,
      durationSecs: 90,
    },
  ];

  return {
    totalPlays,
    gamesCount,
    history,
    dailyWpmTrend,
  };
}

export function getUserStats(): UserStatsData {
  if (typeof window === "undefined") {
    return getInitialUserStats();
  }

  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialUserStats();
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return getInitialUserStats();
  }
}

export function recordGamePlay(record: {
  gameId: string;
  gameTitle: string;
  wpm?: number;
  accuracy?: number;
  score?: number;
  durationSecs?: number;
}): UserStatsData {
  const current = getUserStats();

  const newCounts = {
    ...current.gamesCount,
    [record.gameId]: (current.gamesCount[record.gameId] || 0) + 1,
  };

  const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);

  const newRecord: GamePlayRecord = {
    id: `rec-${Date.now()}`,
    gameId: record.gameId,
    gameTitle: record.gameTitle,
    timestamp: new Date().toISOString(),
    wpm: record.wpm,
    accuracy: record.accuracy,
    score: record.score,
    durationSecs: record.durationSecs || 60,
  };

  const newHistory = [newRecord, ...current.history].slice(0, 30);

  // Update daily WPM trend if WPM is provided
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

  const updated: UserStatsData = {
    totalPlays: newTotal,
    gamesCount: newCounts,
    history: newHistory,
    dailyWpmTrend: newTrends,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
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

