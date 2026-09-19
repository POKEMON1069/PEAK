export type Interest = {
  id: number;
  label: string;
  detail: string;
};

export const interests: Interest[] = [
  { id: 1, label: "Software", detail: "Turning half-formed ideas into things that run." },
  { id: 2, label: "UI Design", detail: "The gap between an idea and how it feels to use it." },
  {
    id: 3,
    label: "Consumer Electronics",
    detail: "How devices are designed, made, and sold.",
  },
  {
    id: 4,
    label: "Mobile Technology",
    detail: "Phones, ecosystems, and the software that ties them together.",
  },
  { id: 5, label: "Football", detail: "Watching, mostly. Occasionally arguing about tactics." },
  {
    id: 6,
    label: "Cricket",
    detail: "A long-format kind of patience, oddly useful for debugging.",
  },
  {
    id: 7,
    label: "Entrepreneurship",
    detail: "Thinking about what a small technology company could look like.",
  },
];
