import type { SVGProps } from 'react'

export function BiologyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6 3 C8 5, 8 7, 6 9 C8 11, 8 13, 6 15 C8 17, 8 19, 6 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 3 C16 5, 16 7, 18 9 C16 11, 16 13, 18 15 C16 17, 16 19, 18 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
      <circle cx="18" cy="9" r="1.5" fill="currentColor" />
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="15" r="1.5" fill="currentColor" />
      <circle cx="6" cy="18" r="1.5" fill="currentColor" />
      <circle cx="18" cy="21" r="1.5" fill="currentColor" />
    </svg>
  )
}
