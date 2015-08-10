
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
  },

  initWrappedElements: function() {
    TestingTools.initSingleElement.call(this);
    this.wrap.innerHTML = '<div class="innerWrap"><div class="testElement"></div></div>';
    this.innerWrap = this.wrap.querySelector('.innerWrap');
    this.testElement = this.wrap.querySelector('.testElement');
  }
};
