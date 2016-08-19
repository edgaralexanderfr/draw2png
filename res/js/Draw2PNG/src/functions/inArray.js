/**
 * Tells whether or not the provided value (needle) is contained within the specified array.
 */
function inArray (array, needle) {
  if (typeof array['length'] != 'number') {
    return false;
  }
  
  var total = array.length;
  var i;
  
  for (i = 0; i < total; i++) {
    if (needle == array[ i ]) {
      return true;
    }
  }
  
  return false;
}