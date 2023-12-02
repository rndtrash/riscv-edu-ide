<script lang="ts">
    import {FSFolder} from "$lib/backend/FileSystem";

    export let folder: FSFolder;
</script>

<div class="folder">
    <div>{folder.name}</div>
    <div class="children">
        {#each folder.children as child}
            {#if child instanceof FSFolder}
                <svelte:self folder={child}/>
            {:else}
                <div>{child.name}</div>
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