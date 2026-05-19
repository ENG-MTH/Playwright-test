import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly pageTitle: Locator;
  readonly inventoryList: Locator;
  readonly cartBadge: Locator;
  readonly cartIcon: Locator;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;

  constructor(private readonly page: Page) {
    this.pageTitle        = page.locator('.title');
    this.inventoryList    = page.locator('.inventory_list');
    this.cartBadge        = page.locator('.shopping_cart_badge');
    this.cartIcon         = page.locator('.shopping_cart_link');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink       = page.locator('#logout_sidebar_link');
  }

  async waitForPageLoad(): Promise<void> {
    await this.inventoryList.waitFor({ state: 'visible' });
  }

  async addProductToCart(productId: string): Promise<void> {
    await this.page.locator(`[data-test="add-to-cart-${productId}"]`).click();
  }

  async removeProductFromCart(productId: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${productId}"]`).click();
  }

  async getCartBadgeCount(): Promise<string> {
    return this.cartBadge.innerText();
  }

  async openCart(): Promise<void> {
    await this.cartIcon.click();
  }

  async logout(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
    await this.logoutLink.click();
  }
}
