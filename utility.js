

function matchedParenthesis(exp) {
  return ![...exp].reduce((a,v) => a < 0 ? a : a + ({'(':1,')':-1}[v]||0),0)
}


function containsErrors(allLines) { 

    const lastLineWithEqualSign = allLines.reduce((a,v,i) => v.includes('=') ? i : a, -1)

    for (let row = 0; row <= lastLineWithEqualSign; row++) {
        const line=allLines[row].trim()
        if (!line) continue
        const col = line.indexOf('=')
        const col2 = line.lastIndexOf('=')

        if (col !== col2) 
            return doError("Names shouldn't contain equal signs, because we use them to declare names.", col2)

        const [name,value] = line.split`=`.map(x=>x.trim())

        if (/[λ.() ]/.test(name)) 
            return doError('Names shouldn\'t contains any of these characers <code>"λ.() ="</code>.', 0)

        const error = anyError(value, row, col+1)
        if (error) return error
    }
    
    const expression = allLines.slice(lastLineWithEqualSign+1)
        .map(s=>s.trim())
        .filter(s=>s).join` `
        .trim()

    if (!expression) 
        return doError('Error: Missing main expression', lastLineWithEqualSign+1, null)

    let rowIndex  = allLines.findIndex( (row,r) => r > lastLineWithEqualSign && row.trim().length && expression.startsWith(row.trim()))
    const error = anyError(expression,
        rowIndex,  // row
        [...allLines[rowIndex]].findIndex(c => c != ' ')) // column offset

    if (error) 
        return error

    return false
}


function anyError(line, row=0, ioffset=0) {

    const a = line.includes(λ), b = line.includes('.')
    if (a ^ b)
        return doError(`Error: expression contains ${a?λ:'.'} but not ${a?'.':λ}`, row, ioffset)

    if (!matchedParenthesis(line)) 
        return doError("Mismatched parenthesis", row, ioffset)
    
    for (let i=0, last, lastchar, realLast; i <= line.length; i++) {

        if (i === line.length) {
            if (last === λ) {
                return doError('Unterminated lambda head', row, i + ioffset)
            } else
                break 
        }

        if (realLast === '(' && line[i] === ')') 
            return doError('Empty expression inside parentheses', row, i + ioffset)

        realLast = line[i] === ' ' ? realLast : line[i]

        if (/[λ.]/.test(line[i])) {
            if (last === line[i]) 
                return doError(`Syntax error: two ${last} in a row in expression`, row, i + ioffset)
            
            if (last == null && line[i] == '.')
                return doError(`Syntax error: '.' without λ`, row, i + ioffset)

            last = line[i]
            if (/[λ.]/.test(lastchar) && lastchar + line[i] !== '.λ') 
                return doError(`Syntax error: ${lastchar+line[i]}`, row, i + ioffset)

            lastchar = line[i]
        } else lastchar = ''
    }
    if (line[0] === '.') 
        return doError(`Syntax error: .`, row, ioffset)
    
    if (/[λ.]/.test(line[line.length-1]))
        return doError(`Syntax error: unterminated lambda`, row, ioffset + line.length)
    
    return null
}


function doError(text, row, column) {
    editor.selection.moveTo(row, column)
    return text + ` (line ${row+1})`
}