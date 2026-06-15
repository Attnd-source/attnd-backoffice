import * as React from "react";
import { cn } from "@/lib/utils";
import { STATUS_INTENT } from "@/lib/constants";

type Intent = "success" | "warning" | "danger" | "info" | "muted";

const intents: Record<Intent, string> = {
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-[hsl(32,80%,38%)] ring-warning/20",
  danger: "bg-danger/10 text-danger ring-danger/20",
  info: "bg-info/10 text-info ring-info/20",
  muted: "bg-muted text-muted-foreground ring-border",
};

export function Badge({
  intent = "muted",
  className,
  children,
}: {
  intent?: Intent;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        intents[intent],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ value, label }: { value?: string | null; label?: string }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const intent = (STATUS_INTENT[value] ?? "muted") as Intent;
  return <Badge intent={intent}>{label ?? value}</Badge>;
}
