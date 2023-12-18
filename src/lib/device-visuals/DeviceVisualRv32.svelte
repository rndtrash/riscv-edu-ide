<script lang="ts">
    import type {IRv32State} from "$lib/backend/Emulator/Masters/RISCV32";

    export let state: IRv32State | undefined;
</script>

<div class="visual-cpu">
    RISC-V 32bit
    {#if (state !== undefined)}
        <div class="registers">
            {#each state.registers as register, i}
                <div>Register {i} = 0x{register.toString(16).padStart(8, "0")}</div>
            {/each}
        </div>
    {/if}
</div>

<style lang="scss">
  .visual-cpu {
    border-color: black;
    border-width: 1px;
    border-style: solid;

    padding: 4px;

    .registers {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(8, 1fr);
      grid-column-gap: 4px;
      grid-row-gap: 4px;
      padding: 4px;

      div {
        border: 1px solid black;

        padding: 2px;
      }
    }
  }
</style>