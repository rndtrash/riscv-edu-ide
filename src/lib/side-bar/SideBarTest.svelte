<script lang="ts">
    import {onMount} from "svelte";

    export var state: { text: string } | undefined;

    onMount(() => {
        console.log("onmount");
        if (state === undefined) {
            console.log("undefined");
            state = {text: "Hello!"};
        }
        console.log(state);
    });
</script>

{#if (state !== undefined)}
    <div>
        <input type="text" bind:value={state.text}/>
        Side Bar Tool
    </div>
{/if}