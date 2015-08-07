
QUnit.module( "Test element maximal width from simple css", {
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


QUnit.test("overWriting selectors", function(assert) {
  var style = ".wrap { width: 100px } .wrap { width: 400px }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 400, "got the width from css");
});

QUnit.test("max-width", function(assert) {
  var style = ".wrap { width: 100px } .wrap { width: 400px }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.equal(widths[0][0], 400, "got the width from css");
});
