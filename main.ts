/*

    simplify

    expression

    A B C D
    
    F = \ x . E

    F B

    = E with each instance of x replaced by B
*/

// (A) (B) (C) (D)

// { func: f , arg: { func: f , arg: { "var" }}}

type Append<A extends string, B extends string> = `${A}${B}`;
type IdentifierCharacters =
  | "$"
  | "q"
  | "w"
  | "e"
  | "r"
  | "t"
  | "y"
  | "u"
  | "i"
  | "o"
  | "p"
  | "a"
  | "s"
  | "d"
  | "f"
  | "g"
  | "h"
  | "j"
  | "k"
  | "l"
  | "z"
  | "x"
  | "c"
  | "v"
  | "b"
  | "n"
  | "m"
  | "Q"
  | "W"
  | "E"
  | "R"
  | "T"
  | "Y"
  | "U"
  | "I"
  | "O"
  | "P"
  | "A"
  | "S"
  | "D"
  | "F"
  | "G"
  | "H"
  | "J"
  | "K"
  | "L"
  | "Z"
  | "X"
  | "C"
  | "V"
  | "B"
  | "N"
  | "M"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "0";

// TODO: proper type
type NonEmptyIdentifier = Append<IdentifierCharacters, string>;

enum TokenType {
  LAMBDA,
  PERIOD,
  EQUALS,
  LPAREN,
  RPAREN,
  IDENTIFIER,
}

const BuiltinTokens = {
  [TokenType.LAMBDA]: "\\",
  [TokenType.PERIOD]: ".",
  [TokenType.EQUALS]: "=",
  [TokenType.LPAREN]: "(",
  [TokenType.RPAREN]: ")",
} as const;

type BuiltinTokens = Values<typeof BuiltinTokens>;

type Tokens = BuiltinTokens | Identifier;

const isIdentifierifier = (s: string): s is Identifier =>
  s != null && /[a-zA-Z]/.test(s);

function is<T extends Tokens>(t: T): (s: string) => s is T {
  return (s: string): s is T => isIdentifierifier(s) || s === t;
}

const SingleCharacterTokens = [
  TokenType.LAMBDA,
  TokenType.PERIOD,
  TokenType.EQUALS,
  TokenType.LPAREN,
  TokenType.RPAREN,
] as const;

// type Lambda = typeof Tokens.LAMBDA;
// type Period = typeof Tokens.PERIOD;
// type Equals = typeof Tokens.EQUALS;
// type LParen = typeof Tokens.LPAREN;
// type RParen = typeof Tokens.RPAREN;
type Identifier = NonEmptyIdentifier;
// type Token = Identifier | Lambda | Period | Equals | LParen | RParen;

type Values<T> = T[keyof T];

type Token = { type: TokenType; value: Tokens };

// enum Token {
//     Identifier, // a | abc | etc
//     Lambda, // \ or lambdasymbol
//     Period,
//     Equals,
//     LParen,
//     RParen,
// }

function lex(s: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    if (isIdentifierifier(s[i])) {
      const thisIdentifierifier = [];
      while (isIdentifierifier(s[i])) {
        thisIdentifierifier.push(s[i]);
        i += 1;
      }
      tokens.push({
        type: TokenType.IDENTIFIER,
        value: thisIdentifierifier.join("") as Identifier,
      });
    } else if (
      SingleCharacterTokens.some(
        (x) => BuiltinTokens[x as TokenType.PERIOD] === s[i]
      )
    ) {
      for (const tokenType of SingleCharacterTokens) {
        const str = BuiltinTokens[tokenType];
        const c = s[i];
        if (is(str)(c)) {
          tokens.push({ type: tokenType, value: c });
          break;
        }
      }
      i += 1;
    } else if (s[i] == " " || s[i] == "\n") {
      i += 1;
    } else {
      throw `Unexpected character: ${s[i]}`;
    }
  }
  return tokens;
}

type Expr = Func | Var | FuncApplication;
// parse((A)) -> parse(A)
type Func = { var: Var; body: Expr };
type Var = string;
type FuncApplication = { func: Expr; arg: Expr };

function consume(tokens: Token[], tokenType: TokenType): Token {
  if (tokens[0] === undefined) {
    throw `tokens is empty`;
  }
  if (tokens[0].type === tokenType) {
    return tokens.shift()!;
  } else {
    throw `expected ${tokenType} but got ${JSON.stringify(tokens[0])}`;
  }
}

// A B C D = (A B C) D = (A B) C D = ((A B) C) D

// A B C D

function funcApplication(terms: Expr[]): Expr {
  const arg = terms.pop()!;
  if (terms.length === 0) {
    return arg;
  }
  return {
    func: funcApplication(terms),
    arg,
  };
}

function parseExpr(tokens: Token[]): Expr {
  //   const term = parseTerm(tokens);
  //   if (tokens.length === 0) {
  //     return term;
  //   }
  //   const rightBinding = {
  //     func: term,
  //     arg: parseExpr(tokens),
  //   };
  const terms = [];
  while (tokens.length > 0) {
    terms.push(parseTerm(tokens));
  }
  return funcApplication(terms);
}
// "A B C"
// ['A', 'B',' C']

function parseTerm(tokens: Token[]): Expr {
  switch (tokens[0].type) {
    case TokenType.LAMBDA: {
      consume(tokens, TokenType.LAMBDA);
      const nameToken = consume(tokens, TokenType.IDENTIFIER);
      consume(tokens, TokenType.PERIOD);
      const expression = parseExpr(tokens);

      //   type Func = { var: Var; body: Expr };

      return {
        var: nameToken.value,
        body: expression,
      };
    }
    case TokenType.IDENTIFIER: {
      return consume(tokens, TokenType.IDENTIFIER).value;
    }
    case TokenType.LPAREN: {
      consume(tokens, TokenType.LPAREN).value;
      let depth = 1;
      const subExpression: Token[] = [];
      while (depth > 0) {
        console.log("sdffsd", depth, subExpression);
        if (tokens.length === 0) throw "Mismatched parentheses error";
        const { type } = tokens[0];
        if (type === TokenType.LPAREN) {
          depth++;
        } else if (type === TokenType.RPAREN) {
          depth--;
        }
        subExpression.push(consume(tokens, type));
      }
      subExpression.pop(); // Getting rid of trailing rparen
      return parseExpr(subExpression);
    }
  }
  throw `unexpected token: ${JSON.stringify(tokens[0])}`;
}
// const sample = "A \\ x . A B \\ y . y";
const sample =
  "\\ f .(f(( (\\ a . b)(snd (re transform abc )) (succ ( snd (ed transform abc ) )) )f x))";
console.log("parsing: ", sample);
console.log("result", JSON.stringify(parseExpr(lex(sample))));
