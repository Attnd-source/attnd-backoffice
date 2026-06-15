import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const columns: Column[] = [
  { key: "eventName", header: "Event", type: "text", sortable: true },
  { key: "organizer", header: "Organizer", type: "text" },
  { key: "status", header: "Status", type: "status", labelMap: "EVENT_STATUS", filter: true },
  { key: "city", header: "City", type: "text", filter: true },
  { key: "issuer", header: "Issuer", type: "text", filter: true },
  { key: "eventDate", header: "Event date", type: "date", sortable: true },
  { key: "expectedBudget", header: "Budget", type: "money", align: "right" },
];

export default async function EventsPage() {
  await requireUser();
  const events = await prisma.event.findMany({
    include: {
      organizer: { select: { name: true } },
      issuer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = events.map((e) => ({
    id: e.id,
    eventName: e.eventName,
    organizer: e.organizer.name,
    status: e.status,
    city: e.city ?? "—",
    issuer: e.issuer.name,
    eventDate: e.eventDate?.toISOString() ?? null,
    expectedBudget: e.expectedBudget,
  }));

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="All events. Filter by date, city, or issuer; search by event name."
        action={
          <Link href="/events/new">
            <Button>
              <Plus className="h-4 w-4" /> New event
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        hrefBase="/events"
        searchKeys={["eventName"]}
        searchPlaceholder="Search event name…"
        dateFilterKey="eventDate"
        dateFilterLabel="Event date"
      />
    </div>
  );
}
