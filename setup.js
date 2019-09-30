
log=console.log
const D = x => document.getElementById(x) 


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
          s.replace(/\\/g,'λ') ).join`\n`)
        editor.clearSelection()
        editor.selection.moveTo(row, column)
        fromServer = false
      }
    })
    editor.getSession().setValue(`
2 = λab.a(ab); 
3 = λab.a(a(ab));
+ = λwyx.y(wyx); 
M = λxy.(λz.x(yz));
${'`'} = λf. ... create the "create infix operator";
* = ${'`'}M - infix multiplication;
P = λxy.yx;

P 2 3
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