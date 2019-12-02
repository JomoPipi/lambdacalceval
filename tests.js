'use strict'


const test2 = [`
true  = λ a b . a
false = λ a b . b
if    = λ c t e.c t e
and   = λ a b . a (b true 0) 0
not   = λ b . b false true
or    = λ a b . a true (b true 0)
xor   = λ a b . a (b false true) (b true false)

-- functions
Y     = λ y . (λx.y(x x)) (λx.y(x x)) 
§     = λ p.[](snd p)(+(snd p))
[]    = λ a b s . s a b 
[     = λ a , b ] s . s a b -- different list syntax
fst   = λ p . p true
snd   = λ p . p false

0 = λ a b . b
1 = + 0
2 = + 1
3 = + 2
4 = + 3
5 = + 4
6 = + 5
7 = + 6
8 = + 7
9 = + 8
10 = + 9
11 = + 10
12 = + 11
13 = + 12
14 = + 13
15 = + 14
16 = + 15
17 = + 16
18 = + 17
19 = + 18
20 = + 19

min = λ a b . ˂ a b a b
max = λ a b . ˃ a b a b
+   = λ w y x . y ( w y x )
*   = λ a b f . a (b f)
-1  = λ n . fst (n § ([] 0 0))
-   = λ a b . b -1 a
==0 = λ n . n (λx.false) true
≥   = λ a b . ==0 (- b a)
˃   = λ a b . not (≥ b a)
≤   = λ a b . ==0 (- a b)
˂   = λ a b . not (≥ a b)
==  = λ a b . ==0 ((- a b) + (- b a)) 

-- 1: less, 2: equal, 3: greater
cmp = λ a b . (˂ a b) 1 ((˃ a b) 3 2)

-- "construct" positive
pos = λ n . [] true n

-- "construct" negative
neg = λ n . [] false n

≥0  = fst

˂0  = λ n . not (≥0 n)

-- cmpInts = λ a b .

abs = snd

invert = λ n . [(˂0 n),(abs n)] -- additive inverse


add = λ a b . (λ A B C D . (xor C D)   ( (˃ A B) ([] C (- A B)) ([] D (- B A)) )   ([] C (A + B))) (abs a) (abs b) (≥0 a) (≥0 b)

-- sub = λ a b . add a ([] (˂0 b) (abs b))

sub = λ a b . add a (invert b)


/% = λ r a b . ˂ a b 0 (+ (r (- a b) b))

%% = λ r a b . ˂ a b a (r (- a b) b)

/ = λ a b . Y /% a b
% = λ a b . Y %% a b

factorial% = λ r n . ==0 n 1 ( * n (r (-1 n)))

factorial = λ n . Y factorial% n

-- 6. Define the rational numbers as pairs of integers.
-- 7. Define functions for the addition, subtraction, multiplication and division of
-- rationals



-- are a and b both divisible by n?
isCommonDiv = λ a b n . and (==0 (% a n)) (==0 (% b n))

-- natRange 2 (min a b)

-- findCommonDiv returns 0 if none was found
findCommonDiv% = λ r a b i end. ≥ i end 0 ( isCommonDiv a b i i (r a b (+ i) end) )

findCommonDiv = λ a b . Y findCommonDiv% a b 2 (+ (min a b))


simplify% = λ r n d . (λx. ==0 x ([] n d) (r (/ n x) (/ d x))) (findCommonDiv n d)

simplify = λ n d . Y simplify% n d

numerator = fst
denominator = snd


-0' = neg 0 -- just incase
0'  = pos 0
-1' = neg 1
1'  = pos 1
-2' = neg 2
2'  = pos 2
-3' = neg 3
3'  = pos 3
-4' = neg 4
4'  = pos 4
-5' = neg 5
5'  = pos 5
-6' = neg 6
6'  = pos 6
-7' = neg 7
7'  = pos 7
-8' = neg 8
8'  = pos 8
-9' = neg 9
9'  = pos 9


-- one is below 0, other is above 0
icyhot = λ a b . xor (≥0 a) (≥0 b)

-- constructs fractions
frac = λ n d . (λ ND. (λ N D. (icyhot n d)   ([] (neg N) D)   ([] (pos N) D) ) (fst ND) (pos (snd ND))) (simplify (abs n) (abs d))

*abs = λ a b . *(abs a)(abs b)

mult = λ a b . icyhot a b neg pos (*abs a b)

multFracs = λ a b . (λna nb da db . frac (mult na nb) (mult da db) ) (fst a) (fst b) (snd a) (snd b)

divideFracs = λ a b . (λ b . multFracs a b ) (frac (snd b) (fst b))

addFracs = λ a b . (λ na nb da db . frac (add (mult na db) (mult nb da)) (mult da db)) (fst a) (fst b) (snd a) (snd b)

2/1 = frac -2' -1'
-1/4 = frac -1' 4'
7/1  = frac 7' 1'
3/4  = frac 3' 4'
1/4  = frac 1' 4'


-- addFracs 3/4 (divideFracs (addFracs 2/1 -1/4) 7/1) 30 seconds to compute!
divideFracs (addFracs 2/1 -1/4) 7/1




`, '1/4']


const testCase0 = { name: 'basic tests', tests: [

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
        `
S = λw y x.y(w y x)
P = λn.n Φ(λz.z 0 0)F
Φ = λp z.z(S(p T))(p T)
0 = λx y.y
F = 0
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

==0 = λn.n (λx.false) true

˃   = λ a b . not (==0 (\` a - b))
˂   = λ a b . not (==0 (\` b - a))

==  = λ a b . \` (not (˂ a b)) and (not (˃ a b))




\` 7 / 3
        `, '2'

    ]
]}









function runTests() {
    const testcases = [testCase0]

    const then = Date.now(), f = x=>(alert(x),log(x),x)

    const fail = testcases.find(failure) || failure({name: 'test 2', tests:[test2]})

    return f(fail || `Passed all the tests!! \n Time elapsed for all tests: ${Date.now() - then} ms`)
}








function failure({name, tests}) {
    for (const [input,expected] of tests) {
        const actual = completeReduction(input)
        const pass = alphaEquivalent(actual,expected)
        if (!pass) return `
        failed test         ${name}
        failed with input:  ${input}
        actual:             ${actual}
        expected:           ${expected}`
    }
    return false
}





// TODO: simulate a turing machine

/*























































































id    = λ x . x
Y     = λ y . (λx.y(x x)) (λx.y(x x))
§     = λ p.[](snd p)(+(snd p))
[]    = λ a b s . s a b
fst   = λ p . p true
snd   = λ p . p false








-- Bool
true  = λ a b . a
false = λ a b . b
if    = λ c t e.c t e
and   = λ a b . a (b true 0) 0
not   = λ b . b false true
or    = λ a b . a true (b true 0)
xor   = λ a b . a (b false true) (b true false)








-- Nat
0 = λ a b . b
1 = + 0
2 = + 1
3 = + 2
4 = + 3
5 = + 4
6 = + 5
7 = + 6
8 = + 7
9 = + 8
10 = + 9
11 = + 10
12 = + 11
13 = + 12
14 = + 13
15 = + 14
16 = + 15
17 = + 16
18 = + 17
19 = + 18
20 = + 19
min = λ a b . ˂ a b a b
max = λ a b . ˃ a b a b
+   = λ w y x . y ( w y x )
*   = λ a b f . a (b f)
**  = λ a b . b a
**2 = λ a . ** a 2
-1  = λ n . fst (n § ([] 0 0))
-   = λ a b . b -1 a
==0 = λ n . n (λx.false) true
˃=  = ≥
≥   = λ a b . ==0 (- b a)
˃   = λ a b . not (≥ b a)
˂=  = ≤
≤   = λ a b . ==0 (- a b)
˂   = λ a b . not (≥ a b)
==  = λ a b . ==0 ((- a b) + (- b a))
cmp = λ a b . (˂ a b) 1 ((˃ a b) 3 2) -- 1: less, 2: equal, 3: greater
/% = λ r a b . ˂ a b 0 (+ (r (- a b) b))
%% = λ r a b . ˂ a b a (r (- a b) b)
/ = λ a b . Y /% a b
% = λ a b . Y %% a b
factorial% = λ r n . ==0 n 1 ( * n (r (-1 n)))
factorial = λ n . Y factorial% n








-- Int
0'  = pos 0
1'  = pos 1
2'  = pos 2
3'  = pos 3
4'  = pos 4
5'  = pos 5
6'  = pos 6
7'  = pos 7
8'  = pos 8
9'  = pos 9
-0' = neg 0
-1' = neg 1
-2' = neg 2
-3' = neg 3
-4' = neg 4
-5' = neg 5
-6' = neg 6
-7' = neg 7
-8' = neg 8
-9' = neg 9
pos = λ n . [] true n  -- construct positive
neg = λ n . [] false n -- construct negative
≥0  = fst
˂0  = λ n . and (not (≥0 n)) (˃ (abs n) 0)
abs = snd

add = λ a b . (λ A B C D .
    if (xor C D)   
      (if (˃ A B) 
        ([] C (- A B)) 
        ([] D (- B A)))
      ([] C (A + B))
  ) (abs a) (abs b) (≥0 a) (≥0 b)
  
sub    = λ a b . add a (invert b)
*abs   = λ a b . *(abs a)(abs b)
mult   = λ a b . icyhot a b neg pos (*abs a b)
invert = λ n . [] (˂0 n) (abs n) -- additive inverse
icyhot = λ a b . xor (≥0 a) (≥0 b) -- one is below 0, other is above 0








-- 6. Define the rational numbers as pairs of integers.
-- 7. Define functions for the addition, subtraction, multiplication and division of rationals
isCommonDiv = λ a b n . and (==0 (% a n)) (==0 (% b n)) -- are a and b both divisible by n?
findCommonDiv% = λ r a b i end. ≥ i end 0 ( isCommonDiv a b i i (r a b (+ i) end) )
findCommonDiv = λ a b . Y findCommonDiv% a b 2 (+ (min a b))
simplify% = λ r n d . (λx. ==0 x ([] n d) (r (/ n x) (/ d x))) (findCommonDiv n d)
simplify = λ n d . Y simplify% n d
numerator = fst
denominator = snd








-- Frac
2/1  = frac -2' -1'
-1/4 = frac -1' 4'
7/1  = frac 7' 1'
3/4  = frac 3' 4'
1/4  = frac 1' 4'

frac = λ n d . -- constructs fractions
  (λ ND. 
    (λ N D. 
      (icyhot n d)   -- different signs?
        ([] (neg N) D) -- yes? -N/D
        ([] (pos N) D) -- no?   N/D
    ) (fst ND) (pos (snd ND)) -- N, D
  ) (simplify (abs n) (abs d)) -- ND

multFracs = λ a b . (λna nb da db . 
  frac 
    (mult na nb) 
    (mult da db) 
  ) (fst a) (fst b) (snd a) (snd b)
  
divideFracs = λ a b . (λ b . multFracs a b ) (frac (snd b) (fst b))

addFracs = λ a b . (λ na nb da db . 
  frac 
    (add (mult na db) (mult nb da))
    (mult da db)
  ) (fst a) (fst b) (snd a) (snd b)
  
-- addFracs 3/4 (divideFracs (addFracs 2/1 -1/4) 7/1) 30 seconds to compute!
-- divideFracs (addFracs 2/1 -1/4) 7/1








-- List
#e = [] E null
#de = [] D #e
#cde = [] C #de
#bcde = [] B #cde
#abcde = [] A #bcde
#abcdef = append F #abcde
[1,2,3,4]  = [] 1 ([] 2 ([] 3 ([] 4 null)))
[0,1,2,3]  = [] 0 ([] 1 ([] 2 ([] 3 null)))
[1,4,9,16] = [] 1 ([] 4 ([] 9 ([] 16 null)))
#abc =   [] A ([] B ([] C null))
#bcd =   [] B ([] C ([] D null))

isNull = λ x . ˃ x 0 -- how did I come up with this? I had to look for a function that returns false for all lists
null = 1 -- empty list
head = fst
tail = snd
length% = λ r lst . isNull lst 0 (+ (r (tail lst)))
length = λ lst . Y length% lst

append% = λ r list result . 
  isNull list 
    result 
    (r (tail list) ([] (head list) result))
append = λ elem list . Y append% (reverse list) ([] elem null)

reverse% = λ r list result . isNull list result (r (tail list) ([] (head list) result))
reverse = λ list . Y reverse% list null
elemAt = λ n list . head (drop n list)
drop = λ n list . n snd list
dropRight = λ n list . reverse (n snd (reverse list))
take = λ n list . dropRight (- (length list) n) (list)

map% = λ r func list result . 
  isNull list 
    result 
    (r func (tail list) ([] (func (head list)) result))
    
map = λ func list . 
  Y map% func (reverse list) null

-- map **2 [1,2,3,4] -- [1,4,9,16]
-- map -1 [1,2,3,4] -- [0,1,2,3]







'˃' = 1 -- move ptr to the right
'˂' = 2 -- move pts to the left
'*' = 3 -- flip the bit we're pointing to
'[' = 4 -- Jump past matching ] if current bit is false
']' = 5 -- Jump back to matching [ if current bit is true




NTWBF% = λ r tape x result . 
  isNull tape 
    result 
    (r (tail tape) (sub x 1') ([] (==0 (abs x) (not (head tape)) (head tape)) result))
-- -- newTapeWithBitFlipped :: [Bool] -˃ Int -˃ [Bool]
newTapeWithBitFlipped = λ tape x . reverse (Y NTWBF% tape x null)




jp]% = λ r code idx x . 
  or (isNull code) (==0 x) 
    idx  
    ((λf.(   r (tail code) (+ idx) ((f ']') (- x 1) ((f '[') (+ x) x))   ) ) (λx. == x (head code)))
-- jumpPast] :: [Nat] -˃ Nat -˃ Nat
jumpPast] = λ code idx . Y jp]% (drop (+ idx) code) (+ idx) 1




jb[% = λ r code idx x . 
  or (isNull code) (==0 x) 
  idx 
  ((λf.(   r (tail code) (+ idx) ((f '[') (- x 1) ((f ']') (+ x) x))   ) ) (λx. == x (head code)))
-- jumpBackTo[ :: [Nat] -˃ Nat -˃ Nat
jumpBackTo[ = λ code idx . - idx (Y jb[% (reverse (take idx code)) 0 1)




-- Smallfuck terminates when any of the two conditions mentioned below become true:
 
    -- All commands have been considered from left to right
    -- The pointer goes out-of-bounds (pointer ˂ 0 or pointer ˃= tape.length)
    
SFI% = λ r code idx tape ptr . 
  or (˃= idx (length code)) (or (˂0 ptr) (== (abs ptr) (length tape)))
    tape
    (
      ( λ v f p .
  
        (f '˃')               (r code (+ idx) tape (add ptr 1')) (
        
        (f '˂')               (r code (+ idx) tape (sub ptr 1')) (
      
        (f '*')               (r code (+ idx) (newTapeWithBitFlipped tape ptr) ptr) (
        
        (and (f '[') (not v)) (r code (jumpPast] code idx) tape ptr) (
        
        (and (f ']') v)       (r code (jumpBackTo[ code idx) tape ptr) (
        
                               r code (+ idx) tape ptr
        
        )))))
      )
      (elemAt (abs ptr) tape) (λ x . == x (elemAt idx code)) (abs ptr)
    )
  
-- smallFuckInterpreter :: [Nat] -˃ [Bool] -˃ [Bool]
smallFuckInterpreter = λ   code     tape   .  Y SFI% code 0 tape 0'
SFI = smallFuckInterpreter 



T = true
F = false

'* = [] '*' null
'˃* = [] '˃' ([] '*' null)
'˃˃* = [] '˃' ([] '˃' ([] '*' null))
'˃˂* = [] '˃' ([] '˂' ([] '*' null))
'˃˃˂* = [] '˃' ([] '˃' ([] '˂' ([] '*' null)))
'[˃*] = [] '[' ([] '˃' ([] '*' ([] ']' null)))
'[˃[*]] = [] '[' ([] '˃' ([] '[' ([] '*' ([] ']' ([] ']' null)))))
'*[*] = [] '*' ([] '[' ([] '*' ([] ']' null)))
'˃˃*˃*˃* = [] '˃' ([] '˃' ([] '*' ([] '˃' ([] '*' ([] '˃' ([] '*' null))))))
'[[]*˃*˃*˃] = [] '[' ([] '[' ([] ']' ([] '*' ([] '˃' ([] '*' ([] '˃' ([] '*' ([] '˃' ([] ']' null)))))))))
FFF  = [] F ([] F ([] F null))
TTTT = [] T ([] T ([] T ([] T null)))
FTTT = [] F ([] T ([] T ([] T null)))
TFTT = [] T ([] F ([] T ([] T null)))
TTFT = [] T ([] T ([] F ([] T null)))
TTTF = [] T ([] T ([] T ([] F null)))
TFTF = [] T ([] F ([] T ([] F null)))
FFFF = [] F ([] F ([] F ([] F null)))
TFFF = [] T ([] F ([] F ([] F null)))

SFI '[˃[*]] TTTF

*/





































































/*








0  = false
1  = + 0
2  = + 1
3  = + 2
4  = + 3
5  = + 4
6  = + 5
7  = + 6
8  = + 7
9  = + 8
10  = + 9
11  = + 10
12  = + 11
13  = + 12
14  = + 13
15  = + 14
16  = + 15
17  = + 16
18  = + 17
19  = + 18
20  = + 19

0' = pos 0
1' = pos 1
2' = pos 2
3' = pos 3
4' = pos 4
5' = pos 5
6' = pos 6
7' = pos 7
8' = pos 8
9' = pos 9
10' = pos 10

-0' = neg 0
-1' = neg 1
-2' = neg 2
-3' = neg 3
-4' = neg 4
-5' = neg 5
-6' = neg 6
-7' = neg 7
-8' = neg 8
-9' = neg 9
-10' = neg 10



id = λ x . x
Φ = λ p . [] (+(fst p))(fst p)
Y = λy.(λx.y(x x))(λx.y(x x))


[] = λ a b s. s a b
fst = λ p . p true
snd = λ p . p false


-- Bool
if = λ cond then else . cond then else
true  = λa b.a
false = λa b.b
not = λb. b false true
and = λa b. a b false
or = λ a b . a true b
xor = λ a b . a (b false true) b



-- Nat
+ = λ w y x . y (w y x)
- = λ a b . b -1 a
* = λ a b f . a (b f)
** = λ a b . b a
==0 = λ x . x false not false
-1 = λ x . snd (x Φ (λ s . s 0 0))
˃= = λ a b . ==0 (- b a)
==   = λ a b . and (˃= a b) (˃= b a)
˂ = λ a b . not (˃= a b)
˃ = λ a b . not (˃= b a)
min = λ a b . ˂ a b a b
max = λ a b . ˃ a b a b
%% = λ r a b . (˂ a b) a (r (- a b) (b))
% = λ a b . ==0 b error:_mod_by_0 (Y %% a b)

/% = λ r a b . (˂ a b) 0 (1 + (r (- a b) (b)))
/ = λ a b . ==0 b error:_division_by_0 (Y /% a b)

-- Define the function n! = n · (n − 1)· · · 1 recursively.
fact% = λ r n . ==0 n 1 (* n(r(-1 n)))
fact = λ n . Y fact% n



-- Int
abs = snd
˃=0 = λ n . or (fst n) (==0 (abs n))
˂0  = λ n . not (˃=0 n)
pos = λ n . [] true n
neg = λ n . [] false n
icyhot = λ a b . xor (˃=0 a) (˃=0 b)
add = λ a b . (λ A B C D . 
    if (xor C D)
      (if (˃ A B)
        ([] C (- A B))
        ([] D (- B A)))
      ([] C (A + B))
  ) (abs a) (abs b) (˃=0 a) (˃=0 b)
invert = λ n . [] (not (˃=0 n)) (abs n)
sub = λ a b . add a (invert b)
div = λ a b . (icyhot a b neg pos) (/ (abs a) (abs b))
mul = λ a b . (icyhot a b neg pos) (* (abs a) (abs b))





isCommonDiv = λ a b n . and (==0(% a n)) (==0(% b n))
-- FCD% = λ r a b i end . ˃= i end 0 (isCommonDiv a b i i (r a b (+ i) end))
-- findCommonDiv = λ a b . Y FCD% a b 2 (+ (min a b))
GCF% = λ r a b i . == i 1 1 (isCommonDiv a b i i (r a b (-1 i)))
GCF = λ a b . Y GCF% a b (min a b)
simplify = λ a b . (λ gcf . [] (/ a gcf) (/ b gcf)) (GCF a b)




-- Frac
frac = λ n d .
  (λ ND .
    (λ N D .
      [] ((icyhot n d) neg pos N) D
    ) (fst ND) (pos (snd ND))
  ) (simplify (abs n) (abs d))
reciprocal = λ f . frac (snd f) (fst f)

mulFracs = λ a b . (λ na nb da db . 
    frac 
      (mul na nb)
      (mul da db)
  ) (fst a) (fst b) (snd a) (snd b)
  
divFracs = λ a b . mulFracs a (reciprocal b)

1/3 = [] 1' 3'
2/3 = [] 2' 3'
2/9 = [] 2' 9'
2/1 = [] 2' 1'
4/1 = [] 4' 1'
1/2 = [] 1' 2'
-1/2 = [] -1' 2'
1/1 = [] 1' 1'

addFracs = λ a b . (λ na nb da db . 
    frac 
      (add (mul na db) (mul nb da))
      (mul da db)
  ) (fst a) (fst b) (snd a) (snd b)
  
subFracs = λ a b . addFracs a (invertFrac b)
invertFrac = λ f . frac (invert(fst f)) (snd f)
  
  
  
  
  
  
  
  
  
  
-- List
null = λ f x . x
U = λ a l f x . f a (l f x)
head = λ l . l true error:called_head_on_null
isNull = λ l . l (λa b.false) true
tail = λ l . fst (l ( λa b. [] (snd b) (U a (snd b)) ) ([] null null))

length% = λ r lst . isNull lst 0 (+(r(tail lst)))
length = λ list . Y length% list

reverse% = λ r list result .
  isNull list
    result
    (r (tail list) (U (head list) result))
  
reverse = λ list . Y reverse% list null


12345 = U 1 (U 2 (U 3 (U 4 (U 5 null))))-- 10101100

T = true
F = false

NTWBF% = λ r tape p result .
  isNull tape
    result
    (r (tail tape) (sub p 1') (U (==0 (abs p) (not(head tape)) (head tape)) result))
  
newTapeWithBitFlipped = λ tape p . reverse (Y NTWBF% tape p null)

elemAt = λ i list . head (drop i list)
drop   = λ n list . n tail list
dropRight = λ n list . reverse (n tail (reverse list))
take = λ n list . dropRight (- (length list) n) list


'˃' = 1
'˂' = 2
'*' = 3
'[' = 4
']' = 5

jp]% = λ r code idx x .
  or (isNull code) (==0 x)
    idx
    ((λ f . r (tail code) (+ idx) ((f ']') (-1 x) ((f '[') (+ x) x))) (λ x . == x (head code)))

jumpPast] = λ code idx . Y jp]% (drop (+ idx) code) (+ idx) 1

jb[% = λ r code idx x .
  or (isNull code) (==0 x)
    idx
    ((λ f . r (tail code) (+ idx) ((f '[') (-1 x) ((f ']') (+ x) x))) (λ x . == x (head code)))

jumpBackTo[ = λ code idx . - idx (Y jb[% (reverse (take idx code)) 0 1)

-- code :: [Nat]
-- tape :: [Bool]
interpreter% = λ r code idx tape ptr . 
  or (˃= idx (length code)) (or (˂0 ptr) (˃= (abs ptr) (length tape)))
    tape
    (
      (λ v f .
        
        (f '˃')                (r code (+ idx) tape (add ptr 1')) (
        
        (f '˂')                (r code (+ idx) tape (sub ptr 1')) (
        
        (f '*')                (r code (+ idx) (newTapeWithBitFlipped tape ptr) ptr) (
        
        (and (f '[') (not v))  (r code (jumpPast] code idx) tape ptr) (
        
        (and (f ']') v)        (r code (jumpBackTo[ code idx) tape ptr) (
        
                                r code (+ idx) tape ptr
        )))))
      )
      (elemAt (abs ptr) tape) (λ x . == x (elemAt idx code))
    )
interpreter = λ code tape . Y interpreter% code 0 tape 0'

-- ˃*˃*, 00101100 -˃ 01001100

TFTFTTFF = U T (U F (U T (U F (U T (U T (U F (U F null)))))))

FFTTFTFT = U F (U F (U T (U T (U F (U T (U F (U T null)))))))

TTTFTTFF = U T (U T (U T (U F (U T (U T (U F (U F null)))))))

FFTFTTFF = U F (U F (U T (U F (U T (U T (U F (U F null)))))))
FTFFTTFF = U F (U T (U F (U F (U T (U T (U F (U F null)))))))
FFFFFFFF = U F (U F (U F (U F (U F (U F (U F (U F null)))))))
TTTTTTTT = U T (U T (U T (U T (U T (U T (U T (U T null)))))))
TFFFFFFF = U T (U F (U F (U F (U F (U F (U F (U F null)))))))
TFF      = U T (U F (U F null))
'11001'  = U T (U T (U F (U F (U T null))))
'01100'  = U F (U T (U T (U F (U F null))))

˃*˃*  = U '˃' (U '*' (U '˃' (U '*' null)))
*[˃*] = U '*' (U '[' (U '˃' (U '*' (U ']' null))))
[˃*]  = U '[' (U '˃' (U '*' (U ']' null)))
*[˃[*]]    = U '*' (U '[' (U '˃' (U '[' (U '*' (U ']' (U ']' null))))))
*˃[[]*˃]˂* = U '*' (U '˃' (U '[' (U 
                     '[' (U ']' (U '*' (U 
                     '˃' (U ']' (U '˂' (U '*' null)))))))))
                     
[*˃[˃*˃]˃] = U '[' (U '*' (U '˃' (U 
               '[' (U '˃' (U '*' (U 
               '˃' (U ']' (U '˃' (U ']' null)))))))))

'01001'  = U F (U T (U F (U F (U T null))))
'10001'  = U T (U F (U F (U F (U T null))))

interpreter *[˃[*]] '01001' 


-- Test.assertEquals(interpreter('[*˃[˃*˃]˃]', '11001'), '01100', 'Your interpreter should also work properly with nested loops');
-- Test.assertEquals(interpreter('[˃[*˃*˃*˃]˃]', '10110'), '10101', 'Your interpreter should also work properly with nested loops');





*/