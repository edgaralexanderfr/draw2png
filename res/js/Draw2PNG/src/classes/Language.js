/**
 * Depends on jQuery 1.11.3, downloadFile, setCookie, getCookie
 */

/**
 * Constructs a new Language object.
 */
function Language () {
  this._languages            = {};
  this._name                 = '';
  this._cache                = false;
  this._undefinedTextMessage = '';
  this._domAttributeName     = 'data-langTextName';
  this._domAttributeTarget   = 'data-langTextTarget';
  this._cookieName           = 'language';
  this._saveCookie           = false;
  this._cookieLifeTime       = 3600 * 24 * 365 * 1000;
  
  this.onLoadComplete        = null;
  this.onLoadError           = null;
}

/**
 * Returns all the loaded languages within the Language object.
 */
Language.prototype.getLanguages = function () {
  return this._languages;
}

/**
 * Returns the Language name that the Language object uses for its operations.
 */
Language.prototype.getName = function () {
  return this._name;
}

/**
 * Tells whether the cache is enabled when requesting JSON files.
 */
Language.prototype.cacheEnabled = function () {
  return this._cache;
}

/**
 * A provisional text message that methods like 'getText' will return in case the requested text name doesn't exist.
 */
Language.prototype.getUndefinedTextMessage = function () {
  return this._undefinedTextMessage;
}

/**
 * Returns the DOM attribute name.
 */
Language.prototype.getDOMAttributeName = function () {
  return this._domAttributeName;
}

/**
 * Returns the DOM attribute target.
 */
Language.prototype.getDOMAttributeTarget = function () {
  return this._domAttributeTarget;
}

/**
 * Returns the cookie name to use when saving the last used language.
 */
Language.prototype.getCookieName = function () {
  return this._cookieName;
}

/**
 * Returns the cookie life time in milliseconds or any other variable type.
 */
Language.prototype.getCookieLifeTime = function () {
  return this._cookieLifeTime;
}

/**
 * Updates the language name to use and if allowed, saves its value as the last used language in a cookie.
 */
Language.prototype.setName = function (name) {
  if (typeof this._languages[ name ] == 'undefined') {
    throw 'UndefinedLanguageError';
  }
  
  this._name = name;
  
  if (this._saveCookie) {
    setCookie(this._cookieName, name, this._cookieLifeTime);
  }
}

/**
 * Updates the language name from the last used language cookie in case it exists.
 */
Language.prototype.setNameFromCookie = function () {
  try {
    this.setName(getCookie(this._cookieName));
  } catch (error) {
    
  }
}

/**
 * Tells whether to use the cache when requesting JSON files.
 */
Language.prototype.enableCache = function (cache) {
  if (typeof cache == 'boolean') {
    this._cache = cache;
  }
}

/**
 * Updates the language cookie life time in seconds and in case it's not a number, the cookie will expire when the navigator gets closed.
 */
Language.prototype.setCookieLifeTime = function (cookieLifeTime) {
  this._cookieLifeTime = cookieLifeTime;
}

/**
 * Updates the provisional text message that methods like 'getText' will return in case the requested text name doesn't exist.
 */
Language.prototype.setUndefinedTextMessage = function (undefinedTextMessage) {
  if (typeof undefinedTextMessage == 'string') {
    this._undefinedTextMessage = undefinedTextMessage;
  }
}

/**
 * Updates the DOM attribute name.
 */
Language.prototype.setDOMAttributeName = function (domAttributeName) {
  if (typeof domAttributeName == 'string') {
    this._domAttributeName = domAttributeName;
  }
}

/**
 * Updates the DOM attribute target.
 */
Language.prototype.setDOMAttributeTarget = function (domAttributeTarget) {
  if (typeof domAttributeTarget == 'string') {
    this._domAttributeTarget = domAttributeTarget;
  }
}

/**
 * Updates the cookie name to use when getting/setting the last used language.
 */
Language.prototype.setCookieName = function (cookieName) {
  if (typeof cookieName == 'string') {
    this._cookieName = cookieName;
  }
}

/**
 * Tells whether to use a cookie for saving the last used language name or not.
 */
Language.prototype.saveCookie = function (saveCookie) {
  if (typeof saveCookie == 'boolean') {
    this._saveCookie = saveCookie;
  }
  
  return this._saveCookie;
}

/**
 * Load a language from a remote JSON file into the languages object through its name and url. onSuccess and onError callbacks could be provided for event 
 * handling.
 */
Language.prototype.loadFromJSON = function (name, url, onSuccess, onError) {
  if (typeof $ != 'function') {
    throw 'jQueryNotDefinedError';
  }
  
  if (typeof name != 'string' || typeof url != 'string') {
    return;
  }
  
  var $this = this;
  
  $.ajax({
    dataType : 'json', 
    url      : url, 
    cache    : this._cache, 
    success  : function (data) {
      if (typeof data == 'undefined') {
        onError(name, url);
        
        return;
      }
      
      $this._languages[ name ] = data;
      
      if (typeof onSuccess == 'function') {
        onSuccess();
      }
    }, 
    error    : function () {
      if (typeof onError == 'function') {
        onError(name, url);
      }
    }
  });
}

/**
 * Calls the loadFromJSON method for every object contained within the provided list. The onLoadComplete and onLoadError events could be used in order to 
 * check if the whole list was downloaded or an error has occurred.
 */
Language.prototype.loadFromJSONList = function (list) {
  if (typeof $ != 'function') {
    throw 'jQueryNotDefinedError';
  }
  
  if (typeof list['length'] != 'number') {
    throw 'InvalidTypeError';
  }
  
  var $this  = this;
  var loaded = 0;
  var total  = list.length;
  var i;
  
  for (i = 0; i < total; i++) {
    this.loadFromJSON(list[ i ].name, list[ i ].url, function () {
      loaded++;
      
      if (loaded == total && typeof $this.onLoadComplete == 'function') {
        $this.onLoadComplete();
      }
    }, this.onLoadError);
  }
}

/**
 * Returns the requested text through the provided name from the used language or undefinedTextMessage in case it doesn't exist.
 */
Language.prototype.getText = function (textName) {
  if (typeof this._languages[ this._name ] != 'undefined' && typeof this._languages[ this._name ][ textName ] != 'undefined') {
    return this._languages[ this._name ][ textName ];
  }
  
  return this._undefinedTextMessage;
}

/**
 * Translates the whole DOM to the used language using the DOM attributes names and targets. In case the parameter setLangAttributeFromName is true, the HTML 
 * tag lang attribute will be set to the used language name.
 */
Language.prototype.translateDOM = function (setLangAttributeFromName) {
  if (typeof this._languages[ this._name ] != 'object') {
    throw 'UndefinedLanguageError';
  }
  
  if (typeof setLangAttributeFromName == 'boolean' && setLangAttributeFromName) {
    $('html').attr('lang', this._name);
  }
  
  var $this = this;
  
  $('[' + this._domAttributeName + ']').each(function () {
    var index = 1;
    var textName, identifier, textTarget;
    
    while (typeof (textName = $(this).attr($this._domAttributeName + (identifier = (index == 1) ? '' : index + '' ))) != 'undefined') {
      index++;
      
      if (typeof $this._languages[ $this._name ][ textName ] == 'undefined') {
        continue;
      }
      
      textTarget = $(this).attr($this._domAttributeTarget + identifier);
      
      if (typeof textTarget != 'undefined') {
        $(this).attr(textTarget, $this._languages[ $this._name ][ textName ]);
      } else {
        $(this).html($this._languages[ $this._name ][ textName ]);
      }
    }
  });
}

/**
 * Similar to translateDOM but it creates a new language based on the provided name and the DOM attributes names and targets instead.
 */
Language.prototype.loadDOMTextAsLanguage = function (name) {
  if (typeof name != 'string') {
    throw 'InvalidTypeError';
  }
  
  var $this               = this;
  this._languages[ name ] = {};
  
  $('[' + this._domAttributeName + ']').each(function () {
    var index = 1;
    var textName, identifier, textTarget;
    
    while (typeof (textName = $(this).attr($this._domAttributeName + (identifier = (index == 1) ? '' : index + '' ))) != 'undefined') {
      textTarget                           = $(this).attr($this._domAttributeTarget + identifier);
      $this._languages[ name ][ textName ] = (typeof textTarget != 'undefined') ? $(this).attr(textTarget) : $(this).html() ;
      index++;
    }
  });
}

/**
 * In case you want to download the used language as a JSON file for translation purposes.
 */
Language.prototype.saveAsJSONFile = function () {
  if (typeof this._languages[ this._name ] != 'object') {
    throw 'UndefinedLanguageError';
  }
  
  var fileName = ((this._name == '') ? 'language' : this._name ) + '.json';
  var text     = '{\n';
  var i;
  
  for (i in this._languages[ this._name ]) {
    text += '  "' + i + '" : "' + this._languages[ this._name ][ i ].replace(/"/g, '\\"') + '", \n';
  }
  
  text = text.substring(0, text.length - 3) + '\n}';
  downloadFile(fileName, 'application/json', text);
}