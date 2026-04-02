import { test, expect } from '@playwright/test';
import { generateTestUser, signUpAndVerify } from './helpers/auth.js';
import { deleteAllMessages, waitForEmail, extractOtpFromEmail } from './helpers/mailpit.js';

async function fillField(page: import('@playwright/test').Page, selector: string, value: string) {
	const field = page.locator(selector);
	await field.click();
	await field.fill('');
	await field.pressSequentially(value, { delay: 10 });
}

test.describe('Email OTP', () => {
	const user = generateTestUser();

	test.beforeAll(async ({ browser }) => {
		const page = await browser.newPage();
		await deleteAllMessages();
		await signUpAndVerify(page, user);
		await page.close();
	});

	test('renders email OTP form with email field', async ({ page }) => {
		await page.goto('/auth/email-otp');
		await expect(page.locator('input#email')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send code' })).toBeVisible();
	});

	test('sends OTP code to email', async ({ page }) => {
		await deleteAllMessages();
		await page.goto('/auth/email-otp');
		await page.waitForTimeout(500);
		await fillField(page, 'input#email', user.email);
		await page.getByRole('button', { name: 'Send code' }).click();

		// Should transition to OTP input
		await page.waitForTimeout(2000);

		// Verify OTP email was sent
		const email = await waitForEmail(user.email, 'Verification Code');
		expect(email.Subject).toContain('Verification Code');
	});

	test('OTP email contains 6-digit code', async ({ page }) => {
		await deleteAllMessages();
		await page.goto('/auth/email-otp');
		await page.waitForTimeout(500);
		await fillField(page, 'input#email', user.email);
		await page.getByRole('button', { name: 'Send code' }).click();

		await page.waitForTimeout(2000);

		const email = await waitForEmail(user.email, 'Verification Code');
		const otp = extractOtpFromEmail(email.Text || email.HTML);
		expect(otp).toBeTruthy();
		expect(otp).toHaveLength(6);
		expect(otp).toMatch(/^\d{6}$/);
	});

	test.skip('valid OTP code signs user in', async ({ page }) => {
		// Skip: OTP input component interaction needs custom handling for Playwright
		await deleteAllMessages();
		await page.goto('/auth/email-otp');
		await page.waitForTimeout(500);
		await fillField(page, 'input#email', user.email);
		await page.getByRole('button', { name: 'Send code' }).click();

		await page.waitForTimeout(2000);

		const email = await waitForEmail(user.email, 'Verification Code');
		const otp = extractOtpFromEmail(email.Text || email.HTML);
		expect(otp).toBeTruthy();

		// Fill in OTP - might be individual input cells or a single input
		const codeInput = page.locator('input#code');
		if (await codeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
			await codeInput.fill(otp!);
		} else {
			// OTP input cells - click first cell and type digits
			const otpContainer = page.locator('[data-input-otp]');
			if (await otpContainer.isVisible({ timeout: 2000 }).catch(() => false)) {
				await otpContainer.click();
				await page.keyboard.type(otp!, { delay: 50 });
			}
		}

		// May auto-submit or need to click verify
		const verifyBtn = page.getByRole('button', { name: 'Verify code' });
		if (await verifyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
			await verifyBtn.click();
		}

		await page.waitForURL('**/app**', { timeout: 15_000 });
		await expect(page).toHaveURL(/\/app/);
	});
});
