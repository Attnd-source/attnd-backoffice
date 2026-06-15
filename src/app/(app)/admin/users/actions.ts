"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { ROLES } from "@/lib/constants";

export async function createUser(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Not authorized." };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const mobile = String(formData.get("mobile") || "").trim();
  const role = String(formData.get("role") || "STAFF");
  const password = String(formData.get("password") || "");

  if (!name) return { error: "Name is required." };
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "A valid email is required." };
  if (!ROLES.includes(role as any)) return { error: "Invalid role." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "A user with that email already exists." };

  const user = await prisma.user.create({
    data: { name, email, mobile: mobile || null, role, passwordHash: await hashPassword(password) },
  });
  await recordAudit({
    entityType: "User",
    entityId: user.id,
    entityLabel: name,
    action: "CREATE",
    changes: { email: { old: null, new: email }, role: { old: null, new: role } },
    userId: session.id,
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Not authorized." };

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const mobile = String(formData.get("mobile") || "").trim();
  const role = String(formData.get("role") || "STAFF");
  const active = formData.get("active") === "on";
  const password = String(formData.get("password") || "");

  const before = await prisma.user.findUnique({ where: { id } });
  if (!before) return { error: "User not found." };
  if (!name) return { error: "Name is required." };
  if (!ROLES.includes(role as any)) return { error: "Invalid role." };

  const data: any = { name, mobile: mobile || null, role, active };
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  if (before.name !== name) changes.name = { old: before.name, new: name };
  if ((before.mobile || "") !== mobile) changes.mobile = { old: before.mobile, new: mobile };
  if (before.role !== role) changes.role = { old: before.role, new: role };
  if (before.active !== active) changes.active = { old: before.active, new: active };
  if (password) {
    if (password.length < 6) return { error: "Password must be at least 6 characters." };
    data.passwordHash = await hashPassword(password);
    changes.password = { old: "••••••", new: "changed" };
  }

  await prisma.user.update({ where: { id }, data });
  await recordAudit({
    entityType: "User",
    entityId: id,
    entityLabel: name,
    action: "UPDATE",
    changes,
    userId: session.id,
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
