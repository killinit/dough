/**
 * Bind form inputs to a simple data model held in memory (an object literal / hash of keys and values).
 * When the form submits, serialize the model and send to the server, then update it with the response.
 */
define(['jquery', 'DoughBaseComponent', 'dataBinding'], function($, DoughBaseComponent, dataBinding) {

  'use strict';

  var FormModel = function() {
    FormModel.baseConstructor.apply(this, arguments);
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
    this.model = {};
    this._setupDataBinding();
    this._bindEvents();
    this._initialisedSuccess(initialised);
  };

  FormModel.prototype._setupDataBinding = function() {
    this.view && this.view.unbind();
    this.$el.find('input').each(function() {
      $(this).attr('data-dough-bind-value', $(this).attr('name'));
    });
    this.view = dataBinding.bind(this.$el, this.model);
    // this will initially populate the model from values in the DOM
    this.view.publish();
  };

  /**
   * Hijack the form submit
   * @private
   */
  FormModel.prototype._bindEvents = function() {
    this.$el.on('submit', $.proxy(this._sendModelToServer, this));
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
        });
    e && e.preventDefault();
  };

  return FormModel;
});
