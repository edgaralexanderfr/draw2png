/**
 * Opens the specified link in a new tab.
 */
function openLink (url, target) {
  if (typeof url != 'string') {
    return;
  }
  
  if (typeof target != 'string') {
    var target = '_blank';
  }
  
  var a    = document.createElement('a');
  a.target = target;
  a.href   = url;
  a.click();
  a.href = url = '';
}