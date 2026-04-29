import * as React from "react";

interface ArbiterMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function ArbiterMark({ size = 24, ...props }: ArbiterMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M26 100 L60 24 L94 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinejoin="miter"
      />
      <line
        x1="10"
        y1="70"
        x2="110"
        y2="62"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="66" r="3.6" fill="currentColor" />
    </svg>
  );
}
