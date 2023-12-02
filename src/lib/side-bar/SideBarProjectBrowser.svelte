<script lang="ts">
    import {onMount} from "svelte";
    import type {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import type {Writable} from "svelte/store";
    import {get} from "svelte/store";
    import {currentProject} from "$lib/backend/ProjectManager";
    import ProjectBrowserNodeListing from "$lib/components/ProjectBrowserNodeListing.svelte";

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
</script>

{#if (state !== undefined)}
    <div>
        {#if $currentProject === undefined}
            Please, open a project
        {:else}
            <ProjectBrowserNodeListing folder={$currentProject.folder}/>
        {/if}
    </div>
{/if}