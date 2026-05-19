import { Page, Locator } from '@playwright/test';

export class CheckoutStepTwoPage {
  readonly cartItems: Locator;
  readonly itemTotal: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(private readonly page: Page) {
    this.cartItems    = page.locator('.cart_item');
    this.itemTotal    = page.locator('.summary_subtotal_label');
    this.taxLabel     = page.locator('.summary_tax_label');
    this.totalLabel   = page.locator('.summary_total_label');
    this.finishButton = page.locator('[data-test="finish"]');
  }

  async getOrderedItemNames(): Promise<string[]> {
    return this.page.locator('.cart_item .inventory_item_name').allInnerTexts();
  }

  async finishOrder(): Promise<void> {
    await this.finishButton.click();
  }
}
