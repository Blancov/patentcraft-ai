export type PatentDraft = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
  claims?: string;
  status?: string;
};