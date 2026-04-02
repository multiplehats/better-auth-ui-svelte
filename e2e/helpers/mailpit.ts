const MAILPIT_API = 'http://localhost:8025/api/v1';

interface MailpitMessage {
	ID: string;
	MessageID: string;
	From: { Name: string; Address: string };
	To: { Name: string; Address: string }[];
	Subject: string;
	Snippet: string;
	Created: string;
	Size: number;
}

interface MailpitSearchResult {
	total: number;
	messages: MailpitMessage[];
}

interface MailpitMessageDetail {
	ID: string;
	Subject: string;
	Text: string;
	HTML: string;
	From: { Name: string; Address: string };
	To: { Name: string; Address: string }[];
}

export async function deleteAllMessages(): Promise<void> {
	await fetch(`${MAILPIT_API}/messages`, { method: 'DELETE' });
}

export async function getMessages(): Promise<MailpitMessage[]> {
	const res = await fetch(`${MAILPIT_API}/messages`);
	const data = (await res.json()) as MailpitSearchResult;
	return data.messages || [];
}

export async function getMessage(id: string): Promise<MailpitMessageDetail> {
	const res = await fetch(`${MAILPIT_API}/message/${id}`);
	return res.json() as Promise<MailpitMessageDetail>;
}

export async function waitForEmail(
	to: string,
	subject?: string,
	timeoutMs = 15_000
): Promise<MailpitMessageDetail> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		const messages = await getMessages();
		for (const msg of messages) {
			const matchesTo = msg.To.some((t) => t.Address === to);
			const matchesSubject = !subject || msg.Subject.includes(subject);
			if (matchesTo && matchesSubject) {
				return getMessage(msg.ID);
			}
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error(
		`Timed out waiting for email to ${to}${subject ? ` with subject "${subject}"` : ''}`
	);
}

export function extractUrlFromEmail(html: string): string | null {
	// Look for href URLs with auth-related paths
	const hrefMatch = html.match(/href="([^"]*(?:verify|reset|magic|callback|token)[^"]*)"/i);
	if (hrefMatch) return hrefMatch[1];

	// Fallback: look for any URL with auth-related paths
	const urlMatch = html.match(
		/(https?:\/\/[^\s<"]+(?:verify|reset|magic|callback|token)[^\s<"]*)/i
	);
	if (urlMatch) return urlMatch[1];

	// Final fallback: first href
	const anyHref = html.match(/href="(https?:\/\/[^"]*)"/i);
	return anyHref?.[1] || null;
}

export function extractOtpFromEmail(text: string): string | null {
	const match = text.match(/\b(\d{6})\b/);
	return match?.[1] || null;
}
