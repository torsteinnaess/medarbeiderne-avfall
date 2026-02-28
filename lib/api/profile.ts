// Profil-API — hent og oppdater brukerprofil
import { supabase } from '../supabase';
import type { Profile } from '../types';

// Hent brukerprofil
export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Feil ved henting av profil: ${error.message}`);
  }

  return data as Profile;
}

// Oppdater brukerprofil
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'name' | 'phone'>>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Feil ved oppdatering av profil: ${error.message}`);
  }

  return data as Profile;
}

