/**
 * SMOKE TEST — Happy Path (End-to-End Purchase Flow)
 *
 * Purpose: Run the full purchase flow for every user account that can log in.
 * Each user runs the same 13 steps — failures reveal which account is broken
 * and at which step, making the report a full deployment health snapshot.
 *
 * Login SLA: 3 000 ms — performance_glitch_user will exceed this and FAIL.
 * Broken accounts (problem_user, error_user) will fail at their broken step.
 *
 * visual_user is excluded — its bugs are visual only (wrong images, CSS layout)
 * and are caught by tests/visual/regression.spec.ts, not functional assertions.
 */

import { test, expect } from '../../src/fixtures/base.fixture';
import { LoginPage, CartPage, CheckoutStepOnePage, CheckoutStepTwoPage, CheckoutCompletePage } from '../../src/pages';
import { USERS, PRODUCTS, CHECKOUT, MESSAGES, URLS } from '../../src/data/test-data';

const LOGIN_SLA_MS = 3_000;

// visual_user excluded — its bugs are visual-only, covered by tests/visual/regression.spec.ts
const LOGINABLE_USERS = [
  { label: 'standard_user',          credentials: USERS.STANDARD },
  { label: 'problem_user',           credentials: USERS.PROBLEM },
  { label: 'performance_glitch_user',credentials: USERS.PERFORMANCE_GLITCH },
  { label: 'error_user',             credentials: USERS.ERROR },
];

test.describe('Smoke Test — Complete Purchase Flow (All Users)', () => {

  for (const user of LOGINABLE_USERS) {
    test(`${user.label} — full purchase flow`, async ({ page }) => {

      // ── 1. Open the login page ───────────────────────────────────────────
      const loginPage = new LoginPage(page);
      await loginPage.navigate();

      await expect(loginPage.usernameInput, 'Username field must be present').toBeVisible();
      await expect(loginPage.passwordInput, 'Password field must be present').toBeVisible();
      await expect(loginPage.loginButton,   'Login button must be present').toBeVisible();

      // ── 2. Log in and enforce the 3-second SLA ───────────────────────────
      // Timer starts at the click — performance_glitch_user will exceed 3 000ms and FAIL here.
      await loginPage.usernameInput.fill(user.credentials.username);
      await loginPage.passwordInput.fill(user.credentials.password);

      const start = Date.now();
      await loginPage.loginButton.click();
      await page.waitForURL(/inventory\.html/, { timeout: 15_000 });
      const loginMs = Date.now() - start;

      expect(
        loginMs,
        `${user.label}: login took ${loginMs}ms — must be under ${LOGIN_SLA_MS}ms`,
      ).toBeLessThan(LOGIN_SLA_MS);

      // ── 3. Verify the products page loads ────────────────────────────────
      await expect(page.locator('.title'), 'Page title must read "Products"').toHaveText('Products');
      await expect(page.locator('.inventory_list'), 'Product list must be visible').toBeVisible();
      await expect(page.locator('.inventory_item'), 'At least one product must be listed').not.toHaveCount(0);

      // ── 4. Add a product to the cart ─────────────────────────────────────
      const addToCartBtn = page.locator(`[data-test="add-to-cart-${PRODUCTS.BACKPACK.id}"]`);
      await expect(addToCartBtn, '"Add to cart" button must be visible').toBeVisible();
      await addToCartBtn.click();

      // ── 5. Verify the cart badge updates ─────────────────────────────────
      await expect(
        page.locator('.shopping_cart_badge'),
        'Cart badge must show 1 after adding one item',
      ).toHaveText('1');

      await expect(
        page.locator(`[data-test="remove-${PRODUCTS.BACKPACK.id}"]`),
        '"Remove" button must appear confirming item is in cart',
      ).toBeVisible();

      // ── 6. Open the cart page ─────────────────────────────────────────────
      await page.locator('.shopping_cart_link').click();
      await expect(page, 'Cart icon must navigate to cart page').toHaveURL(/cart\.html/);

      // ── 7. Verify cart contains the correct product ───────────────────────
      const cartPage = new CartPage(page);
      const cartItemNames = await cartPage.getCartItemNames();
      expect(cartItemNames, 'Cart must list the Backpack').toContain(PRODUCTS.BACKPACK.name);

      // ── 8. Proceed to checkout ────────────────────────────────────────────
      await cartPage.proceedToCheckout();
      await expect(page, 'Must navigate to checkout information form').toHaveURL(/checkout-step-one\.html/);

      // ── 9. Fill in checkout information ───────────────────────────────────
      const checkoutStepOne = new CheckoutStepOnePage(page);
      await checkoutStepOne.fillFormAndContinue(
        CHECKOUT.VALID.firstName,
        CHECKOUT.VALID.lastName,
        CHECKOUT.VALID.postalCode,
      );

      // ── 10. Verify the order overview ─────────────────────────────────────
      await expect(page, 'Must advance to order overview page').toHaveURL(/checkout-step-two\.html/);

      const checkoutStepTwo = new CheckoutStepTwoPage(page);
      const orderedItems = await checkoutStepTwo.getOrderedItemNames();
      expect(orderedItems, 'Order overview must include the Backpack').toContain(PRODUCTS.BACKPACK.name);

      await expect(checkoutStepTwo.itemTotal,  'Item subtotal must be displayed').toBeVisible();
      await expect(checkoutStepTwo.taxLabel,   'Tax amount must be displayed').toBeVisible();
      await expect(checkoutStepTwo.totalLabel, 'Order total must be displayed').toBeVisible();

      // ── 11. Complete the checkout ─────────────────────────────────────────
      await checkoutStepTwo.finishOrder();
      await expect(page, '"Finish" must navigate to confirmation page').toHaveURL(/checkout-complete\.html/);

      // ── 12. Validate the success message ──────────────────────────────────
      const checkoutComplete = new CheckoutCompletePage(page);
      await expect(
        checkoutComplete.successHeader,
        'Confirmation header must say "Thank you for your order!"',
      ).toHaveText(MESSAGES.ORDER_SUCCESS);

      await expect(
        checkoutComplete.ponyExpressImage,
        'Confirmation illustration must be visible',
      ).toBeVisible();

      // ── 13. Log out successfully ───────────────────────────────────────────
      await checkoutComplete.backToProducts();
      await expect(page, '"Back to products" must return to inventory').toHaveURL(/inventory\.html/);

      await page.locator('#react-burger-menu-btn').click();
      const logoutLink = page.locator('#logout_sidebar_link');
      await expect(logoutLink, 'Logout link must appear in sidebar').toBeVisible();
      await logoutLink.click();

      await expect(page, 'Logout must redirect to login page').toHaveURL(URLS.LOGIN);
      await expect(
        page.locator('[data-test="login-button"]'),
        'Login button must be visible after logout',
      ).toBeVisible();
    });
  }

});
