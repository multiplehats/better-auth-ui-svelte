import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { apiKey } from '@better-auth/api-key';
import { db } from './db/index.js';
import {
	organization,
	oneTimeToken,
	twoFactor,
	username,
	magicLink,
	emailOTP,
	lastLoginMethod,
	oneTap,
	anonymous,
	multiSession,
	admin
} from 'better-auth/plugins';
import { passkey } from '@better-auth/passkey';
import { sendEmail, sendMagicLinkEmail, sendOTPEmail } from './email.js';
import { BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';

export const auth = betterAuth({
	baseURL: BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		async sendResetPassword(data) {
			console.log('\n┌─────────────────────────────────────────┐');
			console.log('│  🔐 PASSWORD RESET EMAIL                │');
			console.log('├─────────────────────────────────────────┤');
			console.log(`│  To: ${data.user.email}`);
			console.log('│  URL (click to open):');
			console.log(`│  ${data.url}`);
			console.log('└─────────────────────────────────────────┘\n');

			await sendEmail({
				to: data.user.email,
				subject: 'Reset Your Password',
				html: `<div><h2>Reset your password</h2><p>Click the link below to reset your password.</p><a href="${data.url}">Reset Password</a><p>${data.url}</p></div>`
			});
		}
	},
	emailVerification: {
		autoSignInAfterVerification: false,
		async sendVerificationEmail(data) {
			console.log('\n┌─────────────────────────────────────────┐');
			console.log('│  ✉️  EMAIL VERIFICATION                 │');
			console.log('├─────────────────────────────────────────┤');
			console.log(`│  To: ${data.user.email}`);
			console.log('│  Verification URL (click to open):');
			console.log(`│  ${data.url}`);
			console.log('└─────────────────────────────────────────┘\n');

			await sendEmail({
				to: data.user.email,
				subject: 'Verify Your Email',
				html: `<div><h2>Verify your email</h2><p>Click the link below to verify your email address.</p><a href="${data.url}">Verify Email</a><p>${data.url}</p></div>`
			});
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
		admin(),
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
		anonymous(),
		multiSession()
	]
});
