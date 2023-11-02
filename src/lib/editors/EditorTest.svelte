<script lang="ts">
    export let title: string = "cool editor";
    export let state: { text: string } = {text: ""};
</script>

<div>
    <input type="text" bind:value={state.text}/>
    Cool Editor
</div>