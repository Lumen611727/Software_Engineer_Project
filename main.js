import { initializeMonacoEditor, setEditorContent } from './function.js';

window.onload = () => {
    initializeMonacoEditor();

    setTimeout(() => {
        setEditorContent([
            '#include <stdio.h>',
            '',
            'int main()',
            '{',
            '    printf("Updated Content\\n");',
            '    return 0;',
            '}'
        ].join('\n'));
    }, 2000);
}

