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
        'true ttrue',
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
        'λs.s 0 0'
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
        4 = λa b.a(a(a(a b)))
        mul = λa b f. a (b f)
        2 = λa b.a(a b)

        mul 2 2
        `,
        '4'
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
    ],

    [
        `
        false = λa b.b
        λa b. false a
        `,
        'λa x b.b'
    ],

    [
        `
TR = λp.[] (snd p) (+1(snd p))

\`   = λ a op b . op a b -- the infixing operator
[]  = λ a b s . s a b
fst = λ p . p true
snd = λ p . p false


true  = λ a b . a
false = λ a b . b

and   = λ a b . a (b true false) false
or    = λ a b . a true (b true false)
not   = λ x . x false true
if    = λcond then else . cond then else

+1  = λ n f x . f (n f x)
-1  = λ n . fst (n TR ([] 0 0))
-   = λ a b . b -1 a
+   = λ a b . a +1 b
*   = λ a b f . a (b f)
/   = λ a b. if (\` a ˂ b) 0 (+1 (/ (\` a - b) b) )



0  = false
1  = +1 0
2  = +1 1
3  = +1 2
4  = +1 3
5  = +1 4
6  = +1 5
7  = +1 6
8  = +1 7
9  = +1 8
10 = +1 9

＝0 = λn.n (λx.false) true

˃   = λ a b . not (＝0 (\` a - b))
˂   = λ a b . not (＝0 (\` b - a))

＝  = λ a b . \` (not (˂ a b)) and (not (˃ a b))




\` 7 / 3
        `, '2'

    ]
]




function runTests() {
    const then = Date.now(), f = x=>(alert(x),log(x),x)
    for (const [i,expected] of inputOutput) {
        const actual = completeReduction(i)
        const pass = alphaEquivalent(actual,expected)
        if (!pass) return f(`
        failed with input:  ${i}
        actual:             ${actual}
        expected:           ${expected}`)
    }
    return f(`Passed all the tests!! \n Time elapsed for all tests: ${Date.now() - then} ms`)
}











// my current code:

// true  = λ a b . a
// false = λ a b . b
// if    = λ c t e.c t e
// and   = λ a b . a (b true 0) 0
// not   = λ b . b false true
// or    = λ a b . a true (b true 0)
// xor   = λ a b . a (b false true) (b true false)

// -- functiions
// Y     = λ y . (λx.y(x x)) (λx.y(x x)) 
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
// 11 = + 10
// 12 = + 11
// 13 = + 12
// 14 = + 13
// 15 = + 14
// 16 = + 15
// 17 = + 16
// 18 = + 17
// 19 = + 18
// 20 = + 19

// min = λ a b . ˂ a b a b
// max = λ a b . ˃ a b a b
// +   = λ w y x . y ( w y x )
// *   = λ a b f . a (b f)
// -1  = λ n . fst (n § ([] 0 0))
// -   = λ a b . b -1 a
// ＝0 = λ n . n (λx.false) true
// ≥   = λ a b . ＝0 (` b - a)
// ˃   = λ a b . not (` b ≥ a)
// ≤   = λ a b . ＝0 (` a - b)
// ˂   = λ a b . not (` a ≥ b)
// ＝  = λ a b . ＝0 ((- a b) + (- b a)) 

// -- 1: less, 2: equal, 3: greater
// cmp = λ a b . (` a ˂ b) 1 ((` a ˃ b) 3 2)

// -- "construct" positive
// pos = λ n . [] true n

// -- "construct" negative
// neg = λ n . [] false n

// ≥0  = fst

// ˂0  = λ n . not (≥0 n)

// -- cmpInts = λ a b .

// abs = snd

// invert = λ n . [(˂0 n),(abs n)] -- additive inverse


// add = λ a b . (λ A B C D . (xor C D)   ( (˃ A B) ([] C (- A B)) [] D (- B A) )   ([] C (A + B))) (abs a) (abs b) (≥0 a) (≥0 b)

// -- sub = λ a b . add a ([] (˂0 b) (abs b))

// sub = λ a b . add a (invert b)


// /% = λ r a b . ˂ a b 0 (+ (r (- a b) b))

// %% = λ r a b . ˂ a b a (r (- a b) b)

// / = λ a b . Y /% a b
// % = λ a b . Y %% a b

// factorial% = λ r n . ＝0 n 1 ( * n (r (-1 n)))

// factorial = λ n . Y factorial% n

// -- 6. Define the rational numbers as pairs of integers.
// -- 7. Define functions for the addition, subtraction, multiplication and division of
// -- rationals


// frac = λ n d . (λ ND. (λ N D. (xor (≥0 n) (≥0 d))   ([] (neg N) D)   ([] (pos N) D) ) (fst ND) (pos (snd ND))) (simplify (abs n) (abs d))


// -- are a and b both divisible by n?
// isCommonDiv = λ a b n . and (＝0 (% a n)) (＝0 (% b n))

// -- natRange 2 (min a b)

// -- findCommonDiv returns 0 if none was found
// findCommonDiv% = λ r a b i end. ＝ i end 0 ( isCommonDiv a b i i (r a b (+ i) end) )

// findCommonDiv = λ a b . Y findCommonDiv% a b 2 (+ (min a b))


// simplify% = λ r n d . (λx. ＝0 x ([] n d) (r (/ n x) (/ d x))) (findCommonDiv n d)

// simplify = λ n d . Y simplify% n d

// numerator = fst
// denominator = snd

// +_8 = pos 8
// -_6 = neg 6

// -4 = neg 4 
// +3 = pos 3

// frac +_8 -_6




