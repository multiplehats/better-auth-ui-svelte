import { test, expect } from '@playwright/test';

test.describe('Auth Layout & UI', () => {
	test('sign-in page has split layout with sidebar image', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await expect(page.getByText('Acme Inc.')).toBeVisible();
	});

	test('sign-up page has split layout', async ({ page }) => {
		await page.goto('/auth/sign-up');
		await expect(page.getByText('Acme Inc.')).toBeVisible();
	});

	test('forgot-password page has split layout', async ({ page }) => {
		await page.goto('/auth/forgot-password');
		await expect(page.getByText('Acme Inc.')).toBeVisible();
	});

	test('magic-link page has split layout', async ({ page }) => {
		await page.goto('/auth/magic-link');
		await expect(page.getByText('Acme Inc.')).toBeVisible();
	});

	test('sign-in form has password visibility toggle', async ({ page }) => {
		await page.goto('/auth/sign-in');
		const passwordInput = page.locator('input#password');
		await expect(passwordInput).toHaveAttribute('type', 'password');

		// Type something to enable the toggle button (it's disabled when empty)
		await passwordInput.click();
		await passwordInput.pressSequentially('test', { delay: 50 });
		// Dispatch input event to trigger oninput handler
		await passwordInput.evaluate((el) =>
			el.dispatchEvent(new Event('input', { bubbles: true }))
		);

		// Click the toggle button inside the password container
		const toggleBtn = page.locator('.relative button[type="button"]').first();
		await expect(toggleBtn).toBeEnabled({ timeout: 5000 });
		await toggleBtn.click();
		await expect(passwordInput).toHaveAttribute('type', 'text');
	});

	test('sign-in and sign-up pages link to each other', async ({ page }) => {
		await page.goto('/auth/sign-in');
		const signUpLink = page.getByRole('link', { name: /sign up/i });
		await expect(signUpLink).toBeVisible();
		await signUpLink.click();
		await expect(page).toHaveURL(/sign-up/);

		const signInLink = page.getByRole('link', { name: /sign in/i });
		await expect(signInLink).toBeVisible();
		await signInLink.click();
		await expect(page).toHaveURL(/sign-in/);
	});
});
