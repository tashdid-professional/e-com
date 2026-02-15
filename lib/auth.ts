import { createClient } from './supabase-server';

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  
  // Check if user has admin role in user_metadata
  return user.user_metadata?.is_admin === true;
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    return null;
  }
  return await getUser();
}
