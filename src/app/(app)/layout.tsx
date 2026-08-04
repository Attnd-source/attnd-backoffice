import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { getUserTaskCount } from "@/lib/tasks";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const taskCount = await getUserTaskCount(user.id);
  return (
    <AppShell user={user} taskCount={taskCount}>
      {children}
    </AppShell>
  );
}
