/**
 * Creates/updates a cookie encoding its name and value. 'expires' parameter must be specified in milliseconds while 'maxAge' uses seconds.
 */
function setCookie (name, value, expires, maxAge, path, domain, secure) {
  if (typeof name == 'undefined') {
    return document.cookie;
  }
  
  var cookie = encodeURIComponent(name);
  
  if (typeof value != 'undefined') {
    cookie += '=' + encodeURIComponent(value);
  }
  
  if (typeof expires == 'number') {
    var date = new Date;
    date.setTime(date.getTime() + Math.round(expires));
    cookie += '; expires=' + date.toGMTString();
  }
  
  if (typeof maxAge == 'number') {
    cookie += '; max-age=' + Math.round(maxAge);
  }
  
  if (typeof path == 'string') {
    cookie += '; path=' + encodeURIComponent(path);
  }
  
  if (typeof domain == 'string') {
    cookie += '; domain=' + encodeURIComponent(domain);
  }
  
  if (typeof secure == 'boolean' && secure) {
    cookie += '; secure';
  }
  
  document.cookie = cookie;
  
  return document.cookie;
}