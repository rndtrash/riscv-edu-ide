<script lang="ts">
    export var state: { text: string } = {text: ""};
</script>

<div>
    <input type="text" bind:value={state.text}/>
    Cumponent
</div>