define([], function () {
  'use strict';


  /**
   * This is used as the base class for all modules.
   * All modules/components should extend this class.
   *
   * Includes:
   *  event binding/triggering
   *  logging
   *  i18n library
   */

  function DoughBaseComponent($el, config) {
    if (!$el || !$el.length) {
      throw "Element not supplied to DoughBaseComponent constructor";
    }
    this.config = config || {};
    this.componentName = this.config.componentName;
    this.setElement($el);
    /*
     Populate this array with the data attributes this module will use.
     Exclude 'data-dough-' prefix, as this is automatically added.

     For example: ['collapsible', 'only-first']
     */
    this.attrs = [];

    this._bindUiEvents(this.uiEvents || {});
    return this;
  }

  /**
   * Extend DoughBaseComponent class using the supplied constructor
   * @param {function} Subclass
   * @param {function} [Superclass] - if not supplied, defaults to DoughBaseComponent
   */
  DoughBaseComponent.extend = function (Subclass, Superclass) {
    var Super = Superclass || DoughBaseComponent;
    function TempConstructor() {
    }

    TempConstructor.prototype = Super.prototype;
    Subclass.prototype = new TempConstructor();
    Subclass.prototype.constructor = Subclass;
    Subclass.baseConstructor = Super;
    Subclass.superclass = Super.prototype;
  };

  var DoughBaseComponentProto = DoughBaseComponent.prototype;

  /**
   * Set the parent element for this context.
   * @param {[type]} $el [description]
   */
  DoughBaseComponentProto.setElement = function ($el) {
    this.$el = $el;
    return this;
  };

  /**
   * Fetch the parent element
   * @return {Array} jQuery object or empty array (for safe jQuery ops)
   */
  DoughBaseComponentProto.getElement = function () {
    return this.$el || [];
  };

  /**
   * Get attribute from data attributes on element.
   * @param  {[type]} attr [description]
   * @return {[type]}      [description]
   */
  DoughBaseComponentProto.attr = function (attr) {
    return this.getElement().attr('data-dough-' + attr);
  };

  /**
   * All DoughBaseComponents (if applicable) should have this method,
   * which will unbind all events it attached when initialising itself.
   *
   * After this has been run, you can safely run 'delete [[instance]]' to remove it from memory.
   *
   * @return {[type]}
   */
  DoughBaseComponentProto.destroy = function () {
    return this;
  };

  /**
   * Set callbacks, where `this.events` is a hash of
   *
   * {"event selector": "callback"}*
   *
   *     {
   *       'mousedown .title':  'edit',
   *       'click .button':     'save',
   *       'click .open':       function(e) { ... }
   *     }
   *
   * pairs. Callbacks will be bound to the view, with `this` set properly.
   * Uses event delegation for efficiency.
   * Omitting the selector binds the event to `this.el`.
   * This only works for delegate-able events: not `focus`, `blur`, and
   * not `change`, `submit`, and `reset` in Internet Explorer.
   *
   * Adapted from the equivalent function in BackboneJS - http://backbonejs.org/#View-delegateEvents
   *
   * @param events
   * @returns {DoughBaseComponent}
   */

  DoughBaseComponentProto._bindUiEvents = function (events) {
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;

    if (!events) return this;
    this._unbindUiEvents();
    for (var key in events) {
      var method = events[key];
      if (typeof method !== 'function') {
        method = this[events[key]];
      }
      if (!method) continue;

      var match = key.match(delegateEventSplitter);
      var eventName = match[1], selector = match[2];
      method = $.proxy(method, this);
      eventName += '.boundUiEvents';
      if (selector === '') {
        this.$el.on(eventName, method);
      } else {
        this.$el.on(eventName, selector, method);
      }
    }
    return this;
  };

  /**
   * Clears all callbacks previously bound to the component with `delegateEvents`.
   * @returns {DoughBaseComponent}
   */

  DoughBaseComponentProto._unbindUiEvents = function () {
    this.$el.off('.boundUiEvents');
    return this;
  };

  /**
   * Indicate that the component initialised successfully, passing its component name. The resolved
   * promise will be fed back to the component loader
   * @private
   */
  DoughBaseComponentProto._initialisedSuccess = function(initialised) {
    this.$el.attr('data-dough-initialised', 'yes');
    initialised && initialised.resolve(this.componentName);
  };

  /**
   * Indicate that the component failed to initialise, passing its component name. The rejected
   * promise will be fed back to the component loader
   * @private
   */
  DoughBaseComponentProto._initialisedFailure = function(initialised) {
    initialised && initialised.reject(this.componentName);
  };

  return DoughBaseComponent;

});
