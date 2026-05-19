/**
 * VISUAL BASELINE — standard_user
 *
 * Captures the known-correct UI as snapshot files.
 * Run with --update-snapshots ONLY when the site's correct appearance changes.
 *
 * Update command (run once, not on every regression run):
 *   npx playwright test tests/visual/baseline.spec.ts --update-snapshots
 */

import { test, expect } from '../../src/fixtures/base.fixture';
import { LoginPage, InventoryPage, CartPage } from '../../src/pages';
import { USERS, PRODUCTS } from '../../src/data/test-data';

const SNAPSHOT_OPTIONS = {
  maxDiffPixelRatio: 0.02,
};

test.describe('Visual Baseline — standard_user', () => {

  test('inventory page baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await page.locator('.inventory_list').waitFor();

    await expect(page).toHaveScreenshot('inventory-baseline.png', SNAPSHOT_OPTIONS);
  });

  test('cart page baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.waitForPageLoad();
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK.id);
    await inventoryPage.openCart();
    await page.locator('.cart_list').waitFor();

    await expect(page).toHaveScreenshot('cart-baseline.png', SNAPSHOT_OPTIONS);
  });

});
