"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function LessonContent({ contentMd }: { contentMd: string }) {
  return (
    <div className="space-y-8 text-[18px] leading-8 text-foreground sm:text-[19px] sm:leading-9">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: (props) => <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl" {...props} />,
          h2: (props) => (
            <h2 className="mt-10 text-2xl font-bold leading-tight text-foreground sm:text-3xl" {...props} />
          ),
          h3: (props) => (
            <h3 className="mt-8 text-xl font-bold leading-tight text-foreground sm:text-2xl" {...props} />
          ),
          p: (props) => <p className="text-foreground leading-8" {...props} />,
          ul: (props) => <ul className="list-disc space-y-2 pl-6" {...props} />,
          ol: (props) => <ol className="list-decimal space-y-2 pl-6" {...props} />,
          strong: (props) => <strong className="font-semibold" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-primary/30 bg-muted/50 py-1 pl-4 text-muted-foreground"
              {...props}
            />
          ),
          code: (props) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm" {...props} />
          ),
        }}
      >
        {contentMd}
      </ReactMarkdown>
    </div>
  );
}
