<script>
    import './styles.scss';
</script>

<div class="app background on-background-text body-large">
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
  }
</style>
