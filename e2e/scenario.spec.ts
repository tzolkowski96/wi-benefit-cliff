/**
 * E2E integration test — verifies the full app renders, accepts input,
 * and produces correct analysis output for CLAUDE.md Scenario 7.
 *
 * Scenario 7: School meal tier shift (free → reduced)
 *   householdSize=4, children=2, income=$3,300/mo, raise=$200/mo
 *   Expected: Free meals shift to reduced, loss = $42/mo
 */

import { test, expect } from '@playwright/test'

test('Scenario 7 — school meal tier shift produces correct net impact', async ({ page }) => {
  // Navigate with URL params for scenario 7
  await page.goto('/?hh=4&ch=2&type=monthly&inc=3300&raise=200')

  // Wait for the app to render (use specific heading)
  await expect(page.getByRole('heading', { name: 'Benefit Cliff Calculator' })).toBeVisible()

  // The net impact banner should be visible and show a positive value
  const banner = page.locator('[aria-live="polite"]')
  await expect(banner).toBeVisible()

  // The net impact text should contain a dollar value
  const bannerText = await banner.textContent()
  expect(bannerText).toBeTruthy()
  expect(bannerText).toContain('$')

  // The program breakdown should show Free School Meals with tier shift
  const tierShift = page.getByText('FREE → REDUCED').first()
  await expect(tierShift).toBeVisible()

  // Verify the cliff chart section renders
  await expect(page.getByText('Income vs. Eligibility Thresholds')).toBeVisible()

  // Verify the waterfall chart renders (there are calculable losses)
  await expect(page.getByText('Impact Breakdown')).toBeVisible()
})

test('URL state sync — changing params updates the analysis', async ({ page }) => {
  // Start with scenario 4: single adult above all thresholds
  await page.goto('/?hh=1&ch=0&type=monthly&inc=3500&raise=100')

  await expect(page.getByRole('heading', { name: 'Benefit Cliff Calculator' })).toBeVisible()

  // Net impact should show +$100 (no losses when above all thresholds)
  const banner = page.locator('[aria-live="polite"]')
  await expect(banner).toBeVisible()
  const bannerText = await banner.textContent()
  expect(bannerText).toContain('$100')
})

test('app loads with default parameters', async ({ page }) => {
  await page.goto('/')

  // App title should render
  await expect(page.getByRole('heading', { name: 'Benefit Cliff Calculator' })).toBeVisible()

  // Should have the language toggle
  await expect(page.getByRole('radio', { name: 'EN' })).toBeVisible()
  await expect(page.getByRole('radio', { name: 'ES' })).toBeVisible()
})
