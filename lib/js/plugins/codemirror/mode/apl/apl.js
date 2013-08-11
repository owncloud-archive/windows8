CodeMirror.defineMode("apl", function() {
  var builtInOps = {
    ".": "innerProduct",
    "\\": "scan",
    "/": "reduce",
    "âŒ¿": "reduce1Axis",
    "â€": "scan1Axis",
    "Â¨": "each",
    "â£": "power"
  };
  var builtInFuncs = {
    "+": ["conjugate", "add"],
    "âˆ’": ["negate", "subtract"],
    "Ã—": ["signOf", "multiply"],
    "Ã·": ["reciprocal", "divide"],
    "âŒˆ": ["ceiling", "greaterOf"],
    "âŒŠ": ["floor", "lesserOf"],
    "âˆ£": ["absolute", "residue"],
    "â³": ["indexGenerate", "indexOf"],
    "?": ["roll", "deal"],
    "â‹†": ["exponentiate", "toThePowerOf"],
    "âŸ": ["naturalLog", "logToTheBase"],
    "â—‹": ["piTimes", "circularFuncs"],
    "!": ["factorial", "binomial"],
    "âŒ¹": ["matrixInverse", "matrixDivide"],
    "<": [null, "lessThan"],
    "â‰¤": [null, "lessThanOrEqual"],
    "=": [null, "equals"],
    ">": [null, "greaterThan"],
    "â‰¥": [null, "greaterThanOrEqual"],
    "â‰ ": [null, "notEqual"],
    "â‰¡": ["depth", "match"],
    "â‰¢": [null, "notMatch"],
    "âˆˆ": ["enlist", "membership"],
    "â·": [null, "find"],
    "âˆª": ["unique", "union"],
    "âˆ©": [null, "intersection"],
    "âˆ¼": ["not", "without"],
    "âˆ¨": [null, "or"],
    "âˆ§": [null, "and"],
    "â±": [null, "nor"],
    "â²": [null, "nand"],
    "â´": ["shapeOf", "reshape"],
    ",": ["ravel", "catenate"],
    "âª": [null, "firstAxisCatenate"],
    "âŒ½": ["reverse", "rotate"],
    "âŠ–": ["axis1Reverse", "axis1Rotate"],
    "â‰": ["transpose", null],
    "â†‘": ["first", "take"],
    "â†“": [null, "drop"],
    "âŠ‚": ["enclose", "partitionWithAxis"],
    "âŠƒ": ["diclose", "pick"],
    "âŒ·": [null, "index"],
    "â‹": ["gradeUp", null],
    "â’": ["gradeDown", null],
    "âŠ¤": ["encode", null],
    "âŠ¥": ["decode", null],
    "â•": ["format", "formatByExample"],
    "âŽ": ["execute", null],
    "âŠ£": ["stop", "left"],
    "âŠ¢": ["pass", "right"]
  };

  var isOperator = /[\.\/âŒ¿â€Â¨â£]/;
  var isNiladic = /â¬/;
  var isFunction = /[\+âˆ’Ã—Ã·âŒˆâŒŠâˆ£â³\?â‹†âŸâ—‹!âŒ¹<â‰¤=>â‰¥â‰ â‰¡â‰¢âˆˆâ·âˆªâˆ©âˆ¼âˆ¨âˆ§â±â²â´,âªâŒ½âŠ–â‰â†‘â†“âŠ‚âŠƒâŒ·â‹â’âŠ¤âŠ¥â•âŽâŠ£âŠ¢]/;
  var isArrow = /â†/;
  var isComment = /[â#].*$/;

  var stringEater = function(type) {
    var prev;
    prev = false;
    return function(c) {
      prev = c;
      if (c === type) {
        return prev === "\\";
      }
      return true;
    };
  };
  return {
    startState: function() {
      return {
        prev: false,
        func: false,
        op: false,
        string: false,
        escape: false
      };
    },
    token: function(stream, state) {
      var ch, funcName, word;
      if (stream.eatSpace()) {
        return null;
      }
      ch = stream.next();
      if (ch === '"' || ch === "'") {
        stream.eatWhile(stringEater(ch));
        stream.next();
        state.prev = true;
        return "string";
      }
      if (/[\[{\(]/.test(ch)) {
        state.prev = false;
        return null;
      }
      if (/[\]}\)]/.test(ch)) {
        state.prev = true;
        return null;
      }
      if (isNiladic.test(ch)) {
        state.prev = false;
        return "niladic";
      }
      if (/[Â¯\d]/.test(ch)) {
        if (state.func) {
          state.func = false;
          state.prev = false;
        } else {
          state.prev = true;
        }
        stream.eatWhile(/[\w\.]/);
        return "number";
      }
      if (isOperator.test(ch)) {
        return "operator apl-" + builtInOps[ch];
      }
      if (isArrow.test(ch)) {
        return "apl-arrow";
      }
      if (isFunction.test(ch)) {
        funcName = "apl-";
        if (builtInFuncs[ch] != null) {
          if (state.prev) {
            funcName += builtInFuncs[ch][1];
          } else {
            funcName += builtInFuncs[ch][0];
          }
        }
        state.func = true;
        state.prev = false;
        return "function " + funcName;
      }
      if (isComment.test(ch)) {
        stream.skipToEnd();
        return "comment";
      }
      if (ch === "âˆ˜" && stream.peek() === ".") {
        stream.next();
        return "function jot-dot";
      }
      stream.eatWhile(/[\w\$_]/);
      word = stream.current();
      state.prev = true;
      return "keyword";
    }
  };
});

CodeMirror.defineMIME("text/apl", "apl");
