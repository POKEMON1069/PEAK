"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { categories, registry } from "./registry";
import { cn } from "@/lib/utils";

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be blocked; the code is selectable either way.
      setCopied(false);
    }
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted transition-colors hover:text-foreground"
      >
        {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="custom-scrollbar max-h-[180px] w-full overflow-auto rounded-control bg-surface p-3 pr-20 text-left text-[11px] leading-relaxed text-muted">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function TotemPlayground() {
  const [filter, setFilter] = useState("All");
  const [openCode, setOpenCode] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "All" ? registry : registry.filter((item) => item.category === filter)),
    [filter],
  );

  return (
    <div>
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              aria-pressed={filter === category}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs transition-colors",
                filter === category
                  ? "border-foreground/25 bg-foreground text-background"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              {category}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted" aria-live="polite">
          {visible.length} of {registry.length} primitives · every preview below is live
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {visible.map(({ name, category, summary, code, Component, wide }) => {
          const showingCode = openCode === name;
          return (
            <motion.article
              key={name}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "flex flex-col overflow-hidden rounded-card border border-border bg-surface-elevated",
                wide && "md:col-span-2",
              )}
            >
              <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-3.5">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium">{name}</h3>
                  <p className="truncate text-xs text-muted">{summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted">
                    {category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenCode(showingCode ? null : name)}
                    aria-expanded={showingCode}
                    className="text-xs text-muted transition-colors hover:text-foreground"
                  >
                    {showingCode ? "Preview" : "Code"}
                  </button>
                </div>
              </header>

              <div className="relative flex min-h-[150px] items-center justify-center p-6">
                <AnimatePresence mode="wait" initial={false}>
                  {showingCode ? (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="w-full"
                    >
                      <CodeBlock code={code} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex w-full items-center justify-center"
                    >
                      <Component />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
