import { test, expect } from '@playwright/test';
import { generateTestUser, signUpAndVerify, signIn } from './helpers/auth.js';
import { deleteAllMessages } from './helpers/mailpit.js';

test.describe('Session Management', () => {
	const user = generateTestUser();

	test.beforeAll(async ({ browser }) => {
		const page = await browser.newPage();
		await deleteAllMessages();
		await signUpAndVerify(page, user);
		await page.close();
	});

	test('can view active sessions in security settings', async ({ page }) => {
		await signIn(page, user);
		await page.goto('/app/account/security');

		await expect(page.getByText('Sessions', { exact: true })).toBeVisible({ timeout: 10_000 });
	});
});
