const inputOutput = [

    [
        '(λs z.s(s z))(λw y x.y(w y x))(λu v.u(u(u v)))',
        'λb c.b(b(b(b(b c))))'
    ],

    [
        `
        R = λr n.Z n 0(n S(r(P n)))
        Z = λx.x F ¬ F
        ¬ = λx.x F T
        Y = λy.(λx.y(x x))(λx.y(x x))
        S = λw y x.y(w y x)
        P = λn.n Φ(λz.z 0 0)F
        Φ = λp z.z(S(p T))(p T)
        T = λx y.x
        F = 0
        0 = λa b.b
        4 = λa b.a(a(a(a b)))
        
        Y R 4`,
        'λa b.a(a(a(a(a(a(a(a(a(a b)))))))))',
    ], 

    [
        `
        true = a
        true ttrue
        `,
        'a ttrue',
    ],

    [
        `S = λw y x.y(w y x)
        P = λn.n Φ(λz.z 0 0)F
        Φ = λp z.z(S(p T))(p T)
        0 = λx y.y
        F=0
        T = λa b.a
        5 = λa b.a(a(a(a(a b))))
        
        P 5
        `,
        'λi j.i(i(i(i j)))'
    ],

    [
        `
        2 = λa b.a(a b)
        3 = λa b.a(a(a b))
        + = λw y x.y(w y x)
        M = λx y.(λz.x(y z))
        * = ${'`'}M -- infix multiplication, not possible!!
        P = λx y.y x

        P 2 3`,
        'λb e.b(b(b(b(b(b(b(b e)))))))'
    ]
]

function runTests() {
    const fail = inputOutput.find(([input,output]) => !alphaEquivalent(F(input),output));
    (x => (alert(x),log(x),x) )(fail ? `failed with input = ${fail[0]}
        actual:  ${F(fail[0])}
        expected:${fail[1]}` : 'Passed all the tests!!')
}

function alphaEquivalent(a,b) {



    if (a.length !== b.length) 
        return alert('the lengths are not equal')
    if ([...a].some((c,i) => 'λ.()'.includes(c) && c !== b[i])) 
        return alert('some lambdas or dots or parenthesis are in the wrong place')
        
    return isEquiv(a,b) || alert('results are not alpha equivalent')
}
function isEquiv(a,b) {


    const variables = new Set((a+b).split(/[λ.() ]+/))
    for(let i=65,j=0; a[j]; i++) {
        const c = String.fromCharCode(i);
        if ('λ.() '.includes(a[j])) j++
        if (variables.has(c)) continue
        if (!variables.has(a[j]) || !variables.has(b[j])) { j++; continue }
        a = replaceWith(a,a[j],c)
        b = replaceWith(b,b[j],c)
        j++
    }
    return a === b
}