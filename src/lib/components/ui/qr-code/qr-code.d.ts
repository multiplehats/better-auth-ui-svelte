import { SvelteComponent } from 'svelte';

declare class QRCode extends SvelteComponent {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- SvelteComponent constructor typing
	constructor(options: any);

	$$prop_def: {
		content: string;

		size?: number | string;
		padding?: number | string;
		color?: string;
		bgcolor?: string;
		responsive: 'true' | 'false';
		errorCorrection?: 'L' | 'M' | 'H' | 'Q';
	};
}

export default QRCode;
