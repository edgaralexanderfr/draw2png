/**
 * Extends child class from parent class.
 */
function extend (child, parent) {
  child.prototype             = (typeof Object['create'] == 'function') ? Object.create(parent.prototype) : new parent ;
  child.prototype.constructor = child;
}