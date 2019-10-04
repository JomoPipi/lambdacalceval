


const history = [], vars = {}

D('code').focus()
const improper = x => `<span style="color:red;">${x}</span>`

function F(code) {
    history.length = 0
    // clear variables from the last time
    for (let i in vars) delete vars[i]
    const lines = code.split`\n`
                      .map(s => s.split("--")[0]) // remove comments
                      .filter(x=>x.trim())
                      
    let lastLineWithEqualSign = lines.reduce((a,v,i) => v.includes('=') ? i : a, -1)
    
    const sections = lines.slice(0,lastLineWithEqualSign+1).map(v => 
        (([n,v]) => (vars[n] = v,[n,v])) // parse variable declarations
        (v.split`=`.map(x=>x.trim()) ))

    const expression = lines.slice(lastLineWithEqualSign+1)
                            .map(s=>s.trim())
                            .filter(s=>s).join` `
                            .trim()
                            
    if (sections.some(sec=>sec.length!==2)) return improper('improper code')

    let exp = stripUselessParentheses(betaReduce(expression))
    exp = exp.replace(/λ +/g, λ)
             .replace(/ +λ/g, λ)
             .replace(/\. +/g,'.')
             .replace(/ +\./g,'.')
             .replace(/\( +/g,'(')
             .replace(/ +\(/g,'(')
             .replace(/\) +/g,')')
             .replace(/ +\)/g,')')
             .replace(/(.λ|  )/g,' ')

    return exp
}

function betaReduce(e, outer_scope_awaits_lambda) {
    const V = x => (x in vars ? V(vars[x]) : x)
    const terms = getTerms(e)

    /* error checking for debug later */ if (terms.some(x=>!x)) throw 'find out what caused this'
    /* implement later if something goes wrong */ // if (!matchedParens(e)) throw 'what happened here'

    let a = V(terms[0])
    const b = terms[1] 

    if (a == null) throw 'something is wrong'

    if (b == null) {
    // if outer scope awaits a lambda, this is where we stop the recursion if a is a lambda
    // we need to check whether or not there is an outer value to apply a to (because, maybe, we recursed into this expression (e)).
    // if this is the case (a value outside is awaiting application), we should only try to reduce a by steps until it is a function

        if (![λ, ...Object.keys(vars)].some(t => a.includes(t))) {
            return a; // no possible way to reduce
        }
        if (outer_scope_awaits_lambda) {
            if (a[0] === λ) {
                return a; // yay recursion stopped!
            } else {
                return betaReduce(a, true)
            }
        } else {
            if (a[0] === λ) {
                const i = a.indexOf('.')
                return a.slice(0, i+1) + betaReduce(a.slice(i+1))
            } else {
                return betaReduce(a)
            }
        }
    }

    // now we caan worry about function application.
    // but first, a must be a lambda.
    if (a[0] !== λ) {
        a = betaReduce(a, true)
        if (a[0] !== λ) { // we can't reduce further on this scope
            return `(${a})(${terms.slice(1).map(x => betaReduce(x)).join(')(')})`
        }
    }

    // if code reaches here, then a is a lambda and we can simply apply it to b.
    const applied = applyAB(a,b)
    return betaReduce(   `(${applied})` + terms.slice(2).map(x => `(${x})`).join`` , outer_scope_awaits_lambda )
}
function applyAB(a,b) {
    /* 
        apply function a to expression b 
        don't rename any inner bound variables
    */
    const i = a.indexOf('.')
    const variables = a.slice(1,i).trim().split(' ') 
    // rename the other variables if they are equal to b or variables within b
    const btokens = new Set(tokenize(b))
    const allvars = new Set(variables.slice(1).concat(b))
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
    // if (variable === b) return head + body // nice!!

    // tokenize a and figure out which tokens equal to variable must not be replaced
    const tokens = tokenize(body)

    // basically, if we find variable between a λ and . in the body, 
    // then we must not replace until we reach the next corresponding ')'
    let level = 0, inhead = false
    return head + tokens.map(t => {
        if (replaceMap[t]) return replaceMap[t]
        inhead = t === λ ? true : t === '.' ? false : inhead
        if (level > 0) level += t === ')' ? -1 : t === '(' ? 1 : 0 
        if (inhead && level === 0 && t === variable) { level = 1 } 
        // we be in level 0 in order to replace variables
        return level === 0 && t === variable ? `(${b})` : t 
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