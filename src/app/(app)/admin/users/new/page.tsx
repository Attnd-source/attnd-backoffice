import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { UserForm } from "../user-form";

export default async function NewUserPage() {
  await requireAdmin();
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="New user"
        breadcrumb={[{ label: "Admin" }, { label: "Users", href: "/admin/users" }, { label: "New" }]}
      />
      <Card>
        <CardBody>
          <UserForm />
        </CardBody>
      </Card>
    </div>
  );
}
