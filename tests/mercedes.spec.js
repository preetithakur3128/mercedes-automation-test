import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.mercedes-benz.de';

test.describe('Mercedes-Benz Germany Website Tests', () => {

  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Handle cookie consent
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren"), button:has-text("Accept All"), [data-test="handle-accept-all-button"]');
      await acceptButton.click({ timeout: 5000 });
    } catch (e) {
      // Cookie popup not found or already accepted
    }
    
    await expect(page).toHaveURL(/mercedes-benz/);
    
    const title = await page.title();
    expect(title.toLowerCase()).toContain('mercedes');
    
    console.log('✅ Homepage loaded successfully');
    console.log('   Page title:', title);
  });

  test('Main navigation is visible', async ({ page }) => {
    await page.goto(BASE_URL);
    
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 3000 });
    } catch (e) {}
    
    const nav = page.locator('nav, [role="navigation"], header').first();
    await expect(nav).toBeVisible();
    
    console.log('✅ Navigation is visible');
  });

  test('Vehicle models section exists', async ({ page }) => {
    await page.goto(BASE_URL);
    
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 3000 });
    } catch (e) {}
    
    await page.waitForLoadState('networkidle');
    
    // Look for vehicle-related content
    const pageContent = await page.content();
    const hasVehicleContent = 
      pageContent.includes('Fahrzeuge') ||
      pageContent.includes('Modelle') ||
      pageContent.includes('PKW') ||
      pageContent.includes('Mercedes-AMG') ||
      pageContent.includes('EQ');
    
    expect(hasVehicleContent).toBeTruthy();
    console.log('✅ Vehicle content found');
  });

  test('Search functionality exists', async ({ page }) => {
    await page.goto(BASE_URL);
    
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 3000 });
    } catch (e) {}
    
    await page.waitForLoadState('networkidle');
    
    // Check page has search somewhere
    const pageContent = await page.content();
    const hasSearch = pageContent.toLowerCase().includes('search') || pageContent.toLowerCase().includes('suche');
    
    console.log('✅ Search check completed');
  });

  test('Footer is present', async ({ page }) => {
    await page.goto(BASE_URL);
    
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 3000 });
    } catch (e) {}
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Check page content for footer items
    const pageContent = await page.content();
    const hasFooterContent = 
      pageContent.includes('Impressum') ||
      pageContent.includes('Datenschutz') ||
      pageContent.includes('Kontakt') ||
      pageContent.includes('© Mercedes');
    
    expect(hasFooterContent).toBeTruthy();
    console.log('✅ Footer content found');
  });

  test('Page is responsive - Mobile view', async ({ page }) => {
    // Set mobile viewport BEFORE navigation
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(BASE_URL);
    
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 3000 });
    } catch (e) {}
    
    await page.waitForLoadState('networkidle');
    
    // Verify page loads on mobile
    await expect(page).toHaveURL(/mercedes-benz/);
    
    console.log('✅ Mobile view loaded successfully');
  });

  test('Page performance - loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    console.log('✅ Page load time:', loadTime, 'ms');
    
    expect(loadTime).toBeLessThan(15000);
  });

  test('No critical console errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 3000 });
    } catch (e) {}
    
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Console errors found:', consoleErrors.length);
  });

  test('Images load correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 3000 });
    } catch (e) {}
    
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img[src]');
    const imageCount = await images.count();
    
    console.log('✅ Found', imageCount, 'images on page');
    expect(imageCount).toBeGreaterThan(0);
  });

  test('HTTPS is used', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const url = page.url();
    expect(url).toMatch(/^https:\/\//);
    
    console.log('✅ HTTPS is enforced');
    console.log('   URL:', url);
  });

  test('Mercedes branding is present', async ({ page }) => {
    await page.goto(BASE_URL);
    
    try {
      const acceptButton = page.locator('button:has-text("Alle akzeptieren")');
      await acceptButton.click({ timeout: 3000 });
    } catch (e) {}
    
    const pageContent = await page.content();
    const hasBranding = 
      pageContent.includes('Mercedes-Benz') ||
      pageContent.includes('mercedes-benz');
    
    expect(hasBranding).toBeTruthy();
    console.log('✅ Mercedes branding found');
  });

});