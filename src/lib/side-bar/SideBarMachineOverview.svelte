<script lang="ts">
    import {onMount} from "svelte";
    import {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import type {Writable} from "svelte/store";
    import {get} from "svelte/store";
    import {currentProject, currentTick} from "$lib/backend/ProjectManager";
    import type {IMachineVisualizable} from "$lib/backend/Emulator/MachineSerializable";
    import DeviceVisualGeneric from "$lib/device-visuals/DeviceVisualGeneric.svelte";
    import type {TickReceiver} from "$lib/backend/Emulator/Bus";

    export let state: { text: string } | undefined;
    export let iconStatus: Writable<ButtonStatusIcon>;

    onMount(() => {
        console.log("onmount");
        if (state === undefined) {
            console.log("undefined");
            state = {text: "Hello!"};
        }
        console.log(state, get(iconStatus));
    });

    // $: {
    //     let l = state?.text?.length ?? 0;
    //     if (l > 15)
    //         iconStatus.set(ButtonStatusIcon.Info);
    //     else if (l > 10)
    //         iconStatus.set(ButtonStatusIcon.Warning);
    //     else if (l > 5)
    //         iconStatus.set(ButtonStatusIcon.Error);
    //     else
    //         iconStatus.set(ButtonStatusIcon.None);
    // }

    let drawableDevices = Array.of<IMachineVisualizable & TickReceiver>();
    $: if ($currentProject === undefined) {
        drawableDevices = [];
    } else {
        drawableDevices = [$currentProject.machine._master, $currentProject.machine._masterBus, ...$currentProject.machine._masterBus.devices];
    }

    function getDeviceKey(device: IMachineVisualizable & TickReceiver): any {
        console.log("getkey")
        if (device.svelteComponent === undefined)
            return device.lastTick;
        else
            return device.getState();
    }
</script>

<div>
    <h1>Machine overview:</h1>

    {#if ($currentProject === undefined)}
        Please, select a project
    {:else}
        {#if (state !== undefined)}
            {#key $currentTick}
                <div class="devices">
                    {#each drawableDevices as device}
                        {#if (device.svelteComponent !== undefined)}
                            <svelte:component this={device.svelteComponent} state={device.getState()}/>
                        {:else}
                            <DeviceVisualGeneric device={device}/>
                        {/if}
                    {/each}
                </div>
            {/key}
        {/if}
    {/if}
</div>

<style lang="scss">
</style>