
var TestingTools = {
  initSingleElement: function() {
    this.stylesheet = document.getElementById('test-styles');
    this.fixture = document.getElementById("qunit-fixture");
    this.wrap = null;
    this.stylesheet.innerHTML = '';
    this.wrap = document.createElement('div');
    this.wrap.className = "wrap";
    this.wrap.setAttribute('id', 'wrap-id');
    this.fixture.appendChild(this.wrap);
  }
}
