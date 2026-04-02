import { test, expect } from '@playwright/test';

test.describe('Protected Routes & Navigation', () => {
	test('home page loads successfully', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1').first()).toBeVisible();
	});

	test('unauthenticated user is redirected from /app to sign-in', async ({ page }) => {
		await page.goto('/app');
		await page.waitForURL('**/auth/sign-in**', { timeout: 10_000 });
		await expect(page).toHaveURL(/auth\/sign-in/);
	});

	test('unauthenticated user is redirected from account settings', async ({ page }) => {
		await page.goto('/app/account/settings');
		await page.waitForURL('**/auth/sign-in**', { timeout: 10_000 });
	});

	test('unauthenticated user is redirected from organization pages', async ({ page }) => {
		await page.goto('/app/organization/members');
		await page.waitForURL('**/auth/sign-in**', { timeout: 10_000 });
	});

	test('sign-in page loads without redirect for unauthenticated user', async ({ page }) => {
		await page.goto('/auth/sign-in');
		await expect(page.locator('input#email')).toBeVisible();
	});

	test('sign-up page loads without redirect for unauthenticated user', async ({ page }) => {
		await page.goto('/auth/sign-up');
		await expect(page.locator('input#email')).toBeVisible();
	});

	test('magic-link page loads for unauthenticated user', async ({ page }) => {
		await page.goto('/auth/magic-link');
		await expect(page.locator('input#email')).toBeVisible();
	});

	test('forgot-password page loads for unauthenticated user', async ({ page }) => {
		await page.goto('/auth/forgot-password');
		await expect(page.locator('input#email')).toBeVisible();
	});
});
