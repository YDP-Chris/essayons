import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderHook, act } from '@testing-library/react'
import { useTranslation } from './use-translation.ts'
import { LocaleProvider } from './locale-provider.tsx'
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher.tsx'
import { LOCALE_STORAGE_KEY } from './types.ts'

// ---------------------------------------------------------------------------
// useTranslation tests
// ---------------------------------------------------------------------------

describe('useTranslation', () => {
  beforeEach(() => {
    localStorage.removeItem(LOCALE_STORAGE_KEY)
    window.history.replaceState({}, '', window.location.pathname)
  })

  it('returns translation function when wrapped in provider', () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: LocaleProvider,
    })
    expect(result.current.t).toBeDefined()
    expect(typeof result.current.t).toBe('function')
    expect(result.current.t('hero.headline')).toBe('Learn by crashing into things.')
  })

  it('throws outside provider', () => {
    expect(() => {
      renderHook(() => useTranslation())
    }).toThrow('useTranslation must be used within LocaleProvider')
  })

  it('re-renders on locale change', () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: LocaleProvider,
    })
    expect(result.current.locale).toBe('en')
    expect(result.current.t('hero.headline')).toBe('Learn by crashing into things.')

    act(() => {
      result.current.setLocale('es')
    })

    expect(result.current.locale).toBe('es')
    expect(result.current.t('hero.headline')).toBe('Aprende estrellando cosas.')
  })
})

// ---------------------------------------------------------------------------
// LocaleSwitcher tests
// ---------------------------------------------------------------------------

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    localStorage.removeItem(LOCALE_STORAGE_KEY)
    window.history.replaceState({}, '', window.location.pathname)
  })

  it('renders dropdown with locale options', () => {
    render(
      <LocaleProvider>
        <LocaleSwitcher />
      </LocaleProvider>,
    )
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
  })

  it('shows native names', () => {
    render(
      <LocaleProvider>
        <LocaleSwitcher />
      </LocaleProvider>,
    )
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Español')).toBeInTheDocument()
  })

  it('changes locale on selection', async () => {
    const user = userEvent.setup()

    function TestDisplay() {
      const { t } = useTranslation()
      return <span data-testid="headline">{t('hero.headline')}</span>
    }

    render(
      <LocaleProvider>
        <LocaleSwitcher />
        <TestDisplay />
      </LocaleProvider>,
    )

    expect(screen.getByTestId('headline')).toHaveTextContent('Learn by crashing into things.')

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'es')

    expect(screen.getByTestId('headline')).toHaveTextContent('Aprende estrellando cosas.')
  })
})
