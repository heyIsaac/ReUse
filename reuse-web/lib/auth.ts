import { cookies } from 'next/headers';
import { prisma } from './prisma';

export const SESSION_COOKIE = 'reuse_session_id';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    // throw redirect('/login'); // We handle redirect in the page itself for simplicity
    return null;
  }
  return user;
}
