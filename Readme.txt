-------- How to execute the files ------------------------------------------------------------------------------

1. Open this folder (./Project) in terminal, then run "python -m http.server 8000"

2. Open Wed browser (e.g. Chrome) and visit "http://localhost:8000/", you can see compiled results in web page.
   
   (Refresh the Web page to see lateset results)



-------- The high-level structure of this program --------------------------------------------------------------

1. index.html: It is only a interface to display results, remember to add dependence in it if new .js file is added.

2. main.js: Implement when and how to call functions, don't implement any function in it.

3. functions.js: Implement functions, how function achieve its goal.

4. (to be added) CLexer.js and CParser.js: Help editor to know how to parse and edtect errors in editor.