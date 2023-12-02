<script lang="ts">
    import {FSFolder, FSNode} from "$lib/backend/FileSystem";
    import ProjectBrowserNodeListing from "$lib/components/ProjectBrowserNodeListing.svelte";

    export let folder: FSFolder;
    export let selected: FSNode[];

    // TODO: folder folding-unfolding
</script>

<div class="folder">
    <ProjectBrowserNodeListing node={folder} bind:selected/>
    <div class="children">
        {#each folder.children as child}
            {#if child instanceof FSFolder}
                <svelte:self folder={child} bind:selected/>
            {:else}
                <ProjectBrowserNodeListing node={child} bind:selected/>
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