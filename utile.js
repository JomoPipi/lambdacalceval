







function matchedParenthesis(exp) {
    return ![...exp].reduce((a,v) => a < 0 ? a : a + ({'(':1,')':-1}[v]||0),0)
}








function alphaEquivalent(a,b) {

    if (a.length !== b.length) 
        return alert('the lengths are not equal')

    if ([...a].some((c,i) => 'λ.()'.includes(c) && c !== b[i])) 
        return alert('some lambdas or parentheses or dots are in the wrong place')
        
    return isEquiv(a,b) || alert('results are not alpha equivalent')
}








// function equivFormat(x, y=0) {
    
//     if (x[0] === λ) {
//         const i = x.indexOf('.')
//         const params = x.slice(1,i).trim().split` ` // this is safe because numbers are never in params
//         params.forEach((p,i) => x = replaceWith(x, p, ''+(i+y)) )
//         const j = x.indexOf('.')+1
//         return x.slice(0,j) + equivFormat(x.slice(j), params.length + y)
//     }

//     const terms = getTerms(x)
//     return terms.length === 1 ? 
//         terms[0][0] === λ ? equivFormat(terms[0], y) : terms[0] : 
//         gatherTerms(terms.map((x,i) => equivFormat(x, y + 42*(i+1))))

// }

function equivFormat(x, nf, y=0) {
    const i = x.indexOf(λ)

    if (i === 0) {
        const i = x.indexOf('.')
        const params = x.slice(1,i).trim().split` `
        return params.reduce(a => applyAB(a, nf()), x)
    }
    if (i < 0)
        return x

    const terms = getTerms(x)
    return terms.length === 1 ? 
        terms[0][0] === λ ? equivFormat(terms[0], nf, y) : terms[0] : 
        gatherTerms(terms.map((x,i) => equivFormat(x, nf, y + 42*(i+1))))

}

function isEquiv(a,b) {

    // if (a.length === b.length)
    //     return false
    const nf = makeNextFreeVarFunc(new Set(a+b))
    const nf2 = makeNextFreeVarFunc(new Set(a+b))
    const f = x => (log(x),x)
    return f(equivFormat(a,nf)) === f(equivFormat(b,nf2))
    // const nextFree = makeNextFreeVarFunc(new Set(tokenize(a).concat(tokenize(b)).concat(Object.keys(VARIABLES))))
    // while (a[0] === λ && b[0] === λ) {
    //     const x = nextFree()
    //     a = betaReduce(`(${a})(${x})`, {outer_scope_awaits_lambda: true })
    //     b = betaReduce(`(${b})(${x})`, {outer_scope_awaits_lambda: true })
    // }
    // return a === b
}








function replaceWith(str,find,replacement) { 
    for (let i = 0; str[i]; i++) 
        if (str.startsWith(find,i)) 
            str = str.slice(0,i) + replacement + str.slice(i + find.length)

    return str
}








function dim(x, a) {
    const space = 180
    const y = x.length
    const z = space/2 > a ? space/2 - a : 0
    if (y > z) x = x.slice(0, z) + '  ... ' + x.slice(y - z)
    return `<span class="dim" style="color:#777;"> ${x} </span>`
}








function clearIt (obj) {
    for (const i in obj)
        delete obj[i]
}








function escapeHTML(x) { 
    // this works because I replace the user's default <> symbols to unicode versions.
    return x.split(/\<.*?\>/).join`` 
}








function updateHistory(exp, then) {
    const hstry = HISTORY.map(escapeHTML)
    const l = hstry.length
    for (var i = l-1, limit = Math.max(1,l-10); ; i--) {
        if (i <= limit) { i = null; break }
        const v = hstry[i]
        if (tokenize(finalStep(v)).every((x,j) => tokenize(exp)[j] === x))
            break;
    }
    if (i) HISTORY.splice(i, Infinity)  // we don't need to see any steps that happen after we get the result)
    
    const finalResultAndStats = exp +           // enjoy some nice measurements
    '<br> <br> <br> <span style="display: inline-block; text-align:left; font-size: 1.5em;">' + 
    'Reduction steps:            ' + hstry.length +
    '<br> Number of tokens:      ' + hstry.reduce((a,v) => a + tokenize(v).length, 0) +
    '<br> Number of characters:  ' + hstry.reduce((a,v) => a + v.replace(/ /g,'').length, 0) +
    '<br> Calculation duration:  ' + (Date.now() - then) + 'ms </span>'

    HISTORY.push(finalResultAndStats)

    D('steps').innerHTML = '<br>' + HISTORY.join`<br><br>` + '<br><br>'
}