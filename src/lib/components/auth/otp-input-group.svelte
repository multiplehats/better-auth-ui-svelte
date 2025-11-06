<script lang="ts">
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';

	interface PinInputCell {
		char: string | null | undefined;
		isActive: boolean;
		hasFakeCaret: boolean;
	}

	interface Props {
		otpSeparators?: 0 | 1 | 2;
		class?: string;
		cells: PinInputCell[];
	}

	let { otpSeparators = 0, class: className, cells }: Props = $props();
</script>

{#if otpSeparators === 0}
	<InputOTP.Group>
		<InputOTP.Slot cell={cells[0]} class={className} />
		<InputOTP.Slot cell={cells[1]} class={className} />
		<InputOTP.Slot cell={cells[2]} class={className} />
		<InputOTP.Slot cell={cells[3]} class={className} />
		<InputOTP.Slot cell={cells[4]} class={className} />
		<InputOTP.Slot cell={cells[5]} class={className} />
	</InputOTP.Group>
{:else if otpSeparators === 1}
	<InputOTP.Group>
		<InputOTP.Slot cell={cells[0]} class={className} />
		<InputOTP.Slot cell={cells[1]} class={className} />
		<InputOTP.Slot cell={cells[2]} class={className} />
	</InputOTP.Group>

	<InputOTP.Separator />

	<InputOTP.Group>
		<InputOTP.Slot cell={cells[3]} class={className} />
		<InputOTP.Slot cell={cells[4]} class={className} />
		<InputOTP.Slot cell={cells[5]} class={className} />
	</InputOTP.Group>
{:else}
	<InputOTP.Group>
		<InputOTP.Slot cell={cells[0]} class={className} />
		<InputOTP.Slot cell={cells[1]} class={className} />
	</InputOTP.Group>

	<InputOTP.Separator />

	<InputOTP.Group>
		<InputOTP.Slot cell={cells[2]} class={className} />
		<InputOTP.Slot cell={cells[3]} class={className} />
	</InputOTP.Group>

	<InputOTP.Separator />

	<InputOTP.Group>
		<InputOTP.Slot cell={cells[4]} class={className} />
		<InputOTP.Slot cell={cells[5]} class={className} />
	</InputOTP.Group>
{/if}
