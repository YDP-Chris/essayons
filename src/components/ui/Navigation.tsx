import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import './Navigation.css'

export interface NavItem {
  label: string
  href: string
  active?: boolean
}

export interface NavigationProps extends HTMLAttributes<HTMLElement> {
  items: NavItem[]
  brand?: ReactNode
  orientation?: 'horizontal' | 'vertical'
  ariaLabel?: string
  renderLink?: (item: NavItem) => ReactNode
}

export const Navigation = forwardRef<HTMLElement, NavigationProps>(function Navigation(
  {
    items,
    brand,
    orientation = 'horizontal',
    ariaLabel = 'Main navigation',
    renderLink,
    className = '',
    ...rest
  },
  ref,
) {
  const classes = ['nav', `nav-${orientation}`, className].filter(Boolean).join(' ')

  return (
    <nav ref={ref} className={classes} aria-label={ariaLabel} {...rest}>
      {brand != null && <div className="nav-brand">{brand}</div>}
      <ul className="nav-items">
        {items.map((item) => (
          <li key={item.href}>
            {renderLink ? (
              renderLink(item)
            ) : (
              <a
                className={`nav-link${item.active ? ' nav-link-active' : ''}`}
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
})
