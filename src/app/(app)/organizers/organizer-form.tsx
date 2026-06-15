"use client";
import { useFormState } from "react-dom";
import Link from "next/link";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { AlertCircle } from "lucide-react";
import { ORGANIZER_CHANNELS, ORGANIZER_CHANNEL_LABELS } from "@/lib/constants";
import { dateInput } from "@/lib/format";
import { createOrganizer, updateOrganizer } from "./actions";

type OrganizerData = {
  id: string;
  name: string;
  communicationChannel: string | null;
  communicationInfo: string | null;
  date: Date | null;
  note: string | null;
};

export function OrganizerForm({ organizer }: { organizer?: OrganizerData }) {
  const action = organizer ? updateOrganizer : createOrganizer;
  const [state, formAction] = useFormState(action, {} as { error?: string });

  return (
    <form action={formAction} className="space-y-6">
      {organizer && <input type="hidden" name="id" value={organizer.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Organizer name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={organizer?.name} required />
        </Field>
        <Field label="Communication channel" htmlFor="communicationChannel">
          <Select
            id="communicationChannel"
            name="communicationChannel"
            defaultValue={organizer?.communicationChannel ?? ""}
          >
            <option value="">— Select —</option>
            {ORGANIZER_CHANNELS.map((c) => (
              <option key={c} value={c}>
                {ORGANIZER_CHANNEL_LABELS[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Communication info" htmlFor="communicationInfo">
          <Input
            id="communicationInfo"
            name="communicationInfo"
            defaultValue={organizer?.communicationInfo ?? ""}
            placeholder="Email / phone / handle"
          />
        </Field>
        <Field label="Date" htmlFor="date" hint="Defaults to today.">
          <Input id="date" name="date" type="date" defaultValue={dateInput(organizer?.date ?? new Date())} />
        </Field>
      </div>
      <Field label="Note" htmlFor="note">
        <Textarea id="note" name="note" defaultValue={organizer?.note ?? ""} rows={3} />
      </Field>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="flex gap-3">
        <SubmitButton>{organizer ? "Save changes" : "Create organizer"}</SubmitButton>
        <Link href={organizer ? `/organizers/${organizer.id}` : "/organizers"}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
