import type { SVGProps } from 'react'

export function HistoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7 4C7 3.5 7.5 3 8 3H16C16.5 3 17 3.5 17 4L19 6V20C19 20.5 18.5 21 18 21H6C5.5 21 5 20.5 5 20V6L7 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 4V6H17V4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="10" x2="15" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="9" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
