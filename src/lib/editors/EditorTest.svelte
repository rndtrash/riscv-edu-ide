<script lang="ts">
    import {onMount} from "svelte";
    import type {EditorTabFunctions} from "$lib/editors/EditorTab";

    export let state: { text: string } & EditorTabFunctions | undefined;
    export let hasChanges: boolean;
    export let filePath: string;
    $: hasChanges = state?.text !== "Hello";

    onMount(() => {
        if (state === undefined) {
            state = {
                text: "Hello",

                save() {
                    console.log("test editor save")
                },

                close() {
                    console.log("test editor close")
                }
            };
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