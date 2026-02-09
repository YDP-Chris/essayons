import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteHeader } from './SiteHeader.tsx'
import { LocaleProvider } from '@/i18n'

function renderHeader(props: {
  variant: 'full' | 'compact'
  currentRoute: 'landing' | 'episode' | 'teach' | 'not-found'
}) {
  return render(
    <LocaleProvider>
      <SiteHeader {...props} />
    </LocaleProvider>,
  )
}

/** Get the desktop nav section (not the mobile menu). */
function getDesktopNav() {
  const header = screen.getByRole('banner')
  return header.querySelector('.site-header__nav')
}

describe('SiteHeader', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  // ------ Branding ------

  it('renders the Essayons wordmark', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    expect(screen.getByText('Essayons')).toBeInTheDocument()
  })

  it('wordmark links to landing page', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const logo = screen.getByText('Essayons').closest('a')
    expect(logo).toHaveAttribute('href', '#/')
  })

  it('wordmark is visible in compact variant', () => {
    renderHeader({ variant: 'compact', currentRoute: 'episode' })
    expect(screen.getByText('Essayons')).toBeInTheDocument()
  })

  // ------ Full variant: nav links ------

  it('renders Episodes and Teacher Dashboard links in full variant', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    // Nav links appear in both desktop and mobile sections
    const episodesLinks = screen.getAllByText('Episodes')
    const teachLinks = screen.getAllByText('Teacher Dashboard')
    expect(episodesLinks.length).toBeGreaterThanOrEqual(1)
    expect(teachLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('sets active state on Episodes link when on landing page', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const desktopNav = getDesktopNav()!
    const episodesLink = within(desktopNav as HTMLElement)
      .getByText('Episodes')
      .closest('a')
    expect(episodesLink).toHaveAttribute('aria-current', 'page')
  })

  it('sets active state on Teacher Dashboard link when on teach page', () => {
    renderHeader({ variant: 'full', currentRoute: 'teach' })
    const desktopNav = getDesktopNav()!
    const teachLink = within(desktopNav as HTMLElement)
      .getByText('Teacher Dashboard')
      .closest('a')
    expect(teachLink).toHaveAttribute('aria-current', 'page')
  })

  it('does not set active state on Episodes link when on teach page', () => {
    renderHeader({ variant: 'full', currentRoute: 'teach' })
    const desktopNav = getDesktopNav()!
    const episodesLink = within(desktopNav as HTMLElement)
      .getByText('Episodes')
      .closest('a')
    expect(episodesLink).not.toHaveAttribute('aria-current')
  })

  // ------ Compact variant ------

  it('does not render nav links in compact variant', () => {
    renderHeader({ variant: 'compact', currentRoute: 'episode' })
    expect(screen.queryByText('Episodes')).not.toBeInTheDocument()
    expect(screen.queryByText('Teacher Dashboard')).not.toBeInTheDocument()
  })

  // ------ LocaleSwitcher ------

  it('renders locale switcher in full variant', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    // Locale switcher appears in both desktop and mobile sections
    const switchers = screen.getAllByLabelText('Select language')
    expect(switchers.length).toBeGreaterThanOrEqual(1)
  })

  it('renders locale switcher in compact variant', () => {
    renderHeader({ variant: 'compact', currentRoute: 'episode' })
    const switchers = screen.getAllByLabelText('Select language')
    expect(switchers.length).toBeGreaterThanOrEqual(1)
  })

  // ------ Accessibility ------

  it('uses header element with role="banner"', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })

  it('has an aria-label on the header', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const header = screen.getByRole('banner')
    expect(header).toHaveAttribute('aria-label', 'Site header')
  })

  it('logo has accessible home label', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const logo = screen.getByLabelText('Home')
    expect(logo).toBeInTheDocument()
  })

  // ------ Hamburger menu ------

  it('renders hamburger button with aria-expanded="false" initially', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const hamburger = screen.getByLabelText('Open menu')
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  it('hamburger button has aria-controls pointing to mobile menu', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const hamburger = screen.getByLabelText('Open menu')
    expect(hamburger).toHaveAttribute('aria-controls', 'site-header-mobile-menu')
  })

  it('toggles mobile menu open on hamburger click', async () => {
    const user = userEvent.setup()
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const hamburger = screen.getByLabelText('Open menu')

    await user.click(hamburger)

    // After click, aria-expanded should be true and label should change
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes mobile menu on Escape key', async () => {
    const user = userEvent.setup()
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const hamburger = screen.getByLabelText('Open menu')

    // Open
    await user.click(hamburger)
    expect(hamburger).toHaveAttribute('aria-expanded', 'true')

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes mobile menu when a nav link inside is clicked', async () => {
    const user = userEvent.setup()
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const hamburger = screen.getByLabelText('Open menu')

    // Open menu
    await user.click(hamburger)

    // The mobile menu contains duplicated nav links. Click the one inside the menu.
    const mobileMenu = document.getElementById('site-header-mobile-menu')!
    const navLink = mobileMenu.querySelector('a')!
    await user.click(navLink)

    expect(hamburger).toHaveAttribute('aria-expanded', 'false')
  })

  // ------ Variant CSS classes ------

  it('applies site-header--full class for full variant', () => {
    renderHeader({ variant: 'full', currentRoute: 'landing' })
    const header = screen.getByRole('banner')
    expect(header.className).toContain('site-header--full')
  })

  it('applies site-header--compact class for compact variant', () => {
    renderHeader({ variant: 'compact', currentRoute: 'episode' })
    const header = screen.getByRole('banner')
    expect(header.className).toContain('site-header--compact')
  })
})
