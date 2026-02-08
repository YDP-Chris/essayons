import type { StringCatalog, TranslationFunction } from './types.ts'

export function resolveKey(catalog: StringCatalog, key: string): string | undefined {
  const keys = key.split('.')
  let value: unknown = catalog
  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return undefined
    }
  }
  return typeof value === 'string' ? value : undefined
}

export function createTranslationFunction(
  catalog: StringCatalog,
  fallbackCatalog: StringCatalog,
): TranslationFunction {
  return (key: string): string => {
    const value = resolveKey(catalog, key)
    if (value !== undefined) return value
    const fallback = resolveKey(fallbackCatalog, key)
    if (fallback !== undefined) return fallback
    return key
  }
}
