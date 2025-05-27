import * as monaco from 'monaco-editor';
import * as d3 from 'd3';
import { parseInput, extractSymbols, getAST } from './antlr.js'

let editorInstance = null;
const keywords = [
  'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 
  'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 
  'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static', 
  'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while'
];


export function initializeMonacoEditor(callback) {
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
    console.log(editorInstance);
    editorInstance.updateOptions({ quickSuggestions: { other: true, comments: false, strings: false } });
}

function showErrorsInMonaco(errors) {
    const markers = errors.map(e => ({
        severity: monaco.MarkerSeverity.Error,
        message: e.msg,
        startLineNumber: e.line,
        startColumn: e.column + 1,
        endLineNumber: e.line,
        endColumn: e.column + 2
    }));
    
    monaco.editor.setModelMarkers(editorInstance.getModel(), "antlr", markers);
}

monaco.languages.registerCompletionItemProvider('c', {
  provideCompletionItems: function(model, position) {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    };

    const arr1 = keywords.map(keyword => ({
      label: keyword,
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: keyword,
      range: range,
    }));

    const userCode = model.getValue();
    const Symbols = extractSymbols(userCode); // function you define
    console.log(Symbols);

    const userSymbols = Symbols.filter(item => !keywords.includes(item));
    console.log(userSymbols);

    const arr2 = userSymbols.map(name => ({
      label: name,
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: name,
      range: range
    }));


    const suggestions = [...arr1, ...arr2];
    return { suggestions };
  }
});

function renderAST(treeData) {
    console.log(typeof d3);
  const container = document.getElementById("astOutput");
  container.innerHTML = ""; // Clear previous

  const width = 1600;
  const height = 800;

  const root = d3.hierarchy(treeData);
  const treeLayout = d3.tree().size([height, width - 160]);
  treeLayout(root);

  const svg = d3.select("#astOutput")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(80,0)");

  svg.selectAll(".link")
    .data(root.links())
    .join("line")
    .attr("class", "link")
    .attr("x1", d => d.source.y)
    .attr("y1", d => d.source.x)
    .attr("x2", d => d.target.y)
    .attr("y2", d => d.target.x)
    .attr("stroke", "#ccc");

  svg.selectAll(".node")
    .data(root.descendants())
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .append("text")
    .text(d => `${d.data.rule}: ${d.data.text}`)
    .attr("font-size", "10px")
    .attr("fill", "#333");
}


export function setEditorContent(content) {
    editorInstance.setValue(content);
}

export function setupEditorListeners() {
    if (!editorInstance) {
      console.error('Editor not initialized yet.');
      return;
    }
  
    let parseTimeout;
    editorInstance.onDidChangeModelContent(() => {
        clearTimeout(parseTimeout);
        parseTimeout = setTimeout(() => {
            const code = editorInstance.getValue();
            try {
                const { errors } = parseInput(code);
                showErrorsInMonaco(errors);
            } catch (e) {
                console.error("Parse failed", e);
            }
        }, 300);
    });
  
    editorInstance.onDidChangeCursorPosition((e) => {
      console.log('Cursor moved:', e.position);
    });
  
    editorInstance.onDidChangeCursorSelection((e) => {
      console.log('Selection changed:', e.selection);
    });
}

document.getElementById('showAST').addEventListener('click', () => {
  const code = editorInstance.getValue();
  const astText = getAST(code);
  document.getElementById('astOutput').textContent = astText;

  // renderAST(code);
  document.getElementById('astModal').style.display = 'block';
});

document.getElementById('save_and_load').addEventListener('click', () => {
  const code = editorInstance.getValue();
  const filename = document.getElementById('filenameInput').value;
  document.getElementById('filenameModal').style.display = 'block';

});

document.getElementById('save').addEventListener('click', async () => {
  const code = editorInstance.getValue();
  const filename = document.getElementById('filenameInput').value + '.c';
  document.getElementById('filenameModal').style.display = 'none';

  if (!filename) {
    alert('Please enter a filename.');
    return;
  }
  try {
    const response = await fetch('/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, code }),
    });
      
    const message = await response.text();
    alert(message);
    } 
    catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file. See console.');
    }
});

document.getElementById('load').addEventListener('click', async () => {
  // const code = editorInstance.getValue();
  const filename = document.getElementById('filenameInput').value + '.c';
  document.getElementById('filenameModal').style.display = 'none';

  if (!filename) {
    alert('Please enter a filename to load.');
    return;
  }

  try {
    // Encode the filename in case it has special characters
    const response = await fetch(`/load?filename=${encodeURIComponent(filename)}`);

    if (response.ok) {
      const fileContent = await response.text();
      editorInstance.setValue(fileContent);
      alert('File loaded successfully.');
    } 
    else {
      const errorMessage = await response.text();
      alert(`Error loading file: ${errorMessage} (Status: ${response.status})`);
    }
  } 
  catch (error) {
    console.error('Error loading file:', error);
    alert('Error loading file. See console.');
  }

});
