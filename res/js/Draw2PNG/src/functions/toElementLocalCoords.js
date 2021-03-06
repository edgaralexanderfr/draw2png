/**
 * Returns the local coordinates within a HTML element without offset.
 * 
 * Idea taken from jerryj at http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
 */
function toElementLocalCoords (element, clientX, clientY) {
  if (!(element instanceof HTMLElement) || isNaN(clientX) || isNaN(clientY)) {
    throw 'InvalidTypeError';
  }
  
  var rect = element.getBoundingClientRect();
  
  return {
    x : (clientX - rect.left) / (rect.right  - rect.left) * element.width, 
    y : (clientY - rect.top)  / (rect.bottom - rect.top)  * element.height
  };
}
