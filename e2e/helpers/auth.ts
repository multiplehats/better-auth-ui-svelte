import type { Page } from '@playwright/test';
import { deleteAllMessages, waitForEmail, extractUrlFromEmail } from './mailpit.js';

let userCounter = 0;

export function generateTestUser() {
	userCounter++;
	const timestamp = Date.now();
	return {
		name: `Test User ${userCounter}`,
		email: `testuser-${timestamp}-${userCounter}@example.com`,
		password: 'TestPassword123!'
	};
}

/**
 * Fill a form field by clicking, clearing, then typing character by character.
 * This ensures TanStack form's oninput/onchange handlers fire properly.
 */
export async function fillField(
	page: Page,
	selector: string,
	value: string
): Promise<void> {
	const field = page.locator(selector);
	await field.click();
	// Clear existing value
	await page.keyboard.press('Meta+a');
	await page.keyboard.press('Backspace');
	await field.pressSequentially(value, { delay: 10 });
	// Trigger blur to ensure onchange fires
	await field.evaluate((el) => el.dispatchEvent(new Event('change', { bubbles: true })));
}

export async function signUp(
	page: Page,
	user: { name: string; email: string; password: string }
): Promise<void> {
	await page.goto('/auth/sign-up');
	await page.waitForTimeout(2000);
	await fillField(page, 'input#name', user.name);
	await fillField(page, 'input#email', user.email);
	await fillField(page, 'input#password', user.password);
	await page.getByRole('button', { name: 'Create an account' }).click();
}

export async function signUpAndVerify(
	page: Page,
	user: { name: string; email: string; password: string }
): Promise<void> {
	await deleteAllMessages();
	await signUp(page, user);

	// Wait for redirect to verify-email page
	await page.waitForURL('**/verify-email**', { timeout: 15_000 });

	// Wait for verification email
	const email = await waitForEmail(user.email);
	const verifyUrl = extractUrlFromEmail(email.HTML);
	if (!verifyUrl) throw new Error('No verification URL found in email');

	// Visit verification URL to verify the email
	await page.goto(verifyUrl);
	await page.waitForTimeout(2000);
}

export async function signIn(
	page: Page,
	user: { email: string; password: string }
): Promise<void> {
	await page.goto('/auth/sign-in');
	await page.waitForTimeout(2000);
	await fillField(page, 'input#email', user.email);
	await fillField(page, 'input#password', user.password);
	await page.getByRole('button', { name: 'Login' }).click();

	await page.waitForURL('**/app**', { timeout: 25_000 });
}

export async function signOut(page: Page): Promise<void> {
	await page.goto('/auth/sign-out');
	const signOutBtn = page.getByRole('button', { name: /sign out/i });
	if (await signOutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
		await signOutBtn.click();
	}
	await page.waitForTimeout(2000);
}
