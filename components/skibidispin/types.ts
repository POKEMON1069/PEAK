export type Entry = {
  id: string;
  label: string;
  color: string;
};

export const PALETTE = [
  "#F97316",
  "#22C55E",
  "#3B82F6",
  "#EAB308",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
  "#EF4444",
];

export const DEFAULT_ENTRIES = ["Pizza", "Sushi", "Burgers", "Tacos", "Salad", "Pasta"];

export const MAX_ENTRIES = 40;

/** Colours cycle through the palette as entries are added. */
export function colorFor(index: number) {
  return PALETTE[index % PALETTE.length];
}
