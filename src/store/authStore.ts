import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthState {
  user: any | null;
  profile: any | null;
  loading: boolean;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ user: null, profile: null });
  },
  fetchProfile: async (userId) => {
    if (!isSupabaseConfigured) return;
    
    // First try to get the existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      // If profile exists but email is missing, update it
      if (!existingProfile.email) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .update({ email: user.email })
            .eq('id', userId)
            .select()
            .single();
          if (updatedProfile) set({ profile: updatedProfile });
          else set({ profile: existingProfile });
        } else {
          set({ profile: existingProfile });
        }
      } else {
        set({ profile: existingProfile });
      }
    } else if (fetchError && fetchError.code === 'PGRST116') {
      // Profile not found, create it
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            email: user.email,
            role: 'student'
          })
          .select()
          .single();
        
        if (newProfile) set({ profile: newProfile });
      }
    }
  }
}));
