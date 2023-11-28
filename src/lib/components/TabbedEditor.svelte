<script lang="ts">
    import type {EditorTabPair} from "$lib/editors/EditorTab";
    import EditorTest from "$lib/editors/EditorTest.svelte";
    import EditorMonaco from "$lib/editors/EditorMonaco.svelte";

    let tabs: EditorTabPair[] = [];
    let currentTab = -1;
    $: if (currentTab >= tabs.length)
        currentTab = tabs.length - 1;

    let editor: EditorTabPair | undefined;
    $: editor = currentTab >= 0 ? tabs[currentTab] : undefined;

    function addNewTab() {
        tabs = [...tabs, {
            type: EditorTest,
            icon: "",
            hasChanges: false,
            filePath: `${Math.random()}`,
            state: undefined
        }];
        currentTab = tabs.length - 1;
    }

    function addNewMonacoTab() {
        tabs = [...tabs, {
            type: EditorMonaco,
            icon: "",
            hasChanges: false,
            filePath: `${Math.random()}`,
            state: undefined
        }];
        currentTab = tabs.length - 1;
    }
</script>

<div class="tabbed-editor">
    {#if (tabs.length === 0)}
        <h1>Welcome to the RISC-V Edu IDE!</h1>
        <button on:click={addNewTab}>
            Add a tab
        </button>
        <button on:click={addNewMonacoTab}>
            Add a Monaco tab
        </button>
    {:else}
        <div class="tab-row">
            {#each tabs as tab, index (tab.filePath)}
                <button class="tab {index === currentTab ? 'active' : ''}"
                        on:click={() => currentTab = index}>{tab.filePath}
                    {#if (tab.hasChanges)}(*){/if}
                </button>
            {/each}

            <button on:click={addNewTab}>
                Add a tab
            </button>
            <button on:click={addNewMonacoTab}>
                Add a Monaco tab
            </button>
        </div>
        {#if (editor !== undefined)}
            <div class="editor">
                {#key editor.filePath}
                    <svelte:component
                            this={editor.type}
                            bind:hasChanges={editor.hasChanges}
                            filePath={editor.filePath}
                            bind:state={editor.state}/>
                {/key}
            </div>
        {/if}
    {/if}
</div>

<style lang="scss">
  .tabbed-editor {
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;

    flex-grow: 1;

    > .editor {
      position: relative;

      flex-grow: 1;
    }
  }
</style>