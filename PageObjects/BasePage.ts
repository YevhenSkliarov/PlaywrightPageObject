import { Page } from '@playwright/test';

export default class BasePage {
  constructor(protected readonly page: Page) {}

  async open() {
    await this.page.goto('/');
  }
}
