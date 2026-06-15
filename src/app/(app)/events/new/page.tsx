import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { getOrganizerOptions, getPartnerOptions, getCategoryOptions } from "@/lib/options";
import { EventForm } from "../event-form";

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: { organizer?: string };
}) {
  await requireUser();
  const [organizers, partners, venueCategories, vendorCategories] = await Promise.all([
    getOrganizerOptions(),
    getPartnerOptions(),
    getCategoryOptions("VENUE"),
    getCategoryOptions("VENDOR"),
  ]);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="New event"
        subtitle="Create an event for an organizer."
        breadcrumb={[{ label: "Events", href: "/events" }, { label: "New" }]}
      />
      <Card>
        <CardBody>
          <EventForm
            organizers={organizers}
            partners={partners}
            venueCategories={venueCategories}
            vendorCategories={vendorCategories}
            defaultOrganizerId={searchParams.organizer}
          />
        </CardBody>
      </Card>
    </div>
  );
}
