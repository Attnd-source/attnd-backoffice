import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dateTime, money } from "@/lib/format";
import {
  CONTRACT_STATUS_LABELS,
  EVENT_STATUS_LABELS,
  CONTRACT_STATUSES,
  EVENT_STATUSES,
  CRM_STAGE1,
  CRM_STAGE_LABELS,
} from "@/lib/constants";
import { FileText, Users2, CalendarDays, Receipt, Contact2, TrendingUp, ArrowRight } from "lucide-react";
import { StatusBar, StatusPie, Legend } from "./charts";

export const dynamic = "force-dynamic";

const ENTITY_HREF: Record<string, string> = {
  Contract: "/contracts",
  Organizer: "/organizers",
  Event: "/events",
  Invoice: "/finance/invoices",
  GeneratedInvoice: "/finance/generate",
  User: "/admin/users",
  Category: "/admin/categories",
};

export default async function DashboardPage() {
  const user = await requireUser();

  const [
    contractsCount,
    organizersCount,
    eventsCount,
    invoicesCount,
    contracts,
    events,
    generated,
    recent,
    customers,
  ] = await Promise.all([
    prisma.contract.count(),
    prisma.organizer.count(),
    prisma.event.count(),
    prisma.invoice.count(),
    prisma.contract.groupBy({ by: ["status"], _count: true }),
    prisma.event.groupBy({ by: ["status"], _count: true }),
    prisma.generatedInvoice.aggregate({ _sum: { invoicedAmount: true } }),
    prisma.auditLog.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.customer.findMany({
      select: { stage1: true, stage2: true, stage3: true, stage4: true, stage5: true, createdAt: true },
    }),
  ]);

  // ---- CRM pipeline metrics ----
  const nowTs = Date.now();
  const weekAgo = new Date(nowTs - 7 * 86400000);
  const twoWeeksAgo = new Date(nowTs - 14 * 86400000);
  const pipelineSize = customers.length;
  const thisWeek = customers.filter((c) => c.createdAt >= weekAgo).length;
  const lastWeek = customers.filter((c) => c.createdAt >= twoWeeksAgo && c.createdAt < weekAgo).length;
  const growthPct = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0;
  const currentStage = (c: any) => c.stage5 || c.stage4 || c.stage3 || c.stage2 || c.stage1;
  const stageData = CRM_STAGE1.map((s) => ({
    name: CRM_STAGE_LABELS[s],
    value: customers.filter((c) => currentStage(c) === s).length,
  }));

  const contractData = CONTRACT_STATUSES.map((s) => ({
    name: CONTRACT_STATUS_LABELS[s],
    value: contracts.find((c) => c.status === s)?._count ?? 0,
  }));
  const eventData = EVENT_STATUSES.map((s) => ({
    name: EVENT_STATUS_LABELS[s],
    value: events.find((e) => e.status === s)?._count ?? 0,
  }));

  const kpis = [
    { label: "Contracts", value: contractsCount, href: "/contracts", icon: FileText },
    { label: "Organizers", value: organizersCount, href: "/organizers", icon: Users2 },
    { label: "Events", value: eventsCount, href: "/events", icon: CalendarDays },
    { label: "Invoices", value: invoicesCount, href: "/finance", icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} subtitle="Overview of all back-office activity." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.label} href={k.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{k.label}</p>
                    <p className="text-3xl font-semibold">{k.value}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-muted text-brand">
                    <Icon className="h-5 w-5" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Total invoiced (generated invoices)</span>
          <span className="text-2xl font-semibold text-brand">{money(generated._sum.invoicedAmount ?? 0)}</span>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CRM pipeline</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-muted text-brand">
                <Contact2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pipeline size</p>
                <p className="text-2xl font-semibold">{pipelineSize}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-muted text-brand">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weekly growth</p>
                <p className={`text-2xl font-semibold ${growthPct >= 0 ? "text-success" : "text-danger"}`}>
                  {growthPct >= 0 ? "+" : ""}
                  {growthPct}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm text-muted-foreground">New this week</p>
                <p className="text-2xl font-semibold">{thisWeek}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Customers by stage</p>
            <StatusBar data={stageData} />
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contracts by status</CardTitle>
          </CardHeader>
          <CardBody>
            <StatusBar data={contractData} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Events by status</CardTitle>
          </CardHeader>
          <CardBody>
            <StatusPie data={eventData} />
            <Legend data={eventData} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <ul className="divide-y divide-border">
            {recent.length === 0 && (
              <li className="px-5 py-4 text-sm text-muted-foreground">No activity yet.</li>
            )}
            {recent.map((r) => {
              const href = ENTITY_HREF[r.entityType]
                ? `${ENTITY_HREF[r.entityType]}/${r.entityId}`
                : "#";
              return (
                <li key={r.id} className="px-5 py-3">
                  <Link href={href} className="flex items-center justify-between gap-3 hover:text-brand">
                    <div className="flex items-center gap-3">
                      <Badge intent={r.action === "CREATE" ? "success" : r.action === "DELETE" ? "danger" : "info"}>
                        {r.action}
                      </Badge>
                      <span className="text-sm">
                        <span className="font-medium">{r.entityType}</span>
                        {r.entityLabel ? ` · ${r.entityLabel}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{r.user?.name ?? "System"}</span>
                      <span>{dateTime(r.createdAt)}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
