if (typeof Draw2PNG != 'object') var Draw2PNG = {};

/**
 * Creates a new Draw2PNG color format (byte, byte, byte, byte) through a RGBAf format (byte, byte, byte, float).
 */
Draw2PNG.Color = function (red, green, blue, alphaf) {
  if (typeof red != 'undefined') {
    this.setRed(red);
  } else {
    this._red = 255;
  }
  
  if (typeof green != 'undefined') {
    this.setGreen(green);
  } else {
    this._green = 255;
  }
  
  if (typeof blue != 'undefined') {
    this.setBlue(blue);
  } else {
    this._blue = 255;
  }
  
  if (typeof alphaf != 'undefined') {
    this.setAlphaf(alphaf);
  } else {
    this._alpha = 255;
  }
}

/**
 * Get red value in byte range 0 - 255.
 */
Draw2PNG.Color.prototype.getRed = function () {
  return this._red;
}

/**
 * Get green value in byte range 0 - 255.
 */
Draw2PNG.Color.prototype.getGreen = function () {
  return this._green;
}

/**
 * Get blue value in byte range 0 - 255.
 */
Draw2PNG.Color.prototype.getBlue = function () {
  return this._blue;
}

/**
 * Get alpha value in byte range 0 - 255.
 */
Draw2PNG.Color.prototype.getAlpha = function () {
  return this._alpha;
}

/**
 * Get alpha value in float range 0 - 1.
 */
Draw2PNG.Color.prototype.getAlphaf = function () {
  return this._alpha / 255;
}

/**
 * Set red value in byte range 0 - 255.
 */
Draw2PNG.Color.prototype.setRed = function (red) {
  if (isNaN(red) || red < 0 || red > 255) {
    throw 'InvalidColorError';
  }
  
  this._red = Math.round(red);
  
  return this;
}

/**
 * Set green value in byte range 0 - 255.
 */
Draw2PNG.Color.prototype.setGreen = function (green) {
  if (isNaN(green) || green < 0 || green > 255) {
    throw 'InvalidColorError';
  }
  
  this._green = Math.round(green);
  
  return this;
}

/**
 * Set blue value in byte range 0 - 255.
 */
Draw2PNG.Color.prototype.setBlue = function (blue) {
  if (isNaN(blue) || blue < 0 || blue > 255) {
    throw 'InvalidColorError';
  }
  
  this._blue = Math.round(blue);
  
  return this;
}

/**
 * Set alpha value in byte range 0 - 255.
 */
Draw2PNG.Color.prototype.setAlpha = function (alpha) {
  if (isNaN(alpha) || alpha < 0 || alpha > 255) {
    throw 'InvalidColorError';
  }
  
  this._alpha = Math.round(alpha);
  
  return this;
}

/**
 * Set alpha value in float range 0 - 1.
 */
Draw2PNG.Color.prototype.setAlphaf = function (alphaf) {
  if (isNaN(alphaf) || alphaf < 0 || alphaf > 1) {
    throw 'InvalidColorError';
  }
  
  this._alpha = Math.round(alphaf * 255);
  
  return this;
}

/**
 * Set the RGBA value through a RGBAf format (byte, byte, byte, float).
 */
Draw2PNG.Color.prototype.setRGBAf = function (red, green, blue, alphaf) {
  this.setRed(red);
  this.setGreen(green);
  this.setBlue(blue);
  this.setAlphaf(alphaf);
  
  return this;
}

/**
 * Same as setRGBAf but uses a color object {r, g, b, a} for the setting.
 */
Draw2PNG.Color.prototype.setRGBAfObject = function (color) {
  return this.setRGBAf(color.r, color.g, color.b, color.a);
}

/**
 * Returns a 24-bit color String in hexadecimal format (#000000 - #ffffff).
 */
Draw2PNG.Color.prototype.toHex24 = function () {
  var red   = this._red.toString(16);
  var green = this._green.toString(16);
  var blue  = this._blue.toString(16);
  
  return '#'                                    + 
    ((this._red   < 16) ? '0' + red   : red   ) + 
    ((this._green < 16) ? '0' + green : green ) + 
    ((this._blue  < 16) ? '0' + blue  : blue  );
}
