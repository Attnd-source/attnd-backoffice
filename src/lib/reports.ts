import "server-only";
import { prisma } from "./prisma";
import { date as fmtDate, dateTime } from "./format";
import {
  label,
  PARTNER_TYPE_LABELS,
  CONTRACT_STATUS_LABELS,
  ORGANIZER_CHANNEL_LABELS,
  EVENT_STATUS_LABELS,
} from "./constants";

export const DATASETS = [
  { key: "contracts", label: "Contracts" },
  { key: "organizers", label: "Organizers" },
  { key: "events", label: "Events" },
  { key: "invoices", label: "Service-provider invoices" },
  { key: "generated", label: "Generated invoices" },
] as const;

export type DatasetKey = (typeof DATASETS)[number]["key"];

export type ReportData = {
  title: string;
  columns: string[];
  rows: (string | number)[][];
};

function withinRange(d: Date | null | undefined, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  if (!d) return false;
  const t = d.getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to && t > new Date(to).getTime() + 86400000) return false;
  return true;
}

export async function buildReport(
  dataset: DatasetKey,
  from?: string,
  to?: string
): Promise<ReportData> {
  switch (dataset) {
    case "contracts": {
      const rows = await prisma.contract.findMany({
        include: { issuer: { select: { name: true } }, subcategory: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      const filtered = rows.filter((c) => withinRange(c.contractIssuingDate ?? c.createdAt, from, to));
      return {
        title: "Contracts",
        columns: ["Partner", "Type", "Subcategory", "Status", "Issuer", "Date of issue", "Issuing date", "Renewal", "Commission %", "Down payment %", "CR/Freelance", "VAT no.", "IBAN"],
        rows: filtered.map((c) => [
          c.partnerName,
          label(PARTNER_TYPE_LABELS, c.type),
          c.subcategory?.name ?? "—",
          label(CONTRACT_STATUS_LABELS, c.status),
          c.issuer.name,
          fmtDate(c.dateOfIssue),
          fmtDate(c.contractIssuingDate),
          fmtDate(c.contractRenewal),
          c.commissionPct,
          c.downPaymentPct,
          c.crNumber ?? "—",
          c.vatNumber ?? "—",
          c.iban ?? "—",
        ]),
      };
    }
    case "organizers": {
      const rows = await prisma.organizer.findMany({
        include: { issuer: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      });
      const filtered = rows.filter((o) => withinRange(o.date, from, to));
      return {
        title: "Organizers",
        columns: ["Name", "Channel", "Contact info", "Lead issuer", "Date"],
        rows: filtered.map((o) => [
          o.name,
          label(ORGANIZER_CHANNEL_LABELS, o.communicationChannel),
          o.communicationInfo ?? "—",
          o.issuer.name,
          fmtDate(o.date),
        ]),
      };
    }
    case "events": {
      const rows = await prisma.event.findMany({
        include: {
          organizer: { select: { name: true } },
          issuer: { select: { name: true } },
          partners: { include: { partner: { select: { partnerName: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });
      const filtered = rows.filter((e) => withinRange(e.eventDate ?? e.createdAt, from, to));
      return {
        title: "Events",
        columns: ["Event", "Organizer", "Type", "Status", "City", "Attendees", "Expected budget", "Event date", "Service providers", "Issuer"],
        rows: filtered.map((e) => [
          e.eventName,
          e.organizer.name,
          e.typeOfEvent ?? "—",
          label(EVENT_STATUS_LABELS, e.status),
          e.city ?? "—",
          e.numberOfAttendees ?? 0,
          e.expectedBudget ?? 0,
          fmtDate(e.eventDate),
          e.partners.map((p) => p.partner.partnerName).join(", ") || "—",
          e.issuer.name,
        ]),
      };
    }
    case "invoices": {
      const rows = await prisma.invoice.findMany({
        include: {
          serviceProvider: { select: { partnerName: true } },
          event: { select: { eventName: true } },
          createdBy: { select: { name: true } },
          suppliers: { select: { netRevenue: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      const filtered = rows.filter((i) => withinRange(i.createdAt, from, to));
      return {
        title: "Service-provider invoices",
        columns: ["Service provider", "Event", "Suppliers", "Total net revenue", "Created by", "Created"],
        rows: filtered.map((i) => [
          i.serviceProvider.partnerName,
          i.event.eventName,
          i.suppliers.length,
          i.suppliers.reduce((s, r) => s + r.netRevenue, 0),
          i.createdBy.name,
          dateTime(i.createdAt),
        ]),
      };
    }
    case "generated": {
      const rows = await prisma.generatedInvoice.findMany({
        include: {
          serviceProvider: { select: { partnerName: true } },
          event: { select: { eventName: true } },
          createdBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      const filtered = rows.filter((g) => withinRange(g.createdAt, from, to));
      return {
        title: "Generated invoices",
        columns: ["Invoice #", "Service provider", "Event", "Event date", "Actual cost", "Attnd commission", "VAT", "Invoiced amount", "Created by", "Created"],
        rows: filtered.map((g) => [
          `INV-${g.number}`,
          g.serviceProvider.partnerName,
          g.event.eventName,
          fmtDate(g.eventDate),
          g.actualCost,
          g.attndCommission,
          g.vat,
          g.invoicedAmount,
          g.createdBy.name,
          dateTime(g.createdAt),
        ]),
      };
    }
  }
}
