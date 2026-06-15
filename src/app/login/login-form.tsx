"use client";
import { useFormState } from "react-dom";
import { loginAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, { error: "" } as { error?: string });

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Email" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="username" placeholder="you@attnd.sa" required />
      </Field>
      <Field label="Password" htmlFor="password" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state?.error && (
        <div className="flex items-center gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}
      <SubmitButton className="w-full">Sign in</SubmitButton>
    </form>
  );
}
