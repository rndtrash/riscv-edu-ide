import * as monaco from 'monaco-editor';

// Import the workers in a production-safe way.
// This is different from in Monaco's documentation for Vite,
// but avoids a weird error ("Unexpected usage") at runtime
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

self.MonacoEnvironment = {
    getWorker: function (_: string, label: string) {
        switch (label) {
            case 'json':
                return new JsonWorker();
            default:
                return new EditorWorker();
        }
    }
};

export default monaco;