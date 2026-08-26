"use client";

import { useRouter, usePathname } from "next/navigation";

export function LessonSelector({
  lessons,
  selectedId,
  curriculumId,
  chapterId,
}: {
  lessons: { id: string; title: string; status: string }[];
  selectedId?: string;
  curriculumId?: string;
  chapterId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      defaultValue={selectedId}
      onChange={(e) => {
        const params = new URLSearchParams();
        if (curriculumId) params.set("curriculumId", curriculumId);
        if (chapterId) params.set("chapterId", chapterId);
        params.set("lessonId", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
    >
      {lessons.map((l) => (
        <option key={l.id} value={l.id}>
          {l.title} ({l.status})
        </option>
      ))}
    </select>
  );
}
