<script lang="ts">
    import DeviceVisualGeneric from "$lib/device-visuals/DeviceVisualGeneric.svelte";
    import type {IMachineVisualizable} from "$lib/backend/Emulator/MachineSerializable";
    import type {TickReceiver} from "$lib/backend/Emulator/Bus";

    export let device: IMachineVisualizable & TickReceiver;
</script>

{#if (device.svelteComponent !== undefined)}
    <svelte:component this={device.svelteComponent} state={device.getState()}/>
{:else}
    <DeviceVisualGeneric device={device}/>
{/if}