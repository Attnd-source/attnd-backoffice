"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { LIST_KEYS } from "@/lib/constants";

export async function addListOption(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return { error: "Not authorized." };
  const listKey = String(formData.get("listKey") || "");
  const value = String(formData.get("value") || "").trim();
  if (!LIST_KEYS.includes(listKey as any)) return { error: "Invalid list." };
  if (!value) return { error: "Value is required." };

  const existing = await prisma.listOption.findUnique({ where: { listKey_value: { listKey, value } } });
  if (existing) return { error: "That value already exists." };

  const max = await prisma.listOption.aggregate({ where: { listKey }, _max: { sortOrder: true } });
  const opt = await prisma.listOption.create({
    data: { listKey, value, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });
  await recordAudit({ entityType: "ListOption", entityId: opt.id, entityLabel: `${listKey}: ${value}`, action: "CREATE", userId: session.id });
  revalidatePath("/admin/lists");
  return { ok: true };
}

export async function toggleListOption(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return;
  const id = String(formData.get("id") || "");
  const before = await prisma.listOption.findUnique({ where: { id } });
  if (!before) return;
  await prisma.listOption.update({ where: { id }, data: { active: !before.active } });
  revalidatePath("/admin/lists");
}

export async function deleteListOption(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return;
  const id = String(formData.get("id") || "");
  const before = await prisma.listOption.findUnique({ where: { id } });
  if (!before) return;
  await prisma.listOption.delete({ where: { id } });
  await recordAudit({ entityType: "ListOption", entityId: id, entityLabel: `${before.listKey}: ${before.value}`, action: "DELETE", userId: session.id });
  revalidatePath("/admin/lists");
}
