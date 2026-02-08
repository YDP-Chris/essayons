import { test, expect } from '@playwright/test'

test('app renders the Essayons heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('ssayons')
})
