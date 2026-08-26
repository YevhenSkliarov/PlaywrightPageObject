import { test as base } from '@playwright/test';
import { LoginPage, User } from '../PageObjects/LoginPage';
import { ProductsPage } from '../PageObjects/ProductsPage';

type App = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  users: typeof users;
};

export const users: Record<string, User> = {
  validUser: {
    username: process.env.USERNAME!,
    password: process.env.PASSWORD!,
  },

  lockedUser: {
    username: process.env.LOCKED_USER!,
    password: process.env.PASSWORD!,
  },
};

export const test = base.extend<App>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    use(loginPage);
  },
  productsPage: async ({ page }, use) => {
    use(new ProductsPage(page));
  },
  users: async ({}, use) => {
    use(users);
  }
});

export { expect } from '@playwright/test';