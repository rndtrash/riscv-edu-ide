import { useEffect } from 'preact/hooks';

import { useEditorManager } from './EditorManager';
import { useProject } from '../ProjectContext';
import { createElement } from 'preact';
import { getCurrentTab, useTabs } from '../TabsContext';

export function EditorContainer() {
    const editorManager = useEditorManager();
    const projectManager = useProject();

    const tabManager = useTabs();
    const tab = getCurrentTab(tabManager);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.ctrlKey && e.code === 'KeyS') {
                e.preventDefault();

                editorManager.saveFile?.call(null);
            }
        }

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [editorManager, projectManager]);

    return (
        <div class="editor">
            {
                tab !== null
                    ? createElement(tab.editor, { context: tab.context, uri: tab.uri, key: tab.uri })
                    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Откройте любой файл, чтобы начать работу.</div>
            }
        </div>
    );
}