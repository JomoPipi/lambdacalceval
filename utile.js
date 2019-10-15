







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








function isEquiv(a,b) {
    // hey... checking functions for equality reduces to the halting problem.
    // this can only go so far.
    const [aterms,bterms] = [a,b].map(getTerms)
    const [al,bl] = [aterms.length,bterms.length]
    if (al !== bl)
        return false

    if (al > 1) 
        return aterms.every((x,i) => isEquiv(x, bterms[i]))

    const variables = new Set((a+b).split(/[λ.() ]+/))
    for(let i=97,j=0; a[j]; i++) {
        const c = String.fromCharCode(i);
        if ('λ.() '.includes(a[j])) j++
        if (variables.has(c)) continue
        if (!variables.has(a[j]) || !variables.has(b[j])) { j++; continue }
        a = replaceWith(a,a[j],c)
        b = replaceWith(b,b[j],c)
        if (a === b) return true
        j++
    }
    return a === b
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