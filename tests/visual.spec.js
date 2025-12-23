import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.mercedes-benz.de';

test.describe('Visual Regression Tests', () => {

  test('Homepage visual appearance', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Handle cookie popup
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 5000 });
    } catch (e) {}
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for animations
    
    // Take full page screenshot and compare
    await expect(page).toHaveScreenshot('mercedes-homepage.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.1, // Allow 10% difference (dynamic content)
    });
  });

  test('Navigation bar visual check', async ({ page }) => {
    await page.goto(BASE_URL);
    
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 5000 });
    } catch (e) {}
    
    await page.waitForLoadState('networkidle');
    
    // Screenshot only the header/navigation
    const header = page.locator('header').first();
    await expect(header).toHaveScreenshot('mercedes-header.png');
  });

  test('Footer visual check', async ({ page }) => {
    await page.goto(BASE_URL);
    
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 5000 });
    } catch (e) {}
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    const footer = page.locator('footer').first();
    await expect(footer).toHaveScreenshot('mercedes-footer.png');
  });

});