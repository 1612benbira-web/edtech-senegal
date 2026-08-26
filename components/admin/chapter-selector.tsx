"use client";

import { useRouter, usePathname } from "next/navigation";

export function ChapterSelector({
  chapters,
  selectedId,
  curriculumId,
}: {
  chapters: { id: string; title: string; status: string }[];
  selectedId?: string;
  curriculumId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      defaultValue={selectedId}
      onChange={(e) => {
        const params = new URLSearchParams();
        if (curriculumId) params.set("curriculumId", curriculumId);
        params.set("chapterId", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
    >
      {chapters.map((c) => (
        <option key={c.id} value={c.id}>
          {c.title} ({c.status})
        </option>
      ))}
    </select>
  );
}
