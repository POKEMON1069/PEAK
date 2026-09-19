export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string;
  description: string;
  /** Things that genuinely work in the shipped build -- no aspirational copy. */
  highlights: string[];
  tech: string[];
  /** Hue used for the generated project artwork. */
  accent: string;
  route: string;
  status: "live" | "building";
};

export const projects: Project[] = [
  {
    slug: "skibidispin",
    index: "01",
    title: "SkibidiSpin",
    category: "Interactive utility",
    description:
      "A decision wheel that resolves the winner from the wheel's final geometry rather than picking a name in advance — so what stops under the pointer is what gets announced.",
    highlights: [
      "Add, remove, shuffle and auto-retire entries",
      "Drag-free spin with real deceleration easing",
      "Per-tick and win audio synthesised in the browser",
      "History of the last ten results",
    ],
    tech: ["React", "TypeScript", "SVG geometry", "Web Audio"],
    accent: "160 65% 42%",
    route: "/skibidispin",
    status: "live",
  },
  {
    slug: "berty",
    index: "02",
    title: "Berty",
    category: "Music player",
    description:
      "An offline-first player shell built around one real <audio> element: queue, transport, seek, volume, shuffle, repeat, Media Session keys and a theme that changes the whole surface.",
    highlights: [
      "Three bundled instrumental loops, generated in-repo",
      "Keyboard transport controls and Media Session support",
      "Light / dark / AMOLED surfaces with persisted volume",
      "Explicit error state when a file will not decode",
    ],
    tech: ["React", "Web Audio element", "Media Session", "Material-influenced UI"],
    accent: "265 58% 58%",
    route: "/berty",
    status: "live",
  },
  {
    slug: "totem",
    index: "03",
    title: "Totem.components",
    category: "Component laboratory",
    description:
      "Eleven interface primitives that each do their own job — state, keyboard support, focus handling included — with a live preview and the source beside it.",
    highlights: [
      "Every primitive is interactive, not a screenshot",
      "Copy-the-code panel next to each preview",
      "Focus-trapping dialog, draggable carousel, toast queue",
      "Small enough to read end to end",
    ],
    tech: ["React", "Tailwind", "Framer Motion", "Accessibility"],
    accent: "28 88% 52%",
    route: "/totem",
    status: "live",
  },
];

export const futureProjects = [
  { label: "Device companion app", status: "Exploring next" },
  { label: "Small hardware experiment", status: "Thinking about" },
  { label: "Totem v2 — theming engine", status: "Building" },
];
