import type { SVGProps } from 'react'

export function EngineeringIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 2L12 7M12 17L12 22" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 12L7 12M17 12L22 12" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.64 5.64L9.17 9.17M14.83 14.83L18.36 18.36"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M18.36 5.64L14.83 9.17M9.17 14.83L5.64 18.36"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
