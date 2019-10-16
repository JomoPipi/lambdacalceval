







function matchedParenthesis(exp) {
    return ![...exp].reduce((a,v) => a < 0 ? a : a + ({'(':1,')':-1}[v]||0),0)
}








function alphaEquivalent(a,b) {

    if (a.length !== b.length) 
        return alert('the lengths are not equal')
    if ([...a].some((c,i) => 'λ.()'.includes(c) && c !== b[i])) 
        return alert('some lambdas or dots or parenthesis are in the wrong place')
        
    return isEquiv(a,b) || alert('results are not alpha equivalent')
}








function equivFormat(x, outer_scope={}) {
    
    if (x[0] === λ) {
        let i = x.indexOf('.')
        const params = x.slice(1,i).trim().split` `
        params.forEach((p,i) => x = replaceWith(x,p,''+i))
        i = x.indexOf('.')+1
        return x.slice(0,i) + equivFormat(x.slice(i))
    }

    const terms = getTerms(x)
    return terms.length === 1 ? terms[0][0] === λ ? equivFormat(terms[0]) : terms[0] : gatherTerms(terms.map(equivFormat))

}

function isEquiv(a,b) {
    if (/[0-9]/.test(a)) // since renaming the variables with numbers, want to make sure nothing bad happens.
        return a === b

    if (a.length !== b.length)
        return false

    return equivFormat(a) === equivFormat(b)
}








function replaceWith(str,find,replacement) { 
    for (let i = 0; str[i]; i++) 
        if (str.startsWith(find,i)) 
            str = str.slice(0,i) + replacement + str.slice(i + find.length)

    return str
}








function dim(x) {
    return `<span class="dim" style="color:#777;"> ${x} </span>`
}








function clearIt (obj) {
    if (typeof obj.clear === 'function') return obj.clear()
    for (const i in obj)
        delete obj[i]
}








function escapeHTML(x) { 
    // this works because I replace the user's default <> symbols to unicode versions.
    return x.split(/\<.*?\>/).join`` 
}








function updateHistory(exp, then) {
    const hstry = HISTORY.map(escapeHTML)
    const index = hstry.reduceRight((a,v,i) =>  // find the first index, from the right, where exp === history[i]
        a == null && tokenize(finalStep(v))
        .every((x,i) => 
            tokenize(exp)[i] === x) ? i : a, 
    null)
    if (index) HISTORY.splice(index, Infinity)  // we don't need to see any steps that happen after we get the result)
    
    
    const finalResultAndStats = exp +           // enjoy some nice measurements
    '<br> <br> <br> <span style="display: inline-block; text-align:left; font-size: 1.5em;">' + 
    'Reduction steps:            ' + hstry.length +
    '<br> Number of tokens:      ' + hstry.reduce((a,v) => a + tokenize(v).length, 0) +
    '<br> Number of characters:  ' + hstry.reduce((a,v) => a + v.replace(/ /g,'').length, 0) +
    '<br> Calculation duration:  ' + (Date.now() - then) + 'ms </span>'

    HISTORY.push(finalResultAndStats)

    D('steps').innerHTML = '<br>' + HISTORY.join`<br><br>` + '<br><br>'
}