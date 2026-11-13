import { getDb, saveDb, hashPassword, parseBody, sendJson } from './_db';

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
    const newPassword = data.newPassword || '';

    if (!identifier || !newPassword) {
      return sendJson(res, 400, { success: false, error: 'Username/Email and New Password are required' });
    }

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === identifier ||
        u.username.toLowerCase() === identifier
    );

    if (!user) {
      return sendJson(res, 404, { success: false, error: 'No account found with that username or email' });
    }

    user.password = hashPassword(newPassword);
    await saveDb(users);

    return sendJson(res, 200, { success: true });
  } catch (err: unknown) {
    return sendJson(res, 500, { success: false, error: (err as Error).message });
  }
}
