import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/index.js';
import {
	organization,
	apiKey,
	oneTimeToken,
	twoFactor,
	username,
	magicLink,
	emailOTP,
	lastLoginMethod
} from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';

/**
 * This is NOT included in the libary files.
 * This is merely a full example, used in the `routes/demo`.
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	plugins: [
		organization({
			teams: {
				enabled: true
			}
		}),
		apiKey(),
		oneTimeToken(),
		twoFactor(),
		username(),
		magicLink({
			sendMagicLink(data) {
				// Implement your email sending logic here
				console.log('Send magic link to:', data);
			}
		}),
		emailOTP({
			sendVerificationOTP(data) {
				// Implement your email sending logic here
				console.log('Send email OTP to:', data);

				return Promise.resolve();
			}
		}),
		lastLoginMethod(),
		passkey()
	]
});
