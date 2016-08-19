/**
 * Returns the specified file name without its extension. Ex. filename.txt -> filename
 */
function removeFileNameExtension (fileName) {
  var parts = fileName.split('.');
  
  return (parts.length > 1) ? parts.splice(0, parts.length - 1).join('.') : fileName ;
}