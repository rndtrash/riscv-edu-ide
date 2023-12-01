<script lang="ts">
    import type {IMachineVisualizable} from "$lib/backend/Emulator/MachineSerializable";

    export let device: IMachineVisualizable;
</script>

<div class="device">
    {device.constructor.name}
</div>

<style lang="scss">
  .device {
    border-color: black;
    border-width: 1px;
    border-style: solid;
  }
</style>