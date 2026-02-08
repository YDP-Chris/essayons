import { test, expect, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Navigate to an episode and wait for it to load */
async function openEpisode(page: Page, episodeId: string) {
  await page.goto(`/#/episode/${episodeId}`)
  // Wait for the episode shell to render
  await expect(page.locator('.episode-shell')).toBeVisible({ timeout: 10000 })
  // Wait for the canvas to appear
  await expect(page.locator('.episode-shell__canvas')).toBeVisible({ timeout: 10000 })
  // Dismiss the onboarding tutorial if it appears
  await dismissTutorial(page)
}

/** Dismiss the onboarding tutorial overlay if present */
async function dismissTutorial(page: Page) {
  // Target the visible overlay (the wrapper div has no dimensions)
  const overlay = page.locator('[data-testid="tutorial-overlay"]')
  if (await overlay.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Use Escape key — always works because it's on document, not blocked by SVG
    await page.keyboard.press('Escape')
    // Wait for overlay to disappear
    await expect(overlay).not.toBeVisible({ timeout: 3000 })
  }
}

/** Click the Play button */
async function clickPlay(page: Page) {
  const playBtn = page.getByRole('button', { name: /play/i })
  await expect(playBtn).toBeVisible()
  await playBtn.click()
}

/** Click the Pause button */
async function clickPause(page: Page) {
  const pauseBtn = page.getByRole('button', { name: /pause/i })
  await expect(pauseBtn).toBeVisible()
  await pauseBtn.click()
}

/** Click the Reset button */
async function clickReset(page: Page) {
  const resetBtn = page.getByRole('button', { name: /reset/i })
  await expect(resetBtn).toBeVisible()
  await resetBtn.click()
}

/** Set the speed multiplier */
async function setSpeed(page: Page, speed: string) {
  const speedSelect = page.locator('.episode-shell__speed')
  await speedSelect.selectOption(speed)
}

/** Wait for the HUD time display to advance past 0 */
async function waitForSimulationProgress(page: Page, timeoutMs = 10000) {
  // The canvas HUD shows "Time: X.X s" — we can't read canvas text with Playwright,
  // but we can check that the Pause button appears (indicating sim is running)
  await expect(page.getByRole('button', { name: /pause/i })).toBeVisible({ timeout: timeoutMs })
}

// ---------------------------------------------------------------------------
// Landing Page
// ---------------------------------------------------------------------------

test.describe('Landing Page', () => {
  test('renders all episode cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Orbit Lab')).toBeVisible()
    await expect(page.getByText('Citizen Lab')).toBeVisible()
    await expect(page.getByText('Market Lab')).toBeVisible()
    await expect(page.getByText('Gene Lab')).toBeVisible()
    await expect(page.getByText('Bridge Lab')).toBeVisible()
  })

  test('can navigate to an episode by clicking a card', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Orbit Lab').click()
    await expect(page.locator('.episode-shell')).toBeVisible({ timeout: 10000 })
  })

  test('locale switcher is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.locale-switcher')).toBeVisible()
  })

  test('switching locale to Spanish updates hero text', async ({ page }) => {
    await page.goto('/')
    await page.locator('.locale-switcher').selectOption('es')
    await expect(page.getByText('Comienza a explorar')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Orbit Lab
// ---------------------------------------------------------------------------

test.describe('Orbit Lab', () => {
  test.beforeEach(async ({ page }) => {
    await openEpisode(page, 'orbit-lab')
  })

  test('starts in paused state with Play button visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible()
  })

  test('clicking Play starts the simulation', async ({ page }) => {
    await clickPlay(page)
    // After clicking Play, the Pause button should appear
    await waitForSimulationProgress(page)
  })

  test('can pause and resume', async ({ page }) => {
    await clickPlay(page)
    await waitForSimulationProgress(page)
    await clickPause(page)
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible()
    await clickPlay(page)
    await expect(page.getByRole('button', { name: /pause/i })).toBeVisible()
  })

  test('speed selector changes speed multiplier', async ({ page }) => {
    await setSpeed(page, '100')
    const speedSelect = page.locator('.episode-shell__speed')
    await expect(speedSelect).toHaveValue('100')
  })

  test('reset returns to paused state', async ({ page }) => {
    await clickPlay(page)
    await waitForSimulationProgress(page)
    await clickReset(page)
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible()
  })

  test('mission panel shows First Orbit mission', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'First Orbit' })).toBeVisible()
  })

  test('parameter panel shows launch controls', async ({ page }) => {
    await expect(page.getByText('Launch Speed')).toBeVisible()
    await expect(page.getByText('Launch Angle')).toBeVisible()
  })

  test('can run simulation at high speed without errors', async ({ page }) => {
    await setSpeed(page, '1000')
    await clickPlay(page)
    // Let it run for 3 seconds at 1000x
    await page.waitForTimeout(3000)
    // Should still be running (no crash in the app)
    const pauseBtn = page.getByRole('button', { name: /pause/i })
    const playBtn = page.getByRole('button', { name: /play/i })
    // Either pause (still running) or play (sim ended via crash/escape) should be visible
    await expect(pauseBtn.or(playBtn)).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Citizen Lab
// ---------------------------------------------------------------------------

test.describe('Citizen Lab', () => {
  test.beforeEach(async ({ page }) => {
    await openEpisode(page, 'citizen-lab')
  })

  test('loads and shows canvas', async ({ page }) => {
    await expect(page.locator('.episode-shell__canvas')).toBeVisible()
  })

  test('starts paused with Play button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible()
  })

  test('clicking Play starts the simulation', async ({ page }) => {
    await clickPlay(page)
    await waitForSimulationProgress(page)
  })

  test('has parameter controls', async ({ page }) => {
    // Look for any parameter-related UI
    await expect(page.locator('.parameter-panel')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Market Lab
// ---------------------------------------------------------------------------

test.describe('Market Lab', () => {
  test.beforeEach(async ({ page }) => {
    await openEpisode(page, 'market-lab')
  })

  test('loads and shows canvas', async ({ page }) => {
    await expect(page.locator('.episode-shell__canvas')).toBeVisible()
  })

  test('starts paused with Play button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible()
  })

  test('clicking Play starts the simulation', async ({ page }) => {
    await clickPlay(page)
    await waitForSimulationProgress(page)
  })
})

// ---------------------------------------------------------------------------
// Gene Lab
// ---------------------------------------------------------------------------

test.describe('Gene Lab', () => {
  test.beforeEach(async ({ page }) => {
    await openEpisode(page, 'gene-lab')
  })

  test('loads and shows canvas', async ({ page }) => {
    await expect(page.locator('.episode-shell__canvas')).toBeVisible()
  })

  test('starts paused with Play button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible()
  })

  test('clicking Play starts the simulation', async ({ page }) => {
    await clickPlay(page)
    await waitForSimulationProgress(page)
  })
})

// ---------------------------------------------------------------------------
// Bridge Lab
// ---------------------------------------------------------------------------

test.describe('Bridge Lab', () => {
  test.beforeEach(async ({ page }) => {
    await openEpisode(page, 'bridge-lab')
  })

  test('loads and shows canvas', async ({ page }) => {
    await expect(page.locator('.episode-shell__canvas')).toBeVisible()
  })

  test('starts paused with Play button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /play/i })).toBeVisible()
  })

  test('clicking Play starts the simulation', async ({ page }) => {
    await clickPlay(page)
    await waitForSimulationProgress(page)
  })

  test('has load weight parameter', async ({ page }) => {
    await expect(page.getByText('Load Weight')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

test.describe('Navigation', () => {
  test('back to labs button returns to landing page', async ({ page }) => {
    await openEpisode(page, 'orbit-lab')
    // The back button is in the App's episode nav, not the episode shell
    const backBtn = page.getByRole('button', { name: /back to labs/i })
    await backBtn.click()
    await expect(page.getByText('Orbit Lab')).toBeVisible()
  })

  test('teacher dashboard is accessible from landing page', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Teacher Tools').click()
    await expect(page.getByText('Teacher Dashboard')).toBeVisible()
  })
})
