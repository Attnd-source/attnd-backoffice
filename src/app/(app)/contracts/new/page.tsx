import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { getCategoryOptions } from "@/lib/options";
import { ContractForm } from "../contract-form";

export default async function NewContractPage() {
  await requireUser();
  const [venueCategories, vendorCategories] = await Promise.all([
    getCategoryOptions("VENUE"),
    getCategoryOptions("VENDOR"),
  ]);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="New contract"
        subtitle="Create a venue or vendor partner request."
        breadcrumb={[{ label: "Contracts", href: "/contracts" }, { label: "New" }]}
      />
      <Card>
        <CardBody>
          <ContractForm venueCategories={venueCategories} vendorCategories={vendorCategories} />
        </CardBody>
      </Card>
    </div>
  );
}
