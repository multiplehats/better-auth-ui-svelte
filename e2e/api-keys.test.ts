import { test, expect } from '@playwright/test';
import { generateTestUser, signUpAndVerify, signIn } from './helpers/auth.js';
import { deleteAllMessages } from './helpers/mailpit.js';

test.describe('API Keys', () => {
	const user = generateTestUser();

	test.beforeAll(async ({ browser }) => {
		const page = await browser.newPage();
		await deleteAllMessages();
		await signUpAndVerify(page, user);
		await page.close();
	});

	test('can navigate to API keys page', async ({ page }) => {
		await signIn(page, user);
		await page.goto('/app/account/api-keys');
		await expect(
			page.getByText(/api key/i).first().or(page.getByText(/API/i).first())
		).toBeVisible({ timeout: 10_000 });
	});
});
