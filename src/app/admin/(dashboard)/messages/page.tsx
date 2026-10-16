import { prisma } from "@/lib/prisma";
import MessagesList from "@/components/admin/MessagesList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mesajlar" };

export default async function AdminMessagesPage() {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Mesajlar</h1>
        <p className="mt-1 text-sm text-slate-500">
          İletişim formundan gelen tüm mesajlar ({messages.length})
        </p>
      </div>
      <MessagesList
        messages={messages.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          subject: m.subject,
          body: m.body,
          type: m.type,
          city: m.city,
          eventDate: m.eventDate,
          budget: m.budget,
          read: m.read,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
