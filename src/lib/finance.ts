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

/** Per-supplier invoiced amount on a service-provider invoice. */
export function supplierInvoiced(actualCost: number, commissionPct: number): number {
  const commission = attndCommission(actualCost, commissionPct);
  const vat = vatOn(commission);
  return invoicedAmount(actualCost, commission, vat);
}

/** First installment = invoiced amount × down-payment%. */
export function firstPayment(invoiced: number, downPaymentPct: number): number {
  return round2(invoiced * (downPaymentPct / 100));
}

/** Second installment = invoiced amount × (100% − down-payment%). */
export function secondPayment(invoiced: number, downPaymentPct: number): number {
  return round2(invoiced * ((100 - downPaymentPct) / 100));
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
