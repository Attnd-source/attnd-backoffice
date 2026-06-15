"use client";
import { useFormState } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { AlertCircle } from "lucide-react";
import { money } from "@/lib/format";
import { attndCommission, vatOn, invoicedAmount } from "@/lib/finance";
import { brand } from "@/lib/brand";
import type { PartnerFin, EventFin } from "@/lib/finance-options";
import { createGeneratedInvoice } from "./actions";

export function GenerateForm({
  partners,
  events,
  defaultEventId,
}: {
  partners: PartnerFin[];
  events: EventFin[];
  defaultEventId?: string;
}) {
  const [state, formAction] = useFormState(createGeneratedInvoice, {} as { error?: string });
  const initialEvent = events.find((e) => e.value === defaultEventId);
  const [providerId, setProviderId] = useState(initialEvent?.providerId ?? "");
  const [eventId, setEventId] = useState(defaultEventId ?? "");
  const [eventDate, setEventDate] = useState(initialEvent?.eventDate?.slice(0, 10) ?? "");
  const [commissionPct, setCommissionPct] = useState(
    partners.find((p) => p.value === initialEvent?.providerId)?.commissionPct ?? 0
  );
  const [actualCost, setActualCost] = useState("");

  const cost = parseFloat(actualCost) || 0;
  const commission = attndCommission(cost, commissionPct);
  const vat = vatOn(commission);
  const invoiced = invoicedAmount(cost, commission, vat);

  function onProvider(id: string) {
    setProviderId(id);
    setCommissionPct(partners.find((p) => p.value === id)?.commissionPct ?? 0);
  }
  function onEvent(id: string) {
    setEventId(id);
    const ev = events.find((e) => e.value === id);
    if (ev?.eventDate) setEventDate(ev.eventDate.slice(0, 10));
    if (ev?.providerId) onProvider(ev.providerId);
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Service provider name" htmlFor="serviceProviderId" required>
          <Select id="serviceProviderId" name="serviceProviderId" value={providerId} onChange={(e) => onProvider(e.target.value)} required>
            <option value="">— Select partner —</option>
            {partners.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Event name" htmlFor="eventId" required>
          <Select id="eventId" name="eventId" value={eventId} onChange={(e) => onEvent(e.target.value)} required>
            <option value="">— Select event —</option>
            {events.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Event date" htmlFor="eventDate" hint="Auto-filled from the event.">
          <Input id="eventDate" name="eventDate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </Field>
        <Field label="Commission % (from partner)" htmlFor="commissionPct">
          <Input
            id="commissionPct"
            name="commissionPct"
            type="number"
            step="0.01"
            value={commissionPct}
            onChange={(e) => setCommissionPct(parseFloat(e.target.value) || 0)}
          />
        </Field>
        <Field label="Actual cost" htmlFor="actualCost" required>
          <Input
            id="actualCost"
            name="actualCost"
            type="number"
            step="0.01"
            min="0"
            value={actualCost}
            onChange={(e) => setActualCost(e.target.value)}
            required
          />
        </Field>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-3">
        <Calc label="Attnd commission" hint="actual × commission%" value={money(commission)} />
        <Calc label={`VAT (${brand.vatRate * 100}%)`} hint="commission × 0.15" value={money(vat)} />
        <Calc label="Invoiced amount" hint="actual − commission − VAT" value={money(invoiced)} highlight />
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="flex gap-3">
        <SubmitButton>Generate invoice</SubmitButton>
        <Link href="/finance">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}

function Calc({
  label,
  hint,
  value,
  highlight,
}: {
  label: string;
  hint: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${highlight ? "text-brand" : ""}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
