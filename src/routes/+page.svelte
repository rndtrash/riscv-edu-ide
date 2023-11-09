<script lang="ts">
    //import welcome from '$lib/images/svelte-welcome.webp';
    //import welcome_fallback from '$lib/images/svelte-welcome.png';
    import TabbedEditor from "$lib/components/TabbedEditor.svelte";
    import SideBar from "$lib/components/SideBar.svelte";
    import type {SideBarToolPair} from "$lib/side-bar/SideBarTool";
    import {rootFolder} from "$lib/backend/FileSystem";

    let sideBarToolTopLeft: SideBarToolPair | undefined;
    let sideBarToolTopRight: SideBarToolPair | undefined;
    let sideBarToolBottomLeft: SideBarToolPair | undefined;
    let sideBarToolBottomRight: SideBarToolPair | undefined;
</script>

<svelte:head>
    <title>RISC-V Edu IDE</title>
    <meta name="description" content="RISC-V Edu IDE"/>
</svelte:head>

<header class="primary-container on-primaty-container-text">header</header>

<main>
    <SideBar bind:sideBarToolTop={sideBarToolTopLeft} bind:sideBarToolBottom={sideBarToolBottomLeft}/>

    <div class="grid">
        {#if (sideBarToolTopLeft !== undefined)}
            <div class="tool-window left surface-variant on-surface-variant-text">
                <svelte:component this={sideBarToolTopLeft.type} bind:state={sideBarToolTopLeft.state}/>
            </div>
        {/if}

        <div class="center">
            <TabbedEditor/>
        </div>

        {#if (sideBarToolTopRight !== undefined)}
            <div class="tool-window right">
                <svelte:component this={sideBarToolTopRight.type} bind:state={sideBarToolTopRight.state}/>
            </div>
        {/if}


        {#if (sideBarToolBottomLeft !== undefined || sideBarToolBottomRight !== undefined)}
            <div class="bottom">
                {#if (sideBarToolBottomLeft !== undefined)}
                    <div class="left">
                        <svelte:component this={sideBarToolBottomLeft.type} bind:state={sideBarToolBottomLeft.state}/>
                    </div>
                {/if}
                {#if (sideBarToolBottomRight !== undefined)}
                    <div class="right">
                        <svelte:component this={sideBarToolBottomRight.type} bind:state={sideBarToolBottomRight.state}/>
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    <SideBar bind:sideBarToolTop={sideBarToolTopRight} bind:sideBarToolBottom={sideBarToolBottomRight}/>
</main>

<footer class="tertiary-container on-tertiary-container-text">
    footer
</footer>

<style lang="scss">
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
