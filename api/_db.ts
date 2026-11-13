import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gqzrtecgzwxrnteflmrc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_btcKUvdeuhp_RI3EfTTBeA_xQNxklvS';

let supabaseClient: any = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.warn('[Supabase Backend Init]:', err);
  }
}

let defaultUsersData: any[] = [];
try {
  defaultUsersData = require('../data/users.json');
} catch {
  defaultUsersData = [];
}

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
  // 1. Try Supabase Cloud Database if configured
  if (supabaseClient) {
    try {
      const { data: students, error } = await supabaseClient
        .from('students')
        .select('*');

      if (!error && Array.isArray(students) && students.length > 0) {
        // Fetch separate student_progress rows if present
        let progressMap: Record<string, any> = {};
        try {
          const { data: progressRows } = await supabaseClient
            .from('student_progress')
            .select('user_id, progress');
          if (Array.isArray(progressRows)) {
            for (const p of progressRows) {
              if (p.user_id) progressMap[p.user_id] = p.progress;
            }
          }
        } catch {
          // ignore
        }

        inMemoryUsers = students.map((row: any) => {
          const prog =
            row.progress || progressMap[row.user_id] || getDefaultProgress();
          return {
            userId: row.user_id,
            username: row.username,
            email: row.email,
            password: row.password_hash || row.password,
            ipAddress: row.ip_address || '127.0.0.1',
            createdAt: row.created_at,
            lastLoginAt: row.last_login_at,
            progress:
              typeof prog === 'string' ? JSON.parse(prog) : prog,
            themeId: row.theme_id || 'studio-light',
            colorZones: Boolean(row.color_zones),
            preferences: {
              themeId: row.theme_id || 'studio-light',
              colorZones: Boolean(row.color_zones),
            },
          };
        });
        return inMemoryUsers;
      }
    } catch (e) {
      console.warn('[Supabase Backend Read]:', e);
    }
  }

  // 2. Try Vercel KV / Upstash Redis if configured
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

  // 1. Sync to Supabase Cloud Database if configured
  if (supabaseClient) {
    try {
      for (const u of users) {
        const studentPayload: any = {
          user_id: u.userId,
          username: u.username,
          email: u.email,
          password_hash: u.password,
          ip_address: u.ipAddress,
          created_at: u.createdAt,
          last_login_at: u.lastLoginAt,
          theme_id: u.themeId || 'studio-light',
          color_zones: Boolean(u.colorZones),
          progress: u.progress || getDefaultProgress(),
        };

        const { error: studentErr } = await supabaseClient
          .from('students')
          .upsert(studentPayload, { onConflict: 'user_id' });

        // If 'progress' column is not on students, upsert without it and write to student_progress
        if (studentErr && (studentErr.message?.includes('progress') || studentErr.code === 'PGRST204')) {
          delete studentPayload.progress;
          await supabaseClient
            .from('students')
            .upsert(studentPayload, { onConflict: 'user_id' });

          try {
            await supabaseClient.from('student_progress').upsert(
              {
                user_id: u.userId,
                progress: u.progress || getDefaultProgress(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );
          } catch {}
        }
      }
    } catch (e) {
      console.warn('[Supabase Backend Upsert]:', e);
    }
  }

  // 2. Write to /tmp
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
