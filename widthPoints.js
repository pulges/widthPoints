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
    if ( stylesheet.disabled || !stylesheet.cssRules) return [];
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

    return (isDefined(w)) ? Object.create(w) : isDefined(intervals[0]) ? Object.create(intervals[0]) : undefined;
  }

  function setWidthInteval(intervals, width, start, end) {
    var baseWidth = getBaseWidths(intervals, end);

    if (!start) {
      start = 0;
    }

    // remove split conflicting entries and insert new
    for (var i in intervals) {
      if (intervals.hasOwnProperty(i) && parseFloat(i)) {
        if (parseFloat(i) >= start && (!end || parseFloat(i) <= end)) {
          isDefined(intervals[i].width) && (baseWidth.width = intervals[i].width);
          isDefined(intervals[i].min) && (baseWidth.min = intervals[i].min);
          isDefined(intervals[i].max) && (baseWidth.max = intervals[i].max);
          delete intervals[i];
        }
      }
    }

    intervals[start] = {};
    intervals[start].width = width && isDefined(width.width) ? width.width : baseWidth ? baseWidth.width : undefined;
    intervals[start].min = width && isDefined(width.min) ? width.min : baseWidth ? baseWidth.min : undefined;
    intervals[start].max = width && isDefined(width.max) ? width.max : baseWidth ? baseWidth.max : undefined;

    if (end && baseWidth) {
      intervals[end] = baseWidth;
    }
  }

  function resolveMinMax(intervals) {
    var o = {}, w;
    for(var i in intervals) {
      if (intervals.hasOwnProperty(i)) {
        w = intervals[i].width;

        if (typeof intervals[i].max !== 'undefined') {
          w = w ? Math.min(w, intervals[i].max) : intervals[i].max;
        }

        if (typeof intervals[i].min !== 'undefined') {
          w = w ? Math.max(w, intervals[i].min) : intervals[i].min;
        }

        o[i] = w;
      }
    }
    return o;
  }

  function widthPoints(element) {
    var rules = getElementStylesheet(element),
        intervals = {},
        winMinMatch, winMaxMatch, min, max,
        wMatch, maxwMatch, minwMatch, w, maxw, minw, width,
        widthIsMaxw = false;

    for (var i = 0, maxi = rules.length; i < maxi; i++) {
      if ((/width:\s?(\d+)px/).test(rules[i].cssText)) {

        wMatch = rules[i].cssText.match(/([^-]|\s|;|^)width:\s?(\d+)px/);
        w = wMatch && typeof wMatch[2] !== 'undefined' ? parseFloat(wMatch[2]) : undefined;
        maxwMatch = rules[i].cssText.match(/max-width:\s?(\d+)px/);
        maxw = maxwMatch && typeof maxwMatch[1] !== 'undefined' ? parseFloat(maxwMatch[1]) : undefined;
        minwMatch = rules[i].cssText.match(/min-width:\s?(\d+)px/);
        minw = minwMatch && typeof minwMatch[1] !== 'undefined' ? parseFloat(minwMatch[1]) : undefined;

        width = {
          min: minw,
          max: maxw,
          width: w
        };

        if (rules[i].parentRule && rules[i].parentRule.media && rules[i].parentRule.media[0] && (/(max\-width|min\-width)/).test(rules[i].parentRule.media[0])) {
          // Update intervals as mediaquery interval rule
          
          winMinMatch = rules[i].parentRule.media[0].match(/min\-width:\s?(\d+)px/);
          winMaxMatch = rules[i].parentRule.media[0].match(/max\-width:\s?(\d+)px/);

          min = winMinMatch && winMinMatch[1] ? parseFloat(winMinMatch[1]) : 0;
          max = winMaxMatch && winMaxMatch[1] ? parseFloat(winMaxMatch[1]) : null;

          setWidthInteval(intervals, width, min, max);
        } else {
          // Update intervals as base rule
          setWidthInteval(intervals, width, 0);
        }
      }
    }

    // currently we do not take mediaqueries with screen height into account
    return { 0: resolveMinMax(intervals) };
  }

  window.widthPoints = widthPoints;
})();
