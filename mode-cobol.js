ace.define("ace/mode/cobol_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var CobolHighlightRules = function() {
    const DECLARATIONS = new Set()
    var keywordMapper = this.createKeywordMapper({
    }, "identifier", true);

    this.$rules = {
        "commented-out" : [{
            token : "comment",
            regex : /.*\*\-/,
            next : "start"
        },{
            token : "comment",
            regex : /.*/
        }],
        "start" : [ {
            token : "comment",
            regex : "--.*$"
        },{
            token : "comment",
            regex : /\-\*/,
            next : "commented-out"
        },{
            token : "comment",
            regex : /\-\*.*?\*-/,
            next : "commented-out"
        },/*{
            // token : "parameters:not complete" ,
            // regex : /([^λ.]+(?=\.))/,
        }*/{
            token : "constant.numeric", // float
            regex : "[λ.]"
        }, {
            token : keywordMapper,
            regex : "[λ.]"
        }, {
            token : "variable",
            regex : /(?=.*\=)(^((?!-\*).)+?)(?=(\s\=\s))/
        }, {
            token : "string",
            regex : "[(]"
        }, {
            token : "storage",
            regex : /\s[=]\s/
        }, {
            token : "string",
            regex : "[)]"
        }, {
            token : "text",
            regex : "\\s+"
        } ]
    };
};

oop.inherits(CobolHighlightRules, TextHighlightRules);

exports.CobolHighlightRules = CobolHighlightRules;
});

ace.define("ace/mode/cobol",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/cobol_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var CobolHighlightRules = require("./cobol_highlight_rules").CobolHighlightRules;

var Mode = function() {
    this.HighlightRules = CobolHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "--";
    this.blockComment = {start: "-*", end: "*-"};

    this.$id = "ace/mode/cobol";
}).call(Mode.prototype);

exports.Mode = Mode;

});                (function() {
                    ace.require(["ace/mode/cobol"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            