const history = [], vars = {}

D('code').focus()
const improper = x => `<span style="color:red;">${x}</span>`

function F(code) {
    history.length = 0
    V=x=>(log(x),x)
    for (let i in vars) delete vars[i]
    const sections = V(code.split`;`.map(v => (([n,v]) => (vars[n] = v,[n,v]))(v.split`=`.map(x=>x.trim())) ))

    let t = sections.pop()[0]
    log(JSON.stringify(sections),sections.length)
    if (sections.some(sec=>sec.length!==2)) return improper('improper code')
    
    // for (let n,v;;) {
    //     [n,v] = sections.find(([n,v]) => t.includes(n))||[]
    //     if (n) 
    //         t = [...t].map(c => c === n ? `(${v})` : c).join``
    //     else
    //         break
    // }

    // ex: 
// 2 = λab.a(ab); 
// (λa.λc.a(ac)) ((2)((2)b))

    const s = uncurryString(replaceWith(t,' ',''))
    return curryString(betaReduce(s))
}



function replaceWith(str,find,replacement) { 
    return  [...str].map(x => x === find ? replacement : x).join``
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
    return replaceWith(s,'\.λ','')
}




function uncurryString(s) {
    return [...s.replace(/λ(\w+)\./g,"[$1]")].reduce(([s,x],v,i) =>
        '[]'.includes(v) ? [s,x^=1] : [s+(x?'λ'+v+'.':v),x]
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




function betaReduce(s, innerBit) {

    V = x => innerBit ? x : (log(x),x)

    s = stripUselessParentheses(s)
    
    if (!innerBit) updateHistory(s)

    const terms = getTerms(s)

    log('terms[0] =',terms[0])

    let expanded = false
    while (vars[terms[0]]) {
        expanded = true
        terms[0] = uncurryString(vars[terms[0]]);
    }

  if (!expanded && !s.includes('(')) { // cannot reduce without parenthesis
        return V(s) 
    }

    let [a,b] = terms

    log('terms =',terms)
    log('a,b =',a,b)

    if (a == null) return V(improper(s));

    if (b == null) {
        log('here')
        return  V(a.length === 1 ? a : 
                a[0] === 'λ' ? s.slice(0,3) + betaReduce(s.slice(3), true) : // if first character is not ( or 'λ, it's a variable
                (_=>{ throw 'why does a variable have length greater than 1?'})())
    }

    if (a[0] !== 'λ') { // first term isn't a lambda
        if (a[0] === '(') terms[0] = betaReduce(a,true)

        if (terms[0] !== a) {
            return V(betaReduce( '(' + terms[0] + ')' + ('(' + terms.slice(1).join`)(` + ')').replace(/\((.)\)/g,'$1'), innerBit ))
        }
        return V(('(' + terms.map(x => betaReduce(x, true)).join`)(` + ')').replace(/\((.)\)/g,'$1'))
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

    ;[[aboundvars,bvars],[bboundvars,freeavars]].forEach(([A,B],i) => 
        A.forEach(v => {
            if (B.includes(v)) {
                for (const c of alpha) {
                    if (!allvars.has(c)) {
                        allvars.add(c)
                        if (!i) 
                            a = terms[0] = replaceWith(a,v,c)
                        else
                            b = terms[1] = replaceWith(b,v,c)
                        return;
                    }
                }
                throw "can't rename more variables"
            }
        })
    )
    
    const applied = applyAB(a,b)
    const t = '(' + applied + ')' +  (terms.length > 2 ? ('(' + terms.slice(2).join`)(` + ')').replace(/\((.)\)/g,'$1') : '')
        
    log('here t =',t)
    return V(betaReduce(t, innerBit))
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
