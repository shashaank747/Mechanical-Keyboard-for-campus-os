import { getDb, saveDb, verifyPassword, hashPassword, getDefaultProgress, parseBody, sendJson } from './_db.js';

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
      return sendJson(res, 401, { success: false, error: 'Account not found' });
    }

    if (!verifyPassword(password, user.password)) {
      return sendJson(res, 401, { success: false, error: 'Invalid password' });
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
    await saveDb(users);

    return sendJson(res, 200, { success: true, user });
  } catch (err: unknown) {
    return sendJson(res, 500, { success: false, error: (err as Error).message });
  }
}
