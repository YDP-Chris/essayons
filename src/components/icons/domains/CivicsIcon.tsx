import type { SVGProps } from 'react'

export function CivicsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M4 21V10L12 4L20 10V21H4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="6" y="10" width="2" height="11" fill="currentColor" />
      <rect x="11" y="10" width="2" height="11" fill="currentColor" />
      <rect x="16" y="10" width="2" height="11" fill="currentColor" />
      <line x1="4" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
