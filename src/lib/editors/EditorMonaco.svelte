<script lang="ts">
    import {onDestroy, onMount} from 'svelte';
    import type Monaco from './monaco';
    import {makeMonacoState} from "$lib/editors/EditorMonaco";
    import type {EditorMonacoState} from "$lib/editors/EditorMonaco";

    export let state: EditorMonacoState | null;
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
        editor = monaco.editor.create(editorContainer, {theme: 'riscv-edu-ide-theme', automaticLayout: true});
        state ??= makeMonacoState();
        state.save = () => {
            if (hasChanges && state != null && state.file !== undefined) {
                state.file.write(state.model.getValue());
                hasChanges = false;
            }
        };

        editor.setModel(state!.model);

        editor.onDidChangeModelContent(() => hasChanges = true);
    });

    onDestroy(() => {
        editor?.dispose();
    });
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