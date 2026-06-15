"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";

// Simple in-memory brute-force throttle (per email). Resets on success.
const attempts = new Map<string, { count: number; first: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function tooManyAttempts(key: string): boolean {
  const rec = attempts.get(key);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const rec = attempts.get(key);
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: Date.now() });
  } else {
    rec.count += 1;
  }
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  if (tooManyAttempts(email)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    recordFailure(email);
    return { error: "Invalid credentials or inactive account." };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    recordFailure(email);
    return { error: "Invalid credentials or inactive account." };
  }

  attempts.delete(email);
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  redirect("/dashboard");
}

export async function logoutAction() {
  destroySession();
  redirect("/login");
}
