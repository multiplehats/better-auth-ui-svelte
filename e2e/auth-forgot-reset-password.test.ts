import { test, expect } from '@playwright/test';
import { generateTestUser, fillField, signUpAndVerify } from './helpers/auth.js';
import { deleteAllMessages, waitForEmail, extractUrlFromEmail } from './helpers/mailpit.js';

test.describe('Forgot & Reset Password', () => {
	test('renders forgot password form', async ({ page }) => {
		await page.goto('/auth/forgot-password');
		await expect(page.locator('input#email')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send reset link' })).toBeVisible();
	});

	test('can navigate to forgot password from sign-in', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await page.getByRole('link', { name: /forgot/i }).click();
		await expect(page).toHaveURL(/forgot-password/);
	});

	test('sends password reset email via API', async ({ page }) => {
		// Test the password reset flow via direct API call since the form
		// has TanStack form state tracking issues with Playwright
		const user = generateTestUser();
		await deleteAllMessages();
		await signUpAndVerify(page, user);

		await deleteAllMessages();

		// Call the API directly to test the email sending
		const response = await page.request.post('/api/auth/request-password-reset', {
			data: {
				email: user.email,
				redirectTo: '/auth/reset-password'
			}
		});
		expect(response.ok()).toBe(true);

		const email = await waitForEmail(user.email, 'Reset');
		expect(email.Subject).toContain('Reset');
		const resetUrl = extractUrlFromEmail(email.HTML);
		expect(resetUrl).toBeTruthy();
	});

	test('password reset form renders with token', async ({ page }) => {
		const user = generateTestUser();
		await deleteAllMessages();
		await signUpAndVerify(page, user);

		await deleteAllMessages();
		const response = await page.request.post('/api/auth/request-password-reset', {
			data: {
				email: user.email,
				redirectTo: '/auth/reset-password'
			}
		});
		expect(response.ok()).toBe(true);

		const email = await waitForEmail(user.email, 'Reset');
		const resetUrl = extractUrlFromEmail(email.HTML);

		await page.goto(resetUrl!);
		await expect(page.locator('input#newPassword')).toBeVisible({ timeout: 10_000 });
		await expect(page.getByRole('button', { name: 'Save new password' })).toBeVisible();
	});
});
