<script lang="ts">
    import {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import type {Writable} from "svelte/store";
    import Icon from "$lib/components/Icon.svelte";

    export let icon: string;
    export let status: Writable<ButtonStatusIcon>;
    export let alt: string;
    export let active: boolean = true;
    export let theme: string = "primary";

    const statusToClass: Map<ButtonStatusIcon, string> = new Map<ButtonStatusIcon, string>([
        [ButtonStatusIcon.None, ""],
        [ButtonStatusIcon.Warning, "warning"],
        [ButtonStatusIcon.Error, "error"],
        [ButtonStatusIcon.Info, "info"],
    ]);

    let statusClass: string = "";
    $: statusClass = statusToClass.get($status) ?? "";
</script>

<button class="{active ? `${theme}-container on-${theme}-container-text` : 'transparent'} button" on:click>
    <div class="hover">
        <Icon {icon} {alt}/>
        {$status}

        {#if ($status !== ButtonStatusIcon.None)}
            <div class="status-container {active ? `${theme}-container` : 'surface-variant'}">
                <div class="status {statusClass}"/>
            </div>
        {/if}
    </div>
</button>

<style lang="scss">
  .button {
    width: 32px;
    height: 32px;
    aspect-ratio: 1;
    padding: 0;

    border-width: 0;
    border-radius: 4px;

    transition: background-color 0.1s ease-out;

    overflow: hidden;

    &.transparent {
      background-color: #00000000;
    }

    > .hover {
      position: relative;

      aspect-ratio: 1;
      padding: 4px;

      background-color: #00000000;

      transition: background-color 0.1s ease-out;

      &:hover {
        background-color: #00000022;

        > .status-container > .status {
          box-shadow: #00000022 0 0 0 2px;
        }
      }

      > picture {
        width: 24px;
        height: 24px;
        aspect-ratio: 1;
      }

      > .status-container {
        position: absolute;
        top: 4px;
        right: 4px;

        width: 6px;
        height: 6px;
        aspect-ratio: 1;

        padding: 2px;

        border-radius: 6px;

        > .status {
          width: 6px;
          height: 6px;
          aspect-ratio: 1;

          border-radius: 3px;

          background-color: #00000000;

          box-shadow: #00000000 0 0 0 2px;
          transition: box-shadow 0.1s ease-out;

          &.warning {
            background-color: #F6B51EFF;
          }

          &.error {
            background-color: #D50F0FFF;
          }

          &.info {
            background-color: #4F81F5FF;
          }
        }
      }
    }
  }
</style>