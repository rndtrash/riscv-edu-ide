<script lang="ts">
    export let state: Uint32Array;
</script>

<div class="visual-ram">
    RAM32
    {#if (state !== undefined)}
        {#each state as value, i}
            <div>{i * 4} = 0x{value.toString(16).padStart(8, "0")}</div>
        {/each}
    {/if}
</div>

<style lang="scss">
  .visual-ram {
    border-color: black;
    border-width: 1px;
    border-style: solid;

    padding: 4px;
  }
</style>