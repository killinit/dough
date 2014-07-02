describe('componentLoader', function() {

  'use strict';

  before(function(done) {
    var self = this;
    requirejs(['componentLoader'], function(componentLoader) {
      self.componentLoader = componentLoader;
      done();
    });
  });

  afterEach(function(){
    this.componentLoader.reset();
  });

  describe('init method', function() {

    beforeEach(function(done) {
      this.$html = $(window.__html__['test/fixtures/componentLoader.html']);
      this.componentLoader.init(this.$html)
          .then(function() {
            done();
          });
    });

    it('should initialize components specified in the DOM', function() {
      var self = this;
      expect(this.componentLoader.components.TabSelector.length).to.equal(2);
      expect(this.componentLoader.components.RangeInput.length).to.equal(1);
      $.each(this.componentLoader.components, function(componentName, list) {
        expect(self.$html.find(list[0].$el).length).to.equal(1);
      });
    });

    it('should return a promise', function() {
      expect(typeof this.componentLoader.init().then).to.equal('function');
    });

    it('should supply any config to component', function() {
      expect(this.componentLoader.components.TabSelector[0].config.model.key).to.equal('value');
    });

  });

  describe('init receives summary of success / failure of init of components', function() {

    beforeEach(function(done) {
      var self = this;
      this.$html = $(window.__html__['test/fixtures/componentLoader.html']);
      // make one of the components fail to init by removing some required elements
      this.$html.find('[data-dough-component="TabSelector"]').last().empty();
      this.componentLoader.init(this.$html)
          .then(function(results) {
            self.results = results;
            done();
          });
    });

    it('should receive array of init results with the failed component indicating its state', function() {
      expect(this.results.constructor).to.equal(Array);
      var failed = $.map(this.results, function(o) {
        return (o.state === 'rejected') ? o : null;
      });
      expect(failed[0].reason).to.equal('TabSelector');
    });

  });

  describe('errors during initialisation are trapped', function() {

    beforeEach(function(done) {
      var self = this;
      this.$html = $(window.__html__['test/fixtures/componentLoader.html']);
      requirejs(['RangeInput', 'TabSelector'], function(RangeInput, TabSelector) {
        self.RangeInputStub = sinon.stub(RangeInput.prototype, 'init', function() {
          throw 'Test error';
        });
        self.TabSelectorStub = sinon.stub(TabSelector.prototype, 'init', function(initialised) {
          this._initialisedSuccess(initialised);
        });
        self.componentLoader.init(self.$html)
            .then(function(results) {
              self.results = results;
              done();
            });
      });
    });

    afterEach(function() {
      this.RangeInputStub.restore();
      this.TabSelectorStub.restore();
    });

    it('should allow other components to initialise even if one throws an error during init', function() {
      var failed,
          succeeded;

      failed = $.map(this.results, function(o) {
        return (o.state === 'rejected') ? o : null;
      });
      succeeded = $.map(this.results, function(o) {
        return (o.state === 'fulfilled') ? o : null;
      });
      expect(failed.length).to.equal(1);
      expect(succeeded.length).to.equal(2);
    });

  });

  describe('initialising multiple times', function () {

    beforeEach(function(done) {
      this.$html = $(window.__html__['test/fixtures/componentLoader.html']);
      this.componentLoader.init(this.$html)
          .then(function() {
            done();
          });
    });

    it('should only initialise each component once', function(done){
      var self = this,
          spy;

      this.$html.append($(window.__html__['test/fixtures/componentLoader.html']));
      requirejs(['RangeInput'], function(RangeInput) {
        spy = sinon.spy(RangeInput.prototype, 'init');
        self.componentLoader.init(self.$html)
            .then(function() {
              // only the newly added RangeInput should have been initialised, not the existing one
              expect(spy.callCount).to.equal(1);
              RangeInput.prototype.init.restore();
              done();
            });
      });
    });

  });

});
