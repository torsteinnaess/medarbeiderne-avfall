// Profil-API — hent og oppdater brukerprofil
import { supabase } from "../supabase";
import type { Profile } from "../types";
import { withNetworkError } from "../utils/network-error";

// Hent brukerprofil
export function fetchProfile(userId: string): Promise<Profile> {
  return withNetworkError(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(`Feil ved henting av profil: ${error.message}`);
    }

    return data as Profile;
  }, "Henting av profil");
}

// Oppdater brukerprofil
export function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "name" | "phone">>,
): Promise<Profile> {
  return withNetworkError(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Feil ved oppdatering av profil: ${error.message}`);
    }

    return data as Profile;
  }, "Oppdatering av profil");
}
