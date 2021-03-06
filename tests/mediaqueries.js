QUnit.module( "Mediaqueries creating width waypoints", {
  beforeEach: TestingTools.initSingleElement
});

QUnit.test( "window max-width case", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (max-width: 100px) { .wrap { width: 100px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 2, "only one element is on waypoints");
  assert.equal(widths[0][0], 100, "first waypoint correct from mediaquery");
  assert.equal(widths[0][100], 200, "second waypoint (default value) correct starting from max width");
  
});

QUnit.test( "window min-width case", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) { .wrap { width: 100px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 2, "only one element is on waypoints");
  assert.equal(widths[0][0], 200, "first waypoint correct (default value)");
  assert.equal(widths[0][100], 100, "second waypoint from mediaquery correct starting from max width");
  
});

QUnit.test( "window min-width and max-width case", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 200px) { .wrap { width: 100px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 3, "only one element is on waypoints");
  assert.equal(widths[0][0], 200, "first waypoint correct from mediaquery");
  assert.equal(widths[0][100], 100, "second waypoint (default value) correct starting from max width");
});

QUnit.test( "multiple mediaqueries - not covering", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 200px) { .wrap { width: 100px; } } @media screen and (min-width: 1000px) and (max-width: 2000px) { .wrap { width: 1000px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 5, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 200,
      100: 100,
      200: 200,
      1000: 1000,
      2000: 200
    }
  }, "waypoints correct");
});

QUnit.test( "multiple mediaqueries - overlapping with both ends defined", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 300px) { .wrap { width: 100px; } } @media screen and (min-width: 200px) and (max-width: 1000px) { .wrap { width: 1000px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 4, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 200,
      100: 100,
      200: 1000,
      1000: 200
    }
  }, "waypoints correct");
});

QUnit.test( "multiple mediaqueries - overlapping with both ends defined (reversed)", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 300px) { .wrap { width: 100px; } } @media screen and (min-width: 50px) and (max-width: 200px) { .wrap { width: 1000px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 4, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 200,
      50: 1000,
      200: 100,
      300: 200
    }
  }, "waypoints correct");
});

QUnit.test( "multiple mediaqueries - overlapping with max-width defined query", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 1000px) { .wrap { width: 100px; } } @media screen and (max-width: 200px) { .wrap { width: 1000px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 3, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 1000,
      200: 100,
      1000: 200
    }
  }, "waypoints correct");
});

QUnit.test( "multiple mediaqueries - overlapping with min-width defined query", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 1000px) { .wrap { width: 100px; } } @media screen and (min-width: 200px) { .wrap { width: 1000px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 3, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 200,
      100: 100,
      200: 1000
    }
  }, "waypoints correct");
});

QUnit.test( "element max-width in base css", function(assert) {
  var style = ".wrap { max-width: 200px; } @media screen and (min-width: 100px) and (max-width: 1000px) { .wrap { width: 300px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 3, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 200,
      100: 200,
      1000: 200
    }
  }, "waypoints correct");
});

QUnit.test( "element max-width in mediaquery", function(assert) {
  var style = ".wrap { width: 300px; } @media screen and (min-width: 100px) and (max-width: 1000px) { .wrap { max-width: 200px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 3, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 300,
      100: 200,
      1000: 300
    }
  }, "waypoints correct");
});

QUnit.test( "element max-width in multiple overlapping mediaquerys (last hanging edge)", function(assert) {
  var style = ".wrap { width: 300px; } @media screen and (min-width: 100px) and (max-width: 300px) { .wrap { max-width: 200px; } } @media screen and (min-width: 200px) and (max-width: 400px) { .wrap { max-width: 100px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 4, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 300,
      100: 200,
      200: 100,
      400: 300
    }
  }, "waypoints correct");
});

QUnit.test( "element max-width in multiple overlapping mediaquerys (contained)", function(assert) {
  var style = ".wrap { width: 300px; } @media screen and (min-width: 100px) and (max-width: 300px) { .wrap { max-width: 200px; } } @media screen and (min-width: 200px) and (max-width: 250px) { .wrap { width: 50px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 5, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 300,
      100: 200,
      200: 50,
      250: 200,
      300: 300
    }
  }, "waypoints correct");
});

QUnit.test( "element max-width in multiple overlapping mediaquerys (first hanging edge)", function(assert) {
  var style = ".wrap { width: 300px; } @media screen and (min-width: 100px) and (max-width: 300px) { .wrap { max-width: 200px; } } @media screen and (min-width: 50px) and (max-width: 200px) { .wrap { width: 50px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 4, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 300,
      50: 50,
      200: 200,
      300: 300
    }
  }, "waypoints correct");
});

QUnit.test( "important in mediaquery", function(assert) {
  var style = "@media screen and (min-width: 100px) and (max-width: 300px) { .wrap { width: 100px !important; } }",
      widths;

  this.stylesheet.innerHTML = style;
  this.wrap.style.setProperty("width", "300px");
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 3, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      0: 300,
      100: 100,
      300: 300
    }
  }, "waypoints correct");
});

QUnit.test( "mediaquery with undefined size outside", function(assert) {
  var style = "@media screen and (min-width: 100px) and (max-width: 300px) { .wrap { width: 100px !important; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 2, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      100: 100,
      300: undefined
    }
  }, "waypoints correct");
});


QUnit.test( "mediaquery wrapping with undefined size outside (contained)", function(assert) {
  var style = "@media screen and (min-width: 100px) and (max-width: 300px) { .wrap { width: 100px !important; } } @media screen and (min-width: 200px) and (max-width: 250px) { .wrap { width: 50px !important; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 4, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      100: 100,
      200: 50,
      250: 100,
      300: undefined
    }
  }, "waypoints correct");
});

QUnit.test( "mediaquery wrapping with undefined size outside (last edge hanging)", function(assert) {
  var style = "@media screen and (min-width: 100px) and (max-width: 300px) { .wrap { width: 100px !important; } } @media screen and (min-width: 200px) and (max-width: 450px) { .wrap { width: 50px !important; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 3, "only one element is on waypoints");
  assert.deepEqual(widths, {
    0: {
      100: 100,
      200: 50,
      450: undefined
    }
  }, "waypoints correct");
});
