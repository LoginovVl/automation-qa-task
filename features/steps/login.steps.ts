import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page } from '../../support/hooks';
import { LoginPage } from '../../pages/LoginPage';

function GetLoginPage() {
  return new LoginPage(page); // will only be called after `page` is initialized
}

const username = process.env.TEST_USER_USERNAME!;
const password = process.env.TEST_USER_PASSWORD!;

Given('I open the login page', async () => {
  await GetLoginPage().goto();
});

When('I enter valid credentials', async () => {
  await GetLoginPage().login(username, password);
});

When('I enter invalid credentials', async () => {
  await GetLoginPage().login('invalid', 'wrongpass');
});

Then('I should be logged in successfully', async () => {
  await expect(await GetLoginPage().isLoggedIn()).toBeVisible();
});

Then('I should see a login error message', async () => {
  await expect(await GetLoginPage().getLoginError()).toContainText('The username and password could not be verified.');
});
