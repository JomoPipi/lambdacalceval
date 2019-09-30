
const history = []
D('code').focus()
const improper = x => `<span style="color:red;">${x}</span>`
function F(code) {
    history.length = 0
    V=x=>(log(x),x)
    const sections = V(code.split`;`.map(v => v.split`=`.map(x=>x.trim())))

    let t = sections.pop()[0]
    log(JSON.stringify(sections),sections.length)
    if (sections.some(sec=>sec.length!==2)) return improper('the ; operator is for creating variables')
    
    for (let n,v;;) {
        [n,v] = sections.find(([n,v]) => t.includes(n))||[]
        if (n) 
            if (n.length > 1)
                return improper('variable names can only be one character long.') 
                // t = t.replace(new RegExp(n,"g"),`(${v})`)
            else // avoiding RegExp here incase we get a strange symbol
                t = [...t].map(c => c === n ? `(${v})` : c).join`` 
        else
            break
    }
    const s = uncurryString(t.replace(/ /g,''))
    return curryString(betaReduce(s))
}

function getTerms(s) {
    return [...s].reduce(([r,x,y],v,i) => {
        const a = v==='(', b = v===')', c = x===1
        if (v==='λ' && x === 0 && !y) { r.push(''); y=1 }
        if (y) { r[r.length-1] += v; return [r,x,y] }
        if (x > 0) { 
            if (!(b&&c)) r[r.length-1] += v
            return [r, x + (({')':-1,'(':1})[v]||0)] 
        }
        if (a) return [[...r,''],x+1]
        return [[...r,v],x]
    },[[],0,0])[0].map(stripUselessParentheses)
}

function stripUselessParentheses(t) {
    // strip away unnecessary parenthesis
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
    return s.replace(/\.λ/g,'')
}

function uncurryString(s) {
    return [...s.replace(/λ(\w+)\./g,"[$1]")].reduce(([s,x],v,i) =>
        '[]'.includes(v) ? [s,x^=1] : [s+(x?'λ'+v+'.':v),x]
    ,['',0])[0]
}

function betaReduce(s, stopRecursion) {
    s = stripUselessParentheses(s)
    // check if infinite loop:
    const i = history.lastIndexOf(s), l = history.length
    if (i >= 0) {
        // if (l > 1 && history.slice(0,i).join`:`.endsWith(history.slice(i).join`:`)) {
        if (l > 9000) {
            // log('history =',history)
            return history.slice(0,15).join`<br>` + '<br>...<br>[ divergent expression ]'
        }
    }
    history.push(s)
    log('s =',s)

    const terms = getTerms(s)
    let [a,b] = terms
    if (a == null) return;

    if (b == null) {
        return stopRecursion ? a :
                a.length === 1 ? a : 
                a[0] === '(' ? betaReduce(s.slice(1,-1)) :
                a[0] === 'λ' ? s.slice(0,3) + betaReduce(s.slice(3)) : // if first character is not ( or 'λ, it's a variable
                (_=>{ throw 'why does a variable have length greater than 1?'})()
    }


    if (a[0] !== 'λ') { // first term isn't a lambda
        if (a[0] === '(') terms[0] = betaReduce(a,true)

        if (terms[0] !== a) {
            return betaReduce( '(' + terms[0] + ')' + ('(' + terms.slice(1).join`)(` + ')').replace(/\((.)\)/g,'$1') )
        }
        log('hiiii',terms.join` , `)
        return ('(' + terms.map(x => betaReduce(x)).join`)(` + ')').replace(/\((.)\)/g,'$1')
    }

    if (!s.includes('(')) { // cannot reduce without parenthesis
        return s 
    }

    const [avars,bvars] = [a,b].map(s=>Array.from(new Set(s.replace(/[λ.()]/g,''))))
    const allvars = new Set([...avars,...bvars])
    const [aboundvars,bboundvars] = [avars,bvars]
        .map((x,i)=>x.filter(v => [a,b][i].includes('λ'+v)))
    
    const freeavars = avars.filter(v => !aboundvars.includes(v))
    const alpha = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']

    // renaming of variables in an expression a b:
    //   we only rename bound variables.
    //   we only rename variables in a if:
    //     they are the same as any in b
    //   we only rename variables in b if:
    //     they are the same as any free variables in a 

    aboundvars.forEach((v,i) => { // rename a's bound variables if found in bvars
        if (bvars.includes(v)) {
            for (const c of alpha) {
                if (!allvars.has(c)) {
                    allvars.add(c)
                    a = terms[0] = [...a].map(x => x === v ? `${c}` : x).join``
                    return;
                }
            }
            throw "can't rename more variables"
        }
    })

    bboundvars.forEach((v,i) => { // rename b's bound variables if found in freeavars
        if (freeavars.includes(v)) {
            for (const c of alpha) {
                if (!allvars.has(c)) {
                    allvars.add(c)
                    b = terms[1] = [...b].map(x => x === v ? `${c}` : x).join``
                    return;
                }
            }
            throw "can't rename more variables"
        }
    })
    // const nextFree = alpha.find(c => !allvars.has(c))
    // // rename any inner bounded variables in a
    // const A = [...a.slice(3)].reduce(([s,x],v,i) => {
    //     if (a.slice(3+i).startsWith('λ'+a[1])) x = 1
    //     if (x > 0) x += v === '(' ? 1 : v === ')' ? -1 : 0
    //     if (v === a[1] && x > 0) v = nextFree
    //     return [v === a[1] && x === 0 ? s + `(${b})` : s + v, x]
    // }, ['',0])[0]

    const applied = applyAB(a,b)
    log('applied =',applied)
    const t = terms.length > 2 ? '(' + applied + ')' + ('(' + terms.slice(2).join`)(` + ')').replace(/\((.)\)/g,'$1') : applied
        
    return betaReduce(t)
}

function applyAB( a, b) { 
    /* 
        apply function a to expression b 
        don't rename any inner bound variables
    */
    let y = 0
    return  [...a.slice(3)].map((x,i) => {
        const z = x === a[1]
        if (z && a[i-1+3] === 'λ') 
            y = a[i-2+3] === '(' ? 1 : Infinity
        if (y > 1) 
            y += x === '(' ? 1 : x === ')' ? -1 : 0
        return y === 0 && z ? `(${b})` : x
    }).join`` 
}
