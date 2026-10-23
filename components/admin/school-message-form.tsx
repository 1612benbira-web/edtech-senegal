"use client";

import { useActionState, useRef, useState } from "react";
import { Image as ImageIcon, Video, FileText, X } from "lucide-react";
import { createSchoolMessageAction, type MessageActionState } from "@/app/admin/schools/[id]/messages/actions";
import { SubmitButton } from "@/components/ui/submit-button";

const MAX_ATTACHMENTS = 5;

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function attachmentIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-4 w-4" aria-hidden="true" />;
  if (mimeType.startsWith("video/")) return <Video className="h-4 w-4" aria-hidden="true" />;
  return <FileText className="h-4 w-4" aria-hidden="true" />;
}

export function SchoolMessageForm({
  schoolId,
  levels,
  totalStudents,
}: {
  schoolId: string;
  levels: { id: string; name: string; studentCount: number }[];
  totalStudents: number;
}) {
  const [state, formAction] = useActionState<MessageActionState, FormData>(createSchoolMessageAction, null);
  const [targetType, setTargetType] = useState<"SCHOOL" | "LEVEL">("SCHOOL");
  const [levelId, setLevelId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedLevel = levels.find((l) => l.id === levelId);
  const estimatedRecipients = targetType === "SCHOOL" ? totalStudents : selectedLevel?.studentCount ?? 0;

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFiles((prev) => [...prev, ...Array.from(newFiles)].slice(0, MAX_ATTACHMENTS));
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        // Les <input type="file"> gérés par React state ne sont pas
        // automatiquement dans le FormData natif du formulaire — on
        // reconstruit explicitement l'entrée "attachments" à partir de
        // l'état React avant l'appel à la Server Action.
        formData.delete("attachments");
        files.forEach((file) => formData.append("attachments", file));
        return formAction(formData);
      }}
      className="space-y-4 rounded-lg border border-border bg-background p-4"
    >
      <input type="hidden" name="schoolId" value={schoolId} />

      {state?.error && (
        <div role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {state.message}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Destinataires</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="targetType"
              value="SCHOOL"
              checked={targetType === "SCHOOL"}
              onChange={() => setTargetType("SCHOOL")}
            />
            Tous les élèves de l&apos;école ({totalStudents})
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="targetType"
              value="LEVEL"
              checked={targetType === "LEVEL"}
              onChange={() => setTargetType("LEVEL")}
            />
            Tous les élèves d&apos;un niveau
          </label>
        </div>
        {targetType === "LEVEL" && (
          <select
            name="targetLevelId"
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
            required
          >
            <option value="">Sélectionner un niveau...</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name} ({level.studentCount} élève{level.studentCount > 1 ? "s" : ""})
              </option>
            ))}
          </select>
        )}
        {state?.fieldErrors?.targetLevelId && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.targetLevelId}</p>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">
          {estimatedRecipients} élève{estimatedRecipients > 1 ? "s" : ""} recevront ce message.
        </p>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-foreground">
          Titre
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Réunion des parents"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
        />
        {state?.fieldErrors?.title && <p className="mt-1 text-xs text-danger">{state.fieldErrors.title}</p>}
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="content"
          name="content"
          rows={5}
          required
          placeholder="Écrire votre message..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
        />
        {state?.fieldErrors?.content && <p className="mt-1 text-xs text-danger">{state.fieldErrors.content}</p>}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Pièces jointes</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,application/pdf"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= MAX_ATTACHMENTS}
            className="rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
          >
            + Ajouter un fichier (photo, vidéo, PDF)
          </button>
        </div>
        {files.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs"
              >
                <span className="flex items-center gap-2 truncate text-foreground">
                  {attachmentIcon(file.type)}
                  <span className="truncate">{file.name}</span>
                  <span className="shrink-0 text-muted-foreground">{formatSize(file.size)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Retirer ${file.name}`}
                  className="ml-2 shrink-0 text-muted-foreground hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">
          Formats acceptés : JPG, PNG, WEBP, MP4, WEBM, PDF — 50 Mo max par fichier, {MAX_ATTACHMENTS} fichiers max.
        </p>
      </div>

      <SubmitButton>Envoyer le message</SubmitButton>
    </form>
  );
}
