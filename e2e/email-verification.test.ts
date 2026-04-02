import { test, expect } from '@playwright/test';
import { generateTestUser, fillField } from './helpers/auth.js';
import { deleteAllMessages, waitForEmail, extractUrlFromEmail } from './helpers/mailpit.js';

test.describe('Email Verification', () => {
	test('unverified user is redirected to verify-email page', async ({ page }) => {
		await deleteAllMessages();
		const user = generateTestUser();

		await page.goto('/auth/sign-up');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#name', user.name);
		await fillField(page, 'input#email', user.email);
		await fillField(page, 'input#password', user.password);
		await page.getByRole('button', { name: 'Create an account' }).click();

		await page.waitForURL('**/verify-email**', { timeout: 15_000 });
	});

	test('verify-email page shows verification required message', async ({ page }) => {
		await deleteAllMessages();
		const user = generateTestUser();

		await page.goto('/auth/sign-up');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#name', user.name);
		await fillField(page, 'input#email', user.email);
		await fillField(page, 'input#password', user.password);
		await page.getByRole('button', { name: 'Create an account' }).click();

		await page.waitForURL('**/verify-email**', { timeout: 15_000 });
		await expect(page.getByText('Email Verification Required')).toBeVisible({ timeout: 5_000 });
	});

	test('verify-email page has resend button', async ({ page }) => {
		await deleteAllMessages();
		const user = generateTestUser();

		await page.goto('/auth/sign-up');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#name', user.name);
		await fillField(page, 'input#email', user.email);
		await fillField(page, 'input#password', user.password);
		await page.getByRole('button', { name: 'Create an account' }).click();

		await page.waitForURL('**/verify-email**', { timeout: 15_000 });
		await expect(
			page.getByRole('button', { name: /resend/i })
		).toBeVisible({ timeout: 10_000 });
	});

	test('verification link verifies email and shows success', async ({ page }) => {
		await deleteAllMessages();
		const user = generateTestUser();

		await page.goto('/auth/sign-up');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#name', user.name);
		await fillField(page, 'input#email', user.email);
		await fillField(page, 'input#password', user.password);
		await page.getByRole('button', { name: 'Create an account' }).click();

		await page.waitForURL('**/verify-email**', { timeout: 15_000 });

		const email = await waitForEmail(user.email);
		const verifyUrl = extractUrlFromEmail(email.HTML);
		expect(verifyUrl).toBeTruthy();

		await page.goto(verifyUrl!);

		// Should show verified state
		await expect(page.getByText('Email verified!')).toBeVisible({ timeout: 10_000 });
	});

	test('verified user can access sign-in page', async ({ page }) => {
		await deleteAllMessages();
		const user = generateTestUser();

		await page.goto('/auth/sign-up');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#name', user.name);
		await fillField(page, 'input#email', user.email);
		await fillField(page, 'input#password', user.password);
		await page.getByRole('button', { name: 'Create an account' }).click();

		await page.waitForURL('**/verify-email**', { timeout: 15_000 });

		const email = await waitForEmail(user.email);
		const verifyUrl = extractUrlFromEmail(email.HTML);
		await page.goto(verifyUrl!);
		await page.waitForTimeout(2000);

		// After verification, user should be able to access sign-in page
		await page.goto('/auth/sign-in');
		await expect(page.locator('input#email')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
	});
});
