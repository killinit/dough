/**
 * Clone a range input / slider from an existing text / number input, when the range type is supported by the browser
 * @param  {jQuery} $                  [description]
 * @param  {object} DoughBaseComponent [description]
 * @param  {object} featureDetect      [description]
 * @param  {object} eventsWithPromises [description]
 * @return {object}                    [description]
 */
define(['jquery', 'DoughBaseComponent', 'featureDetect', 'eventsWithPromises'],
    function($, DoughBaseComponent, featureDetect, eventsWithPromises) {
      'use strict';

      var defaultConfig = {
            keepSynced: true
          },
          RangeInput;

      /**
       * Call base constructor
       * @constructor
       */
      RangeInput = function($el, config) {
        RangeInput.baseConstructor.call(this, $el, config, defaultConfig);

        if (featureDetect.inputtypes.range) {
          this._createSlider();
          this._createMinMaxLabels();
          this._setupSyncInputs();
        }
        this._subscribeHubEvents();
      };

      DoughBaseComponent.extend(RangeInput);

      /**
       * Init - detect range type support and clone input / label
       * @param {boolean} initialised
       */
      RangeInput.prototype.init = function(initialised) {
        this._initialisedSuccess(initialised);
        return this;
      };

      /**
       * Make a copy of the text input so it can be changed into a slider
       * @private
       */
      RangeInput.prototype._createSlider = function() {
        this.$textInput = this.$el.find('[data-dough-range-input]');
        this.$rangeInputContainer = this.$el.find('[data-dough-range-input-slider]');
        if (!this.$rangeInputContainer.length) {
          this.$rangeInputContainer = $('<div data-dough-range-input-slider />').appendTo(this.$el);
        }
        this.$rangeInput = this.$textInput
            .clone()
            .removeClass('input--label')
            .addClass('range-input__slider')
            .attr({
              'id': this.$textInput.attr('id') + '_range',
              'type': 'range',
              'aria-role': 'slider'
            })
            .removeAttr('name data-dough-range-input')
            .on('input change', function() { // recapture focus on slider for iOS w/ Voiceover
              $(this).focus();
            })
            .appendTo(this.$rangeInputContainer);

        return this;
      };

      /**
       * Create min and max labels for the slider
       * @private
       */
      RangeInput.prototype._createMinMaxLabels = function() {
        var id = this.$rangeInput.attr('id'),
            min = this.$rangeInput.attr('min'),
            max = this.$rangeInput.attr('max'),
            unit = this.config.prefixUnit || '';

        this.$rangeInputContainer.append('<label class="range-input__min" data-dough-range-input-min for="' +
            id + '">' + unit + min + '</label>');

        this.$rangeInputContainer.append('<label class="range-input__max" data-dough-range-input-max for="' +
            id + '">' + unit + max + '</label>');

        return this;
      };

      /**
       * Keep the text and slider inputs in sync, if specified by config
       * @private
       */
      RangeInput.prototype._setupSyncInputs = function() {
        var _this = this;
        if (this.config.keepSynced === true) {
          this.$textInput.on('change keyup', function() {
            var val = _this.$textInput.val();
            _this.$rangeInput.val(val);
            eventsWithPromises.publish('rangeInput:change', {
              emitter: _this.$textInput,
              value: val
            });
          });
          this.$rangeInput.on('change input', function() {
            _this.$textInput.val(_this.$rangeInput.val());
          });
        }
        return this;
      };

      /**
       * Subscribe to event hub
       * @private
       */
      RangeInput.prototype._subscribeHubEvents = function() {
        var dataPoint,
            _this = this,
            unit = this.config.prefixUnit || '';

        if (this.config.subscribeToData) {
          dataPoint = this.config.subscribeToData.dataPointName;
          dataPoint && eventsWithPromises.subscribe('dataPointChange:' + dataPoint, function(data) {
            $.each(data.attributes, function(key, val) {
              _this.$textInput.attr(key, val);
              _this.$rangeInput.attr(key, val);
              _this.$rangeInputContainer.find('[data-dough-range-input-' + key + ']').text(unit + val);
            });
          });
        }
        return this;
      };

      return RangeInput;

    });
