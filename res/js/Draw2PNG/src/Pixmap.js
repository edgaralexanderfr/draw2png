/**
 * Depends on toElementLocalCoords, inArray, removeFileNameExtension, Draw2PNG.Color
 */
if (typeof Draw2PNG != 'object') var Draw2PNG = {};

/**
 * Creates a new Pixmap object using the passed canvas element as reference.
 */
Draw2PNG.Pixmap = function (canvas) {
  this._canvas              = (canvas instanceof HTMLCanvasElement) ? canvas : document.createElement('canvas') ;
  this._canvas.style.width  = this._canvas.width  + 'px';
  this._canvas.style.height = this._canvas.height + 'px';
  this._context             = this._canvas.getContext('2d');
  this._data                = null;
  this._image               = null;
  this._zoom                = 1.0;
  this._zoomDelta           = 0.1;
  this._minZoom             = 0.1;
  this._maxZoom             = 2.0;
  this._supportedTypes      = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif', 'image/bmp'];
  this._fileReader          = null;
  this._file                = null;
  
  this.onImageLoadError     = null;
  this.onImageLoadComplete  = null;
  this.onFileReadError      = null;
}

/**
 * Get the pixmap canvas object.
 */
Draw2PNG.Pixmap.prototype.getCanvas = function () {
  return this._canvas;
}

/**
 * Get the pixmap canvas context.
 */
Draw2PNG.Pixmap.prototype.getContext = function () {
  return this._context;
}

/**
 * Returns the pixmap canvas image data.
 *
 * Keep in mind that there's a potential memory leak everytime a new data is gotten, it seems like gargabe collector doesn't act properly or instantly when
 * the data buffers are no longer referenced, there are tricks to reduce this leak, like not creating new images datas everytime but re-using them (of course, 
 * if a new image is loaded, the old buffer will still be allocated, no matter if it's assigned to null or not, so... there's no way out).
 */
Draw2PNG.Pixmap.prototype.getData = function () {
  return (this._data instanceof ImageData) ? this._data : (this._data = this._context.getImageData(0, 0, this._canvas.width, this._canvas.height)) ;
}

/**
 * Returns the pixmap Image instance.
 */
Draw2PNG.Pixmap.prototype.getImage = function () {
  return (this._image instanceof HTMLImageElement) ? this._image : (this._image = new Image) ;
}

/**
 * Returns the current pixmap zoom.
 */
Draw2PNG.Pixmap.prototype.getZoom = function () {
  return this._zoom;
}

/**
 * Returns the pixmap zoom delta.
 */
Draw2PNG.Pixmap.prototype.getZoomDelta = function () {
  return this._zoomDelta;
}

/**
 * Returns the pixmap min zoom.
 */
Draw2PNG.Pixmap.prototype.getMinZoom = function () {
  return this._minZoom;
}

/**
 * Returns the pixmap max zoom.
 */
Draw2PNG.Pixmap.prototype.getMaxZoom = function () {
  return this._maxZoom;
}

/**
 * Returns the supported image types array.
 */
Draw2PNG.Pixmap.prototype.getSupportedTypes = function () {
  return this._supportedTypes;
}

/**
 * Returns the pixmap FileReader instance.
 */
Draw2PNG.Pixmap.prototype.getFileReader = function () {
  return (this._fileReader instanceof FileReader) ? this._fileReader : (this._fileReader = new FileReader) ;
}

/**
 * Returns the File object from the last successfully loaded file or null instead.
 */
Draw2PNG.Pixmap.prototype.getFile = function () {
  return this._file;
}

/**
 * Returns the file name from the last successfully loaded file or an empty String instead.
 */
Draw2PNG.Pixmap.prototype.getFileName = function () {
  return (this._file != null) ? this._file.name : '' ;
}

/**
 * Returns the file name from the last successfully loaded file without its extension.
 */
Draw2PNG.Pixmap.prototype.getFileNameWithoutExtension = function () {
  return removeFileNameExtension(this.getFileName());
}

/**
 * Updates the pixmap zoom.
 */
Draw2PNG.Pixmap.prototype.setZoom = function (zoom) {
  if (isNaN(zoom)) {
    return;
  }
  
  if (zoom < this._minZoom) {
    this._zoom = this._minZoom;
  } else 
  if (zoom > this._maxZoom) {
    this._zoom = this._maxZoom;
  } else {
    this._zoom = zoom;
  }
  
  this.scaleToZoom();
}

/**
 * Updates the pixmap zoom delta.
 */
Draw2PNG.Pixmap.prototype.setZoomDelta = function (zoomDelta) {
  if (!(isNaN(zoomDelta)) && zoomDelta >= 0) {
    this._zoomDelta = zoomDelta;
  }
}

/**
 * Updates the pixmap min zoom.
 */
Draw2PNG.Pixmap.prototype.setMinZoom = function (minZoom) {
  if (!(isNaN(minZoom)) && minZoom > 0 && minZoom <= this._maxZoom) {
    this._minZoom = minZoom;
  }
}

/**
 * Updates the pixmap max zoom.
 */
Draw2PNG.Pixmap.prototype.setMaxZoom = function (maxZoom) {
  if (!(isNaN(maxZoom)) && maxZoom > 0 && maxZoom >= this._minZoom) {
    this._maxZoom = maxZoom;
  }
}

/**
 * Performs a zoom-in based on the pixmap current zoom, zoom delta, min zoom and max zoom.
 */
Draw2PNG.Pixmap.prototype.zoomIn = function () {
  this.setZoom(this._zoom + this._zoomDelta);
}

/**
 * Performs a zoom-out based on the pixmap current zoom, zoom delta, min zoom and max zoom.
 */
Draw2PNG.Pixmap.prototype.zoomOut = function () {
  this.setZoom(this._zoom - this._zoomDelta);
}

/**
 * Adjusts the canvas CSS dimensions (they don't affect the canvas real dimensions) depending on the current zoom level.
 */
Draw2PNG.Pixmap.prototype.scaleToZoom = function () {
  this._canvas.style.width  = Math.round(this._canvas.width  * this._zoom) + 'px';
  this._canvas.style.height = Math.round(this._canvas.height * this._zoom) + 'px';
}

/**
 * Updates the supported image types array.
 */
Draw2PNG.Pixmap.prototype.setSupportedTypes = function (supportedTypes) {
  if (typeof supportedTypes == 'object') {
    this._supportedTypes = supportedTypes;
  }
}

/**
 * Clears up the pixmap canvas. If newWidth or newHeight are provided, the canvas will be resized to the specified size.
 */
Draw2PNG.Pixmap.prototype.clear = function (newWidth, newHeight) {
  this.disposeData();
  this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
  
  if (typeof newWidth == 'number') {
    this._canvas.width  = newWidth;
  }
  
  if (typeof newHeight == 'number') {
    this._canvas.height = newHeight;
  }
}

/**
 * Draws the provided image onto the pixmap canvas resizing it to the image size.
 */
Draw2PNG.Pixmap.prototype.setImage = function (image) {
  if (!(image instanceof HTMLImageElement)) {
    throw 'InvalidTypeError';
  }
  
  this._image = image;
  this.clear(this._image.width, this._image.height);
  this.setZoom(1.0);
  this._context.drawImage(this._image, 0, 0, this._image.width, this._image.height);
}

/**
 * Calls setImage but providing a created image through an URL.
 */
Draw2PNG.Pixmap.prototype.setImageFromURL = function (url) {
  if (typeof url != 'string') {
    if (typeof this.onImageLoadError == 'function') {
      this.onImageLoadError('InvalidTypeError');
    }
    
    return;
  }
  
  var $this = this;
  var image = this.getImage();
  
  image.onload = function (event) {
    try {
      $this.setImage(image);
      
      if (typeof $this.onImageLoadComplete == 'function') {
        $this.onImageLoadComplete();
      }
    } catch (error) {
      if (typeof $this.onImageLoadError == 'function') {
        $this.onImageLoadError(error);
      }
    }
  }
  
  image.onerror = function (event) {
    if (typeof $this.onImageLoadError == 'function') {
      $this.onImageLoadError('ImageNotLoadedError');
    }
  }
  
  image.src = url;
}

/**
 * Load the provided File object 'asynchronously', getting it's data URI and setting it to the pixmap image. It listens to onFileReadError callback and you 
 * can provide other useful callbacks like onImageLoadError or onImageLoadComplete.
 */
Draw2PNG.Pixmap.prototype.loadFromFile = function (file) {
  if (!(file instanceof File)) {
    if (typeof this.onFileReadError == 'function') {
      this.onFileReadError('InvalidTypeError');
    }
    
    return;
  }
  
  if (!this.hasSupportedType(file)) {
    if (typeof this.onFileReadError == 'function') {
      this.onFileReadError('InvalidImageTypeError');
    }
    
    return;
  }
  
  var $this      = this;
  var fileReader = this.getFileReader();
  
  fileReader.onerror = function (event) {
    if (typeof $this.onFileReadError == 'function') {
      $this.onFileReadError('FileReadError');
    }
  }
  
  fileReader.onloadend = function (event) {
    var previousOnImageLoadComplete = $this.onImageLoadComplete;
    
    $this.onImageLoadComplete = function () {
      $this.onImageLoadComplete = previousOnImageLoadComplete;
      $this._file               = file;
      
      if (typeof $this.onImageLoadComplete == 'function') {
        $this.onImageLoadComplete();
      }
    }
    
    $this.setImageFromURL(fileReader.result);
  }
  
  fileReader.readAsDataURL(file);
}

/**
 * Load the first File object provided in a FileList (there must be one file contained in the list at least).
 */
Draw2PNG.Pixmap.prototype.loadFirstFromFileList = function (fileList) {
  if (!(fileList instanceof FileList)) {
    if (typeof this.onFileReadError == 'function') {
      this.onFileReadError('InvalidTypeError');
    }
    
    return;
  }
  
  if (fileList.length == 0) {
    if (typeof this.onFileReadError == 'function') {
      this.onFileReadError('NoFileProvidedError');
    }
    
    return;
  }
  
  this.loadFromFile(fileList[0]);
}

/**
 * Returns the pixel in the requested coordinate.
 */
Draw2PNG.Pixmap.prototype.getPixel = function (x, y) {
  if (isNaN(x) || isNaN(y) || x < 0 || x >= this._canvas.width || y < 0 || y >= this._canvas.height) {
    throw 'InvalidPixelCoordError';
  }
  
  var data  = this.getData();
  var index = (Math.round(x) + (Math.round(y) * this._canvas.width)) * 4;
  var color = new Draw2PNG.Color;
  color.setRed(data.data[ index ]);
  color.setGreen(data.data[ index + 1 ]);
  color.setBlue(data.data[ index + 2 ]);
  color.setAlpha(data.data[ index + 3 ]);
  
  return color;
}

/**
 * Returns the pixel in the requested coordinate but considering X and Y as global coordinates and removing the canvas offset.
 */
Draw2PNG.Pixmap.prototype.getPixelWithoutCanvasOffset = function (x, y) {
  var localCoords = toElementLocalCoords(this._canvas, x, y);
  
  return this.getPixel(Math.floor(localCoords.x), Math.floor(localCoords.y));
}

/**
 * Tells whether the last successfully loaded file object has a supported image type or not.
 */
Draw2PNG.Pixmap.prototype.hasSupportedType = function (file) {
  return (file instanceof File) ? inArray(this._supportedTypes, file.type) : false ;
}

/**
 * Nullifies the pixmap canvas image data so it can be de-referenced and garbage collected.
 */
Draw2PNG.Pixmap.prototype.disposeData = function () {
  this._data = null;
}

/**
 * Nullifies the pixmap image so it can be de-referenced and garbage collected.
 */
Draw2PNG.Pixmap.prototype.disposeImage = function () {
  this._image = null;
}

/**
 * Nullifies the pixmap file reader so it can be de-referenced and garbage collected.
 */
Draw2PNG.Pixmap.prototype.disposeFileReader = function () {
  this._fileReader = null;
}

/**
 * Dereferences all the allocated resources so they can be garbage collected.
 */
Draw2PNG.Pixmap.prototype.dispose = function () {
  this.disposeData();
  this.disposeImage();
  this.disposeFileReader();
}