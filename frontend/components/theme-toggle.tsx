"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "rounded-full border-hairline-strong bg-background/80 text-foreground shadow-[0_10px_28px_rgba(20,18,16,0.08)] backdrop-blur-xl hover:bg-background dark:shadow-[0_12px_30px_rgba(0,0,0,0.28)]",
        className
      )}
    >
      {mounted ? (
        isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />
      ) : (
        <span className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
