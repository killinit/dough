describe('Tab selector', function() {

  'use strict';

  var activeClass = 'is-active',
      trigger = '[data-dough-tabselector-trigger]',
      active = trigger + '.' + activeClass + ' button',
      triggers = trigger + ' button',
      target = '[data-dough-tabselector-target].' + activeClass + ' .tab-selector__target-heading';

  beforeEach(function(done) {
    var self = this;
    requirejs(
        ['jquery', 'TabSelector', 'eventsWithPromises'],
        function($, TabSelector, eventsWithPromises) {
          self.$html = $(window.__html__['spec/js/fixtures/TabSelector.html']).appendTo('body');
          self.$menu = self.$html.find('[data-dough-tabselector-triggers]');
          self.tabSelector = new TabSelector(self.$html);
          self.tabSelector.init();
          self.$triggers = self.$menu.find(triggers);
          self.eventsWithPromises = eventsWithPromises;
          done();
        }, done);
  });

  function isOpen($menu) {
    return $menu.hasClass(activeClass);
  }

  function activeTrigger($menu) {
    return $menu.find(active);
  }

  function activeTarget($root) {
    return $root.find(target);
  }

  it('selects the first item in the list', function() {
    expect(this.$menu.find(active).text()).to.equal('Show panel 1 selected');
  });

  it('converts all anchor links to buttons', function() {
    expect(this.$html.find(triggers).length).to.equal(6);
  });

  it('replaces the currently selected item', function() {
    this.$triggers.last().click();
    this.$triggers.eq(1).click();
    expect(activeTrigger(this.$menu)).to.have.text('Show panel 2 selected');
    expect(this.$html.find(active).length).to.equal(2);
  });


  it('toggles the menu when the selected item is clicked', function() {
    activeTrigger(this.$menu).click();
    expect(isOpen(this.$menu)).to.equal(true);
    activeTrigger(this.$menu).click();
    expect(isOpen(this.$menu)).to.equal(false);
  });

  it('closes the menu when an item on it is clicked', function() {
    activeTrigger(this.$menu).click();
    this.$triggers.first().click();
    expect(isOpen(this.$menu)).to.equal(false);
  });

  it('shows the associated target panel when a trigger is clicked', function() {
    this.$triggers.last().click();
    expect(activeTarget(this.$html)).to.have.text('Panel 3');
    this.$triggers.first().click();
    expect(activeTarget(this.$html)).to.have.text('Panel 1');
  });

  it('updates other copies of the clicked trigger', function() {
    var $trigger = this.$html.find('.tab-selector__target [data-dough-tabselector-trigger="2"]');
    $trigger.find('button').click();
    expect(this.$html.find('[data-dough-tabselector-trigger="2"].is-active button[aria-selected="true"]').length).to.equal(2);
  });

  it('doesn\'t open the menu if a trigger outside the menu is clicked', function() {
    this.$html.find('.tab-selector__target button:eq(2)').click();
    expect(isOpen(this.$menu)).to.equal(false);
  });

  it('closes the menu if the viewport is resized to small', function() {
    this.$triggers.last().click();
    this.eventsWithPromises.publish('mediaquery:resize', {
      newSize: 'mq-s'
    });
    expect(isOpen(this.$menu)).to.equal(false);
  });

});
