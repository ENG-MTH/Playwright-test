/**
 * VISUAL REGRESSION — visual_user vs standard_user baseline
 *
 * Detects UI bugs that text assertions cannot catch:
 * wrong images, broken layouts, misaligned elements, CSS issues.
 *
 * Baselines must exist before running (generate with baseline.spec.ts --update-snapshots).
 * Any pixel difference beyond 2% in the visual_user view will FAIL this test.
 */

import { test, expect } from '../../src/fixtures/base.fixture';
import { LoginPage, InventoryPage, CartPage } from '../../src/pages';
import { USERS, PRODUCTS } from '../../src/data/test-data';

const SNAPSHOT_OPTIONS = {
  // Allow up to 2% pixel difference to avoid flakiness from anti-aliasing
  maxDiffPixelRatio: 0.02,
};

test.describe('Visual Regression — visual_user vs baseline', () => {

  test('inventory page must match standard_user baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(USERS.VISUAL.username, USERS.VISUAL.password);
    await page.locator('.inventory_list').waitFor();

    // visual_user has injected CSS/layout bugs — pixel diff will FAIL if different
    await expect(page).toHaveScreenshot('inventory-baseline.png', SNAPSHOT_OPTIONS);
  });

  test('cart page must match standard_user baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(USERS.VISUAL.username, USERS.VISUAL.password);

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.waitForPageLoad();
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK.id);
    await inventoryPage.openCart();
    await page.locator('.cart_list').waitFor();

    // visual_user cart may have layout differences — pixel diff will FAIL if different
    await expect(page).toHaveScreenshot('cart-baseline.png', SNAPSHOT_OPTIONS);
  });

});
