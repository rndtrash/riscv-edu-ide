<script lang="ts">
    import type {EditorTabConstraint, EditorTabPair} from "$lib/editors/EditorTab";
    import EditorTest from "$lib/editors/EditorTest.svelte";
    import EditorMonaco from "$lib/editors/EditorMonaco.svelte";
    import {currentProject} from "$lib/backend/ProjectManager";
    import {get} from "svelte/store";
    import type {FSFile} from "$lib/backend/FileSystem";
    import type {ComponentType} from "svelte";

    let tabs: EditorTabPair[] = [];
    let currentTab = -1;
    $: if (currentTab >= tabs.length)
        currentTab = tabs.length - 1;

    let editor: EditorTabPair | undefined;
    $: editor = currentTab >= 0 ? tabs[currentTab] : undefined;

    function addNewExampleTab() {
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

    export function hasTabWithFile(file: FSFile): boolean {
        const filePath = file.FullPath();
        for (const tab of tabs) {
            if (tab.filePath == filePath)
                return true;
        }

        return false;
    }

    export function focusIfAvailable(filePath: string): boolean {
        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            if (tab.filePath == filePath) {
                currentTab = i;
                return true;
            }
        }

        return false;
    }

    export function addNewTab(type: ComponentType<EditorTabConstraint>, filePath: string, state: any) {
        tabs = [...tabs, {
            type: type,
            icon: "",
            hasChanges: false,
            filePath: filePath,
            state: state
        }];
        currentTab = tabs.length - 1;
    }

    function handleSave(): void {
        for (const tab of tabs) {
            tab.state?.save();
        }
    }
</script>

<svelte:window on:kcSave={handleSave}/>

<div class="tabbed-editor">
    {#if (tabs.length === 0)}
        <h1>Welcome to the RISC-V Edu IDE!</h1>

        {#if (get(currentProject) === undefined)}
            Select a project
        {/if}

        <button on:click={addNewExampleTab}>
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

            <button on:click={addNewExampleTab}>
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