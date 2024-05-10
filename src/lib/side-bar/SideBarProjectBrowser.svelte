<script lang="ts">
    import {onMount} from "svelte";
    import type {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import type {Writable} from "svelte/store";
    import {get} from "svelte/store";
    import {currentProject} from "$lib/backend/ProjectManager";
    import ProjectBrowserNodeListing from "$lib/components/ProjectBrowserFolderListing.svelte";
    import type {FSNode} from "$lib/backend/FileSystem";

    export let state: { selected: FSNode[] } | null;
    export let iconStatus: Writable<ButtonStatusIcon>;

    onMount(() => {
        if (state == null) {
            // TODO: save the open folders
            state = {selected: []};
        }
    });
</script>

<div>
    {#if (state != null)}
        {#if $currentProject == null}
            Please, open a project
        {:else}
            <ProjectBrowserNodeListing folder={$currentProject.folder} bind:selected={state.selected}/>
        {/if}
    {/if}
</div>