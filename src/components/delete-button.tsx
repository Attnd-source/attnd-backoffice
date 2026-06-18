"use client";
import { useFormState } from "react-dom";
import { Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";

type DeleteAction = (prev: unknown, fd: FormData) => Promise<{ error?: string } | void>;

export function DeleteButton({
  action,
  id,
  label,
}: {
  action: DeleteAction;
  id: string;
  label: string;
}) {
  const [state, formAction] = useFormState(action, {} as { error?: string });
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Delete this ${label}? This cannot be undone. The deletion is kept in the history log.`)) {
          e.preventDefault();
        }
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="danger" size="sm">
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </SubmitButton>
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
