const antlr4 = require('antlr4');
import CLexer from './CLexer.js';
import CParser from './CParser.js';
import CVisitor from './CVisitor.js';

console.log('antlr4 =', antlr4);
console.log(antlr4.ErrorListener);
console.log(CLexer);


class ErrorCollector extends antlr4.ErrorListener {
    constructor() {
        super();
        this.errors = [];
    }

    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
        this.errors.push({ line, column, msg });
    }
}

class SymbolCollector extends CVisitor {
  constructor() {
    super();
    this.symbols = new Set();
  }

  visitFunctionDefinition(ctx) {
    const id = ctx.declarator().getText(); // Get function name
    this.symbols.add(id);
    return this.visitChildren(ctx); // keep visiting the rest
  }

  visitDeclaration(ctx) {
    const id = ctx.initDeclaratorList()?.getText();
    if (id) this.symbols.add(id);
    return this.visitChildren(ctx);
  }
}

class ASTBuilder extends CVisitor {
  visitChildren(ctx) {
    const node = {
      rule: ctx.constructor.name,
      text: ctx.getText(),
      children: []
    };

    for (let i = 0; i < ctx.getChildCount(); i++) {
      const child = ctx.getChild(i);
      if (child.accept) {
        node.children.push(child.accept(this));
      } else {
        node.children.push({
          rule: 'Terminal',
          text: child.getText()
        });
      }
    }

    return node;
  }
}


const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return; // 移除循環引用
            }
            seen.add(value);
        }
        return value;
    };
};


function findFunctions(node, functions = []) {
  if (!node) return functions;

  if (node.rule === "DeclaratorContext") {
    functions.push(node.text);
  }

  if (node.children) {
    for (const child of node.children) {
      findFunctions(child, functions);
    }
  }

  return functions;
}

function findVariables(node, vars = []) {
  if (!node) return vars;

  if (node.rule === "DeclarationSpecifierContext") {
    vars.push(node.text);
  }

  if (node.children) {
    for (const child of node.children) {
      findVariables(child, vars);
    }
  }

  return vars;
}


export function parseInput(input) {
  if (!input || typeof input !== 'string') {
  throw new Error("Invalid input provided");
  }
  const chars = new antlr4.InputStream(input);
  const lexer = new CLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new CParser(tokens);
    
  const errorCollector = new ErrorCollector();
  parser.removeErrorListeners();
  parser.addErrorListener(errorCollector);

  const tree = parser.compilationUnit(); 

  return {
      tree,
      errors: errorCollector.errors
  };
};

export function extractSymbols(input) {
  if (!input || typeof input !== 'string') {
  throw new Error("Invalid input provided");
  }

  const chars = new antlr4.InputStream(input);
  const lexer = new CLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new CParser(tokens);
  parser.buildParseTrees = true;

  const tree = parser.compilationUnit(); 
  const collector = new ASTBuilder();
  const ast = collector.visit(tree);
  
  const arr1 = findFunctions(ast);
  const arr2 = findVariables(ast);
  console.log("User-defined functions:", arr1);
  console.log("User-defined variables:", arr2);

  const symbols = [...arr1, ...arr2];

  return symbols
}

export function getAST(input) {
  if (!input || typeof input !== 'string') {
    throw new Error("Invalid input provided");
  }

  const chars = new antlr4.InputStream(input);
  const lexer = new CLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new CParser(tokens);
  parser.buildParseTrees = true;

  const tree = parser.compilationUnit();

  const astBuilder = new ASTBuilder();
  const ast = astBuilder.visit(tree);

  return JSON.stringify(ast, null, 2);
}




