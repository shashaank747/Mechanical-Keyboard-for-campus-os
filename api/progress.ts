import { getDb, saveDb, getDefaultProgress, parseBody, sendJson } from './_db.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  try {
    const data = await parseBody(req);
    const users = await getDb();
    const username = (data.username || '').trim().toLowerCase();

    const user = users.find(
      (u) =>
        u.username.toLowerCase() === username ||
        u.email.toLowerCase() === username ||
        u.userId.toLowerCase() === username
    );

    if (!user) {
      return sendJson(res, 404, { success: false, error: 'User not found' });
    }

    if (!user.progress) {
      user.progress = getDefaultProgress();
    }

    const rawGame = String(data.gameType || data.gameId || '').toLowerCase();
    const details = data.details || data.data || {};
    const nowIso = new Date().toISOString();

    if ((rawGame.includes('sprint') || rawGame.includes('codesprint')) && details) {
      const lang = (details.lang as string) || (details.language as string) || 'code';
      const levelId = Number(details.levelId || details.level) || 1;
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
    } else if (rawGame.includes('academy') && details) {
      const levelId = Number(details.levelId || details.level) || 1;
      if (!user.progress.academy.completedLevels.includes(levelId)) {
        user.progress.academy.completedLevels.push(levelId);
      }
      user.progress.academy.highestLevel = Math.max(
        user.progress.academy.highestLevel,
        levelId
      );
      if (details.accuracy) {
        user.progress.academy.avgAccuracy = Number(details.accuracy);
      }
      user.progress.summary.lastActiveGame = `Touch Typing Academy (Lvl ${levelId})`;
    } else if (rawGame.includes('speed') && details) {
      const wpm = Number(details.wpm) || 0;
      const accuracy = Number(details.accuracy) || 100;
      user.progress.speedTest.testsTaken += 1;
      if (wpm > user.progress.speedTest.bestWpm) {
        user.progress.speedTest.bestWpm = wpm;
      }
      user.progress.speedTest.avgAccuracy = accuracy;
      user.progress.summary.lastActiveGame = `Speed Arena (${wpm} WPM)`;
    } else if ((rawGame.includes('meteor') || rawGame.includes('falling')) && details) {
      const score = Number(details.score) || 0;
      const wave = Number(details.wave) || 1;
      if (score > user.progress.meteorDefense.highScore) {
        user.progress.meteorDefense.highScore = score;
      }
      if (wave > user.progress.meteorDefense.highestWave) {
        user.progress.meteorDefense.highestWave = wave;
      }
      user.progress.summary.lastActiveGame = `Key Meteor Defense (Wave ${wave})`;
    } else if (rawGame.includes('blind') && details) {
      const lines = Number(details.lines) || 1;
      user.progress.blindTyping.completedLines += lines;
      if (details.accuracy) {
        user.progress.blindTyping.accuracy = Number(details.accuracy);
      }
      user.progress.summary.lastActiveGame = `Blind Typing Dojo (${user.progress.blindTyping.completedLines} lines)`;
    } else if (rawGame.includes('shortcut') && details) {
      const count = Number(details.shortcutsMastered || details.count) || 1;
      user.progress.shortcutsDojo.shortcutsMastered = Math.max(
        user.progress.shortcutsDojo.shortcutsMastered,
        count
      );
      user.progress.summary.lastActiveGame = `Shortcuts Dojo (${user.progress.shortcutsDojo.shortcutsMastered} mastered)`;
    } else if (rawGame.includes('sound') || rawGame.includes('echo')) {
      user.progress.summary.lastActiveGame = `Echo Matrix Voice`;
    }

    // Update summaries
    user.progress.summary.totalGamesPlayed =
      user.progress.codeSprint.totalSolved +
      user.progress.academy.completedLevels.length +
      user.progress.speedTest.testsTaken +
      (user.progress.meteorDefense.highestWave > 0 ? 1 : 0) +
      (user.progress.blindTyping.completedLines > 0 ? 1 : 0) +
      (user.progress.shortcutsDojo.shortcutsMastered > 0 ? 1 : 0);

    user.progress.summary.totalLevelsMastered =
      user.progress.codeSprint.totalSolved +
      user.progress.academy.completedLevels.length;

    user.progress.summary.lastActivityTime = nowIso;

    await saveDb(users);

    return sendJson(res, 200, { success: true, progress: user.progress });
  } catch (err: unknown) {
    return sendJson(res, 500, { success: false, error: (err as Error).message });
  }
}
