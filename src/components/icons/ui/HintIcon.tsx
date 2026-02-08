import type { SVGProps } from 'react'

export function HintIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 2C8.7 2 6 4.7 6 8C6 10.3 7.2 12.3 9 13.4V16C9 16.6 9.4 17 10 17H14C14.6 17 15 16.6 15 16V13.4C16.8 12.3 18 10.3 18 8C18 4.7 15.3 2 12 2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 20C10 20.6 10.4 21 11 21H13C13.6 21 14 20.6 14 20V19H10V20Z"
        fill="currentColor"
      />
      <line x1="9" y1="17" x2="15" y2="17" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
