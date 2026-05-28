// ============================================================
// Lumeo — Centralized Storage Helpers
// All localStorage keys in one place to avoid collisions
// ============================================================

import type { AIGeneratedSkill } from "./gemini";

export const STORAGE_KEYS = {
  AUTH: "lumeo-auth",
  SESSION: "lumeo-session",
  SKILLS: "lumeo-skills",
} as const;

// ── Auth ──────────────────────────────────────────────────────

export interface AuthData {
  username: string;
  passwordHash: string; // simple btoa, not real crypto
}

export function getAuth(): AuthData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth(username: string, password: string): void {
  const data: AuthData = {
    username: username.trim(),
    passwordHash: btoa(password),
  };
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(data));
}

export function verifyAuth(username: string, password: string): boolean {
  const auth = getAuth();
  if (!auth) return false;
  return auth.username === username.trim() && auth.passwordHash === btoa(password);
}

export function isFirstTime(): boolean {
  return getAuth() === null;
}

export function setSession(active: boolean): void {
  if (active) {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, "1");
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

export function hasSession(): boolean {
  return sessionStorage.getItem(STORAGE_KEYS.SESSION) === "1";
}

// ── Skills ────────────────────────────────────────────────────

export interface StoredSkill extends AIGeneratedSkill {
  createdAt: string;
  lastStudied?: string;
}

export function getSkills(): StoredSkill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SKILLS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSkill(skill: AIGeneratedSkill): StoredSkill {
  const skills = getSkills();
  const stored: StoredSkill = { ...skill, createdAt: new Date().toISOString() };
  skills.unshift(stored); // newest first
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  return stored;
}

export function getSkillById(id: string): StoredSkill | null {
  return getSkills().find((s) => s.id === id) ?? null;
}

export function deleteSkill(id: string): void {
  const skills = getSkills().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
}

export function updateLastStudied(id: string): void {
  const skills = getSkills();
  const idx = skills.findIndex((s) => s.id === id);
  if (idx !== -1) {
    skills[idx].lastStudied = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  }
}

// ── Progress helpers ──────────────────────────────────────────

export function getStreak(skillId: string): number {
  return parseInt(localStorage.getItem(`streak-${skillId}`) || "0", 10);
}

export function getStepsCompleted(skillId: string): number {
  const raw = localStorage.getItem(`steps-${skillId}`);
  if (!raw) return 0;
  try {
    const arr: number[] = JSON.parse(raw);
    return arr.length;
  } catch {
    return 0;
  }
}

export function getProgress(skill: StoredSkill): number {
  const totalSteps = skill.studySteps?.length || 1;
  const done = getStepsCompleted(skill.id);
  return Math.min(100, Math.round((done / totalSteps) * 100));
}
