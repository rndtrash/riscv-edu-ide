<script lang="ts">
    import {onMount} from "svelte";
    import {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import type {Writable} from "svelte/store";
    import {get} from "svelte/store";

    export let state: { text: string } | null;
    export let iconStatus: Writable<ButtonStatusIcon>;

    onMount(() => {
        console.log("onmount");
        if (state == null) {
            console.log("undefined");
            state = {text: "Hello!"};
        }
        console.log(state, get(iconStatus));
    });

    $: {
        let l = state?.text?.length ?? 0;
        if (l > 15)
            iconStatus.set(ButtonStatusIcon.Info);
        else if (l > 10)
            iconStatus.set(ButtonStatusIcon.Warning);
        else if (l > 5)
            iconStatus.set(ButtonStatusIcon.Error);
        else
            iconStatus.set(ButtonStatusIcon.None);
    }
</script>

{#if (state != null)}
    <div>
        <input type="text" bind:value={state.text}/>
        Side Bar Tool
    </div>
{/if}