import { getDb, saveDb, parseBody, sendJson } from './_db.js';

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

    user.themeId = data.themeId || 'studio-light';
    user.colorZones = Boolean(data.colorZones);
    user.preferences = {
      themeId: user.themeId,
      colorZones: user.colorZones,
    };

    await saveDb(users);

    return sendJson(res, 200, {
      success: true,
      themeId: user.themeId,
      colorZones: user.colorZones,
    });
  } catch (err: unknown) {
    return sendJson(res, 500, { success: false, error: (err as Error).message });
  }
}
