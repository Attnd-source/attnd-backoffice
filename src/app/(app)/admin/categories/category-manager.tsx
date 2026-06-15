"use client";
import { useFormState } from "react-dom";
import { useRef } from "react";
import { Plus, Eye, EyeOff, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Badge } from "@/components/ui/badge";
import { createCategory, renameCategory, toggleCategory } from "./actions";

type Item = { id: string; name: string; active: boolean; type: string };

export function CategoryManager({ type, items }: { type: string; items: Item[] }) {
  const [state, formAction] = useFormState(createCategory, {} as { error?: string; ok?: boolean });
  const formRef = useRef<HTMLFormElement>(null);
  if (state?.ok) formRef.current?.reset();

  return (
    <div className="space-y-4">
      <form ref={formRef} action={formAction} className="flex gap-2">
        <input type="hidden" name="type" value={type} />
        <Input name="name" placeholder={`New ${type.toLowerCase()} subcategory`} required />
        <SubmitButton size="md">
          <Plus className="h-4 w-4" /> Add
        </SubmitButton>
      </form>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <ul className="divide-y divide-border">
        {items.length === 0 && (
          <li className="py-3 text-sm text-muted-foreground">No subcategories yet.</li>
        )}
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 py-2">
            <form action={renameCategory} className="flex flex-1 items-center gap-2">
              <input type="hidden" name="id" value={item.id} />
              <Input
                name="name"
                defaultValue={item.name}
                className={item.active ? "" : "text-muted-foreground line-through"}
              />
              <Button type="submit" size="icon" variant="ghost" title="Save name">
                <Check className="h-4 w-4" />
              </Button>
            </form>
            {!item.active && <Badge intent="muted">Hidden</Badge>}
            <form action={toggleCategory}>
              <input type="hidden" name="id" value={item.id} />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                title={item.active ? "Hide" : "Show"}
              >
                {item.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
