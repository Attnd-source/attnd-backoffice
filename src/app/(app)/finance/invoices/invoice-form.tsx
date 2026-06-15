"use client";
import { useState } from "react";
import Link from "next/link";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Plus, Trash2 } from "lucide-react";
import { money } from "@/lib/format";
import { netRevenue } from "@/lib/finance";
import { PAYMENT_STATUSES, PAYMENT_STATUSES_2, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import type { PartnerFin, EventFin } from "@/lib/finance-options";
import { createInvoice } from "./actions";

type Row = {
  key: number;
  supplierId: string;
  commissionPct: number;
  downPayment: string;
  actualCost: string;
  offerCost: string;
  partnerBankInfo: string;
  firstPaymentStatus: string;
  secondPaymentStatus: string;
};

let counter = 1;
function blankRow(): Row {
  return {
    key: counter++,
    supplierId: "",
    commissionPct: 0,
    downPayment: "",
    actualCost: "",
    offerCost: "",
    partnerBankInfo: "",
    firstPaymentStatus: "PENDING",
    secondPaymentStatus: "NA",
  };
}

export function InvoiceForm({
  partners,
  events,
}: {
  partners: PartnerFin[];
  events: EventFin[];
}) {
  const [rows, setRows] = useState<Row[]>([blankRow()]);
  const [eventId, setEventId] = useState("");

  function update(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function onSupplierChange(key: number, supplierId: string) {
    const p = partners.find((x) => x.value === supplierId);
    const ev = events.find((e) => e.value === eventId);
    update(key, {
      supplierId,
      commissionPct: p?.commissionPct ?? 0,
      downPayment: p?.downPayment ?? "",
      partnerBankInfo: ev?.bankInfo ?? "",
    });
  }

  return (
    <form action={createInvoice} className="space-y-6" encType="multipart/form-data">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Service provider" htmlFor="serviceProviderId" required>
          <Select id="serviceProviderId" name="serviceProviderId" required>
            <option value="">— Select partner —</option>
            {partners.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Event" htmlFor="eventId" required>
          <Select
            id="eventId"
            name="eventId"
            required
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            <option value="">— Select event —</option>
            {events.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Service provider invoice (attachment)" htmlFor="attachment" hint="PDF or image of the supplier invoice.">
          <Input id="attachment" name="attachment" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" className="file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm" />
        </Field>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Suppliers</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => setRows((r) => [...r, blankRow()])}>
            <Plus className="h-4 w-4" /> Add supplier
          </Button>
        </div>
        <div className="space-y-4">
          {rows.map((row) => {
            const net = netRevenue(
              parseFloat(row.offerCost) || 0,
              parseFloat(row.actualCost) || 0,
              row.commissionPct || 0
            );
            return (
              <div key={row.key} className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Supplier" htmlFor={`s-${row.key}`}>
                    <Select
                      id={`s-${row.key}`}
                      name="supplierId"
                      value={row.supplierId}
                      onChange={(e) => onSupplierChange(row.key, e.target.value)}
                    >
                      <option value="">— Select —</option>
                      {partners.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Commission % (from partner)" htmlFor={`c-${row.key}`}>
                    <Input
                      id={`c-${row.key}`}
                      name="commissionPct"
                      type="number"
                      step="0.01"
                      value={row.commissionPct}
                      onChange={(e) => update(row.key, { commissionPct: parseFloat(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field label="Down payment (from partner)" htmlFor={`d-${row.key}`}>
                    <Input
                      id={`d-${row.key}`}
                      name="downPayment"
                      value={row.downPayment}
                      onChange={(e) => update(row.key, { downPayment: e.target.value })}
                    />
                  </Field>
                  <Field label="Actual cost" htmlFor={`a-${row.key}`}>
                    <Input
                      id={`a-${row.key}`}
                      name="actualCost"
                      type="number"
                      step="0.01"
                      value={row.actualCost}
                      onChange={(e) => update(row.key, { actualCost: e.target.value })}
                    />
                  </Field>
                  <Field label="Offer cost" htmlFor={`o-${row.key}`}>
                    <Input
                      id={`o-${row.key}`}
                      name="offerCost"
                      type="number"
                      step="0.01"
                      value={row.offerCost}
                      onChange={(e) => update(row.key, { offerCost: e.target.value })}
                    />
                  </Field>
                  <Field label="Partner bank info" htmlFor={`b-${row.key}`}>
                    <Input
                      id={`b-${row.key}`}
                      name="partnerBankInfo"
                      value={row.partnerBankInfo}
                      onChange={(e) => update(row.key, { partnerBankInfo: e.target.value })}
                    />
                  </Field>
                  <Field label="1st payment status" htmlFor={`p1-${row.key}`}>
                    <Select
                      id={`p1-${row.key}`}
                      name="firstPaymentStatus"
                      value={row.firstPaymentStatus}
                      onChange={(e) => update(row.key, { firstPaymentStatus: e.target.value })}
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {PAYMENT_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="2nd payment status" htmlFor={`p2-${row.key}`}>
                    <Select
                      id={`p2-${row.key}`}
                      name="secondPaymentStatus"
                      value={row.secondPaymentStatus}
                      onChange={(e) => update(row.key, { secondPaymentStatus: e.target.value })}
                    >
                      {PAYMENT_STATUSES_2.map((s) => (
                        <option key={s} value={s}>
                          {PAYMENT_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <div className="flex flex-col justify-end">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Net revenue
                    </span>
                    <span className="text-lg font-semibold text-brand">{money(net)}</span>
                    <span className="text-[11px] text-muted-foreground">
                      offer − actual + commission
                    </span>
                  </div>
                </div>
                {rows.length > 1 && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setRows((rs) => rs.filter((r) => r.key !== row.key))}
                    >
                      <Trash2 className="h-4 w-4 text-danger" /> Remove
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Field label="Note" htmlFor="note">
        <Textarea id="note" name="note" rows={2} />
      </Field>

      <div className="flex gap-3">
        <SubmitButton>Create invoice</SubmitButton>
        <Link href="/finance">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
