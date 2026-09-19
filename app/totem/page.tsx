import type { Metadata } from "next";
import { TotemLogo } from "@/components/totem/logo";
import { TotemPlayground } from "@/components/totem/playground";
import { ProductIntro } from "@/components/layout/product-intro";

export const metadata: Metadata = {
  title: "Totem.components",
  description:
    "Eleven interface primitives — switch, dialog, carousel, toast queue and more — each interactive, with the code beside the preview.",
};

export default function TotemPage() {
  return (
    <main className="min-h-[100svh] px-6 pb-24 pt-28">
      <ProductIntro
        eyebrow="Totem.components"
        title="A small, curated component lab."
        description="Not a kitchen sink and not a set of screenshots. Each piece below is mounted and running, with the usage that produced it one click away."
        className="mb-16"
        badge={<TotemLogo className="h-14 w-14 rounded-2xl" />}
      />

      <div className="mx-auto max-w-3xl">
        <TotemPlayground />
      </div>
    </main>
  );
}
