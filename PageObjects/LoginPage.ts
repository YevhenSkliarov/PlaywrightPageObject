import { Page, Locator } from '@playwright/test';
import BasePage from './BasePage';

export type User = {
  username: string;
  password: string;
};

export class LoginPage extends BasePage {
  username: Locator;
  password: Locator;
  loginButton: Locator;
  loginError: Locator;

  constructor(protected readonly page: Page) {
    super(page);
    this.username = this.page.getByTestId('username');
    this.password = this.page.getByTestId('password');
    this.loginButton = this.page.getByTestId('login-button');
    this.loginError = this.page.getByTestId('error');
  }

  async login(user: User) {
    await this.username.fill(user.username);
    await this.password.fill(user.password);
    await this.loginButton.click();
  }
}
