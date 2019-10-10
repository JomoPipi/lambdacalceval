

const HISTORY = [], VARIABLES = {}

D('code').focus()

function completeReduction(code) {

    const allLines = code.split`\n`.map(s => s.split("--")[0]) 
    const improper = x =>                       // error style
        `<span style="color:#f44;">${x}</span>` 


    HISTORY.length = 0                          // clear variables and reduction steps from the last time
    for (let i in VARIABLES) delete VARIABLES[i]          


    const maybeError = containsErrors(allLines) // check for syntax errors
    if (maybeError.isError)
        return improper(maybeError.value)

    const expression = maybeError.value         // no syntax error detected
    let exp = finalize(expression)
    updateHistory_complete(exp)

    if (tokenize(expression).length === 1)      // you probably want it expanded, if it's a definition, in this case
        return exp                             

    for (const key in VARIABLES) {
        try { // will fail if thee value is divergent
            if (isEquiv(finalize(VARIABLES[key]), exp)) {
                exp = key // we want to replace the exp with a variable name, if possible.
                break
            }
        } catch (e) { log('Hey look a error: ',e) }
    }

    return exp
}








function finalize(exp) {
    return finalStep( betaReduce( exp ) )
}








function finalStep(exp) {
    return curryStep(stripUselessParentheses(
                gatherTerms(
                    getTerms(
                        exp)))
        .replace(/λ +/g, λ)
        .replace(/ +λ/g, λ)
        .replace(/\. +/g,'.')
        .replace(/ +\./g,'.')
        .replace(/\( +/g,'(')
        .replace(/ +\(/g,'(')
        .replace(/\) +/g,')')
        .replace(/ +\)/g,')'))
}








function curryStep(exp) {
    // old way: simply: return exp.replace(/(\.λ|  )/g,' ')   
    // problem:
    // false = λa b.b
    // λa b. false a   ->   λa b b.b

    // solution
    // if variables in heads are duplicated, we just have to rename the "victims" of duplication.
    // ex: λa b. false a   ->   λa x b.b
    const allvars = new Set(tokenize(exp).filter(x => !/[.λ()]/.test(x) ))
    const nextFree = _ => {
        for(let i = 97;;i++) {
            const c = String.fromCharCode(i)
            if (!allvars.has(c)) {
                allvars.add(c)
                return c
            }
        }
    }
    exp = exp.replace(/(\.λ|  )/g,' ')   
    // clear out the duplicates in the heads
    let result = ''
    for (let i = 0, headBuffer = ''; i < exp.length; i++) {
        if (exp[i] === '.' ) {
            result += clean( headBuffer ) + '.'
            headBuffer = ''
        }
        else if (exp[i] === λ) headBuffer = λ
        
        else if (headBuffer) headBuffer += exp[i]
        
        else result += exp[i]
    }
    function clean(head) {
        // first term is λ, so remove it, for now
        const h = head.slice(1).trim()
        const terms = h.split(/ +/)
        for (let i = 0; i < terms.length; i++) 
            if (terms.lastIndexOf(terms[i]) !== i) {
                terms[i] = nextFree()
                return clean(λ + terms.join` `)
            }
        return head // no duplicates found
    }
    return result 
}








function betaReduce(expr, options) {
    const {outer_scope_awaits_lambda, outsideWrap} = (options=options||{})
    const expand = x => (x in VARIABLES ? expand(VARIABLES[x]) : x)
    const exp = stripUselessParentheses(expr)
    const terms = getTerms(exp)

    let a = expand(terms[0])
    const b = terms[1] 

    if (a == null) throw 'something is wrong'

    const wrap = options.outsideWrap = outsideWrap || (x => x)
    HISTORY.push( wrap(exp) )


    if (a !== terms[0] && !terms[0].includes(a)) {
        const newExp = `(${a})` + gatherTerms(terms.slice(1))

        while (HISTORY.length && escapeHTML(HISTORY.slice(-1)[0]).includes(newExp))
            HISTORY.pop() // filter out duplicate history
            
        HISTORY.push( wrap( newExp ) )
    }
        

    if (b == null) {
        const tokens = tokenize(a)

        if (![λ, ...Object.keys(VARIABLES)].some(t => tokens.includes(t))) {
            return a; // no lambdas, no variables, no possible way to reduce
        }
        if (outer_scope_awaits_lambda) {

            return a[0] === λ ?
            a // it's a function, which is what the outer scope was waiting for, so we can end the recursion here.
            : betaReduce(a, options) // it's not a function, so we should recurse into it and try to see if it resolves to one.

        } else {
            if (a[0] === λ) { // we have a lambda, so return head + betaReduce(body)
                const i = a.indexOf('.') 
                return a.slice(0, i+1) + betaReduce(a.slice(i+1), {outsideWrap: makeWrap(wrap, a.slice(0,i+1), '', true) })
            }
            else return betaReduce(a, options)
        }
    }


    if (a[0] !== λ) { // well, it needs to be a lambda in order to apply it to b
        a = betaReduce(a, { outer_scope_awaits_lambda: true, outsideWrap: makeWrap(wrap, '', gatherTerms(terms.slice(1))) })
        // notice that we set outer_scope_awaits_lambda to true.
        // this means that the reductions will stop when it becomes a lambda, 
        // even if it's not yet fully reduced.

        if (a[0] !== λ) { // it didn't reduce to a lambda, so we can't reduce further on this scope
            const result = gatherTerms(terms.slice(1).reduce((a,term,i) => 

                [...a, betaReduce(term, { 
                    outsideWrap: 
                        makeWrap(   wrap,   gatherTerms(a),   gatherTerms(terms.slice(1).slice(i+2))   )
                })]

            , [a]))

            return result
        }
    }


    // if code reaches here, then a is a lambda and we can simply apply it to b.
    const applied = applyAB(a,b)
    return betaReduce(`(${applied})` + gatherTerms(terms.slice(2)) , options)
}








function makeWrap(oldwrap, a, b, NoP) {
    const [l,r] = NoP ? ['',''] : '()'
    return s => oldwrap(
        dim((a||'') + l) + s +
        dim(r + (b||''))) 
}








function dim(x) {
    return `<span class="dim" style="color:#777;"> ${x} </span>`
}








function gatherTerms(terms) {
    return terms.map(x => tokenize(x).length === 1 ? ` ${x} ` : `(${x})`).join``
}








function escapeHTML(x) { 
    // this works because I replace the user's default <> symbols to unicode versions.
    return x.split(/\<.*?\>/).join`` 
}








function applyAB(a,b) {
    /* 
        apply function a to expression b 
        don't rename any bound variables of lambdas inside b
    */
    const i = a.indexOf('.')
    const variables = a.slice(1,i).trim().split(' ') 
    // rename the other variables if they are equal to b or variables within b
    const btokens = new Set(tokenize(b))
    const allvars = new Set(variables.concat(b))
    const nextFree = _ => {
        for(let i = 97;;i++) {
            const c = String.fromCharCode(i)
            if (!allvars.has(c)) {
                allvars.add(c)
                return c
            }
        }
    }
    const replaceMap = variables.slice(1).reduce((a,v) => btokens.has(v) ? (a[v] = nextFree(), a) : a, {})
    for (const i in variables) {
        if (replaceMap[variables[i]])
            variables[i] = replaceMap[variables[i]]
    }
    const variable = variables[0]
    const head = variables.length === 1? '' : λ + variables.slice(1).join` ` + '.'
    body = a.slice(a.indexOf('.')+1)

    const tokens = tokenize(body)

    // basically, if we find variable between a λ and . in the body, 
    // then we must not replace until we reach the next corresponding ')'
    let level = 0, inhead = false
    return head + tokens.map(t => {
        if (replaceMap[t]) return replaceMap[t]
        inhead = t === λ ? true : t === '.' ? false : inhead
        if (level > 0) level += t === ')' ? -1 : t === '(' ? 1 : 0 
        if (inhead && level === 0 && t === variable) { level = 1 } 
        const replacement = tokenize(b).length == 1 ? b : `(${b})`
        // we need to be in level 0 in order to replace variables
        return level === 0 && t === variable ? replacement : t 
    }).join` `
}







function tokenize(s) {
    let variableBuffer = false
    return [...s].reduce((a,v) => {
        if (!'λ. ()'.includes(v)) {
            if (!variableBuffer) a.push('')
            variableBuffer = true
        } else {
            variableBuffer = false
        }
        return v === ' ' ? a :
        variableBuffer ? (a[a.length-1] += v, a) :
        [...a, v]
    }, [])
}








function getTerms(s) {
    return [...s].reduce(([r,x,y,z],v) => {
        const a = v==='(', b = v===')', c = x===1, d = v===λ
        if (d && x === 0 && !y) { r.push(''); y=1 }
        if (y) { r[r.length-1] += v; return [r,x,y,z] }
        if (x > 0) { 
            if (!(b&&c)) r[r.length-1] += v
            return [r, x + (({')':-1,'(':1})[v]||0)] 
        }
        if (!(/([(). λ]|\s)/).test(v)) { if (!z) r.push(''); z=1 }
        else z=0
        if (z) { r[r.length-1] += v; return [r,x,y,z] }
        if (a) return [[...r,''],x+1]
        return [/\s/.test(v) ? r : [...r,v], x, y, z]
    },[[],0,0,0])[0].map(stripUselessParentheses)
}








function stripUselessParentheses(t) {
    // strip away unnecessary parenthesis
    t = t.trim()
    const i = [...t].findIndex((v,j) => v==='(' && t[j+2] === ')')
    if (i >= 0) return stripUselessParentheses(t.slice(0,i) + ' ' + t[i+1] + ' ' + t.slice(i+3))
    if (t[0]==='(') {
        for(let i=1,x=1; t[i]; i++) {
            x += t[i] === '(' ?  1 : t[i] === ')' ? -1 : 0
            if (!x && t[i+1]) return t
        }
        return stripUselessParentheses(t.slice(1,-1))
    }
    return t
}








function updateHistory_complete(exp) {
    const hstry = HISTORY.map(escapeHTML)
    const index = hstry.reduceRight((a,v,i) =>  // find the first index, from the right, where exp === history[i]
        a == null && tokenize(finalStep(v))
        .every((x,i) => 
            tokenize(exp)[i] === x) ? i : a, 
    null)
    if (index) HISTORY.splice(index, Infinity)  // we don't need to see any steps that happen after we get the result)
    
    
    const finalResultAndStats = exp +           // enjoy some nice measurements
    '<br> <br> <br> <span style="display: inline-block; text-align:left; font-size: 1.5em;">' + 
    'Reduction steps: ' + hstry.length +
    '<br> Number of tokens:  ' + hstry.reduce((a,v) => a + tokenize(v).length, 0) +
    '<br> Number of characters:  ' + hstry.reduce((a,v) => a + v.replace(/ /g,'').length, 0) + '</span>'

    HISTORY.push(finalResultAndStats)

    D('steps').innerHTML = '<br>' + HISTORY.join`<br><br>` + '<br><br>'
}





// -- just putting this lambda calculus code somewhere:

// true  = λ a b . a
// false = 0
// and   = λ a b . a (b true 0) 0
// not   = λ b . b false true
// or    = λ a b . a true (b true 0)
// xor   = λ a b . a (b false true) (b true false)

// `     = λ a op b . op a b
// §     = λ p.[](snd p)(+(snd p))
// []    = λ a b s . s a b 
// [     = λ a , b ] s . s a b -- different list syntax
// fst   = λ p . p true
// snd   = λ p . p false

// 0 = λ a b . b
// 1 = + 0
// 2 = + 1
// 3 = + 2
// 4 = + 3
// 5 = + 4
// 6 = + 5
// 7 = + 6
// 8 = + 7
// 9 = + 8
// 10 = + 9

// +   = λ w y x . y ( w y x )
// -1  = λ n . fst (n § ([] 0 0))
// -   = λ a b . b -1 a
// ＝0 = λ n . n (λx.false) true
// ≥   = λ a b . ＝0 (` b - a)
// ˃   = λ a b . not (` b ≥ a)
// ≤   = λ a b . ＝0 (` a - b)
// ˂   = λ a b . not (` a ≥ b)
// ＝  = λ a b . ＝0 ((- a b) + (- b a)) -- less efficient, but more readable: λ a b . and (≤ a b) (≥ a b)

// -- 1: less, 2: equal, 3: greater
// cmp = λ a b . (` a ˂ b) 1 ((` a ˃ b) 3 2)

// -- define integers
// -- positives: (true, n)
// -- negatives: (false,n)

// -- "construct" positive
// pos = λ n . [] true n

// -- "construct" negative
// neg = λ n . [] false n

// ≥0  = fst

// ˂0  = λ n . not (≥0 n)

// -- cmpInts = λ a b .

// abs = snd

// invert = λ n . [(˂0 n),(abs n)] -- additive inverse
// +_5 = pos 5
// -_9 = neg 9
// +_9 = pos 9
// -_4 = neg 4
// -- add +_5 -_9

// -- verbose 
// -- add = λ a b . (xor(≥0 a)(≥0 b)) ((˃ (abs a) (abs b)) ([] (≥0 a) (- (abs a) (abs b))) ([] (≥0 b) (- (abs b) (abs a)))) ( [] (≥0 a) ((abs a) + (abs b)) )
// -- Reduction steps: 586, Number of tokens: 74228, Number of characters: 112087

// -- dry, readable
// -- add = λ a b . (λ A B C D . (` C xor D)   ( (` A ˃ B) ([ C , (` A - B) ]) [ D , (` B - A) ] )   ([ C , (A + B) ])) (abs a) (abs b) (≥0 a) (≥0 b)
// -- Reduction steps: 600, Number of tokens: 77567, Number of characters: 114691


// -- compact 
// add = λ a b . (λ A B C D . (xor C D)   ( (˃ A B) ([] C (- A B)) [] D (- B A) )   ([] C (A + B))) (abs a) (abs b) (≥0 a) (≥0 b)
// -- Reduction steps: 590, Number of tokens: 73355, Number of characters: 111316

// -- sub = λ a b . add a ([] (˂0 b) (abs b))

// sub = λ a b . add a (invert b)

// sub +_5 -_4