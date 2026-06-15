import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const columns: Column[] = [
  { key: "name", header: "Organizer", type: "text", sortable: true },
  { key: "communicationChannel", header: "Channel", type: "label", labelMap: "ORGANIZER_CHANNEL", filter: true },
  { key: "communicationInfo", header: "Contact info", type: "text" },
  { key: "issuer", header: "Lead issuer", type: "text", filter: true },
  { key: "date", header: "Date", type: "date", sortable: true },
];

export default async function OrganizersPage() {
  await requireUser();
  const organizers = await prisma.organizer.findMany({
    include: { issuer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = organizers.map((o) => ({
    id: o.id,
    name: o.name,
    communicationChannel: o.communicationChannel,
    communicationInfo: o.communicationInfo ?? "—",
    issuer: o.issuer.name,
    date: o.date?.toISOString() ?? null,
  }));

  return (
    <div>
      <PageHeader
        title="Organizers"
        subtitle="All organizer leads. Filter by date or lead issuer; search by organizer name."
        action={
          <Link href="/organizers/new">
            <Button>
              <Plus className="h-4 w-4" /> New organizer
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        hrefBase="/organizers"
        searchKeys={["name"]}
        searchPlaceholder="Search organizer name…"
        dateFilterKey="date"
        dateFilterLabel="Date"
      />
    </div>
  );
}
