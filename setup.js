







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
    const options = {
      enableBasicAutocompletion: true, // the editor completes the statement when you hit Ctrl + Space
      enableLiveAutocompletion: true, // the editor completes the statement while you are typing
      showPrintMargin: false, // hides the vertical limiting strip
      fontSize: "100%",
      maxLines: 100,
      autoScrollEditorIntoView: true,
      showGutter:false,
      tabSize: 2
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

    -- Welcome to my λ-calculus interpreter!

    true   = λ fst snd . fst 
    
    false  = λ fst snd . snd 
    
    if     = λ cond then else . cond then else 
        
    not    = λ cond . cond false true 
    
    -- Following the last variable assignment should be the expression to be evaluated:

  if (not true) huh what
`)
    D('code').style.borderRadius = '10px'
    editor.setOptions(options);
    editor.setTheme("ace/theme/gruvbox");
    editor.getSession().setMode("ace/mode/cobol"); // actually it's the lamdba mode!!
    editor.place = _ => {
      
      // if (window.innerWidth <= 700) return; 
      const row = editor.session.getLength() - 2
      editor.selection.moveTo(row)
      editor.navigateLineEnd()
      editor.focus()
    }
}

D('showsteps').onclick = _ => showReductionSteps()
function showReductionSteps() {
  const steps = D('steps')
  steps.style.maxHeight = steps.style.maxHeight ? null : ~~(steps.scrollHeight*20) + 'px'
}

let lightTheme = false
function toggleTheme() { 
  lightTheme ^= true
  D('main-text').classList.toggle('light-theme');
  D('output').classList.toggle('lt-output')
  document.body.classList.toggle('light-body')
  editor.setTheme( lightTheme ? "ace/theme/chrome" : "ace/theme/gruvbox");
  D('toggle-theme').classList.toggle('mybtndark')
  D('showsteps').classList.toggle('mybtndark')
  D('steps').classList.toggle('lt-steps')
}