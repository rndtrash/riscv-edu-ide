<script lang="ts">
    import SideBarTest from "$lib/side-bar/SideBarTest.svelte";
    import {type Writable, writable} from "svelte/store";
    import ToolBarRow from "$lib/components/ToolBarRow.svelte";
    import type {SideBarToolPair} from "$lib/side-bar/SideBarTool";

    let buttonsTop: Writable<SideBarToolPair[]> = writable([
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
    export let sideBarToolTop: SideBarToolPair | undefined;

    let buttonsBottom: Writable<SideBarToolPair[]> = writable([
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
    export let sideBarToolBottom: SideBarToolPair | undefined;
</script>

<div class="button-column surface-variant on-surface-variant-text">
    <div class="top column">
        <ToolBarRow bind:buttons={buttonsTop} bind:sideBarTool={sideBarToolTop}/>
    </div>
    <div class="bottom column">
        <ToolBarRow bind:buttons={buttonsBottom} bind:sideBarTool={sideBarToolBottom}/>
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