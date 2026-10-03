import { supabase } from "@/integrations/supabase/client";
import type { Resume, TemplateId } from "@/types/resume";

export async function listResumes(): Promise<Resume[]> {
  const { data, error } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Resume[];
}

export async function getResume(id: string): Promise<Resume | null> {
  const { data, error } = await supabase.from("resumes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Resume | null;
}

export async function createResume(input: { name: string; template: TemplateId }): Promise<Resume> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Non connecté");
  const { data, error } = await supabase
    .from("resumes")
    .insert({ user_id: u.user.id, name: input.name, template: input.template })
    .select()
    .single();
  if (error) throw error;
  return data as Resume;
}

export async function duplicateResume(r: Resume): Promise<void> {
  const { error } = await supabase.from("resumes").insert({
    user_id: r.user_id,
    name: `${r.name} (copie)`,
    template: r.template,
    primary_color: r.primary_color,
    secondary_color: r.secondary_color,
    font_family: r.font_family,
  });
  if (error) throw error;
}

export async function deleteResume(id: string): Promise<void> {
  const { error } = await supabase.from("resumes").delete().eq("id", id);
  if (error) throw error;
}

export async function getMyProfile() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from("profiles").select("first_name,last_name,email").eq("user_id", u.user.id).maybeSingle();
  return data;
}
