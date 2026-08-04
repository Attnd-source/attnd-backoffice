import "server-only";
import { prisma } from "./prisma";
import type { Option } from "./options";

export async function getListOptions(listKey: string): Promise<string[]> {
  const rows = await prisma.listOption.findMany({
    where: { listKey, active: true },
    orderBy: [{ sortOrder: "asc" }, { value: "asc" }],
  });
  return rows.map((r) => r.value);
}

export async function getUserOptions(): Promise<Option[]> {
  const users = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return users.map((u) => ({ value: u.id, label: u.name }));
}

/** Map of userId -> name, for resolving owners/agents on read. */
export async function getUserNameMap(): Promise<Record<string, string>> {
  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  return Object.fromEntries(users.map((u) => [u.id, u.name]));
}

export async function getCrmFormOptions() {
  const [sources, priorities, cities, users] = await Promise.all([
    getListOptions("SOURCE"),
    getListOptions("PRIORITY"),
    getListOptions("CITY"),
    getUserOptions(),
  ]);
  return { sources, priorities, cities, users };
}
