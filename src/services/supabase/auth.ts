import { supabase } from './client';

export class AuthService {
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  }

  static onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  }

  static async getUserLists(userId: string) {
    const { data, error } = await supabase
      .from('list_members')
      .select('list_id, lists(id, name)')
      .eq('user_id', userId);
    return { data, error };
  }
}
