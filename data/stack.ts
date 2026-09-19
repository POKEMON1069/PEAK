export type StackItem = {
  name: string;
  /** Key into the locally inlined brand icon set (see components/icons). */
  icon:
    | "react"
    | "typescript"
    | "nextdotjs"
    | "tailwindcss"
    | "figma"
    | "nodedotjs"
    | "framer";
  /** One line on what it is actually used for here. */
  usage: string;
};

// Icons are inlined SVGs rather than CDN URLs, so the stack renders offline
// and never pops in after the rest of the page.
export const stack: StackItem[] = [
  { name: "React", icon: "react", usage: "Every interface on this site" },
  { name: "TypeScript", icon: "typescript", usage: "Types end to end, no `any` in the wheel" },
  { name: "Next.js", icon: "nextdotjs", usage: "App Router, server-first pages" },
  { name: "Tailwind CSS", icon: "tailwindcss", usage: "One token system, light and dark" },
  { name: "Framer Motion", icon: "framer", usage: "Scroll and layout motion" },
  { name: "Node.js", icon: "nodedotjs", usage: "Build + the demo audio generator" },
  { name: "Figma", icon: "figma", usage: "Layouts before they become code" },
];
