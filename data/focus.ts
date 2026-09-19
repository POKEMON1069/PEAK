export type FocusArea = {
  id: "build" | "design" | "technology" | "explore";
  title: string;
  desc: string;
};

export const focusAreas: FocusArea[] = [
  { id: "build", title: "Build", desc: "Turning ideas into products people can actually use." },
  { id: "design", title: "Design", desc: "Interfaces, interaction, and the systems behind them." },
  { id: "technology", title: "Technology", desc: "Consumer electronics, mobile devices, and software." },
  { id: "explore", title: "Explore", desc: "New tools, new ideas, new ways to break things." },
];
