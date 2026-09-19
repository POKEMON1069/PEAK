import type { ComponentType } from "react";
import {
  TotemAccordion,
  TotemButton,
  TotemCarousel,
  TotemDialog,
  TotemSegmented,
  TotemSkeleton,
  TotemSlider,
  TotemSwitch,
  TotemTabs,
  TotemToast,
  TotemTooltip,
} from "./primitives";

export type Primitive = {
  name: string;
  /** Wants the full width of the grid (drag surfaces, multi-step previews). */
  wide?: boolean;
  category: "Actions" | "Forms" | "Navigation" | "Content" | "Feedback" | "Overlays" | "Media";
  summary: string;
  code: string;
  Component: ComponentType;
};

/**
 * Every entry here is a component that works on this page right now. The code
 * shown beside it is the usage that produces the preview, not a mock-up.
 */
export const registry: Primitive[] = [
  {
    name: "Button",
    category: "Actions",
    summary: "Four variants, plus a loading state that disables itself.",
    code: `<TotemButton variant="solid">Save</TotemButton>

<TotemButton variant="outline">Cancel</TotemButton>
<TotemButton variant="accent" loading>Uploading</TotemButton>`,
    Component: () => (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <TotemButton variant="solid">Save</TotemButton>
        <TotemButton variant="outline">Cancel</TotemButton>
        <TotemButton variant="accent">Accent</TotemButton>
        <TotemButton variant="ghost">Ghost</TotemButton>
      </div>
    ),
  },
  {
    name: "Switch",
    category: "Forms",
    summary: "Real checkbox semantics via role=\"switch\" and aria-checked.",
    code: `<TotemSwitch label="Download over Wi-Fi only" />`,
    Component: () => <TotemSwitch label="Download over Wi-Fi only" />,
  },
  {
    name: "Segmented control",
    category: "Actions",
    summary: "Radio group semantics with arrow-key navigation.",
    code: `<TotemSegmented options={["Day", "Week", "Month"]} />`,
    Component: () => <TotemSegmented options={["Day", "Week", "Month"]} />,
  },
  {
    name: "Tabs",
    category: "Navigation",
    summary: "Roving tabindex, aria-controls panels, animated indicator.",
    code: `<TotemTabs tabs={["Overview", "Details", "Activity"]} />`,
    Component: () => (
      <div className="w-full max-w-[320px]">
        <TotemTabs tabs={["Overview", "Details", "Activity"]} />
      </div>
    ),
  },
  {
    name: "Accordion",
    category: "Content",
    summary: "Height animates from auto, so the panel can hold anything.",
    code: `<TotemAccordion
  question="What is Totem?"
  answer="A small, curated set of interface pieces."
/>`,
    Component: () => (
      <div className="w-full max-w-[320px]">
        <TotemAccordion />
      </div>
    ),
  },
  {
    name: "Slider",
    category: "Forms",
    summary: "Native input underneath: keyboard and touch work for free.",
    code: `<TotemSlider min={0} max={100} initial={40} />`,
    Component: () => (
      <div className="w-full max-w-[260px]">
        <TotemSlider />
      </div>
    ),
  },
  {
    name: "Tooltip",
    category: "Feedback",
    summary: "Opens on hover and on focus, closes on Escape.",
    code: `<TotemTooltip text="Autosaves every 30 seconds" />`,
    Component: () => <TotemTooltip />,
  },
  {
    name: "Toast",
    category: "Feedback",
    summary: "A small stack: three on screen, auto-dismiss, timers cleaned up.",
    code: `<TotemToast message="Changes saved" />`,
    Component: () => <TotemToast />,
  },
  {
    name: "Skeleton",
    category: "Feedback",
    summary: "Marks itself busy and announces loading to screen readers.",
    code: `<TotemSkeleton />`,
    Component: () => <TotemSkeleton />,
  },
  {
    name: "Dialog",
    category: "Overlays",
    summary: "Traps focus, locks scroll, restores focus to the trigger.",
    code: `<TotemDialog />`,
    Component: () => <TotemDialog />,
  },
  {
    name: "Carousel",
    wide: true,
    category: "Media",
    summary: "Drag with inertia; each slide rotates and scales by its distance from centre.",
    code: `<TotemCarousel />`,
    Component: () => <TotemCarousel />,
  },
];

export const categories = ["All", ...Array.from(new Set(registry.map((item) => item.category)))];
