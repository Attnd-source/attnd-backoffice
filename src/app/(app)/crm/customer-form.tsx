"use client";
import { useFormState } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { AlertCircle } from "lucide-react";
import { CRM_STAGE1, CRM_STAGE, CRM_STAGE_LABELS } from "@/lib/constants";
import { dateInput } from "@/lib/format";
import type { Option } from "@/lib/options";
import { createCustomer, updateCustomer } from "./actions";

type CustomerData = {
  id: string;
  date: Date | null;
  customerName: string;
  jobDescription: string | null;
  companyName: string | null;
  companyField: string | null;
  city: string | null;
  contactNumber: string | null;
  email: string | null;
  source: string | null;
  priority: string | null;
  assignedToId: string | null;
  stage1: string;
  dateStage1: Date | null;
  owner2Id: string | null;
  stage2: string | null;
  dateStage2: Date | null;
  owner3Id: string | null;
  stage3: string | null;
  dateStage3: Date | null;
  owner4Id: string | null;
  stage4: string | null;
  dateStage4: Date | null;
  owner5Id: string | null;
  stage5: string | null;
  dateStage5: Date | null;
  rejectionReason: string | null;
  eventValue: number | null;
};

export function CustomerForm({
  customer,
  sources,
  priorities,
  cities,
  users,
  agentName,
}: {
  customer?: CustomerData;
  sources: string[];
  priorities: string[];
  cities: string[];
  users: Option[];
  agentName: string;
}) {
  const action = customer ? updateCustomer : createCustomer;
  const [state, formAction] = useFormState(action, {} as { error?: string });

  const [stages, setStages] = useState<Record<string, string>>({
    stage1: customer?.stage1 ?? "NOT_HANDLED",
    stage2: customer?.stage2 ?? "",
    stage3: customer?.stage3 ?? "",
    stage4: customer?.stage4 ?? "",
    stage5: customer?.stage5 ?? "",
  });
  const anySigned = Object.values(stages).includes("SIGNED");
  const anyRejected = Object.values(stages).includes("REJECTED");

  const stageRows: { n: number; owner: string; stage: string; date: string; ownerVal?: string | null; dateVal?: Date | null }[] = [
    { n: 1, owner: "assignedToId", stage: "stage1", date: "dateStage1", ownerVal: customer?.assignedToId, dateVal: customer?.dateStage1 },
    { n: 2, owner: "owner2Id", stage: "stage2", date: "dateStage2", ownerVal: customer?.owner2Id, dateVal: customer?.dateStage2 },
    { n: 3, owner: "owner3Id", stage: "stage3", date: "dateStage3", ownerVal: customer?.owner3Id, dateVal: customer?.dateStage3 },
    { n: 4, owner: "owner4Id", stage: "stage4", date: "dateStage4", ownerVal: customer?.owner4Id, dateVal: customer?.dateStage4 },
    { n: 5, owner: "owner5Id", stage: "stage5", date: "dateStage5", ownerVal: customer?.owner5Id, dateVal: customer?.dateStage5 },
  ];

  return (
    <form action={formAction} className="space-y-6">
      {customer && <input type="hidden" name="id" value={customer.id} />}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Date" htmlFor="date" hint="Date the customer was created.">
          <Input id="date" name="date" type="date" defaultValue={dateInput(customer?.date ?? new Date())} />
        </Field>
        <Field label="Agent (creator)" htmlFor="agent">
          <Input id="agent" value={agentName} disabled />
        </Field>
        <Field label="Customer name" htmlFor="customerName" required>
          <Input id="customerName" name="customerName" defaultValue={customer?.customerName} required />
        </Field>
        <Field label="Job description" htmlFor="jobDescription">
          <Input id="jobDescription" name="jobDescription" defaultValue={customer?.jobDescription ?? ""} />
        </Field>
        <Field label="Company name" htmlFor="companyName">
          <Input id="companyName" name="companyName" defaultValue={customer?.companyName ?? ""} />
        </Field>
        <Field label="Company field" htmlFor="companyField">
          <Input id="companyField" name="companyField" defaultValue={customer?.companyField ?? ""} />
        </Field>
        <Field label="City" htmlFor="city">
          <Select id="city" name="city" defaultValue={customer?.city ?? ""}>
            <option value="">— Select —</option>
            {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
          </Select>
        </Field>
        <Field label="Contact number" htmlFor="contactNumber">
          <Input id="contactNumber" name="contactNumber" defaultValue={customer?.contactNumber ?? ""} />
        </Field>
        <Field label="Email address" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={customer?.email ?? ""} />
        </Field>
        <Field label="Source" htmlFor="source">
          <Select id="source" name="source" defaultValue={customer?.source ?? ""}>
            <option value="">— Select —</option>
            {sources.map((s) => (<option key={s} value={s}>{s}</option>))}
          </Select>
        </Field>
        <Field label="Priority" htmlFor="priority">
          <Select id="priority" name="priority" defaultValue={customer?.priority ?? ""}>
            <option value="">— Select —</option>
            {priorities.map((p) => (<option key={p} value={p}>{p}</option>))}
          </Select>
        </Field>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Pipeline stages</h3>
        <div className="space-y-3">
          {stageRows.map((row) => {
            const isStage1 = row.n === 1;
            const options = isStage1 ? CRM_STAGE1 : CRM_STAGE;
            return (
              <div key={row.n} className="grid items-end gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-[auto_1fr_1fr_1fr]">
                <div className="flex h-10 items-center text-sm font-semibold text-muted-foreground">Stage {row.n}</div>
                <Field label={isStage1 ? "Assign to" : `Owner ${row.n}`} htmlFor={row.owner}>
                  <Select id={row.owner} name={row.owner} defaultValue={row.ownerVal ?? ""}>
                    <option value="">— Select user —</option>
                    {users.map((u) => (<option key={u.value} value={u.value}>{u.label}</option>))}
                  </Select>
                </Field>
                <Field label="Stage" htmlFor={row.stage}>
                  <Select
                    id={row.stage}
                    name={row.stage}
                    value={stages[row.stage]}
                    onChange={(e) => setStages((s) => ({ ...s, [row.stage]: e.target.value }))}
                  >
                    {!isStage1 && <option value="">—</option>}
                    {options.map((o) => (<option key={o} value={o}>{CRM_STAGE_LABELS[o]}</option>))}
                  </Select>
                </Field>
                <Field label={`Date stage ${row.n}`} htmlFor={row.date}>
                  <Input id={row.date} name={row.date} type="date" defaultValue={dateInput(row.dateVal)} />
                </Field>
              </div>
            );
          })}
        </div>
      </div>

      {anyRejected && (
        <Field label="Rejection reason" htmlFor="rejectionReason" required>
          <Textarea id="rejectionReason" name="rejectionReason" rows={2} defaultValue={customer?.rejectionReason ?? ""} />
        </Field>
      )}
      {anySigned && (
        <Field label="Event value" htmlFor="eventValue" hint="Signed deal value.">
          <Input id="eventValue" name="eventValue" type="number" step="0.01" min="0" defaultValue={customer?.eventValue ?? ""} />
        </Field>
      )}

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="flex gap-3">
        <SubmitButton>{customer ? "Save changes" : "Create customer"}</SubmitButton>
        <Link href={customer ? `/crm/${customer.id}` : "/crm"}>
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  );
}
