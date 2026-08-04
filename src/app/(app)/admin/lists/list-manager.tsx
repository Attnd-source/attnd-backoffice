"use client";
import { useFormState } from "react-dom";
import { useRef } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import { addListOption, toggleListOption, deleteListOption } from "./actions";

type Item = { id: string; value: string; active: boolean };

export function ListManager({ listKey, items }: { listKey: string; items: Item[] }) {
  const [state, formAction] = useFormState(addListOption, {} as { error?: string; ok?: boolean });
  const formRef = useRef<HTMLFormElement>(null);
  if (state?.ok) formRef.current?.reset();

  return (
    <div className="space-y-4">
      <form ref={formRef} action={formAction} className="flex gap-2">
        <input type="hidden" name="listKey" value={listKey} />
        <Input name="value" placeholder="New value" required />
        <SubmitButton size="md">
          <Plus className="h-4 w-4" /> Add
        </SubmitButton>
      </form>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <ul className="divide-y divide-border">
        {items.length === 0 && <li className="py-3 text-sm text-muted-foreground">No values yet.</li>}
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 py-2">
            <span className={`flex-1 text-sm ${item.active ? "" : "text-muted-foreground line-through"}`}>{item.value}</span>
            {!item.active && <Badge intent="muted">Hidden</Badge>}
            <form action={toggleListOption}>
              <input type="hidden" name="id" value={item.id} />
              <Button type="submit" size="icon" variant="ghost" title={item.active ? "Hide" : "Show"}>
                {item.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </form>
            <form action={deleteListOption} onSubmit={(e) => { if (!confirm("Delete this value?")) e.preventDefault(); }}>
              <input type="hidden" name="id" value={item.id} />
              <Button type="submit" size="icon" variant="ghost" title="Delete">
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
