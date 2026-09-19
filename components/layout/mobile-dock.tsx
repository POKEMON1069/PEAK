"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Briefcase, Mail } from "lucide-react";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/#about", icon: User },
  { label: "Work", href: "/#work", icon: Briefcase },
  { label: "Contact", href: "/#contact", icon: Mail },
];

/**
 * Phone-sized navigation. On project pages the dock stays out of the way --
 * those pages own their own layout and the back link is in the header.
 */
export function MobileDock() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <nav
      aria-label="Sections"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-surface/90 px-2 py-2 shadow-panel backdrop-blur-md md:hidden"
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-label={item.label}
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <item.icon className="h-4 w-4" />
        </Link>
      ))}
    </nav>
  );
}
