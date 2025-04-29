export function initializeMonacoEditor() {
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
  
    // Once Monaco is ready, initialize the editor
    require(['vs/editor/editor.main'], function () {
        monaco.editor.create(document.getElementById('editor'), {
            value: [
                '#include <stdio.h>',
                '',
                'int main()',
                '{',
                '    printf("Hello, world!\\n");',
                '    return 0;',
                '}'
            ].join('\n'),
            language: 'c',
            theme: 'vs-dark',
            fontSize: 14
      });
    });
}

export function setEditorContent(content) {
    const editor = monaco.editor.getModels()[0];
    editor.setValue(content);
  }