import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    // Si hay un código de invitación pendiente (guardado durante el signup),
    // unir al usuario a esa familia antes de cargar el perfil
    const pendingCode = localStorage.getItem('pendingInviteCode');
    if (pendingCode) {
      localStorage.removeItem('pendingInviteCode');
      await supabase.rpc('join_family', { invite_code: pendingCode.trim().toUpperCase() });
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
    setLoading(false);
  };

  const joinFamily = async (code) => {
    const { data, error } = await supabase.rpc('join_family', { invite_code: code.trim().toUpperCase() });
    if (error) return { error: error.message };
    if (data?.error) return { error: data.error };
    // Recargar perfil para obtener el nuevo family_id
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', (await supabase.auth.getUser()).data.user?.id).single();
    if (profileData) setProfile(profileData);
    return { success: true };
  };

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (data) setProfile(data);
    return { data, error };
  };

  return { user, profile, loading, signUp, signIn, signInWithGoogle, signOut, updateProfile, loadProfile, joinFamily };
}
