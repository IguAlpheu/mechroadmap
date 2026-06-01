// ============================================================
// Lumeo — Storage (Supabase-backed)
// Replaces the old localStorage-only storage.ts
// ============================================================

import { supabase } from "./supabase";
import type { AIGeneratedSkill } from "./gemini";

export interface StoredSkill extends AIGeneratedSkill {
  createdAt: string;
  lastStudied?: string;
}

export interface SkillProgress {
  completedSteps: number[];
  streak: number;
  streakLastClaimed: string | null;
  notes: string;
}

// ── Auth ──────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ── Skills ────────────────────────────────────────────────────

export async function getSkills(): Promise<StoredSkill[]> {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map(dbRowToSkill);
}

export async function getSkillById(id: string): Promise<StoredSkill | null> {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return dbRowToSkill(data);
}

export async function saveSkill(skill: AIGeneratedSkill): Promise<StoredSkill> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated.");

  const row = {
    id: skill.id,
    user_id: user.id,
    label: skill.label,
    emoji: skill.emoji,
    number: skill.number,
    title: skill.title,
    title_highlight: skill.titleHighlight,
    description: skill.description,
    color: skill.color,
    timers: skill.timers,
    study_steps: skill.studySteps,
    resources: skill.resources,
    bar_data: skill.barData,
  };

  const { error } = await supabase.from("skills").insert(row);
  if (error) throw new Error(error.message);

  // Create empty progress row
  await supabase.from("skill_progress").insert({
    user_id: user.id,
    skill_id: skill.id,
    completed_steps: [],
    streak: 0,
    streak_last_claimed: null,
    notes: "",
  });

  return { ...skill, createdAt: new Date().toISOString() };
}

export async function deleteSkill(id: string): Promise<void> {
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateLastStudied(id: string): Promise<void> {
  await supabase
    .from("skills")
    .update({ last_studied: new Date().toISOString() })
    .eq("id", id);
}

// ── Progress ──────────────────────────────────────────────────

export async function getProgress(skillId: string): Promise<SkillProgress> {
  const { data } = await supabase
    .from("skill_progress")
    .select("*")
    .eq("skill_id", skillId)
    .single();

  if (!data) {
    return { completedSteps: [], streak: 0, streakLastClaimed: null, notes: "" };
  }

  return {
    completedSteps: data.completed_steps ?? [],
    streak: data.streak ?? 0,
    streakLastClaimed: data.streak_last_claimed ?? null,
    notes: data.notes ?? "",
  };
}

export async function saveProgress(
  skillId: string,
  progress: Partial<SkillProgress>
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (progress.completedSteps !== undefined) update.completed_steps = progress.completedSteps;
  if (progress.streak !== undefined) update.streak = progress.streak;
  if (progress.streakLastClaimed !== undefined) update.streak_last_claimed = progress.streakLastClaimed;
  if (progress.notes !== undefined) update.notes = progress.notes;

  await supabase
    .from("skill_progress")
    .update(update)
    .eq("skill_id", skillId)
    .eq("user_id", user.id);
}

export function getProgressPercent(skill: StoredSkill, completedSteps: number[]): number {
  const total = skill.studySteps?.length || 1;
  return Math.min(100, Math.round((completedSteps.length / total) * 100));
}

// ── Helpers ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbRowToSkill(row: any): StoredSkill {
  return {
    id: row.id,
    label: row.label,
    emoji: row.emoji,
    number: row.number,
    title: row.title,
    titleHighlight: row.title_highlight,
    description: row.description,
    color: row.color,
    timers: row.timers ?? [],
    studySteps: row.study_steps ?? [],
    resources: row.resources ?? [],
    barData: row.bar_data ?? [],
    createdAt: row.created_at,
    lastStudied: row.last_studied,
  };
}

// ── Legacy no-ops (kept so old imports don't break) ───────────
export function hasSession(): boolean {
  return false; // replaced by Supabase session
}
export function setSession(_active: boolean): void { /* noop */ }
export function getAuth(): null { return null; }
