<script lang="ts">
    import {onMount} from "svelte";
    import type {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import type {Writable} from "svelte/store";
    import {get} from "svelte/store";
    import {currentProject} from "$lib/backend/ProjectManager";
    import ProjectBrowserNodeListing from "$lib/components/ProjectBrowserNodeListing.svelte";
    import type {FSNode} from "$lib/backend/FileSystem";

    export let state: { text: string } | undefined;
    export let iconStatus: Writable<ButtonStatusIcon>;

    onMount(() => {
        console.log("onmount");
        if (state === undefined) {
            console.log("undefined");
            // TODO: save the open folders
            state = {text: "Hello!"};
        }
        console.log(state, get(iconStatus));
    });

    let selected: FSNode[] = [];
</script>

<div on:fsSelect={(file) => console.log(file)}>
    {#if (state !== undefined)}
        {#if $currentProject === undefined}
            Please, open a project
        {:else}
            <ProjectBrowserNodeListing folder={$currentProject.folder} bind:selected/>
        {/if}
    {/if}
</div>