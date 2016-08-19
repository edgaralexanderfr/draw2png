/**
 * Starts downloading the requested file through the provided name, type and content. Deallocation timeout is the time that takes to free the created 
 * object URL, default is 100 ms.
 */

function downloadFile (name, type, content, deallocationTimeout) {
  if (typeof name != 'string' || typeof type != 'string') {
    throw 'InvalidTypeError';
  }
  
  if (isNaN(deallocationTimeout) || deallocationTimeout < 0) {
    deallocationTimeout = 100;
  }
  
  if (typeof navigator['msSaveBlob'] == 'function') {
    return navigator.msSaveBlob(new Blob([content], {
      type : type
    }, name));
  }
  
  var a           = document.createElement('a');
  var objectURL   = URL.createObjectURL(new Blob([content], {
    type : type
  }));
  
  a.href          = objectURL;
  a.download      = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  setTimeout(function () {
    URL.revokeObjectURL(objectURL);
  }, Math.round(deallocationTimeout));
}