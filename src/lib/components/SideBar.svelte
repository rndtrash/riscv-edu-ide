<script lang="ts">
    import SideBarTest from "$lib/side-bar/SideBarTest.svelte";
    import type {SideBarToolPair} from "$lib/side-bar/SideBarTool";
    import IconButton from "$lib/components/IconButton.svelte";
    import type {Writable} from "svelte/store";
    import {writable} from "svelte/store";

    let buttonsTop = writable([
        {
            type: SideBarTest,
            name: "Side Bar Test",
            icon: "folder",
            state: writable({text: ""})
        },
        {
            type: SideBarTest,
            name: "Side Bar Test 2",
            icon: "folder",
            state: writable({text: ""})
        }]);
    let currentButtonTop = -1;
    export let sideBarToolTop: SideBarToolPair | undefined;
    $: sideBarToolTop = currentButtonTop >= 0 ? $buttonsTop[currentButtonTop] : undefined;

    let buttonsBottom = writable([
        {
            type: SideBarTest,
            name: "Side Bar Test",
            icon: "folder",
            state: writable({text: ""})
        },
        {
            type: SideBarTest,
            name: "Side Bar Test 2",
            icon: "folder",
            state: writable({text: ""})
        }]);
    let currentButtonBottom = -1;
    export let sideBarToolBottom: SideBarToolPair | undefined;
    $: sideBarToolBottom = currentButtonBottom >= 0 ? $buttonsTop[currentButtonBottom] : undefined;
</script>

<div class="button-column surface on-surface-text">
    <!-- TODO: is it worth putting these in components? -->
    <div class="top column">
        {#each $buttonsTop as button, index}
            <IconButton icon={button.icon}
                        alt={button.name}
                        active={currentButtonTop === index}
                        on:click={() => currentButtonTop = currentButtonTop === index ? -1 : index}/>
        {/each}
    </div>
    <div class="bottom column">
        {#each $buttonsBottom as button, index}
            <IconButton icon={button.icon}
                        alt={button.name}
                        active={currentButtonBottom === index}
                        on:click={() => currentButtonBottom = currentButtonBottom === index ? -1 : index}/>
        {/each}
    </div>
</div>

<style lang="scss">
  .button-column {
    flex-shrink: 0;

    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;

    width: 80px;
    padding: 12px;

    box-sizing: border-box;

    > .column {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      gap: 12px;
    }
  }
</style>