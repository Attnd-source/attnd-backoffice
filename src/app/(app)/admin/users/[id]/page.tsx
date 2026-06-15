import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { HistoryPanel } from "@/components/history-panel";
import { getHistory } from "@/lib/audit";
import { UserForm } from "../user-form";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) notFound();
  const history = await getHistory("User", user.id);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PageHeader
          title={user.name}
          subtitle={user.email}
          breadcrumb={[
            { label: "Admin" },
            { label: "Users", href: "/admin/users" },
            { label: "Edit" },
          ]}
        />
        <Card>
          <CardBody>
            <UserForm
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                active: user.active,
              }}
            />
          </CardBody>
        </Card>
      </div>
      <div className="lg:pt-[4.5rem]">
        <HistoryPanel entries={history} />
      </div>
    </div>
  );
}
