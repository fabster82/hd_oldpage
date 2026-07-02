/**
 * Screen Reader main controller class
 * 
 * @package SCREENREADER::plugins::system::screenreader
 * @subpackage libraries
 * @subpackage controller
 * @author Joomla! Extensions Store
 * @copyright (C) 2015 - Joomla! Extensions Store
 * @license GNU/GPLv2 http://www.gnu.org/licenses/gpl-2.0.html  
 */
//'use strict';
(function($) {
	var MainController = function(options) {
		/**
		 * Plugin options
		 * 
		 * @access private
		 * @var Object
		 */
		var screenReaderOptions = {};
		
		/**
		 * Storage used by the plugin, session or local
		 * 
		 * @access private
		 * @var Object
		 */
		var screenReaderStorage = {};
		
		/**
		 * TTS instance
		 * 
		 * @access private
		 * @var Object
		 */
		var frTTSEngineInstance = {};
		
		/**
		 * Font size default as starting point
		 * 
		 * @access private
		 * @var Int
		 */
		var fontSizeDefault = 80;
		
		/**
		 * Font size currently set
		 * 
		 * @access private
		 * @var Int
		 */
		var fontSizeCurrent = 80;
		
		/**
		 * Spacing size currently set
		 * 
		 * @access private
		 * @var Int
		 */
		var spacingSizeCurrent = 0;
		
		/**
		 * Page zoom currently set
		 * 
		 * @access private
		 * @var Int
		 */
		var zoomSizeCurrent = 100;
		
		/**
		 * Line height currently set
		 * 
		 * @access private
		 * @var Int
		 */
		var lineHeightCurrent = 0;
		
		/**
		 * Set a variable for the current state of high contrast
		 * 
		 * @access private
		 * @var Int
		 */
		var highContrast = 0;
		
		/**
		 * Set a variable for the current state of alternate contrast
		 * 
		 * @access private
		 * @var Int
		 */
		var highContrastAlternate = 0;
		
		/**
		 * Set the target element for the filter transform
		 * 
		 * @access private
		 * @var Int
		 */
		var targetFilterElement = $('body');
		
		/**
		 * Set a variable for the current state of dyslexic font
		 * 
		 * @access private
		 * @var Int
		 */
		var dyslexicFont = 0;
		
		/**
		 * Set a variable for the current state of gray hues
		 * 
		 * @access private
		 * @var Int
		 */
		var grayHues = 0;
		
		/**
		 * Set a variable for the current state of big cursor
		 * 
		 * @access private
		 * @var Int
		 */
		var bigCursor = 0;
		
		/**
		 * Set a variable for the current state of read guides
		 * 
		 * @access private
		 * @var Int
		 */
		var readingGuides = 0;
		
		/**
		 * Set a variable to store the original HTML code to restore
		 * 
		 * @access private
		 * @var String
		 */
		var originalHtml = '';
		
		/**
		 * Set a variable for the current state of read mode
		 * 
		 * @access private
		 * @var String
		 */
		var readabilityMode = 0;
		
		/**
		 * Set a variable for the current state of hide images
		 * 
		 * @access private
		 * @var String
		 */
		var hideImages = 0;
		
		/**
		 * Set a variable for the current state of hide images
		 * 
		 * @access private
		 * @var String
		 */
		var hideAlsoVideosIFrames = 0;
		
		/**
		 * Set a variable for the current state of custom background color
		 * 
		 * @access private
		 * @var String
		 */
		var customBackgroundColor;
		
		/**
		 * Set a variable for the current state of custom text color
		 * 
		 * @access private
		 * @var String
		 */
		var customTextColor;
		
		/**
		 * Set a variable to retrieve the base body font family
		 * 
		 * @access private
		 * @var Int
		 */
		var originalBodyFontFamily = $('body').css('font-family');
		
		/**
		 * Keep track of the original HTML element styles if any
		 * 
		 * @accee private
		 * @var String
		 */
		var originalHTMLStyles = null;
		
		// Apply stylesheets programmaticallyfunction rtrim(str, ch)
		var rtrim = function(str, ch) {
		    for (i = str.length - 1; i >= 0; i--) {
		        if (ch != str.charAt(i)) {
		            str = str.substring(0, i + 1);
		            break;
		        }
		    } 
		    return str;
		};
		
		/**
		 * Manage the appliance of the font resizing for headers element with an increment to preserve proportions
		 * 
		 * @access private
		 * @return Void
		 */
		var fontResizeHeaders = function() {
			// Filter header elements h1, h2, h3, h4
    		$(screenReaderOptions.fontsizeSelector).filter(function(index){
    			var elementNodeName = this.nodeName.toLowerCase();
    			var enlargedElement = false;
    			var enlargementValue = 0;
    			var headersReduction = 1;
    			switch (elementNodeName) {
    				case 'h1':
    					enlargementValue = 100;
    					enlargedElement = true;
    					break;
    				
    				case 'h2':
    					enlargementValue = 80;
    					headersReduction = 0.8;
    					enlargedElement = true;
	    				break;
	    				
    				case 'h3':
    					enlargementValue = 40;
    					headersReduction = 0.6;
    					enlargedElement = true;
	    				break;
	    				
    				case 'h4':
    					enlargementValue = 20;
    					headersReduction = 0.4;
    					enlargedElement = true;
	    				break;
    			}
    			// Found a header element to enlarge?
    			if(enlargedElement) {
	    			// Append to the current inline style of the element
	    			var currentInlineStyles = $(this).attr('style') || '';
	    			$(this).attr('style', currentInlineStyles + ';font-size:' + (parseInt(fontSizeCurrent) + (screenReaderOptions.fontSizeHeadersIncrement * headersReduction) + enlargementValue) + '%');
    			}
    		}); 
		};
		
		/**
		 * Manage the appliance of the alternate high contrast mode
		 * 
		 * @access private
		 * @param Object jqEvent
		 * @return Void
		 */
		var applyAlternateHighContrast = function(jqEvent){
			// Get alternate ig contrast value
			highContrastAlternate = parseInt(screenReaderStorage.getItem('scr_highcontrast_alternate')) || 0;
			
			if(jqEvent) {
				$('#fr_screenreader_highcontrast,#fr_screenreader_highcontrast2,#fr_screenreader_highcontrast3').removeClass('active');
			}
			
			// Appliance function
			var applianceFunction = function() {
				// Always reset previous default states
				targetFilterElement.removeClass('scr_highcontrast');
				highContrast = 0;
				screenReaderStorage.setItem('scr_highcontrast', highContrast);
				
				// Get original styles
				if(originalHTMLStyles === null) {
					originalHTMLStyles = targetFilterElement.attr('style') || '';
				}
				
				// Get a hue rotate value if any
				var hueRotate = '';
				if($(this).data('rotate')) {
					hueRotate = ' hue-rotate(' + parseInt($(this).data('rotate')) + 'deg)';
				}
				
				// Get a brightness value if any
				var brightness = '';
				if($(this).data('brightness')) {
					brightness = ' brightness(' + parseInt($(this).data('brightness')) + ')';
				}
				
				targetFilterElement.attr('style', rtrim(originalHTMLStyles, ';') + ';filter: invert(100%)' + hueRotate + brightness);
			}
			
			if(!highContrastAlternate) {
				applianceFunction.bind(this)();
				highContrastAlternate = $(this).data('alternate');
				
				if(jqEvent) {
					$(jqEvent.target).addClass('active');
				}
			} else if(highContrastAlternate && typeof(jqEvent) !== 'undefined'){
				// Is the same alternate high contrast or the other one?
				var currentClickedHighContrastAlternate = $(this).data('alternate');
				if(currentClickedHighContrastAlternate == highContrastAlternate) {
					// Disable it, exit from state
					// Recover original stylesheets
					targetFilterElement.attr('style', originalHTMLStyles);
					highContrastAlternate = 0;
				} else {
					highContrastAlternate = currentClickedHighContrastAlternate;
					applianceFunction.bind(this)();
					
					if(jqEvent) {
						$(jqEvent.target).addClass('active');
					}
				}
			} else if(highContrastAlternate && typeof(jqEvent) === 'undefined') {
				applianceFunction.bind(this)();
			}
			
	    	screenReaderStorage.setItem('scr_highcontrast_alternate', highContrastAlternate);
		};
		
		/**
		 * Build Screen Reader interface
		 * 
		 * @access private
		 * @param String hexnum
		 * @return String
		 */
		var applyColorsInversion = function(hexnum, isForeGround) {

			hexnum = hexnum.toUpperCase();
			var splitnum = hexnum.split("");
			var resultnum = "";
			var simplenum = "FEDCBA9876".split("");
			var complexnum = new Array();
			complexnum.A = "5";
			complexnum.B = "4";
			complexnum.C = "3";
			complexnum.D = "2";
			complexnum.E = "1";
			complexnum.F = "0";

			for (i = 0; i < 6; i++) {
				if (!isNaN(splitnum[i])) {
					resultnum += simplenum[splitnum[i]];
				} else if (complexnum[splitnum[i]]) {
					resultnum += complexnum[splitnum[i]];
				} else {
					return false;
				}
			}
			
			if(isForeGround && screenReaderOptions.ieHighContrast) {
				var originalIntColor = parseInt(hexnum, 16);
				var newIntColor = parseInt(resultnum, 16);
				if(newIntColor < originalIntColor)
				return hexnum;
			}

			return resultnum;

		};
		
		/**
		 * Convert rgb color to hex
		 * 
		 * @access private
		 * @param String
		 *            $rgbcolor
		 * @return String
		 */
		var convertRGBDecimalToHex = function(rgb) {
		    var regex = /rgba? *\( *([0-9]{1,3}) *, *([0-9]{1,3}) *, *([0-9]{1,3})(, *[0-9]{1,3}[.0-9]*)? *\)/;
		    var values = regex.exec(rgb);
		    if(!values) {
		        return 'FFFFFF'; // fall back to white   
		    }
		    var r = Math.round(parseFloat(values[1]));
		    var g = Math.round(parseFloat(values[2]));
		    var b = Math.round(parseFloat(values[3]));
		    var hexColor = (r + 0x10000).toString(16).substring(3).toUpperCase() 
				         + (g + 0x10000).toString(16).substring(3).toUpperCase()
				         + (b + 0x10000).toString(16).substring(3).toUpperCase();
		    
		    return hexColor;
		};
		
		/**
		 * Detect if browser has native support for CSS3 filters
		 * 
		 * @access private
		 * @param String selector
		 * @return String
		 */
		var css3FilterFeatureDetect = function(enableWebkit) {
			var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
		    var el = document.createElement('div');
		    el.style.cssText = prefixes.join('filter' + ':invert(100%); ');
		    return !!el.style.length && ((document.documentMode === undefined || document.documentMode > 9));
		};
		
		/**
		 * Start the legacy IE color inversion
		 * 
		 * @access private
		 * @param String selector
		 * @return String
		 */
		var startLegacyHighcontrast = function(selector) {
			var collectionOfElements = $(selector);
			
			$.fn.skipElement = function(style) {
			    var original = this.css(style);
			    this.css(style, 'inherit');
			    var inherited = this.css(style);
			    if (original != inherited && convertRGBDecimalToHex(inherited) != '000000') {
			    	this.css(style, inherited);
			    	return true;
			    } else {
			    	this.css(style, original);
			    	return false;
			    }
			}
			
			$(selector).each(function(index, HTMLElement){
				// Skip untraslated elements
				if($.inArray(HTMLElement.nodeName.toLowerCase(), ['script', 'embed', 'object']) == -1) {
					// Advanced mode for !important inline styling without the skipElemen algo
					if(screenReaderOptions.ieHighContrastAdvanced) {
						// Get rgb original color
						var backgroundColor = $(HTMLElement).css('background-color');
						var foregroundColor = $(HTMLElement).css('color');
						
						if(backgroundColor && foregroundColor) {
							// Invert to hex colors
							var invertedBackgroundColor = applyColorsInversion(convertRGBDecimalToHex(backgroundColor));
							var invertedForegroundColor = applyColorsInversion(convertRGBDecimalToHex(foregroundColor), true);
							
							// Now apply calculated inverted colors to the target element
							var currentStyle = $(HTMLElement).attr('style') || '';
							var newStyle = currentStyle + ' background-color:#' + invertedBackgroundColor + ' !important; color:#' + invertedForegroundColor + ' !important';
							$(HTMLElement).attr('style', newStyle);
						}
					} else {
						if(!$(HTMLElement).skipElement('background-color')) {
							// Get rgb original color
							var backgroundColor = $(HTMLElement).css('background-color');
							var foregroundColor = $(HTMLElement).css('color');
							
							if(backgroundColor && foregroundColor) {
								// Invert to hex colors
								var invertedBackgroundColor = applyColorsInversion(convertRGBDecimalToHex(backgroundColor));
								var invertedForegroundColor = applyColorsInversion(convertRGBDecimalToHex(foregroundColor), true);
								
								// Now apply calculated inverted colors to the target element
								$(HTMLElement).css('background-color', '#' + invertedBackgroundColor);
								$(HTMLElement).css('color', '#' + invertedForegroundColor);
							}
						}
					}
				}
			});
		};
		
		/**
		 * Manage the appliance of the alternate high contrast mode
		 * 
		 * @access private
		 * @param Object jqEvent
		 * @return Void
		 */
		var skipToContents = function(jqEvent){
			var targetElement = $(screenReaderOptions.skipToContentsSelector);
			if(targetElement.length) {
				$('html, body').animate({
					scrollTop: targetElement.offset().top
				}, 500);
			}
		};
		
		/**
		 * Build Screen Reader interface
		 * 
		 * @access public
		 * @return Void
		 */
		this.buildInterface = function() {
			// Inject del container
			var mainContainer =  $('<div/>').attr('id', 'accessibility-links')
											.addClass(screenReaderOptions.position + ' ' + screenReaderOptions.scrolling + ' ' +  screenReaderOptions.templateOrientation);

			// Switch the target append mode
			if(screenReaderOptions.targetAppendMode == 'bottom') {
				mainContainer.appendTo(screenReaderOptions.targetAppendto);
			} else if(screenReaderOptions.targetAppendMode == 'top') {
				mainContainer.prependTo(screenReaderOptions.targetAppendto);
			}
			
			// Init dark mode
			if(screenReaderOptions.enableDarkMode && !!parseInt(screenReaderStorage.getItem('scr_toolbar_darkmode'))) {
				$('#accessibility-links').addClass('scr-toolbar-darkmode');
			}
			
			if(screenReaderOptions.template == 'accessible.css') {
				// Inject della extra top toolbar per accessible template di chiusura e informazioni
				var toolbarDiv = $('<div/>').attr('id', 'toolbar_plugin')
										 	.html('<span class="scaccessibletoolbar-text">' + (screenReaderOptions.labeltext || fr_screenreader) + '</span>')
										 	.addClass('scaccessibletoolbar');
				if(screenReaderOptions.screenreaderIcon == 'wheelchair') {
					toolbarDiv.addClass('scr_wheelchair');
				}
				mainContainer.append(toolbarDiv);
				
				// Inject del toolbar closer
				var toolbarDivCloser = $('<span/>').attr('id', 'toolbar_closer')
						   						   .html('&#x274c;')
						   						   .attr('data-title', fr_close_toolbar)
						   						   .attr('aria-label', fr_close_toolbar)
						   						   .attr('role', 'button')
						   						   .addClass('scaccessibletoolbarcloser');
				$('#toolbar_plugin').append(toolbarDivCloser);
			}
											
			// Inject del left container per il testo
			var textDiv = $('<div/>').attr('id', 'text_plugin')
									 .attr('title', ' - ' + (screenReaderOptions.labeltext || fr_screenreader) + ' - ')
					   				 .addClass('scbasebin screenreader text');
			if(!screenReaderOptions.showlabel) {
				textDiv.addClass('scr_nolabel');
			}
			if(screenReaderOptions.screenreaderIcon == 'wheelchair') {
				textDiv.addClass('scr_wheelchair');
			}
			if(screenReaderOptions.screenreaderIcon == 'custom') {
				textDiv.addClass('scr_customicon');
			}
			mainContainer.append(textDiv);
			
			// Inject del middle container per il volume controls
			if(screenReaderOptions.screenreader) {
				var volumeDiv = $('<div/>').attr('id', 'volume_plugin')
										   .addClass('scbasebin');
				mainContainer.append(volumeDiv);
			}
			
			// Inject del right container per lo switch speaker
			var speakerDiv = $('<div/>').attr('id', 'speaker_plugin')
										.addClass('scbasebin speaker');
			mainContainer.append(speakerDiv);
			
			// Inject del clearer
			var clearerDiv = $('<div/>').css('clear', 'both').attr('id', 'scr_clearer');
			mainContainer.append(clearerDiv);
			
			// Label
			if(screenReaderOptions.showlabel) {
				var labelScreenReader = $('<span/>').addClass('fr_label startapp')
													 .text(screenReaderOptions.labeltext || fr_screenreader);
				textDiv.append(labelScreenReader);
			}
			
			if(screenReaderOptions.screenreader) {
				// Inject del play
				var playButton = $('<button/>').attr({	'id':'fr_screenreader_play',
														'title': ' - ' + fr_screenreader_play + ' - ',
														'aria-label': ' - ' + fr_screenreader_play + ' - ',
														'role' : 'button',
														'accesskey':screenReaderOptions.accesskey_play})
											   .addClass('pinnable')
											   .text(fr_screenreader_play);
				speakerDiv.append(playButton);
				
				// Inject del pause
				var pauseButton = $('<button/>').attr({	'id':'fr_screenreader_pause',
														'title': ' - ' + fr_screenreader_pause + ' - ',
														'aria-label': ' - ' + fr_screenreader_pause + ' - ',
														'role' : 'button',
														'accesskey':screenReaderOptions.accesskey_pause})
												.addClass('pinnable')
												.text(fr_screenreader_pause);
				speakerDiv.append(pauseButton);
				
				// Inject dello stop
				var stopButton = $('<button/>').attr({	'id':'fr_screenreader_stop',
														'title': ' - ' + fr_screenreader_stop + ' - ',
														'aria-label': ' - ' + fr_screenreader_stop + ' - ',
														'role' : 'button',
														'accesskey':screenReaderOptions.accesskey_stop})
											   .addClass('pinnable')
											   .text(fr_screenreader_stop);
				speakerDiv.append(stopButton);
			}
			
			// Rebuild the section if the accessible template is active
			if(screenReaderOptions.template == 'accessible.css') {
				var sectionAudioContainer = $('<div/>').attr({	'id':'sc-section-audio' })
													   .addClass('sc-section');
				
				sectionAudioContainer.append('<div class="sc-section-title" aria-label="' + fr_text_reader + '">' + fr_text_reader + '</div>');
				speakerDiv.append(sectionAudioContainer);
				var audioSectionButtons = $('#fr_screenreader_play, #fr_screenreader_pause, #fr_screenreader_stop').clone(true, true).end().remove();
				sectionAudioContainer.append(audioSectionButtons);
				
				var audioSectionVolumeControls = $('#volume_plugin').clone(true, true).end().remove();
				sectionAudioContainer.append(audioSectionVolumeControls);
				
				if(screenReaderOptions.enableDarkMode) {
    				// Inject del dark mode
    				var toolbarDivDarkMode = $('<span/>').attr('id', 'toolbar_darkmode')
        						   						 .html('<svg class="scr-darkmode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.56 122.88"><defs><style>.cls-1{fill-rule:evenodd;}</style></defs><title>night</title><path class="cls-1" d="M121.85,87.3A64.31,64.31,0,1,1,36.88.4c2.94-1.37,5.92.91,4.47,4.47a56.29,56.29,0,0,0,75.75,77.4l.49-.27a3.41,3.41,0,0,1,4.61,4.61l-.35.69ZM92.46,74.67H92A16.11,16.11,0,0,0,76.2,58.93v-.52a15.08,15.08,0,0,0,11-4.72,15.19,15.19,0,0,0,4.72-11h.51a15.12,15.12,0,0,0,4.72,11,15.12,15.12,0,0,0,11,4.72v.51A16.13,16.13,0,0,0,92.46,74.67Zm10.09-46.59h-.27a7.94,7.94,0,0,0-2.49-5.81A7.94,7.94,0,0,0,94,19.78v-.27A7.94,7.94,0,0,0,99.79,17a8,8,0,0,0,2.49-5.8h.27A8,8,0,0,0,105,17a8,8,0,0,0,5.81,2.49v.27A8,8,0,0,0,105,22.27a7.94,7.94,0,0,0-2.49,5.81Zm-41.5,8h-.41a12.06,12.06,0,0,0-3.78-8.82A12.06,12.06,0,0,0,48,23.5v-.41a12.07,12.07,0,0,0,8.82-3.78,12.09,12.09,0,0,0,3.78-8.82h.41a12.08,12.08,0,0,0,3.77,8.82,12.09,12.09,0,0,0,8.83,3.78v.41a12.09,12.09,0,0,0-8.83,3.78,12.08,12.08,0,0,0-3.77,8.82Z"/></svg>')
        						   						 .attr('data-title', fr_dark_mode)
        						   						 .attr('aria-label', fr_dark_mode)
        						   						 .attr('role', 'button')
        						   						 .addClass('scaccessibletoolbarcloser');
    				$('#sc-section-audio').append(toolbarDivDarkMode);
    				
    				$('#toolbar_darkmode').on('click', function(jqEvent){
    					var darkModeState = 0;
    					var accessibilityLinksToolbar = $('#accessibility-links');
    					accessibilityLinksToolbar.toggleClass('scr-toolbar-darkmode');
    					if(accessibilityLinksToolbar.hasClass('scr-toolbar-darkmode')) {
    						darkModeState = 1;
    					}
    					screenReaderStorage.setItem('scr_toolbar_darkmode', darkModeState);
    				});
				}
				if(screenReaderOptions.enableAccessibilityStatement) {
					// Inject del dark mode
    				var toolbarDivAccessibilityStatement = $('<a/>').attr('id', 'toolbar_accessibility_statement')
        						   						 			.text(screenReaderOptions.enableAccessibilityStatementText)
    						   						 				.attr('href', screenReaderOptions.enableAccessibilityStatementLink)
    						   						 				.attr('download', screenReaderOptions.enableAccessibilityStatementLink.substring(screenReaderOptions.enableAccessibilityStatementLink.lastIndexOf('/') + 1))
    						   						 				.addClass('scaccessibletoolbarstatement');
    				if(screenReaderOptions.enableDarkMode) {
    					toolbarDivAccessibilityStatement.addClass('darkmode');
    				}
    				$('#sc-section-audio').append(toolbarDivAccessibilityStatement);
				}
			}
			
			if(screenReaderOptions.fontsize) {
				// Inject del font size +
				var increaseButton = $('<button/>').attr({'id':'fr_screenreader_font_increase',
														  'title': ' - ' + fr_increase + ' - ',
														  'aria-label': ' - ' + fr_increase + ' - ',
														  'role' : 'button',
														  'accesskey':screenReaderOptions.accesskey_increase,
														  'data-value':'1'})
												   .addClass('sizable')
												   .text(fr_increase);
				speakerDiv.append(increaseButton);
				
				// Inject del font size -
				var decreaseButton = $('<button/>').attr({'id':'fr_screenreader_font_decrease',
														  'title': ' - ' + fr_decrease + ' - ',
														  'aria-label': ' - ' + fr_decrease + ' - ',
														  'role' : 'button',
														  'accesskey':screenReaderOptions.accesskey_decrease,
														  'data-value':'-1'})
												   .addClass('sizable')
												   .text(fr_decrease);
				speakerDiv.append(decreaseButton);
				
				// Inject del font size reset
				var resetButton = $('<button/>').attr({	'id':'fr_screenreader_font_reset',
														'title': ' - ' + fr_reset + ' - ',
														'aria-label': ' - ' + fr_reset + ' - ',
														'role' : 'button',
														'accesskey':screenReaderOptions.accesskey_reset,
														'data-value':'0'})
												.addClass('resizable')
												.text(fr_reset);
				speakerDiv.append(resetButton);
				
				// Add extra control labels for the accessible template
		    	if(screenReaderOptions.template == 'accessible.css') {
		    		var fontSizeDefault = screenReaderOptions.fontsizeDefault;
					var sessionFontSizeCurrent = screenReaderStorage.getItem('scr_fontsize');
		    		var currentCalculatedIncrement = parseInt(fontSizeCurrent - fontSizeDefault);
		    		var incrementSign = currentCalculatedIncrement > 0 ? '+' : '-';
		    		if(currentCalculatedIncrement != 0) {
		    			if(currentCalculatedIncrement > 0) {
		    				$('#fr_screenreader_font_increase').append('<div class="scfontsizelabel">' + incrementSign + currentCalculatedIncrement + '%</div>');
		    			} else {
		    				$('#fr_screenreader_font_decrease').append('<div class="scfontsizelabel">' + currentCalculatedIncrement + '%</div>');
		    			}
		    		}
		    		
		    		// Rebuild the section if the accessible template is active
					var sectionFontsizeContainer = $('<div/>').attr({	'id':'sc-section-fontsize' })
														   	  .addClass('sc-section');
					
					sectionFontsizeContainer.append('<div class="sc-section-title" aria-label="' + fr_font_sizing + '">' + fr_font_sizing + '</div>');
					speakerDiv.append(sectionFontsizeContainer);
					var fontsizeSectionButtons = $('#fr_screenreader_font_increase, #fr_screenreader_font_decrease, #fr_screenreader_font_reset').clone(true, true).end().remove();
					sectionFontsizeContainer.append(fontsizeSectionButtons);
		    	}
			}
			
			// Append del font family toggle
			if(screenReaderOptions.dyslexicFont) {
				// Inject del font size reset
				var fontFamilyButton = $('<button/>').attr({'id':'fr_screenreader_font_family',
															'title': ' - ' + fr_dyslexic_title + ' - ',
															'aria-label': ' - ' + fr_dyslexic_title + ' - ',
															'role' : 'button',
															'accesskey':screenReaderOptions.accesskey_dyslexic,
															'data-value':'0'})
													 .text(fr_dyslexic_title);
				speakerDiv.append(fontFamilyButton);
			}
			
			// Append del gray hues button
			if(screenReaderOptions.grayHues) {
				// Inject del font size reset
				var grayHuesButton = $('<button/>').attr({'id':'fr_screenreader_gray_hues',
														  'title': ' - ' + fr_gray_hues + ' - ',
														  'aria-label': ' - ' + fr_gray_hues + ' - ',
														  'role' : 'button',
														  'accesskey':screenReaderOptions.accesskey_grayhues})
												   .text(fr_gray_hues);
				speakerDiv.append(grayHuesButton);
			}
			
			// Append del big cursor
			if(screenReaderOptions.bigCursor) {
				var bigCursorButton = $('<button/>').attr({ 'id':'fr_screenreader_bigcursor',
														  	'title': ' - ' + fr_big_cursor + ' - ',
														  	'aria-label': ' - ' + fr_big_cursor + ' - ',
															'role' : 'button',
														  	'accesskey':screenReaderOptions.accesskey_bigcursor})
												   .text(fr_big_cursor);
				speakerDiv.append(bigCursorButton);
			}
			
			// Append della reading guide
			if(screenReaderOptions.readingGuides) {
				// Inject del font size reset
				var readingGuidesButton = $('<button/>').attr({'id':'fr_screenreader_reading_guides',
																'title': ' - ' + fr_reading_guides_title + ' - ',
																'aria-label': ' - ' + fr_reading_guides_title + ' - ',
																'role' : 'button',
																'accesskey':screenReaderOptions.accesskey_reading_guides})
														 .text(fr_reading_guides_title);
				speakerDiv.append(readingGuidesButton);
				
				// Init reading guides
		    	readingGuides = !!parseInt(screenReaderStorage.getItem('scr_reading_guides')) || 0;
		    	if(readingGuides) {
		    		$('#fr_screenreader_reading_guides').trigger('click', 1);
		    	}
			}
			
			// Append del read mode
			if(screenReaderOptions.readability) {
				// Inject del font size reset
				var readabilityButton = $('<button/>').attr({'id':'fr_screenreader_readability',
																'title': ' - ' + fr_readability_title + ' - ',
																'aria-label': ' - ' + fr_readability_title + ' - ',
																'role' : 'button',
																'accesskey':screenReaderOptions.accesskey_readability})
														 .text(fr_readability_title);
				speakerDiv.append(readabilityButton);
			}
			
			// Append dell'hide images
			if(screenReaderOptions.hideImages) {
				// Inject del font size reset
				var hideimagesButton = $('<button/>').attr({'id':'fr_screenreader_hideimages',
															'title': ' - ' + fr_hideimages_title + ' - ',
															'aria-label': ' - ' + fr_hideimages_title + ' - ',
															'role' : 'button',
															'accesskey':screenReaderOptions.accesskey_hideimages})
													 .text(fr_hideimages_title);
				speakerDiv.append(hideimagesButton);
				
				// Init reading guides
		    	hideImages = !!parseInt(screenReaderStorage.getItem('scr_hideimages')) || 0;
		    	if(hideImages) {
		    		$('#fr_screenreader_hideimages').trigger('click', 1);
		    	}
			}
			
			// Append dello skip to contents
			if(screenReaderOptions.showSkipToContents) {
				// Inject del font size reset
				var skipToContentsButton = $('<button/>').attr({'id':'fr_screenreader_skiptocontents',
																'title': ' - ' + fr_showskiptocontents_title + ' - ',
																'aria-label': ' - ' + fr_showskiptocontents_title + ' - ',
																'role' : 'button',
																'accesskey':screenReaderOptions.accesskey_skiptocontents})
														 .text(fr_showskiptocontents_title);
				speakerDiv.append(skipToContentsButton);
			}
			
			// Append dello spacing increase/decrease
			if(screenReaderOptions.spacingSize) {
				// Inject del font size +
				var spacingIncreaseButton = $('<button/>').attr({ 'id':'fr_screenreader_spacing_increase',
																  'title': ' - ' + fr_spacing_increase + ' - ',
																  'aria-label': ' - ' + fr_spacing_increase + ' - ',
																  'role' : 'button',
																  'accesskey':screenReaderOptions.accesskey_spacingsize_increase,
																  'data-value':'1'})
														   .addClass('spacingsizable')
														   .text(fr_spacing_increase);
				speakerDiv.append(spacingIncreaseButton);
				
				// Inject del font size -
				var spacingDecreaseButton = $('<button/>').attr({ 'id':'fr_screenreader_spacing_decrease',
																  'title': ' - ' + fr_spacing_decrease + ' - ',
																  'aria-label': ' - ' + fr_spacing_decrease + ' - ',
																  'role' : 'button',
																  'accesskey':screenReaderOptions.accesskey_spacingsize_decrease,
																  'data-value':'-1'})
														   .addClass('spacingsizable')
														   .text(fr_spacing_decrease);
				speakerDiv.append(spacingDecreaseButton);
				
				// Add extra control labels for the accessible template
		    	if(screenReaderOptions.template == 'accessible.css') {
					var sessionSpacingSizeCurrent = screenReaderStorage.getItem('scr_spacingsize');
		    		if(sessionSpacingSizeCurrent) {
		    			if(sessionSpacingSizeCurrent > 0) {
		    				$('#fr_screenreader_spacing_increase').append('<div class="scspacingsizelabel">+' + (sessionSpacingSizeCurrent * 10) + '%</div>');
		    			}
		    		}
		    	}
			}
			
			// Add extra control labels for the accessible template
	    	if(screenReaderOptions.template == 'accessible.css') {
	    		// Rebuild the section if the accessible template is active
	    		var enhancementsSectionButtons = $('#fr_screenreader_font_family, #fr_screenreader_gray_hues, #fr_screenreader_bigcursor, #fr_screenreader_reading_guides, #fr_screenreader_readability, #fr_screenreader_hideimages, #fr_screenreader_skiptocontents, #fr_screenreader_spacing_increase, #fr_screenreader_spacing_decrease').clone(true, true).end().remove();
	    		if(enhancementsSectionButtons.length) {
	    			var sectionEnhancementContainer = $('<div/>').attr({ 'id':'sc-section-enhancement' })
	    														 .addClass('sc-section');
	    			sectionEnhancementContainer.append('<div class="sc-section-title" aria-label="' + fr_accessibility_enhancements + '">' + fr_accessibility_enhancements + '</div>');
	    			speakerDiv.append(sectionEnhancementContainer);
	    			sectionEnhancementContainer.append(enhancementsSectionButtons);
	    		}
	    	}

			// Append del page zoom
			if(screenReaderOptions.pageZoom && screenReaderOptions.templateOrientation == 'vertical') {
				// Increase del page zoom +
				var pagezoomIncreaseButton = $('<button/>').attr({ 'id':'fr_screenreader_pagezoom_increase',
																   'title': ' - ' + fr_pagezoom_increase + ' - ',
																   'aria-label': ' - ' + fr_pagezoom_increase + ' - ',
																   'role' : 'button',
																   'accesskey':screenReaderOptions.accesskey_pagezoomsize_increase,
																   'data-value':'1'})
														   .addClass('zoomsizable')
														   .text(fr_pagezoom_increase);
				speakerDiv.append(pagezoomIncreaseButton);
				
				// Decrease del page zoom -
				var pagezoomDecreaseButton = $('<button/>').attr({ 'id':'fr_screenreader_pagezoom_decrease',
																   'title': ' - ' + fr_pagezoom_decrease + ' - ',
																   'aria-label': ' - ' + fr_pagezoom_decrease + ' - ',
																   'role' : 'button',
																   'accesskey':screenReaderOptions.accesskey_pagezoomsize_decrease,
																   'data-value':'-1'})
														   .addClass('zoomsizable')
														   .text(fr_pagezoom_decrease);
				speakerDiv.append(pagezoomDecreaseButton);
				
				// Reset del page zoom
				var pagezoomResetButton = $('<button/>').attr({	'id':'fr_screenreader_pagezoom_reset',
            													'title': ' - ' + fr_pagezoom_reset + ' - ',
            													'aria-label': ' - ' + fr_pagezoom_reset + ' - ',
            													'role' : 'button',
            													'accesskey':screenReaderOptions.accesskey_pagezoomsize_reset,
            													'data-value':'0'})
        												.addClass('zoomresizable')
        												.text(fr_pagezoom_reset);
				speakerDiv.append(pagezoomResetButton);
				
				// Add extra control labels for the accessible template
		    	if(screenReaderOptions.template == 'accessible.css') {
		    		var zoomSizeDefault = 100;
					var sessionZoomSizeCurrent = screenReaderStorage.getItem('scr_zoomsize');
		    		var currentCalculatedIncrement = parseInt(zoomSizeCurrent - zoomSizeDefault);
		    		var incrementSign = currentCalculatedIncrement > 0 ? '+' : '-';
		    		if(currentCalculatedIncrement != 0) {
		    			if(currentCalculatedIncrement > 0) {
		    				$('#fr_screenreader_pagezoom_increase').append('<div class="sczoomsizelabel">' + incrementSign + currentCalculatedIncrement + '%</div>');
		    			} else {
		    				$('#fr_screenreader_pagezoom_decrease').append('<div class="sczoomsizelabel">' + currentCalculatedIncrement + '%</div>');
		    			}
		    		}
		    		
		    		
					var sessionPageZoomCurrent = screenReaderStorage.getItem('scr_pagezoom');
		    		if(sessionPageZoomCurrent) {
		    			if(sessionPageZoomCurrent > 0) {
		    				$('#fr_screenreader_pagezoom_increase').append('<div class="scspacingsizelabel">+' + (sessionPageZoomCurrent * 10) + '%</div>');
		    			}
		    		}
		    		
		    		var sectionPageZoomContainer = $('<div/>').attr({ 'id':'sc-section-pagezoom' })
				   											  .addClass('sc-section');

                    sectionPageZoomContainer.append('<div class="sc-section-title" aria-label="' + fr_page_zoom + '">' + fr_page_zoom + '</div>');
                    speakerDiv.append(sectionPageZoomContainer);
                    var pagezoomSectionButtons = $('#fr_screenreader_pagezoom_increase, #fr_screenreader_pagezoom_decrease, #fr_screenreader_pagezoom_reset').clone(true, true).end().remove();
                    sectionPageZoomContainer.append(pagezoomSectionButtons);
		    	}
			}
			
			var subtractWidthKonst = 0;
			if(!screenReaderOptions.screenreader) {
				subtractWidthKonst = 100;
			}
			if(!screenReaderOptions.dyslexicFont) {
				subtractWidthKonst += 35;
			}
			if(!screenReaderOptions.grayHues) {
				subtractWidthKonst += 35;
			}
			if(!screenReaderOptions.bigCursor) {
				subtractWidthKonst += 35;
			}
			if(!screenReaderOptions.readingGuides) {
				subtractWidthKonst += 35;
			}
			if(!screenReaderOptions.readability) {
				subtractWidthKonst += 35;
			}
			if(!screenReaderOptions.showSkipToContents) {
				subtractWidthKonst += 35;
			}
			if(!screenReaderOptions.spacingSize) {
				subtractWidthKonst += 70;
			}

			if(screenReaderOptions.highcontrast) {
				// Inject del default high contrast
				var highContrastHtml = $('<button/>').attr({'id':'fr_screenreader_highcontrast',
															'title': ' - ' + fr_highcontrast + ' - ',
															'aria-label': ' - ' + fr_highcontrast + ' - ',
															'role' : 'button',
															'accesskey':screenReaderOptions.accesskey_highcontrast,
															'data-value':'0'})
													 .text(fr_highcontrast);
				if(highContrast) {
					highContrastHtml.addClass('active');
				}
				speakerDiv.append(highContrastHtml);
				
				// Check if the alternate high contrast mode is enabled and supported
				var alternateHighContrast = screenReaderOptions.highcontrastAlternate && css3FilterFeatureDetect();
				if(alternateHighContrast) {
					// Inject del mode2 high contrast
					var highContrast2 = $('<button/>').attr({'id':'fr_screenreader_highcontrast2',
															 'title': ' - ' + fr_highcontrast + ' - ',
															 'aria-label': ' - ' + fr_highcontrast + ' - ',
															 'role' : 'button',
															 'accesskey':screenReaderOptions.accesskey_highcontrast2,
															 'data-alternate':'1',
															 'data-rotate':screenReaderOptions.colorHue})
												 	  .text(fr_highcontrast);
					speakerDiv.append(highContrast2);
					
					// Inject del mode3 high contrast
					var highContrast3 = $('<button/>').attr({'id':'fr_screenreader_highcontrast3',
															 'title': ' - ' + fr_highcontrast + ' - ',
															 'aria-label': ' - ' + fr_highcontrast + ' - ',
															 'role' : 'button',
															 'accesskey':screenReaderOptions.accesskey_highcontrast3,
															 'data-alternate':'2',
															 'data-rotate':screenReaderOptions.colorHue,
															 'data-brightness':screenReaderOptions.colorBrightness})
												 	  .text(fr_highcontrast);
					speakerDiv.append(highContrast3);
					
					// Init high contrast alternate
			    	highContrastAlternate = parseInt(screenReaderStorage.getItem('scr_highcontrast_alternate')) || 0;
			    	if(highContrastAlternate) {
			    		var targetHightContrastAlternateButtonMode = $('button[data-alternate=' + highContrastAlternate + ']').addClass('active');
			    		applyAlternateHighContrast.call(targetHightContrastAlternateButtonMode);
			    	}
				}
				
				// Rule the bar size width
				if(screenReaderOptions.fontsize && alternateHighContrast) {
					$('#speaker_plugin').css('width', parseInt(605 - subtractWidthKonst) + 'px');
				} else if(screenReaderOptions.fontsize){
					$('#speaker_plugin').css('width', parseInt(540 - subtractWidthKonst) + 'px');
				} else if(!screenReaderOptions.fontsize && alternateHighContrast) {
					$('#speaker_plugin').css('width', parseInt(510 - subtractWidthKonst) + 'px');
				}
				
				// Add extra control labels for the accessible template
		    	if(screenReaderOptions.template == 'accessible.css') {
		    		// Rebuild the section if the accessible template is active
					var sectionHighcontrastContainer = $('<div/>').attr({ 'id':'sc-section-highcontrast' })
																  .addClass('sc-section');
					
					sectionHighcontrastContainer.append('<div class="sc-section-title" aria-label="' + fr_high_contrast_color + '">' + fr_high_contrast_color + '</div>');
					speakerDiv.append(sectionHighcontrastContainer);
					var highcontrastSectionButtons = $('#fr_screenreader_highcontrast, #fr_screenreader_highcontrast2, #fr_screenreader_highcontrast3').clone(true, true).end().remove();
					sectionHighcontrastContainer.append(highcontrastSectionButtons);
		    	}
			} else {
				if(screenReaderOptions.fontsize) {
					$('#speaker_plugin').css('width', parseInt(425 - subtractWidthKonst) + 'px');
				} else {
					$('#speaker_plugin').css('width', parseInt(315 - subtractWidthKonst) + 'px');
				}
			}
			
			// Add colors palette to the accessibility template
			if(screenReaderOptions.customColors && screenReaderOptions.template == 'accessible.css') {
				// Inject del font size +
				var changeTextColor = $('<button/>').attr({'id':'fr_screenreader_text_color',
														   'title': ' - ' + fr_text_color + ' - ',
														   'aria-label': ' - ' + fr_text_color + ' - ',
														   'role' : 'button',
														   'accesskey':screenReaderOptions.accesskey_change_text_color})
												   .addClass('scr-custom-color')
												   .text(fr_text_color);
				speakerDiv.append(changeTextColor);
				
				// Inject del font size -
				var changeBackgroundColor = $('<button/>').attr({'id':'fr_screenreader_background_color',
														  		 'title': ' - ' + fr_background_color + ' - ',
        														 'aria-label': ' - ' + fr_background_color + ' - ',
        														 'role' : 'button',
        														 'accesskey':screenReaderOptions.accesskey_change_background_color})
												   .addClass('scr-custom-color')
												   .text(fr_background_color);
				speakerDiv.append(changeBackgroundColor);
				
				var colorsMiniButtons = `
				<div class="scr-color-box">
					<span data-scr-color="#0076B4" class="scr-color-selection" role="button" tabindex="0" aria-label="${fr_background_color_desc}" style="background-color: #0076B4 !important;"> </span> 
					<span data-scr-color="#7A549C" class="scr-color-selection" role="button" tabindex="0" aria-label="${fr_background_color_desc}" style="background-color: #7A549C !important;"> </span> 
					<span data-scr-color="#C83733" class="scr-color-selection" role="button" tabindex="0" aria-label="${fr_background_color_desc}" style="background-color: #C83733 !important;"> </span> 
					<span data-scr-color="#D07021" class="scr-color-selection" role="button" tabindex="0" aria-label="${fr_background_color_desc}" style="background-color: #D07021 !important;"> </span> 
					<span data-scr-color="#26999F" class="scr-color-selection" role="button" tabindex="0" aria-label="${fr_background_color_desc}" style="background-color: #26999F !important;"> </span> 
					<span data-scr-color="#4D7831" class="scr-color-selection" role="button" tabindex="0" aria-label="${fr_background_color_desc}" style="background-color: #4D7831 !important;"> </span> 
					<span data-scr-color="#ffffff" class="scr-color-selection" role="button" tabindex="0" aria-label="${fr_background_color_desc}" style="background-color: #ffffff !important;"> </span> 
					<span data-scr-color="#000000" class="scr-color-selection" role="button" tabindex="0" aria-label="${fr_background_color_desc}" style="background-color: #000000 !important;"> </span> 
					<div class="scr-color-selection-reset" role="button" tabindex="0"> ${fr_custom_color_reset} </div>
				</div>`;
				$('button.scr-custom-color').append(colorsMiniButtons);
				
	    		// Rebuild the section if the accessible template is active
				var sectionCustomcolorsContainer = $('<div/>').attr({'id':'sc-section-customcolors'})
													   	  	  .addClass('sc-section');
				
				sectionCustomcolorsContainer.append('<div class="sc-section-title" aria-label="' + fr_custom_colors + '">' + fr_custom_colors + '</div>');
				speakerDiv.append(sectionCustomcolorsContainer);
				var customColorsSectionButtons = $('#fr_screenreader_text_color, #fr_screenreader_background_color').clone(true, true).end().remove();
				sectionCustomcolorsContainer.append(customColorsSectionButtons);
				
				// Bind event change color, apply the color based on the container type
				$('span.scr-color-selection').on('click', function(jqEvent){
					var colorButton = $(this);
					var parentType = colorButton.parents('button.scr-custom-color').attr('id');
					var selectedColor = colorButton.data('scr-color');
					
					if(parentType == 'fr_screenreader_text_color') {
						if(colorButton.hasClass('scr-color-selection-enabled')) {
							document.querySelector('body').style.removeProperty('color');
							if(screenReaderOptions.customColorsCssSelectors) {
								$(screenReaderOptions.customColorsCssSelectors).each(function(index, element){
									element.style.removeProperty('color');
								});
							}
							colorButton.removeClass('scr-color-selection-enabled');
						} else {
							document.querySelector('body').style.setProperty('color', selectedColor, 'important');
							if(screenReaderOptions.customColorsCssSelectors) {
								$(screenReaderOptions.customColorsCssSelectors).each(function(index, element){
									element.style.setProperty('color', selectedColor, 'important');
								});
							}
							$('#fr_screenreader_text_color span.scr-color-selection').removeClass('scr-color-selection-enabled');
							colorButton.addClass('scr-color-selection-enabled');
						}
						screenReaderStorage.setItem('scr_custom_text_color', selectedColor);
					} else if(parentType == 'fr_screenreader_background_color') {
						if(colorButton.hasClass('scr-color-selection-enabled')) {
							document.querySelector('body').style.removeProperty('background');
							if(screenReaderOptions.customColorsCssSelectors) {
								$(screenReaderOptions.customColorsCssSelectors).each(function(index, element){
									element.style.removeProperty('background');
								});
							}
							colorButton.removeClass('scr-color-selection-enabled');
						} else {
							document.querySelector('body').style.setProperty('background', selectedColor, 'important');
							if(screenReaderOptions.customColorsCssSelectors) {
								$(screenReaderOptions.customColorsCssSelectors).each(function(index, element){
									element.style.setProperty('background', selectedColor, 'important');
								});
							}
							$('#fr_screenreader_background_color span.scr-color-selection').removeClass('scr-color-selection-enabled');
							colorButton.addClass('scr-color-selection-enabled');
						}
						screenReaderStorage.setItem('scr_custom_background_color', selectedColor);
					}
				});
				
				$('div.scr-color-selection-reset').on('click', function(jqEvent){
					var resetButton = $(this);
					var parentType = resetButton.parents('button.scr-custom-color').attr('id');
					
					if(parentType == 'fr_screenreader_text_color') {
						$('span.scr-color-selection').removeClass('scr-color-selection-enabled');
						document.querySelector('body').style.removeProperty('color');
						if(screenReaderOptions.customColorsCssSelectors) {
							$(screenReaderOptions.customColorsCssSelectors).each(function(index, element){
								element.style.removeProperty('color');
							});
						}
						screenReaderStorage.removeItem('scr_custom_text_color');
					} else if(parentType == 'fr_screenreader_background_color') {
						$('span.scr-color-selection').removeClass('scr-color-selection-enabled');
						document.querySelector('body').style.removeProperty('background');
						if(screenReaderOptions.customColorsCssSelectors) {
							$(screenReaderOptions.customColorsCssSelectors).each(function(index, element){
								element.style.removeProperty('background');
							});
						}
						screenReaderStorage.removeItem('scr_custom_background_color');
					}
				});
				
				// Rotate button click
				$('#fr_screenreader_background_color, #fr_screenreader_text_color').on('click', function(jqEvent){
					jqEvent.stopPropagation();
					if(!$(jqEvent.target).hasClass('scr-custom-color') && !$(jqEvent.target).hasClass('scr-color-box')) {
						return false;
					}
					if($(jqEvent.target).hasClass('scr-custom-color')) {
						var selectedContainerButton = $(jqEvent.target);
					} else {
						var selectedContainerButton = $(jqEvent.target).parent('button.scr-custom-color');
					}
					var selectedColorButton = $('span.scr-color-selection.scr-color-selection-enabled', selectedContainerButton);
					if(selectedColorButton.length) {
						selectedColorButton.next().trigger('click');
					} else {
						$('div.scr-color-box > span:first-child', selectedContainerButton).trigger('click');
					}
				});
			}
			
			// Manage background color for the toolbar or buttons only based on the template
			if(screenReaderOptions.template == 'custom.css') {
				$('#speaker_plugin button').css('background-color', screenReaderOptions.toolbarBgcolor);
				$('#accessibility-links').css('background', 'transparent');
			} else {
				$('#accessibility-links').css('background-color', screenReaderOptions.toolbarBgcolor);
			}
			
			if(screenReaderOptions.templateOrientation == 'vertical' && screenReaderOptions.template != 'custom.css') {
				$('#text_plugin').css('background-color', screenReaderOptions.toolbarBgcolor);
			}
			
			var toolbarBgcolorCompare = screenReaderOptions.toolbarBgcolor.toLowerCase();
			if(screenReaderOptions.template == 'accessible.css' && (toolbarBgcolorCompare == '#eeeeee' || toolbarBgcolorCompare == '#eee')) {
				$('#text_plugin').css('background-color', '#004fce');
				$('#toolbar_plugin').css('background-color', '#004fce');
				$('#toolbar_closer').css({'color':'transparent', 'text-shadow':'#004fce 0px 0px 0px'});
				$('svg.scr-darkmode').css('fill', '#004fce');
			}
			
			if(screenReaderOptions.template == 'accessible.css' && toolbarBgcolorCompare != '#eeeeee' && toolbarBgcolorCompare != '#eee') {
				$('#accessibility-links').css('background-color', '#EEEEEE');
				$('#text_plugin').css('background-color', screenReaderOptions.toolbarBgcolor);
				$('#toolbar_plugin').css('background-color', screenReaderOptions.toolbarBgcolor);
				$('#toolbar_closer').css({'color':'transparent', 'text-shadow': (screenReaderOptions.toolbarBgcolor + ' 0px 0px 0px')});
				$('svg.scr-darkmode').css('fill', screenReaderOptions.toolbarBgcolor);
			}
			
			if(screenReaderOptions.template == 'accessible.css') {
				$('#speaker_plugin > button').removeAttr('title');
				var currentLabelTitle = $('#text_plugin').attr('title');
				$('#text_plugin').removeAttr('title');
				$('#text_plugin').attr('aria-label', currentLabelTitle).attr('role', 'button');				
			}
			
			// Manage the visibility state of the toolbar
			if(screenReaderConfigOptions.useMinimizedToolbar && 
			  (screenReaderConfigOptions.mobileDeviceDetected || (!screenReaderConfigOptions.mobileDeviceDetected && !screenReaderConfigOptions.minimizedToolbarOnlyMobile))) {
				var volumeWidth = $('#volume_plugin').width();
				var speakerWidth = $('#speaker_plugin').width();
				var containerWidth = $('#accessibility-links').width();
				var totalWidthToOffset = parseInt(volumeWidth + speakerWidth);
				if(screenReaderOptions.templateOrientation == 'vertical') {
					totalWidthToOffset = parseInt(speakerWidth);
				}
				if(screenReaderOptions.template == 'accessible.css') {
					totalWidthToOffset = parseInt(containerWidth);
				}
				var targetState = 0;
				var targetSign = '+';
				var windowWidth = $(window).width();
				if(windowWidth < totalWidthToOffset && screenReaderOptions.template != 'accessible.css') {
					totalWidthToOffset = windowWidth - 80;
				}
				
				$('#text_plugin').attr('accesskey', screenReaderConfigOptions.accesskey_minimized);
				
				$('#toolbar_closer').on('click', function(jqEvent){
					$('#text_plugin').trigger('click');
				});
				
				// Manage the lazy loaded fontsize when opening the minimized toolbar
				if(screenReaderOptions.fontsizeMinimizedToolbar && screenReaderConfigOptions.statusMinimizedToolbar == 'closed') {
					$('#text_plugin').on('click', function(jqEvent){
						$('body').css('font-size', fontSizeCurrent + '%');
						
						if(screenReaderOptions.fontsizeSelector) {
							fontSizeInline = ';font-size:100%';
							// Manage header resize increment
							fontResizeHeaders();
						}
						
						var fontsizingElements = $(screenReaderOptions.fontsizeSelector);
						$.each(fontsizingElements, function(index, elem) {
							if($.inArray(elem.nodeName.toLowerCase(), ['h1', 'h2', 'h3', 'h4']) != -1) {
								fontSizeInline = '';
							} else {
								fontSizeInline = ';font-size:100%';
							}
							var currentInlineStyles = $(elem).attr('style') || '';
							$(elem).attr('style', rtrim(currentInlineStyles, ';') + fontSizeInline);
						});
					});
				}
				
				// Identify the side to offest based on the positionment
				switch(screenReaderOptions.position) {
					case 'bottomright':
					case 'topright':
						$('#text_plugin span.fr_label').css({'cursor':'pointer'});
						if(screenReaderConfigOptions.statusMinimizedToolbar == 'closed') {
							$('#accessibility-links').css({'right':'-' + (totalWidthToOffset + 2) + 'px'}).removeClass('screenreader-open').addClass('screenreader-closed');
							
							// Reposition the button in the accessible.css template on window resize or orientation change on mobile
							if(screenReaderOptions.template == 'accessible.css') {
								$(window).on('resize', function() {
									let accessibilityLinksMainContainer = $('#accessibility-links.screenreader-closed');
									if(accessibilityLinksMainContainer.length) {
										let containerWidth = accessibilityLinksMainContainer.width();
										totalWidthToOffset = parseInt(containerWidth);
										$('#accessibility-links').css({'right':'-' + (totalWidthToOffset + 2) + 'px'});
									}
								})
							}
						} else {
							$('#speaker_plugin, #volume_plugin').css({'opacity':1});
							$('#accessibility-links').removeClass('screenreader-closed').addClass('screenreader-open');
							targetState = totalWidthToOffset + 2;
							targetSign = '-';
						}
						
						$('#text_plugin').css({'cursor':'pointer'}).on('click', function(jqEvent){
							if(targetState) {
								$('#speaker_plugin, #volume_plugin').animate({'opacity': 0}, 300);
							}
							$('#accessibility-links').animate({'right': (targetSign + targetState)}, 500, function(){
								targetState = targetState ? 0 : totalWidthToOffset + 2;
								targetSign = '+' ? '-' : '+';
								if(targetState) {
									$(this).removeClass('screenreader-closed').addClass('screenreader-open');
								} else {
									$(this).removeClass('screenreader-open').addClass('screenreader-closed');
								}
							});
							if(!targetState) {
								setTimeout(function(){
									$('#speaker_plugin, #volume_plugin').animate({'opacity': 1}, 300);
								}, 300);
							}
						});
					break;
					
					case 'topleft':
					case 'bottomleft' :
						if(screenReaderConfigOptions.statusMinimizedToolbar == 'closed') {
							$('#accessibility-links').removeClass('screenreader-open').addClass('screenreader-closed');
							$('#volume_plugin,#speaker_plugin,#toolbar_plugin').hide();
						} else {
							$('#accessibility-links').removeClass('screenreader-closed').addClass('screenreader-open');
						}
						$('#text_plugin span.fr_label').css({'cursor':'pointer'});
						$('#text_plugin').css({'cursor':'pointer'}).on('click', function(jqEvent){
							$('#volume_plugin,#speaker_plugin,#toolbar_plugin').fadeToggle();
							if($('#accessibility-links').hasClass('screenreader-open')) {
								$('#accessibility-links').removeClass('screenreader-open').addClass('screenreader-closed');
							} else {
								$('#accessibility-links').removeClass('screenreader-closed').addClass('screenreader-open');
							}
						});
					break;
				}
			} else {
				switch(screenReaderOptions.position) {
					case 'bottomright':
					case 'topright':
						$('#speaker_plugin, #volume_plugin').css({'opacity':1});
					break;
				}
			}
			
			// Manage the clone moving of controls to the bottom of the toolbar for the sidebar optimal displacement
			if(screenReaderOptions.template != 'accessible.css' && screenReaderOptions.templateOrientation == 'vertical') {
				var $originalTextPlugin = $('#text_plugin');
				var $originalVolumePlugin = $('#volume_plugin');
				var $clonedTextPlugin = $originalTextPlugin.clone(true, true);
				var $clonedVolumePlugin = $originalVolumePlugin.clone(true, true);
				var $targetSpeakerPlugin = $('#scr_clearer').before($clonedTextPlugin).before($clonedVolumePlugin);
				$originalTextPlugin.remove();
				$originalVolumePlugin.remove();
			}
		};

		/**
		 * Start TTS engine
		 * 
		 * @access public
		 * @return Boolean
		 */
		this.startTTSEngine = function() {
			// Instance TTS
			frTTSEngineInstance = new jQuery.frTTSEngine(screenReaderOptions);  
			
			return true;
		};
		
		/**
		 * Add plugin buttons event listeners
		 * 
		 * @access private
		 * @return Void
		 */
		var addListeners = function() {
			// Register events for sizable
			$(document).on('click', '.sizable', function(jqEvent){
				var increment = parseInt($(this).data('value'));
				fontSizeCurrent = parseInt(fontSizeCurrent) + parseInt(increment * 5);

			    if(fontSizeCurrent > screenReaderOptions.fontsizeMax){
			    	fontSizeCurrent = screenReaderOptions.fontsizeMax;
			    } else if (fontSizeCurrent < screenReaderOptions.fontsizeMin){
			    	fontSizeCurrent = screenReaderOptions.fontsizeMin;
			    }
			    
			    $('body').css('font-size', fontSizeCurrent + '%');
			    if(screenReaderOptions.fontsizeSelector) {
		    		// Manage header resize increment
		    		fontResizeHeaders();
		    	}
		    	screenReaderStorage.setItem('scr_fontsize', fontSizeCurrent);
		    	
		    	// Add extra control labels for the accessible template
		    	if(screenReaderOptions.template == 'accessible.css') {
		    		var currentCalculatedIncrement = parseInt(fontSizeCurrent - fontSizeDefault);
		    		var incrementSign = currentCalculatedIncrement > 0 ? '+' : '-';
		    		if(currentCalculatedIncrement != 0) {
		    			$('div.scfontsizelabel').remove();
		    			if(currentCalculatedIncrement > 0) {
		    				$('#fr_screenreader_font_increase').append('<div class="scfontsizelabel">' + incrementSign + currentCalculatedIncrement + '%</div>');
		    			} else {
		    				$('#fr_screenreader_font_decrease').append('<div class="scfontsizelabel">' + currentCalculatedIncrement + '%</div>');
		    			}
		    		} else {
		    			$('div.scfontsizelabel').remove();
		    		}
		    	}
			});
				
			// Register events for reset
			$(document).on('click', '.resizable', function(jqEvent){
				if(screenReaderOptions.resetButtonBehavior == 'all') {
					var resetHighContrast = !!parseInt(screenReaderStorage.getItem('scr_highcontrast')) || 0;
			    	if(resetHighContrast) {
			    		$('#fr_screenreader_highcontrast').trigger('click');
			    	} else {
			    		var resetHighContrastAlternate = parseInt(screenReaderStorage.getItem('scr_highcontrast_alternate')) || 0;
			    		if(resetHighContrastAlternate == 1) {
			    			$('#fr_screenreader_highcontrast2').trigger('click');
			    		}
			    		if(resetHighContrastAlternate == 2) {
			    			$('#fr_screenreader_highcontrast3').trigger('click');
			    		}
			    	}
			    	
			    	var resetDyslexicFont = !!parseInt(screenReaderStorage.getItem('scr_dyslexicfont')) || 0;
			    	if(resetDyslexicFont) {
			    		$('#fr_screenreader_font_family').trigger('click');
			    	}
			    	
			    	var resetGrayHues = !!parseInt(screenReaderStorage.getItem('scr_grayhues')) || 0;
			    	if(resetGrayHues) {
			    		$('#fr_screenreader_gray_hues').trigger('click');
			    	}
			    	
			    	var resetBigCursor = !!parseInt(screenReaderStorage.getItem('scr_bigcursor')) || 0;
			    	if(resetBigCursor) {
			    		$('#fr_screenreader_bigcursor').trigger('click');
			    	}
			    	
			    	var resetPageZoom = !!parseInt(screenReaderStorage.getItem('scr_zoomsize')) || 0;
			    	if(resetPageZoom) {
			    		$('#fr_screenreader_pagezoom_reset').trigger('click');
			    	}
				}
				
				// Remove extra control labels for the accessible template
				if(screenReaderOptions.template == 'accessible.css') {
					$('div.scfontsizelabel,div.scspacingsizelabel').remove();
				}

				fontSizeCurrent = fontSizeDefault;
				$('body').css('font-size', fontSizeDefault + '%');
				
				// Reset even text spacing if any
				var resetSpacingSize = !!parseInt(screenReaderStorage.getItem('scr_spacingsize')) || !!parseInt(screenReaderStorage.getItem('scr_final_lineheight')) || 0;
				var resetSpacingSizeInline = '';
		    	if(resetSpacingSize) {
		    		$('body').css({'word-spacing':'inherit', 'letter-spacing':'inherit', 'line-height':screenReaderStorage.getItem('scr_initial_lineheight')});
		    		resetSpacingSizeInline = ';word-spacing:inherit;letter-spacing:inherit;line-height:inherit';
		    		screenReaderStorage.setItem('scr_spacingsize', 0);
		    		spacingSizeCurrent = 0;
		    		screenReaderStorage.removeItem('scr_final_lineheight');
		    	}
		    	
				if(screenReaderOptions.fontsizeSelector) {
		    		// Manage header resize increment
		    		fontResizeHeaders();
		    	}
		    	screenReaderStorage.setItem('scr_fontsize', fontSizeDefault);
			});

			// Register events for zoomsizable
			$(document).on('click', '.zoomsizable', function(jqEvent){
				var increment = parseInt($(this).data('value'));
				zoomSizeCurrent = parseInt(zoomSizeCurrent) + parseInt(increment * 5);

			    $('html').css('zoom', zoomSizeCurrent + '%');
		    	screenReaderStorage.setItem('scr_zoomsize', zoomSizeCurrent);
		    	
		    	// Add extra control labels for the accessible template
		    	if(screenReaderOptions.template == 'accessible.css') {
		    		var currentCalculatedIncrement = parseInt(zoomSizeCurrent - 100);
		    		var incrementSign = currentCalculatedIncrement > 0 ? '+' : '-';
		    		if(currentCalculatedIncrement != 0) {
		    			$('div.sczoomsizelabel').remove();
		    			if(currentCalculatedIncrement > 0) {
		    				$('#fr_screenreader_pagezoom_increase').append('<div class="sczoomsizelabel">' + incrementSign + currentCalculatedIncrement + '%</div>');
		    			} else {
		    				$('#fr_screenreader_pagezoom_decrease').append('<div class="sczoomsizelabel">' + currentCalculatedIncrement + '%</div>');
		    			}
		    		} else {
		    			$('div.sczoomsizelabel').remove();
		    		}
		    	}
			});
			
			// Register events for reset
			$(document).on('click', '.zoomresizable', function(jqEvent){
				// Remove extra control labels for the accessible template
				if(screenReaderOptions.template == 'accessible.css') {
					$('div.sczoomsizelabel').remove();
				}

				zoomSizeCurrent = 100;
				$('html').css('zoom', 100 + '%');
				
		    	screenReaderStorage.removeItem('scr_zoomsize', 100);
			});
			
			// Register events for sizable
			$(document).on('click', '.spacingsizable', function(jqEvent){
				var increment = parseInt($(this).data('value'));
				var currentLineHeight = $('body').css('line-height');
				spacingSizeCurrent = parseInt(spacingSizeCurrent) + parseInt(increment);
				if(parseFloat(currentLineHeight)) {
					lineHeightCurrent = parseFloat(currentLineHeight) + parseInt(increment);
				} else {
					lineHeightCurrent = 16 + parseInt(increment);
				}

				if(spacingSizeCurrent > screenReaderOptions.spacingSizeMax){
					spacingSizeCurrent = screenReaderOptions.spacingSizeMax;
					return;
			    } else if (spacingSizeCurrent < screenReaderOptions.spacingSizeMin){
			    	spacingSizeCurrent = screenReaderOptions.spacingSizeMin;
			    	return;
			    }
				
				// Store the initial line-height for later reset
				if(!screenReaderStorage.getItem('scr_initial_lineheight')) {
					screenReaderStorage.setItem('scr_initial_lineheight', currentLineHeight);
				}

			    $('body').css({'word-spacing': (spacingSizeCurrent * 2) + 'px', 'letter-spacing': spacingSizeCurrent + 'px', 'line-height': lineHeightCurrent + 'px'});
		    	screenReaderStorage.setItem('scr_spacingsize', spacingSizeCurrent);
		    	screenReaderStorage.setItem('scr_final_lineheight', lineHeightCurrent);
		    	
		    	// Add extra control labels for the accessible template
		    	if(screenReaderOptions.template == 'accessible.css') {
	    			if(spacingSizeCurrent > 0) {
	    				$('#fr_screenreader_spacing_increase').append('<div class="scspacingsizelabel">+' + (spacingSizeCurrent * 10) + '%</div>');
	    			} else {
	    				$('div.scspacingsizelabel').remove();
	    			}
		    	}
			});
			
			// Register events for high contrast button
			$(document).on('click', '#fr_screenreader_highcontrast', function(jqEvent){
				highContrast = !!parseInt(screenReaderStorage.getItem('scr_highcontrast')) || 0;
				if(!highContrast) {
					if(highContrastAlternate) {
						// Recover original stylesheets
						targetFilterElement.attr('style', originalHTMLStyles);
						highContrastAlternate = 0;
						screenReaderStorage.setItem('scr_highcontrast_alternate', highContrastAlternate);
					}
					
					targetFilterElement.addClass('scr_highcontrast');  
					
					// If IE detected, fallback on the compatibility inversion color high contrast
					if("ActiveXObject" in window) {
						startLegacyHighcontrast('body, body *:not(#accessibility-links, #accessibility-links *, div.shapes)');
					}
					
					$('#fr_screenreader_highcontrast2,#fr_screenreader_highcontrast3').removeClass('active');
					$(this).addClass('active');
					highContrast = 1;
				} else {
					targetFilterElement.removeClass('scr_highcontrast');
					
					// If IE detected, fallback on the compatibility inversion color high contrast
					if("ActiveXObject" in window) {
						highContrast = 0;
						window.location.reload();
					}
					
					$(this).removeClass('active');
					highContrast = 0;
				}
				
		    	screenReaderStorage.setItem('scr_highcontrast', highContrast);
			});
			
			// Register events for dyslexic font
			$(document).on('click', '#fr_screenreader_font_family', function(jqEvent){
				dyslexicFont = !!parseInt(screenReaderStorage.getItem('scr_dyslexicfont')) || 0;
				if(!dyslexicFont) {
					$('body').addClass('scr_dyslexic');
					if(screenReaderOptions.fontsizeSelector) {
		    			// Append to the current inline style of the element
			    		var fontsizingElements = $(screenReaderOptions.fontsizeSelector);
			    		$.each(fontsizingElements, function(index, elem){
			    			var currentInlineStyles = $(elem).attr('style') || '';
			    			$(elem).attr('style', currentInlineStyles + ';font-family:OpenDyslexic');
			    		});
					}
					dyslexicFont = 1;
				} else {
					$('body').removeClass('scr_dyslexic');
					if(screenReaderOptions.fontsizeSelector) {
		    			// Append to the current inline style of the element
			    		var fontsizingElements = $(screenReaderOptions.fontsizeSelector);
			    		$.each(fontsizingElements, function(index, elem){
			    			var currentInlineStyles = $(elem).attr('style') || '';
			    			$(elem).attr('style', currentInlineStyles.replace(';font-family:OpenDyslexic',''));
			    		});
					}
					dyslexicFont = 0;
				}
				
		    	screenReaderStorage.setItem('scr_dyslexicfont', dyslexicFont);
			});
			
			// Register events for gray hues button
			$(document).on('click', '#fr_screenreader_gray_hues', function(jqEvent){
				grayHues = !!parseInt(screenReaderStorage.getItem('scr_grayhues')) || 0;
				if(!grayHues) {
					targetFilterElement.addClass('scr_grayhues');  
					
					grayHues = 1;
				} else {
					targetFilterElement.removeClass('scr_grayhues');
					
					grayHues = 0;
				}
				
		    	screenReaderStorage.setItem('scr_grayhues', grayHues);
			});
			
			// Register events for big cursor button
			$(document).on('click', '#fr_screenreader_bigcursor', function(jqEvent){
				bigCursor = !!parseInt(screenReaderStorage.getItem('scr_bigcursor')) || 0;
				if(!bigCursor) {
					$('body').addClass('scr_bigcursor');  
					
					bigCursor = 1;
				} else {
					$('body').removeClass('scr_bigcursor');
					
					bigCursor = 0;
				}
				
		    	screenReaderStorage.setItem('scr_bigcursor', bigCursor);
			});
			
			// Register read guides
			$(document).on('click', '#fr_screenreader_reading_guides', function(jqEvent, onlyTrigger){
				var updateReadGuide = function(event) {
                    var topOffset = 0;
                    topOffset = ("touchmove" == event.type) ? event.changedTouches[0].clientY : event.y;
                    $("#sc_read_guide_bar").css('top', topOffset - 15);
                }
				
				readingGuides = !!parseInt(screenReaderStorage.getItem('scr_reading_guides')) || 0;
				if(!readingGuides || onlyTrigger) {
					$('body').addClass('scr_reading_guides');  
					
					var readingGuideElement = document.createElement("div");
					readingGuideElement.id = "sc_read_guide_bar";
					readingGuideElement.classList.add("sc_read_guide_bar");
					$('body').append(readingGuideElement);
			        document.body.addEventListener("touchmove", updateReadGuide, false),
			        document.body.addEventListener("mousemove", updateReadGuide, false);
					    
					readingGuides = 1;
				} else {
					$('body').removeClass('scr_reading_guides');
					
					$('#sc_read_guide_bar').remove();
					
					document.body.removeEventListener("touchmove", updateReadGuide, false);
			        document.body.removeEventListener("mousemove", updateReadGuide, false)
			        
					readingGuides = 0;
				}
				
		    	screenReaderStorage.setItem('scr_reading_guides', readingGuides);
			});
			
			// Register read mode
			$(document).on('click', '#fr_screenreader_readability', function(jqEvent){
				if(!readabilityMode) {
					originalHtml = $('body').clone();
					
					$('body').addClass('scr_readability');  
					
					var contentToRead = $(screenReaderOptions.readabilitySelector).html();

					// Only if some contents to transform are found, then go on
					if(contentToRead) {
						$('body').empty();
						$('body').append('<div class="sc-readability">' + contentToRead + '</div>');
					}

					readabilityMode = 1;
				} else {
					$('body').removeClass('scr_readability');
					
					$('div.sc-readability').remove();
					$('body').replaceWith(originalHtml[0]);
					
					// Reassign - rebind the body element to the local private variable
					targetFilterElement = $('body');
					
					readabilityMode = 0;
				}
			});
			
			// Register hide images
			$(document).on('click', '#fr_screenreader_hideimages', function(jqEvent, onlyTrigger){
				hideImages = !!parseInt(screenReaderStorage.getItem('scr_hideimages')) || 0;
				hideAlsoVideosIFrames = screenReaderOptions.hideAlsoVideosIframes;
				
				if(!hideImages || onlyTrigger) {
					$('body').addClass('scr_hideimages');
					if(hideAlsoVideosIFrames) {
						$('body').addClass('scr_hidevideosiframes');
					}
					hideImages = 1;
				} else {
					$('body').removeClass('scr_hideimages');
					if(hideAlsoVideosIFrames) {
						$('body').removeClass('scr_hidevideosiframes');
					}
					hideImages = 0;
				}
				
		    	screenReaderStorage.setItem('scr_hideimages', hideImages);
			});
			
			// Register events for alternate high contrast buttons, use only native CSS3 filters if available
			$(document).on('click', '#fr_screenreader_highcontrast2, #fr_screenreader_highcontrast3', applyAlternateHighContrast);

			// Register events for skip to contents button
			if(screenReaderOptions.showSkipToContents) {
				$(document).on('click', '#fr_screenreader_skiptocontents', skipToContents);
			}
		};
		
		// Simple hash function (djb2 variant)
		var hashCode = function (str) {
		    let hash = 5381;
		    for (let i = 0; i < str.length; i++) {
		        hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
		    }
		    // Convert to unsigned 32-bit integer and then to a base-36 string.
		    return (hash >>> 0).toString(36);
		};
		
		/**
		 * Accessibility enhancement fix
		 * Sub-Function to call OpenAI API for alt text generation
		 * 
		 * @access private
		 * @return Void
		 */
		var generateAltTextAI = async function (imageUrl) {
			const cacheMappingKey = "screenReaderAltMapping";
		    
		    // Retrieve the current mapping from local storage, or use an empty object.
		    let mapping = {};
		    try {
		        mapping = JSON.parse(localStorage.getItem(cacheMappingKey)) || {};
		    } catch (e) {
		        mapping = {};
		    }
		    
		    // Generate a hash key for the image URL.
		    const key = hashCode(imageUrl);
		    
		    // If a cached alt text exists, return it.
		    if (mapping[key]) {
		        return mapping[key];
		    }
		    
			const OPENAI_API_KEY = screenReaderOptions.generateMissingImagesAltChatgptApikey; 
			if(!OPENAI_API_KEY.trim()) {
				return '';
			}
			
		    const prompt = `Describe the content of this image in a short, clear sentence using the language matching the code '${screenReaderConfigOptions.langCode}': ${imageUrl}`;
		    const response = await fetch("https://api.openai.com/v1/chat/completions", {
		        method: "POST",
		        headers: {
		            "Content-Type": "application/json",
		            "Authorization": `Bearer ${OPENAI_API_KEY}`
		        },
		        body: JSON.stringify({
		            model: screenReaderOptions.generateMissingImagesAltChatgptModel,
		            messages: [{ role: "user", content: prompt }],
		            max_tokens: 50
		        })
		    });

		    if (!response.ok) {
		    	return '';
		    }
		    
		    const data = await response.json();
			const altText = data.choices[0].message.content.trim();
	        
	        // Save the generated alt text in our mapping and update local storage.
	        mapping[key] = altText;
	        localStorage.setItem(cacheMappingKey, JSON.stringify(mapping));
	        
	        return altText;
		};
		
		/**
		 * Accessibility enhancement fix
		 * Function to fix missing alt attributes for images using ChatGPT
		 * 
		 * @access private
		 * @return Void
		 */
		async function fixMissingAltText() {
		    const images = document.querySelectorAll('img:not([alt]), img[alt=""]');
		    for (const img of images) {
		        try {
		            const altText = await generateAltTextAI(img.src);
		            img.setAttribute('alt', altText);
		        } catch (error) {
		        }
		    }
		};
		
		/**
		 * Accessibility enhancement fix
		 * Function to automatically fix heading structure issues
		 * 
		 * @access private
		 * @return Void
		 */
		var fixHeadingStructure = function() {
		    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
		    let lastValidLevel = 1; // Start with H1 as the base

		    headings.forEach((heading, index) => {
		        let currentLevel = parseInt(heading.tagName.replace('H', ''), 10);

		        if (index === 0 && currentLevel !== 1) {
		            currentLevel = 1;
		        } else if (currentLevel > lastValidLevel + 1) {
		            currentLevel = lastValidLevel + 1; // Correct the level
		        }

		        if (currentLevel !== parseInt(heading.tagName.replace('H', ''), 10)) {
		            const newHeading = document.createElement(`h${currentLevel}`);
		            
		            // Preserve attributes, styles, and classes
		            Array.from(heading.attributes).forEach(attr => {
		                newHeading.setAttribute(attr.name, attr.value);
		            });

		            newHeading.innerHTML = heading.innerHTML;
		            heading.replaceWith(newHeading);
		        }

		        lastValidLevel = currentLevel;
		    });
		};
		
		/**
		 * Accessibility enhancement fix
		 * Sub-Function to check if contrast is sufficient
		 * 
		 * @access private
		 * @return Void
		 */
		var isContrastSufficient = function(bgColor, textColor) {
		    // Compute relative luminance for an RGB color
		    function luminance(r, g, b) {
		        const a = [r, g, b].map(v => {
		            v /= 255;
		            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
		        });
		        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
		    }

		    // Extracts the numeric RGB values from a color string like "rgb(255, 255, 255)"
		    function getRGB(color) {
		        return color.match(/\d+/g).map(Number);
		    }

		    const [r1, g1, b1] = getRGB(bgColor);
		    const [r2, g2, b2] = getRGB(textColor);

		    const lum1 = luminance(r1, g1, b1);
		    const lum2 = luminance(r2, g2, b2);

		    // Determine the lighter and darker luminance values
		    const lighter = Math.max(lum1, lum2);
		    const darker = Math.min(lum1, lum2);

		    const contrastRatio = (lighter + 0.05) / (darker + 0.05);

		    return contrastRatio >= 4.5; // WCAG standard for normal text
		};
		
		/**
		 * Accessibility enhancement fix
		 * Function to check and fix low contrast text
		 * 
		 * @access private
		 * @return Void
		 */
		var fixLowContrastText = function () {
		    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, li, td, th, label, button');

		    textElements.forEach((el) => {
				if (el.classList.contains('screenreader_embed_play_button')) {
		            return; // Skip this element
		        }

		        const bgColor = window.getComputedStyle(el).backgroundColor;
		        const textColor = window.getComputedStyle(el).color;

		        if (!isContrastSufficient(bgColor, textColor)) {
		            el.style.color = "#000"; // Adjust to black for better contrast
		        }
		    });
		};
		
		/**
		 * Accessibility enhancement fix
		 * Function to add role="main" to the main element if missing
		 * 
		 * @access private
		 * @return Void
		 */
		var fixMissingAriaRoles = function () {
		  // Add role="navigation" to <nav> elements if missing
		  document.querySelectorAll('nav:not([role])').forEach(el => {
			  el.setAttribute('role', 'navigation');
		  });

		  // Add role="main" to <main> elements if missing
		  const mainEl = document.querySelector('main:not([role]),#content:not([role])');
		  if (mainEl) {
			  	mainEl.setAttribute('role', 'main');
		  } else {
			  	// As a fallback, use the skip to contents selector
	    		const customMainContent = $(screenReaderOptions.skipToContentsSelector);
	    		if(customMainContent.length && !customMainContent.get(0).hasAttribute('role')) {
	    			customMainContent.get(0).setAttribute('role', 'main');
	    		}
		  	}
		};
		
		/**
		 * Accessibility enhancement fix
		 * Function to add an aria-label if missing
		 * 
		 * @access private
		 * @return Void
		 */
		var fixMissingFormLabels = function () {
			  const inputs = document.querySelectorAll('input, textarea, select');
			  
			  inputs.forEach(input => {
				  // Determine if a label exists by checking for an associated
				  // <label> or if the input is wrapped in one.
				  const id = input.getAttribute('id');
				  const hasAssociatedLabel = id ? document.querySelector(`label[for="${id}"]`) : null;
			    
				  if (!hasAssociatedLabel && !input.closest('label')) {
					  // Use the placeholder as a hint, if available.
					  const ariaText = input.getAttribute('placeholder') || 'Input field';
					  input.setAttribute('aria-label', ariaText);
				  }
			});
		};
		
		/**
		 * Accessibility enhancement fix
		 * Reorder and fix the sequence of tabindex for elements
		 * 
		 * @access private
		 * @return Void
		 */
		var validateAndFixFocusOrder = function () {
			  // Define a selector for common interactive elements.
			  const focusableSelectors = `
			    a[href],
			    area[href],
			    input:not([disabled]):not([type="hidden"]),
			    select:not([disabled]),
			    textarea:not([disabled]),
			    button:not([disabled]),
			    iframe,
			    [tabindex]:not([tabindex="-1"]),
			    [contenteditable="true"]
			  `;

			  // Get all matching elements in document order
			  let focusableElements = Array.from(document.querySelectorAll(focusableSelectors));

			  // Filter out elements that are not visible (e.g., display:none)
			  focusableElements = focusableElements.filter(el => {
			    const style = window.getComputedStyle(el);
			    return style.display !== "none" && style.visibility !== "hidden";
			  });

			  // Reassign tabindex values sequentially, starting at 1.
			  // This forces the focus order to follow the DOM order.
			  focusableElements.forEach((el, index) => {
				  // Set both the property and attribute to ensure compatibility.
				  const newTabIndex = index + 1;
				  el.tabIndex = newTabIndex;
				  el.setAttribute("tabindex", newTabIndex);
			  });
		};
		
		/**
		 * Run the accessibility fixes
		 * 
		 * @access private
		 * @return Void
		 */
		var autoFixAccessibility = function () {
		    // Fix missing alt attributes in images
			if(screenReaderOptions.generateMissingImagesAlt) {
				fixMissingAltText();
			}

		    // Automatically fix heading structure issues
			if(screenReaderOptions.fixHeadingsStructure) {
				fixHeadingStructure();
			}

		    // Check and fix low contrast text
			if(screenReaderOptions.fixLowContrastText) {
				fixLowContrastText();
			}
		    
		    // Add missing aria role attributes
			if(screenReaderOptions.fixMissingAriaRoles) {
				fixMissingAriaRoles();
			}
		    
		    // Add an aria-label if missing
			if(screenReaderOptions.fixMissingFormLabels) {
				fixMissingFormLabels();
			}
		    
		    // Fix tabindex order
			if(screenReaderOptions.validateAndFixFocusOrder) {
				validateAndFixFocusOrder();
			}
		};
		
		/**
		 * Function dummy constructor
		 * 
		 * @access private
		 * @param String
		 *            contextSelector
		 * @method <<IIFE>>
		 * @return Void
		 */
		(function __construct() {
			// Compatibility language translations fallback
			if(typeof(fr_close_toolbar) === 'undefined') {
				window.fr_close_toolbar="Close accessibility interface";
				window.fr_text_reader="Text Reader";
				window.fr_font_sizing="Font sizing";
				window.fr_accessibility_enhancements="Accessibility enhancements";
				window.fr_high_contrast_color="High contrast color";
				window.fr_reading_guides_title="Reading guide";
			}
			if(typeof(fr_dark_mode) === 'undefined') {
				window.fr_volume = 'Volume';
				window.fr_dark_mode = 'Toggle dark mode';
				window.fr_page_zoom="Page zoom"
				window.fr_pagezoom_increase="Increase zoom";
				window.fr_pagezoom_decrease="Decrease zoom";
				window.fr_pagezoom_reset="Reset zoom";
			}
			
			// Init status on load
			$.extend(screenReaderOptions, options);
			
			// Set the preferred storage
			if(screenReaderOptions.selectedStorage == 'session') {
				screenReaderStorage = window.sessionStorage;
			} else if(screenReaderOptions.selectedStorage == 'local') {
				screenReaderStorage = window.localStorage;
			}
			
			// Init target filter element
			if(screenReaderOptions.rootTarget) {
	    		targetFilterElement = $('html');
	    	}
			
			// ReInject if overridden
			if(jQuery.frTTSEngine === undefined) {
				jQuery('script[src*="tts.js"]').clone().appendTo('body');
			}
			
			// Ensure that the same background color is applied to both the body and html tag
			if(screenReaderOptions.autoBackgroundColor) {
				var bodyBGColor = $('body').css('background-color');
				$('html').css('background-color', bodyBGColor);
			}

			// Init font sizing
			fontSizeDefault = fontSizeCurrent = screenReaderOptions.fontsizeDefault;
			var sessionFontSizeCurrent = screenReaderStorage.getItem('scr_fontsize');
			if(sessionFontSizeCurrent) {
				fontSizeCurrent = sessionFontSizeCurrent;
			}
			
			// Init zoom size
			var sessionZoomSizeCurrent = screenReaderStorage.getItem('scr_zoomsize');
			if(sessionZoomSizeCurrent) {
				zoomSizeCurrent = sessionZoomSizeCurrent;
				$('html').css('zoom', zoomSizeCurrent + '%');
			}
			
			// Only if spacing size is enabled
			var spacingSizeInline = '';
			if(screenReaderOptions.spacingSize) {
				spacingSizeCurrent = parseInt(screenReaderStorage.getItem('scr_spacingsize')) || 0;
				if(spacingSizeCurrent > 0) {
					$('body').css({'word-spacing': (spacingSizeCurrent * 2) + 'px', 'letter-spacing': spacingSizeCurrent + 'px'});  
					
				}
				
				lineHeightCurrent = parseFloat(screenReaderStorage.getItem('scr_final_lineheight')) || 0;
				if(lineHeightCurrent > 0) {
					$('body').css({'line-height': lineHeightCurrent + 'px'});  
					
				}
				if(screenReaderOptions.fontsizeSelector) {
					// Append to the current inline style of the element
					spacingSizeInline = ';word-spacing:inherit;letter-spacing:inherit;line-height:inherit';
				}
			}
		    
			// Only if font sizing is enabled
			var fontSizeInline = '';
			var isfontsizeMinimizedToolbar = !!screenReaderConfigOptions.useMinimizedToolbar && !!screenReaderOptions.fontsizeMinimizedToolbar && screenReaderConfigOptions.statusMinimizedToolbar == 'closed';
			if(screenReaderOptions.fontsize && !isfontsizeMinimizedToolbar) {
				$('body').css('font-size', fontSizeCurrent + '%');
				
				if(screenReaderOptions.fontsizeSelector) {
					fontSizeInline = ';font-size:100%';
					// Manage header resize increment
					fontResizeHeaders();
				}
			}
			
			// Append to the current inline style of the element
			if(screenReaderOptions.fontsize || screenReaderOptions.spacingSize) {
				var fontsizingElements = $(screenReaderOptions.fontsizeSelector);
				$.each(fontsizingElements, function(index, elem) {
					if($.inArray(elem.nodeName.toLowerCase(), ['h1', 'h2', 'h3', 'h4']) != -1 || isfontsizeMinimizedToolbar) {
						fontSizeInline = '';
					} else {
						fontSizeInline = ';font-size:100%';
					}
					var currentInlineStyles = $(elem).attr('style') || '';
					$(elem).attr('style', rtrim(currentInlineStyles, ';') + fontSizeInline + spacingSizeInline);
				});
			}
			
	    	// Init high contrast
	    	highContrast = !!parseInt(screenReaderStorage.getItem('scr_highcontrast')) || 0;
	    	if(highContrast) {
	    		targetFilterElement.addClass('scr_highcontrast');
	    		
	    		// If IE detected, fallback on the compatibility inversion color high contrast
				if("ActiveXObject" in window) {
					startLegacyHighcontrast('body, body *:not(#accessibility-links, #accessibility-links *, div.shapes)');
				}
	    	}

	    	// Init dyslexic font
	    	dyslexicFont = !!parseInt(screenReaderStorage.getItem('scr_dyslexicfont')) || 0;
	    	if(dyslexicFont) {
	    		$('body').addClass('scr_dyslexic');
	    		if(screenReaderOptions.fontsizeSelector) {
	    			// Append to the current inline style of the element
		    		var fontsizingElements = $(screenReaderOptions.fontsizeSelector);
		    		$.each(fontsizingElements, function(index, elem){
		    			var currentInlineStyles = $(elem).attr('style') || '';
		    			$(elem).attr('style', currentInlineStyles + ';font-family:OpenDyslexic');
		    		});
				}
	    	}
	    	
	    	// Init gray hues
	    	grayHues = !!parseInt(screenReaderStorage.getItem('scr_grayhues')) || 0;
	    	if(grayHues) {
	    		targetFilterElement.addClass('scr_grayhues');
	    	}
	    	
	    	// Init big cursor
	    	bigCursor = !!parseInt(screenReaderStorage.getItem('scr_bigcursor')) || 0;
	    	if(bigCursor) {
	    		$('body').addClass('scr_bigcursor');
	    	}
	    	
	    	// Init custom text color
	    	customBackgroundColor = screenReaderStorage.getItem('scr_custom_background_color');
	    	if(screenReaderOptions.customColors && screenReaderOptions.template == 'accessible.css' && customBackgroundColor) {
	    		document.querySelector('body').style.setProperty('background', customBackgroundColor, 'important');
	    		if(screenReaderOptions.customColorsCssSelectors) {
					$(screenReaderOptions.customColorsCssSelectors).each(function(index, element){
						element.style.setProperty('background', customBackgroundColor, 'important');
					});
				}
	    		setTimeout(function(){
	    			$('#fr_screenreader_background_color span.scr-color-selection[data-scr-color="' + customBackgroundColor + '"]').addClass('scr-color-selection-enabled');
	    		}, 1);
	    	}
	    	
	    	// Init custom background color
	    	customTextColor = screenReaderStorage.getItem('scr_custom_text_color');
	    	if(screenReaderOptions.customColors && screenReaderOptions.template == 'accessible.css' && customTextColor) {
	    		document.querySelector('body').style.setProperty('color', customTextColor, 'important');
	    		if(screenReaderOptions.customColorsCssSelectors) {
					$(screenReaderOptions.customColorsCssSelectors).each(function(index, element){
						element.style.setProperty('color', customTextColor, 'important');
					});
				}
	    		setTimeout(function(){
	    			$('#fr_screenreader_text_color span.scr-color-selection[data-scr-color="' + customTextColor + '"]').addClass('scr-color-selection-enabled');
	    		}, 1);
	    	}
	    	
			// Remove links target if enabled
			if(screenReaderOptions.removeLinksTarget) {
				$('a').removeAttr('target');
			};
			
			// Add listeners for UI
			addListeners();
			
			// Check if AI based auto-fixing accessibility issue is enabled and should run
			autoFixAccessibility();
		}).call(this);
	};
		
	//On DOM Ready
	$(function() {
		function scrDetectMobile() {
			var windowOnTouch = !!('ontouchstart' in window);
			var msTouch = !!(navigator.msMaxTouchPoints);
			var hasTouch = windowOnTouch || msTouch;
			return hasTouch;
		}
		var isMobile = scrDetectMobile();
		
		if(screenReaderConfigOptions.hideOnMobile && isMobile) {
			return;
		}
		
		if(isMobile && screenReaderConfigOptions.useMobileReaderEngine) {
			if(screenReaderConfigOptions.readerEngine != screenReaderConfigOptions.mobileReaderEngine) {
				// Override if different
				screenReaderConfigOptions.readerEngine = screenReaderConfigOptions.mobileReaderEngine;
			}
			
			if(screenReaderConfigOptions.readerEngine == 'proxy' && parseInt(screenReaderConfigOptions.chunkLength) > 100) {
				screenReaderConfigOptions.chunkLength = 90;
			}
			if(screenReaderConfigOptions.readerEngine == 'proxy_virtual' && parseInt(screenReaderConfigOptions.chunkLength) >= 300) {
				screenReaderConfigOptions.chunkLength = 280;
			}
		}
		
		screenReaderConfigOptions.mobileDeviceDetected = isMobile ? true : false;
		
		// Instance controller
		window.ScreenReaderMainController = new MainController(screenReaderConfigOptions);
		
		// Build user interface
		ScreenReaderMainController.buildInterface();
		
		// Start engine once interface rendering has been completed
		ScreenReaderMainController.startTTSEngine();
	});
})(jQuery);