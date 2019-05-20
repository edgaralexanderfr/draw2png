/**
 * Depends on jQuery 1.11.3, openLink, downloadFile, Draw2PNG.Color, Draw2PNG.ColorToleranceFilter
 */
$(document).ready(function (event) {
  var ZOOM_KEY_CODE                      = 90; // Z
  var ZOOM_IN_KEY_CODE                   = 73; // I
  var ZOOM_OUT_KEY_CODE                  = 79; // O
  var RESET_ZOOM_KEY_CODE                = 82; // R
  var TOGGLE_HELP_WINDOW_KEY_CODE        = 72; // H
  var COLOR_TOLERANCE_SLIDER_LOCK_TIME   = 30;
  var INSTANT_PROCESSING_MIN_LOCK_TIME   = 500;
  var INSTANT_PROCESSING_MAX_LOCK_TIME   = 3000;
  var INSTANT_PROCESSING_COOKIE_LIFETIME = 3600 * 24 * 365 * 1000;
  var INSTANT_PROCESSING_COOKIE_NAME     = 'instantProcessing';
  var EXPORT_AS_PNG                      = 0;
  var EXPORT_AS_JPEG                     = 1;
  var LANGUAGE_JSON_LIST                 = [
    {
      name : 'es', 
      url  : 'res/json/lang/es.json'
    }
  ];
  
  var originalImageCanvas                = document.getElementById('originalImageCanvas');
  var outputImageCanvas                  = document.getElementById('outputImageCanvas');
  var filter                             = new Draw2PNG.ColorToleranceFilter(originalImageCanvas, outputImageCanvas);
  var language                           = new Language;
  var zoomKeyPressed                     = false;
  var colorToleranceSliderLocked         = false;
  var instantProcessing                  = true;
  var instantProcessingLocked            = false;
  var mouseOverOriginalImageWindow       = false;
  var mouseOverProcessedImageWindow      = false;
  var brightnessPercentage               = 0;
  var processingTime                     = 500;
  filter.getOriginalPixmap().setImageFromURL('res/img/original-image-placeholder.jpg');
  filter.getOutputPixmap().setImageFromURL('res/img/output-image-placeholder.png');
  
  /**
   * Set the global cursor as default.
   */
  function setDefaultCursor () {
    $(document.body).css('cursor', 'default');
  }
  
  /**
   * Set the global cursor as wait.
   */
  function setWaitCursor () {
    $(document.body).css('cursor', 'wait');
  }
  
  /**
   * Resize the display windows filling their heights according to the available/left window height.
   */
  function resizeGUIComponents () {
    var appPanelHeight                = $('#appPanel').outerHeight(true);
    var displayWindowsContainerHeight = $(window).outerHeight(true) - appPanelHeight;
    
    if (displayWindowsContainerHeight > appPanelHeight) {
      $('#displayWindowsContainer').css('height', (displayWindowsContainerHeight - 2) + 'px');
    } else {
      $('#displayWindowsContainer').css('height', appPanelHeight + 'px');
    }
    
    $('.appWindowContent').each(function () {
      var height = $(this).parent().outerHeight() - $(this).prev().outerHeight(true) - 2;
      
      if (height < 0) {
        height = 0;
      }
      
      $(this).css('height', height + 'px');
    });
  }
  
  /**
   * Shows the help window.
   */
  function showHelpWindow () {
    $('.appWindowBackground').css('display', 'block');
    $('#helpWindowContainer').css('display', 'block');
    resizeGUIComponents();
  }
  
  /**
   * Hides the help window.
   */
  function hideHelpWindow () {
    $('.appWindowBackground').css('display', 'none');
    $('#helpWindowContainer').css('display', 'none');
  }
  
  /**
   * Toggles the help window.
   */
  function toggleHelpWindow () {
    if ($('#helpWindowContainer').css('display') == 'none') {
      showHelpWindow();
    } else {
      hideHelpWindow();
    }
  }
  
  /**
   * Displays the transparent 'drop file' message.
   */
  function showDropFileMessage () {
    hideHelpWindow();
    $('#dropFileMessage').css('display', 'block');
  }
  
  /**
   * Hides the transparent 'drop file' message.
   */
  function hideDropFileMessage () {
    $('#dropFileMessage').css('display', 'none');
  }
  
  /**
   * Open the first file provided (via drag and drop or input selection), and then fits both canvas to the same size/zoom.
   */
  function openFirstFromFileList (fileList) {
    if (fileList.length == 0) {
      return;
    }
    
    filter.onLoadError = function (error) {
      switch (error) {
        case    'NoFileProvidedError'   : bootbox.alert(language.getText('t45')) ; break;
        case    'InvalidImageTypeError' : bootbox.alert(language.getText('t46')) ; break;
        case    'FileReadError'         : bootbox.alert(language.getText('t47')) ; break;
        case    'ImageNotLoadedError'   : bootbox.alert(language.getText('t48')) ; break;
        default                         : bootbox.alert(language.getText('t49')) ;
      }
      
      setDefaultCursor();
    }
    
    filter.onLoadComplete = function () {
      filter.getOutputPixmap().clear(filter.getOriginalPixmap().getCanvas().width, filter.getOriginalPixmap().getCanvas().height);
      filter.getOutputPixmap().setZoom(1.0);
      setDefaultCursor();
    }
    
    setWaitCursor();
    filter.openFirstFromFileList(fileList);
  }
  
  /**
   * Set all the menubar's properties and then applies the filter.
   */
  function process () {
    var startTime = Date.now();
    
    filter.setMaxToleratedColor(new Draw2PNG.Color().setRGBAfObject($('#colorTolerancePicker').data('colorpicker').color.toRGB()));
    filter.setOutputColor(new Draw2PNG.Color().setRGBAfObject($('#outputColorPicker').data('colorpicker').color.toRGB()));
    filter.setBackgroundColor(new Draw2PNG.Color().setRGBAfObject($('#backgroundColorPicker').data('colorpicker').color.toRGB()));
    filter.allowOutputColor($('#outputColorCheckbox').is(':checked'));
    filter.setBrightnessPercentage(brightnessPercentage);
    filter.apply();
    
    processingTime = Date.now() - startTime;
  }
  
  /**
   * Makes a preview in a new tab from the current output canvas.
   */
  function previewInNewTab () {
    var pixmap      = filter.getOutputPixmap();
    var canvas      = pixmap.getCanvas();
    var link        = canvas.toDataURL();
    var win         = window.open();
    var html        = 
      '<!DOCTYPE html>'                                                                                                                                                                                               + 
      '<html lang="en">'                                                                                                                                                                                              + 
      '<head>'                                                                                                                                                                                                        + 
      '    <meta charset="UTF-8">'                                                                                                                                                                                    + 
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0">'                                                                                                                                    + 
      '    <meta http-equiv="X-UA-Compatible" content="ie=edge">'                                                                                                                                                     + 
      '    <meta name="theme-color" content="#399ed1">'                                                                                                                                                               + 
      '    <link rel="shortcut icon" href="res/img/favicon.ico" />'                                                                                                                                                   + 
      '    <title>Draw2PNG v1.3.0</title>'                                                                                                                                                                            + 
      '</head>'                                                                                                                                                                                                       + 
      '<body style="margin: 4px; background: #bbb;">'                                                                                                                                                                              + 
      '    <div style="margin: 0px auto; width:  ' + canvas.width + 'px; height: ' + canvas.height + 'px; background-image : url(res/img/output-image-canvas-background.jpg); background-position : center center;">' + 
      '        <img width="' + canvas.width + '" height="' + canvas.height + '" src="' + link + '" alt="Preview image" />'                                                                                            + 
      '    <div>'                                                                                                                                                                                                     + 
      '</body>'                                                                                                                                                                                                       + 
      '</html>';
    
    if (win) {
      win.document.write(html);
    }
  }
  
  /**
   * If the zoom key is being pressed, zooms in/out the original/processed images windows depending on where the cursor is. In case the cursor is out of 
   * both windows, the zoom will be applied to both.
   */
  function zoom (zoomIn) {
    if (!zoomKeyPressed) {
      return;
    }
    
    if (mouseOverOriginalImageWindow) {
      zoomPixmap(filter.getOriginalPixmap(), zoomIn);
    } else 
    if (mouseOverProcessedImageWindow) {
      zoomPixmap(filter.getOutputPixmap(), zoomIn);
    } else {
      zoomPixmap(filter.getOriginalPixmap(), zoomIn);
      zoomPixmap(filter.getOutputPixmap(), zoomIn);
    }
  }

  /**
   * Zooms in/out the provided Pixmap.
   */
  function zoomPixmap (pixmap, zoomIn) {
    var zoomSign = (zoomIn) ? 1 : -1 ;
    
    pixmap.setZoom(
      pixmap.getZoom() + (pixmap.getZoomDelta() * zoomSign)
    );
  }
  
  /**
   * If the zoom key is being pressed, resets the zoom to 1.0 in the original/processed images windows depending on where the cursor is. In case the 
   * cursor is out of both windows, both windows will be reset.
   */
  function resetZoom () {
    if (!zoomKeyPressed) {
      return;
    }
    
    if (mouseOverOriginalImageWindow) {
      filter.getOriginalPixmap().setZoom(1.0);
    } else 
    if (mouseOverProcessedImageWindow) {
      filter.getOutputPixmap().setZoom(1.0);
    } else {
      filter.getOriginalPixmap().setZoom(1.0);
      filter.getOutputPixmap().setZoom(1.0);
    }
  }
  
  /**
   * Exports the output canvas image with the specified image format (PNG by default), prompting an input dialog with a default file name.
   */
  function exportDraw (format) {
    var promptMessage, extension, type;
    
    switch (format) {
      case EXPORT_AS_JPEG : {
        promptMessage = language.getText('t50');
        extension     = '.jpg';
        type          = 'image/jpeg';
      } ; break;
      default             : {
        promptMessage = language.getText('t51');
        extension     = '.png';
        type          = 'image/png';
      } ;
    }
    
    var lastFileName = filter.getOriginalPixmap().getFileNameWithoutExtension();
    
    var dialog = bootbox.prompt(promptMessage, function (result) {
      if (result != null && result != '') {
        filter.getOutputPixmap().getCanvas().toBlob(function (blob) {
          downloadFile(result + extension, type, blob);
        });
      }
    });
    
    var input = dialog.find('input');
    input.val((lastFileName != '') ? lastFileName + language.getText('t52') : language.getText('t53') );
    input.get(0).select();
    input.get(0).onkeyup = function (event) {
      event.stopPropagation();
    }
  }

  /**
   * Checks the instant processing state for calling and locking the auto-processing function.
   */
  function instantProcess () {
    if (!instantProcessing || instantProcessingLocked) {
      return;
    }

    instantProcessingLocked = true;
    process();
    
    var lockTime = Math.min(
      Math.max(processingTime, INSTANT_PROCESSING_MIN_LOCK_TIME), 
      INSTANT_PROCESSING_MAX_LOCK_TIME
    );

    setTimeout(function () {
      instantProcessingLocked = false;
    }, lockTime);
  }
  
  /**
   * Hooks up the window scroll so the user can zoom in/out each canvas with the mouse wheel while he/she presses the zoom key.
   */
  $(window).bind('mousewheel DOMMouseScroll', function (event) {
    if (!zoomKeyPressed) {
      return;
    }
    
    var wheelDelta = (event.type == 'mousewheel') ? event.originalEvent.wheelDelta : -event.originalEvent.detail ;
    zoom(wheelDelta >= 0);
  })
  
  /**
   * Hooks up the zoom key state to true in case the key is being pressed.
   */
  $(window).keydown(function (event) {
    if (event.which == ZOOM_KEY_CODE) {
      event.preventDefault();
      zoomKeyPressed = true;
    }
  });
  
  /**
   * Hooks up the zoom key state to false in case the key is being released.
   */
  $(window).keyup(function (event) {
    switch (event.which) {
      case ZOOM_KEY_CODE               : {
        event.preventDefault();
        zoomKeyPressed = false;
      } ; break;
      case ZOOM_IN_KEY_CODE            : {
        event.preventDefault();
        zoom(true);
      } ; break;
      case ZOOM_OUT_KEY_CODE           : {
        event.preventDefault();
        zoom(false);
      } ; break;
      case RESET_ZOOM_KEY_CODE         : {
        event.preventDefault();
        resetZoom();
      } ; break;
      case TOGGLE_HELP_WINDOW_KEY_CODE : {
        event.preventDefault();
        toggleHelpWindow();
      }
    }
  });
  
  /**
   * Resize the display windows filling their heights according to the available/left window height.
   */
  $(window).resize(function (event) {
    resizeGUIComponents();
  });
  
  /**
   * Shows the transparent 'drop file' message as soon as the user starts dragging a file onto the window.
   */
  $(window).on('dragenter', function (event) {
    event.preventDefault();
    showDropFileMessage();
  });
  
  /**
   * Provides the drop effect so the 'copy' message is displayed beside the dragged file.
   */
  $(window).on('dragover', function (event) {
    event.preventDefault();
    event.originalEvent.dataTransfer.dropEffect = 'copy';
  });
  
  /**
   * Performed as soon as the user drops the dragged file into de window.
   */
  $(window).on('drop', function (event) {
    event.preventDefault();
    hideDropFileMessage();
    openFirstFromFileList(event.originalEvent.dataTransfer.files);
  });
  
  /**
   * Avoids the inputs key-up events propagation.
   */
  $('input').keyup(function (event) {
    event.stopPropagation();
  });
  
  /**
   * Hides the transparent 'drop file' message as soon as the user starts dragging the file outside the window.
   */
  $('#dropFileMessage').on('dragleave', function (event) {
    hideDropFileMessage();
  });
  
  /**
   * Calls the function for closing the help window.
   */
  $('#helpWindowCloseButton').click(function () {
    hideHelpWindow();
  });
  
  /**
   * Prompts the file selection dialog when clicking the 'open file' link.
   */
  $('#openFileLink').click(function (event) {
    event.preventDefault();
    $('#fileInput').click();
  });
  
  /**
   * Calls the export function in order to export the output canvas as PNG.
   */
  $('#exportAsPngLink').click(function (event) {
    event.preventDefault();
    exportDraw(EXPORT_AS_PNG);
  });
  
  /**
   * Calls the export function in order to export the output canvas as JPEG.
   */
  $('#exportAsJpegLink').click(function (event) {
    event.preventDefault();
    exportDraw(EXPORT_AS_JPEG);
  });
  
  /**
   * Translates the interface language to english when user clicks on the english lang link.
   */
  $('#englishLangLink').click(function (event) {
    event.preventDefault();
    language.setName('en');
    language.translateDOM(true);
  });
  
  /**
   * Translates the interface language to spanish when user clicks on the spanish lang link.
   */
  $('#spanishLangLink').click(function (event) {
    event.preventDefault();
    language.setName('es');
    language.translateDOM(true);
  });

  /**
   * Enables instant processing when user clicks on the 'Enable instant processing' link.
   */
  $('#enableInstantProcessingLink').click(function (event) {
    event.preventDefault();
    instantProcessing = true;
    setCookie(INSTANT_PROCESSING_COOKIE_NAME, 'true', INSTANT_PROCESSING_COOKIE_LIFETIME);
  });

  /**
   * Disables instant processing when user clicks on the 'Disables instant processing' link.
   */
  $('#disableInstantProcessingLink').click(function (event) {
    event.preventDefault();
    instantProcessing = false;
    setCookie(INSTANT_PROCESSING_COOKIE_NAME, 'false', INSTANT_PROCESSING_COOKIE_LIFETIME);
  });

  /**
   * Zooms in the original/processed images windows when user clicks on the 'Zoom in all' link.
   */
  $('#zoomInAllLink').click(function (event) {
    event.preventDefault();
    
    zoomPixmap(filter.getOriginalPixmap(), true);
    zoomPixmap(filter.getOutputPixmap(), true);
  });

  /**
   * Zooms out the original/processed images windows when user clicks on the 'Zoom out all' link.
   */
  $('#zoomOutAllLink').click(function (event) {
    event.preventDefault();
    
    zoomPixmap(filter.getOriginalPixmap(), false);
    zoomPixmap(filter.getOutputPixmap(), false);
  });

  /**
   * Resets the zoom of the original/processed images windows when user clicks on the
   * 'Reset all' link.
   */
  $('#resetAllZoomLink').click(function (event) {
    event.preventDefault();
    
    filter.getOriginalPixmap().setZoom(1.0);
    filter.getOutputPixmap().setZoom(1.0);
  });

  /**
   * Zooms in the original image window when user clicks on the 'Zoom in original' link.
   */
  $('#zoomInOriginalLink').click(function (event) {
    event.preventDefault();
    
    zoomPixmap(filter.getOriginalPixmap(), true);
  });

  /**
   * Zooms out the original image window when user clicks on the 'Zoom out original' link.
   */
  $('#zoomOutOriginalLink').click(function (event) {
    event.preventDefault();
    
    zoomPixmap(filter.getOriginalPixmap(), false);
  });

  /**
   * Resets the zoom of the original image window when user clicks on the
   * 'Reset original' link.
   */
  $('#resetOriginalZoomLink').click(function (event) {
    event.preventDefault();
    
    filter.getOriginalPixmap().setZoom(1.0);
  });

  /**
   * Zooms in the processed image window when user clicks on the 'Zoom in result' link.
   */
  $('#zoomInResultLink').click(function (event) {
    event.preventDefault();
    
    zoomPixmap(filter.getOutputPixmap(), true);
  });

  /**
   * Zooms out the processed image window when user clicks on the 'Zoom out result' link.
   */
  $('#zoomOutResultLink').click(function (event) {
    event.preventDefault();
    
    zoomPixmap(filter.getOutputPixmap(), false);
  });

  /**
   * Resets the zoom of the processed image window when user clicks on the
   * 'Reset result' link.
   */
  $('#resetResultZoomLink').click(function (event) {
    event.preventDefault();
    
    filter.getOutputPixmap().setZoom(1.0);
  });
  
  /**
   * Calls the function for opening the help window.
   */
  $('#manualLink').click(function (event) {
    event.preventDefault();
    showHelpWindow();
  });
  
  /**
   * Hooks up the HTML file input change.
   */
  $('#fileInput').change(function (event) {
    openFirstFromFileList($('#fileInput').get(0).files);
  });
  
  /**
   * Updates the color tolerance slider depending on the byte average from the selected color. The update time is given by the 
   * COLOR_TOLERANCE_SLIDER_LOCK_TIME so there's no unnecessary overhead caused by the color tolerance picker.
   */
  $('#colorTolerancePicker').on('changeColor', function (event) {
    if (colorToleranceSliderLocked) {
      return;
    }
    
    colorToleranceSliderLocked = true;
    var color                  = $('#colorTolerancePicker').data('colorpicker').color.toRGB();
    var percentage             = Math.round((((color.r + color.g + color.b) / 3) * 100) / 255);
    $('#colorToleranceSlider').slider('setValue', percentage);
    
    instantProcess();
    
    setTimeout(function () {
      colorToleranceSliderLocked = false;
    }, COLOR_TOLERANCE_SLIDER_LOCK_TIME);
  });
  
  /**
   * Changes the color tolerance as gray level when a slide occurs.
   */
  $('#colorToleranceSlider').on('slide', function (event) {
    var grayLevel    = Math.round((event.value * 255) / 100);
    var grayLevelHex = grayLevel.toString(16);
    
    if (grayLevel < 16) {
      grayLevelHex = '0' + grayLevelHex;
    }
    
    $('#colorTolerancePicker').colorpicker('setValue', '#' + grayLevelHex + grayLevelHex + grayLevelHex);
  });

  /**
   * Calls the instant processing function when user toggles the output colour.
   */
  $('#outputColorCheckbox').change(function (event) {
    instantProcess();
  });

  /**
   * Calls the instant processing function when user changes the output colour.
   */
  $('#outputColorPicker').on('changeColor', function (event) {
    instantProcess();
  });
  
  /**
   * Calls the instant processing function when user changes the background colour.
   */
  $('#backgroundColorPicker').on('changeColor', function (event) {
    instantProcess();
  });
  
  /**
   * Updates the brightness percentage to set when processing the image when user slides the brightness slider.
   */
  $('#brightnessSlider').on('slide', function (event) {
    brightnessPercentage = event.value;
    instantProcess();
  });
  
  /**
   * Calls the process function as soon as the button is clicked.
   */
  $('#processButton').click(function (event) {
    process();
  });
  
  /**
   * Calls the preview in new window function as soo as the button is clicked.
   */
  $('#previewInNewTabButton').click(function (event) {
    previewInNewTab();
  });
  
  /**
   * Updates the mouse status to OVER when the user enters the cursor above the original image window.
   */
  $('#originalImageWindow').mouseenter(function (event) {
    mouseOverOriginalImageWindow = true;
  });
  
  /**
   * Updates the mouse status to NOT OVER when the user leaves the cursor from the original image window.
   */
  $('#originalImageWindow').mouseleave(function (event) {
    mouseOverOriginalImageWindow = false;
  });
  
  /**
   * Updates the mouse status to OVER when the user enters the cursor above the processed image window.
   */
  $('#processedImageWindow').mouseenter(function (event) {
    mouseOverProcessedImageWindow = true;
  });
  
  /**
   * Updates the mouse status to NOT OVER when the user leaves the cursor from the processed image window.
   */
  $('#processedImageWindow').mouseleave(function (event) {
    mouseOverProcessedImageWindow = false;
  });
  
  /**
   * Set the color tolerance picker color through the eyedropper tool.
   */
  $('#originalImageCanvas').click(function (event) {
    $('#colorTolerancePicker').colorpicker('setValue', 
      filter.getOriginalPixmap().getPixelWithoutCanvasOffset(event.clientX, event.clientY).toHex24()
    );
  });
  
  $('#outputColorPicker').colorpicker({
    format : 'rgba'
  });
  
  $('#colorTolerancePicker').colorpicker({
    format : 'rgba'
  });
  
  $('#backgroundColorPicker').colorpicker({
    format : 'rgba', 
    color  : 'rgba(255,255,255,0)'
  });
  
  $('#colorToleranceSlider').slider();
  $('#brightnessSlider').slider();
  $('[data-toggle="tooltip"]').tooltip();
  resizeGUIComponents();
  
  /**
   * Load the last set language from the cookie, translates the DOM to the initialized language and displays the main UI components when the language list 
   * is loaded.
   */
  language.onLoadComplete = function () {
    language.setNameFromCookie();
    language.translateDOM(true);
    
    $('#appPanel').css({
      visibility : 'visible'
    });
    
    $('#displayWindowsContainer').css({
      visibility : 'visible'
    });
  }
  
  /**
   * In case any language file couldn't be downloaded, a message pops-up and the page will be refreshed when user clicks 'OK'.
   */
  language.onLoadError = function (name, url) {
    bootbox.alert('The language \'' + name + '\' couldn\'t be downloaded from \'' + url + '\'. Please try again...', function () {
      window.location.reload();
    });
  }
  
  language.loadFromJSONList(LANGUAGE_JSON_LIST);
  language.loadDOMTextAsLanguage('en');
  language.setName('en');
  language.saveCookie(true);

  if (getCookie(INSTANT_PROCESSING_COOKIE_NAME) == '') {
    setCookie(INSTANT_PROCESSING_COOKIE_NAME, 'true', INSTANT_PROCESSING_COOKIE_LIFETIME);
  }

  instantProcessing = (getCookie(INSTANT_PROCESSING_COOKIE_NAME) == 'true');
});