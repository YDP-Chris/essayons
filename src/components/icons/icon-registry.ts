import type { ComponentType, SVGProps } from 'react'

/** Internal registry mapping icon names to SVG components. */
const icons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {}

/** Register an icon component by name. */
export function registerIcon(name: string, component: ComponentType<SVGProps<SVGSVGElement>>) {
  icons[name] = component
}

/** Look up a registered icon component by name. */
export function getIcon(name: string): ComponentType<SVGProps<SVGSVGElement>> | undefined {
  return icons[name]
}
