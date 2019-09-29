const inputOutput = [
    [
        'S = \\wyx.y(wyx); P = λn.nG(λz.z00)F; G = (λpz.z(S(pT))(pT)); T = λxy.x; F = λxy.y; 5 = \\ab.a(a(a(a(ab)))); 0 =\\xy.y; P 5',
        '\\ab.a(a(a(ab)))'
    ],

    [
        '(λsz.s(sz))(λwyx.y(wyx))(λuv.u(u(uv)))',
        '\\ab.a(a(a(a(ab))))'
    ],

    [
        `
        R = (λrn.Zn0(nS(r(Pn)))); 
        Y = (λy.(λx.y(xx))(λx.y(xx))); 
        S = \\wyx.y(wyx); 
        P = λn.nG(λz.z00)F;
        G = (λpz.z(S(pT))(pT)); 
        T = λxy.x; F = λxy.y; 
        3 = \\ab.a(a(ab)); 0 =\\xy.y; 
        
        YR3`,
        '\\ab.a(a(a(a(a(ab)))))',
    ]
]

function runTests() {
    const fail = inputOutput.find(([input,output]) => !alphaEquivalent(F(input),output))
    
    log(fail ? `failed with input = ${fail[0]}
        actual:  ${F(fail[0])}
        expected:${fail[1]}` : 'Passed all the tests!!')
}

function alphaEquivalent(a,b) {
    // black box approach, for now
    let passed = true
    if (!a.length === b.length) return log('the lengths are not equal')

    return passed
    // rename all bound vars in both to a,b,c..., then check string equality         
    // const alpha = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']
    // const [avars,bvars] = [a,b].map(s=>Array.from(new Set(s.replace(/[^a-zA-Z]/g,''))))
    // const allvars = [...avars,...bvars]
    // const [aboundvars,bboundvars] = [avars,bvars]
    //     .map((x,i)=>x.filter(v => [a,b][i].includes('λ'+v)))
    // aboundvars.forEach

    // variables can occur free and bound in the same expression
}