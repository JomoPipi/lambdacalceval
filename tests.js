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
        `
        true   = λ fst snd . fst 
        true what ok yea
        `,
        'what yea'
    ],

    [
        `
        0 = λa b.b
        pair = λa b s.s a b

        pair 0 0
        `,
        'λs.s(λa b.b)(λa b.b)'
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
        true = λa b.a
        false = λa b.b
        
        + = λn f x.f(n f x)
        
        0 = false
        1 = + 0
        2 = + 1
        3 = + 2
        4 = + 3
        
        pair = λ a b s . s a b
        
        fst = λp.p true
        snd = λp.p false
        
        transform = λp.pair (snd p) (+ (snd p))
        pred = λn.fst(n transform (pair 0 0))
        
        pred 4
        `,
        '3'
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