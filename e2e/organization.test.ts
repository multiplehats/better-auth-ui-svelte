import { test, expect } from '@playwright/test';
import { generateTestUser, signUpAndVerify, signIn } from './helpers/auth.js';
import { deleteAllMessages } from './helpers/mailpit.js';

test.describe('Organization Management', () => {
	const owner = generateTestUser();

	test.beforeAll(async ({ browser }) => {
		const page = await browser.newPage();
		await deleteAllMessages();
		await signUpAndVerify(page, owner);
		await page.close();
	});

	test('can navigate to organizations page', async ({ page }) => {
		await signIn(page, owner);
		await page.goto('/app/organization/organizations');
		await page.waitForTimeout(2000);
		const content = await page.textContent('body');
		expect(content).toMatch(/organization|create/i);
	});

	test('organizations page renders', async ({ page }) => {
		await signIn(page, owner);
		await page.goto('/app/organization/organizations');
		// Page should load without error
		await expect(page).not.toHaveURL(/error/);
		await expect(page).toHaveURL(/organization/);
	});
});
