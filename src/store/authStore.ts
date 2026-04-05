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
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .limit(1);
    
    const existingProfile = profiles && profiles.length > 0 ? profiles[0] : null;
    
    if (existingProfile) {
      // If profile exists but email is missing, update it
      if (!existingProfile.email) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const { data: updatedProfiles } = await supabase
            .from('profiles')
            .update({ email: user.email })
            .eq('id', userId)
            .select()
            .limit(1);
          
          if (updatedProfiles && updatedProfiles.length > 0) set({ profile: updatedProfiles[0] });
          else set({ profile: existingProfile });
        } else {
          set({ profile: existingProfile });
        }
      } else {
        set({ profile: existingProfile });
      }
    } else if (fetchError || !existingProfile) {
      // Profile not found, create it
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: newProfiles } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            email: user.email,
            role: 'student'
          })
          .select()
          .limit(1);
        
        if (newProfiles && newProfiles.length > 0) set({ profile: newProfiles[0] });
      }
    }
  }
}));
