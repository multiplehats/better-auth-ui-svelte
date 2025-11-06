import { betterAuth, type OAuth2Tokens } from 'better-auth';
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
	lastLoginMethod,
	oneTap,
	anonymous,
	multiSession,
	genericOAuth
} from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { sendMagicLinkEmail, sendOTPEmail } from './email.js';

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
			async sendMagicLink(data) {
				await sendMagicLinkEmail(data.email, data.url);
			}
		}),
		emailOTP({
			async sendVerificationOTP(data) {
				await sendOTPEmail(data.email, data.otp);
			}
		}),
		lastLoginMethod(),
		passkey(),
		oneTap(),
		genericOAuth({
			config: [
				{
					providerId: 'custom-provider',

					clientId: 'YOUR_CLIENT_ID',
					getUserInfo: async (tokens) => {
						/**
						 * Fake function to simulate fetching user info from a custom OAuth2 provider
						 */
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const fetchUserInfoFromCustomProvider = async (_tokens: OAuth2Tokens) => {
							return {
								sub: 'user123',
								email: 'user123@example.com',
								name: 'User 123',
								email_verified: true
							};
						};

						// Custom logic to fetch and return user info
						const userInfo = await fetchUserInfoFromCustomProvider(tokens);
						return {
							id: userInfo.sub,
							email: userInfo.email,
							name: userInfo.name,
							emailVerified: userInfo.email_verified
							// ... map other fields as needed
						};
					}
				}
			]
		}),
		anonymous(),
		multiSession()
	]
});
