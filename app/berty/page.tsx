import type { Metadata } from "next";
import { PlayerProvider } from "@/components/berty/player-provider";
import { BertyPlayer } from "@/components/berty/berty-player";
import { ProductIntro } from "@/components/layout/product-intro";

export const metadata: Metadata = {
  title: "Berty",
  description:
    "A small music player shell with a real queue, transport, seek, volume, shuffle, repeat and three synthesised demo loops.",
};

export default function BertyPage() {
  return (
    <main className="min-h-[100svh] px-6 pb-24 pt-28">
      <ProductIntro
        eyebrow="Berty"
        title="A calmer way to play music."
        description="One audio element, driven properly: queue, transport, seek, volume, shuffle, repeat, media keys and three surfaces. The library is three instrumental loops generated for this project — clearly demo material, not someone else's releases."
        className="mb-14"
      />

      <PlayerProvider>
        <BertyPlayer />
      </PlayerProvider>
    </main>
  );
}
