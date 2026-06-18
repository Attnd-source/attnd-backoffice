import "server-only";
import { prisma } from "./prisma";

export type PartnerFin = {
  value: string;
  label: string;
  commissionPct: number;
  downPaymentPct: number;
  iban: string | null;
};

export type EventFin = {
  value: string;
  label: string;
  eventDate: string | null;
};

export async function getPartnerFinanceOptions(): Promise<PartnerFin[]> {
  const partners = await prisma.contract.findMany({ orderBy: { partnerName: "asc" } });
  return partners.map((p) => ({
    value: p.id,
    label: p.partnerName,
    commissionPct: p.commissionPct,
    downPaymentPct: p.downPaymentPct,
    iban: p.iban,
  }));
}

export async function getEventFinanceOptions(): Promise<EventFin[]> {
  const events = await prisma.event.findMany({ orderBy: { eventName: "asc" } });
  return events.map((e) => ({
    value: e.id,
    label: e.eventName,
    eventDate: e.eventDate?.toISOString() ?? null,
  }));
}
