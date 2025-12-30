<script module lang="ts">
	export interface Props {
		content?: string;
		size?: string;
		padding?: string;
		color?: string;
		bgcolor?: string;
		responsive?: string;
		errorCorrection?: string;
	}
</script>

<script lang="ts">
	import { QRCode } from './qr-code.js';
	import type { Options } from './qr-code.js';

	let {
		content = '',
		size = '150',
		padding = '4',
		color = '#000000',
		bgcolor = '#ffffff',
		responsive = 'false',
		errorCorrection = 'M'
	} = $props();

	let opt: Options = {
		content: content,
		padding: parseInt(padding),
		width: parseInt(size),
		height: parseInt(size),
		typeNumber: 4,
		color: color,
		background: bgcolor,
		ecl: errorCorrection,
		container: responsive.toLowerCase() == 'true' ? 'svg-viewbox' : 'svg',
		join: true
	};

	let qrCode = new QRCode(opt);
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html qrCode.svg()}
