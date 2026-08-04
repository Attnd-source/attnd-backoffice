import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserTasks } from "@/lib/tasks";
import { date } from "@/lib/format";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyTasksPage() {
  const user = await requireUser();
  const tasks = await getUserTasks(user.id);

  // Determine which stage is pending for this user, per customer.
  function pendingStage(c: any): string {
    if (c.assignedToId === user.id && c.stage1 === "NOT_HANDLED") return "Stage 1 — not handled";
    if (c.owner2Id === user.id && !c.stage2) return "Stage 2 — awaiting action";
    if (c.owner3Id === user.id && !c.stage3) return "Stage 3 — awaiting action";
    if (c.owner4Id === user.id && !c.stage4) return "Stage 4 — awaiting action";
    if (c.owner5Id === user.id && !c.stage5) return "Stage 5 — awaiting action";
    return "Awaiting action";
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="My tasks"
        subtitle="Customers assigned to you that still need action. Click one to open it."
      />
      {tasks.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="text-sm text-muted-foreground">You're all caught up — no pending tasks.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((c) => (
            <Link key={c.id} href={`/crm/${c.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardBody className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.companyName ? `${c.companyName} · ` : ""}
                      {date(c.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge intent="warning">{pendingStage(c)}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
