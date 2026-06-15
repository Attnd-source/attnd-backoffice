"use client";
import { useFormState } from "react-dom";
import Link from "next/link";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { AlertCircle } from "lucide-react";
import { EVENT_STATUSES, EVENT_STATUS_LABELS } from "@/lib/constants";
import { dateInput } from "@/lib/format";
import type { Option } from "@/lib/options";
import { createEvent, updateEvent } from "./actions";

type EventData = {
  id: string;
  organizerId: string;
  communicationInfo: string | null;
  eventName: string;
  typeOfEvent: string | null;
  numberOfAttendees: number | null;
  expectedBudget: number | null;
  status: string;
  city: string | null;
  eventDate: Date | null;
  serviceProviderId: string | null;
  externalPartner: string | null;
  partnerBankInfo: string | null;
  note: string | null;
  serviceIds: string[];
};

export function EventForm({
  event,
  organizers,
  partners,
  venueCategories,
  vendorCategories,
  defaultOrganizerId,
}: {
  event?: EventData;
  organizers: Option[];
  partners: Option[];
  venueCategories: Option[];
  vendorCategories: Option[];
  defaultOrganizerId?: string;
}) {
  const action = event ? updateEvent : createEvent;
  const [state, formAction] = useFormState(action, {} as { error?: string });
  const selected = new Set(event?.serviceIds ?? []);

  return (
    <form action={formAction} className="space-y-6">
      {event && <input type="hidden" name="id" value={event.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organizer" htmlFor="organizerId" required>
          <Select
            id="organizerId"
            name="organizerId"
            defaultValue={event?.organizerId ?? defaultOrganizerId ?? ""}
            required
          >
            <option value="">— Select organizer —</option>
            {organizers.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Event name" htmlFor="eventName" required>
          <Input id="eventName" name="eventName" defaultValue={event?.eventName} required />
        </Field>
        <Field label="Communication info" htmlFor="communicationInfo">
          <Input id="communicationInfo" name="communicationInfo" defaultValue={event?.communicationInfo ?? ""} />
        </Field>
        <Field label="Type of event" htmlFor="typeOfEvent">
          <Input id="typeOfEvent" name="typeOfEvent" defaultValue={event?.typeOfEvent ?? ""} placeholder="Conference, gala…" />
        </Field>
        <Field label="Number of attendees" htmlFor="numberOfAttendees">
          <Input id="numberOfAttendees" name="numberOfAttendees" type="number" min="0" defaultValue={event?.numberOfAttendees ?? ""} />
        </Field>
        <Field label="Expected budget" htmlFor="expectedBudget">
          <Input id="expectedBudget" name="expectedBudget" type="number" step="0.01" min="0" defaultValue={event?.expectedBudget ?? ""} />
        </Field>
        <Field label="Status" htmlFor="status" required>
          <Select id="status" name="status" defaultValue={event?.status ?? "NEW"}>
            {EVENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {EVENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="City" htmlFor="city">
          <Input id="city" name="city" defaultValue={event?.city ?? ""} />
        </Field>
        <Field label="Event date" htmlFor="eventDate">
          <Input id="eventDate" name="eventDate" type="date" defaultValue={dateInput(event?.eventDate)} />
        </Field>
        <Field label="Service provider (partner)" htmlFor="serviceProviderId">
          <Select id="serviceProviderId" name="serviceProviderId" defaultValue={event?.serviceProviderId ?? ""}>
            <option value="">— Select partner —</option>
            {partners.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="External partner" htmlFor="externalPartner">
          <Input id="externalPartner" name="externalPartner" defaultValue={event?.externalPartner ?? ""} />
        </Field>
        <Field label="Partner bank info" htmlFor="partnerBankInfo">
          <Input id="partnerBankInfo" name="partnerBankInfo" defaultValue={event?.partnerBankInfo ?? ""} placeholder="IBAN / account" />
        </Field>
      </div>

      <Field label="Type of services needed" htmlFor="servicesNeeded" hint="Venue & vendor subcategories required for this event.">
        <div className="grid gap-4 rounded-md border border-border p-4 sm:grid-cols-2">
          <ServiceGroup title="Venues" options={venueCategories} selected={selected} />
          <ServiceGroup title="Vendors" options={vendorCategories} selected={selected} />
        </div>
      </Field>

      <Field label="Note" htmlFor="note">
        <Textarea id="note" name="note" defaultValue={event?.note ?? ""} rows={3} />
      </Field>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="flex gap-3">
        <SubmitButton>{event ? "Save changes" : "Create event"}</SubmitButton>
        <Link href={event ? `/events/${event.id}` : "/events"}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}

function ServiceGroup({
  title,
  options,
  selected,
}: {
  title: string;
  options: Option[];
  selected: Set<string>;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="space-y-1.5">
        {options.length === 0 && <p className="text-sm text-muted-foreground">None defined.</p>}
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="servicesNeeded"
              value={o.value}
              defaultChecked={selected.has(o.value)}
              className="h-4 w-4"
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}
