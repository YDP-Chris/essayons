import type { LocaleCode, StringCatalog } from './types.ts'

export interface ValidationIssue {
  readonly level: 'error' | 'warning'
  readonly locale: string
  readonly key: string
  readonly message: string
}

function getAllKeys(catalog: StringCatalog, prefix = ''): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(catalog)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') {
      keys.push(fullKey)
    } else {
      keys.push(...getAllKeys(v, fullKey))
    }
  }
  return keys
}

export function validateCatalogCompleteness(
  catalogs: Record<LocaleCode, StringCatalog>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const baseKeys = getAllKeys(catalogs.en)

  for (const [locale, catalog] of Object.entries(catalogs)) {
    if (locale === 'en') continue
    const localeKeys = new Set(getAllKeys(catalog))

    for (const key of baseKeys) {
      if (!localeKeys.has(key)) {
        issues.push({
          level: 'error',
          locale,
          key,
          message: `Missing translation for key "${key}" in locale "${locale}"`,
        })
      }
    }

    // Warn about extra keys
    for (const key of localeKeys) {
      if (!baseKeys.includes(key)) {
        issues.push({
          level: 'warning',
          locale,
          key,
          message: `Extra key "${key}" in locale "${locale}" not present in base (en)`,
        })
      }
    }
  }

  return issues
}
