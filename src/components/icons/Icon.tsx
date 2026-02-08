import { createElement } from 'react'
import { getIcon } from './icon-registry.ts'

export interface IconProps {
  name: string
  size?: number
  color?: string
  className?: string
}

export function Icon({ name, size = 24, color, className }: IconProps) {
  const iconComponent = getIcon(name)
  if (!iconComponent) {
    return null
  }
  return createElement(iconComponent, {
    width: size,
    height: size,
    fill: color ?? 'currentColor',
    className,
    'aria-hidden': 'true' as const,
  })
}
