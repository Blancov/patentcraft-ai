const GUEST_SESSION_KEY = 'patentCraftGuestSession';

// Get existing guest session or create a new one
export const getGuestSession = () => {
  let session = JSON.parse(localStorage.getItem(GUEST_SESSION_KEY));
  
  if (!session) {
    session = {
      id: `guest_${Date.now()}`,
      createdAt: new Date().toISOString(),
      drafts: []
    };
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
  }
  
  return session;
};

// Clear guest session
export const clearGuestSession = () => {
  localStorage.removeItem(GUEST_SESSION_KEY);
};

// Save draft to guest session
export const saveGuestDraft = (draft) => {
  const session = getGuestSession();
  session.drafts = [...(session.drafts || []), draft];
  localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session));
};

// Get guest drafts
export const getGuestDrafts = () => {
  const session = getGuestSession();
  return session?.drafts || [];
};