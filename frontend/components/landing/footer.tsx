import Link from "next/link";
import { ArbiterMark } from "@/components/arbiter-mark";

export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <ArbiterMark size={18} />
          <span className="font-mono text-xs tracking-wide">arbiter</span>
          <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
            v1.0 · Sepolia
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            dashboard
          </Link>
          <Link href="https://github.com" className="hover:text-foreground">
            github
          </Link>
          <Link href="https://github.com" className="hover:text-foreground">
            contracts
          </Link>
          <Link href="https://github.com" className="hover:text-foreground">
            docs
          </Link>
        </nav>
      </div>
    </footer>
  );
}
