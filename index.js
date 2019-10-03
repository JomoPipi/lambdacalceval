


const history = [], vars = {}

D('code').focus()
const improper = x => `<span style="color:red;">${x}</span>`

function F(code) {
    history.length = 0
    const Q = x => (log(x),x)
    // clear variables from the last time
    for (let i in vars) delete vars[i]

    const sections = Q(code.split`;`.slice(0,-1)).map(v => 
        (([n,v]) => (vars[n] = v,[n,v])) // parse variable declarations
        (v.split`=`.map(x=>x.trim()) ))

    const expression = code.slice(code.lastIndexOf(';')+1).trim()

    if (sections.some(sec=>sec.length!==2)) return improper('improper code')

    return betaReduce(expression)
}

function betaReduce(e, outer_scope_awaits_lambda) {

    const V = x => (log(x), x in vars ? V(vars[x]) : x)
    const terms = getTerms(e)

    /* error checking for debug later */ if (terms.some(x=>!x)) throw 'find out what caused this'
    /* implement later if something goes wrong */ // if (!matchedParens(e)) throw 'what happened here'

    log('terms =',terms)
    
    const [a,b] = [V(terms[0]), terms[1]] // we apply the first term to the second in normal order reduction,

    if (a == null) throw 'something is wrong'

    if (b == null) {
    // if outer scope awaits a lambda, this is where we stop the recursion if a is a lambda
    // we need to check whether or not there is an outer value to apply a to (because, maybe, we recursed into this expression (e)).
    // if this is the case (a value outside is awaiting application), we should only try to reduce a by steps until it is a function

        if (![λ,'.',' '].some(t => a.includes(t))) 
            return a; // no possible way to reduce

        if (outer_scope_awaits_lambda) {
            if (a[0] === λ) {
                return a; // yay recursion stopped!
            } else {
                return betaReduce(a, true)
            }
        } else {
            if (a[0] === λ) {
                const i = a.indexOf('.')
                return a.slice(0, i) + betaReduce(a.slice(i+1))
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
}



function getTerms(s) {
    return [...s].reduce(([r,x,y],v) => {
        const a = v==='(', b = v===')', c = x===1
        if (v===λ && x === 0 && !y) { r.push(''); y=1 }
        if (y) { r[r.length-1] += v; return [r,x,y] }
        if (x > 0) { 
            if (!(b&&c)) r[r.length-1] += v
            return [r, x + (({')':-1,'(':1})[v]||0)] 
        }
        if (a) return [[...r,''],x+1]
        return [/\s/.test(v) ? r : [...r,v], x]
    },[[],0,0])[0].map(stripUselessParentheses)
}




function stripUselessParentheses(t) {
    // strip away unnecessary parenthesis
    t = t.trim()
    const i = [...t].findIndex((v,j) => v==='(' && t[j+2] === ')')
    if (i >= 0) return stripUselessParentheses(t.slice(0,i) + t[i+1] + t.slice(i+3))
    if (t[0]==='(') {
        for(let i=1,x=1; t[i]; i++) {
            x += t[i] === '(' ?  1 : t[i] === ')' ? -1 : 0
            if (!x && t[i+1]) return t
        }
        return stripUselessParentheses(t.slice(1,-1))
    }
    return t
}




function curryString(s) {
    return replaceWith(s,'.λ','')
}




function uncurryString(s) {
    // regex replace warning!!!!!!, if code is ever buggy, this is a suspect.
    return [...s.replace(/λ(\w+)\./g,"[$1]")].reduce(([s,x],v,i) =>
        '[]'.includes(v) ? [s,x^=1] : [s+(x?λ+v+'.':v),x]
    ,['',0])[0]
}




function updateHistory(s) {
    // check if infinite loop:
    const i = history.lastIndexOf(s), l = history.length
    if (i >= 0) {
        // if (l > 1 && history.slice(0,i).join`:`.endsWith(history.slice(i).join`:`)) {
        if (l > 1000) {
            // log('history =',history)
            return history.slice(0,15).join`<br>` + '<br>...<br>[ divergent expression ]'
        }
    }
    history.push(s)
    log('history.length =',history.length)
}

function applyAB( a, b) { 
    /* 
        apply function a to expression b 
        don't rename any inner bound variables
    */
    let y = 0
    return  [...a.slice(3)].map((x,i) => {
        const z = x === a[1]
        if (z && a[i-1+3] === λ) 
            y = a[i-2+3] === '(' ? 1 : Infinity
        if (y > 1) 
            y += x === '(' ? 1 : x === ')' ? -1 : 0
        return y === 0 && z ? `(${b})` : x
    }).join`` 
}



// function betaReduce(s, innerBit) {

//     V = x => innerBit ? x : (x)
//     s = stripUselessParentheses(s)
//     if (!innerBit) updateHistory(s)
//     const terms = getTerms(s)

//     log('terms[0] =',terms[0])

//     let expanded = false
//     while (vars[terms[0]]) {
//         expanded = true
//         terms[0] = uncurryString(vars[terms[0]]);
//     }
//     if (!expanded && !s.includes('(')) { // no application to do 
//         return s
//     }
//     let [a,b] = terms
//     if (a == null) return V(improper(s));

//     if (b == null) {
//         log('here')
//         return  a.length === 1 ? a : 
//                 a[0] === λ ? s.slice(0,3) + betaReduce(s.slice(3), true) : // if first character is not ( or 'λ, it's a variable
//                 (_=>{ throw 'why does a variable have length greater than 1?'})()
//     }

//     if (a[0] !== λ) { // first term isn't a lambda
//         if (a[0] === '(') terms[0] = betaReduce(a,true)

//         if (terms[0] !== a) {
//             return betaReduce( '(' + terms[0] + ')' + ('(' + terms.slice(1).join`)(` + ')'), innerBit )
//         }
//         return stripUselessParentheses('(' + terms.map(x => betaReduce(x, true)).join`)(` + ')')
//     }

//     // regex replace... must replace...
//     const [avars,bvars] = [a,b].map(s=>Array.from(new Set(s.replace(/[λ.()]/g,''))))
//     const allvars = new Set([...avars,...bvars])
//     const [aboundvars,bboundvars] = [avars,bvars]
//         .map((x,i)=>x.filter(v => [a,b][i].includes(λ+v)))
    
//     const freeavars = avars.filter(v => !aboundvars.includes(v))
//     const alpha = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']

//     // renaming of variables in an expression a b:
//     //   we only rename bound variables.
//     //   we only rename variables in a if:
//     //     they are the same as any in b
//     //   we only rename variables in b if:
//     //     they are the same as any free variables in a 

//     ;[[aboundvars,bvars],[bboundvars,freeavars]].forEach(([A,B],i) => 
//         A.forEach(v => {
//             if (B.includes(v)) {
//                 for (const c of alpha) {
//                     if (!allvars.has(c)) {
//                         allvars.add(c)
//                         if (!i) 
//                             a = terms[0] = replaceWith(a,v,c)
//                         else
//                             b = terms[1] = replaceWith(b,v,c)
//                         return;
//                     }
//                 }
//                 throw "can't rename more variables"
//             }
//         })
//     )
    
//     const applied = applyAB(a,b)
//     const t = '(' + applied + ')' +  (terms.length > 2 ? ('(' + terms.slice(2).join`)(` + ')') : '')
        
//     log('here t =',t)
//     return betaReduce(t, innerBit)
// }



// let cnt = 0
// function betaReduce(s) {
//     // only recurse inward when outermost head cannot be applied
//     const steps = [s]
//     for (;;) {
//         s = stripUselessParentheses(s)
//         const terms = getTerms(s)

//         let expanded = false
//         while (vars[terms[0]]) {
//             expanded = true
//             terms[0] = uncurryString(vars[terms[0]]);
//         }
//         if (!expanded && !s.includes('(')) { // no application to do 
//             return s
//         }
//         let [a,b] = terms
//         if (!a) return improper(s);
    
//         if (b == null) {
//             if (a.length === 1) return a
//             if (a[0] === λ) return s.slice(0,3) + betaReduce(s.slice(3)) // maybe try to only allow one step of recursion
//         }

//         if (a[0] !== λ) { // first term isn't a lambda
//             if (a[0] === '(') terms[0] = betaReduce(a)
    
//             if (terms[0][0] === λ) {
//                 return betaReduce( '(' + terms[0] + ')' + ('(' + terms.slice(1).join`)(` + ')'))
//             }
            
//             const S = stripUselessParentheses('(' + terms.map(x => betaReduce(x)).join`)(` + ')')
//             const T = getTerms(S)
//             if (T[0][0] === λ) { 
//                 a = terms[0] = T[0]; break
//             }
//             return S
//         }

//         // regex replace... must replace...
//         const [avars,bvars] = [a,b].map(s=>Array.from(new Set(s.replace(/[λ.()]/g,''))))
//         const allvars = new Set([...avars,...bvars])
//         const [aboundvars,bboundvars] = [avars,bvars]
//             .map((x,i)=>x.filter(v => [a,b][i].includes(λ+v)))
        
//         const freeavars = avars.filter(v => !aboundvars.includes(v))
//         const alpha = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']

//         // renaming of variables in an expression a b:
//         //   we only rename bound variables.
//         //   we only rename variables in a if:
//         //     they are the same as any in b
//         //   we only rename variables in b if:
//         //     they are the same as any free variables in a 

//         ;[[aboundvars,bvars],[bboundvars,freeavars]].forEach(([A,B],i) => 
//             A.forEach(v => {
//                 if (B.includes(v)) {
//                     for (const c of alpha) {
//                         if (!allvars.has(c)) {
//                             allvars.add(c)
//                             if (!i) 
//                                 a = terms[0] = replaceWith(a,v,c)
//                             else
//                                 b = terms[1] = replaceWith(b,v,c)
//                             return;
//                         }
//                     }
//                     throw "can't rename more variables"
//                 }
//             })
//         )
        
//         const applied = stripUselessParentheses(applyAB(a,b))
//         s = '(' + applied + ')' +  (terms.length > 2 ? ('(' + terms.slice(2).join`)(` + ')') : '')
//     }
   
// }
