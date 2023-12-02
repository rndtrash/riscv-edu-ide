<script lang="ts">
    import {onMount} from "svelte";
    import type {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import type {Writable} from "svelte/store";
    import {get} from "svelte/store";
    import {currentProject} from "$lib/backend/ProjectManager";
    import ProjectBrowserNodeListing from "$lib/components/ProjectBrowserFolderListing.svelte";
    import type {FSNode} from "$lib/backend/FileSystem";

    export let state: { selected: FSNode[] } | undefined;
    export let iconStatus: Writable<ButtonStatusIcon>;

    onMount(() => {
        if (state === undefined) {
            // TODO: save the open folders
            state = {selected: []};
        }
    });
</script>

<div>
    {#if (state !== undefined)}
        {#if $currentProject === undefined}
            Please, open a project
        {:else}
            <ProjectBrowserNodeListing folder={$currentProject.folder} bind:selected={state.selected}/>
        {/if}
    {/if}
</div>