'use strict'

const HISTORY = [], VARIABLES = {}, EXP_MEMO = {}, MAXIMUM_OVERDRIVE = D('optimize'), DIVERGENT = new Set(), NORMAL_FORM = {}

const treadCarefully = (exp,outer) => finalStep(betaReduce(exp, { outer_scope_awaits_lambda: outer, limit: 100 }))

D('code').focus()

function completeReduction(code) {
    const then = Date.now()
    const allLines = code.split`\n`.map(s => s.split("--")[0]) 
    const improper = x =>                       // error style
        `<span style="color:#f44;">${x}</span>` 


    HISTORY.length = 0                          // clear variables from the last time
    for (const i in VARIABLES) delete VARIABLES[i]   
    for (const i in DIVERGENT) delete DIVERGENT[i]      
    for (const i in  EXP_MEMO) delete  EXP_MEMO[i]       

    const maybeError = containsErrors(allLines) // check for syntax errors
    if (maybeError.isError)
        return improper(maybeError.value)

    for (const name in VARIABLES) {
        const value = VARIABLES[name]
        try {
            const x = treadCarefully(value, true)
            if (MAXIMUM_OVERDRIVE.checked) 
                VARIABLES[name] = x
        } catch (e) {
            log('got an error while trying to optimize a variable:',name,value,e)
            VARIABLES[name] = value
            DIVERGENT.add(name)
        }
        HISTORY.length = 0
    }

    const expression = maybeError.value         // no syntax error detected
    const exp = finalize(expression)

    updateHistory(exp, then)

    if (tokenize(expression).length === 1)      // you probably want it expanded, if it's a definition, in this case
        return exp                             

    return finalStep(condense(exp))
}








function condense(exp, i) {
    i = (i || 0)
    if (i === 3) return exp // we don't need  to go too far
    for (const key in VARIABLES) {
        const vk = VARIABLES[key]
        if (isEquiv(vk, exp)) return key
        if (DIVERGENT.has(key)) continue
        HISTORY.length = HISTORY.iter = 0
        HISTORY.charLimit = vk.length * 20
        try {
            const reduced = NORMAL_FORM[key] || (NORMAL_FORM[key] = treadCarefully(vk, false))
            
            if (isEquiv(reduced, exp)) {
                return key // this will probably be simpler than the expression.
            }
        } catch (e) { log ('check out this error: ',e) }
    }
    if (exp[0] === λ) {
        const x = exp.indexOf('.')+1
        return exp.slice(0,x) + condense(exp.slice(x),i+1)
    }
    const terms = getTerms(exp)
    return terms.length === 1 ? terms[0] : gatherTerms(terms.map(x => condense(x,i+1)))
}








function finalize(exp) {
    return finalStep( betaReduce( exp ) )
}








function finalStep(exp) {
    return curryStep(stripUselessParentheses(
                gatherTerms(
                    getTerms(
                        exp)))
        .replace(/(λ +| +λ)/g, λ)
        .replace(/(\. +| +\.)/g,'.')
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
    const result = []
    for (let i = 0, headBuffer = ''; i < exp.length; i++) {
        if (exp[i] === '.' ) {
            result.push(clean( headBuffer ) + '.')
            headBuffer = ''
        }
        else if (exp[i] === λ) headBuffer = λ
        
        else if (headBuffer) headBuffer += exp[i]
        
        else result.push(exp[i])
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
    return result.join``
}








function betaReduce(expr, options={}) {
    const {outer_scope_awaits_lambda, outsideWrap,limit,charLimit} = options
    if (limit) {
        if (HISTORY.iter++ > limit || expr.length > charLimit)  
            throw "possible divergent expression"
    }
    const expand = x => (x in VARIABLES ? expand(VARIABLES[x]) : x)
    const exp = stripUselessParentheses(expr)
    const terms = getTerms(exp)
    const memokey = terms.slice(0,2).join`:`

    if (EXP_MEMO[memokey]) 
        return  betaReduce( EXP_MEMO[memokey] + gatherTerms(terms.slice(2)) , options )

    let a = expand(terms[0])
    const b = terms[1] 

    if (a == null) throw 'something is wrong'

    const wrap = outsideWrap || (x => x)
    HISTORY.push( wrap(exp) )


    if (a !== terms[0] && !terms[0].includes(a)) {
        const newExp = `(${a})` + gatherTerms(terms.slice(1))

        if (HISTORY.length && escapeHTML(HISTORY.slice(-1)[0]).includes(newExp))
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
                return a.slice(0, i+1) + betaReduce(a.slice(i+1), {
                    outsideWrap: makeWrap(wrap, a.slice(0,i+1), '', true),
                    outer_scope_awaits_lambda, 
                    charLimit,
                    limit
                })
            }
            else return betaReduce(a, options)
        }
    }


    if (a[0] !== λ) { // well, it needs to be a lambda in order to apply it to b
        a = betaReduce(a, { outer_scope_awaits_lambda: true, outsideWrap: makeWrap(wrap, '', gatherTerms(terms.slice(1))), limit, charLimit })
        // notice that we set outer_scope_awaits_lambda to true.
        // this means that the reductions will stop when it becomes a lambda, 
        // even if it's not yet fully reduced.

        if (a[0] !== λ) { // it didn't reduce to a lambda, so we can't reduce further on this scope
            const result = gatherTerms(terms.slice(1).reduce((a,term,i) => (
                [...a, betaReduce(term, {
                     outsideWrap: makeWrap(   wrap,   gatherTerms(a),   gatherTerms(terms.slice(1).slice(i+2))   ), 
                     charLimit,
                     limit
                })]
        ), [a]))

            return result
        }
    }


    // if code reaches here, then a is a lambda and we can simply apply it to b.
    const applied = `(${applyAB(a,b)})`
    if (MAXIMUM_OVERDRIVE.checked) EXP_MEMO[memokey] = applied
    return betaReduce(applied + gatherTerms(terms.slice(2)) , options)
}










function gatherTerms(terms) {
    return terms.map(x => tokenize(x).length === 1 ? x : `(${x})`).join` `
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
    const body = a.slice(i+1)

    const tokens = tokenize(body)

    // basically, if we find variable between a λ and . in the body, 
    // then we must not replace until we reach the next corresponding ')'
    let level = 0, inhead = false
    return head + tokens.map(t => {
        if (replaceMap[t]) return replaceMap[t]
        inhead = t === λ ? true : t === '.' ? false : inhead
        if (level > 0) level += t === ')' ? -1 : t === '(' ? 1 : 0 
        if (inhead && level === 0 && t === variable) { level = 1 } 
        const replacement = btokens.size === 1 ? b : `(${b})`
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
    while (true) {
        const i = [...t].findIndex((v,j) => v==='(' && t[j+2] === ')')
        if (i >= 0) {
            t = (t.slice(0,i) + ' ' + t[i+1] + ' ' + t.slice(i+3)).trim()
            continue
        }
        if (t[0]==='(') {
            for(let i=1,x=1; t[i]; i++) {
                x += t[i] === '(' ?  1 : t[i] === ')' ? -1 : 0
                if (!x && t[i+1]) return t
            }
            t = (t.slice(1,-1)).trim()
            continue
        }
        return t
    }
}
