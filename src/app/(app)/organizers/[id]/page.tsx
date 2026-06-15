import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HistoryPanel } from "@/components/history-panel";
import { getHistory } from "@/lib/audit";
import { OrganizerForm } from "../organizer-form";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrganizerDetailPage({ params }: { params: { id: string } }) {
  await requireUser();
  const organizer = await prisma.organizer.findUnique({
    where: { id: params.id },
    include: { issuer: { select: { name: true } }, _count: { select: { events: true } } },
  });
  if (!organizer) notFound();
  const history = await getHistory("Organizer", organizer.id);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PageHeader
          title={organizer.name}
          subtitle={`Lead by ${organizer.issuer.name}`}
          breadcrumb={[{ label: "Organizers", href: "/organizers" }, { label: organizer.name }]}
          action={
            <Link href={`/events/new?organizer=${organizer.id}`}>
              <Button variant="outline">
                <CalendarDays className="h-4 w-4" /> New event ({organizer._count.events})
              </Button>
            </Link>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>Organizer details</CardTitle>
          </CardHeader>
          <CardBody>
            <OrganizerForm organizer={organizer} />
          </CardBody>
        </Card>
      </div>
      <div>
        <HistoryPanel entries={history} />
      </div>
    </div>
  );
}
