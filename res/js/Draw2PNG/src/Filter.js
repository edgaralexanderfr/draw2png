/**
 * Depends on Draw2PNG.Pixmap
 */
if (typeof Draw2PNG != 'object') var Draw2PNG = {};

/**
 * Base class for filters where the original/output pixmaps are hooked.
 */
Draw2PNG.Filter = function (original, output) {
  this._originalPixmap = (original instanceof Draw2PNG.Pixmap) ? original : new Draw2PNG.Pixmap(original) ;
  this._outputPixmap   = (output   instanceof Draw2PNG.Pixmap) ? output   : new Draw2PNG.Pixmap(output)   ;
  
  this.onLoadError     = null;
  this.onLoadComplete  = null;
}

/**
 * Returns a pixmap object for the original image.
 */
Draw2PNG.Filter.prototype.getOriginalPixmap = function () {
  return this._originalPixmap;
}

/**
 * Returns a pixmap object for the output image.
 */
Draw2PNG.Filter.prototype.getOutputPixmap = function () {
  return this._outputPixmap;
}

/**
 * Opens the provided File object 'asynchronously', getting it's data URI and setting it to the original pixmap image. It listens to different state callbacks 
 * like onLoadError or onLoadComplete.
 */
Draw2PNG.Filter.prototype.openFromFile = function (file) {
  this._originalPixmap.onFileReadError     = this._originalPixmap.onImageLoadError = this.onLoadError;
  this._originalPixmap.onImageLoadComplete = this.onLoadComplete;
  this._originalPixmap.loadFromFile(file);
}

/**
 * Opens the first File object provided in a FileList (there must be one file contained in the list at least).
 */
Draw2PNG.Filter.prototype.openFirstFromFileList = function (fileList) {
  this._originalPixmap.onFileReadError     = this._originalPixmap.onImageLoadError = this.onLoadError;
  this._originalPixmap.onImageLoadComplete = this.onLoadComplete;
  this._originalPixmap.loadFirstFromFileList(fileList);
}

/**
 * Calls the dispose method from both pixmaps objects.
 */
Draw2PNG.Filter.prototype.dispose = function () {
  this._originalPixmap.dispose();
  this._outputPixmap.dispose();
}