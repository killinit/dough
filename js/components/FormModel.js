/**
 * Bind form inputs to a simple data model held in memory (an object literal / hash of keys and values).
 * When the form submits, serialize the model and send to the server, then update it with the response.
 */
define(['jquery', 'DoughBaseComponent', 'dataBinding', 'eventsWithPromises'], function($, DoughBaseComponent, dataBinding, eventsWithPromises) {

  'use strict';

  var FormModel = function() {
    FormModel.baseConstructor.apply(this, arguments);
    this.model = {};
  };

  /**
   * Inherit from base module, for shared methods and interface
   */
  DoughBaseComponent.extend(FormModel);

  /**
   * Set up and populate the model from the form inputs
   * @param {Promise} initialised
   */
  FormModel.prototype.init = function(initialised) {
    var self = this;
    this._setupDataBinding();
    eventsWithPromises.subscribe('formModelChanged', function(data) {
      $.extend(self.model, data.model);
    });
    this._initialisedSuccess(initialised);
  };

  FormModel.prototype._setupDataBinding = function() {
    this.view && this.view.unbind();
    this.$el.find('input').not('[data-dough-bind-value]').each(function() {
      $(this).attr('data-dough-bind-value', $(this).attr('name'));
    });
    this.view = dataBinding.bind(this.$el, this.model);
    // this will initially populate the model from values in the DOM
    this.view.publish();
    this._bindEvents();
  };

  /**
   * Hijack the form submit
   * @private
   */
  FormModel.prototype._bindEvents = function() {
    var self = this;

    this.$el.find('[data-dough-event-submit]').addBack().each(function() {
      var evt = $(this).attr('data-dough-event-submit');
      $(this).on(evt, $.proxy(self._sendModelToServer, self));
    });
  };

  FormModel.prototype._sendModelToServer = function(e) {
    var self = this;
    $.ajax({
      url: self.$el.attr('action'),
      dataType: 'json',
      data: self.$el.serialize()
    })
        .done(function(data) {
          $.extend(self.model, data);
          self._setupDataBinding();
          eventsWithPromises.publish('formModelChanged', {
            emitter: self,
            model: self.model
          });
        });
    e && e.preventDefault();
  };

  return FormModel;
});
