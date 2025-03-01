// @ts-nocheck
"use strict";

const HISTORY = [],
  DEFINITIONS = {},
  EXP_MEMO = {},
  NORMAL_FORM = {},
  DIVERGENT = new Set(),
  MAXIMUM_OVERDRIVE = D("optimize");

const treadCarefully = (exp, outer, limit) =>
  finalStep(
    betaReduce(exp, { outer_scope_awaits_lambda: outer, limit: limit || 1000 })
  );

const CheckIfWeTerminatedReductionSet = new Set(),
  singleLetterVARIABLENames = new Set();

D("code").focus();

function completeReduction(code, optimize) {
  const then = Date.now();
  const allLines = code.split`\n`.map((s) =>
    s.split("--")[0].replace(/-\*.*\*-/, "")
  );
  for (let incomment = false, i = 0; i < allLines.length; i++) {
    const line = allLines[i],
      x = line.indexOf("-*"),
      y = line.lastIndexOf("*-");
    if (incomment) {
      if (y >= 0) {
        allLines[i] = line.slice(y + 2);
        incomment = false;
      } else {
        allLines[i] = "";
      }
    } else if (x >= 0) {
      allLines[i] = line.slice(0, x);
      incomment = true;
    }
  }
  log("allLines =", allLines.join`\n`);
  const improper = (
    x // error style
  ) => `<span style="color:#f44;">${x}</span>`;

  HISTORY.length = 0; // clear variables from the last time
  DIVERGENT.clear();
  CheckIfWeTerminatedReductionSet.clear();
  [DEFINITIONS, EXP_MEMO, NORMAL_FORM].forEach(clearIt);

  const maybeError = containsErrors(allLines); // check for syntax errors
  if (maybeError.isError) return improper(maybeError.value);
  [λ, ...Object.keys(DEFINITIONS)].forEach((key) =>
    CheckIfWeTerminatedReductionSet.add(key)
  );
  Object.keys(DEFINITIONS).forEach(
    (v) => v.length === 1 && singleLetterVARIABLENames.add(v)
  );
  for (const name in DEFINITIONS) {
    const value = DEFINITIONS[name];
    HISTORY.length = HISTORY.iter = 0;
    try {
      const x = treadCarefully(value, true);
      if (MAXIMUM_OVERDRIVE.checked) DEFINITIONS[name] = x;
    } catch (e) {
      log("got an error while trying to optimize a variable:", name, value, e);
      DEFINITIONS[name] = value;
      DIVERGENT.add(name);
    }
    HISTORY.length = 0;
  }

  const expression = maybeError.value; // no syntax error detected
  const exp = finalize(expression);

  updateHistory(exp, then);

  if (tokenize(expression).length === 1)
    // you probably want it expanded, if it's a definition, in this case
    return exp;

  return finalStep(condense(exp));
}

function condense(exp, i = 0) {
  if (i === 20) return exp; // we don't need  to go too far
  for (const key of Object.keys(DEFINITIONS).sort()) {
    const value = DEFINITIONS[key];
    if (isEquiv(value, exp)) return key;
    if (DIVERGENT.has(key)) continue;
    HISTORY.length = HISTORY.iter = 0;
    HISTORY.charLimit = value.length * 10000;
    try {
      for (let reduced, last = " "; last !== reduced; last = reduced) {
        reduced =
          NORMAL_FORM[key] ||
          (NORMAL_FORM[key] = treadCarefully(value, false, 1000));

        if ([...reduced].some((c, i) => "λ.()".includes(c) && c !== exp[i]))
          continue;

        if (isEquiv(exp, reduced)) return key;
      }
    } catch (e) {
      log(`check out this error with ${key}: `, e);
      DIVERGENT.add(key);
    }
  }
  if (exp[0] === λ) {
    const x = exp.indexOf(".") + 1;
    return exp.slice(0, x) + condense(exp.slice(x), i + 1);
  }
  const terms = getTerms(exp);
  return terms.length === 1
    ? terms[0]
    : gatherTerms(terms.map((x) => condense(x, i + 1)));
}

function finalize(exp) {
  return finalStep(betaReduce(exp, {}));
}

function finalStep(exp) {
  return curryStep(
    stripUselessParentheses(gatherTerms(getTerms(exp)))
      .replace(/(λ +| +λ)/g, λ)
      .replace(/(\. +| +\.)/g, ".")
      .replace(/\( +/g, "(")
      .replace(/ +\(/g, "(")
      .replace(/\) +/g, ")")
      .replace(/ +\)/g, ")")
  );
}

function curryStep(exp) {
  // old way: simply: return exp.replace(/(\.λ|  )/g,' ')
  // problem:
  // false = λa b.b
  // λa b. false a   ->   λa b b.b

  // solution
  // if variables in heads are duplicated, we just have to rename the "victims" of duplication.
  // ex: λa b. false a   ->   λa x b.b
  const allvars = new Set(tokenize(exp).filter((x) => !/[.λ()]/.test(x)));
  const nextFree = makeNextFreeVarFunc(allvars);
  exp = exp.replace(/(\.λ|  )/g, " ");
  // clear out the duplicates in the heads
  const result = [];
  for (let i = 0, headBuffer = ""; i < exp.length; i++) {
    if (exp[i] === ".") {
      result.push(clean(headBuffer) + ".");
      headBuffer = "";
    } else if (exp[i] === λ) headBuffer = λ;
    else if (headBuffer) headBuffer += exp[i];
    else result.push(exp[i]);
  }
  function clean(head) {
    // first term is λ, so remove it, for now
    const h = head.slice(1).trim();
    const terms = h.split(/ +/);
    for (let i = 0; i < terms.length; i++)
      if (terms.lastIndexOf(terms[i]) !== i) {
        terms[i] = nextFree();
        return clean(λ + terms.join` `);
      }
    return head; // no duplicates found
  }
  return result.join``;
}

// betaReduce :: (String, Object) -> String
function betaReduce(expr, options) {
  const { outer_scope_awaits_lambda, outsideWrap, limit, charLimit } = options;
  const outervars = (options.outervars = options.outervars || new Set());
  HISTORY.iter = (HISTORY.iter + 1) | 0;
  if (limit) {
    if (HISTORY.iter > limit || (charLimit && expr.length > charLimit)) {
      return expr;
      throw "possible divergent expression";
    }
  }
  const expand = (x) => (x in DEFINITIONS ? expand(DEFINITIONS[x]) : x);
  const exp = stripUselessParentheses(expr);
  const terms = getTerms(exp);
  const memokey = terms.slice(0, 2).join`:`;
  const [leftW, rightW, NoP] = outsideWrap || ["", "", ""];

  if (EXP_MEMO[memokey])
    return betaReduce(EXP_MEMO[memokey] + gatherTerms(terms.slice(2)), options);

  let a = expand(terms[0]);
  const b = terms[1];

  if (terms.length === 0) throw "something is wrong";

  const wrap = (x, [l, r] = NoP ? ["", ""] : "()") =>
    dim(leftW + l, x.length) + x + dim(r + rightW, x.length);
  if (!MAXIMUM_OVERDRIVE.checked) {
    const last = wrap(exp);
    HISTORY.push(last);
    if (a !== terms[0]) {
      const newExp = `(${a})` + gatherTerms(terms.slice(1));

      if (HISTORY.length && escapeHTML(last).includes(newExp)) HISTORY.pop(); // filter out duplicate history

      HISTORY.push(wrap(newExp));
    }
  }

  if (terms.length === 1) {
    const tokens = tokenize(a);
    if (tokens.every((t) => !CheckIfWeTerminatedReductionSet.has(t))) {
      return a; // no λs, no definitions, no possible way to reduce
    }
    const i = a.indexOf(".");
    for (const v of a.slice(1, i).split` `) outervars.add(v);
    if (outer_scope_awaits_lambda) {
      return a[0] === λ
        ? a // it's a function, which is what the outer scope was waiting for, so we can end the recursion here.
        : betaReduce(a, options); // it's not a function, so we should recurse into it and try to see if it resolves to one.
    } else {
      if (a[0] === λ) {
        // we have a lambda, so return head + betaReduce(body)
        return (
          a.slice(0, i + 1) +
          betaReduce(a.slice(i + 1), {
            outsideWrap: [leftW + a.slice(0, i + 1), rightW, true],
            outer_scope_awaits_lambda,
            charLimit,
            limit,
            outervars,
          })
        );
      } else return betaReduce(a, options);
    }
  }

  if (a[0] !== λ) {
    // it needs to be a lambda in order to apply it to b
    a = betaReduce(a, {
      outer_scope_awaits_lambda: true,
      outsideWrap: [
        `${leftW}(`,
        `${gatherTerms(terms.slice(1))})${rightW}`,
        "",
      ],
      limit,
      charLimit,
      outervars,
    });
    // notice that we set outer_scope_awaits_lambda to true.
    // this means that the reductions will stop when it becomes a lambda,
    // even if it's not yet fully reduced.

    if (a[0] !== λ) {
      // it didn't reduce to a lambda, so we can't reduce further on this scope
      const result = gatherTerms(
        terms.slice(1).reduce(
          (a, term, i) => {
            // the ternary is there to stop the expansion when we don't need to it anymore. eg: s 1 2 stays like that
            return [
              ...a,
              /* tokenize(term).length === 1 ? term : */ betaReduce(term, {
                outsideWrap: [
                  `${leftW}(${gatherTerms(a)}`,
                  `${gatherTerms(terms.slice(i + 3))})${rightW}`,
                ],
                charLimit,
                limit,
                outervars,
              }),
            ];
          },
          [a]
        )
      );

      return result;
    }
  }
  // if code reaches here, then a is a lambda and we can simply apply it to b.
  const applied = `(${applyAB(a, b, outervars)})`;
  if (MAXIMUM_OVERDRIVE.checked) EXP_MEMO[memokey] = applied;
  return betaReduce(applied + gatherTerms(terms.slice(2)), options);
}

function gatherTerms(terms) {
  return terms.map((x) => (tokenize(x).length === 1 ? x : `(${x})`)).join` `;
}

function makeNextFreeVarFunc(allvars) {
  return function () {
    for (let i = allvars.last || 97; ; i++) {
      if (i >= 133 && i <= 200) continue;
      const v = String.fromCharCode(i);
      if (!allvars.has(v)) {
        allvars.last = i + 1;
        allvars.add(v);
        return v;
      }
    }
  };
}

function applyAB(a, b, outervars) {
  /* 
        apply function a to expression b 
        don't rename any bound variables of lambdas inside b
    */
  const i = a.indexOf(".");
  const variables = a.slice(1, i).trim().split(" ");
  // rename the other variables if they are equal to b or variables within b
  const btokens = new Set(tokenize(b)); // change this to bfreevars if more efficient
  const allvars = new Set([
    variables,
    ...btokens,
    ...outervars,
    ...singleLetterVARIABLENames,
  ]);
  const nextFree = makeNextFreeVarFunc(allvars);
  const replaceMap = variables
    .slice(1)
    .reduce(
      (a, v) =>
        btokens.has(v) ? ((a[v] = nextFree()), outervars.add(a[v]), a) : a,
      {}
    );
  for (const i in variables) {
    if (replaceMap[variables[i]]) variables[i] = replaceMap[variables[i]];
  }
  const variable = variables[0];
  const head =
    variables.length === 1 ? "" : λ + variables.slice(1).join` ` + ".";
  const body = a.slice(i + 1);

  const tokens = tokenize(body);

  // basically, if we find variable between a λ and . in the body,
  // then we must not replace until we reach the next corresponding ')'
  let level = 0,
    inhead = false;
  return (
    head +
    tokens.map((t) => {
      if (replaceMap[t]) return replaceMap[t];
      inhead = t === λ ? true : t === "." ? false : inhead;
      if (level > 0) level += t === ")" ? -1 : t === "(" ? 1 : 0;
      if (inhead && level === 0 && t === variable) {
        level = 1;
      }
      const replacement = btokens.size === 1 ? b : `(${b})`;
      // we need to be in level 0 in order to replace variables
      return level === 0 && t === variable ? replacement : t;
    }).join` `
  );
}

function tokenize(s) {
  let variableBuffer = false;
  return [...s].reduce((a, v) => {
    if (!"λ. ()".includes(v)) {
      if (!variableBuffer) a.push("");
      variableBuffer = true;
    } else {
      variableBuffer = false;
    }
    return v === " "
      ? a
      : variableBuffer
      ? ((a[a.length - 1] += v), a)
      : [...a, v];
  }, []);
}

function getTerms(s) {
  if (!s) {
    log("s =", s);
    throw "why is s falsy";
  }
  return [...s]
    .reduce(
      ([r, x, y, z], v) => {
        const a = v === "(",
          b = v === ")",
          c = x === 1,
          d = v === λ;
        if (d && x === 0 && !y) {
          r.push("");
          y = 1;
        }
        if (y) {
          r[r.length - 1] += v;
          return [r, x, y, z];
        }
        if (x > 0) {
          if (!(b && c)) r[r.length - 1] += v;
          return [r, x + ({ ")": -1, "(": 1 }[v] || 0)];
        }
        if (!/([(). λ]|\s)/.test(v)) {
          if (!z) r.push("");
          z = 1;
        } else z = 0;
        if (z) {
          r[r.length - 1] += v;
          return [r, x, y, z];
        }
        if (a) return [[...r, ""], x + 1];
        return [/\s/.test(v) ? r : [...r, v], x, y, z];
      },
      [[], 0, 0, 0]
    )[0]
    .map(stripUselessParentheses);
}
