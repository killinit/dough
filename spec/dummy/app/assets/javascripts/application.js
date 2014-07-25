// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery/dist/jquery
//= require_tree .
//= require_self
$(document).ready(function(){
  $('html').addClass('js');

  $('.styleguide-nav-container').prepend('<button class="styleguide-nav__toggle">Menu</button>');

  $('.styleguide-nav__toggle').on('click', function() {
    $('.styleguide-nav').slideToggle();
  });

  $('.has-sub-menu').on('click', function(e) {
    $('.styleguide-nav__submenu', this).slideToggle();
    e.preventDefault();
  });

  $('.has-sub-menu li a').on('click', function(e) {
    e.stopPropagation();
  });
});
