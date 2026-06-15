import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { OrganizerForm } from "../organizer-form";

export default async function NewOrganizerPage() {
  await requireUser();
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="New organizer"
        subtitle="Capture a new organizer lead."
        breadcrumb={[{ label: "Organizers", href: "/organizers" }, { label: "New" }]}
      />
      <Card>
        <CardBody>
          <OrganizerForm />
        </CardBody>
      </Card>
    </div>
  );
}
