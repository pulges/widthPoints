
QUnit.module( "Element maximal width", {
  beforeEach: TestingTools.initSingleElement
});

QUnit.test( "basic case", function(assert) {
  var style = ".wrap { width: 100px }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.ok(widths && widths[0] && widths[0][0] === 100, "got the width from css");
});

QUnit.test( "stacked selector", function(assert) {
  var style = "#wrap-id.wrap { width: 200px }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 200, "got the width from css");
});

QUnit.test( "tag selector", function(assert) {
  var style = "#qunit-fixture div { width: 300px }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 300, "got the width from css");
});


QUnit.test("over writing selectors", function(assert) {
  var style = ".wrap { width: 100px } .wrap { width: 400px }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 400, "got the width from css");
});

QUnit.test("element max-width", function(assert) {
  var style = ".wrap { max-width: 100px }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 100, "got the width from css");
});

QUnit.test("element max-width and width", function(assert) {
  var style = ".wrap { max-width: 100px ; width: 200px; }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 100, "got the width from css");
});

QUnit.test("element max-width and width on separate declarations", function(assert) {
  var style = ".wrap { max-width: 100px; } .wrap { width: 200px; }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 100, "got the width from css");
});

QUnit.test("element min-width and width", function(assert) {
  var style = ".wrap { min-width: 200px; width: 100px; }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 200, "got the width from css");
});

QUnit.test("element min-width and width on separate declarations", function(assert) {
  var style = ".wrap { min-width: 200px; } .wrap { width: 100px; }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 200, "got the width from css");
});

QUnit.test("element inline styles width", function(assert) {
  var style = ".wrap { width: 100px; }",
      widths;

  this.stylesheet.innerHTML = style;
  this.wrap.style.width = "200px";

  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 200, "got the width from css");
});

QUnit.test("width in element inline styles and important in styles", function(assert) {
  var style = ".wrap { width: 100px !important; }",
      widths;

  this.stylesheet.innerHTML = style;
  this.wrap.style.width = "200px";

  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 100, "got the width from css");
});

QUnit.test("element inline styles with important and width and important in styles", function(assert) {
  var style = ".wrap { width: 100px !important; }",
      widths;

  this.stylesheet.innerHTML = style;
  this.wrap.style.setProperty("width", "300px", "important");
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 300, "got the width from css");
});


QUnit.test( "Zero rules case", function(assert) {
  var style = "",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 0, "no elements is on waypoints");
});
