import type { SVGProps } from 'react'

export function RelaunchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Circular arrow (refresh) */}
      <path
        d="M4 12C4 7.6 7.6 4 12 4C15.2 4 17.9 5.9 19.2 8.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 12C20 16.4 16.4 20 12 20C8.8 20 6.1 18.1 4.8 15.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Arrow head at top-right */}
      <path d="M16 6L20 8L20 4Z" fill="currentColor" />
      {/* Small play triangle in center */}
      <path d="M10.5 8.5L15.5 12L10.5 15.5V8.5Z" fill="currentColor" />
    </svg>
  )
}
