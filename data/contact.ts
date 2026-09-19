/**
 * ── Replace these before publishing ─────────────────────────────────────────
 * There is no way to invent someone's contact details, so the email below is an
 * obvious placeholder and the link list is empty: nothing fake is rendered.
 * Fill these in and the Contact section, footer and structured data update
 * themselves.
 */

export type ContactLink = {
  label: string;
  href: string;
  /** Shown in the footer next to the link. */
  handle: string;
};

/** Shown under the call to action while the address is still a placeholder. */
export const contactNote =
  "This is a placeholder address — swap it for your own in data/contact.ts.";

export const contact = {
  email: "hello@example.com",
  /** True while `email` is still the placeholder, so the UI can say so. */
  emailIsPlaceholder: true,
  links: [] as ContactLink[],
};
