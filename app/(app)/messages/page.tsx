import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Paperclip } from "lucide-react";
import { getMyMessages } from "@/lib/services/messageService";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Messages" };

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long" }).format(date);
}

export default async function MessagesPage() {
  const messages = await getMyMessages();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="mb-1 text-xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">Informations publiées par ton école.</p>
      </div>

      {messages.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
          <MessageSquare className="h-6 w-6" aria-hidden="true" />
          Aucun message pour le moment.
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map((m) => (
            <Link
              key={m.id}
              href={`/messages/${m.id}`}
              className={`block rounded-xl border p-4 transition hover:shadow-sm ${
                m.isRead ? "border-border bg-background" : "border-primary/30 bg-primary/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {!m.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    <p className="truncate font-semibold text-foreground">{m.title}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.schoolName}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
              </div>
              {m.attachmentCount > 0 && (
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" aria-hidden="true" />
                  {m.attachmentCount} pièce{m.attachmentCount > 1 ? "s" : ""} jointe{m.attachmentCount > 1 ? "s" : ""}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
