<script lang="ts">
    import {onMount} from "svelte";

    export let state: { text: string } | undefined;
    export let hasChanges: boolean;
    export let filePath: string;
    $: hasChanges = state?.text !== "Hello";

    onMount(() => {
        if (state === undefined) {
            state = {text: "Hello"};
            hasChanges = false;
        }
    });
</script>

{#if (state !== undefined)}
    <div>
        Editing {filePath}:
        <input type="text" bind:value={state.text}/>
        Cool Editor
    </div>
{/if}