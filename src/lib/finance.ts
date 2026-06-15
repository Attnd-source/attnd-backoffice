// Finance formulas — single source of truth (confirmed with the client).
import { brand } from "./brand";

/** Net revenue for a service-provider invoice supplier line. */
export function netRevenue(offerCost: number, actualCost: number, commissionPct: number): number {
  const commission = actualCost * (commissionPct / 100);
  return round2(offerCost - actualCost + commission);
}

/** Attnd commission on a generated invoice. */
export function attndCommission(actualCost: number, commissionPct: number): number {
  return round2(actualCost * (commissionPct / 100));
}

export function vatOn(commission: number): number {
  return round2(commission * brand.vatRate);
}

export function invoicedAmount(actualCost: number, commission: number, vat: number): number {
  return round2(actualCost - commission - vat);
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
