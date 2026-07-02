window.onload = function(){
document.getElementById('wl-heaven-wrap').getElementsByTagName('img')[0].alt = 'Wellness Heaven';			
};

(function() {

	// Localize jQuery variable
	var jQuery;

	/******** Load jQuery if not present *********/
	if (window.jQuery === undefined || window.jQuery.fn.jquery !== '3.2.1') {
		var script_tag = document.createElement('script');
		script_tag.setAttribute("type","text/javascript");
		script_tag.setAttribute("src",
		"https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js");
		if (script_tag.readyState) {
			script_tag.onreadystatechange = function () { // For old versions of IE
				if (this.readyState == 'complete' || this.readyState == 'loaded') {
					scriptLoadHandler();
				}
			};
		} else {
			script_tag.onload = scriptLoadHandler;
		}

	// Try to find the head, otherwise default to the documentElement
	(document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);

	} else {
		// The jQuery version on the window is the one we want to use
		jQuery = window.jQuery;
		main();
	}

	/******** Called once jQuery has loaded ******/
	function scriptLoadHandler() {
		// Restore $ and window.jQuery to their previous values and store the
		// new jQuery in our local jQuery variable
		jQuery = window.jQuery.noConflict(true);
		// Call our main function
		main(); 
	}


	function main() { 
		jQuery(document).ready(function($) { 

			//Load CSS
			var widgetFolderUrl = 'https://www.wellness-heaven.de/widget/';
			var css_link = $("<link>", { 
				rel: "stylesheet", 
				type: "text/css", 
				href: widgetFolderUrl+"css/style.css" 
			});
			css_link.appendTo('head');          

			//Load html
			var 
				hotelid = wlQuery.hotelid,
				size = wlQuery.size,
				jsonp_url = widgetFolderUrl+"?callback=widget&ID="+hotelid+'&size='+size;


			$.getJSON(jsonp_url, function(data) {
				jQuery('#wellness-heaven-wid .wl-heaven-body').html(data.html);
				

				if(size == "large") {
					$('#wl-heaven-wrap').removeAttr('class').addClass('wl-large');
				}

				if(size == "medium") {
					$('#wl-heaven-wrap').removeAttr('class').addClass('wl-medium');
				}
				if(size == "small") {
					$('#wl-heaven-wrap').removeAttr('class').addClass('wl-small');
				}

				$("#wellness-heaven-wid .wl-link, #wellness-heaven-wid .wl-link2 ").hover(
				  function() {
				    $('#wl-heaven-wrap .wl-heaven-cont').addClass("wl-hover");
				  }, function() {
				    $('#wl-heaven-wrap .wl-heaven-cont').removeClass("wl-hover");
				  }
				);
				
				setTimeout(function(){ 
				
				var term = ["Wellnesshotel", "Wellness Hotel", "Wellnesshotels", "Wellnessurlaub", "Wellness"];
				var nn2 = term.length - 1;
				var rr2 = Math.floor(Math.random() * nn2);
				
				jQuery('#wellness-heaven-wid .wl-link').first().attr('href', 'https://www.wellness-heaven.de' + data.href);
				jQuery('#wellness-heaven-wid .wl-link img').first().attr('alt', term[rr2] + ' ' + data.bundesland);
				
				jQuery('#wellness-heaven-wid .wl-heaven-body').html(data.html);
				
				}, 3000);

			});
		});
	}

})();