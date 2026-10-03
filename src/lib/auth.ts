import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const emailSchema = z.string().trim().email("Adresse e-mail invalide").max(255);
export const passwordSchema = z.string().min(8, "8 caractères minimum").max(72);

export function translateAuthError(msg: string): string {
  if (/invalid login/i.test(msg)) return "E-mail ou mot de passe incorrect.";
  if (/already registered/i.test(msg)) return "Un compte existe déjà avec cet e-mail.";
  if (/email not confirmed/i.test(msg)) return "Veuillez confirmer votre e-mail avant de vous connecter.";
  if (/pwned|weak/i.test(msg)) return "Ce mot de passe est trop faible.";
  return "Une erreur est survenue. Veuillez réessayer.";
}

export const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });

export const signUp = (email: string, password: string, firstName: string, lastName: string) =>
  supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { first_name: firstName, last_name: lastName } },
  });

export const sendReset = (email: string) =>
  supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });

export const signOut = () => supabase.auth.signOut();
