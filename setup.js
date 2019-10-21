







const λ = 'λ'
log=console.log
function D(x) { return document.getElementById(x) }








function runCode() {
  D('output').innerHTML = 'ß-reduction in process...'
  setTimeout(_ => (
    D('output').innerHTML = completeReduction( 
      window.ace.edit(D('code')).getSession().getValue(), D('optimize').checked ), 
    D('code').focus()),
    100 + Math.random()*200|0)
}








document.body.onkeydown = function(e) { // ctrl + enter to run code
  e.ctrlKey && (e.keyCode === 13 || e.keyCode === 83) && runCode() 

  e.ctrlKey && e.keyCode === 81 && toggleNumbers(true)
}







function toggleNumbers(tgl) {
  editor.renderer.setShowGutter(D('togglenumbers').checked ^= +tgl);
}








Set_Up_Editor: {
    var editor = window.ace.edit(D('code'))
    const options = {
      showPrintMargin: false, // hides the vertical limiting strip
      fontSize: "100%",
      maxLines: Infinity,
      tabSize: 2
    }
    editor.setAutoScrollEditorIntoView(true);
    // editor.container.style.overflowY = 'auto'
    // editor.container.style.maxHeight = '55vh'
    let fromServer
    editor.getSession().on('change', function(e) {
        // const newHeight = editor.getSession().getScreenLength() * 
        // (editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth());
        // editor.container.style.height = `${newHeight * 1.5}px`;
        // editor.resize();
      if (fromServer) return;
      const s = editor.getValue()
      if (e.action === 'insert' && e.lines.some(l => /[\\<>]/.test(l))) {
        fromServer = true
        const {row, column} = editor.getCursorPosition()
        
        // keep the shape of the screen intact, because editor.setValue removes all the text before replacing it
        D('code-ghost').style.height = D('code').style.height

        editor.setValue(
          s.split`\n`.map(s => 
          replaceWith( 
            replaceWith(
              replaceWith(
                s,
              '>','˃')
            ,'<','˂')
          ,'\\',λ) ).join`\n`)
        D('code-ghost').style.height = 0
        editor.clearSelection()
        editor.selection.moveTo(row, column)
        fromServer = false
      }
    })
    editor.getSession().setValue(`
0 = λa b.b
1 = λa b.a b
2 = λa b.a(a b)
+ = λ w y x . y (w y x)

-- Following the last variable assignment should be the expression to be evaluated:

    + 1
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