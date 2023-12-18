<script lang="ts">
    import {onMount} from "svelte";
    import {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import type {Writable} from "svelte/store";
    import {get} from "svelte/store";
    import {currentProject, currentTick} from "$lib/backend/ProjectManager";
    import type {IMachineVisualizable} from "$lib/backend/Emulator/MachineSerializable";
    import DeviceVisualGeneric from "$lib/device-visuals/DeviceVisualGeneric.svelte";
    import type {TickReceiver} from "$lib/backend/Emulator/Bus";
    import DeviceVisual from "$lib/device-visuals/DeviceVisual.svelte";

    export let state: { text: string } | undefined;
    export let iconStatus: Writable<ButtonStatusIcon>;

    onMount(() => {
        if (state === undefined) {
            state = {text: "Hello!"};
        }
        console.log(state, get(iconStatus));
    });

    /*
    let drawableDevices = Array.of<IMachineVisualizable & TickReceiver>();
    $: if ($currentProject === undefined) {
        drawableDevices = [];
    } else {
        drawableDevices = [$currentProject.machine._master, $currentProject.machine._masterBus, ...$currentProject.machine._masterBus.devices];
    }
    */
</script>

<div>
    <h1>Machine overview:</h1>

    {#if ($currentProject === undefined)}
        Please, select a project
    {:else}
        {#if (state !== undefined)}
            <div class="machine">
                {#key $currentTick}
                    <DeviceVisual device={$currentProject.machine._master}/>
                    <DeviceVisual device={$currentProject.machine.masterBus}/>
                    <div class="devices">
                        {#each $currentProject.machine._masterBus.devices as device}
                            <DeviceVisual device={device}/>
                        {/each}
                    </div>
                {/key}
            </div>
        {/if}
    {/if}
</div>

<style lang="scss">
  .machine {
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;

    .devices {
      display: flex;
      flex-flow: row nowrap;
      align-items: flex-start;

      > * { // TODO: doesn't work?????
        flex-grow: 1;
        flex-basis: 0;
      }
    }
  }
</style>