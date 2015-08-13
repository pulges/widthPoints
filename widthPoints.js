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
  function assignWidths(newWidths, baseWidths) {
    var   widths = {};

    widths.width = newWidths && isDefined(newWidths.width) ? newWidths.width : baseWidths ? baseWidths.width : undefined;
    widths.min   = newWidths && isDefined(newWidths.min)   ? newWidths.min   : baseWidths ? baseWidths.min   : undefined;
    widths.max   = newWidths && isDefined(newWidths.max)   ? newWidths.max   : baseWidths ? baseWidths.max   : undefined;

    widths.widthImportant = newWidths && isDefined(newWidths.widthImportant) ? newWidths.widthImportant : baseWidths ? baseWidths.widthImportant : undefined;
    widths.maxImportant   = newWidths && isDefined(newWidths.maxImportant)   ? newWidths.maxImportant   : baseWidths ? baseWidths.maxImportant   : undefined;
    widths.minImportant   = newWidths && isDefined(newWidths.minImportant)   ? newWidths.minImportant   : baseWidths ? baseWidths.minImportant   : undefined;

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
          isDefined(intervals[i].width) && (baseWidths.width = intervals[i].width);
          isDefined(intervals[i].min) && (baseWidths.min = intervals[i].min);
          isDefined(intervals[i].max) && (baseWidths.max = intervals[i].max);
          delete intervals[i];
        }
      }
    }

    intervals[start] = assignWidths(width, baseWidths);

    if (end && baseWidths) {
      intervals[end] = baseWidths;
    }
  }

  // Goes through min max and width aprameters to return the actual width of element
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

  function getPropertiesFromStyleStr(styleStr) {
    var wMatch, maxwMatch, minwMatch,
        w, maxw, minw;

    wMatch = styleStr.match(/([^-]|\s|;|^)width:\s?(\d+)px(\s+(!\s?important))?/);
    w = wMatch && typeof wMatch[2] !== 'undefined' ? parseFloat(wMatch[2]) : undefined;
    maxwMatch = styleStr.match(/max-width:\s?(\d+)px(\s+(!\s?important))?/);
    maxw = maxwMatch && typeof maxwMatch[1] !== 'undefined' ? parseFloat(maxwMatch[1]) : undefined;
    minwMatch = styleStr.match(/min-width:\s?(\d+)px(\s+(!\s?important))?/);
    minw = minwMatch && typeof minwMatch[1] !== 'undefined' ? parseFloat(minwMatch[1]) : undefined;

    return {
      min: minw,
      minImportant: !!(minwMatch && isDefined(minwMatch[3]) && /^!\s?important$/.test(wMatch[3])),
      max: maxw,
      maxImportant: !!(maxwMatch && isDefined(maxwMatch[3]) && /^!\s?important$/.test(wMatch[3])),
      width: w,
      widthImportant: !!(wMatch && isDefined(wMatch[4]) && /^!\s?important$/.test(wMatch[4]))
    };
  }

  // Merges inline styles on found rules (inlines more important unless rule is !important)
  function mergeWithInline(intervals, inlineWidths) {
    if (inlineWidths) {
      for (var i in intervals) {
        if (intervals.hasOwnProperty(i)) {
          if (isDefined(inlineWidths.width) && (inlineWidths.widthImportant || !intervals[i].widthImportant)) {
            intervals[i].width = inlineWidths.width;
          }
          if (isDefined(inlineWidths.max) && (inlineWidths.maxImportant || !intervals[i].maxImportant)) {
            intervals[i].max = inlineWidths.max;
          }
          if (isDefined(inlineWidths.min) && (inlineWidths.minImportant || !intervals[i].minImportant)) {
            intervals[i].min = inlineWidths.min;
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
      if ((/width:\s?(\d+)px/).test(rules[i].cssText)) {

        widths = getPropertiesFromStyleStr(rules[i].cssText);

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

    return resolveMinMax(intervals);
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

  function widthPoints(element) {
    var widths,
        prevEl,
        el = element;

    while (el && el !== document) {
      if (isDefined(widths) && Object.keys(widths).length > 0) {
        widths = mergePointsWithParent(widths, elementWidthPoints(el));
      } else {
        widths = elementWidthPoints(el);
      }

       
      el = el.parentNode;
    }

    // currently we do not take mediaqueries with screen height into account. using just 0 instead
    return {0: widths};
  }

  window.widthPoints = widthPoints;
})();
