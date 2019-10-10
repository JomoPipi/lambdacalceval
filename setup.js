







const λ = 'λ'
log=console.log
function D(x) { return document.getElementById(x) }








function runCode() {
  D('output').innerHTML = 'ß-reduction in process...'
  setTimeout(_ => (
    D('output').innerHTML = completeReduction( window.ace.edit(D('code')).getSession().getValue() ), 
    D('code').focus()),
    300 + Math.random()*200|0)
}








document.onkeydown = function(e) { // ctrl + enter to run code
  e.ctrlKey && (e.keyCode === 13 || e.keyCode === 83) && runCode() 
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
0 = λ a b . b
1 = λ a b . a b
2 = λ a b . a (a b)
addOne = λ w y x . y ( w y x )

-- Following the last variable assignment should be the expression to be evaluated:

    addOne 1
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








function alphaEquivalent(a,b) {

  if (a.length !== b.length) 
      return alert('the lengths are not equal')
  if ([...a].some((c,i) => 'λ.()'.includes(c) && c !== b[i])) 
      return alert('some lambdas or dots or parenthesis are in the wrong place')
      
  return isEquiv(a,b) || alert('results are not alpha equivalent')
}








function isEquiv(a,b) {
  // hey... checking functions for equality reduces to the halting problem.
  const [aterms,bterms] = [a,b].map(getTerms)
  const [al,bl] = [aterms.length,bterms.length]
  if (al !== bl)
      return false
  
  if (al > 1) 
      return aterms.every((x,i) => isEquiv(x, bterms[i]))

  const variables = new Set((a+b).split(/[λ.() ]+/))
  for(let i=65,j=0; a[j]; i++) {
      const c = String.fromCharCode(i);
      if ('λ.() '.includes(a[j])) j++
      if (variables.has(c)) continue
      if (!variables.has(a[j]) || !variables.has(b[j])) { j++; continue }
      a = replaceWith(a,a[j],c)
      b = replaceWith(b,b[j],c)
      j++
  }
  return a === b
}








function replaceWith(str,find,replacement) { 
  const i = str.indexOf(find)
  return i < 0 ? str : replaceWith(
    str.slice(0,i) + replacement + str.slice(i + find.length), find, replacement)
}