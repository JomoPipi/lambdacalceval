







const λ = 'λ'
log=console.log
function D(x) { return document.getElementById(x) }








function runCode() {
  D('output').innerHTML = 'ß-reduction in process...'
  setTimeout(_ => (
    D('output').innerHTML = F(window.ace.edit(D('code')).getSession().getValue()), 
    D('code').focus()),
    300 + Math.random()*200|0)
}
  







document.onkeydown = function(e) { // ctrl + enter to run code
  e.ctrlKey && (e.keyCode === 13 || e.keyCode === 83) && runCode() 
}
  






  
// avoiding regex replace as much as possible because operators (variables) can be almost any symbol
function replaceWith(str,find,replacement) { 
  const i = str.indexOf(find)
  return i < 0 ? str : replaceWith(
    str.slice(0,i) + replacement + str.slice(i + find.length), find, replacement)
}








Set_Up_Editor: {
    var editor = window.ace.edit(D('code'))
    // 3 favorites: eclipse, chrome, and gruvbox
    // test different editors: let COUNT = [0]
    // let THEMES = 'dracula,clouds_midnight,solarized_light,solarized_dark,xcode,iplastic,chrome,merbivore_soft,kuroir,idle_fingers,gruvbox,eclipse,crimson_editor,dreamweaver,clouds'.split`,`
    // document.onclick = function pick() { const t = THEMES[COUNT[0]++ % THEMES.length];editor.setTheme("ace/theme/" + t);console.log('theme =',t) }
    // editor.renderer.setShowGutter(false);
    const options = {
      enableBasicAutocompletion: true, // the editor completes the statement when you hit Ctrl + Space
      enableLiveAutocompletion: true, // the editor completes the statement while you are typing
      showPrintMargin: false, // hides the vertical limiting strip
      fontSize: "100%",
      maxLines: 100,
      autoScrollEditorIntoView: true,
      showGutter:false
    }
    editor.renderer.setShowGutter(false);
    editor.setAutoScrollEditorIntoView(true);
    // remove pretentious punctuation (that might come from a phone):
    let fromServer
    editor.getSession().on('change', function(e) {
        const newHeight = editor.getSession().getScreenLength() *
        (editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth());
        editor.container.style.height = `${newHeight}px`;
        editor.resize();
      if (fromServer) return;
      const s = editor.getValue()
      if (e.action === 'insert' && e.lines.some(l => /\\/.test(l))) {
        fromServer = true
        const {row, column} = editor.getCursorPosition()
        editor.setValue(s.split`\n`.map(s => 
          replaceWith(s,'\\',λ) ).join`\n`)
        editor.clearSelection()
        editor.selection.moveTo(row, column)
        fromServer = false
      }
    })
    editor.getSession().setValue(`


true    = λ fst snd . fst ;

false   = λ fst snd . snd ;

if      = λ cond then else . cond then else ;

and     = λ a b . a (b true false) false ;

or      = λ a b . a true (b true false) ;
    
not     = λ cond . cond false true ;

+       = λ n f x . f ( n f x ) ;

0       = λa b.b;
1       = + 0 ;
2       = 1 + 1 ;
3       = 1 + 1 + 1 ;
4       = 2 + 2 ;

isEven  = λ n . n not true;
isOdd   = λ n . not (isEven n);
        
        
            if true huh what
    

`)
    D('code').style.borderRadius = '10px'
    editor.setOptions(options);
    // editor.setTheme("ace/theme/chrome");
    // editor.getSession().setMode("ace/mode/javascript");
    editor.place = _ => {
      
      // if (window.innerWidth <= 700) return; 
      const row = editor.session.getLength() - 2
      editor.selection.moveTo(row)
      editor.navigateLineEnd()
      editor.focus()
    }
  }