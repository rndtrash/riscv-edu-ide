import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'preact/hooks';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { useEditorManager } from './EditorManager';
import { useProject } from '../ProjectContext';
import { getFile } from 'src/backend/FileSystem';

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker()
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker()
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker()
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker()
        }
        return new editorWorker()
    }
}

export function EditorContainer() {
    const editorManager = useEditorManager();
    const projectManager = useProject();
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [language, setLanguage] = useState<string>('plaintext');

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.ctrlKey && e.code === 'KeyS') {
                e.preventDefault();

                (async () => {
                    const fileHandle = await getFile(editorManager.currentFile, projectManager.projectFolder);
                    const writable = await fileHandle.createWritable();
                    const textEncoder = new TextEncoder();
                    writable.write(textEncoder.encode(monacoRef.current.getValue()));
                    await writable.close();
                })();
            }
        }

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [editorManager, projectManager, monacoRef]);

    useEffect(() => {
        (async () => {
            const fileHandle = await getFile(editorManager.currentFile, projectManager.projectFolder);
            let text = "";
            if (fileHandle !== null) {
                const file = await fileHandle.getFile();
                text = await file.text();
                const name = file.name;
                setFileName(name);
            }

            // const lang = detectLanguage(name);
            // setLanguage(lang);

            if (editorRef.current) {
                monacoRef.current = monaco.editor.create(editorRef.current, {
                    value: text,
                    language: 'javascript',
                    theme: 'vs-light',
                    automaticLayout: true,
                });
            }
        })();

        return () => {
            monacoRef.current?.dispose();
        };
    }, [editorManager.currentFile]);

    return (
        <div class="editor">
            <div ref={editorRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}