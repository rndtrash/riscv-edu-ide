<script lang="ts">
    import {onDestroy, onMount} from 'svelte';
    import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

    export let state: Monaco.editor.ITextModel | undefined;
    export let hasChanges: boolean;
    export let filePath: string;

    let editor: Monaco.editor.IStandaloneCodeEditor;
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;

    onMount(async () => {
        // Import our 'monaco.ts' file here
        // (onMount() will only be executed in the browser, which is what we want)
        monaco = (await import('./monaco')).default;

        // Your monaco instance is ready, let's display some code!
        editor = monaco.editor.create(editorContainer, {automaticLayout: true});
        state ??= monaco.editor.createModel(
            "console.log('Hello from Monaco! (the editor, not the city...)')",
            'javascript'
        );
        editor.setModel(state);

        editor.onDidChangeModelContent(() => hasChanges = true);
    });

    onDestroy(() => {
        //monaco?.editor.getModels().forEach((model) => model.dispose());
        editor?.dispose();
    });

    // TODO: dispose the model when the tab is closed
</script>

<div>
    <div class="container" bind:this={editorContainer}/>
</div>

<style lang="scss">
  div {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
</style>