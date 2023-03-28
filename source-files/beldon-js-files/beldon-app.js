// ------------------------------------------------
// Project Name: Beldon - Coming Soon and Landing Page Template
// Project Description: Beldon - awesome coming soon template to kick-start your project
// Tags: mix_design, coming soon, under construction, template, landing page, portfolio, one page, responsive, html5, css3, creative, clean, agency, personal page
// Version: 1.0.2
// Build Date: November 2021
// Last Update: December 2022
// This product is available exclusively on Themeforest
// Author: mix_design
// Author URI: https://themeforest.net/user/mix_design
// File name: beldon-app.js
// ------------------------------------------------

// ------------------------------------------------
// Table of Contents
// ------------------------------------------------
//
//  1. SVG Fallback
//  2. Chrome Smooth Scroll
//  3. Images Moving Ban
//  4. Fullscreen Layout
//  5. Detecting Mobile/Descktop
//  6. Cursor
//  4. Scroll to id
//  5. Header Appearance Change on Scroll
//  6. Menu and Notify
//
// ------------------------------------------------
// Table of Contents End
// ------------------------------------------------

$(function() {

  // SVG Fallback
  if(!Modernizr.svg) {
    $("img[src*='svg']").attr("src", function() {
      return $(this).attr("src").replace(".svg", ".png");
    });
  };

  // Chrome Smooth Scroll
  try {
    $.browserSelector();
    if($("html").hasClass("chrome")) {
      $.smoothScroll();
    }
  } catch(err) {
  };

  // Images Moving Ban
  $("img, a").on("dragstart", function(event) { event.preventDefault(); });

  // Fullscreen Layout
  function fullscreenLayout() {
    $(".fullscreen").css({
        height: $(window).height()
    });
  };
  fullscreenLayout();
  $(window).resize(function(){
    fullscreenLayout();
  });

  // Detecting Mobile/Descktop
  var isMobile = false;
  if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    $('html').addClass('touch');
    isMobile = true;
  }
  else {
    $('html').addClass('no-touch');
    isMobile = false;
  }
  //IE, Edge
  var isIE = /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /MSIE 10/i.test(navigator.userAgent) || /Edge\/\d+/.test(navigator.userAgent);

  // Cursor
  function followCursor() {
    var cursor = $('.cursor');
    // follow effect
    function moveCursor(e) {
	    var t = e.clientX + "px",
          n = e.clientY + "px";
      var circleCursor = anime({
        targets: '.cursor',
        duration: 30,
        left: t,
        top: n,
        easing: 'linear'
      });
    }
    $(window).on('mousemove', moveCursor);
    // line link hover
    $('.link-s').on('mouseenter', function() {
      cursor.addClass('cursor-s');
    });
    $('.link-s').on('mouseleave', function() {
      cursor.removeClass('cursor-s');
    });
    // buttons & triggers hover
    $('.link-l').on('mouseenter', function() {
      cursor.addClass('cursor-l');
    });
    $('.link-l').on('mouseleave', function() {
      cursor.removeClass('cursor-l');
    });
  };
  // init
  followCursor();

  // Scroll to id
  var scrollDuration = 500;
  // Smooth Scrolling for Link Type Buttons in Active Section
  // Smooth Scroll To Section
  var scrollToPreview = $('.intro__scroll');

  scrollToPreview.on('click', function(event) {
    event.preventDefault();
    smoothScroll($(this.hash));
  });

  function smoothScroll(target) {
    $('.active-section').animate({
      'scrollTop': target.offset().top
    }, 500);
  }

  // Header Appearance Change on Scroll
  var header         = $('#header'),
      aboutSection   = $('#about'),
      worksSection   = $('#works'),
      contactSection = $('#contact'),
      mainSection    = $('#main');

  mainSection.on("scroll", function() {
    header.addClass('smaller');
    if ($('.main__intro').offset().top < -50) {
      header.addClass('smaller');
    } else {
      header.removeClass('smaller');
    }
  });

  aboutSection.on("scroll", function() {
    header.addClass('smaller');
    if ($('#about .inner__container').offset().top < -50) {
      header.addClass('smaller');
    } else {
      header.removeClass('smaller');
    }
  });

  worksSection.on("scroll", function() {
    header.addClass('smaller');
    if ($('#works .inner__container').offset().top < -50) {
      header.addClass('smaller');
    } else {
      header.removeClass('smaller');
    }
  });

  contactSection.on("scroll", function() {
    header.addClass('smaller');
    if ($('#contact .inner__container').offset().top < -50) {
      header.addClass('smaller');
    } else {
      header.removeClass('smaller');
    }
  });

  // Menu and Notify
  var menuTrigger    = $('#menu-trigger'),
      menu           = $('#nav'),
      header         = $('#header'),
      aboutTrigger   = $('#about-trigger'),
      worksTrigger   = $('#works-trigger'),
      contactTrigger = $('#contact-trigger'),
      mainTrigger    = $('#main-trigger'),
      notify         = $('#notify'),
      notifyTrigger  = $('#notify-trigger'),
      notifyClose    = $('#notify-close');

      notifyTrigger.on('click', function(event) {
        event.preventDefault();
        mainSection.addClass('notify-is-visible');
        header.addClass('notify-is-visible');
        setTimeout(function(){
          notify.addClass('animate-in');
        }, 600);
        setTimeout(function(){
          notifyClose.addClass('is-scaled-up');
        }, 1200);
      });

      notifyClose.on('click', function(event){
        event.preventDefault();
        notify.addClass('animate-out');
        setTimeout(function(){
          mainSection.removeClass('notify-is-visible');
          header.removeClass('notify-is-visible');
        }, 600);
        setTimeout(function(){
          notifyClose.removeClass('is-scaled-up');
          notify.removeClass('animate-in animate-out');
        }, 1200);
      });

      menuTrigger.on('click', function(event){
        event.preventDefault();

        if (menu.hasClass('animate-in')) {
          menuTrigger.removeClass('menu-opened');
          menu.addClass('animate-out');

          setTimeout(function(){
            $('.active-section').addClass('animate-in');
          }, 1000);

          setTimeout(function(){
            if ($('.inner').hasClass('active-section')) {
              header.addClass('inner-is-visible');
            }
          }, 600);

          setTimeout(function(){
            header.removeClass('menu-is-visible');
          }, 1200);

          setTimeout(function(){
            menu.removeClass('animate-in animate-out');
          }, 1600);

        } else {
          menuTrigger.addClass('menu-opened');
          menu.addClass('animate-in');
          header.removeClass('inner-is-visible').addClass('menu-is-visible');

          setTimeout(function(){
            $('.active-section').removeClass('animate-in');
            $('.active-section').animate({ scrollTop: 0 , }, 100);
          }, 600);
        }

      });

      aboutTrigger.on('click', function(event){
        event.preventDefault();

        $('.active-section').removeClass('active-section');
        $('.active-trigger').removeClass('active-trigger');
        aboutSection.addClass('active-section');
        aboutTrigger.addClass('active-trigger');
        menu.addClass('animate-out');
        menuTrigger.removeClass('menu-opened');

        setTimeout(function(){
          header.removeClass('menu-is-visible').addClass('inner-is-visible');
          $('.active-section').addClass('animate-in');
        }, 600);

        setTimeout(function(){
          menu.removeClass('animate-in animate-out');
        }, 1600);

      });

      worksTrigger.on('click', function(event){
        event.preventDefault();

        $('.active-section').removeClass('active-section');
        worksSection.addClass('active-section');
        $('.active-trigger').removeClass('active-trigger');
        worksTrigger.addClass('active-trigger');
        menu.addClass('animate-out');
        menuTrigger.removeClass('menu-opened');

        setTimeout(function(){
          header.removeClass('menu-is-visible').addClass('inner-is-visible');
          $('.active-section').addClass('animate-in');
        }, 600);

        setTimeout(function(){
          menu.removeClass('animate-in animate-out');
        }, 1600);

      });

      contactTrigger.on('click', function(event){
        event.preventDefault();

        $('.active-section').removeClass('active-section');
        contactSection.addClass('active-section');
        $('.active-trigger').removeClass('active-trigger');
        contactTrigger.addClass('active-trigger');
        menu.addClass('animate-out');
        menuTrigger.removeClass('menu-opened');

        setTimeout(function(){
          header.removeClass('menu-is-visible').addClass('inner-is-visible');
          $('.active-section').addClass('animate-in');
        }, 600);

        setTimeout(function(){
          menu.removeClass('animate-in animate-out');
        }, 1600);

      });

      mainTrigger.on('click', function(event){
        event.preventDefault();

        menuTrigger.removeClass('menu-opened');
        menu.addClass('animate-out');
        $('.active-section').removeClass('active-section');
        mainSection.addClass('active-section');
        $('.active-trigger').removeClass('active-trigger');
        mainTrigger.addClass('active-trigger');

        setTimeout(function(){
          $('.active-section').addClass('animate-in');
        }, 1000);

        setTimeout(function(){
          header.removeClass('menu-is-visible');
        }, 1200);

        setTimeout(function(){
          menu.removeClass('animate-in animate-out');
        }, 1600);

      });

});
