import { test, expect } from '@playwright/test';
import { generateTestUser, fillField, signUpAndVerify } from './helpers/auth.js';
import { deleteAllMessages } from './helpers/mailpit.js';

test.describe('Sign In', () => {
	test('renders sign-in form with email and password fields', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await expect(page.locator('input#email')).toBeVisible();
		await expect(page.locator('input#password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
	});

	test('shows link to sign-up page', async ({ page }) => {
		await page.goto('/auth/sign-in');
		const signUpLink = page.getByRole('link', { name: /sign up/i });
		await expect(signUpLink).toBeVisible();
	});

	test('shows forgot password link', async ({ page }) => {
		await page.goto('/auth/sign-in');
		const forgotLink = page.getByRole('link', { name: /forgot/i });
		await expect(forgotLink).toBeVisible();
	});

	test('signs in with valid credentials and redirects to app', async ({ page }) => {
		const user = generateTestUser();
		await deleteAllMessages();
		await signUpAndVerify(page, user);

		await page.goto('/auth/sign-in');
		await page.waitForTimeout(1000);
		await fillField(page, 'input#email', user.email);
		await fillField(page, 'input#password', user.password);
		await page.getByRole('button', { name: 'Login' }).click();

		await page.waitForURL('**/app**', { timeout: 25_000 });
		await expect(page).toHaveURL(/\/app/);
	});

	test('shows error for wrong password', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await page.waitForTimeout(1000);
		await fillField(page, 'input#email', 'testuser@example.com');
		await fillField(page, 'input#password', 'WrongPassword999!');
		await page.getByRole('button', { name: 'Login' }).click();

		await expect(
			page.locator('[data-sonner-toast]').first()
		).toBeVisible({ timeout: 10_000 });
	});

	test('shows error for non-existent email', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await page.waitForTimeout(1000);
		await fillField(page, 'input#email', 'nobody-ever@example.com');
		await fillField(page, 'input#password', 'SomePassword123!');
		await page.getByRole('button', { name: 'Login' }).click();

		await expect(
			page.locator('[data-sonner-toast]').first()
		).toBeVisible({ timeout: 10_000 });
	});

	test('shows social provider (Google) button', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
	});
});
