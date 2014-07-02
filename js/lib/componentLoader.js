/**
 * UI component loader. Scans the supplied DOM for 'data-dough-component' attributes and initialises
 * components based on those attribute values
 *
 * See test fixture for sample HTML - test/fixtures/componentLoader.html
 *
 * Components are created in 2 separate passes. The reason for this is so that all components can
 * have a chance to set up listeners to any other components they need. Once they are all created,
 * they are initialised (the 'init' method of each is called) in a second pass.
 */
define(['jquery', 'rsvp'], function($, RSVP) {

  'use strict';

  return {

    /**
     * Will store a hash. Each key will store a component name. Each value will store an array of
     * instances of that component type
     * @attribute
     * @type {object}
     */
    components: {},

    /**
     * Create components based on the supplied DOM fragment (or document if not supplied)
     * @param {jQuery} [$container]
     * @returns {object} - a promise that will resolve or reject depending on whether all modules
     * initialise successfully
     */
    init: function($container) {
      var $components,
          instantiatedList,
          initialisedList,
          self = this;

      // if no DOM fragment supplied, use the document
      this.$container = $container || $('body');
      $components = this.$container.find('[data-dough-component]').not('[data-initialised="yes"]');
      instantiatedList = this._createPromises($components);
      initialisedList = this._createPromises($components);
      if ($components.length) {
        this._instantiateComponents($components, instantiatedList.deferreds);
        // Wait until all components are instantiated before initialising them in a second pass
        RSVP.allSettled(instantiatedList.promises).then(function() {
          self._initialiseComponents(self.components, initialisedList.deferreds);
        });
      }
      return RSVP.allSettled(initialisedList.promises);
    },

    /**
     * Clear the list of components
     * @returns {jquery}
     */
    reset: function() {
      this.components = {};
      return this;
    },

    /**
     * Create a hash of deferreds and their associated promise properties (useful for passing to a
     * 'master' deferred for resolution)
     * @param {jQuery} $components
     * @returns {{deferreds: Array, promises: Array}}
     * @private
     */
    _createPromises: function($components) {
      var obj = {
        deferreds: [],
        promises: []
      },
      i,
      j;

      for (i = 0, j = $components.length; i < j; i++) {
        obj.deferreds.push(RSVP.defer());
        obj.promises.push(obj.deferreds[i].promise);
      }
      return obj;
    },

    /**
     * Instantiate all components
     * @param {jquery} $components
     * @param {array} instantiatedList - array of deferreds, one to be assigned to each new
     * component
     * @private
     */
    _instantiateComponents: function($components, instantiatedList) {
      var self = this;
      $components.each(function(idx) {
        var $el = $(this),
            componentName = $el.attr('data-dough-component');
        self._instantiateComponent(componentName, $el, instantiatedList[idx]);
      });
    },

    /**
     * Instantiate an individual component
     * @param componentName
     * @param $el
     * @param {object} instantiated - a deferred, to be resolved after each component is required /
     * instantiated, which may be async, hence the use of a deferred
     * @private
     */
    _instantiateComponent: function(componentName, $el, instantiated) {
      var self = this,
          config = this._parseConfig($el);

      require([componentName], function(Constr) {
        config.componentName = componentName;
        if (!self.components[componentName]) {
          self.components[componentName] = [];
        }
        self.components[componentName].push(new Constr($el, config));
        instantiated.resolve();
      });
    },

    /**
     * The second pass - all components have been instantiated, so now call init() on each. This
     * has given all components a chance to subscribe to events from other components, before they
     * are initialised. If one component errors, catch it so others to initialise
     * @param {object} components - a hash of component names and arrays of instances
     * @param {array} initialisedList - list of promises, one to pass to each component so it can
     * indicate when it has initialised (it might need to conduct async activity to do so, so it's
     * not enough to just set a flag after the constructor is called)
     * @private
     */
    _initialiseComponents: function(components, initialisedList) {
      var i = 0;

      $.each(components, function(componentName, list) {
        $.each(list, function(idx, instance) {
          if (instance.$el.attr('data-initialised') !== 'yes') {
            try {
              instance.init && instance.init(initialisedList[i]);
            } catch (err) {
              initialisedList[i].reject(err);
            }
            i++;
          }
        });
      });
    },

    /**
     * Extract any config from the DOM for a given component
     * @param {jQuery} $el - component container
     * @returns {object} - parsed JSON config or empty object
     * @private
     */
    _parseConfig: function($el) {
      var config = $el.attr('data-dough-config');
      try {
        config = JSON.parse(config);
      } catch (err) {
        config = {};
      }
      return config;
    }

  };

});
