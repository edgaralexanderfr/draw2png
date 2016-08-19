/**
 * Returns the decoded value from the requested cookie. In case the cookie doesn't have any value, it's considered as a boolean cookie and will return true 
 * instead (as a boolean type, not String).
 */
function getCookie (name) {
  var cookies = document.cookie.split(';');
  var total   = cookies.length;
  var i, cookie;
  
  for (i = 0; i < total; i++) {
    cookie = cookies[ i ].split('=');
    
    if (cookie[0][0] == ' ') {
      cookie[0] = cookie[0].substring(1, cookie[0].length);
    }
    
    if (name == decodeURIComponent(cookie[0])) {
      return (cookie.length > 1) ? decodeURIComponent(cookie.splice(1, cookie.length).join('=')) : true ;
    }
  }
  
  return '';
}