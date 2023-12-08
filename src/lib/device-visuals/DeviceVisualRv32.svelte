<script lang="ts">
    import type {IRv32State} from "$lib/backend/Emulator/Masters/RISCV32";

    export let state: IRv32State | undefined;
</script>

<div class="visual-cpu">
    RISC-V 32bit
    {#if (state !== undefined)}
        {#each state.registers as register, i}
            <div>Register {i} = 0x{register.toString(16).padStart(8, "0")}</div>
        {/each}
    {/if}
</div>

<style lang="scss">
    .visual-cpu {
      border-color: black;
      border-width: 1px;
      border-style: solid;
    }
</style>