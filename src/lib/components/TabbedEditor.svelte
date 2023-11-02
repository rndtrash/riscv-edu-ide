<script lang="ts">
    import type {EditorTabPair} from "$lib/editors/EditorTab";
    import EditorTest from "$lib/editors/EditorTest.svelte";
    import {writable} from "svelte/store";

    let tabs: EditorTabPair[] = [];
    let currentTab = -1;
    let editor: EditorTabPair | undefined;
    $: editor = currentTab >= 0 ? tabs[currentTab] : undefined;
</script>

<div class="tabbed-editor">
    {#if (tabs.length === 0)}
        <h1>Welcome to the RISC-V Edu IDE!</h1>
        <button on:click={() => {
            tabs = [...tabs, {type: EditorTest, title: "", icon: "", state: writable({text: ""})}];
            currentTab = 0;
        }}>
            Add a tab
        </button>
    {:else}
        <div class="tab-row">
            {#each tabs as tab, index}
                <button class="tab {index === currentTab ? 'active' : ''}"
                        on:click={() => currentTab = index}>{tab.title}</button>
            {/each}

            <button on:click={() => tabs = [...tabs, {type: EditorTest, title: "", icon: "", state: writable({text: ""})}]}>
                Add a tab
            </button>
        </div>
        {#if (editor !== undefined)}
            <div class="editor">
                <svelte:component this={editor.type} bind:state={editor.state} bind:title={editor.title}/>
            </div>
        {/if}
    {/if}
</div>

<style lang="scss">
  .tabbed-editor {
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;

    > .editor {
      flex-grow: 1;
    }
  }
</style>