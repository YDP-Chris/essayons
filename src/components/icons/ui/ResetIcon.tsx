import type { SVGProps } from 'react'

export function ResetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M4 12C4 7.6 7.6 4 12 4C14.8 4 17.2 5.5 18.5 7.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 12C20 16.4 16.4 20 12 20C9.2 20 6.8 18.5 5.5 16.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M19 3L19 8L14 8" fill="currentColor" />
      <path d="M5 16L5 21L10 21" fill="currentColor" />
    </svg>
  )
}
