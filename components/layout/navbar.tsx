"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { primaryNav, projectRoutes } from "@/data/nav";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { theme, resolved, toggle } = useTheme();
  const pathname = usePathname();
  const inProject = pathname !== "/";

  const links = inProject ? projectRoutes : primaryNav;

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
      <Link
        href={inProject ? "/" : "/"}
        aria-label={inProject ? "Back to the ecosystem" : "Aayushman Chandra — home"}
        className="group flex items-center gap-2 text-sm font-semibold tracking-tight"
      >
        {inProject ? (
          <span className="flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-muted backdrop-blur-md transition-colors group-hover:text-foreground">
            ← Ecosystem
          </span>
        ) : (
          <>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
              AC
            </span>
            Aayushman
          </>
        )}
      </Link>

      <nav
        aria-label="Primary"
        className="hidden items-center gap-1 rounded-full border border-border bg-surface/70 px-2 py-1.5 shadow-sm backdrop-blur-md md:flex"
      >
        {links.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm text-muted transition-colors hover:text-foreground",
                active && "bg-surface-elevated text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={toggle}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        title={theme === "dark" ? "Light theme" : "Dark theme"}
        // The icon is a client-only detail; hiding it until mounted keeps the
        // server markup and the first client paint identical.
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-colors hover:bg-surface-elevated"
      >
        {resolved && theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>
    </header>
  );
}
