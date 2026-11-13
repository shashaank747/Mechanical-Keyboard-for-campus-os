import { getDb, saveDb, hashPassword, getDefaultProgress, parseBody, sendJson, type UserRecord } from './_db';

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

    const username = (data.username || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const password = data.password || '';

    const remoteIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      data.ipAddress ||
      '127.0.0.1';

    if (!username || !password) {
      return sendJson(res, 400, { success: false, error: 'Username and password are required' });
    }

    // Check existing
    const existing = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() ||
        (email && u.email.toLowerCase() === email)
    );

    if (existing) {
      return sendJson(res, 400, { success: false, error: 'Username or email already registered' });
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
      themeId: data.themeId || 'studio-light',
      colorZones: Boolean(data.colorZones),
      preferences: {
        themeId: data.themeId || 'studio-light',
        colorZones: Boolean(data.colorZones),
      },
    };

    users.push(newUser);
    await saveDb(users);

    return sendJson(res, 200, { success: true, user: newUser });
  } catch (err: unknown) {
    return sendJson(res, 500, { success: false, error: (err as Error).message });
  }
}
