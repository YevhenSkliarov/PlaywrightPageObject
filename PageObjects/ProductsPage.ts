import { Page, Locator } from '@playwright/test';
import BasePage from './BasePage';

export class ProductsPage extends BasePage {
  productsTitle: Locator;
  
  constructor(protected readonly page: Page) {
    super(page);
    this.productsTitle = this.page.getByTestId('title');
  }
}
