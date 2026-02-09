/**
 * SiteHeader — persistent site-wide header with branding, navigation,
 * and locale switching. Supports "full" and "compact" variants.
 *
 * Full variant (landing, teach): logo + nav links + locale switcher
 * Compact variant (episodes): logo + locale switcher (no nav links)
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import type { RouteMatch } from '@/shared/router'
import { Navigation, type NavItem } from '@/components/ui/Navigation.tsx'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher.tsx'
import { useTranslation } from '@/i18n'
import './SiteHeader.css'

export interface SiteHeaderProps {
  readonly variant: 'full' | 'compact'
  readonly currentRoute: RouteMatch['route']
}

export function SiteHeader({ variant, currentRoute }: SiteHeaderProps) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = 'site-header-mobile-menu'

  const navItems: NavItem[] = [
    {
      label: t('nav.episodes'),
      href: '#/',
      active: currentRoute === 'landing',
    },
    {
      label: t('nav.teach'),
      href: '#/teach',
      active: currentRoute === 'teach',
    },
  ]

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    hamburgerRef.current?.focus()
  }, [])

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!menuOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen, closeMenu])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(target)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // Render link for mobile nav that closes menu on click
  const renderMobileLink = useCallback(
    (item: NavItem) => (
      <a
        className={`nav-link${item.active ? ' nav-link-active' : ''}`}
        href={item.href}
        aria-current={item.active ? 'page' : undefined}
        onClick={() => setMenuOpen(false)}
      >
        {item.label}
      </a>
    ),
    [],
  )

  const headerClasses = ['site-header', `site-header--${variant}`].join(' ')

  return (
    <header className={headerClasses} role="banner" aria-label={t('nav.siteHeader')}>
      {/* Logo / wordmark */}
      <a className="site-header__logo" href="#/" aria-label={t('nav.home')}>
        Essayons
      </a>

      {/* Desktop nav (full variant only) */}
      {variant === 'full' && (
        <div className="site-header__nav">
          <Navigation
            items={navItems}
            orientation="horizontal"
            ariaLabel={t('nav.mainNavigation')}
          />
        </div>
      )}

      {/* Desktop utilities */}
      <div className="site-header__utils">
        <LocaleSwitcher />
      </div>

      {/* Mobile hamburger toggle */}
      <button
        ref={hamburgerRef}
        className="site-header__hamburger"
        type="button"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
        onClick={toggleMenu}
      >
        <span className="site-header__hamburger-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* Mobile dropdown menu */}
      <div
        ref={menuRef}
        id={menuId}
        className={`site-header__mobile-menu${menuOpen ? ' site-header__mobile-menu--open' : ''}`}
      >
        {variant === 'full' && (
          <Navigation
            items={navItems}
            orientation="vertical"
            ariaLabel={t('nav.mainNavigation')}
            renderLink={renderMobileLink}
          />
        )}
        <div className="site-header__utils">
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  )
}
