







function matchedParenthesis(exp) {
    return ![...exp].reduce((a,v) => a < 0 ? a : a + ({'(':1,')':-1}[v]||0),0)
}








function alphaEquivalent(a,b) {

    log('now testing for equivalence: '+a+'   and   '+b)

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

function equivFormat(x, nf) {
    const i = x.indexOf(λ)

    if (i === 0) {
        const i = x.indexOf('.')
        const params = x.slice(1,i).trim().split` `
        return equivFormat(params.reduce(a => applyAB(a, nf(), new Set()), x), nf)
    }
    if (i < 0)
        return x

    const terms = getTerms(x)
    return terms.length === 1 ? 
        terms[0][0] === λ ? equivFormat(terms[0], nf) : terms[0] : 
        gatherTerms(terms.map(x => equivFormat(x, nf)))

}

//   SLOW

function isEquiv(a,b) {
    const ab = a + b, setA = new Set(ab), setB = new Set(ab)
    const nfa = makeNextFreeVarFunc(setA)
    const nfb = makeNextFreeVarFunc(setB)

    if (equivFormat(a,nfa) !== equivFormat(b,nfb)) return false
    return setA.size === setB.size
}

// function isEquiv(a,b) {
//     // checks two non divergent lambda expressions for equivalence
//     // it is assumed they will have the same structure, (same parenthesis and lambdas)
//     const nf = makeNextFreeVarFunc(new Set(a+b))
//     while (1) {
//         const [ai,bi] = [a,b].map(x => x.indexOf(λ))
//         if (ai < 0 || bi < 0) break

//         const x = nf()
//         const [at,bt] = [a,b].map(getTerms), [al,bl,atl,btl] = [a,b,at,bt].map(x => x.length)
//         if (atl !== btl) return false

//         if (atl === 1) {
//             if (ai === 0) {
//                 if (bi !== 0) return false
//                 a = applyAB(a,x)
//                 b = applyAB(b,x)
//                 continue
//             }    
//             else {
//                 if (bi === 0) return false
//                 const fronta = a.slice(0,ai), frontb = b.slice(0,bi)
//                 if (fronta !== frontb) return false
//                 const mida = a.slice(ai).split``
//                     .reduce((a,v,i) => {
//                         (a += ({'(':1, ')':-1})[v] || 0)
//                         a < 0 ? a : a + ({'(':1,')':-1}[v]||0),0
//                     }, 0)
//             }
//         }

        
        
        
//     }
//     return a === b
// }








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
    // if (y > z) x = x.slice(0, z) + '  ... ' + x.slice(y - z)
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