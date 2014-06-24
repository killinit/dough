describe('componentLoader', function() {

  'use strict';

  beforeEach(function(done) {
    var self = this;
    requirejs(['componentLoader'], function(componentLoader) {
      self.componentLoader = componentLoader;
      done();
    });
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

  describe('no DOM fragment supplied', function() {

    beforeEach(function(done) {
      this.$html = '';
      this.componentLoader.init(this.$html)
          .then(function() {
            done();
          });
    });

    it('should scan the whole document if not passed a DOM fragment', function() {
      expect(this.componentLoader.$container.selector).to.equal('body');
    });

  });

  describe('init receives summary of success / failure of init of components', function() {

    beforeEach(function(done) {
      var self = this;
      this.$html = $(window.__html__['test/fixtures/componentLoader.html']);
      // make one of the components fail to init by removing some required elements
      this.$html.find('[data-mas-component="TabSelector"]').last().empty();
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
        RangeInput.prototype.init = function() {
          throw 'Test error';
        };
        TabSelector.prototype.init = function(initialised) {
          this._initialisedSuccess(initialised);
        };
        self.componentLoader.init(self.$html)
            .then(function(results) {
              self.results = results;
              done();
            });
      });
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

});
