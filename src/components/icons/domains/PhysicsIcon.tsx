import type { SVGProps } from 'react'

export function PhysicsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
