<script lang="ts">
    import TabbedEditor from "$lib/components/TabbedEditor.svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import type {SideBarToolPair} from "$lib/side-bar/SideBarTool";
    import {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import {FSFile, FSFolder, FSNode, SaveAll} from "$lib/backend/FileSystem";
    import {
        allProjects,
        currentProject,
        makeProject,
        openProject
    } from "$lib/backend/ProjectManager";
    import ToolBarRow from "$lib/components/ToolBarRow.svelte";
    import SideBarTest from "$lib/side-bar/SideBarTest.svelte";
    import {writable} from "svelte/store";
    import SideBarMachineOverview from "$lib/side-bar/SideBarMachineOverview.svelte";
    import SideBarProjectBrowser from "$lib/side-bar/SideBarProjectBrowser.svelte";
    import type {EditorTabConstraint} from "$lib/editors/EditorTab";
    import type {ComponentType} from "svelte";
    import EditorMonaco from "$lib/editors/EditorMonaco.svelte";
    import {makeMonacoState} from "$lib/editors/EditorMonaco";
    import EditorHex from "$lib/editors/EditorHex.svelte";
    import {makeHexState} from "$lib/editors/EditorHex";
    import IconButton from "$lib/components/IconButton.svelte";

    let sideBarToolTopLeft: SideBarToolPair | undefined;
    let sideBarToolTopRight: SideBarToolPair | undefined;
    let sideBarToolBottomLeft: SideBarToolPair | undefined;
    let sideBarToolBottomRight: SideBarToolPair | undefined;

    let buttonsTopLeft: SideBarToolPair[] = [
        {
            type: SideBarProjectBrowser,
            name: "Project Browser",
            icon: "folder",
            iconStatus: writable(ButtonStatusIcon.None),
            state: undefined
        }
    ];

    let buttonsBottomLeft: SideBarToolPair[] = [
        {
            type: SideBarTest,
            name: "Side Bar Test",
            icon: "folder",
            iconStatus: writable(ButtonStatusIcon.None),
            state: undefined
        },
        {
            type: SideBarTest,
            name: "Side Bar Test 2",
            icon: "folder",
            iconStatus: writable(ButtonStatusIcon.None),
            state: undefined
        }];

    let buttonsTopRight: SideBarToolPair[] = [
        {
            type: SideBarMachineOverview,
            name: "Machine overview",
            icon: "developer_board",
            iconStatus: writable(ButtonStatusIcon.None),
            state: undefined
        }];

    let buttonsBottomRight: SideBarToolPair[] = [
        {
            type: SideBarTest,
            name: "Side Bar Test",
            icon: "folder",
            iconStatus: writable(ButtonStatusIcon.None),
            state: undefined
        }];

    let projectNameInput: HTMLInputElement;
    let projectNameSelected: string = "";
    $: if (projectNameSelected != "" && projectNameSelected != $currentProject?.folder.name) openProject(projectNameSelected);

    let tabbedEditor: TabbedEditor;

    function openFile(e: CustomEvent): void {
        const node = e.detail as FSNode;
        if (node instanceof FSFolder) {
            console.log("tried to open a folder, epic fail");
            return;
        }

        const file = node as FSFile;
        const filePath = file.FullPath();
        const extension = file.name.split(".").pop();

        if (tabbedEditor.focusIfAvailable(filePath)) {
            return;
        }

        let isText = true;
        let text: string = "";
        try {
            text = file.text;
        } catch (e) {
            console.error(e);

            if (e instanceof TypeError)
                isText = false;
        }

        let editor: ComponentType<EditorTabConstraint> | undefined = undefined;
        let state: any = undefined;
        switch (extension) {
            case "rvedu":
                if (isText) {
                    // TODO: a proper configuration editor
                    editor = EditorMonaco;
                    state = makeMonacoState(file, "json");
                }
                break;

            case "bin":
            case "dat":
                isText = false;
                break;
        }

        if (editor === undefined) {
            if (isText) {
                editor = EditorMonaco;
                state = makeMonacoState(file, undefined);
            } else {
                editor = EditorHex;
                state = makeHexState(file);
            }
        }

        tabbedEditor.addNewTab(editor, filePath, state);
    }

    function processKeyCombo(event: KeyboardEvent): boolean {
        if (event.ctrlKey) {
            switch (event.code) {
                case "KeyS":
                    event.preventDefault();
                    window.dispatchEvent(new CustomEvent("kcSave"));
                    break;

                default:
                    return true;
            }
        }

        return false;
    }
</script>

<svelte:body on:keydown={processKeyCombo}/>

<svelte:head>
    <title>RISC-V Edu IDE</title>
    <meta name="description" content="RISC-V Edu IDE"/>
</svelte:head>

<header class="primary-container on-primary-container-text">
    <IconButton icon="menu"
                status={writable(ButtonStatusIcon.None)}
                alt="Expand the menu"
                size={32}/>

    <select bind:value={projectNameSelected}>
        <option disabled selected value>-- select a project --</option>
        {#each $allProjects as project}
            <option>{project}</option>
        {/each}
    </select>
    <button on:click={() => SaveAll()}>DEBUG: save all files</button>
    {#if ($currentProject !== undefined)}
        <button on:click={() => $currentProject?.MachineTick()}>DEBUG: tick</button>
    {:else}
        <input type="text" placeholder="project name" bind:this={projectNameInput}>
        <button on:click={() => {makeProject(projectNameInput.value); projectNameSelected = projectNameInput.value}}>
            DEBUG: make a new project
        </button>
    {/if}
</header>

<main on:fsOpen={openFile}>
    <SideBar>
        <ToolBarRow bind:buttons={buttonsTopLeft} bind:sideBarTool={sideBarToolTopLeft} slot="top"/>
        <ToolBarRow bind:buttons={buttonsBottomLeft} bind:sideBarTool={sideBarToolBottomLeft} slot="bottom"/>
    </SideBar>

    <div class="grid">
        {#if (sideBarToolTopLeft !== undefined)}
            <div class="tool-window left surface-variant on-surface-variant-text">
                <svelte:component this={sideBarToolTopLeft.type}
                                  bind:state={sideBarToolTopLeft.state}
                                  bind:iconStatus={sideBarToolTopLeft.iconStatus}/>
            </div>
        {/if}

        <div class="center">
            <TabbedEditor bind:this={tabbedEditor}/>
        </div>

        {#if (sideBarToolTopRight !== undefined)}
            <div class="tool-window right">
                <svelte:component this={sideBarToolTopRight.type}
                                  bind:state={sideBarToolTopRight.state}
                                  bind:iconStatus={sideBarToolTopRight.iconStatus}/>
            </div>
        {/if}


        {#if (sideBarToolBottomLeft !== undefined || sideBarToolBottomRight !== undefined)}
            <div class="bottom">
                {#if (sideBarToolBottomLeft !== undefined)}
                    <div class="left">
                        <svelte:component this={sideBarToolBottomLeft.type}
                                          bind:state={sideBarToolBottomLeft.state}
                                          bind:iconStatus={sideBarToolBottomLeft.iconStatus}/>
                    </div>
                {/if}
                {#if (sideBarToolBottomRight !== undefined)}
                    <div class="right">
                        <svelte:component this={sideBarToolBottomRight.type}
                                          bind:state={sideBarToolBottomRight.state}
                                          bind:iconStatus={sideBarToolBottomRight.iconStatus}/>
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    <SideBar>
        <ToolBarRow bind:buttons={buttonsTopRight} bind:sideBarTool={sideBarToolTopRight} slot="top"/>
        <ToolBarRow bind:buttons={buttonsBottomRight} bind:sideBarTool={sideBarToolBottomRight} slot="bottom"/>
    </SideBar>
</main>

<footer class="tertiary-container on-tertiary-container-text">
    footer
</footer>

<style lang="scss">
  header {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 4px;
    padding: 0 4px;

    height: 40px;
  }

  main {
    flex-grow: 1;

    display: flex;
    flex-flow: row nowrap;

    > .grid {
      flex-grow: 1;

      display: grid;
      grid-template-columns: 0fr 1fr 0fr;
      grid-template-rows: 1fr 0fr;
      grid-column-gap: 0;
      grid-row-gap: 0;

      > .left {
        grid-area: 1 / 1 / 2 / 2;
      }

      > .center {
        grid-area: 1 / 2 / 2 / 3;

        display: flex;
      }

      > .right {
        grid-area: 1 / 3 / 2 / 4;
      }

      > .bottom {
        grid-area: 2 / 1 / 3 / 4;

        display: flex;
        flex-flow: row nowrap;

        > .left, > .right {
          flex-basis: 0;
          flex-grow: 1;
        }
      }

      > .tool-window {
        padding: 24px;
        border-radius: 0 24px 24px 0;
      }
    }
  }
</style>
