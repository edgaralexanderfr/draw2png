/**
 * Depends on setCookie, getCookie
 *
 * Deletes the requested cookie.
 */
function deleteCookie (name) {
  if (getCookie(name) === true) {
    return setCookie(name, undefined, 0);
  }
  
  return setCookie(name, '', 0);
}