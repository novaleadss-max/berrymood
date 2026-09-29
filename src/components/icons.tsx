import type { SVGProps } from "react";

/* Lucide dropped brand marks, so Instagram lives here. */
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/* The four-point star from the bottom of the logo. */
export function Sparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
    </svg>
  );
}

/* The three-petal leaf that crowns the "BM". */
export function Leaf(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M24 30C17 24 17 10 24 2c7 8 7 22 0 28Z" />
      <path d="M24 30C18 30 6 26 3 13c10 0 18 7 21 17Z" />
      <path d="M24 30c6 0 18-4 21-17-10 0-18 7-21 17Z" />
    </svg>
  );
}
