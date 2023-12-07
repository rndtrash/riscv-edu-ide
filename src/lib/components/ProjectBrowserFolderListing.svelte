<script lang="ts">
    import {FSFolder, FSNode} from "$lib/backend/FileSystem";
    import ProjectBrowserNodeListing from "$lib/components/ProjectBrowserNodeListing.svelte";
    import Icon from "$lib/components/Icon.svelte";

    export let folder: FSFolder;
    export let selected: FSNode[];

    // TODO: folder folding-unfolding

    function newFile() {
        let name: string | null = prompt("Name of a new file:");
        if (name == null)
            return;

        folder.NewFile(name);
        folder = folder;
    }

    function newFolder() {
        let name: string | null = prompt("Name of a new folder:");
        if (name == null)
            return;

        folder.NewFolder(name);
        folder = folder;
    }
</script>

<div class="folder">
    <span>
        <ProjectBrowserNodeListing node={folder} bind:selected/>
        <button on:click={newFile}><Icon icon="note_add" alt="Create a new file"/></button>
        <button on:click={newFolder}><Icon icon="create_new_folder" alt="Create a new folder"/></button>
    </span>
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

    align-items: stretch;

    > span {
      display: flex;
      flex-flow: row nowrap;

      > button:first-child {
        flex-grow: 1;
      }
    }

    > .children {
      display: flex;
      flex-flow: column nowrap;

      padding-left: 16px;
    }
  }
</style>