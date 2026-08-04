import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { getCrmFormOptions } from "@/lib/crm-options";
import { CustomerForm } from "../customer-form";

export default async function NewCustomerPage() {
  const user = await requireUser();
  const { sources, priorities, cities, users } = await getCrmFormOptions();
  return (
    <div className="max-w-5xl">
      <PageHeader
        title="New customer"
        subtitle="Add a customer to the sales pipeline."
        breadcrumb={[{ label: "CRM", href: "/crm" }, { label: "New" }]}
      />
      <Card>
        <CardBody>
          <CustomerForm sources={sources} priorities={priorities} cities={cities} users={users} agentName={user.name} />
        </CardBody>
      </Card>
    </div>
  );
}
