import { test, expect } from '@playwright/test'

test('app renders the hero headline', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Learn by crashing into things')
})
