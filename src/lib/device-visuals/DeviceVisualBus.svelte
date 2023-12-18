<script lang="ts">
    import type {IBusState} from "$lib/backend/Emulator/Bus";

    export let state: IBusState<number, number> | undefined;
</script>

<div class="visual-bus">
    Bus

    {#if (state !== undefined && state.isRead !== undefined)}
        <div>Address: {state.address}</div>
        <div>Value: {state.value}</div>
        <div>Direction: {state.isRead ? "Read" : "Write"}</div>
    {/if}
</div>

<style lang="scss">
  .visual-bus {
    border-color: black;
    border-width: 1px;
    border-style: solid;

    padding: 4px;
  }
</style>