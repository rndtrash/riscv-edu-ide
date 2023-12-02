<script lang="ts">
    import type {FSNode} from "$lib/backend/FileSystem";

    export let node: FSNode;
    export let selected: FSNode[];

    let ref: HTMLButtonElement;

    function onNodeClick(event: MouseEvent) {
        if (event.ctrlKey) {
            const nodeIndex = selected.indexOf(node);
            if (nodeIndex === -1)
                selected = [...selected, node];
            else
                selected.splice(nodeIndex, 1);
        } else {
            selected = [node];
        }
    }

    function onNodeDoubleClick(event: MouseEvent) {
        selected = [];
        ref.dispatchEvent(new CustomEvent('fsOpen', {detail: node, bubbles: true}));
    }
</script>

<button bind:this={ref} on:click={onNodeClick} on:dblclick={onNodeDoubleClick}
        class="node {selected.indexOf(node) === -1 ? '' : 'selected'}">
    {node.name}
</button>

<style lang="scss">
  .node {
    &.selected {
      background-color: #c2f18d;
    }
  }
</style>