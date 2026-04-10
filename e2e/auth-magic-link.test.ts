import { test, expect } from '@playwright/test';
import { generateTestUser, fillField, signUpAndVerify } from './helpers/auth.js';
import { deleteAllMessages, waitForEmail, extractUrlFromEmail } from './helpers/mailpit.js';

test.describe('Magic Link', () => {
	const user = generateTestUser();

	test.beforeAll(async ({ browser }) => {
		const page = await browser.newPage();
		await deleteAllMessages();
		await signUpAndVerify(page, user);
		await page.close();
	});

	test('renders magic link form', async ({ page }) => {
		await page.goto('/auth/magic-link');
		await expect(page.locator('input#email')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send magic link' })).toBeVisible();
	});

	test('sends magic link email and shows sent page', async ({ page }) => {
		await deleteAllMessages();
		await page.goto('/auth/magic-link');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#email', user.email);
		await page.getByRole('button', { name: 'Send magic link' }).click();

		// Should show magic link sent page
		await expect(page.getByText('Magic link sent!')).toBeVisible({ timeout: 10_000 });

		// Verify email was sent via Mailpit
		const email = await waitForEmail(user.email, 'Magic Link');
		expect(email.Subject).toContain('Magic Link');
	});

	test('magic link email contains valid sign-in URL', async ({ page }) => {
		await deleteAllMessages();
		await page.goto('/auth/magic-link');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#email', user.email);
		await page.getByRole('button', { name: 'Send magic link' }).click();

		const email = await waitForEmail(user.email, 'Magic Link');
		const magicUrl = extractUrlFromEmail(email.HTML);
		expect(magicUrl).toBeTruthy();
		expect(magicUrl).toContain('http');
	});

	test('clicking magic link signs user in', async ({ page }) => {
		await deleteAllMessages();
		await page.goto('/auth/magic-link');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#email', user.email);
		await page.getByRole('button', { name: 'Send magic link' }).click();

		const email = await waitForEmail(user.email, 'Magic Link');
		const magicUrl = extractUrlFromEmail(email.HTML);
		expect(magicUrl).toBeTruthy();

		await page.goto(magicUrl!);
		await page.waitForURL('**/app**', { timeout: 25_000 });
		await expect(page).toHaveURL(/\/app/);
	});

	test('magic link sent page shows resend button', async ({ page }) => {
		await deleteAllMessages();
		await page.goto('/auth/magic-link');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#email', user.email);
		await page.getByRole('button', { name: 'Send magic link' }).click();

		await expect(page.getByRole('button', { name: /resend magic link/i })).toBeVisible({
			timeout: 10_000
		});
	});

	test('magic link sent page has back to sign in button', async ({ page }) => {
		await deleteAllMessages();
		await page.goto('/auth/magic-link');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#email', user.email);
		await page.getByRole('button', { name: 'Send magic link' }).click();

		await expect(page.getByRole('button', { name: /back to sign in/i })).toBeVisible({
			timeout: 10_000
		});
	});
});
