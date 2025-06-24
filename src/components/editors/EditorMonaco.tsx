import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { useEffect, useRef, useState } from 'preact/hooks';
import { useProject } from '../ProjectContext';
import { getFile } from 'src/backend/FileSystem';
import { useEditorManager } from './EditorManager';
import { PROJECT_EXTENSION } from 'src/backend/ProjectManager';

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

monaco.editor.defineTheme('riscv-edu-ide-theme', {
    base: 'vs',
    inherit: true,
    rules: [
        // { token: '', foreground: '#313131' },
        // { token: 'register', foreground: '#313131' },
        // { token: 'instruction', foreground: '#313131', fontStyle: 'bold' },
        { token: 'instruction', foreground: '#448000' },
        { token: 'comment', foreground: '#00000054' },
        { token: 'directive', foreground: '#806300' },
        { token: 'number', foreground: '#28766e' },
        { token: 'label', foreground: '#7D0080' }
    ],
    colors: {
        //     'editor.background': '#FAFEF6',
        //     'editor.foreground': '#313131'
    }
});

monaco.languages.register({ id: 'asm' });
monaco.languages.setMonarchTokensProvider('asm', {
    defaultToken: '',
    tokenPostfix: '.asm',

    instructions: [
        'add', 'addi', 'sub', 'and', 'andi', 'or', 'ori', 'xor', 'xori', 'slt', 'slti', 'sltu', 'sltiu', 'sra', 'srai', 'srl', 'srli', 'sll', 'slli',
        'lw', 'sw', 'lb', 'sb', 'lui', 'auipc', 'jal', 'jalr', 'beq', 'bne', 'blt', 'bge', 'bltu', 'bgeu'
    ],
    directives: ['.section', '.global', '.define', '.offset'],

    tokenizer: {
        root: [
            [/#.*$/, "comment"],
            [/[a-zA-Zа-яёА-ЯЁ_\d]+:/, "label"],
            // [/%[a-zA-Z0-9]+/, "register"],
            [/\.[a-zA-Z_][a-zA-Z_\d]*/, {
                cases: {
                    '@directives': 'directive',
                    '@default': ''
                }
            }],
            [/[a-zA-Z_][a-zA-Z_\d]*/, {
                cases: {
                    '@instructions': 'instruction',
                    '@default': ''
                }
            }],
            [/-?((0[xX])?[0-9A-Fa-f]+)/, "number"],
            // [/[ \t]+/, "whitespace"]
        ]
    }
});

interface IEditorMonacoContext {
    model: monaco.editor.ITextModel;
    cursorPosition?: monaco.Position;
}

export function EditorMonaco(props: { uri: string, context: IEditorMonacoContext }) {
    const projectManager = useProject();
    const editorManager = useEditorManager();
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [language, setLanguage] = useState<string>('plaintext');

    useEffect(() => {
        (async () => {
            const fileHandle = await getFile(props.uri, projectManager.projectFolder);
            let text = "";
            if (fileHandle !== null) {
                const file = await fileHandle.getFile();
                text = await file.text();
            }

            // const lang = detectLanguage(name);
            // setLanguage(lang);

            if (editorRef.current) {
                props.context.model ??= monaco.editor.createModel(text, props.uri.endsWith(PROJECT_EXTENSION) ? 'json' : 'asm');

                monacoRef.current = monaco.editor.create(editorRef.current, {
                    model: props.context.model,
                    theme: 'riscv-edu-ide-theme',
                    automaticLayout: true,
                });

                if (props.context.cursorPosition) {
                    monacoRef.current.setPosition(props.context.cursorPosition);
                    monacoRef.current.revealPositionInCenter(props.context.cursorPosition);
                }
            }
        })();

        return () => {
            props.context.cursorPosition = monacoRef.current?.getPosition();
            monacoRef.current?.dispose();
        };
    }, [props.uri]);

    useEffect(() => {
        async function saveFile() {
            if (props.context.model !== undefined) {
                const fileHandle = await getFile(props.uri, projectManager.projectFolder);
                const writable = await fileHandle.createWritable();
                const textEncoder = new TextEncoder();
                writable.write(textEncoder.encode(props.context.model.getValue()));
                await writable.close();
            }
        };
        editorManager.saveFile.current = saveFile;

        return () => {
            editorManager.saveFile.current = null;
        };
    }, [editorManager]);

    return (
        <div ref={editorRef} style={{ width: '100%', height: '100%' }} />
    );
}