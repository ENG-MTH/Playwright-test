import { Page, Locator } from '@playwright/test';

export class CheckoutCompletePage {
  readonly successHeader: Locator;
  readonly ponyExpressImage: Locator;
  readonly backToProductsButton: Locator;

  constructor(private readonly page: Page) {
    this.successHeader        = page.locator('.complete-header');
    this.ponyExpressImage     = page.locator('.pony_express');
    this.backToProductsButton = page.locator('[data-test="back-to-products"]');
  }

  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }
}
