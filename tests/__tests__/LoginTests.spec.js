import { expect, test } from '@playwright/test';
import extendedTest from '../../fixtures/test.js';

test.describe('test', () => {
  extendedTest('Invalid Password Error', async ({ app }) => {
      await app.home.isOpen();
    await app.home.login('test', 'test');
    expect(await app.home.getLoginError()).toEqual('Невірний логін або пароль');
  });
});
