/* ===========================================================
 * jQuery-HSlider.js v1
 * ===========================================================
 * Copyright 2013 Hux.
 *
 * Create an photo-first, fullpage web slider
 * All animation is powered in CSS3
 * Only for modern broswer
 *
 * ========================================================== */

(function($){

	var defaults = {
		easing:"ease",
		animationTime:1300,
		pagination:true,
	};

	/*------------------------------------------------*/
	/*  Credit: Eike Send for the awesome swipe event */
	/*------------------------------------------------*/

	$.fn.swipeEvents = function() {
		return this.each(function() {

			var startX,
				startY,
				$this = $(this);

			$this.bind('touchstart', touchstart);

			function touchstart(event) {
				var touches = event.originalEvent.touches;
				if (touches && touches.length) {
					startX = touches[0].pageX;
					startY = touches[0].pageY;
					$this.bind('touchmove', touchmove);
				}
				//event.preventDefault();
			}

			function touchmove(event) {
				var touches = event.originalEvent.touches;
				if (touches && touches.length) {
					var deltaX = startX - touches[0].pageX;
					var deltaY = startY - touches[0].pageY;

					if (deltaX >= 50) {
						$this.trigger("swipeLeft");
						console.log('testleft');
					}
					if (deltaX <= -50) {
						$this.trigger("swipeRight");
						console.log('testright');
					}
					if (deltaY >= 50) {
						$this.trigger("swipeUp");
						console.log('testup');
					}
					if (deltaY <= -50) {
						$this.trigger("swipeDown");
						console.log('testdown');
					}
					if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
						$this.unbind('touchmove', touchmove);
					}
				}
				event.preventDefault();
			}

		});
	};

	/*   swipe event End  */
	/*------------------------------------------------*/

	$.fn.HSlider = function(options){
		var settings = $.extend({}, defaults, options),
			wrapper = $(this),
			sections = $("section"),
			total = sections.length,
			quiet = false,
			paginationList = "";

		$.fn.transformPage = function(settings,pos){
			$(this).css({
				"-webkit-transform": "translate3d(" + pos + "%, 0 ,0)",
				"-webkit-transition": "all " + settings.animationTime + "ms " + settings.easing,
				"-moz-transform": "translate3d(" + pos + "%, 0 ,0)",
				"-moz-transition": "all " + settings.animationTime + "ms " + settings.easing,
				"-ms-transform": "translate3d(" + pos + "%, 0 ,0)",
				"-ms-transition": "all " + settings.animationTime + "ms " + settings.easing,
				"transform": "translate3d(" + pos + "%, 0 ,0)",
				"transition": "all " + settings.animationTime + "ms " + settings.easing
			});
		}

		$.fn.slideLeft = function(){
			indexNow = $("section.active").data("index");
			// 2015 use hashchange
			location.hash = '#'+ (indexNow + 1);
			return;

			// 2013 old manual way
			if (indexNow<total) {
				current = $("section[data-index='" + indexNow + "']");
				next = $("section[data-index='" + (indexNow + 1) + "']");

				current.removeClass("active")
				next.addClass("active");

				//for pagination
				if(settings.pagination == true) {
					$(".pagination li a" + "[data-index='" + indexNow + "']").removeClass("active");
					$(".pagination li a" + "[data-index='" + (indexNow + 1) + "']").addClass("active");
				}

				pos = (indexNow * 100) * -1;
				$(this).transformPage(settings, pos);
			};
		}

		$.fn.slideRight = function(){
			indexNow = $("section.active").data("index");
			// 2015 use hashchange
			location.hash = '#'+ (indexNow - 1);
			return;

			// 2013 old manual way
			if (indexNow<=total && indexNow>1) {
				current = $("section[data-index='" + indexNow + "']");
				next = $("section[data-index='" + (indexNow - 1) + "']");

				current.removeClass("active")
				next.addClass("active");

				//for pagination
				if(settings.pagination == true) {
					$(".pagination li a" + "[data-index='" + indexNow + "']").removeClass("active");
					$(".pagination li a" + "[data-index='" + (indexNow - 1) + "']").addClass("active");
				}

				pos = ((next.data("index") - 1) * 100) * -1;
				$(this).transformPage(settings, pos);
			};
		}

		function _handleMouseScroll(event, delta){
			if (quiet == false) {
				if (delta == 0) return; 	// early return
				if (delta < 0) {
					wrapper.slideLeft()
				} else {
					wrapper.slideRight()
				};
				quiet = true;
				// deal with OSX inertia scroll
				setTimeout(function(){
					quiet = false;
				}, Number(settings.animationTime) + 100);	// make sure Number
			}
		}

		// 2015 add: seperate RENDER, support URL hash
		function _render(){
			var _hash = location.hash.split('#')[1];
			var _activeIndex = _hash ? _hash : 1;

			// reset current
			$("section.active").removeClass("active");
			$(".pagination li a" + ".active").removeClass("active");

			// activate new
			$("section[data-index=" + _activeIndex + "]").addClass("active");
			$(".pagination li a" + "[data-index=" + _activeIndex + "]").addClass("active");

			// calculate pos and transform
			var pos = ((_activeIndex - 1) * 100) * -1;
			wrapper.transformPage(settings, pos);
		}

		//init Style
		wrapper.addClass("HSlider").css({
			"position":"relative",
			width:"100%",
			height:"100%",
		});
		$.each(sections,function(i){
			$(this).css({
				position:"absolute",
				width:"100%",
				height:"100%",
				left:i*100 +"%"
			}).addClass("section").attr("data-index", i+1);
			$(this).find("img").css({
				minWidth: "100%",
				minHeight: "100%",
				position:"absolute",
				zIndex:1
			})
			$(this).find("article").css({
				position:"absolute",
				boxSizing:"border-box",
				width:"100%",
				bottom:0,
				zIndex:4
			})
			if(settings.pagination == true) {
				paginationList += "<li><a data-index='"+(i+1)+"' href='#" + (i+1) + "'></a></li>"
			}
		});

		//Create Pagination
		if(settings.pagination == true) {
			$("<ul class='pagination'>" + paginationList + "</ul>").prependTo("body");
			posTop = (wrapper.find(".HSlider").height() / 2) * -1;
			wrapper.find(".HSlider").css("margin-top", posTop);
		}
		if(settings.pagination == true)  {
			$(".pagination li a").click(function (){
				var page_index = $(this).data("index");

				//2015: hashchange will trigger transtion
				location.hash = '#' + page_index;
				return;

				//2013: old way; not use.
				if (!$(this).hasClass("active")) {
					current = $("section.active")
					next = $("section[data-index='" + (page_index) + "']");

					current.removeClass("active")
					next.addClass("active")

					$(".pagination li a" + ".active").removeClass("active");
					$(".pagination li a" + "[data-index='" + (page_index) + "']").addClass("active");


					pos = ((page_index - 1) * 100) * -1;
					wrapper.transformPage(settings, pos);
				}
			});
		}

		//init to slide
		_render();
		// hashchange trigger re-render
		$(window).on('hashchange', _render);

		//bind Mousewheel Scroll Event
		$(document).bind('mousewheel DOMMouseScroll', function(event) {
			event.preventDefault();
			var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
			_handleMouseScroll(event, delta);
		});

		//bind Touch Event
		wrapper.swipeEvents().bind("swipeLeft",function(){
			wrapper.slideLeft();
		}).bind("swipeRight",function(){
			wrapper.slideRight();
		});

		return false;
	}

})(window.jQuery);
