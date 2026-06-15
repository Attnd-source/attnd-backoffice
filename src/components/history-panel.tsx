import { History } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dateTime } from "@/lib/format";
import { fieldLabel } from "@/lib/field-labels";
import type { AuditEntry } from "@/lib/audit";

function val(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
    return dateTime(v);
  }
  return String(v);
}

const ACTION_INTENT: Record<string, "success" | "info" | "danger"> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "danger",
};

export function HistoryPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Edit history</CardTitle>
      </CardHeader>
      <CardBody>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No history yet.</p>
        ) : (
          <ol className="relative space-y-5 border-l border-border pl-5">
            {entries.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[1.45rem] top-1 h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-card" />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge intent={ACTION_INTENT[e.action] ?? "muted"}>{e.action}</Badge>
                  <span className="text-sm font-medium">{e.user?.name ?? "System"}</span>
                  <span className="text-xs text-muted-foreground">{dateTime(e.createdAt)}</span>
                </div>
                {e.action === "UPDATE" && e.changes && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {Object.entries(e.changes).map(([field, ch]) => (
                      <li key={field} className="text-muted-foreground">
                        <span className="font-medium text-foreground">{fieldLabel(field)}</span>:{" "}
                        <span className="line-through">{val(ch.old)}</span>{" "}
                        <span aria-hidden>→</span>{" "}
                        <span className="text-foreground">{val(ch.new)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
