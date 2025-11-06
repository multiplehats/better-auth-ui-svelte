import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter() {
	if (!transporter) {
		transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST || 'localhost',
			port: parseInt(process.env.SMTP_PORT || '1025'),
			secure: false, // true for 465, false for other ports
			auth:
				process.env.SMTP_USER && process.env.SMTP_PASS
					? {
							user: process.env.SMTP_USER,
							pass: process.env.SMTP_PASS
						}
					: undefined,
			// Allow self-signed certificates in development
			tls: {
				rejectUnauthorized: false
			}
		});
	}
	return transporter;
}

interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
	const transporter = getTransporter();

	const info = await transporter.sendMail({
		from: process.env.SMTP_FROM || '"Better Auth Demo" <noreply@example.com>',
		to,
		subject,
		text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags as fallback
		html
	});

	console.log('Message sent: %s', info.messageId);
	return info;
}

export async function sendMagicLinkEmail(email: string, url: string) {
	await sendEmail({
		to: email,
		subject: 'Your Magic Link',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.button {
						display: inline-block;
						padding: 12px 24px;
						background-color: #007bff;
						color: white;
						text-decoration: none;
						border-radius: 4px;
						margin: 20px 0;
					}
					.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
				</style>
			</head>
			<body>
				<div class="container">
					<h2>Sign in to your account</h2>
					<p>Click the button below to sign in to your account. This link will expire in 15 minutes.</p>
					<a href="${url}" class="button">Sign In</a>
					<p>Or copy and paste this URL into your browser:</p>
					<p style="word-break: break-all; color: #666;">${url}</p>
					<div class="footer">
						<p>If you didn't request this email, you can safely ignore it.</p>
					</div>
				</div>
			</body>
			</html>
		`,
		text: `Sign in to your account\n\nClick the link below to sign in:\n${url}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this email, you can safely ignore it.`
	});
}

export async function sendOTPEmail(email: string, otp: string) {
	await sendEmail({
		to: email,
		subject: 'Your Verification Code',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.otp-code {
						font-size: 32px;
						font-weight: bold;
						letter-spacing: 8px;
						padding: 20px;
						background-color: #f8f9fa;
						border-radius: 8px;
						text-align: center;
						margin: 20px 0;
						font-family: monospace;
					}
					.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
				</style>
			</head>
			<body>
				<div class="container">
					<h2>Verify your email</h2>
					<p>Enter this verification code to complete your sign in:</p>
					<div class="otp-code">${otp}</div>
					<p>This code will expire in 10 minutes.</p>
					<div class="footer">
						<p>If you didn't request this code, you can safely ignore it.</p>
					</div>
				</div>
			</body>
			</html>
		`,
		text: `Verify your email\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore it.`
	});
}
