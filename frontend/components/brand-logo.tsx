import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 40, className }: BrandLogoProps) {
  return (
    <span
      className={cn("relative inline-flex shrink-0 overflow-hidden rounded-[22%]", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-black.svg"
        alt="Arbiter logo"
        width={size}
        height={size}
        className="block h-full w-full object-contain dark:hidden"
        priority
      />
      <Image
        src="/logo-white.svg"
        alt="Arbiter logo"
        width={size}
        height={size}
        className="hidden h-full w-full object-contain dark:block"
        priority
      />
    </span>
  );
}
