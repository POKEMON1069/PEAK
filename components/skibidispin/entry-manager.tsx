"use client";

import { useEffect, useState } from "react";
import { Plus, RotateCcw, Shuffle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_ENTRIES, type Entry } from "./types";

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex flex-col">
        <span className="text-sm">{label}</span>
        {hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors",
          checked ? "bg-foreground" : "bg-border",
        )}
      >
        <span
          className={cn(
            "block h-5 w-5 rounded-full bg-surface-elevated shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

export function EntryManager({
  entries,
  onAdd,
  onAddMany,
  onRemove,
  onShuffle,
  onReset,
  removeAfterSpin,
  setRemoveAfterSpin,
  soundOn,
  toggleSound,
}: {
  entries: Entry[];
  onAdd: (value: string) => boolean;
  onAddMany: (value: string) => number;
  onRemove: (id: string) => void;
  onShuffle: () => void;
  onReset: () => void;
  removeAfterSpin: boolean;
  setRemoveAfterSpin: (value: boolean) => void;
  soundOn: boolean;
  toggleSound: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Clear the field-level error once the visitor starts typing again.
  useEffect(() => {
    if (error && value.trim()) setError(null);
  }, [error, value]);

  const full = entries.length >= MAX_ENTRIES;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const raw = value.trim();
    if (!raw) return;
    if (full) {
      setError(`The wheel holds ${MAX_ENTRIES} entries. Remove one first.`);
      return;
    }
    // Commas or line breaks add several entries at once.
    if (/[\n,]/.test(raw)) {
      const added = onAddMany(raw);
      if (!added) setError(`The wheel holds ${MAX_ENTRIES} entries.`);
    } else if (!onAdd(raw)) {
      setError(`The wheel holds ${MAX_ENTRIES} entries.`);
    }
    setValue("");
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-5 rounded-panel border border-border bg-surface-elevated p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">
          Entries <span className="text-muted">({entries.length})</span>
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onShuffle}
            className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
          >
            <Shuffle className="h-3.5 w-3.5" /> Shuffle
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Add an entry…"
          aria-label="New entry"
          aria-describedby={error ? "entry-error" : undefined}
          className="min-w-0 flex-1 rounded-control border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-foreground/40"
        />
        <button
          type="submit"
          aria-label="Add entry"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-foreground text-background transition-opacity hover:opacity-85"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {error ? (
        <p id="entry-error" role="alert" className="text-xs text-error">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted">
          Tip: paste a comma-separated list to add several at once.
        </p>
      )}

      <ul className="custom-scrollbar flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <li className="rounded-control border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
            No entries yet — add two to spin.
          </li>
        ) : null}
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-3 rounded-control border border-border px-3 py-2 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: entry.color }}
              />
              <span className="truncate">{entry.label}</span>
            </span>
            <button
              type="button"
              onClick={() => onRemove(entry.id)}
              aria-label={`Remove ${entry.label}`}
              className="text-muted transition-colors hover:text-error"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <Toggle
          label="Retire the winner"
          hint="Removes an entry once it wins"
          checked={removeAfterSpin}
          onChange={setRemoveAfterSpin}
        />
        <Toggle label="Sound" checked={soundOn} onChange={toggleSound} />
      </div>

      <p className="text-[11px] leading-relaxed text-muted">
        Your list and sound preference are saved in this browser only.
      </p>
    </div>
  );
}
