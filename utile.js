// @ts-nocheck
"use strict";

function matchedParenthesis(exp) {
  return ![...exp].reduce(
    (a, v) => (a < 0 ? a : a + ({ "(": 1, ")": -1 }[v] || 0)),
    0
  );
}

function equivFormat(x, nf) {
  const i = x.indexOf(λ);

  if (i === 0) {
    const i = x.indexOf(".");
    const params = x.slice(1, i).trim().split` `;
    return equivFormat(
      params.reduce((a) => applyAB(a, nf(), new Set()), x),
      nf
    );
  }
  if (i < 0) return x;

  const terms = getTerms(x);
  return terms.length === 1
    ? terms[0][0] === λ
      ? equivFormat(terms[0], nf)
      : terms[0]
    : gatherTerms(terms.map((x) => equivFormat(x, nf)));
}
//   SLOW
function isEquiv(a, b) {
  const ab = a + b,
    setA = new Set(ab),
    setB = new Set(ab);
  const nfa = makeNextFreeVarFunc(setA);
  const nfb = makeNextFreeVarFunc(setB);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++)
    if ("().λ".includes(a[i]) && a[i] !== b[i]) return false;
  if (equivFormat(a, nfa) !== equivFormat(b, nfb)) return false;
  return setA.size === setB.size;
}

// function isEquiv(a,b) {
//     // a and b are in normal form
//     const nf = makeNextFreeVarFunc(new Set(a + b))

//     const [i,j] = [a,b].map(x=>x.indexOf(λ))
//     if (i !== j) return false
//     if (i < 0) {
//         return a === b
//     }
//     if (i === 0) {
//         const x = a.indexOf('.'), y = b.indexOf('.'), z = nf()
//         if (x !== y) return false
//         const pA = a.slice(1,x).trim().split` `
//         const pB = b.slice(1,y).trim().split` `
//         return isEquiv(pA.reduce(a => applyAB(a, z, new Set()), a),
//                        pB.reduce(a => applyAB(a, z, new Set()), b))
//     }

//     const terms = getTerms(a)
//     const termsB = getTerms(b)
//     if (terms.length !== termsB.length) return false
//     return terms.length === 1 ?
//         terms[0][0] === λ ? isEquiv(terms[0], termsB[0]) : terms[0] === termsB[0] :
//         terms.every((x,i) => isEquiv(x, termsB[i]))
// }

function replaceWith(str, find, replacement) {
  for (let i = 0; str[i]; i++)
    if (str.startsWith(find, i))
      str = str.slice(0, i) + replacement + str.slice(i + find.length);

  return str;
}

function dim(x, a) {
  const space = 180;
  const y = x.length;
  const z = space / 2 > a ? space / 2 - a : 0;
  // if (y > z) x = x.slice(0, z) + '  ... ' + x.slice(y - z)
  return `<span class="dim" style="color:#777;"> ${x} </span>`;
}

function clearIt(obj) {
  for (const i in obj) delete obj[i];
}

function escapeHTML(x) {
  // this works because I replace the user's default <> symbols to unicode versions.
  return x.split(/\<.*?\>/).join``;
}

function updateHistory(exp, then) {
  const hstry = HISTORY.map(escapeHTML);
  const l = hstry.length;
  for (var i = l - 1, limit = Math.max(1, l - 10); ; i--) {
    if (i <= limit) {
      i = null;
      break;
    }
    const v = hstry[i];
    if (tokenize(finalStep(v)).every((x, j) => tokenize(exp)[j] === x)) break;
  }
  if (i) HISTORY.splice(i, Infinity); // we don't need to see any steps that happen after we get the result)

  const finalResultAndStats =
    exp + // enjoy some nice measurements
    '<br> <br> <br> <span style="display: inline-block; text-align:left; font-size: 1.5em;">' +
    "Reduction steps:            " +
    hstry.length +
    "<br> Number of tokens:      " +
    hstry.reduce((a, v) => a + tokenize(v).length, 0) +
    "<br> Number of characters:  " +
    hstry.reduce((a, v) => a + v.replace(/ /g, "").length, 0) +
    "<br> Calculation duration:  " +
    (Date.now() - then) +
    "ms </span>";

  HISTORY.push(finalResultAndStats);

  D("steps").innerHTML = "<br>" + HISTORY.join`<br><br>` + "<br><br>";
}

function alphaEquivalent(a, b) {
  log("now testing for equivalence: " + a + "   and   " + b);

  if (a.length !== b.length) return alert("the lengths are not equal");

  if ([...a].some((c, i) => "λ.()".includes(c) && c !== b[i]))
    return alert("some lambdas or parentheses or dots are in the wrong place");

  log("isEquiv a b", isEquiv(a, b));
  return isEquiv(a, b) || alert("results are not alpha equivalent");
}

function stripUselessParentheses(t) {
  // strip away unnecessary parenthesis
  t = t.trim();
  while (true) {
    const i = [...t].findIndex((v, j) => v === "(" && t[j + 2] === ")");
    if (i >= 0) {
      t = (t.slice(0, i) + " " + t[i + 1] + " " + t.slice(i + 3)).trim();
      continue;
    }
    if (t[0] === "(") {
      for (let i = 1, x = 1; t[i]; i++) {
        x += t[i] === "(" ? 1 : t[i] === ")" ? -1 : 0;
        if (!x && t[i + 1]) return t;
      }
      t = t.slice(1, -1).trim();
      continue;
    }
    return t;
  }
}

// function equivFormat(x, y=0) {

//     if (x[0] === λ) {
//         const i = x.indexOf('.')
//         const params = x.slice(1,i).trim().split` ` // this is safe because numbers are never in params
//         params.forEach((p,i) => x = replaceWith(x, p, ''+(i+y)) )
//         const j = x.indexOf('.')+1
//         return x.slice(0,j) + equivFormat(x.slice(j), params.length + y)
//     }

//     const terms = getTerms(x)
//     return terms.length === 1 ?
//         terms[0][0] === λ ? equivFormat(terms[0], y) : terms[0] :
//         gatherTerms(terms.map((x,i) => equivFormat(x, y + 42*(i+1))))

// }

// function isEquiv(a,b) {
//     // checks two non divergent lambda expressions for equivalence
//     // it is assumed they will have the same structure, (same parenthesis and lambdas)
//     const nf = makeNextFreeVarFunc(new Set(a+b))
//     while (1) {
//         const [ai,bi] = [a,b].map(x => x.indexOf(λ))
//         if (ai < 0 || bi < 0) break

//         const x = nf()
//         const [at,bt] = [a,b].map(getTerms), [al,bl,atl,btl] = [a,b,at,bt].map(x => x.length)
//         if (atl !== btl) return false

//         if (atl === 1) {
//             if (ai === 0) {
//                 if (bi !== 0) return false
//                 a = applyAB(a,x)
//                 b = applyAB(b,x)
//                 continue
//             }
//             else {
//                 if (bi === 0) return false
//                 const fronta = a.slice(0,ai), frontb = b.slice(0,bi)
//                 if (fronta !== frontb) return false
//                 const mida = a.slice(ai).split``
//                     .reduce((a,v,i) => {
//                         (a += ({'(':1, ')':-1})[v] || 0)
//                         a < 0 ? a : a + ({'(':1,')':-1}[v]||0),0
//                     }, 0)
//             }
//         }

//     }
//     return a === b
// }

// id = λx.x
// @ = λf g x.f(g x)
// @_ = λf g x y.f(g x y)
// Y = λy.(λx.y(x x))(λx.y(x x))

// -- Bool
// -- "the basic observation
// -- is that we use booleans
// -- to choose between two things"
// true = λx y.x
// false = λx y.y
// T = true
// F = false

// -- Bool -˃ Bool
// not = λb.b false true

// -- Bool -˃ Bool -˃ Bool
// and = λa b.a b a
// or = λa b.a a b
// xor = λa b.a (not b) b
// beq = @_ not xor

// -- e -˃ e -˃ Pair
// pair = λa b s.s a b

// -- Pair -˃ e
// fst = λp.p T
// snd = λp.p F

// -- Pair -˃ Pair
// -- TR =[a,b]-˃[b,b+1]
// TR = λp.pair(snd p)(+1(snd p))

// -- What really are numbers?
// -- They are extensions of concepts
// -- The only concept we have is function application
// -- Nat
// 0 = λa b.b
// 1 = λa b.a b
// 2 = λa b.a(a b)
// 3 = +1 2
// 4 = +1 3
// 5 = +1 4
// 6 = +1 5
// 7 = +1 6
// 8 = +1 7
// 9 = +1 8
// 10 = +1 9
// 11 = +1 10
// 12 = +1 11
// 13 = +1 12
// 14 = +1 13
// 15 = +1 14
// 16 = +1 15
// 17 = +1 16
// 18 = +1 17
// 19 = +1 18
// 20 = +1 19

// -- Int
// 0' = pos 0
// 1' = pos 1
// 2' = pos 2
// 3' = pos 3
// 4' = pos 4
// 5' = pos 5
// 6' = pos 6
// 7' = pos 7
// 8' = pos 8
// 9' = pos 9
// 10' = pos 10
// 11' = pos 11
// 12' = pos 12
// 13' = pos 13
// 14' = pos 14
// 15' = pos 15
// 16' = pos 16
// 17' = pos 17
// 18' = pos 18
// 19' = pos 19
// 20' = pos 20

// -0' = neg 0
// -1' = neg 1
// -2' = neg 2
// -3' = neg 3
// -4' = neg 4
// -5' = neg 5
// -6' = neg 6
// -7' = neg 7
// -8' = neg 8
// -9' = neg 9
// -10' = neg 10
// -11' = neg 11
// -12' = neg 12
// -13' = neg 13
// -14' = neg 14
// -15' = neg 15
// -16' = neg 16
// -17' = neg 17
// -18' = neg 18
// -19' = neg 19
// -20' = neg 20

// -- Nat -˃ Bool
// ==0 = λn.n (λ_.F) T

// -- Nat -˃ Nat -˃ Bool
// ˃= = λa b.==0(- b a)
// ˂= = λa b.==0(- a b)
// ˃ = @_ not ˂=
// ˂ = @_ not ˃=
// == = λa b. ==0 (+ (- a b) (- b a))
// /= = @_ not ==

// -- Nat -˃ Nat
// +1 = λn f x.f(n f x)
// -1 = λn.fst(n TR (pair 0 0))
// √% = λr n i.˃ (* i i) n (-1 i) (r n (+1 i))
// √ = λ n . Y √% n 1
// factorial = λn. Y (λf n.==0 n 1 (* n (f(-1 n)))) n

// -- Nat -˃ Nat -˃ Nat
// + = λa.a +1
// - = λa b.b -1 a
// * = λa b f.a(b f)
// ^ = λa b.b a
// / = @_ fst divmod
// % = @_ snd divmod
// max = λ a b . ˃ a b a b
// min = λ a b . ˂ a b a b

// ˣ√% = λr x n i.˃ (^ i x) n (-1 i) (r x n (+1 i))
// ˣ√ = λ x n . ==0 x undefined (˂ n 2 1 (Y ˣ√% x n 1))

// divmod% = λr a b q. ˂ a b (pair q a) (r (- a b) b (+1 q))
// divmod = λa b.==0 b Error:DIV_BY_0 (Y divmod% a b 0)

// GCF% = λ r a b . ==0 a b (r (% b a) a)
// GCF = λa b. Y GCF% a b

// simplify = λ a b . (λgcf.pair (/ a gcf) (/ b gcf)) (GCF a b)

// -- √ 20 -- 4
// -- √ 16 -- 4
// -- ˣ√ 3 8 -- 2
// -- ˣ√ 4 20 -- 2
// -- / 19 4 -- 4

// -- ###############################################################################################################################################################################################

// -- TYPECLASS Num:
// --    Int
// --    Frac
// --    Number

// -- TYPECLASS uNum:
// --    Nat
// --    uFrac
// --    uNumber

// -- ###############################################################################################################################################################################################

// -- uNum -˃ Num
// pos = λn.pair true n
// neg = λn.pair false n

// -- Num -˃ Bool
// signum = fst

// -- Num -˃ Num -˃ Bool
// icyhot = λ a b . xor(signum a)(signum b)
// -- Num -˃ Num -˃ Bool
// ==signs = λ a b . beq(signum a)(signum b)

// -- Num -˃ uNum
// abs = snd

// -- Num -˃ Num
// negate = λn.pair (not(signum n)) (abs n)

// -- #################################################################################################################################################################################################

// -- Int -˃ Int -˃ Int
// add = λa b.(λsA sB A B.
//     pair (˃ A B sA sB) (beq sA sB + - (max A B) (min A B))
//   )(signum a)(signum b)(abs a)(abs b)

// sub = λa. @ (add a) negate
// -- add -8' 5' -- 13
// -- add 3' 4' -- 7
// -- sub 3' 4' -- -1'
// -- sub -6' -13' -- 7'

// mul = mul|div *
// div = mul|div /

// mul|div = λop a b.
//   pair (==signs a b) (op(abs a)(abs b))

// -- add -4' 11'-- 7
// -- add 4' -11'-- 7
// -- sub -4' 11'-- -15'
// -- sub -4' -11'-- 7'
// -- mul -3' -2' -- 6
// -- div 3' -4' -- -0'
// -- div -17' -4' -- 4'
// -- div 3' -0' -- some sort of error

// --$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ OLD WAY OF FRACS -- pair Int Int $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// -- TODO: REDO FRACTIONS AS (Bool,(Nat,Nat))
// -- -- Int -˃ Int -˃ Frac
// -- frac = λn d.(λND.(λ N D.
// --       pair (beq(signum n)(signum d)pos neg N) (pos D)
// --     )(fst ND)(snd ND)
// --   )(simplify(abs n)(abs d))

// -- -- Frac -˃ Frac
// -- reciprocal = λf.pair(snd f)(fst f)

// -- -- Frac -˃ Frac -˃ Frac
// -- mulFracs = λa b.(λnA nB dA dB.
// --     frac (mul nA nB) (mul dA dB)
// --   )(fst a)(fst b)(snd a)(snd b)

// -- divFracs = λa b.mulFracs a (reciprocal b)

// -- -- -4/1 = pair -4' 1'
// -- -- 2/1 = pair 2' 1'
// -- -- -2/1 = pair -2' 1'
// -- 1/3 = pair 1' 3'
// -- 1/2 = pair 1' 2'
// -- 5/6 = pair 5' 6'
// -- -1/6 = pair -1' 6'
// -- -- frac 8' -2' -- -4/1
// -- -- divFracs -4/1 2/1 -- -2/1
// -- -- addFracs 1/3 1/2 -- 5/6
// -- -- subFracs 1/3 1/2 -- -1/6
// -- -- - (factorial 4) 4 -- 20

// -- addFracs = λ a b .(λnA nB dA dB.
// --     frac (add (mul nB dA) (mul nA dB)) (mul dA dB)
// --   )(fst a)(fst b)(snd a)(snd b)

// -- subFracs = λ a b . addFracs a (pair (negate(fst b)) (snd b))
// --$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// -- frac :: (Bool,(Nat,Nat))
// -- Int -˃ Int -˃ Frac
// fracFromInts = λn d.(λND.(λ N D.
//       pair (beq(signum n)(signum d)true false) (pair N D)
//     )(fst ND)(snd ND)
//   )(simplify(abs n)(abs d))

// -- Bool -˃ Nat -˃ Nat -˃ Frac
// frac = λsign n d.(λND.(λ N D.
//       pair sign (pair N D)
//     )(fst ND)(snd ND)
//   )(simplify n d)

// -- Frac -˃ Frac
// reciprocal = λf.pair (signum f) (pair(snd (abs f))(fst (abs f)))

// -- Frac -˃ Frac -˃ Frac
// mulFracs = λa b.(λA B.(λnA nB dA dB.
//       frac (==signs a b) (* nA nB) (* dA dB)
//     )(fst A)(fst B)(snd A)(snd B)
//   )(abs a)(abs b)

// divFracs = λa b.mulFracs a (reciprocal b)

// addFracs = λ a b .(λA B sA sB.(λnA nB dA dB.(λL R.
//         frac (˃= L R sA sB) (beq sA sB + - (max L R) (min L R)) (* dA dB)
//       )(* nA dB)(* nB dA)
//     )(fst A)(fst B)(snd A)(snd B)
//   )(abs a)(abs b)(signum a)(signum b)

// subFracs = λ a b . addFracs a (negate b)

// 0/1 = frac true 0 1
// -- -4/1 = neg (pair 4 1)
// -- 2/1 = pos (pair 2 1)
// -- -2/1 = neg (pair 2 1)
// -- 1/3 = pos (pair 1 3)
// -- 1/2 = pos (pair 1 2)
// -- 5/6 = pos (pair 5 6)
// -- -1/6 = neg (pair 1 6)
// -- frac 8' -2' -- -4/1
// -- divFracs -4/1 2/1 -- -2/1
// -- @ reciprocal negate -2/1 -- 1/2
// -- addFracs 1/3 1/2 -- 5/6
// -- subFracs 1/3 1/2 -- -1/6
// -- - (factorial 4) 4 -- 20

// -- List
// null = pair true _

// -- List -˃ Bool
// ==null = fst

// -- List -˃ Nat
// length = Y  λlen list.==null list 0 (+1(len(tail list)))

// -- e -˃ List -˃ List
// [] = λ e list . pair false (pair e list)
// append = λ e list . reverse(Y (λapnd e l res.==null l ([] e res) (apnd e (tail l) ([] (head l) res))) e list null)

// -- List -˃ e
// head = @ fst snd
// elemAt = λn list.head(n tail list)

// -- List -˃ List
// tail = @ snd snd
// reverse = Y (λr res l.==null l res (r ([] (head l) res) (tail l))) null
// take = λ n list . reverse(Y (λr l res i.== i n res (r (tail l) ([] (head l) res) (+1 i))) list null 0)
// map = λf list . reverse(Y (λr l res.==null l res (r (tail l) ([] (f(head l)) res))) list null)
// mapIdx = λf list . reverse(Y (λr l res i.==null l res (r (tail l) ([] (f(head l) i) res) (+1 i))) list null 0)
// filter = λf list . reverse(Y (λr l res.==null l res (r (tail l) (f(head l) ([] (head l) res) res))) list null)
// reduce    = λf list acc . Y (λr l a.==null l a (r (tail l) (f a (head l)))) list acc
// reduceIdx = λf list acc . Y (λr l a i.==null l a (r (tail l) (f a (head l) i) (+1 i))) list acc 0

// -- List -˃ List -˃ List
// concat = λ a b . reverse(Y(λcnc res b.==null b res (cnc ([] (head b) res) (tail b))) (reverse a) b)

// -- Nat -˃ List
// range = Y (λr l i.==0 i l (r ([] (-1 i) l) (-1 i))) null
// range_ = λa.Y (λr l i.== a i l (r ([] (-1 i) l) (-1 i))) null

// -- List
// abcdefg     = [] a ([] b ([] c ([] d ([] e ([] f ([] g null))))))
// gfedcba     = [] g ([] f ([] e ([] d ([] c ([] b ([] a null))))))
// abcdef      = [] a ([] b ([] c ([] d ([] e ([] f null)))))
// cbagfed     = [] c ([] b ([] a ([] g ([] f ([] e ([] d null))))))
// gfed        = [] g ([] f ([] e ([] d null)))
// cba         = [] c ([] b ([] a null))
// [1,2,3,4]   = [] 1 ([] 2 ([] 3 ([] 4 null)))
// [6,8,10]    = [] 6 ([] 8 ([] 10 null))
// [0,3,8,15]  = [] 0 ([] 3 ([] 8 ([] 15 null)))
// [8,15,8,15] = [] 8 ([] 15 ([] 8 ([] 15 null)))
// [x,y,z]   = map id ([] x ([] y ([] z null)))
// [0,1,2,3]   = map -1 [1,2,3,4]
// [0,1,2,3,4]   = append 4 [0,1,2,3]
// [01,2,3,4,5,6,7] = concat [1,2,3,4] (map (+ 3) [1,2,3,4])
// [0,1,2]   = map id ([] 0 ([] 1 ([] 2 null)))
// [0,1,z]   = map id ([] 0 ([] 1 ([] z null)))
// [0,1,4]   = map id ([] 0 ([] 1 ([] 4 null)))
// -- elemAt 2 abcdefg -- c
// -- length abcdefg -- 7
// -- reverse abcdefg -- gfedcba
// -- take 4 gfedcba -- gfed
// -- append g abcdef -- abcdefg
// -- concat gfed cba -- gfedcba
// -- map (λx.-1(^ x 2)) [1,2,3,4] -- [0,3,8,15]
// -- (λx.concat x x)(filter (˂ 3) [0,3,8,15]) -- [8,15,8,15]
// -- reduce (λa v.append v a) gfed cba -- cbagfed
// -- reduceIdx (λa v i.append i a) gfed null -- [0,1,2,3]
// -- map (@ (* 2) (+ 3)) (range 3) -- [6,8,10]
// -- range_ 1 5 -- [1,2,3,4]
// -- reduce + (range 6) 0 -- 15
// -- reduce add (map neg (range 6)) 0' -- -15'
// mapIdx (λx i.* 2 (+ 3 i)) ([] _ ([] _ ([] _ null))) -- [6,8,10]

// -- TYPES:
// -*
// Dec8 (8-bit positive decimal)
// Nat8 (8-bit natural number)
// Number (16-bit floating point number)
// *-

// -- Number
