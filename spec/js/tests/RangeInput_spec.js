describe('Range input', function() {

  'use strict';

  before(function(done) {
    var self = this;
    window.Modernizr = {
      inputtypes: {
        range: true
      }
    };
    requirejs(
        ['jquery', 'RangeInput', 'featureDetect', 'eventsWithPromises'],
        function($, RangeInput, featureDetect, eventsWithPromises) {
          self.featureDetect = featureDetect;
          self.RangeInput = RangeInput;
          self.eventsWithPromises = eventsWithPromises;
          done();
        }, done);
  });

  beforeEach(function() {
    this.$html = $(window.__html__['spec/js/fixtures/RangeInput.html']);
  });

  afterEach(function() {
    this.$html.remove();
  });

  describe('Range inputs supported', function() {

    beforeEach(function() {
      this.featureDetect.inputtypes.range = true;
      this.rangeInput = new this.RangeInput(this.$html, {
        prefixUnit: '£',
        subscribeToData: {
          dataPointName: 'salary',
          attributes: ['min', 'max']
        }
      });
      this.$inputText = this.$html.find('[data-dough-range-input]');
      this.$inputSlider = this.$html.find('.range-input__slider');
      this.$labelMin = this.$html.find('.range-input__min');
      this.$labelMax = this.$html.find('.range-input__max');
    });

    it('creates a copy of the input if the range slider type is supported', function() {
      expect(this.$html.find('input').length).to.equal(2);
    });

    it('places the slider inside the specified container, if provided', function() {
      expect(this.$html.find('[data-dough-range-input-slider] input.range-input__slider')).to.be.of.length(1);
    });

    it('keeps the slider in sync if the text input changes', function() {
      this.$inputText.val('2000').trigger('change');
      expect(this.$inputSlider).to.have.value('2000');
      this.$inputText.val('50000').trigger('change');
      expect(this.$inputSlider).to.have.value('5000'); // because range input has a max of 5000
    });

    it('keeps the text input in sync if the slider changes', function() {
      this.$inputSlider.val('2000').trigger('change');
      expect(this.$inputText).to.have.value('2000');
    });

    it('publishes an event when the value changes', function() {
      var spy = sinon.spy();
      this.eventsWithPromises.subscribe('rangeInput:change', spy);
      this.$inputText.val('3000').trigger('change');
      sinon.assert.calledWith(spy, {
        emitter: this.$inputText,
        value: '3000'
      });
    });

    it('can update its minimum value', function() {
      this.eventsWithPromises.publish('dataPointChange:salary', {
        attributes: {
          min: 100
        }
      });
      expect(this.$inputText).to.have.attr('min', '100');
      expect(this.$inputSlider).to.have.attr('min', '100');
      expect(this.$labelMin).to.have.text('£100');
    });

    it('can update its maximum value', function() {
      this.eventsWithPromises.publish('dataPointChange:salary', {
        attributes: {
          max: 30000
        }
      });
      expect(this.$inputText).to.have.attr('max', '30000');
      expect(this.$inputSlider).to.have.attr('max', '30000');
      expect(this.$labelMax).to.have.text('£30000');
    });

    it('creates a min label for the slider', function() {
      expect(this.$labelMin).to.have.text('£1000');
    });

    it('creates a max label for the slider', function() {
      expect(this.$labelMax).to.have.text('£5000');
    });

  });

  describe('Range inputs supported but don\'t keep inputs in sync', function() {

    beforeEach(function() {
      this.featureDetect.inputtypes.range = true;
      this.rangeInput = new this.RangeInput(this.$html, {
        keepSynced: false
      });
      this.$inputText = this.$html.find('[data-dough-range-input]');
      this.$inputSlider = this.$html.find('.range-input__slider');
    });

    it('creates a copy of the input if the range slider type is supported', function() {
      expect(this.$html.find('input').length).to.equal(2);
    });
  });

  describe('Range inputs not supported', function() {

    beforeEach(function() {
      this.featureDetect.inputtypes.range = false;
      this.rangeInput = new this.RangeInput(this.$html);
      this.$inputText = this.$html.find('[data-dough-range-input]');
      this.$inputSlider = this.$html.find('.range-input__slider');
    });

    it('keeps the text input in sync if the slider changes', function() {
      this.$inputSlider.val('2000').trigger('change');
      expect(this.$inputText).to.have.value('1500');
    });
  });

});

