/**
 * Tests for lib/clipboard.ts — specifically the regression that was reported:
 * clicking "Copy" in a sandboxed frame logged
 *
 *   NotAllowedError: Failed to execute 'writeText' on 'Clipboard': The Clipboard
 *   API has been blocked because of a permissions policy
 *
 * The point of the fix is that the denied case must never *call* the blocked
 * API, so the first assertion below counts the calls rather than checking the
 * outcome alone.
 *
 * Run with:  npm run verify:clipboard
 */

import { copyText, selectElementText } from "../lib/clipboard.ts";

let checks = 0;
const failures: string[] = [];

function expect(condition: boolean, description: string) {
  checks += 1;
  if (!condition) failures.push(description);
}

function setGlobal(name: string, value: unknown) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}

type Recorder = {
  writeTextCalls: number;
  execCommandCalls: number;
  selected: string;
};

/** Minimal fake DOM, enough for the legacy copy path and text selection. */
function installFakes(options: {
  permission?: "granted" | "denied" | "prompt" | "throw" | "unsupported";
  writeText?: "resolve" | "reject" | "missing";
  execCommand?: boolean | "missing";
  selection?: string;
}) {
  const recorder: Recorder = { writeTextCalls: 0, execCommandCalls: 0, selected: "" };

  const clipboard =
    options.writeText === "missing"
      ? undefined
      : {
          writeText: async () => {
            recorder.writeTextCalls += 1;
            if (options.writeText === "reject") throw new DOMException("blocked", "NotAllowedError");
          },
        };

  const permissions =
    options.permission === "unsupported"
      ? undefined
      : {
          query: async (descriptor: { name: string }) => {
            if (options.permission === "throw") throw new TypeError(`unsupported name: ${descriptor.name}`);
            return { state: options.permission ?? "granted" };
          },
        };

  const textarea = {
    value: "",
    style: {} as Record<string, string>,
    setAttribute: () => {},
    select: () => {
      recorder.selected = textarea.value;
    },
    setSelectionRange: () => {},
  };

  const documentFake = {
    createElement: () => textarea,
    body: { appendChild: () => {}, removeChild: () => {} },
    execCommand:
      options.execCommand === "missing"
        ? undefined
        : (command: string) => {
            recorder.execCommandCalls += 1;
            return command === "copy" && options.execCommand === true;
          },
    createRange: () => ({ selectNodeContents: () => {} }),
  };

  setGlobal("navigator", { clipboard, permissions });
  setGlobal("document", documentFake);
  setGlobal("window", {
    getSelection: () => ({
      removeAllRanges: () => {},
      addRange: () => {},
      toString: () => options.selection ?? "",
    }),
  });
  setGlobal("DOMException", DOMException);

  return recorder;
}

/* ── 1. The reported case: policy denies clipboard-write ─────────────────── */

{
  const recorder = installFakes({ permission: "denied", writeText: "resolve", execCommand: true });
  const result = await copyText("code");
  expect(
    recorder.writeTextCalls === 0,
    `denied permission must not call the blocked API (called ${recorder.writeTextCalls} time(s))`,
  );
  expect(recorder.execCommandCalls === 1, "denied permission should fall back to execCommand");
  expect(result === true, "denied permission still reports success when the fallback worked");
}

/* ── 2. Granted permission: modern API, no fallback ──────────────────────── */

{
  const recorder = installFakes({ permission: "granted", writeText: "resolve", execCommand: true });
  const result = await copyText("code");
  expect(recorder.writeTextCalls === 1, "granted permission uses writeText once");
  expect(recorder.execCommandCalls === 0, "granted permission should not touch the legacy path");
  expect(result === true, "granted permission reports success");
}

/* ── 3. Everything blocked: reports failure so the UI can offer ⌘C ───────── */

{
  const recorder = installFakes({ permission: "granted", writeText: "reject", execCommand: false });
  const result = await copyText("code");
  expect(recorder.writeTextCalls === 1, "a rejecting writeText is still attempted once");
  expect(recorder.execCommandCalls === 1, "a rejecting writeText falls through to the legacy path");
  expect(result === false, "total failure must be reported, not silently swallowed");
}

/* ── 4. Browsers without the Permissions API (Safari) ───────────────────── */

{
  const recorder = installFakes({ permission: "unsupported", writeText: "resolve", execCommand: true });
  const result = await copyText("code");
  expect(recorder.writeTextCalls === 1, "no permissions API: try writeText anyway");
  expect(result === true, "no permissions API: success is reported");
}

/* ── 5. Browsers that throw on the clipboard-write query name ───────────── */

{
  const recorder = installFakes({ permission: "throw", writeText: "reject", execCommand: true });
  const result = await copyText("code");
  expect(recorder.writeTextCalls === 1, "a throwing query must not break the flow");
  expect(recorder.execCommandCalls === 1, "a throwing query still falls back");
  expect(result === true, "recovery from a throwing query succeeds via the fallback");
}

/* ── 6. No async clipboard at all ───────────────────────────────────────── */

{
  const recorder = installFakes({ writeText: "missing", execCommand: true });
  const result = await copyText("code");
  expect(recorder.execCommandCalls === 1, "missing clipboard API uses the legacy path");
  expect(result === true, "missing clipboard API reports success from the fallback");
}

/* ── 7. No execCommand either: fails cleanly, no throw ─────────────────── */

{
  installFakes({ writeText: "missing", execCommand: "missing" });
  const result = await copyText("code");
  expect(result === false, "with nothing available the helper returns false instead of throwing");
}

/* ── 8. Selection helper used for the manual ⌘C fallback ────────────────── */

{
  installFakes({ selection: "selected text" });
  expect(selectElementText({} as HTMLElement) === true, "selectElementText reports the selection");
}

{
  installFakes({ selection: "" });
  expect(selectElementText({} as HTMLElement) === false, "an empty selection is reported honestly");
}

{
  setGlobal("window", undefined);
  expect(selectElementText(null) === false, "selectElementText is safe without a DOM");
}

/* ── report ─────────────────────────────────────────────────────────────── */

if (failures.length) {
  console.error(`✗ clipboard: ${failures.length} of ${checks} checks failed`);
  failures.forEach((failure) => console.error(`  · ${failure}`));
  process.exit(1);
}

console.log(`✓ clipboard: ${checks} checks passed`);
console.log("  · a denied clipboard-write permission never calls the blocked API");
console.log("  · modern API, legacy execCommand and manual selection are tried in order");
console.log("  · every failure path returns a boolean instead of throwing");
