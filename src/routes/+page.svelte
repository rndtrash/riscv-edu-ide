<script lang="ts">
    import IDERoot from "$lib/components/IDERoot.svelte";
    import {initializeFS} from "$lib/backend/FileSystem";

    let isInitialized = false;

    $: initializeFS().then(() => isInitialized = true);
</script>

{#if isInitialized}
    <IDERoot/>
{:else}
    Loading the filesystem, please wait...
{/if}