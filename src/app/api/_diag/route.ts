import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TEMPORARY diagnostic endpoint — reports which DB query fails on production.
// Remove after debugging.
export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, string> = {};
  const steps: [string, () => Promise<unknown>][] = [
    ["contract.count", () => prisma.contract.count()],
    ["contract.groupBy", () => prisma.contract.groupBy({ by: ["status"], _count: true })],
    ["event.groupBy", () => prisma.event.groupBy({ by: ["status"], _count: true })],
    ["invoice.count", () => prisma.invoice.count()],
    ["generatedInvoice.aggregate", () => prisma.generatedInvoice.aggregate({ _sum: { invoicedAmount: true } })],
    ["auditLog.findMany", () => prisma.auditLog.findMany({ include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 8 })],
    ["contract.newFields", () => prisma.contract.findMany({ select: { downPaymentPct: true, iban: true, crNumber: true, vatNumber: true }, take: 1 })],
    ["event.partners", () => prisma.event.findMany({ include: { partners: { include: { partner: true } } }, take: 1 })],
    ["invoice.suppliers", () => prisma.invoice.findMany({ include: { suppliers: true }, take: 1 })],
  ];
  for (const [name, fn] of steps) {
    try {
      await fn();
      results[name] = "ok";
    } catch (e: unknown) {
      results[name] = "ERROR: " + (e instanceof Error ? e.message : String(e)).slice(0, 400);
    }
  }
  return NextResponse.json(results);
}
