import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Secure PBKDF2 SHA-512 Password Encryption Engine
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `pbkdf2$1000$${salt}$${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  // If legacy plaintext password exists, allow login and auto-upgrade
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

interface StudentProgress {
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

interface UserRecord {
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

function getDefaultProgress(): StudentProgress {
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

function normalizeProgress(progress?: any): StudentProgress {
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

// User Database API Plugin for Vite dev server
function userDatabasePlugin(): Plugin {
  const rootDir = fileURLToPath(new URL('.', import.meta.url));
  const dbDir = path.resolve(rootDir, 'data');
  const dbFile = path.resolve(dbDir, 'users.json');
  const csvFile = path.resolve(dbDir, 'students_summary.csv');
  const htmlFile = path.resolve(dbDir, 'students_progress_table.html');

  const generateCsv = (users: UserRecord[]) => {
    try {
      const headers = [
        'User ID',
        'Username',
        'Email',
        'Password',
        'IP Address',
        'Total Games Played',
        'Total Levels Mastered',
        'Code Sprint Solved',
        'Code Sprint Best WPM',
        'Code Sprint Languages',
        'Code Sprint Levels Detail',
        'Academy Highest Level',
        'Academy Completed Levels',
        'Speed Test Best WPM',
        'Speed Tests Taken',
        'Meteor Defense High Score',
        'Meteor Defense Highest Wave',
        'Blind Typing Lines',
        'Shortcuts Mastered',
        'Last Active Game',
        'Registered At',
        'Last Activity At',
      ];

      const rows = users.map((u) => {
        const p = normalizeProgress(u.progress);
        const codeSprintDetails = Object.entries(p.codeSprint.completedLevels || {})
          .map(([lvl, data]) => `${lvl} (${data.wpm} WPM, ${data.timeSecs}s)`)
          .join('; ');

        return [
          `"${u.userId}"`,
          `"${u.username.replace(/"/g, '""')}"`,
          `"${u.email.replace(/"/g, '""')}"`,
          `"${u.password.replace(/"/g, '""')}"`,
          `"${u.ipAddress}"`,
          p.summary.totalGamesPlayed || 0,
          p.summary.totalLevelsMastered || 0,
          p.codeSprint.totalSolved || 0,
          p.codeSprint.bestWpm || 0,
          `"${(p.codeSprint.languagesPracticed || []).join(', ')}"`,
          `"${codeSprintDetails.replace(/"/g, '""')}"`,
          p.academy.highestLevel || 0,
          `"${(p.academy.completedLevels || []).join(', ')}"`,
          p.speedTest.bestWpm || 0,
          p.speedTest.testsTaken || 0,
          p.meteorDefense.highScore || 0,
          p.meteorDefense.highestWave || 0,
          p.blindTyping.completedLines || 0,
          p.shortcutsDojo.shortcutsMastered || 0,
          `"${(p.summary.lastActiveGame || 'None').replace(/"/g, '""')}"`,
          `"${u.createdAt}"`,
          `"${p.summary.lastActivityTime || u.lastLoginAt}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      fs.writeFileSync(csvFile, csvContent, 'utf-8');
    } catch (err) {
      console.error('Error generating CSV table:', err);
    }
  };

  const generateHtmlTable = (users: UserRecord[]) => {
    try {
      const jsonUsers = JSON.stringify(users, null, 2);
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Progress & Analytics Database Table</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111726;
      --card-border: #1e293b;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --accent: #f97316;
      --accent-glow: rgba(249, 115, 22, 0.25);
      --code-bg: #0b1120;
      --success: #10b981;
      --cyan: #06b6d4;
      --purple: #a855f7;
      --blue: #3b82f6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 28px; line-height: 1.5; }
    
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid var(--card-border); padding-bottom: 20px; }
    .header-left h1 { font-size: 26px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 12px; }
    .header-left p { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
    .badge-live { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 6px; }
    .badge-live::before { content: ""; width: 6px; height: 6px; background: var(--success); border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.3); } }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .kpi-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 18px 20px; display: flex; flex-direction: column; gap: 6px; }
    .kpi-title { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .kpi-val { font-size: 28px; font-weight: 800; color: #fff; }
    .kpi-sub { font-size: 12px; color: var(--text-muted); }

    .controls-bar { display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; align-items: center; justify-content: space-between; }
    .search-input { background: var(--card-bg); border: 1px solid var(--card-border); color: #fff; padding: 10px 16px; border-radius: 10px; font-size: 14px; width: 320px; outline: none; transition: border-color 0.2s; }
    .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-glow); }
    .filter-btn { background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text-muted); padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .filter-btn.active, .filter-btn:hover { background: #1e293b; color: #fff; border-color: #334155; }
    .filter-btn.active { border-color: var(--accent); color: var(--accent); }

    .btn-action { background: linear-gradient(135deg, #ea580c, #f97316); color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
    .btn-secondary { background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text); padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }

    .table-container { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5); }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    thead th { background: #0c1220; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 18px; border-bottom: 1px solid var(--card-border); white-space: nowrap; }
    tbody tr { border-bottom: 1px solid #172033; transition: background 0.15s; }
    tbody tr:hover { background: #151d30; }
    tbody td { padding: 14px 18px; font-size: 13px; vertical-align: middle; }

    .user-pill { display: flex; align-items: center; gap: 10px; }
    .user-avatar { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; }
    .user-id-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; background: #1e293b; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
    .user-ip { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b; }

    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .badge-code { background: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.3); }
    .badge-academy { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .badge-speed { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
    .badge-meteor { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-lang { background: #1e293b; color: #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 2px 6px; border-radius: 4px; }

    .progress-bar-wrap { width: 100%; max-width: 110px; height: 6px; background: #1e293b; border-radius: 999px; overflow: hidden; margin-top: 4px; }
    .progress-bar-fill { height: 100%; border-radius: 999px; }

    .details-row { background: #0c1222 !important; display: none; }
    .details-box { padding: 18px 24px; border-left: 3px solid var(--accent); }
    .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .details-card { background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 14px; }
    .details-card h4 { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
    
    .level-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .level-chip { background: #1f293d; border: 1px solid #334155; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #e2e8f0; display: inline-flex; align-items: center; gap: 4px; }
    .level-chip.completed { background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.35); color: #34d399; }
    
    .btn-toggle-details { background: none; border: 1px solid #334155; color: #94a3b8; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 6px; cursor: pointer; }
    .btn-toggle-details:hover { background: #1e293b; color: #fff; }
    
    .empty-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-left">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
        <span class="badge-live">Live Database Table View</span>
        <span style="font-size: 12px; color: #64748b;">Source: data/users.json</span>
      </div>
      <h1>🎓 Student Learning Progress & Activity Table</h1>
      <p>Analyze individual student progress, games played, syntax levels mastered, typing speed (WPM), and activity logs.</p>
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <a href="./students_summary.csv" download class="btn-secondary" style="display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
        📥 Download CSV
      </a>
      <button onclick="window.location.reload()" class="btn-action">
        🔄 Refresh Table
      </button>
    </div>
  </div>

  <!-- KPI METRICS SUMMARY -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <span class="kpi-title">Total Registered Students</span>
      <span class="kpi-val" id="kpi-total-students">0</span>
      <span class="kpi-sub">Accounts in database</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-title">Code Sprint Solved</span>
      <span class="kpi-val" style="color: #fb923c;" id="kpi-code-solved">0</span>
      <span class="kpi-sub">Total syntax levels cleared</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-title">Academy Levels Mastered</span>
      <span class="kpi-val" style="color: #60a5fa;" id="kpi-academy-levels">0</span>
      <span class="kpi-sub">Typing drills completed</span>
    </div>
    <div class="kpi-card">
      <span class="kpi-title">Highest Speed Recorded</span>
      <span class="kpi-val" style="color: #34d399;" id="kpi-top-wpm">0 WPM</span>
      <span class="kpi-sub">Peak student performance</span>
    </div>
  </div>

  <!-- SEARCH & FILTER BAR -->
  <div class="controls-bar">
    <input type="text" id="searchInput" class="search-input" placeholder="🔍 Search student name, ID, email, or IP..." oninput="renderTable()">
    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
      <button class="filter-btn active" onclick="setFilter('all', this)">All Students</button>
      <button class="filter-btn" onclick="setFilter('codeSprint', this)">Code Sprint Active</button>
      <button class="filter-btn" onclick="setFilter('academy', this)">Academy Active</button>
      <button class="filter-btn" onclick="setFilter('speedTest', this)">Speed Arena</button>
    </div>
  </div>

  <!-- MAIN STUDENTS TABLE -->
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Student / ID</th>
          <th>Credentials & IP</th>
          <th>Total Progress</th>
          <th>Code Sprint Progress</th>
          <th>Academy</th>
          <th>Meteor Defense</th>
          <th>Speed Test</th>
          <th>Last Active Game</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="tableBody">
        <!-- Injected via JavaScript -->
      </tbody>
    </table>
  </div>

  <script>
    const USERS_DATA = ${jsonUsers};
    let currentFilter = 'all';

    function setFilter(filter, el) {
      currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      el.classList.add('active');
      renderTable();
    }

    function toggleDetails(userId) {
      const row = document.getElementById('details-' + userId);
      if (row) {
        row.style.display = (row.style.display === 'table-row') ? 'none' : 'table-row';
      }
    }

    function renderTable() {
      const search = (document.getElementById('searchInput').value || '').toLowerCase().trim();
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';

      let totalCodeSolved = 0;
      let totalAcademyLevels = 0;
      let topWpm = 0;

      const filtered = USERS_DATA.filter(user => {
        const p = user.progress || {};
        const codeSolved = p.codeSprint?.totalSolved || 0;
        const acadLevels = p.academy?.completedLevels?.length || 0;
        const speedTaken = p.speedTest?.testsTaken || 0;

        // Filter tabs
        if (currentFilter === 'codeSprint' && codeSolved === 0) return false;
        if (currentFilter === 'academy' && acadLevels === 0) return false;
        if (currentFilter === 'speedTest' && speedTaken === 0) return false;

        // Search query
        if (!search) return true;
        return (
          user.username.toLowerCase().includes(search) ||
          user.userId.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.ipAddress.toLowerCase().includes(search)
        );
      });

      // Calculate global KPI stats
      USERS_DATA.forEach(user => {
        const p = user.progress || {};
        totalCodeSolved += p.codeSprint?.totalSolved || 0;
        totalAcademyLevels += p.academy?.completedLevels?.length || 0;
        const wpm = Math.max(p.codeSprint?.bestWpm || 0, p.speedTest?.bestWpm || 0);
        if (wpm > topWpm) topWpm = wpm;
      });

      document.getElementById('kpi-total-students').textContent = USERS_DATA.length;
      document.getElementById('kpi-code-solved').textContent = totalCodeSolved;
      document.getElementById('kpi-academy-levels').textContent = totalAcademyLevels;
      document.getElementById('kpi-top-wpm').textContent = topWpm + ' WPM';

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No student records match the search/filter criteria.</td></tr>';
        return;
      }

      filtered.forEach(u => {
        const p = u.progress || {
          codeSprint: { completedLevels: {}, totalSolved: 0, languagesPracticed: [], bestWpm: 0 },
          academy: { completedLevels: [], highestLevel: 0, avgAccuracy: 0 },
          speedTest: { testsTaken: 0, bestWpm: 0, avgAccuracy: 0 },
          meteorDefense: { highScore: 0, highestWave: 0 },
          blindTyping: { completedLines: 0, accuracy: 0 },
          shortcutsDojo: { shortcutsMastered: 0 },
          summary: { totalGamesPlayed: 0, totalLevelsMastered: 0, lastActiveGame: 'None', lastActivityTime: u.lastLoginAt }
        };

        const initial = u.username ? u.username.charAt(0).toUpperCase() : '?';
        const codeSolved = p.codeSprint?.totalSolved || 0;
        const codeLangs = (p.codeSprint?.languagesPracticed || []).join(', ') || 'None';
        const acadLevel = p.academy?.highestLevel || 0;
        const meteorWave = p.meteorDefense?.highestWave || 0;
        const meteorScore = p.meteorDefense?.highScore || 0;
        const speedWpm = p.speedTest?.bestWpm || 0;

        const totalLevels = (p.summary?.totalLevelsMastered !== undefined) 
          ? p.summary.totalLevelsMastered 
          : (codeSolved + (p.academy?.completedLevels?.length || 0));

        // Code Sprint levels detail list
        const codeLevelsEntries = Object.entries(p.codeSprint?.completedLevels || {});
        const codeLevelsChips = codeLevelsEntries.length > 0 
          ? codeLevelsEntries.map(([k, v]) => \`<span class="level-chip completed">✓ \${k.toUpperCase()} (\${v.wpm} WPM, \${v.timeSecs}s)</span>\`).join('')
          : '<span style="color:#64748b; font-size:12px;">No code sprint levels completed yet</span>';

        // Academy levels detail list
        const academyLevels = (p.academy?.completedLevels || []);
        const acadChips = academyLevels.length > 0
          ? academyLevels.map(lvl => \`<span class="level-chip completed">✓ Level \${lvl}</span>\`).join('')
          : '<span style="color:#64748b; font-size:12px;">No academy levels completed yet</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td>
            <div class="user-pill">
              <div class="user-avatar">\${initial}</div>
              <div>
                <div style="font-weight: 700; color: #fff; font-size: 14px;">\${u.username}</div>
                <span class="user-id-tag">\${u.userId}</span>
              </div>
            </div>
          </td>
          <td>
            <div style="color: #cbd5e1; font-size: 12px;">\${u.email}</div>
            <div style="font-size: 11px; color: #10b981; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; background: rgba(16, 185, 129, 0.1); padding: 1px 6px; border-radius: 4px; margin-top: 2px;">
              <span>🔒</span> <span>Encrypted (SHA-512)</span>
            </div>
            <div class="user-ip" style="margin-top: 2px;">IP: \${u.ipAddress}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: #38bdf8; font-size: 14px;">\${totalLevels} Levels</div>
            <div style="font-size: 11px; color: #64748b;">\${p.summary?.totalGamesPlayed || 0} Games Played</div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width: \${Math.min(100, totalLevels * 5)}%; background: linear-gradient(90deg, #38bdf8, #818cf8);"></div>
            </div>
          </td>
          <td>
            <span class="badge badge-code">⚡ \${codeSolved} Solved</span>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">Best: \${p.codeSprint?.bestWpm || 0} WPM</div>
            <div style="margin-top: 3px; display: flex; gap: 3px; flex-wrap: wrap;">
              \${(p.codeSprint?.languagesPracticed || []).map(l => \`<span class="badge-lang">\${l}</span>\`).join('')}
            </div>
          </td>
          <td>
            <span class="badge badge-academy">🎯 Lvl \${acadLevel}</span>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">\${academyLevels.length} Done</div>
          </td>
          <td>
            <span class="badge badge-meteor">☄️ Wave \${meteorWave}</span>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">\${meteorScore} pts</div>
          </td>
          <td>
            <span class="badge badge-speed">⚡ \${speedWpm} WPM</span>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">\${p.speedTest?.testsTaken || 0} tests</div>
          </td>
          <td>
            <div style="font-weight: 600; font-size: 12px; color: #e2e8f0;">\${p.summary?.lastActiveGame || 'Registered'}</div>
            <div style="font-size: 10px; color: #64748b;">\${new Date(p.summary?.lastActivityTime || u.lastLoginAt).toLocaleString()}</div>
          </td>
          <td>
            <button class="btn-toggle-details" onclick="toggleDetails('\${u.userId}')">
              🔍 Inspect
            </button>
          </td>
        \`;
        tbody.appendChild(tr);

        // Detailed Expandable Row
        const detailsTr = document.createElement('tr');
        detailsTr.id = 'details-' + u.userId;
        detailsTr.className = 'details-row';
        detailsTr.innerHTML = \`
          <td colspan="9">
            <div class="details-box">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="font-weight: 800; font-size: 14px; color: #fff;">
                  📊 Complete Student Audit: <span style="color: var(--accent);">\${u.username}</span> (\${u.userId})
                </div>
                <div style="font-size: 12px; color: #94a3b8;">
                  Created: \${new Date(u.createdAt).toLocaleDateString()} | Last Login: \${new Date(u.lastLoginAt).toLocaleString()}
                </div>
              </div>

              <div class="details-grid">
                <div class="details-card">
                  <h4>⚡ Code Sprint & Syntax Levels <span>\${codeSolved} completed</span></h4>
                  <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
                    Languages Practiced: <strong style="color: #fff;">\${codeLangs}</strong> | Peak Speed: <strong style="color: #fb923c;">\${p.codeSprint?.bestWpm || 0} WPM</strong>
                  </div>
                  <div class="level-list">
                    \${codeLevelsChips}
                  </div>
                </div>

                <div class="details-card">
                  <h4>🎯 Typing Academy Mastery <span>\${academyLevels.length} levels</span></h4>
                  <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
                    Highest Level: <strong style="color: #fff;">Level \${acadLevel}</strong>
                  </div>
                  <div class="level-list">
                    \${acadChips}
                  </div>
                </div>

                <div class="details-card">
                  <h4>☄️ Other Arcade Games Progress</h4>
                  <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
                    <div>• <strong>Meteor Defense:</strong> Wave \${meteorWave}, High Score \${meteorScore} pts</div>
                    <div>• <strong>Speed Arena:</strong> Best \${speedWpm} WPM across \${p.speedTest?.testsTaken || 0} attempts</div>
                    <div>• <strong>Blind Typing:</strong> \${p.blindTyping?.completedLines || 0} lines completed</div>
                    <div>• <strong>Shortcuts Dojo:</strong> \${p.shortcutsDojo?.shortcutsMastered || 0} keybinds mastered</div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        \`;
        tbody.appendChild(detailsTr);
      });
    }

    // Initial render
    renderTable();
  </script>
</body>
</html>`;
      fs.writeFileSync(htmlFile, htmlContent, 'utf-8');
    } catch (err) {
      console.error('Error generating HTML table:', err);
    }
  };

  const ensureDb = (): UserRecord[] => {
    try {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      if (!fs.existsSync(dbFile)) {
        fs.writeFileSync(dbFile, JSON.stringify([], null, 2), 'utf-8');
        generateCsv([]);
        generateHtmlTable([]);
        return [];
      }
      const raw = fs.readFileSync(dbFile, 'utf-8');
      const users: UserRecord[] = JSON.parse(raw);
      // Ensure all users have a progress structure and encrypted password
      let mutated = false;
      users.forEach((u) => {
        if (!u.progress || !u.progress.codeSprint) {
          u.progress = normalizeProgress(u.progress);
          mutated = true;
        }
        if (!u.password.startsWith('pbkdf2$')) {
          u.password = hashPassword(u.password);
          mutated = true;
        }
        if (!u.themeId) {
          u.themeId = 'studio-light';
          mutated = true;
        }
        if (u.colorZones === undefined) {
          u.colorZones = false;
          mutated = true;
        }
        if (!u.preferences) {
          u.preferences = {
            themeId: u.themeId,
            colorZones: u.colorZones,
          };
          mutated = true;
        }
      });
      if (mutated) {
        fs.writeFileSync(dbFile, JSON.stringify(users, null, 2), 'utf-8');
      }
      // Always keep CSV and HTML table synchronized
      generateCsv(users);
      generateHtmlTable(users);
      return users;
    } catch {
      return [];
    }
  };

  const saveDb = (users: UserRecord[]) => {
    try {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      fs.writeFileSync(dbFile, JSON.stringify(users, null, 2), 'utf-8');
      generateCsv(users);
      generateHtmlTable(users);
    } catch (err) {
      console.error('Error saving users database:', err);
    }
  };

  return {
    name: 'user-database-api',
    configureServer(server) {
      // Initialize on startup
      ensureDb();

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];

        // 1. GET /api/users
        if (req.method === 'GET' && url === '/api/users') {
          const users = ensureDb();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, count: users.length, users }));
          return;
        }

        // 2. POST /api/register
        if (req.method === 'POST' && url === '/api/register') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const users = ensureDb();

              const username = (data.username || '').trim();
              const email = (data.email || '').trim().toLowerCase();
              const password = data.password || '';
              
              // Get IP address from headers, socket or client payload
              const remoteIp = 
                (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
                req.socket?.remoteAddress ||
                data.ipAddress ||
                '127.0.0.1';

              if (!username || !password) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Username and password are required' }));
                return;
              }

              // Check existing
              const existing = users.find(
                (u) =>
                  u.username.toLowerCase() === username.toLowerCase() ||
                  (email && u.email.toLowerCase() === email)
              );

              if (existing) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Username or email already registered' }));
                return;
              }

              // Generate User ID
              const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
              let rand = '';
              for (let i = 0; i < 8; i++) {
                rand += chars.charAt(Math.floor(Math.random() * chars.length));
              }
              const userId = `USR-${rand}`;

              const newUser: UserRecord = {
                userId,
                username,
                email: email || `${username}@example.com`,
                password: hashPassword(password),
                ipAddress: data.ipAddress || remoteIp,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                progress: getDefaultProgress(),
              };

              users.push(newUser);
              saveDb(users);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, user: newUser }));
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: (err as Error).message }));
            }
          });
          return;
        }

        // 3. POST /api/login
        if (req.method === 'POST' && url === '/api/login') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const users = ensureDb();
              const identifier = (data.loginIdentifier || '').trim().toLowerCase();
              const password = data.password || '';

              const remoteIp = 
                (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
                req.socket?.remoteAddress ||
                data.ipAddress ||
                '127.0.0.1';

              const user = users.find(
                (u) =>
                  u.email.toLowerCase() === identifier ||
                  u.username.toLowerCase() === identifier
              );

              if (!user) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Account not found' }));
                return;
              }

              if (!verifyPassword(password, user.password)) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Invalid password' }));
                return;
              }

              // Auto-upgrade legacy plaintext to encrypted hash if needed
              if (!user.password.startsWith('pbkdf2$')) {
                user.password = hashPassword(password);
              }

              // Update IP and last login timestamp
              user.ipAddress = data.ipAddress || remoteIp;
              user.lastLoginAt = new Date().toISOString();
              if (!user.progress) {
                user.progress = getDefaultProgress();
              }
              saveDb(users);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, user }));
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: (err as Error).message }));
            }
          });
          return;
        }

        // 3.5. POST /api/reset-password
        if (req.method === 'POST' && url === '/api/reset-password') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const users = ensureDb();
              const identifier = (data.loginIdentifier || '').trim().toLowerCase();
              const newPassword = data.newPassword || '';

              if (!identifier || !newPassword) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Username/Email and New Password are required' }));
                return;
              }

              const user = users.find(
                (u) =>
                  u.email.toLowerCase() === identifier ||
                  u.username.toLowerCase() === identifier
              );

              if (!user) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'No account found with that username or email' }));
                return;
              }

              user.password = hashPassword(newPassword);
              saveDb(users);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: (err as Error).message }));
            }
          });
          return;
        }

        // 4. POST /api/progress
        if (req.method === 'POST' && url === '/api/progress') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const users = ensureDb();
              const username = (data.username || '').trim().toLowerCase();

              const user = users.find(
                (u) =>
                  u.username.toLowerCase() === username ||
                  u.email.toLowerCase() === username ||
                  u.userId.toLowerCase() === username
              );

              if (!user) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'User not found' }));
                return;
              }

              if (!user.progress) {
                user.progress = getDefaultProgress();
              }

              const { gameType, details } = data;
              const nowIso = new Date().toISOString();

              if (gameType === 'codeSprint' && details) {
                const lang = details.lang as string;
                const levelId = details.levelId as number;
                const wpm = Number(details.wpm) || 0;
                const timeSecs = Number(details.timeSecs) || 0;

                const key = `${lang}_${levelId}`;
                user.progress.codeSprint.completedLevels[key] = {
                  completedAt: nowIso,
                  wpm,
                  timeSecs,
                };
                user.progress.codeSprint.totalSolved = Object.keys(
                  user.progress.codeSprint.completedLevels
                ).length;
                if (!user.progress.codeSprint.languagesPracticed.includes(lang)) {
                  user.progress.codeSprint.languagesPracticed.push(lang);
                }
                if (wpm > user.progress.codeSprint.bestWpm) {
                  user.progress.codeSprint.bestWpm = wpm;
                }
                user.progress.summary.lastActiveGame = `Code Sprint (${lang.toUpperCase()} Lvl ${levelId})`;
              } else if (gameType === 'academy' && details) {
                const levelId = Number(details.levelId);
                if (!user.progress.academy.completedLevels.includes(levelId)) {
                  user.progress.academy.completedLevels.push(levelId);
                }
                user.progress.academy.highestLevel = Math.max(
                  user.progress.academy.highestLevel,
                  levelId
                );
                user.progress.summary.lastActiveGame = `Typing Academy (Lvl ${levelId})`;
              } else if (gameType === 'speedTest' && details) {
                const wpm = Number(details.wpm) || 0;
                const accuracy = Number(details.accuracy) || 100;
                user.progress.speedTest.testsTaken += 1;
                if (wpm > user.progress.speedTest.bestWpm) {
                  user.progress.speedTest.bestWpm = wpm;
                }
                user.progress.speedTest.avgAccuracy = accuracy;
                user.progress.summary.lastActiveGame = `Speed Arena (${wpm} WPM)`;
              } else if (gameType === 'meteorDefense' && details) {
                const score = Number(details.score) || 0;
                const wave = Number(details.wave) || 1;
                if (score > user.progress.meteorDefense.highScore) {
                  user.progress.meteorDefense.highScore = score;
                }
                if (wave > user.progress.meteorDefense.highestWave) {
                  user.progress.meteorDefense.highestWave = wave;
                }
                user.progress.summary.lastActiveGame = `Meteor Defense (Wave ${wave})`;
              } else if (gameType === 'blindTyping' && details) {
                const lines = Number(details.lines) || 1;
                user.progress.blindTyping.completedLines += lines;
                user.progress.summary.lastActiveGame = `Blind Typing (${user.progress.blindTyping.completedLines} lines)`;
              } else if (gameType === 'shortcutsDojo' && details) {
                const count = Number(details.count) || 1;
                user.progress.shortcutsDojo.shortcutsMastered += count;
                user.progress.summary.lastActiveGame = `Shortcuts Dojo (${user.progress.shortcutsDojo.shortcutsMastered} mastered)`;
              }

              // Update summaries
              user.progress.summary.totalGamesPlayed =
                user.progress.codeSprint.totalSolved +
                user.progress.academy.completedLevels.length +
                user.progress.speedTest.testsTaken +
                (user.progress.meteorDefense.highestWave > 0 ? 1 : 0);
              
              user.progress.summary.totalLevelsMastered =
                user.progress.codeSprint.totalSolved +
                user.progress.academy.completedLevels.length;
              
              user.progress.summary.lastActivityTime = nowIso;

              saveDb(users);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, progress: user.progress }));
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: (err as Error).message }));
            }
          });
          return;
        }

        // 5. POST /api/theme (Save theme / palette preference)
        if (req.method === 'POST' && url === '/api/theme') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const users = ensureDb();
              const username = (data.username || '').trim().toLowerCase();

              const user = users.find(
                (u) =>
                  u.username.toLowerCase() === username ||
                  u.email.toLowerCase() === username ||
                  u.userId.toLowerCase() === username
              );

              if (!user) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'User not found' }));
                return;
              }

              user.themeId = data.themeId || 'studio-light';
              user.colorZones = Boolean(data.colorZones);
              user.preferences = {
                themeId: user.themeId,
                colorZones: user.colorZones,
              };

              saveDb(users);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, themeId: user.themeId, colorZones: user.colorZones }));
            } catch (err: unknown) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: (err as Error).message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    userDatabasePlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});

