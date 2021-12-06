import BasePage from "./BasePage.js";

export default class HomePage extends BasePage{
    constructor(page){
        super(page)
    }

    app = this.page.locator('a[title="I.UA"]');
    loginField = this.page.locator('input[name="login"]');
    password = this.page.locator('input[name="pass"]');
    loginButton = this.page.locator('p > input[type="submit"]');
    error = this.page.locator('.content.clear');

    async open(){
          await this.page.goto('/',{
            waitUntil: 'load'
          });
    }

    async isOpen(){
        return await this.app.isVisible();
    }

    async setLogin(login){
        await this.loginField.fill(login);
    }

    async setPassword(password){
        await this.password.fill(password);
    }

    async pressLogin(){
        await this.loginButton.click();
    }

    async login(login, password){
        await this.setLogin(login);
        await this.setPassword(password);
        await this.pressLogin();
    }

    async getLoginError(){
        return await this.error.textContent()
    }
}