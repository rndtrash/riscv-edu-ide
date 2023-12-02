<script lang="ts">
    import {FSFolder, FSNode} from "$lib/backend/FileSystem";
    import {createEventDispatcher} from "svelte";

    export let folder: FSFolder;
    export let selected: FSNode[];

    const dispatch = createEventDispatcher();
</script>

<div class="folder">
    <button on:click={(e) => dispatch('fsSelect', folder)}>{folder.name}</button>
    <div class="children">
        {#each folder.children as child}
            {#if child instanceof FSFolder}
                <svelte:self folder={child} bind:selected on:fsSelect/>
            {:else}
                <button on:click={(e) => dispatch('fsSelect', child)}>{child.name}</button>
            {/if}
        {/each}
    </div>
</div>

<style lang="scss">
  .folder {
    display: flex;
    flex-flow: column nowrap;

    > .children {
      display: flex;
      flex-flow: column nowrap;

      padding-left: 16px;
    }
  }
</style>