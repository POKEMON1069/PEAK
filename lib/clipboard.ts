/**
 * Clipboard helper for embedded contexts.
 *
 * The async Clipboard API is subject to a permissions policy: inside a
 * sandboxed iframe without `allow="clipboard-write"` (which is how this site is
 * previewed, and how it may be embedded elsewhere) `writeText` rejects with
 * `NotAllowedError` and logs a console error. So:
 *
 *   1. ask the Permissions API first and skip straight to the fallback if the
 *      policy has already denied clipboard-write — no failed call, no error in
 *      the console;
 *   2. otherwise try the modern API;
 *   3. fall back to the legacy `document.execCommand("copy")` path, which still
 *      works in a number of sandboxed contexts;
 *   4. if all of that fails, say so, and the caller can select the text instead
 *      so a manual ⌘/Ctrl + C succeeds.
 */

async function clipboardWriteAllowed() {
  try {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return true;
    const status = await navigator.permissions.query({
      name: "clipboard-write" as PermissionName,
    });
    return status.state !== "denied";
  } catch {
    // Older browsers and Safari throw on this query name; try the API anyway.
    return true;
  }
}

function legacyCopy(text: string) {
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const succeeded = document.execCommand("copy");
    document.body.removeChild(area);
    return succeeded;
  } catch {
    return false;
  }
}

/** Returns true when the text made it to the clipboard by some route. */
export async function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    if (await clipboardWriteAllowed()) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Blocked, not focused, or unavailable: fall through.
      }
    }
  }
  return legacyCopy(text);
}

/** Selects an element's text so the visitor can copy it by hand. */
export function selectElementText(element: HTMLElement | null) {
  if (!element || typeof window === "undefined") return false;
  try {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return Boolean(selection && selection.toString());
  } catch {
    return false;
  }
}
