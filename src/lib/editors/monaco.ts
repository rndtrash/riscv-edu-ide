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
        'editor.background': '#FAFEF6',
        'editor.foreground': '#313131'
    }
});

monaco.languages.register({id: 'asm'});
monaco.languages.setMonarchTokensProvider('asm', {
    defaultToken: '',
    tokenPostfix: '.asm',

    instructions: ['jal', 'j', 'addi', 'add', 'sw', 'nop'],
    directives: ['.section', '.global'],

    tokenizer: {
        root: [
            [/[a-zA-Zа-яёА-ЯЁ_\d]+:/, "label"],
            [/%[a-zA-Z0-9]+/, "register"],
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
            [/\$-?((0[xX])?[0-9A-Fa-f]+)/, "number"],
            [/^#.*$/, "comment"],
            // [/[ \t]+/, "whitespace"]
        ]
    }
});

export default monaco;