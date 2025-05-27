-------- How to execute the files ------------------------------------------------------------------------------

First of all, make sure you have installed Node.js! 

1. Open this folder (./Project) in terminal, then run "node server.js" 

   (I don't really remember about dependencies,so you may need to use command
    "npm install {module name}" to install some dependencies to execute 'server.js')


2. Open Web browser (e.g. Chrome) and visit "http://localhost:8000/", you can see compiled results in web page.
   
   ("flush cache and force refresh the Web page" is needed when any updates are implemented to see lateset results)

-------- Some Hint for Development -----------------------------------------------------------------------------

1. /src:

   index.js: A place to control function calls
             (Don't implement any function in it.)

   function.js: Functions related to monaco editor and html event (button) are implemented here.
                (There's a function called 'renderAST(input->JSON file)', it's for visualizing AST tree. 
                 If you can build AST tree, you can utilize it.)

   antlr.js: Functions related to ANTLR (code parsing, extract user-defined variables and functions, AST building ...)
             are implemented here. 
             (In order to traverse results from parser, you have to extend class 'CVisitor' and inherit some functions in it.
              After building AST tree, you can call JSON.stringify().
              See function 'getAST()' for process of producing AST tree)
   
   C.g4: File for defining C language grammar. 
         (You dont have to change this file in most cases.)

   CLexer.js, CParser.js, CVisitor.js, CLisitener.js: Files related to parsing C code.
                                                      (You dont have to change these files in most cases.
                                                       It is automatically produced by ANTLR with C.g4)


2. /dist:

   Files in this folder is automatically produced by 'webpack'.
   If you have change any content of files in /src, run 'npx webpack' under './Project'.


3. /files: 

   The editor can write/read files under this folder with contents from editor/file.
   It should be empty by default.


4. server.js: 

   Functions handle http connection and data transmission between online editor and local files in /files.


5. index.html: 

   For user interface display.
   
   
6. webpack.config.js:

   Configuration for webpack. 
   (You dont have to change this file in most cases.)


-------- The high-level structure of this program --------------------------------------------------------------

1. index.html: It is only a interface to display results, remember to add dependence in it if new .js file is added.

2. main.js: Implement when and how to call functions, don't implement any function in it.

3. functions.js: Implement functions, how function achieve its goal.

4. (to be added) CLexer.js and CParser.js: Help editor to know how to parse and edtect errors in editor.