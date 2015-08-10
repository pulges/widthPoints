QUnit.module( "Wrapped element", {
  beforeEach: TestingTools.initWrappedElements
});

QUnit.test( "Outer element has width", function(assert) {
  var style = ".wrap { width: 100px; }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.testElement);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.ok(widths && widths[0] && widths[0][0] === 100, "got the width from css");
});

QUnit.test( "Element has max-width and outer element defines width", function(assert) {
  var style = ".wrap { width: 200px; } .testElement { max-width: 300px; }",
      widths;

  this.stylesheet.innerHTML = style;
  widths = widthPoints(this.testElement);

  assert.ok(widths && widths[0], "widths object is defined");
  assert.equal(Object.keys(widths[0]).length, 1, "only one element is on waypoints");
  assert.ok(widths && widths[0] && widths[0][0] === 200, "got the width from css");
});