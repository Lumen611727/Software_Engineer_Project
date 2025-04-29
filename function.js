let editorInstance = null;

export function initializeMonacoEditor(callback) {
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
  
    // Once Monaco is ready, initialize the editor
    require(['vs/editor/editor.main'], function () {

        window.monaco = monaco;

        editorInstance = monaco.editor.create(document.getElementById('editor'), {
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

        if (callback) callback();
    });
}

export function setEditorContent(content) {
    const editor = monaco.editor.getModels()[0];
    editor.setValue(content);
}

export function setupEditorListeners() {
    if (!editorInstance) {
      console.error('Editor not initialized yet.');
      return;
    }
  
    editorInstance.onDidChangeModelContent(() => {
      console.log('Content changed!');
    });
  
    editorInstance.onDidChangeCursorPosition((e) => {
      console.log('Cursor moved:', e.position);
    });
  
    editorInstance.onDidChangeCursorSelection((e) => {
      console.log('Selection changed:', e.selection);
    });
  }
