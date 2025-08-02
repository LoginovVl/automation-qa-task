import { Page } from 'playwright';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(process.env.UI_BASE_URL as string);
  }

  async login(username: string, password: string) {
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('input[value="Log In"]');
  }

  async getLoginError() {
    return this.page.locator('#rightPanel .error');
  }

  async isLoggedIn() {
    return this.page.locator('text=Accounts Overview');
  }
}
