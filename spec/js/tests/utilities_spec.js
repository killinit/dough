describe('utilities', function() {

  'use strict';

  before(function(done) {
    var self = this;
    requirejs(
        ['utilities'],
        function(utilities) {
          self.mod = utilities;
          done();
        }, done);
  });

  describe('currencyToInteger', function() {

    it('should remove any £ and , values', function() {
      expect(this.mod.currencyToInteger('£2,374,000')).to.equal(2374000);
    });

    it('should remove any decimal place', function() {
      expect(this.mod.currencyToInteger('£53,000.34')).to.equal(53000);
    });

  });

  describe('numberToCurrency', function() {

    it('should round to the nearest integer', function() {
      expect(this.mod.numberToCurrency('237400.12')).to.equal('£237,400');
      expect(this.mod.numberToCurrency('58.90')).to.equal('£59');
    });

  });

  describe('convertCamelCaseToDashed', function() {
    it('should convert a camel cased string into a dash-separated string', function() {
      expect(this.mod.convertCamelCaseToDashed('FooBar')).to.equal('foo-bar');
      expect(this.mod.convertCamelCaseToDashed('FOOBar')).to.equal('foo-bar');
      expect(this.mod.convertCamelCaseToDashed('FooBarBaz')).to.equal('foo-bar-baz');
    });
  });

});
