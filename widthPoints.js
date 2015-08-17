(function() {

  // Based on https://gist.github.com/ssafejava/6605832

  var isDefined = function(variable) {
    return typeof variable !== 'undefined';
  }

  var ELEMENT_RE = /[\w-]+/g,
      ID_RE = /#[\w-]+/g,
      CLASS_RE = /\.[\w-]+/g,
      ATTR_RE = /\[[^\]]+\]/g,
      // :not() pseudo-class does not add to specificity, but its content does as if it was outside it
      PSEUDO_CLASSES_RE = /\:(?!not)[\w-]+(\(.*\))?/g,
      PSEUDO_ELEMENTS_RE = /\:\:?(after|before|first-letter|first-line|selection)/g;
    
  // convert an array-like object to array
  function toArray (list) {
    return [].slice.call(list);
  }

  // handles extraction of `cssRules` as an `Array` from a stylesheet or something that behaves the same
  function getSheetRules (stylesheet) {
    var sheet_media = stylesheet.media && stylesheet.media.mediaText;
    // if this sheet is disabled skip it
    if ( stylesheet.disabled) return [];
    try {
      // can not read external non cross domain stylesheets
      if (!stylesheet.cssRules) return [];
    } catch(e) {
      return [];
    }
    // if this sheet's media is specified and doesn't match the viewport then skip it
    //if ( sheet_media && sheet_media.length && ! window.matchMedia(sheet_media).matches ) return [];
    // get the style rules of this sheet
    return toArray(stylesheet.cssRules);
  }

  function _find (string, re) {
    var matches = string.match(re);
    return re ? re.length : 0;
  }

  // calculates the specificity of a given `selector`
  function calculateScore (selector) {
    var score = [0,0,0],
        parts = selector.split(' '),
        part, match;
    //TODO: clean the ':not' part since the last ELEMENT_RE will pick it up
    while ( part = parts.shift(), typeof part == 'string' ) {
      // find all pseudo-elements
      match = _find(part, PSEUDO_ELEMENTS_RE);
      score[2] = match;
      // and remove them
      match && (part = part.replace(PSEUDO_ELEMENTS_RE, ''));
      // find all pseudo-classes
      match = _find(part, PSEUDO_CLASSES_RE);
      score[1] = match;
      // and remove them
      match && (part = part.replace(PSEUDO_CLASSES_RE, ''));
      // find all attributes
      match = _find(part, ATTR_RE);
      score[1] += match;
      // and remove them
      match && (part = part.replace(ATTR_RE, ''));
      // find all IDs
      match = _find(part, ID_RE);
      score[0] = match;
      // and remove them
      match && (part = part.replace(ID_RE, ''));
      // find all classes
      match = _find(part, CLASS_RE);
      score[1] += match;
      // and remove them
      match && (part = part.replace(CLASS_RE, ''));
      // find all elements
      score[2] += _find(part, ELEMENT_RE);
    }
    return parseInt(score.join(''), 10);
  }

  // returns the heights possible specificity score an element can get from a give rule's selectorText
  function getSpecificityScore (element, selector_text) {
    var selectors = selector_text.split(','),
        selector, score, result = 0;
    while ( selector = selectors.shift() ) {
      if ( matchesSelector(element, selector) ) {
        score = calculateScore(selector);
        result = score > result ? score : result;
      }
    }
    return result;
  }

  function sortBySpecificity (element, rules) {
    // comparing function that sorts CSSStyleRules according to specificity of their `selectorText`
    function compareSpecificity (a, b) {
      return getSpecificityScore(element, b.selectorText) - getSpecificityScore(element, a.selectorText);
    }

    return rules.sort(compareSpecificity);
  }

  // Find correct matchesSelector impl
  function matchesSelector (el, selector) {
    //var matcher = el.matches || el.matchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector || el.msMatchesSelector;

    return el.matches(selector);
  }

  //TODO: not supporting 2nd argument for selecting pseudo elements
  //TODO: not supporting 3rd argument for checking author style sheets only
  var getElementStylesheet = function (element) {
    var style_sheets, sheet, sheet_media,
        rules, rule,
        result = [];

    // get stylesheets and convert to a regular Array
    style_sheets = toArray(window.document.styleSheets);

    // assuming the browser hands us stylesheets in order of appearance
    // we iterate them from the beginning to follow proper cascade order
    while ( sheet = style_sheets.shift() ) {
      // get the style rules of this sheet
      rules = getSheetRules(sheet);
      // loop the rules in order of appearance
      while ( rule = rules.shift() ) {
        // if this is an @import rule
        if ( rule.styleSheet ) {
          // insert the imported stylesheet's rules at the beginning of this stylesheet's rules
          rules = getSheetRules(rule.styleSheet).concat(rules);
          // and skip this rule
          continue;
        }
        // if there's no stylesheet attribute BUT there IS a media attribute it's a media rule
        else if ( rule.media ) {
          // insert the contained rules of this media rule to the beginning of this stylesheet's rules
          rules = getSheetRules(rule).concat(rules);
          // and skip it
          continue;
        }

        // check if this element matches this rule's selector
        if ( matchesSelector(element, rule.selectorText) ) {
          // push the rule to the results set
          result.push(rule);
        }
      }
    }
    // sort according to specificity
    return sortBySpecificity(element, result);
  };

  // Get current current base parameters for given window width
  function getBaseWidths(intervals, winWidth) {
    var diff, ndiff, w;

    for (var i in intervals) {
      if (intervals.hasOwnProperty(i)) {
        ndiff = i - winWidth;
        if (!diff || (ndiff < 0 && ndiff > diff) || (ndiff >= 0 && ndiff < diff)) {
          w = intervals[i];
          diff = ndiff;
        }
      }
    }

    return (isDefined(w)) ? Object.create(w) : isDefined(intervals[0]) ? Object.create(intervals[0]) : {0: {width: undefined, min: undefined, max: undefined}};
  }

  // TODO: should take baseWiths !important into account when overwriting values
  // Currently assumption is made that unit is present if value is present
  function assignWidths(newWidths, baseWidths) {
    var   widths = {};

    widths.width          = newWidths && isDefined(newWidths.width) ? newWidths.width     : baseWidths ? baseWidths.width     : undefined;
    widths.widthUnit      = newWidths && isDefined(newWidths.width) ? newWidths.widthUnit : baseWidths ? baseWidths.widthUnit : undefined;
    widths.widthImportant = newWidths && isDefined(newWidths.widthImportant) ? newWidths.widthImportant : baseWidths ? baseWidths.widthImportant : undefined;

    widths.min            = newWidths && isDefined(newWidths.min) ? newWidths.min     : baseWidths ? baseWidths.min     : undefined;
    widths.minUnit        = newWidths && isDefined(newWidths.min) ? newWidths.minUnit : baseWidths ? baseWidths.minUnit : undefined;
    widths.minImportant   = newWidths && isDefined(newWidths.minImportant) ? newWidths.minImportant : baseWidths ? baseWidths.minImportant : undefined;

    widths.max            = newWidths && isDefined(newWidths.max) ? newWidths.max     : baseWidths ? baseWidths.max     : undefined;
    widths.maxUnit        = newWidths && isDefined(newWidths.max) ? newWidths.maxUnit : baseWidths ? baseWidths.maxUnit : undefined;
    widths.maxImportant   = newWidths && isDefined(newWidths.maxImportant) ? newWidths.maxImportant : baseWidths ? baseWidths.maxImportant : undefined;

    widths.fontSize          = newWidths && isDefined(newWidths.fontSize) ? newWidths.fontSize      : baseWidths ? baseWidths.fontSize     : undefined;
    widths.fontSizeUnit      = newWidths && isDefined(newWidths.fontSize) ? newWidths.fontSizeUnit  : baseWidths ? baseWidths.fontSizeUnit : undefined;
    widths.fontSizeImportant = newWidths && isDefined(newWidths.fontSizeImportant) ? newWidths.fontSizeImportant : baseWidths ? baseWidths.fontSizeImportant : undefined;

    return widths;
  }

  function setWidthInteval(intervals, width, start, end) {
    var baseWidths = getBaseWidths(intervals, end);

    if (!start) {
      start = 0;
    }

    // remove split conflicting entries and update base
    for (var i in intervals) {
      if (intervals.hasOwnProperty(i) && parseFloat(i)) {
        if (parseFloat(i) >= start && (!end || parseFloat(i) <= end)) {
          if (isDefined(intervals[i].width)) {
            baseWidths.width = intervals[i].width;
            baseWidths.widthUnit = intervals[i].widthUnit;
          }
          if (isDefined(intervals[i].min)) {
            baseWidths.min = intervals[i].min;
            baseWidths.minUnit = intervals[i].minUnit;
          }
          if (isDefined(intervals[i].max)) {
            baseWidths.max = intervals[i].max;
            baseWidths.maxUnit = intervals[i].maxUnit;
          }
          if (isDefined(intervals[i].fontSize)) {
            baseWidths.fontSize = intervals[i].fontSize;
            baseWidths.fontSizeUnit = intervals[i].fontSizeUnit;
          }
          delete intervals[i];
        }
      }
    }

    intervals[start] = assignWidths(width, baseWidths);

    if (end && baseWidths) {
      intervals[end] = baseWidths;
    }
  }

  // Goes through min max and width aprameters to return the actual maximal width the element can have
  function resolveMinMax(intervals) {
    var o = {}, w;
    for(var i in intervals) {
      if (intervals.hasOwnProperty(i)) {
        if (isDefined(intervals[i])) {
          w = intervals[i].width;

          if (typeof intervals[i].max !== 'undefined') {
            w = w ? Math.min(w, intervals[i].max) : intervals[i].max;
          }

          if (typeof intervals[i].min !== 'undefined') {
            w = w ? Math.max(w, intervals[i].min) : intervals[i].min;
          }
        } else {
          w = undefined;
        }
        o[i] = w;
      }
    }
    return o;
  }

  // Parses style string for defined properties
  function getPropertiesFromStyleStr(styleStr, element) {
    var wMatch, maxwMatch, minwMatch, fSizeMatch,
        w, wUnit, maxw, maxwUnit, minw, minwUnit, fSize, fSizeUnit;

    wMatch = styleStr.match(/([^-]|\s|;|^)width:\s?(\d+)(px|em|rem|vw|vh|%)(\s+(!\s?important))?/);
    w = wMatch && isDefined(wMatch[2]) ? parseFloat(wMatch[2]) : undefined;
    wUnit = wMatch && isDefined(wMatch[2]) && isDefined(wMatch[3]) ? wMatch[3] : undefined;

    maxwMatch = styleStr.match(/max-width:\s?(\d+)(px|em|rem|vw|vh|%)(\s+(!\s?important))?/);
    maxw = maxwMatch && isDefined(maxwMatch[1]) ? parseFloat(maxwMatch[1]) : undefined;
    maxwUnit = maxwMatch && isDefined(maxwMatch[1]) && isDefined(maxwMatch[2]) ? maxwMatch[2] : undefined;

    minwMatch = styleStr.match(/min-width:\s?(\d+)(px|em|rem|vw|vh|%)(\s+(!\s?important))?/);
    minw = minwMatch && typeof minwMatch[1] !== 'undefined' ? parseFloat(minwMatch[1]) : undefined;
    minwUnit = minwMatch && isDefined(minwMatch[1]) && isDefined(minwMatch[2]) ? minwMatch[2] : undefined;

    fSizeMatch = styleStr.match(/font-size:\s?(\d+)(px|em|rem|vw|vh|%)(\s+(!\s?important))?/);
    fSize = fSizeMatch && typeof fSizeMatch[1] !== 'undefined' ? parseFloat(fSizeMatch[1]) : undefined;
    fSizeUnit = fSizeMatch && isDefined(fSizeMatch[1]) && isDefined(fSizeMatch[2]) ? fSizeMatch[2] : undefined;

    return {
      min: minw,
      minImportant: !!(minwMatch && isDefined(minwMatch[4]) && /^!\s?important$/.test(wMatch[4])),
      minUnit: minwUnit,

      max: maxw,
      maxImportant: !!(maxwMatch && isDefined(maxwMatch[4]) && /^!\s?important$/.test(wMatch[4])),
      maxUnit: maxwUnit,

      width: w,
      widthImportant: !!(wMatch && isDefined(wMatch[5]) && /^!\s?important$/.test(wMatch[5])),
      widthUnit: wUnit,

      fontSize: fSize,
      fontSizeUnit: fSizeUnit,
      fontSizeImportant: !!(fSizeMatch && isDefined(fSizeMatch[4]) && /^!\s?important$/.test(fSizeMatch[4]))
    };
  }

  // Merges inline styles on found rules (inlines more important unless rule is !important)
  function mergeWithInline(intervals, inlineWidths) {
    if (inlineWidths) {
      for (var i in intervals) {
        if (intervals.hasOwnProperty(i)) {
          if (isDefined(inlineWidths.width) && (inlineWidths.widthImportant || !intervals[i].widthImportant)) {
            intervals[i].width = inlineWidths.width;
            intervals[i].widthUnit = inlineWidths.widthUnit;
            intervals[i].widthImportant = inlineWidths.widthImportant;
          }
          if (isDefined(inlineWidths.max) && (inlineWidths.maxImportant || !intervals[i].maxImportant)) {
            intervals[i].max = inlineWidths.max;
            intervals[i].maxUnit = inlineWidths.maxUnit;
            intervals[i].maxImportant = inlineWidths.maxImportant;
          }
          if (isDefined(inlineWidths.min) && (inlineWidths.minImportant || !intervals[i].minImportant)) {
            intervals[i].min = inlineWidths.min;
            intervals[i].minUnit = inlineWidths.minUnit;
            intervals[i].minImportant = inlineWidths.minImportant;
          }
          if (isDefined(inlineWidths.fontSize) && (inlineWidths.fontSizeImportant || !intervals[i].fontSizeImportant)) {
            intervals[i].fontSize = inlineWidths.fontSize;
            intervals[i].fontSizeUnit = inlineWidths.fontSizeUnit;
            intervals[i].fontSizeImportant = inlineWidths.fontSizeImportant;
          }

        }
      }
    }
  }

  // Returns widths of one element
  function elementWidthPoints(element) {
    var rules = getElementStylesheet(element),
        inlineRules = element.getAttribute('style'),
        intervals = {},
        widthIsMaxw = false,
        winMinMatch, winMaxMatch, min, max, widths, inlineWidths;

    if (inlineRules) {
      inlineWidths = getPropertiesFromStyleStr(inlineRules);
      if (inlineWidths) {
        intervals[0] = inlineWidths;
      }
    }

    for (var i = 0, maxi = rules.length; i < maxi; i++) {
      if ((/(width|font-size):\s?(\d+)(px|em|rem|vw|vh|%)/).test(rules[i].cssText)) {

        widths = getPropertiesFromStyleStr(rules[i].cssText, element);

        if (rules[i].parentRule && rules[i].parentRule.media && rules[i].parentRule.media[0] && (/(max\-width|min\-width)/).test(rules[i].parentRule.media[0])) {
          // Update intervals as mediaquery interval rule
          
          winMinMatch = rules[i].parentRule.media[0].match(/min\-width:\s?(\d+)px/);
          winMaxMatch = rules[i].parentRule.media[0].match(/max\-width:\s?(\d+)px/);

          min = winMinMatch && winMinMatch[1] ? parseFloat(winMinMatch[1]) : 0;
          max = winMaxMatch && winMaxMatch[1] ? parseFloat(winMaxMatch[1]) : null;

          setWidthInteval(intervals, widths, min, max);
        } else {
          // Update intervals as base rule
          setWidthInteval(intervals, widths, 0);
        }
      }
    }

    // Apply inline overrride
    if (inlineWidths) {
      mergeWithInline(intervals, inlineWidths);
    }

    return intervals;
  }

  function unique(a) {
    return a.filter(function(value, index, self) {
      return self.indexOf(value) === index;
    });
  }

  // gets widthpoint for first key (if exists)
  // if does not exist scanns the key list for previous key
  function getPointForKey(list, keyList) {
    for (var i = 0, maxi = keyList.length; i < maxi; i++) {
      if (+keyList[i] in list) {
        return list[keyList[i]];
      }
    }
  }

  function mergePointsWithParent(widths, parentWidths) {
    var elKeys = Object.keys(widths),
        parentKeys = Object.keys(parentWidths),
        keys = unique(elKeys.concat(parentKeys)),
        w, pw,
        newWidths = {};

    for (var k = 0, maxk = keys.length; k < maxk; k++) {
      w = getPointForKey(widths, keys.slice(0, k + 1).reverse());
      pw = getPointForKey(parentWidths, keys.slice(0, k + 1).reverse());

      if (isDefined(w) && isDefined(pw)) {
        newWidths[keys[k]] = Math.min(w, pw);
      } else if (isDefined(pw) || (keys[k] in parentWidths && !isDefined(w))) {
        newWidths[keys[k]] = pw;
      } else if (isDefined(w) && !(keys[k] in widths)) {
        newWidths[keys[k]] = w;
      } else {
        newWidths[keys[k]] = widths[keys[k]];
      }
    }

    return newWidths;
  }

  function getApplyingFontSize(list, targetKey) {
    var size,
        // Object keys are not quaranteed to be sorted and order kept
        keys = Object.keys(list).sort(function(a,b) {
          return parseFloat(a) - parseFloat(b);
        });

    for (var key in keys) {
      if (list.hasOwnProperty(keys[key])) {
        if (parseFloat(keys[key]) <= parseFloat(targetKey)) {
          size = list[keys[key]];
        } else {
          return size;
        }
      }
    }

    return size;
  }

  function resolveUnits(otree) {
    var baseFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize), // In pixels
        parentFontSize,
        tree = [],
        widthProps = ["width", "min", "max"],
        prop;

    // Clone tree
    for (var j = 0, maxj = otree.length; j < maxj; j++) {
      tree[j] = {};
      for (var okey in otree[j]) {
        if (otree[j].hasOwnProperty(okey)) {
          tree[j][okey] = Object.create(otree[j][okey]);
        }
      }
    }

    for (var i = 0, maxi = tree.length; i < maxi; i++) {
      for (var key in tree[i]) {
        if (tree[i].hasOwnProperty(key)) {

          // Populate and resolve font sizes first (needed for unit conversions in widths)
          if (isDefined(tree[i][key].fontSize)) {

            if (tree[i][key].fontSizeUnit === "em") {
              // resolve em unit to px
              parentFontSize = (i > 0) ? getApplyingFontSize(tree[i - 1], key) : undefined;

              if (parentFontSize) {
                // resolve using parent fontsize
                tree[i][key].fontSize = tree[i][key].fontSize * parentFontSize;
                tree[i][key].fontSizeUnit = "px";
                tree[i][key].fontSizeImportant = parentFontSize.fontSizeImportant;
              } else {
                // resolve using size from documentElement
                tree[i][key].fontSize = tree[i][key].fontSize * baseFontSize;
                tree[i][key].fontSizeUnit = "px";
                tree[i][key].fontSizeImportant = false;
              }
            }

          } else {

            if (i === 0) {
              // first level gets its properties from documentElement
              tree[i][key].fontSize = baseFontSize;
              tree[i][key].fontSizeUnit = "px";
              tree[i][key].fontSizeImportant = false;
            } else {
              // Get fontsize from parent node
              parentFontSize = getApplyingFontSize(tree[i - 1], key);

              if (parentFontSize) {
                tree[i][key].fontSize = parentFontSize.fontSize;
                tree[i][key].fontSizeUnit = "px";
                tree[i][key].fontSizeImportant = parentFontSize.fontSizeImportant;
              } else {
                tree[i][key].fontSize = baseFontSize;
                tree[i][key].fontSizeUnit = "px";
                tree[i][key].fontSizeImportant = false;
              }
            }
          }

          // convert width defining units
          for (var p = widthProps.length; p--;) {
            prop = widthProps[p];
            if (isDefined(tree[i][key][prop])) {
              if (tree[i][key][prop + "Unit"] === "em") {
                tree[i][key][prop] = tree[i][key][prop] * tree[i][key].fontSize;
                tree[i][key][prop + "Unit"] = "px";
              }
            }
          }

        }
      }
    }

    return tree;
  }

  function resolveTree(tree) {
    var pxTree = resolveUnits(tree),
        widthsResolvedTree = [],
        flatTree = {};

    // Resolve min/max
    for (var i = tree.length; i--;) {
      widthsResolvedTree[i] = resolveMinMax(pxTree[i]);
    }

    flatTree = widthsResolvedTree[0];

    // flatten with child layer overriding parent
    for (var j = 1, maxj = widthsResolvedTree.length; j < maxj; j++) {
      flatTree = mergePointsWithParent(widthsResolvedTree[j], widthsResolvedTree[j - 1]);
    }

    return flatTree || [];
  }

  function widthPoints(element) {
    var stylesTree = [],
        wPoints,
        widths,
        prevEl,
        el = element;

    while (el && el !== document) {
      wPoints = elementWidthPoints(el);
      if (isDefined(wPoints) && Object.keys(wPoints).length > 0) {
        stylesTree.unshift(wPoints);
      }
      el = el.parentNode;
    }

    widths = resolveTree(stylesTree);

    // currently we do not take mediaqueries defining by screen height into account. using just 0 instead
    return {0: widths};
  }

  window.widthPoints = widthPoints;
})();
