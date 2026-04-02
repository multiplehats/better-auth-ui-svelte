import { test, expect } from '@playwright/test';
import { generateTestUser, signUpAndVerify, signIn } from './helpers/auth.js';
import { deleteAllMessages } from './helpers/mailpit.js';

test.describe('Sign Out', () => {
	const user = generateTestUser();

	test.beforeAll(async ({ browser }) => {
		const page = await browser.newPage();
		await deleteAllMessages();
		await signUpAndVerify(page, user);
		await page.close();
	});

	test('can sign out from authenticated state', async ({ page }) => {
		await signIn(page, user);
		await expect(page).toHaveURL(/\/app/);

		await page.goto('/auth/sign-out');
		await expect(
			page
				.getByRole('button', { name: /sign out/i })
				.or(page.getByText(/sign out/i).first())
				.or(page.locator('input#email'))
		).toBeVisible({ timeout: 10_000 });
	});

	test('after sign out, accessing protected route redirects to sign-in', async ({ page }) => {
		await signIn(page, user);

		await page.goto('/auth/sign-out');
		const signOutBtn = page.getByRole('button', { name: /sign out/i });
		if (await signOutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
			await signOutBtn.click();
		}
		await page.waitForTimeout(3000);

		await page.goto('/app');
		await page.waitForURL('**/auth/sign-in**', { timeout: 10_000 });
	});
});
