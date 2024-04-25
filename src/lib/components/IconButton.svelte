<script lang="ts">
    import {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import type {Writable} from "svelte/store";
    import Icon from "$lib/components/Icon.svelte";

    export let icon: string;
    export let status: Writable<ButtonStatusIcon>;
    export let alt: string;
    export let active: boolean = true;
    export let theme: string = "primary";
    export let size: number = 32;

    const padding: number = 4;

    const statusToClass: Map<ButtonStatusIcon, string> = new Map<ButtonStatusIcon, string>([
        [ButtonStatusIcon.None, ""],
        [ButtonStatusIcon.Warning, "warning"],
        [ButtonStatusIcon.Error, "error"],
        [ButtonStatusIcon.Info, "info"],
    ]);

    let statusClass: string = "";
    $: statusClass = statusToClass.get($status) ?? "";
</script>

<button class="{active ? `${theme}-container on-${theme}-container-text` : 'transparent'} button" on:click
        style:width="{size}px" style:height="{size}px">
    <div class="hover" style="padding: {padding}px">
        <Icon {icon} {alt} size={size - padding * 2}/>

        {#if ($status !== ButtonStatusIcon.None)}
            <div class="status-container {active ? `${theme}-container` : 'surface-variant'}">
                <div class="status {statusClass}"/>
            </div>
        {/if}
    </div>
</button>

<style lang="scss">
  @import '$lib/constants.scss';

  .button {
    aspect-ratio: 1;
    padding: 0;

    border-width: 0;
    border-radius: 4px;

    transition: background-color 0.1s ease-out;

    overflow: hidden;

    user-select: none;

    &.transparent {
      background-color: #00000000;
    }

    > .hover {
      position: relative;

      aspect-ratio: 1;

      background-color: #00000000;

      transition: background-color 0.1s ease-out;

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
            background-color: $color-warning;
          }

          &.error {
            background-color: $color-error;
          }

          &.info {
            background-color: $color-info;
          }
        }
      }
    }

    &:hover {
      .hover {
        background-color: $elevation-light;

        > .status-container > .status {
          box-shadow: $elevation-light 0 0 0 2px;
        }
      }
    }

    &:active {
      .hover {
        background-color: $elevation-medium;

        > .status-container > .status {
          box-shadow: $elevation-medium 0 0 0 2px;
        }
      }
    }
  }
</style>