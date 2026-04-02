import { test, expect } from '@playwright/test';
import { generateTestUser, signUpAndVerify, signIn } from './helpers/auth.js';
import { deleteAllMessages } from './helpers/mailpit.js';

test.describe('Account Settings', () => {
	const user = generateTestUser();

	test.beforeAll(async ({ browser }) => {
		const page = await browser.newPage();
		await deleteAllMessages();
		await signUpAndVerify(page, user);
		await page.close();
	});

	test.beforeEach(async ({ page }) => {
		await signIn(page, user);
	});

	test('can navigate to account settings and see profile', async ({ page }) => {
		await page.goto('/app/account/settings');
		await expect(page.getByText(user.name).first()).toBeVisible({ timeout: 10_000 });
	});

	test('can navigate to security page', async ({ page }) => {
		await page.goto('/app/account/security');
		// Security page should have password or session related content
		await page.waitForTimeout(2000);
		const content = await page.textContent('body');
		expect(content).toMatch(/password|session|security/i);
	});

	test('can navigate to API keys page', async ({ page }) => {
		await page.goto('/app/account/api-keys');
		await expect(
			page.getByText(/api key/i).first()
		).toBeVisible({ timeout: 10_000 });
	});
});
