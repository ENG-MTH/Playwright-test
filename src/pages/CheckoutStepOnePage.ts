import { Page, Locator } from '@playwright/test';

export class CheckoutStepOnePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput  = page.locator('[data-test="firstName"]');
    this.lastNameInput   = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton  = page.locator('[data-test="continue"]');
    this.errorMessage    = page.locator('[data-test="error"]');
  }

  async fillForm(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async fillFormAndContinue(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.fillForm(firstName, lastName, postalCode);
    await this.continue();
  }

  async getErrorMessage(): Promise<string> {
    return this.errorMessage.innerText();
  }
}
