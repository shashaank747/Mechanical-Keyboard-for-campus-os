import { getDb, saveDb, getDefaultProgress, parseBody, sendJson } from './_db';

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

    const gameType = data.gameType || data.gameId;
    const details = data.details || data.data;
    const nowIso = new Date().toISOString();

    if ((gameType === 'codeSprint' || gameType === 'codesprint') && details) {
      const lang = (details.lang as string) || 'code';
      const levelId = Number(details.levelId) || 1;
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
    } else if ((gameType === 'speedTest' || gameType === 'speedtest') && details) {
      const wpm = Number(details.wpm) || 0;
      const accuracy = Number(details.accuracy) || 100;
      user.progress.speedTest.testsTaken += 1;
      if (wpm > user.progress.speedTest.bestWpm) {
        user.progress.speedTest.bestWpm = wpm;
      }
      user.progress.speedTest.avgAccuracy = accuracy;
      user.progress.summary.lastActiveGame = `Speed Arena (${wpm} WPM)`;
    } else if ((gameType === 'meteorDefense' || gameType === 'fallingwords') && details) {
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
    } else if ((gameType === 'shortcutsDojo' || gameType === 'shortcuts') && details) {
      const count = Number(details.count) || 1;
      user.progress.shortcutsDojo.shortcutsMastered += count;
      user.progress.summary.lastActiveGame = `Shortcuts Dojo (${user.progress.shortcutsDojo.shortcutsMastered} mastered)`;
    } else if (gameType === 'soundmatrix' && details) {
      user.progress.summary.lastActiveGame = `Echo Matrix`;
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

    await saveDb(users);

    return sendJson(res, 200, { success: true, progress: user.progress });
  } catch (err: unknown) {
    return sendJson(res, 500, { success: false, error: (err as Error).message });
  }
}
