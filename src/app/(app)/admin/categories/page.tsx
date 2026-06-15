import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryManager } from "./category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] });
  const venues = categories.filter((c) => c.type === "VENUE");
  const vendors = categories.filter((c) => c.type === "VENDOR");

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Venue & vendor subcategories used across contracts and events. Add, rename, or hide as your offering changes."
        breadcrumb={[{ label: "Admin" }, { label: "Categories" }]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Venue subcategories</CardTitle>
          </CardHeader>
          <CardBody>
            <CategoryManager type="VENUE" items={venues} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vendor subcategories</CardTitle>
          </CardHeader>
          <CardBody>
            <CategoryManager type="VENDOR" items={vendors} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
