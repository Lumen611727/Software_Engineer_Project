import { initializeMonacoEditor, setEditorContent, setupEditorListeners } from './function.js';

window.onload = () => {
    initializeMonacoEditor(() => {
        // Call other setup functions *after* editor is ready
        setupEditorListeners();
    
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
    });
}

