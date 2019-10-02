const inputOutput = [

    [
        '(λsz.s(sz))(λwyx.y(wyx))(λuv.u(u(uv)))',
        'λbc.b(b(b(b(bc))))'
    ],

    // [
    //     `
    // R = λrn.Zn0(nS(r(Pn))); 
    // Z = λx.xF¬F;
    // ¬ = λx.xFT;
    // Y = λy.(λx.y(xx))(λx.y(xx)); 
    // S = λwyx.y(wyx); 
    // P = λn.nΦ(λz.z00)F;
    // Φ = λpz.z(S(pT))(pT); 
    // T = λxy.x; F = 0; 
    // 3 = λab.a(a(ab)); 
    // 0 = λxy.y; 
    // 2 = λab.a(ab);
    
    // R(YR)3`,
    //     '\\ab.a(a(a(a(a(ab)))))',
    // ],

    [
        `S = λwyx.y(wyx); 
        P = λn.nΦ(λz.z00)F;
        Φ = λpz.z(S(pT))(pT); 
        0 = λxy.y;F=0;
        T = λab.a;
        5 = λab.a(a(a(a(ab)))); 
        
        P 5
        `,
        'λij.i(i(i(ij)))'
    ],

    [
        `
        2 = λab.a(ab); 
        3 = λab.a(a(ab));
        + = λwyx.y(wyx); 
        M = λxy.(λz.x(yz));
        ${'`'} = λf. ... create the "create infix operator";
        * = ${'`'}M - infix multiplication;
        P = λxy.yx;

        P 2 3`,
        'λbe.b(b(b(b(b(b(b(be)))))))'
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
    const variables = new Set((a+b).replace(/[λ.()]/g,''))
    for(let i=65,j=0; a[j]; i++) {
        const c = String.fromCharCode(i);
        if ('λ.()'.includes(a[j])) j++
        if (variables.has(c)) continue
        if (!variables.has(a[j]) || !variables.has(b[j])) continue
        a = replaceWith(a,a[j],c)
        b = replaceWith(b,b[j],c)
        j++
    }
    return a === b
}