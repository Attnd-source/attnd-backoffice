"use client";
import { useFormState } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { AlertCircle } from "lucide-react";
import {
  PARTNER_TYPES,
  PARTNER_TYPE_LABELS,
  CONTRACT_STATUSES,
  CONTRACT_STATUS_LABELS,
  COMMUNICATION_TYPES,
  COMMUNICATION_TYPE_LABELS,
} from "@/lib/constants";
import { dateInput } from "@/lib/format";
import type { Option } from "@/lib/options";
import { createContract, updateContract } from "./actions";

type ContractData = {
  id: string;
  type: string;
  subcategoryId: string | null;
  partnerName: string;
  pointOfContact: string | null;
  communicationType: string | null;
  communicationAddr: string | null;
  dateOfIssue: Date | null;
  status: string;
  contractIssuingDate: Date | null;
  contractPeriod: number | null;
  contractRenewal: Date | null;
  commissionPct: number;
  downPayment: string | null;
  note: string | null;
};

export function ContractForm({
  contract,
  venueCategories,
  vendorCategories,
}: {
  contract?: ContractData;
  venueCategories: Option[];
  vendorCategories: Option[];
}) {
  const action = contract ? updateContract : createContract;
  const [state, formAction] = useFormState(action, {} as { error?: string });
  const [type, setType] = useState(contract?.type ?? "VENUE");
  const subcats = type === "VENDOR" ? vendorCategories : venueCategories;

  return (
    <form action={formAction} className="space-y-6">
      {contract && <input type="hidden" name="id" value={contract.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type of contract" htmlFor="type" required>
          <Select
            id="type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {PARTNER_TYPES.map((t) => (
              <option key={t} value={t}>
                {PARTNER_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Subcategory" htmlFor="subcategoryId" hint="Based on the selected type.">
          <Select id="subcategoryId" name="subcategoryId" defaultValue={contract?.subcategoryId ?? ""}>
            <option value="">— Select —</option>
            {subcats.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Partner name" htmlFor="partnerName" required>
          <Input id="partnerName" name="partnerName" defaultValue={contract?.partnerName} required />
        </Field>
        <Field label="Point of contact" htmlFor="pointOfContact">
          <Input id="pointOfContact" name="pointOfContact" defaultValue={contract?.pointOfContact ?? ""} />
        </Field>
        <Field label="Communication type" htmlFor="communicationType">
          <Select id="communicationType" name="communicationType" defaultValue={contract?.communicationType ?? ""}>
            <option value="">— Select —</option>
            {COMMUNICATION_TYPES.map((c) => (
              <option key={c} value={c}>
                {COMMUNICATION_TYPE_LABELS[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Communication address" htmlFor="communicationAddr">
          <Input
            id="communicationAddr"
            name="communicationAddr"
            defaultValue={contract?.communicationAddr ?? ""}
            placeholder="Phone / email / location"
          />
        </Field>
        <Field label="Date of issue" htmlFor="dateOfIssue">
          <Input id="dateOfIssue" name="dateOfIssue" type="date" defaultValue={dateInput(contract?.dateOfIssue)} />
        </Field>
        <Field label="Status" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={contract?.status ?? "CONTACTED"}>
            {CONTRACT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CONTRACT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Contract issuing date" htmlFor="contractIssuingDate">
          <Input
            id="contractIssuingDate"
            name="contractIssuingDate"
            type="date"
            defaultValue={dateInput(contract?.contractIssuingDate)}
          />
        </Field>
        <Field label="Contract period (months)" htmlFor="contractPeriod">
          <Input id="contractPeriod" name="contractPeriod" type="number" min="0" defaultValue={contract?.contractPeriod ?? ""} />
        </Field>
        <Field label="Contract renewal date" htmlFor="contractRenewal">
          <Input
            id="contractRenewal"
            name="contractRenewal"
            type="date"
            defaultValue={dateInput(contract?.contractRenewal)}
          />
        </Field>
        <Field label="Commission %" htmlFor="commissionPct" hint="Used by the finance module.">
          <Input
            id="commissionPct"
            name="commissionPct"
            type="number"
            step="0.01"
            min="0"
            max="100"
            defaultValue={contract?.commissionPct ?? 0}
          />
        </Field>
        <Field label="Down payment" htmlFor="downPayment">
          <Input id="downPayment" name="downPayment" defaultValue={contract?.downPayment ?? ""} placeholder="e.g. 50% upfront" />
        </Field>
      </div>

      <Field label="Note" htmlFor="note">
        <Textarea id="note" name="note" defaultValue={contract?.note ?? ""} rows={3} />
      </Field>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="flex gap-3">
        <SubmitButton>{contract ? "Save changes" : "Create contract"}</SubmitButton>
        <Link href={contract ? `/contracts/${contract.id}` : "/contracts"}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
