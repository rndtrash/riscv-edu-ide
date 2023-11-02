<script lang="ts">
    export let icon: string;
    export let alt: string;
    export let active: boolean = true;
    export let theme: string = "primary";
</script>

<button class="{active ? `${theme}-container on-${theme}-container-text` : 'transparent'} button" on:click>
    <div class="hover">
        <picture>
            <source srcset="/icons/{icon}.svg" type="image/svg+xml"/>
            <img src="/icons/{icon}.png" {alt}/>
        </picture>
    </div>
</button>

<style lang="scss">
  .button {
    width: 56px;
    height: 56px;
    aspect-ratio: 1;
    padding: 0;

    border-width: 0;
    border-radius: 16px;

    transition: background-color 0.1s ease-out;

    overflow: hidden;

    &.transparent {
      background-color: #00000000;
    }

    > .hover {
      aspect-ratio: 1;
      padding: 16px;

      background-color: #00000000;

      transition: background-color 0.1s ease-out;

      &:hover {
        background-color: #00000022;
      }

      > picture {
        width: 24px;
        height: 24px;
        aspect-ratio: 1;
      }
    }
  }
</style>