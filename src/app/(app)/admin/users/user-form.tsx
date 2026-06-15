"use client";
import { useFormState } from "react-dom";
import Link from "next/link";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { AlertCircle } from "lucide-react";
import { ROLES } from "@/lib/constants";
import { createUser, updateUser } from "./actions";

type UserData = {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  role: string;
  active: boolean;
};

export function UserForm({ user }: { user?: UserData }) {
  const action = user ? updateUser : createUser;
  const [state, formAction] = useFormState(action, {} as { error?: string });
  const editing = !!user;

  return (
    <form action={formAction} className="space-y-5">
      {editing && <input type="hidden" name="id" value={user.id} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required>
          <Input id="name" name="name" defaultValue={user?.name} required />
        </Field>
        <Field label="Email" htmlFor="email" required hint={editing ? "Email can't be changed." : undefined}>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email}
            required
            disabled={editing}
          />
        </Field>
        <Field label="Mobile number" htmlFor="mobile">
          <Input id="mobile" name="mobile" defaultValue={user?.mobile ?? ""} placeholder="+966…" />
        </Field>
        <Field label="Role" htmlFor="role" required>
          <Select id="role" name="role" defaultValue={user?.role ?? "STAFF"}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "ADMIN" ? "Administrator" : "Staff"}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={editing ? "Reset password" : "Temporary password"}
          htmlFor="password"
          required={!editing}
          hint={editing ? "Leave blank to keep the current password." : "At least 6 characters."}
        >
          <Input
            id="password"
            name="password"
            type="text"
            autoComplete="new-password"
            required={!editing}
          />
        </Field>
        {editing && (
          <Field label="Account status" htmlFor="active">
            <label className="flex h-10 items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={user.active} className="h-4 w-4" />
              Active (can sign in)
            </label>
          </Field>
        )}
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="flex gap-3">
        <SubmitButton>{editing ? "Save changes" : "Create user"}</SubmitButton>
        <Link href="/admin/users">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
