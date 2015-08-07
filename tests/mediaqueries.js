QUnit.module( "Test mediaqueries creating width waypoints", {
  beforeEach: TestingTools.initSingleElement
});

QUnit.test( "max-width case", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (max-width: 100px) { .wrap { width: 100px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(Object.keys(widths).length, 2, "two waypoints defined");
  assert.equal(widths[0], 100, "first waypoint correct from mediaquery");
  assert.equal(widths[100], 200, "second waypoint (default value) correct starting from max width");
  
});

QUnit.test( "min-width case", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) { .wrap { width: 100px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(Object.keys(widths).length, 2, "two waypoints defined");
  assert.equal(widths[0], 200, "first waypoint correct (default value)");
  assert.equal(widths[100], 100, "second waypoint from mediaquery correct starting from max width");
  
});

QUnit.test( "min-width and max-width case", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 200px) { .wrap { width: 100px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(Object.keys(widths).length, 3, "three waypoints defined");
  assert.equal(widths[0], 200, "first waypoint correct from mediaquery");
  assert.equal(widths[100], 100, "second waypoint (default value) correct starting from max width");
});

QUnit.test( "multiple mediaqueries - not covering", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 200px) { .wrap { width: 100px; } } @media screen and (min-width: 1000px) and (max-width: 2000px) { .wrap { width: 1000px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(Object.keys(widths).length, 5, "three waypoints defined");
  assert.deepEqual(widths, {
    0: 200,
    100: 100,
    200: 200,
    1000: 1000,
    2000: 200
  }, "waypoints correct");
});

QUnit.test( "multiple mediaqueries - overlapping with both ends defined", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 300px) { .wrap { width: 100px; } } @media screen and (min-width: 200px) and (max-width: 1000px) { .wrap { width: 1000px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(Object.keys(widths).length, 4, "three waypoints defined");
  assert.deepEqual(widths, {
    0: 200,
    100: 100,
    200: 1000,
    1000: 200
  }, "waypoints correct");
});

QUnit.test( "multiple mediaqueries - overlapping with both ends defined (reversed)", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 300px) { .wrap { width: 100px; } } @media screen and (min-width: 50px) and (max-width: 200px) { .wrap { width: 1000px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(Object.keys(widths).length, 4, "three waypoints defined");
  assert.deepEqual(widths, {
    0: 200,
    50: 1000,
    200: 100,
    300: 200
  }, "waypoints correct");
});

QUnit.test( "multiple mediaqueries - overlapping with max-width defined query", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 1000px) { .wrap { width: 100px; } } @media screen and (max-width: 200px) { .wrap { width: 1000px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(Object.keys(widths).length, 3, "three waypoints defined");
  assert.deepEqual(widths, {
    0: 1000,
    200: 100,
    1000: 200
  }, "waypoints correct");
});

QUnit.test( "multiple mediaqueries - overlapping with min-width defined query", function(assert) {
  var style = ".wrap { width: 200px; } @media screen and (min-width: 100px) and (max-width: 1000px) { .wrap { width: 100px; } } @media screen and (min-width: 200px) { .wrap { width: 1000px; } }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(Object.keys(widths).length, 3, "three waypoints defined");
  assert.deepEqual(widths, {
    0: 200,
    100: 100,
    200: 1000
  }, "waypoints correct");
});