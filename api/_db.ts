import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import defaultUsersData from '../data/users.json';

export interface StudentProgress {
  codeSprint: {
    completedLevels: Record<string, { completedAt: string; wpm: number; timeSecs: number }>;
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

export interface UserRecord {
  userId: string;
  username: string;
  email: string;
  password: string;
  ipAddress: string;
  createdAt: string;
  lastLoginAt: string;
  progress?: StudentProgress;
  themeId?: string;
  colorZones?: boolean;
  preferences?: {
    themeId: string;
    colorZones: boolean;
  };
}

export function getDefaultProgress(): StudentProgress {
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
      lastActiveGame: 'None',
      lastActivityTime: new Date().toISOString(),
    },
  };
}

export function normalizeProgress(progress?: any): StudentProgress {
  const def = getDefaultProgress();
  if (!progress || typeof progress !== 'object') return def;
  return {
    ...def,
    ...progress,
    codeSprint: { ...def.codeSprint, ...(progress.codeSprint || {}) },
    academy: { ...def.academy, ...(progress.academy || {}) },
    speedTest: { ...def.speedTest, ...(progress.speedTest || {}) },
    meteorDefense: { ...def.meteorDefense, ...(progress.meteorDefense || {}) },
    blindTyping: { ...def.blindTyping, ...(progress.blindTyping || {}) },
    shortcutsDojo: { ...def.shortcutsDojo, ...(progress.shortcutsDojo || {}) },
    summary: { ...def.summary, ...(progress.summary || {}) },
  };
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `pbkdf2$1000$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (!storedHash.startsWith('pbkdf2$')) {
    return password === storedHash;
  }
  const parts = storedHash.split('$');
  let iterations = 1000;
  let salt = '';
  let originalHash = '';

  if (parts.length === 4) {
    iterations = parseInt(parts[1], 10) || 1000;
    salt = parts[2];
    originalHash = parts[3];
  } else if (parts.length === 3) {
    salt = parts[1];
    originalHash = parts[2];
  } else {
    return false;
  }

  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

const TMP_DB_PATH = path.join('/tmp', 'users.json');

// In-memory cache seeded from bundled users data
let inMemoryUsers: UserRecord[] = Array.isArray(defaultUsersData)
  ? (defaultUsersData as unknown as UserRecord[])
  : [];

export async function getDb(): Promise<UserRecord[]> {
  // 1. Try Vercel KV / Upstash Redis if configured
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/campus_os_users`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          if (Array.isArray(parsed) && parsed.length > 0) {
            inMemoryUsers = parsed;
            return inMemoryUsers;
          }
        }
      }
    } catch (e) {
      console.warn('[Vercel Backend] KV read error:', e);
    }
  }

  // 2. Try /tmp filesystem (Vercel serverless execution storage)
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      const raw = fs.readFileSync(TMP_DB_PATH, 'utf-8');
      const users = JSON.parse(raw);
      if (Array.isArray(users) && users.length >= inMemoryUsers.length) {
        inMemoryUsers = users;
        return inMemoryUsers;
      }
    }
  } catch (err) {
    console.warn('[Vercel Backend] /tmp read error:', err);
  }

  return inMemoryUsers;
}

export async function saveDb(users: UserRecord[]): Promise<void> {
  inMemoryUsers = users;

  // 1. Write to /tmp
  try {
    fs.writeFileSync(TMP_DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Vercel Backend] /tmp write error:', err);
  }

  // 2. Write to project root if writable (local dev)
  try {
    const localDbPath = path.join(process.cwd(), 'data', 'users.json');
    if (fs.existsSync(path.dirname(localDbPath))) {
      fs.writeFileSync(localDbPath, JSON.stringify(users, null, 2), 'utf-8');
    }
  } catch {
    // Read-only filesystem in Vercel production is expected
  }

  // 3. Sync to Vercel KV / Upstash Redis if configured
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/set/campus_os_users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(users)),
      });
    } catch (e) {
      console.warn('[Vercel Backend] KV save error:', e);
    }
  }
}

export async function parseBody<T = any>(req: any): Promise<T> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {} as T;
      }
    }
    return req.body as T;
  }

  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({} as T);
      }
    });
  });
}

export function sendJson(res: any, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(data));
}
