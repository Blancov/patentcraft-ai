import { AES, enc } from 'crypto-js';

const GUEST_SESSION_KEY = 'patentCraftGuestSession';
const SECRET = import.meta.env.VITE_GUEST_SECRET;

export const getGuestSession = () => {
  const encrypted = localStorage.getItem(GUEST_SESSION_KEY);
  if (!encrypted) return createNewSession();

  try {
    const bytes = AES.decrypt(encrypted, SECRET);
    return JSON.parse(bytes.toString(enc.Utf8));
  } catch {
    return createNewSession();
  }
};

const createNewSession = () => {
  const session = {
    id: `guest_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    drafts: []
  };
  saveSession(session);
  return session;
};

const saveSession = (session) => {
  const encrypted = AES.encrypt(
    JSON.stringify(session), 
    SECRET
  ).toString();
  localStorage.setItem(GUEST_SESSION_KEY, encrypted);
};

export const clearGuestSession = () => {
  localStorage.removeItem(GUEST_SESSION_KEY);
};

export const saveGuestDraft = (draft) => {
  const session = getGuestSession();
  session.drafts = [...(session.drafts || []), draft];
  saveSession(session);
};

export const getGuestDrafts = () => {
  const session = getGuestSession();
  return session?.drafts || [];
};