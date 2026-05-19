import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.cartItems      = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForURL('**/cart.html');
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    return this.page.locator('.cart_item .inventory_item_name').allInnerTexts();
  }

  async removeItem(productId: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${productId}"]`).click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
