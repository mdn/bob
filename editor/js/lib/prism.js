/* PrismJS 1.19.0
https://prismjs.com/download.html#themes=prism-coy&languages=markup+css+clike+javascript&plugins=line-numbers */
var _self =
  typeof window !== "undefined"
    ? window // if in browser
    : typeof WorkerGlobalScope !== "undefined" &&
      self instanceof WorkerGlobalScope
    ? self // if in worker
    : {}; // if in node js

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function (_self) {
  // Private helper vars
  var lang = /\blang(?:uage)?-([\w-]+)\b/i;
  var uniqueId = 0;

  var _ = {
    manual: _self.Prism && _self.Prism.manual,
    disableWorkerMessageHandler:
      _self.Prism && _self.Prism.disableWorkerMessageHandler,
    util: {
      encode: function (tokens) {
        if (tokens instanceof Token) {
          return new Token(
            tokens.type,
            _.util.encode(tokens.content),
            tokens.alias
          );
        } else if (Array.isArray(tokens)) {
          return tokens.map(_.util.encode);
        } else {
          return tokens
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/\u00a0/g, " ");
        }
      },

      type: function (o) {
        return Object.prototype.toString.call(o).slice(8, -1);
      },

      objId: function (obj) {
        if (!obj["__id"]) {
          Object.defineProperty(obj, "__id", { value: ++uniqueId });
        }
        return obj["__id"];
      },

      // Deep clone a language definition (e.g. to extend it)
      clone: function deepClone(o, visited) {
        var clone,
          id,
          type = _.util.type(o);
        visited = visited || {};

        switch (type) {
          case "Object":
            id = _.util.objId(o);
            if (visited[id]) {
              return visited[id];
            }
            clone = {};
            visited[id] = clone;

            for (var key in o) {
              if (o.hasOwnProperty(key)) {
                clone[key] = deepClone(o[key], visited);
              }
            }

            return clone;

          case "Array":
            id = _.util.objId(o);
            if (visited[id]) {
              return visited[id];
            }
            clone = [];
            visited[id] = clone;

            o.forEach(function (v, i) {
              clone[i] = deepClone(v, visited);
            });

            return clone;

          default:
            return o;
        }
      },

      /**
       * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
       *
       * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
       *
       * @param {Element} element
       * @returns {string}
       */
      getLanguage: function (element) {
        while (element && !lang.test(element.className)) {
          element = element.parentElement;
        }
        if (element) {
          return (element.className.match(lang) || [, "none"])[1].toLowerCase();
        }
        return "none";
      },

      /**
       * Returns the script element that is currently executing.
       *
       * This does __not__ work for line script element.
       *
       * @returns {HTMLScriptElement | null}
       */
      currentScript: function () {
        if (typeof document === "undefined") {
          return null;
        }
        if ("currentScript" in document) {
          return document.currentScript;
        }

        // IE11 workaround
        // we'll get the src of the current script by parsing IE11's error stack trace
        // this will not work for inline scripts

        try {
          throw new Error();
        } catch (err) {
          // Get file src url from stack. Specifically works with the format of stack traces in IE.
          // A stack will look like this:
          //
          // Error
          //    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
          //    at Global code (http://localhost/components/prism-core.js:606:1)

          var src = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(err.stack) || [])[1];
          if (src) {
            var scripts = document.getElementsByTagName("script");
            for (var i in scripts) {
              if (scripts[i].src == src) {
                return scripts[i];
              }
            }
          }
          return null;
        }
      },
    },

    languages: {
      extend: function (id, redef) {
        var lang = _.util.clone(_.languages[id]);

        for (var key in redef) {
          lang[key] = redef[key];
        }

        return lang;
      },

      /**
       * Insert a token before another token in a language literal
       * As this needs to recreate the object (we cannot actually insert before keys in object literals),
       * we cannot just provide an object, we need an object and a key.
       * @param inside The key (or language id) of the parent
       * @param before The key to insert before.
       * @param insert Object with the key/value pairs to insert
       * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
       */
      insertBefore: function (inside, before, insert, root) {
        root = root || _.languages;
        var grammar = root[inside];
        var ret = {};

        for (var token in grammar) {
          if (grammar.hasOwnProperty(token)) {
            if (token == before) {
              for (var newToken in insert) {
                if (insert.hasOwnProperty(newToken)) {
                  ret[newToken] = insert[newToken];
                }
              }
            }

            // Do not insert token which also occur in insert. See #1525
            if (!insert.hasOwnProperty(token)) {
              ret[token] = grammar[token];
            }
          }
        }

        var old = root[inside];
        root[inside] = ret;

        // Update references in other language definitions
        _.languages.DFS(_.languages, function (key, value) {
          if (value === old && key != inside) {
            this[key] = ret;
          }
        });

        return ret;
      },

      // Traverse a language definition with Depth First Search
      DFS: function DFS(o, callback, type, visited) {
        visited = visited || {};

        var objId = _.util.objId;

        for (var i in o) {
          if (o.hasOwnProperty(i)) {
            callback.call(o, i, o[i], type || i);

            var property = o[i],
              propertyType = _.util.type(property);

            if (propertyType === "Object" && !visited[objId(property)]) {
              visited[objId(property)] = true;
              DFS(property, callback, null, visited);
            } else if (propertyType === "Array" && !visited[objId(property)]) {
              visited[objId(property)] = true;
              DFS(property, callback, i, visited);
            }
          }
        }
      },
    },
    plugins: {},

    highlightAll: function (async, callback) {
      _.highlightAllUnder(document, async, callback);
    },

    highlightAllUnder: function (container, async, callback) {
      var env = {
        callback: callback,
        container: container,
        selector:
          'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code',
      };

      _.hooks.run("before-highlightall", env);

      env.elements = Array.prototype.slice.apply(
        env.container.querySelectorAll(env.selector)
      );

      _.hooks.run("before-all-elements-highlight", env);

      for (var i = 0, element; (element = env.elements[i++]); ) {
        _.highlightElement(element, async === true, env.callback);
      }
    },

    highlightElement: function (element, async, callback) {
      // Find language
      var language = _.util.getLanguage(element);
      var grammar = _.languages[language];

      // Set language on the element, if not present
      element.className =
        element.className.replace(lang, "").replace(/\s+/g, " ") +
        " language-" +
        language;

      // Set language on the parent, for styling
      var parent = element.parentNode;
      if (parent && parent.nodeName.toLowerCase() === "pre") {
        parent.className =
          parent.className.replace(lang, "").replace(/\s+/g, " ") +
          " language-" +
          language;
      }

      var code = element.textContent;

      var env = {
        element: element,
        language: language,
        grammar: grammar,
        code: code,
      };

      function insertHighlightedCode(highlightedCode) {
        env.highlightedCode = highlightedCode;

        _.hooks.run("before-insert", env);

        env.element.innerHTML = env.highlightedCode;

        _.hooks.run("after-highlight", env);
        _.hooks.run("complete", env);
        callback && callback.call(env.element);
      }

      _.hooks.run("before-sanity-check", env);

      if (!env.code) {
        _.hooks.run("complete", env);
        callback && callback.call(env.element);
        return;
      }

      _.hooks.run("before-highlight", env);

      if (!env.grammar) {
        insertHighlightedCode(_.util.encode(env.code));
        return;
      }

      if (async && _self.Worker) {
        var worker = new Worker(_.filename);

        worker.onmessage = function (evt) {
          insertHighlightedCode(evt.data);
        };

        worker.postMessage(
          JSON.stringify({
            language: env.language,
            code: env.code,
            immediateClose: true,
          })
        );
      } else {
        insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
      }
    },

    highlight: function (text, grammar, language) {
      var env = {
        code: text,
        grammar: grammar,
        language: language,
      };
      _.hooks.run("before-tokenize", env);
      env.tokens = _.tokenize(env.code, env.grammar);
      _.hooks.run("after-tokenize", env);
      return Token.stringify(_.util.encode(env.tokens), env.language);
    },

    matchGrammar: function (
      text,
      strarr,
      grammar,
      index,
      startPos,
      oneshot,
      target
    ) {
      for (var token in grammar) {
        if (!grammar.hasOwnProperty(token) || !grammar[token]) {
          continue;
        }

        var patterns = grammar[token];
        patterns = Array.isArray(patterns) ? patterns : [patterns];

        for (var j = 0; j < patterns.length; ++j) {
          if (target && target == token + "," + j) {
            return;
          }

          var pattern = patterns[j],
            inside = pattern.inside,
            lookbehind = !!pattern.lookbehind,
            greedy = !!pattern.greedy,
            lookbehindLength = 0,
            alias = pattern.alias;

          if (greedy && !pattern.pattern.global) {
            // Without the global flag, lastIndex won't work
            var flags = pattern.pattern.toString().match(/[imsuy]*$/)[0];
            pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
          }

          pattern = pattern.pattern || pattern;

          // Don’t cache length as it changes during the loop
          for (
            var i = index, pos = startPos;
            i < strarr.length;
            pos += strarr[i].length, ++i
          ) {
            var str = strarr[i];

            if (strarr.length > text.length) {
              // Something went terribly wrong, ABORT, ABORT!
              return;
            }

            if (str instanceof Token) {
              continue;
            }

            if (greedy && i != strarr.length - 1) {
              pattern.lastIndex = pos;
              var match = pattern.exec(text);
              if (!match) {
                break;
              }

              var from =
                  match.index + (lookbehind && match[1] ? match[1].length : 0),
                to = match.index + match[0].length,
                k = i,
                p = pos;

              for (
                var len = strarr.length;
                k < len &&
                (p < to || (!strarr[k].type && !strarr[k - 1].greedy));
                ++k
              ) {
                p += strarr[k].length;
                // Move the index i to the element in strarr that is closest to from
                if (from >= p) {
                  ++i;
                  pos = p;
                }
              }

              // If strarr[i] is a Token, then the match starts inside another Token, which is invalid
              if (strarr[i] instanceof Token) {
                continue;
              }

              // Number of tokens to delete and replace with the new match
              delNum = k - i;
              str = text.slice(pos, p);
              match.index -= pos;
            } else {
              pattern.lastIndex = 0;

              var match = pattern.exec(str),
                delNum = 1;
            }

            if (!match) {
              if (oneshot) {
                break;
              }

              continue;
            }

            if (lookbehind) {
              lookbehindLength = match[1] ? match[1].length : 0;
            }

            var from = match.index + lookbehindLength,
              match = match[0].slice(lookbehindLength),
              to = from + match.length,
              before = str.slice(0, from),
              after = str.slice(to);

            var args = [i, delNum];

            if (before) {
              ++i;
              pos += before.length;
              args.push(before);
            }

            var wrapped = new Token(
              token,
              inside ? _.tokenize(match, inside) : match,
              alias,
              match,
              greedy
            );

            args.push(wrapped);

            if (after) {
              args.push(after);
            }

            Array.prototype.splice.apply(strarr, args);

            if (delNum != 1)
              _.matchGrammar(
                text,
                strarr,
                grammar,
                i,
                pos,
                true,
                token + "," + j
              );

            if (oneshot) break;
          }
        }
      }
    },

    tokenize: function (text, grammar) {
      var strarr = [text];

      var rest = grammar.rest;

      if (rest) {
        for (var token in rest) {
          grammar[token] = rest[token];
        }

        delete grammar.rest;
      }

      _.matchGrammar(text, strarr, grammar, 0, 0, false);

      return strarr;
    },

    hooks: {
      all: {},

      add: function (name, callback) {
        var hooks = _.hooks.all;

        hooks[name] = hooks[name] || [];

        hooks[name].push(callback);
      },

      run: function (name, env) {
        var callbacks = _.hooks.all[name];

        if (!callbacks || !callbacks.length) {
          return;
        }

        for (var i = 0, callback; (callback = callbacks[i++]); ) {
          callback(env);
        }
      },
    },

    Token: Token,
  };

  _self.Prism = _;

  function Token(type, content, alias, matchedStr, greedy) {
    this.type = type;
    this.content = content;
    this.alias = alias;
    // Copy of the full string this token was created from
    this.length = (matchedStr || "").length | 0;
    this.greedy = !!greedy;
  }

  Token.stringify = function (o, language) {
    if (typeof o == "string") {
      return o;
    }

    if (Array.isArray(o)) {
      return o
        .map(function (element) {
          return Token.stringify(element, language);
        })
        .join("");
    }

    var env = {
      type: o.type,
      content: Token.stringify(o.content, language),
      tag: "span",
      classes: ["token", o.type],
      attributes: {},
      language: language,
    };

    if (o.alias) {
      var aliases = Array.isArray(o.alias) ? o.alias : [o.alias];
      Array.prototype.push.apply(env.classes, aliases);
    }

    _.hooks.run("wrap", env);

    var attributes = Object.keys(env.attributes)
      .map(function (name) {
        return (
          name +
          '="' +
          (env.attributes[name] || "").replace(/"/g, "&quot;") +
          '"'
        );
      })
      .join(" ");

    return (
      "<" +
      env.tag +
      ' class="' +
      env.classes.join(" ") +
      '"' +
      (attributes ? " " + attributes : "") +
      ">" +
      env.content +
      "</" +
      env.tag +
      ">"
    );
  };

  if (!_self.document) {
    if (!_self.addEventListener) {
      // in Node.js
      return _;
    }

    if (!_.disableWorkerMessageHandler) {
      // In worker
      _self.addEventListener(
        "message",
        function (evt) {
          var message = JSON.parse(evt.data),
            lang = message.language,
            code = message.code,
            immediateClose = message.immediateClose;

          _self.postMessage(_.highlight(code, _.languages[lang], lang));
          if (immediateClose) {
            _self.close();
          }
        },
        false
      );
    }

    return _;
  }

  //Get current script and highlight
  var script = _.util.currentScript();

  if (script) {
    _.filename = script.src;

    if (script.hasAttribute("data-manual")) {
      _.manual = true;
    }
  }

  if (!_.manual) {
    function highlightAutomaticallyCallback() {
      if (!_.manual) {
        _.highlightAll();
      }
    }

    // If the document state is "loading", then we'll use DOMContentLoaded.
    // If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
    // DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
    // might take longer one animation frame to execute which can create a race condition where only some plugins have
    // been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
    // See https://github.com/PrismJS/prism/issues/2102
    var readyState = document.readyState;
    if (
      readyState === "loading" ||
      (readyState === "interactive" && script && script.defer)
    ) {
      document.addEventListener(
        "DOMContentLoaded",
        highlightAutomaticallyCallback
      );
    } else {
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(highlightAutomaticallyCallback);
      } else {
        window.setTimeout(highlightAutomaticallyCallback, 16);
      }
    }
  }

  return _;
})(_self);

if (typeof module !== "undefined" && module.exports) {
  module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof global !== "undefined") {
  global.Prism = Prism;
}
Prism.languages.markup = {
  comment: /<!--[\s\S]*?-->/,
  prolog: /<\?[\s\S]+?\?>/,
  doctype: {
    pattern:
      /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:(?!<!--)[^"'\]]|"[^"]*"|'[^']*'|<!--[\s\S]*?-->)*\]\s*)?>/i,
    greedy: true,
  },
  cdata: /<!\[CDATA\[[\s\S]*?]]>/i,
  tag: {
    pattern:
      /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/i,
    greedy: true,
    inside: {
      tag: {
        pattern: /^<\/?[^\s>\/]+/i,
        inside: {
          punctuation: /^<\/?/,
          namespace: /^[^\s>\/:]+:/,
        },
      },
      "attr-value": {
        pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
        inside: {
          punctuation: [
            /^=/,
            {
              pattern: /^(\s*)["']|["']$/,
              lookbehind: true,
            },
          ],
        },
      },
      punctuation: /\/?>/,
      "attr-name": {
        pattern: /[^\s>\/]+/,
        inside: {
          namespace: /^[^\s>\/:]+:/,
        },
      },
    },
  },
  entity: /&#?[\da-z]{1,8};/i,
};

Prism.languages.markup["tag"].inside["attr-value"].inside["entity"] =
  Prism.languages.markup["entity"];

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add("wrap", function (env) {
  if (env.type === "entity") {
    env.attributes["title"] = env.content.replace(/&amp;/, "&");
  }
});

Object.defineProperty(Prism.languages.markup.tag, "addInlined", {
  /**
   * Adds an inlined language to markup.
   *
   * An example of an inlined language is CSS with `<style>` tags.
   *
   * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
   * case insensitive.
   * @param {string} lang The language key.
   * @example
   * addInlined('style', 'css');
   */
  value: function addInlined(tagName, lang) {
    var includedCdataInside = {};
    includedCdataInside["language-" + lang] = {
      pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
      lookbehind: true,
      inside: Prism.languages[lang],
    };
    includedCdataInside["cdata"] = /^<!\[CDATA\[|\]\]>$/i;

    var inside = {
      "included-cdata": {
        pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
        inside: includedCdataInside,
      },
    };
    inside["language-" + lang] = {
      pattern: /[\s\S]+/,
      inside: Prism.languages[lang],
    };

    var def = {};
    def[tagName] = {
      pattern: RegExp(
        /(<__[\s\S]*?>)(?:<!\[CDATA\[[\s\S]*?\]\]>\s*|[\s\S])*?(?=<\/__>)/.source.replace(
          /__/g,
          tagName
        ),
        "i"
      ),
      lookbehind: true,
      greedy: true,
      inside: inside,
    };

    Prism.languages.insertBefore("markup", "cdata", def);
  },
});

Prism.languages.xml = Prism.languages.extend("markup", {});
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;

(function (Prism) {
  var string = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

  Prism.languages.css = {
    comment: /\/\*[\s\S]*?\*\//,
    atrule: {
      pattern: /@[\w-]+[\s\S]*?(?:;|(?=\s*\{))/,
      inside: {
        rule: /@[\w-]+/,
        // See rest below
      },
    },
    url: {
      pattern: RegExp("url\\((?:" + string.source + "|[^\n\r()]*)\\)", "i"),
      inside: {
        function: /^url/i,
        punctuation: /^\(|\)$/,
      },
    },
    selector: RegExp(
      "[^{}\\s](?:[^{};\"']|" + string.source + ")*?(?=\\s*\\{)"
    ),
    string: {
      pattern: string,
      greedy: true,
    },
    property: /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
    important: /!important\b/i,
    function: /[-a-z0-9]+(?=\()/i,
    punctuation: /[(){};:,]/,
  };

  Prism.languages.css["atrule"].inside.rest = Prism.languages.css;

  var markup = Prism.languages.markup;
  if (markup) {
    markup.tag.addInlined("style", "css");

    Prism.languages.insertBefore(
      "inside",
      "attr-value",
      {
        "style-attr": {
          pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
          inside: {
            "attr-name": {
              pattern: /^\s*style/i,
              inside: markup.tag.inside,
            },
            punctuation: /^\s*=\s*['"]|['"]\s*$/,
            "attr-value": {
              pattern: /.+/i,
              inside: Prism.languages.css,
            },
          },
          alias: "language-css",
        },
      },
      markup.tag
    );
  }
})(Prism);

Prism.languages.clike = {
  comment: [
    {
      pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
      lookbehind: true,
    },
    {
      pattern: /(^|[^\\:])\/\/.*/,
      lookbehind: true,
      greedy: true,
    },
  ],
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true,
  },
  "class-name": {
    pattern:
      /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
    lookbehind: true,
    inside: {
      punctuation: /[.\\]/,
    },
  },
  keyword:
    /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
  boolean: /\b(?:true|false)\b/,
  function: /\w+(?=\()/,
  number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
  operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
  punctuation: /[{}[\];(),.:]/,
};

Prism.languages.javascript = Prism.languages.extend("clike", {
  "class-name": [
    Prism.languages.clike["class-name"],
    {
      pattern:
        /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
      lookbehind: true,
    },
  ],
  keyword: [
    {
      pattern: /((?:^|})\s*)(?:catch|finally)\b/,
      lookbehind: true,
    },
    {
      pattern:
        /(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
      lookbehind: true,
    },
  ],
  number:
    /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
  // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
  function:
    /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
  operator:
    /--|\+\+|\*\*=?|=>|&&|\|\||[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?[.?]?|[~:]/,
});

Prism.languages.javascript["class-name"][0].pattern =
  /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

Prism.languages.insertBefore("javascript", "keyword", {
  regex: {
    pattern:
      /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*[\s\S]*?\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,
    lookbehind: true,
    greedy: true,
  },
  // This must be declared before keyword because we use "function" inside the look-forward
  "function-variable": {
    pattern:
      /#?[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,
    alias: "function",
  },
  parameter: [
    {
      pattern:
        /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
      lookbehind: true,
      inside: Prism.languages.javascript,
    },
    {
      pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
      inside: Prism.languages.javascript,
    },
    {
      pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
      lookbehind: true,
      inside: Prism.languages.javascript,
    },
    {
      pattern:
        /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
      lookbehind: true,
      inside: Prism.languages.javascript,
    },
  ],
  constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/,
});

Prism.languages.insertBefore("javascript", "string", {
  "template-string": {
    pattern:
      /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
    greedy: true,
    inside: {
      "template-punctuation": {
        pattern: /^`|`$/,
        alias: "string",
      },
      interpolation: {
        pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
        lookbehind: true,
        inside: {
          "interpolation-punctuation": {
            pattern: /^\${|}$/,
            alias: "punctuation",
          },
          rest: Prism.languages.javascript,
        },
      },
      string: /[\s\S]+/,
    },
  },
});

if (Prism.languages.markup) {
  Prism.languages.markup.tag.addInlined("script", "javascript");
}

Prism.languages.js = Prism.languages.javascript;

(function () {
  if (typeof self === "undefined" || !self.Prism || !self.document) {
    return;
  }

  /**
   * Plugin name which is used as a class name for <pre> which is activating the plugin
   * @type {String}
   */
  var PLUGIN_NAME = "line-numbers";

  /**
   * Regular expression used for determining line breaks
   * @type {RegExp}
   */
  var NEW_LINE_EXP = /\n(?!$)/g;

  /**
   * Resizes line numbers spans according to height of line of code
   * @param {Element} element <pre> element
   */
  var _resizeElement = function (element) {
    var codeStyles = getStyles(element);
    var whiteSpace = codeStyles["white-space"];

    if (whiteSpace === "pre-wrap" || whiteSpace === "pre-line") {
      var codeElement = element.querySelector("code");
      var lineNumbersWrapper = element.querySelector(".line-numbers-rows");
      var lineNumberSizer = element.querySelector(".line-numbers-sizer");
      var codeLines = codeElement.textContent.split(NEW_LINE_EXP);

      if (!lineNumberSizer) {
        lineNumberSizer = document.createElement("span");
        lineNumberSizer.className = "line-numbers-sizer";

        codeElement.appendChild(lineNumberSizer);
      }

      lineNumberSizer.style.display = "block";

      codeLines.forEach(function (line, lineNumber) {
        lineNumberSizer.textContent = line || "\n";
        var lineSize = lineNumberSizer.getBoundingClientRect().height;
        lineNumbersWrapper.children[lineNumber].style.height = lineSize + "px";
      });

      lineNumberSizer.textContent = "";
      lineNumberSizer.style.display = "none";
    }
  };

  /**
   * Returns style declarations for the element
   * @param {Element} element
   */
  var getStyles = function (element) {
    if (!element) {
      return null;
    }

    return window.getComputedStyle
      ? getComputedStyle(element)
      : element.currentStyle || null;
  };

  window.addEventListener("resize", function () {
    Array.prototype.forEach.call(
      document.querySelectorAll("pre." + PLUGIN_NAME),
      _resizeElement
    );
  });

  Prism.hooks.add("complete", function (env) {
    if (!env.code) {
      return;
    }

    var code = env.element;
    var pre = code.parentNode;

    // works only for <code> wrapped inside <pre> (not inline)
    if (!pre || !/pre/i.test(pre.nodeName)) {
      return;
    }

    // Abort if line numbers already exists
    if (code.querySelector(".line-numbers-rows")) {
      return;
    }

    var addLineNumbers = false;
    var lineNumbersRegex = /(?:^|\s)line-numbers(?:\s|$)/;

    for (var element = code; element; element = element.parentNode) {
      if (lineNumbersRegex.test(element.className)) {
        addLineNumbers = true;
        break;
      }
    }

    // only add line numbers if <code> or one of its ancestors has the `line-numbers` class
    if (!addLineNumbers) {
      return;
    }

    // Remove the class 'line-numbers' from the <code>
    code.className = code.className.replace(lineNumbersRegex, " ");
    // Add the class 'line-numbers' to the <pre>
    if (!lineNumbersRegex.test(pre.className)) {
      pre.className += " line-numbers";
    }

    var match = env.code.match(NEW_LINE_EXP);
    var linesNum = match ? match.length + 1 : 1;
    var lineNumbersWrapper;

    var lines = new Array(linesNum + 1).join("<span></span>");

    lineNumbersWrapper = document.createElement("span");
    lineNumbersWrapper.setAttribute("aria-hidden", "true");
    lineNumbersWrapper.className = "line-numbers-rows";
    lineNumbersWrapper.innerHTML = lines;

    if (pre.hasAttribute("data-start")) {
      pre.style.counterReset =
        "linenumber " + (parseInt(pre.getAttribute("data-start"), 10) - 1);
    }

    env.element.appendChild(lineNumbersWrapper);

    _resizeElement(pre);

    Prism.hooks.run("line-numbers", env);
  });

  Prism.hooks.add("line-numbers", function (env) {
    env.plugins = env.plugins || {};
    env.plugins.lineNumbers = true;
  });

  /**
   * Global exports
   */
  Prism.plugins.lineNumbers = {
    /**
     * Get node for provided line number
     * @param {Element} element pre element
     * @param {Number} number line number
     * @return {Element|undefined}
     */
    getLine: function (element, number) {
      if (
        element.tagName !== "PRE" ||
        !element.classList.contains(PLUGIN_NAME)
      ) {
        return;
      }

      var lineNumberRows = element.querySelector(".line-numbers-rows");
      var lineNumberStart =
        parseInt(element.getAttribute("data-start"), 10) || 1;
      var lineNumberEnd =
        lineNumberStart + (lineNumberRows.children.length - 1);

      if (number < lineNumberStart) {
        number = lineNumberStart;
      }
      if (number > lineNumberEnd) {
        number = lineNumberEnd;
      }

      var lineIndex = number - lineNumberStart;

      return lineNumberRows.children[lineIndex];
    },
  };
})();
