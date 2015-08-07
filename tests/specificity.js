// Specificity tests failing currently

QUnit.module( "Test if css specificity is taken into account", {
  beforeEach: TestingTools.initSingleElement
});

QUnit.test( "class vs id", function(assert) {
  var style = "#wrap-id.wrap { width: 200px } .wrap { width: 100px }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(widths[0], 200, "got the width from css");
  assert.equal(Object.keys(widths).length, 1, "only one element is on waypoints");
});

QUnit.test( "tag vs class", function(assert) {
  var style = "#qunit-fixture .wrap { width: 200px } #qunit-fixture div { width: 100px } ",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(widths[0], 200, "got the width from css");
  assert.equal(Object.keys(widths).length, 1, "only one element is on waypoints");
});

QUnit.test( "!important", function(assert) {
  var style = ".wrap { width: 200px !important;} .wrap { width: 100px } ",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.wrap);

  assert.ok(widths, "widths object is defined");
  assert.equal(widths[0], 200, "got the width from css");
  assert.equal(Object.keys(widths).length, 1, "only one element is on waypoints");
});

