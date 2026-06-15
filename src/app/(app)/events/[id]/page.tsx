import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { HistoryPanel } from "@/components/history-panel";
import { getHistory } from "@/lib/audit";
import { getOrganizerOptions, getPartnerOptions, getCategoryOptions } from "@/lib/options";
import { EVENT_STATUS_LABELS } from "@/lib/constants";
import { EventForm } from "../event-form";
import { Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  await requireUser();
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      organizer: { select: { name: true } },
      servicesNeeded: { select: { categoryId: true } },
    },
  });
  if (!event) notFound();

  const [organizers, partners, venueCategories, vendorCategories, history] = await Promise.all([
    getOrganizerOptions(),
    getPartnerOptions(),
    getCategoryOptions("VENUE"),
    getCategoryOptions("VENDOR"),
    getHistory("Event", event.id),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PageHeader
          title={event.eventName}
          subtitle={`Organizer: ${event.organizer.name}`}
          breadcrumb={[{ label: "Events", href: "/events" }, { label: event.eventName }]}
          action={
            <div className="flex items-center gap-2">
              <StatusBadge value={event.status} label={EVENT_STATUS_LABELS[event.status]} />
              <Link href={`/finance/generate?event=${event.id}`}>
                <Button variant="outline" size="sm">
                  <Receipt className="h-3.5 w-3.5" /> Generate invoice
                </Button>
              </Link>
            </div>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>Event details</CardTitle>
          </CardHeader>
          <CardBody>
            <EventForm
              event={{ ...event, serviceIds: event.servicesNeeded.map((s) => s.categoryId) }}
              organizers={organizers}
              partners={partners}
              venueCategories={venueCategories}
              vendorCategories={vendorCategories}
            />
          </CardBody>
        </Card>
      </div>
      <div>
        <HistoryPanel entries={history} />
      </div>
    </div>
  );
}
