/**
 * Depends on extend, Draw2PNG.Color, Draw2PNG.Filter
 */
if (typeof Draw2PNG != 'object') var Draw2PNG = {};

/**
 * Creates a new color tolerance filter object through the provided original/output pixmaps/canvas. Extends from the Draw2PNG.Filter class.
 */
Draw2PNG.ColorToleranceFilter = function (original, output) {
  Draw2PNG.Filter.apply(this, [ original, output ]);
  
  this._maxToleratedColor  = new Draw2PNG.Color(0x80, 0x80, 0x80, 1.0);
  this._outputColor        = new Draw2PNG.Color(0x00, 0x00, 0x00, 1.0);
  this._backgroundColor    = new Draw2PNG.Color(0xff, 0xff, 0xff, 0.0);
  this._outputColorAllowed = true;
  this._brightness         = 0.0;
}; extend(Draw2PNG.ColorToleranceFilter, Draw2PNG.Filter);

/**
 * Returns the max tolerated color as a Draw2PNG.Color object.
 */
Draw2PNG.ColorToleranceFilter.prototype.getMaxToleratedColor = function () {
  return this._maxToleratedColor;
}

/**
 * Returns the output color as a Draw2PNG.Color object.
 */
Draw2PNG.ColorToleranceFilter.prototype.getOutputColor = function () {
  return this._outputColor;
}

/**
 * Returns the background color as a Draw2PNG.Color object.
 */
Draw2PNG.ColorToleranceFilter.prototype.getBackgroundColor = function () {
  return this._backgroundColor;
}

/**
 * Tells whether the output color is allowed or not.
 */
Draw2PNG.ColorToleranceFilter.prototype.isOutputColorAllowed = function () {
  return this._outputColorAllowed;
}

/**
 * Returns the global output brightness.
 */
Draw2PNG.ColorToleranceFilter.prototype.getBrightness = function () {
  return this._brightness;
}

/**
 * Updates the max tolerated color through a Draw2PNG.Color object.
 */
Draw2PNG.ColorToleranceFilter.prototype.setMaxToleratedColor = function (maxToleratedColor) {
  if (maxToleratedColor instanceof Draw2PNG.Color) {
    this._maxToleratedColor = maxToleratedColor;
  }
}

/**
 * Updates the output color through a Draw2PNG.Color object.
 */
Draw2PNG.ColorToleranceFilter.prototype.setOutputColor = function (outputColor) {
  if (outputColor instanceof Draw2PNG.Color) {
    this._outputColor = outputColor;
  }
}

/**
 * Updates the background color through a Draw2PNG.Color object.
 */
Draw2PNG.ColorToleranceFilter.prototype.setBackgroundColor = function (backgroundColor) {
  if (backgroundColor instanceof Draw2PNG.Color) {
    this._backgroundColor = backgroundColor;
  }
}

/**
 * Tells the filter whether to use the output color or not.
 */
Draw2PNG.ColorToleranceFilter.prototype.allowOutputColor = function (outputColorAllowed) {
  this._outputColorAllowed = (typeof outputColorAllowed == 'boolean' && outputColorAllowed) ? outputColorAllowed : false ;
}

/**
 * Updates the global output brightness in float format (-1.0 to 1.0).
 */
Draw2PNG.ColorToleranceFilter.prototype.setBrightness = function (brightness) {
  if (typeof brightness == 'number' && brightness >= -1.0 && brightness <= 1.0) {
    this._brightness = brightness;
  }
}

/**
 * Updates the global output brightness percentage (-100 to 100).
 */
Draw2PNG.ColorToleranceFilter.prototype.setBrightnessPercentage = function (brightnessPercentage) {
  if (typeof brightnessPercentage == 'number' && brightnessPercentage >= -100 && brightnessPercentage <= 100) {
    this._brightness = brightnessPercentage / 100;
  }
}

/**
 * Performs a pixel replacement search. It checks for each pixel in the original pixmap and if their bytes (except the alpha channel) are lower than the 
 * tolerated color, then they're going to be replaced by the output color if allowed or it will keep the original color otherwise. If the pixel is not lower 
 * than the tolerated color, then it's going to be replaced with the provided background color (yes, both output and background color support alpha channels).
 *
 * It also scales the global output image brightness depending on the object's brightness level.
 */
Draw2PNG.ColorToleranceFilter.prototype.apply = function () {
  this._outputPixmap.clear(this._originalPixmap.getCanvas().width, this._originalPixmap.getCanvas().height);
  var originalData = this._originalPixmap.getData();
  var outputData   = this._outputPixmap.getData();
  var length       = originalData.data.length;
  var i, redIndex, greenIndex, blueIndex, alphaIndex;
  
  for (i = 0; i < length; i += 4) {
    redIndex   = i;
    greenIndex = i + 1;
    blueIndex  = i + 2;
    alphaIndex = i + 3;
    
    if (originalData.data[ redIndex ] <= this._maxToleratedColor.getRed() && originalData.data[ greenIndex ] <= this._maxToleratedColor.getGreen() && originalData.data[ blueIndex ] <= this._maxToleratedColor.getBlue()) {
      if (this._outputColorAllowed) {
        outputData.data[ redIndex ]   = this._outputColor.getRed();
        outputData.data[ greenIndex ] = this._outputColor.getGreen();
        outputData.data[ blueIndex ]  = this._outputColor.getBlue();
        outputData.data[ alphaIndex ] = this._outputColor.getAlpha();
      } else {
        outputData.data[ redIndex ]   = originalData.data[ redIndex ];
        outputData.data[ greenIndex ] = originalData.data[ greenIndex ];
        outputData.data[ blueIndex ]  = originalData.data[ blueIndex ];
        outputData.data[ alphaIndex ] = originalData.data[ alphaIndex ];
      }
    } else {
      outputData.data[ redIndex ]   = this._backgroundColor.getRed();
      outputData.data[ greenIndex ] = this._backgroundColor.getGreen();
      outputData.data[ blueIndex ]  = this._backgroundColor.getBlue();
      outputData.data[ alphaIndex ] = this._backgroundColor.getAlpha();
    }
    
    if (this._brightness < 0.0) {
      outputData.data[ redIndex ]   += Math.round(this._brightness * outputData.data[ redIndex ]);
      outputData.data[ greenIndex ] += Math.round(this._brightness * outputData.data[ greenIndex ]);
      outputData.data[ blueIndex ]  += Math.round(this._brightness * outputData.data[ blueIndex ]);
    } else {
      outputData.data[ redIndex ]   += Math.round(this._brightness * (0xff - outputData.data[ redIndex ]));
      outputData.data[ greenIndex ] += Math.round(this._brightness * (0xff - outputData.data[ greenIndex ]));
      outputData.data[ blueIndex ]  += Math.round(this._brightness * (0xff - outputData.data[ blueIndex ]));
    }
  }
  
  this._outputPixmap.getContext().putImageData(outputData, 0, 0);
}