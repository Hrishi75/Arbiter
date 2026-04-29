import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArbiterMark } from "@/components/arbiter-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-hairline bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <ArbiterMark size={20} />
          <span className="font-mono text-sm tracking-wide">arbiter</span>
          <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
            v1.0
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Launch app
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
