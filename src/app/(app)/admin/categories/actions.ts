"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { PARTNER_TYPES } from "@/lib/constants";

export async function createCategory(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Not authorized." };

  const type = String(formData.get("type") || "");
  const name = String(formData.get("name") || "").trim();
  if (!PARTNER_TYPES.includes(type as any)) return { error: "Pick a valid type." };
  if (!name) return { error: "Name is required." };

  const existing = await prisma.category.findUnique({ where: { type_name: { type, name } } });
  if (existing) return { error: "That category already exists." };

  const cat = await prisma.category.create({ data: { type, name } });
  await recordAudit({
    entityType: "Category",
    entityId: cat.id,
    entityLabel: `${type} · ${name}`,
    action: "CREATE",
    userId: session.id,
  });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function renameCategory(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return;
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) return;
  const before = await prisma.category.findUnique({ where: { id } });
  if (!before) return;
  await prisma.category.update({ where: { id }, data: { name } });
  await recordAudit({
    entityType: "Category",
    entityId: id,
    entityLabel: `${before.type} · ${name}`,
    action: "UPDATE",
    changes: { name: { old: before.name, new: name } },
    userId: session.id,
  });
  revalidatePath("/admin/categories");
}

export async function toggleCategory(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return;
  const id = String(formData.get("id") || "");
  const before = await prisma.category.findUnique({ where: { id } });
  if (!before) return;
  await prisma.category.update({ where: { id }, data: { active: !before.active } });
  await recordAudit({
    entityType: "Category",
    entityId: id,
    entityLabel: `${before.type} · ${before.name}`,
    action: "UPDATE",
    changes: { active: { old: before.active, new: !before.active } },
    userId: session.id,
  });
  revalidatePath("/admin/categories");
}
