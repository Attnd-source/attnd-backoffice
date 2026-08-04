import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { LIST_KEYS, LIST_KEY_LABELS } from "@/lib/constants";
import { ListManager } from "./list-manager";

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  await requireAdmin();
  const options = await prisma.listOption.findMany({ orderBy: [{ sortOrder: "asc" }, { value: "asc" }] });

  return (
    <div>
      <PageHeader
        title="Lists"
        subtitle="Manage the CRM dropdown values (source, priority, city). Add, hide, or remove as needed."
        breadcrumb={[{ label: "Admin" }, { label: "Lists" }]}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {LIST_KEYS.map((key) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{LIST_KEY_LABELS[key]}</CardTitle>
            </CardHeader>
            <CardBody>
              <ListManager listKey={key} items={options.filter((o) => o.listKey === key)} />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
