/**
 * EDGE CASE TESTS — Boundary and Failure Scenarios
 *
 * Purpose: Verify that the application handles invalid input, restricted access,
 * and broken accounts gracefully — with clear, user-facing error messages.
 *
 * These tests intentionally trigger failure conditions.
 * A passing result means the application rejected bad input correctly.
 */

import { test, expect } from '../../src/fixtures/base.fixture';
import { LoginPage, InventoryPage, CartPage, CheckoutStepOnePage } from '../../src/pages';
import { USERS, PRODUCTS, CHECKOUT, MESSAGES, URLS } from '../../src/data/test-data';

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 1 — Login Failure Scenarios
//
// Why: Authentication is the gateway to the entire application.
// Every failure mode must show a clear error and never redirect the user inward.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Edge Cases — Login Failures', () => {

  test(
    'User sees an error message when logging in with an unrecognised username and password',
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();

      await loginPage.login(USERS.INVALID.username, USERS.INVALID.password);

      // The error banner must appear — silent failures are unacceptable for auth
      await expect(loginPage.errorMessage, 'Error banner must be visible after invalid login').toBeVisible();
      expect(
        await loginPage.getErrorMessage(),
        'Error text must state the credentials do not match',
      ).toContain(MESSAGES.INVALID_CREDS_ERROR);

      // User must stay on the login page — never leak into the app
      await expect(page, 'User must remain on the login page after a failed attempt').toHaveURL(URLS.LOGIN);
    },
  );

  test(
    'Locked-out user sees the specific lock-out error and cannot access the application',
    async ({ page }) => {
      // locked_out_user uses a valid password but is blocked by account status.
      // The error message must be specific — a generic "credentials wrong" message
      // would mislead the user into thinking they typed the password incorrectly.
      const loginPage = new LoginPage(page);
      await loginPage.navigate();

      await loginPage.login(USERS.LOCKED_OUT.username, USERS.LOCKED_OUT.password);

      await expect(loginPage.errorMessage, 'Lock-out error banner must be visible').toBeVisible();
      expect(
        await loginPage.getErrorMessage(),
        'Error must specifically state the account is locked out',
      ).toBe(MESSAGES.LOCKED_OUT_ERROR);

      await expect(page, 'Locked-out user must remain on the login page').toHaveURL(URLS.LOGIN);
    },
  );

  test(
    'User sees "Username is required" error when submitting the login form with an empty username',
    async ({ page }) => {
      // Submitting with a password but no username is a common accidental gesture.
      // The app must highlight the missing field, not just show a generic error.
      const loginPage = new LoginPage(page);
      await loginPage.navigate();

      await loginPage.passwordInput.fill(USERS.STANDARD.password);
      await loginPage.loginButton.click();

      await expect(loginPage.errorMessage, 'Validation error must appear for empty username').toBeVisible();
      expect(
        await loginPage.getErrorMessage(),
        'Error must explicitly state the username field is required',
      ).toBe(MESSAGES.EMPTY_USERNAME_ERROR);
    },
  );

  test(
    'User sees "Password is required" error when submitting the login form with an empty password',
    async ({ page }) => {
      // Mirror of the empty-username test — both fields must validate independently.
      const loginPage = new LoginPage(page);
      await loginPage.navigate();

      await loginPage.usernameInput.fill(USERS.STANDARD.username);
      await loginPage.loginButton.click();

      await expect(loginPage.errorMessage, 'Validation error must appear for empty password').toBeVisible();
      expect(
        await loginPage.getErrorMessage(),
        'Error must explicitly state the password field is required',
      ).toBe(MESSAGES.EMPTY_PASSWORD_ERROR);
    },
  );

});

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 2 — Checkout Form Validation
//
// Why: The checkout form guards order placement. Submitting with missing fields
// must be blocked with field-specific errors — not silently accepted.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Edge Cases — Checkout Form Validation', () => {

  // Reach the checkout form with one item already in the cart before each test.
  // This avoids duplicating the login + add-to-cart + cart steps in every test.
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.waitForPageLoad();
    await inventoryPage.addProductToCart(PRODUCTS.BACKPACK.id);
    await inventoryPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.proceedToCheckout();
  });

  test(
    'Checkout form blocks submission and shows "First Name is required" when First Name is empty',
    async ({ page }) => {
      const checkoutStepOne = new CheckoutStepOnePage(page);

      // Provide Last Name and Postal Code but leave First Name blank
      await checkoutStepOne.fillForm('', CHECKOUT.VALID.lastName, CHECKOUT.VALID.postalCode);
      await checkoutStepOne.continue();

      await expect(checkoutStepOne.errorMessage, 'Error banner must appear when First Name is missing').toBeVisible();
      expect(
        await checkoutStepOne.getErrorMessage(),
        'Error must name the First Name field specifically',
      ).toBe(MESSAGES.FORM_FIRST_NAME);
    },
  );

  test(
    'Checkout form blocks submission and shows "Last Name is required" when Last Name is empty',
    async ({ page }) => {
      const checkoutStepOne = new CheckoutStepOnePage(page);

      await checkoutStepOne.fillForm(CHECKOUT.VALID.firstName, '', CHECKOUT.VALID.postalCode);
      await checkoutStepOne.continue();

      await expect(checkoutStepOne.errorMessage, 'Error banner must appear when Last Name is missing').toBeVisible();
      expect(
        await checkoutStepOne.getErrorMessage(),
        'Error must name the Last Name field specifically',
      ).toBe(MESSAGES.FORM_LAST_NAME);
    },
  );

  test(
    'Checkout form blocks submission and shows "Postal Code is required" when Postal Code is empty',
    async ({ page }) => {
      const checkoutStepOne = new CheckoutStepOnePage(page);

      await checkoutStepOne.fillForm(CHECKOUT.VALID.firstName, CHECKOUT.VALID.lastName, '');
      await checkoutStepOne.continue();

      await expect(checkoutStepOne.errorMessage, 'Error banner must appear when Postal Code is missing').toBeVisible();
      expect(
        await checkoutStepOne.getErrorMessage(),
        'Error must name the Postal Code field specifically',
      ).toBe(MESSAGES.FORM_POSTAL_CODE);
    },
  );

});

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 3 — Cart Add / Remove Operations
//
// Why: The cart badge is the user's only real-time signal about cart contents.
// It must stay in sync with every add and remove action across all pages.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Edge Cases — Cart Operations', () => {

  test(
    'Cart badge increments correctly as multiple products are added one by one',
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

      const inventoryPage = new InventoryPage(page);
      await inventoryPage.waitForPageLoad();

      await inventoryPage.addProductToCart(PRODUCTS.BACKPACK.id);
      await expect(page.locator('.shopping_cart_badge'), 'Badge must show 1 after adding the Backpack').toHaveText('1');

      await inventoryPage.addProductToCart(PRODUCTS.BIKE_LIGHT.id);
      await expect(page.locator('.shopping_cart_badge'), 'Badge must show 2 after adding the Bike Light').toHaveText('2');

      await inventoryPage.addProductToCart(PRODUCTS.BOLT_SHIRT.id);
      await expect(page.locator('.shopping_cart_badge'), 'Badge must show 3 after adding the Bolt T-Shirt').toHaveText('3');
    },
  );

  test(
    'Removing the only item from the cart page empties the cart and hides the badge',
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

      const inventoryPage = new InventoryPage(page);
      await inventoryPage.waitForPageLoad();
      await inventoryPage.addProductToCart(PRODUCTS.BACKPACK.id);

      await inventoryPage.openCart();

      const cartPage = new CartPage(page);
      await cartPage.waitForPageLoad();
      expect(await cartPage.getCartItemCount(), 'Cart must contain 1 item before removal').toBe(1);

      await cartPage.removeItem(PRODUCTS.BACKPACK.id);

      // An empty cart must have zero items AND no badge — both must be true simultaneously
      expect(await cartPage.getCartItemCount(), 'Cart must show 0 items after removal').toBe(0);
      await expect(
        page.locator('.shopping_cart_badge'),
        'Badge must disappear when the cart is empty',
      ).not.toBeVisible();
    },
  );

  test(
    'Product removed from the inventory page disappears from the cart and restores the "Add to cart" button',
    async ({ page }) => {
      // Users can remove items from the inventory list without visiting the cart.
      // The badge and the button state must both update immediately.
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

      const inventoryPage = new InventoryPage(page);
      await inventoryPage.waitForPageLoad();
      await inventoryPage.addProductToCart(PRODUCTS.BACKPACK.id);

      await expect(page.locator('.shopping_cart_badge'), 'Badge must show 1 before removal').toHaveText('1');

      await inventoryPage.removeProductFromCart(PRODUCTS.BACKPACK.id);

      await expect(
        page.locator('.shopping_cart_badge'),
        'Badge must vanish after removing the item from the inventory page',
      ).not.toBeVisible();

      await expect(
        page.locator(`[data-test="add-to-cart-${PRODUCTS.BACKPACK.id}"]`),
        '"Add to cart" button must reappear after the item is removed',
      ).toBeVisible();
    },
  );

});

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 4 — Restricted Access (Unauthenticated Direct URL Navigation)
//
// Why: Typing a protected URL directly is a common way users accidentally (or
// deliberately) try to bypass authentication. Every protected route must
// redirect unauthenticated requests back to the login page.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Edge Cases — Restricted Access Without Authentication', () => {

  test(
    'Unauthenticated user is redirected to the login page when navigating directly to /inventory.html',
    async ({ page }) => {
      await page.goto(URLS.INVENTORY);

      await expect(
        page.locator('[data-test="login-button"]'),
        'Login page must be shown for unauthenticated access to the inventory',
      ).toBeVisible();
    },
  );

  test(
    'Unauthenticated user is redirected to the login page when navigating directly to /cart.html',
    async ({ page }) => {
      await page.goto(URLS.CART);

      await expect(
        page.locator('[data-test="login-button"]'),
        'Login page must be shown for unauthenticated access to the cart',
      ).toBeVisible();
    },
  );

  test(
    'Unauthenticated user is redirected to the login page when navigating directly to the checkout form',
    async ({ page }) => {
      await page.goto(URLS.CHECKOUT_STEP_ONE);

      await expect(
        page.locator('[data-test="login-button"]'),
        'Login page must be shown for unauthenticated access to the checkout form',
      ).toBeVisible();
    },
  );

});

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 5 — Performance Glitch User
//
// Why: A slow server response must not cause a timeout that breaks the login
// flow. The application should succeed — just later than normal.
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Edge Cases — Performance Glitch User', () => {

  test(
    'performance_glitch_user lands on the inventory page after a delayed login response',
    async ({ page }) => {
      // This account simulates a backend that takes several seconds to respond.
      // We extend the URL assertion timeout to 15 s to avoid a false failure
      // caused by the deliberately slow server — the test is checking resilience,
      // not speed.
      const loginPage = new LoginPage(page);
      await loginPage.navigate();
      await loginPage.login(USERS.PERFORMANCE_GLITCH.username, USERS.PERFORMANCE_GLITCH.password);

      await expect(
        page,
        'Inventory page must eventually load despite the simulated server delay',
      ).toHaveURL(/inventory\.html/, { timeout: 15_000 });

      await expect(
        page.locator('.inventory_list'),
        'Product list must be visible after a slow login',
      ).toBeVisible();
    },
  );

});
