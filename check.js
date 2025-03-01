// @ts-nocheck

function containsErrors(allLines) {
  /*
        if there are no errors, the return value will be the expression
        variable names will be parsed unconditonally
    */

  const lastLineWithEqualSign = allLines.reduce(
    (a, v, i) => (v.includes(" = ") ? i : a),
    -1
  );
  const expLine = allLines.findIndex(
    (line, i) => i > lastLineWithEqualSign && line.length && !/^\s/.test(line)
  );
  let expression = "";
  if (expLine < 0) return doError("missing main expression");
  for (let row = 0, currentVar; row < allLines.length; row++) {
    const ln = allLines[row];
    const startsWithWS = /^\s/.test(ln);
    const line = ln.trim();
    if (!line) continue;
    const col = line.indexOf(" = ");
    const decl = col >= 0;

    if (row >= expLine) {
      if (row > expLine && !startsWithWS)
        return doError("indentation expected", row);

      if (decl) return doError('main expression cannot contain " = "', row);

      expression += " " + line;
      continue;
    }

    if (startsWithWS) {
      if (decl || !currentVar) return doError("Illegal indentation", row);

      DEFINITIONS[currentVar] += " " + line;
      continue;
    }

    const col2 = line.lastIndexOf(" = ");

    if (col < 0)
      return doError(
        "Declarations require one equal sign, surrounded by whitespace.",
        row
      );

    if (col !== col2)
      return doError(
        "Only one equal sign is allowed per variable declaration.",
        row
      );

    const [name, value] = line.split` = `.map((x) => x.trim());

    if (DEFINITIONS[name])
      return doError(`${name} has already been declared.`, row);

    DEFINITIONS[name] = value;
    currentVar = name;

    if (/[λ.() ]/.test(name))
      return doError(
        'Names shouldn\'t contains any of these characers <code>"λ.() "</code>.',
        row
      );
  }
  for (const name in DEFINITIONS) {
    const value = finalStep(DEFINITIONS[name]);
    const error = anyError(
      value,
      allLines.findIndex((row) => row.trim().startsWith(name))
    );
    if (error) {
      log(name, DEFINITIONS[name]);
      return error;
    }
  }

  if (!expression)
    return doError("Error: Missing main expression", expLine, null);

  const error = anyError(
    expression,
    expLine,
    [...allLines[expLine]].findIndex((c) => c != " ")
  ); // column offset

  if (error) return error;

  return { value: expression };
}

function anyError(line, row = 0, ioffset = 0) {
  const a = line.includes(λ),
    b = line.includes(".");
  if (a ^ b)
    return doError(
      `Error: expression contains ${a ? λ : "."} but not ${a ? "." : λ}`,
      row,
      ioffset
    );

  if (!matchedParenthesis(line))
    return doError("Mismatched parenthesis", row, Infinity);

  for (let i = 0, last, lastchar, realLast; i <= line.length; i++) {
    if (i === line.length) {
      if (last === λ) {
        return doError("Unterminated lambda head", row, i + ioffset);
      } else break;
    }

    if (realLast === "(" && line[i] === ")")
      return doError("Empty expression inside parentheses", row, i + ioffset);

    realLast = line[i] === " " ? realLast : line[i];

    if (/[λ.]/.test(line[i])) {
      if (last === line[i])
        return doError(
          `Syntax error: two ${last} in a row in expression`,
          row,
          i + ioffset
        );

      if (last == null && line[i] == ".")
        return doError(`Syntax error: '.' without λ`, row, i + ioffset);

      last = line[i];
      if (/[λ.]/.test(lastchar) && lastchar + line[i] !== ".λ")
        return doError(`Syntax error: ${lastchar + line[i]}`, row, i + ioffset);

      lastchar = line[i];
    } else lastchar = "";
  }
  if (line[0] === ".") return doError(`Syntax error: .`, row, ioffset);

  if (/[λ.]/.test(line[line.length - 1]))
    return doError(
      `Syntax error: unterminated lambda`,
      row,
      ioffset + line.length
    );

  return null;
}

function doError(text, row, column = 0) {
  editor.selection.moveTo(row, column);
  editor.focus();
  return { isError: true, value: text + ` (line ${row + 1})` };
}
