import { api } from "./client";
import type { SessionUser } from "./types";

export async function login(username: string, password: string): Promise<SessionUser> {
  const { data } = await api.post("/login", { username, password });
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/logout");
}

export async function fetchSession(): Promise<SessionUser | null> {
  try {
    const { data } = await api.get("/@me");
    return data;
  } catch {
    return null;
  }
}
