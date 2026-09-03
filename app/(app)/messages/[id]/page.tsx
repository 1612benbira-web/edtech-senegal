import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { getMyMessageDetail, getAttachmentSignedUrl } from "@/lib/services/messageService";
import { markMessageReadAction } from "../actions";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default async function MessageDetailPage({ params }: { params: { id: string } }) {
  const message = await getMyMessageDetail(params.id);
  if (!message) notFound();

  // Marque comme lu dès l'ouverture (côté serveur, avant le rendu —
  // pas besoin d'attendre une interaction supplémentaire de l'élève).
  await markMessageReadAction(params.id);

  const attachmentsWithUrls = await Promise.all(
    message.attachments.map(async (a) => ({ ...a, url: await getAttachmentSignedUrl(a.filePath) }))
  );

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/messages" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour aux messages
      </Link>

      <div className="rounded-xl border border-border bg-background p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{message.schoolName}</p>
        <h1 className="mt-1 text-lg font-bold text-foreground">{message.title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(message.createdAt)}</p>

        <p className="mt-4 whitespace-pre-wrap text-sm text-foreground">{message.content}</p>

        {attachmentsWithUrls.length > 0 && (
          <div className="mt-5 space-y-3 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pièces jointes</p>
            {attachmentsWithUrls.map((a) => {
              if (!a.url) {
                return (
                  <p key={a.id} className="text-xs text-danger">
                    {a.fileName} — indisponible pour le moment.
                  </p>
                );
              }
              if (a.mimeType.startsWith("image/")) {
                return (
                  <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="block">
                    {/* Pièce jointe utilisateur, URL signée dynamique : next/image exige des domaines
                        pré-configurés, une <img> classique reste la solution la plus simple ici. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.url} alt={a.fileName} className="max-h-80 w-full rounded-lg border border-border object-contain" />
                  </a>
                );
              }
              if (a.mimeType.startsWith("video/")) {
                return (
                  <video key={a.id} src={a.url} controls className="w-full rounded-lg border border-border">
                    Ton navigateur ne supporte pas la lecture vidéo intégrée.
                  </video>
                );
              }
              return (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate">{a.fileName}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatSize(a.fileSize)}</span>
                  </span>
                  <span className="flex shrink-0 gap-3">
                    <a href={a.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">
                      Voir
                    </a>
                    <a href={a.url} download={a.fileName} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Télécharger
                    </a>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
