import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const unreadCount = await prisma.message.count({ where: { read: false } });

  return (
    <AdminShell username={session.username} role={session.role} unreadCount={unreadCount}>
      {children}
    </AdminShell>
  );
}
