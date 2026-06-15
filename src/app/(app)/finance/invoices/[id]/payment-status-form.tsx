"use client";
import { Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { PAYMENT_STATUSES, PAYMENT_STATUSES_2, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { updateInvoiceStatuses } from "../actions";

export function PaymentStatusForm({
  invoiceId,
  rowId,
  first,
  second,
}: {
  invoiceId: string;
  rowId: string;
  first: string;
  second: string;
}) {
  return (
    <form action={updateInvoiceStatuses} className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
      <input type="hidden" name="id" value={invoiceId} />
      <input type="hidden" name="supplierRowId" value={rowId} />
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">1st payment</label>
        <Select name="firstPaymentStatus" defaultValue={first} className="h-9 w-32">
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-muted-foreground">2nd payment</label>
        <Select name="secondPaymentStatus" defaultValue={second} className="h-9 w-32">
          {PAYMENT_STATUSES_2.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <SubmitButton variant="outline" size="sm">
        Update
      </SubmitButton>
    </form>
  );
}
