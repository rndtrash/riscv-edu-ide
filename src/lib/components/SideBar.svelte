<div class="button-column surface-variant on-surface-variant-text">
    <div class="top column">
        <slot name="top"></slot>
    </div>
    <div class="bottom column">
        <slot name="bottom"></slot>
    </div>
</div>

<style lang="scss">
  .button-column {
    flex-shrink: 0;

    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;

    width: 40px;
    padding: 4px;

    box-sizing: border-box;

    > .column {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      gap: 8px;
    }
  }
</style>