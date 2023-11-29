<script lang="ts">
    import type {SideBarToolPair} from "$lib/side-bar/SideBarTool";
    import IconButton from "$lib/components/IconButton.svelte";

    export let buttons: SideBarToolPair[] = [];
    let currentButton = -1;
    export let sideBarTool: SideBarToolPair | undefined;
    $: sideBarTool = currentButton >= 0 ? buttons[currentButton] : undefined;
</script>

{#each buttons as button, index}
    <IconButton icon={button.icon}
                alt={button.name}
                status={button.iconStatus}
                active={currentButton === index}
                on:click={() => currentButton = currentButton === index ? -1 : index}/>
{/each}