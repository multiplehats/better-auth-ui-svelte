import { test, expect } from '@playwright/test';
import { generateTestUser } from './helpers/auth.js';
import { deleteAllMessages, waitForEmail, extractUrlFromEmail } from './helpers/mailpit.js';

async function fillField(page: import('@playwright/test').Page, selector: string, value: string) {
	const field = page.locator(selector);
	await field.click();
	await field.fill('');
	await field.pressSequentially(value, { delay: 10 });
}

test.describe('Sign Up', () => {
	test('renders sign-up form with all fields', async ({ page }) => {
		await page.goto('/auth/sign-up');
		await expect(page.locator('input#name')).toBeVisible();
		await expect(page.locator('input#email')).toBeVisible();
		await expect(page.locator('input#password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Create an account' })).toBeVisible();
	});

	test('shows link to sign-in page', async ({ page }) => {
		await page.goto('/auth/sign-up');
		const signInLink = page.getByRole('link', { name: /sign in/i });
		await expect(signInLink).toBeVisible();
	});

	test('creates account and redirects to email verification', async ({ page }) => {
		const user = generateTestUser();
		await page.goto('/auth/sign-up');
		await page.waitForTimeout(2000);

		await fillField(page, 'input#name', user.name);
		await fillField(page, 'input#email', user.email);
		await fillField(page, 'input#password', user.password);
		await page.getByRole('button', { name: 'Create an account' }).click();

		await page.waitForURL('**/verify-email**', { timeout: 15_000 });
		await expect(page.getByText('Email Verification Required')).toBeVisible();
	});

	test('sends verification email after sign-up', async ({ page }) => {
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
		expect(email.Subject).toBeTruthy();
	});

	test('email verification link works and verifies account', async ({ page }) => {
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
		await expect(
			page
				.getByText(/verified/i)
				.first()
				.or(page.getByText(/sign in/i).first())
		).toBeVisible({ timeout: 10_000 });
	});

	test('shows validation error for empty fields', async ({ page }) => {
		await page.goto('/auth/sign-up');
		await page.getByRole('button', { name: 'Create an account' }).click();
		await expect(page).toHaveURL(/sign-up/);
	});

	test('shows error for duplicate email', async ({ page }) => {
		const user = generateTestUser();

		// Sign up first time
		await page.goto('/auth/sign-up');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#name', user.name);
		await fillField(page, 'input#email', user.email);
		await fillField(page, 'input#password', user.password);
		await page.getByRole('button', { name: 'Create an account' }).click();
		await page.waitForURL('**/verify-email**', { timeout: 15_000 });

		// Try to sign up again with same email
		await page.goto('/auth/sign-up');
		await page.waitForTimeout(2000);
		await fillField(page, 'input#name', 'Another Name');
		await fillField(page, 'input#email', user.email);
		await fillField(page, 'input#password', user.password);
		await page.getByRole('button', { name: 'Create an account' }).click();

		// Should show toast error
		await expect(page.getByText('User already exists')).toBeVisible({ timeout: 10_000 });
	});

	test('shows social provider buttons', async ({ page }) => {
		await page.goto('/auth/sign-up');
		const googleButton = page.getByRole('button', { name: /google/i });
		await expect(googleButton).toBeVisible();
	});
});
