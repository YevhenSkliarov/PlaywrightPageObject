import { expect, test } from '../../fixtures/test';
import { loginPageExpectedData, productsPageExpectedData } from '../test-data/test-data';

test.describe('test', () => {
  test('Login with valid user', async ({ loginPage, productsPage, users }) => {
    await loginPage.login(users.validUser);
    await expect(productsPage.productsTitle).toHaveText(productsPageExpectedData.productsTitle);
  });

  test('Login with locked user', async ({ loginPage, users }) => {
    await loginPage.login(users.lockedUser);
    await expect(loginPage.loginError).toHaveText(loginPageExpectedData.lockedUserError);
  });
});
