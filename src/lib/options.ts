import "server-only";
import { prisma } from "./prisma";

export type Option = { value: string; label: string };

export async function getCategoryOptions(type?: "VENUE" | "VENDOR"): Promise<Option[]> {
  const cats = await prisma.category.findMany({
    where: { active: true, ...(type ? { type } : {}) },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return cats.map((c) => ({
    value: c.id,
    label: type ? c.name : `${c.type === "VENUE" ? "Venue" : "Vendor"} · ${c.name}`,
  }));
}

export async function getPartnerOptions(): Promise<Option[]> {
  const partners = await prisma.contract.findMany({ orderBy: { partnerName: "asc" } });
  return partners.map((p) => ({ value: p.id, label: p.partnerName }));
}

export async function getOrganizerOptions(): Promise<Option[]> {
  const orgs = await prisma.organizer.findMany({ orderBy: { name: "asc" } });
  return orgs.map((o) => ({ value: o.id, label: o.name }));
}

export async function getEventOptions(): Promise<Option[]> {
  const events = await prisma.event.findMany({ orderBy: { eventName: "asc" } });
  return events.map((e) => ({ value: e.id, label: e.eventName }));
}
