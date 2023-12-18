<script lang="ts">
    import type {ISimpleCPUState} from "$lib/backend/Emulator/Masters/SimpleCPU";

    export let state: ISimpleCPUState | undefined;
</script>

<div class="visual-cpu">
    SimpleCPU
    {#if (state !== undefined)}
        <div>State: {state.state}</div>
        <div>Instruction Pointer: {state.ip}</div>
        <div>Register A: {state.register}</div>
    {/if}
</div>

<style lang="scss">
  .visual-cpu {
    border-color: black;
    border-width: 1px;
    border-style: solid;
  }
</style>