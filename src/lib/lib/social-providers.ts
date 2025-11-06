// Simplified provider configuration
// Icon components can be enhanced later with full branded SVGs

export const socialProviders = [
	{
		provider: 'apple',
		name: 'Apple'
	},
	{
		provider: 'discord',
		name: 'Discord'
	},
	{
		provider: 'dropbox',
		name: 'Dropbox'
	},
	{
		provider: 'facebook',
		name: 'Facebook'
	},
	{
		provider: 'github',
		name: 'GitHub'
	},
	{
		provider: 'gitlab',
		name: 'GitLab'
	},
	{
		provider: 'google',
		name: 'Google'
	},
	{
		provider: 'huggingface',
		name: 'Hugging Face'
	},
	{
		provider: 'kick',
		name: 'Kick'
	},
	{
		provider: 'linear',
		name: 'Linear'
	},
	{
		provider: 'linkedin',
		name: 'LinkedIn'
	},
	{
		provider: 'microsoft',
		name: 'Microsoft'
	},
	{
		provider: 'notion',
		name: 'Notion'
	},
	{
		provider: 'reddit',
		name: 'Reddit'
	},
	{
		provider: 'roblox',
		name: 'Roblox'
	},
	{
		provider: 'slack',
		name: 'Slack'
	},
	{
		provider: 'spotify',
		name: 'Spotify'
	},
	{
		provider: 'tiktok',
		name: 'TikTok'
	},
	{
		provider: 'twitch',
		name: 'Twitch'
	},
	{
		provider: 'vk',
		name: 'VK'
	},
	{
		provider: 'twitter',
		name: 'X'
	},
	{
		provider: 'zoom',
		name: 'Zoom'
	}
] as const;

export type Provider = {
	provider: string;
	name: string;
	icon?: any; // Component type - will be added later
};

// Alias for compatibility with generic-oauth-options
export type SocialProviderConfig = Provider;
