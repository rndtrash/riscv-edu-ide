<script lang="ts">
    export let icon: string;
    export let alt: string;
    export let active: boolean = true;
</script>

<button class="{active ? 'primary-container on-primary-container-text' : 'surface on-surface-text'}" on:click>
    <picture>
        <source srcset="/icons/{icon}.svg" type="image/svg+xml"/>
        <img src="/icons/{icon}.png" {alt}/>
    </picture>
</button>

<style lang="scss">
  button {
    width: 56px;
    height: 56px;
    aspect-ratio: 1;
    padding: 16px;

    border-width: 0;
    border-radius: 16px;

    transition: background-color 0.1s ease-out;

    > picture {
      width: 24px;
      height: 24px;
      aspect-ratio: 1;
    }
  }
</style>