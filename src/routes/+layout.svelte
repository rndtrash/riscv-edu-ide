<script lang="ts">
    import './styles.scss';
</script>

<!-- TODO: I don't like the "background" class. -->
<div class="app on-background-text body-large">
    <slot/>
</div>

<style lang="scss">
  .app {
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    justify-content: stretch;

    width: 100vw;
    height: 100vh;

    background-color: #ffffff;

    @media (prefers-color-scheme: dark) {
      background-color: #1E1F22;
    }
  }
</style>
