import * as React from 'react';

export function BrandLogo({
  className = 'w-10 h-10',
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Top Diamond Facet */}
      <path
        d="M20 5.5L32.5 12.7L20 19.9L7.5 12.7L20 5.5Z"
        className="fill-zinc-950 dark:fill-white"
      />
      {/* Left Isometric Facet */}
      <path
        d="M6.5 14.5L19 21.7V35.5L6.5 28.3V14.5Z"
        className="fill-zinc-900 dark:fill-zinc-200"
      />
      {/* Right Isometric Facet */}
      <path
        d="M21 21.7L33.5 14.5V28.3L21 35.5V21.7Z"
        className="fill-zinc-800 dark:fill-zinc-300"
      />
      {/* Central Smart Core Notch */}
      <circle
        cx="20"
        cy="20.5"
        r="2"
        className="fill-white dark:fill-zinc-950"
      />
    </svg>
  );
}
