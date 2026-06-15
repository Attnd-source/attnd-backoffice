import "server-only";
import { prisma } from "./prisma";

export type PartnerFin = {
  value: string;
  label: string;
  commissionPct: number;
  downPayment: string | null;
};

export type EventFin = {
  value: string;
  label: string;
  bankInfo: string | null;
  eventDate: string | null;
  providerId: string | null;
};

export async function getPartnerFinanceOptions(): Promise<PartnerFin[]> {
  const partners = await prisma.contract.findMany({ orderBy: { partnerName: "asc" } });
  return partners.map((p) => ({
    value: p.id,
    label: p.partnerName,
    commissionPct: p.commissionPct,
    downPayment: p.downPayment,
  }));
}

export async function getEventFinanceOptions(): Promise<EventFin[]> {
  const events = await prisma.event.findMany({ orderBy: { eventName: "asc" } });
  return events.map((e) => ({
    value: e.id,
    label: e.eventName,
    bankInfo: e.partnerBankInfo,
    eventDate: e.eventDate?.toISOString() ?? null,
    providerId: e.serviceProviderId,
  }));
}
