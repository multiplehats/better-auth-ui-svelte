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
import { BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';

export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword(data) {
			// Implement your email sending logic here
			console.log('\n┌─────────────────────────────────────────┐');
			console.log('│  🔐 PASSWORD RESET EMAIL                │');
			console.log('├─────────────────────────────────────────┤');
			console.log(`│  To: ${data.user.email}`);
			console.log('│  URL (click to open):');
			console.log(`│  ${data.url}`);
			console.log('└─────────────────────────────────────────┘\n');

			return Promise.resolve();
		}
	},
	emailVerification: {
		autoSignInAfterVerification: false,
		sendVerificationEmail(data) {
			// Implement your email sending logic here
			console.log('\n┌─────────────────────────────────────────┐');
			console.log('│  ✉️  EMAIL VERIFICATION                 │');
			console.log('├─────────────────────────────────────────┤');
			console.log(`│  To: ${data.user.email}`);
			console.log('│  Verification URL (click to open):');
			console.log(`│  ${data.url}`);
			console.log('└─────────────────────────────────────────┘\n');

			return Promise.resolve();
		}
	},
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	socialProviders: {
		google: {
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		}
	},
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
				console.log('\n┌─────────────────────────────────────────┐');
				console.log('│  🪄  MAGIC LINK EMAIL                   │');
				console.log('├─────────────────────────────────────────┤');
				console.log(`│  To: ${data.email}`);
				console.log('│  Magic Link URL (click to open):');
				console.log(`│  ${data.url}`);
				console.log('└─────────────────────────────────────────┘\n');

				await sendMagicLinkEmail(data.email, data.url);
			}
		}),
		emailOTP({
			async sendVerificationOTP(data) {
				console.log('\n┌─────────────────────────────────────────┐');
				console.log('│  🔢  OTP VERIFICATION EMAIL             │');
				console.log('├─────────────────────────────────────────┤');
				console.log(`│  To: ${data.email}`);
				console.log('│  One-Time Password (copy):');
				console.log(`│  ${data.otp}`);
				console.log('└─────────────────────────────────────────┘\n');
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
