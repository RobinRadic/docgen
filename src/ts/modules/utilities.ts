declare var $:any;

var kindsOf:any = {};
'Number String Boolean Function RegExp Array Date Error'.split(' ').forEach(function (k) {
    kindsOf['[object ' + k + ']'] = k.toLowerCase();
});
var nativeTrim = String.prototype.trim;

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};


/**
 * Returns the type of a variablse
 *
 * @param value
 * @returns {any}
 */
export function kindOf(value:any):any {
    // Null or undefined.
    if (value == null) {
        return String(value);
    }
    // Everything else.
    return kindsOf[kindsOf.toString.call(value)] || 'object';
}

/**
 * Round a value to a precision
 * @param value
 * @param places
 * @returns {number}
 */
export function round(value, places) {
    var multiplier = Math.pow(10, places);
    return (Math.round(value * multiplier) / multiplier);
}

/**
 * Uppercase the first character of a string
 * @param str
 * @returns {string}
 */
export function ucfirst(str:string):string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Create a string from an object
 *
 * @param object
 * @returns {any}
 */
export function makeString(object) {
    if (object == null) return '';
    return '' + object;
}

/**
 * ends with
 * @param str
 * @param suffix
 * @returns {boolean}
 */
export function strEndsWith(str:string, suffix:string):boolean {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * Escape a regexp str
 * @param str
 * @returns {*|any|string|void}
 */
export function escapeRegExp(str) {
    return makeString(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}

export function defaultToWhiteSpace(characters) {
    if (characters == null)
        return '\\s';
    else if (characters.source)
        return characters.source;
    else
        return '[' + escapeRegExp(characters) + ']';
}

/**
 * Trim a string
 *
 * @param str
 * @param characters
 * @returns {string}
 */
export function trim(str:string, characters?:any):string {
    str = makeString(str);
    if (!characters && nativeTrim) return nativeTrim.call(str);
    characters = defaultToWhiteSpace(characters);
    return str.replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');
}

/**
 * Remove quotes from a string
 * @param str
 * @param quoteChar
 * @returns {string}
 */
export function unquote(str:string, quoteChar:string = '"') {
    //quoteChar = quoteChar || '"';
    if (str[0] === quoteChar && str[str.length - 1] === quoteChar)
        return str.slice(1, str.length - 1);
    else return str;
}

/**
 * If val is not defined, return def as default
 * @param val
 * @param def
 * @returns {any}
 */
export function def(val, def) {
    return defined(val) ? val : def;
}

/**
 * Checks wether the passed variable is defined
 *
 * @param obj
 * @returns {boolean}
 */
export function defined(obj?:any) {
    return !_.isUndefined(obj);
}

/**
 * Create a element wrapped in jQuery
 * @param name
 * @returns {JQuery}
 */
export function cre(name?:string) {
    if (!defined(name)) {
        name = 'div';
    }
    return $(document.createElement(name));
}

export function getParts(str):any {
    return str.replace(/\\\./g, '\uffff').split('.').map(function (s) {
        return s.replace(/\uffff/g, '.');
    });
}

/**
 * Get a child of the object using dot notation
 * @param obj
 * @param parts
 * @param create
 * @returns {any}
 */
export function objectGet(obj?:any, parts?:any, create?:any):any {
    if (typeof parts === 'string') {
        parts = getParts(parts);
    }

    var part;
    while (typeof obj === 'object' && obj && parts.length) {
        part = parts.shift();
        if (!(part in obj) && create) {
            obj[part] = {};
        }
        obj = obj[part];
    }

    return obj;
}

/**
 * Set a value of a child of the object using dot notation
 * @param obj
 * @param parts
 * @param value
 * @returns {any}
 */
export function objectSet(obj, parts, value) {
    parts = getParts(parts);

    var prop = parts.pop();
    obj = objectGet(obj, parts, true);
    if (obj && typeof obj === 'object') {
        return (obj[prop] = value);
    }
}

/**
 * Check if a child of the object exists using dot notation
 * @param obj
 * @param parts
 * @returns {boolean|any}
 */
export function objectExists(obj, parts) {
    parts = getParts(parts);

    var prop = parts.pop();
    obj = objectGet(obj, parts);

    return typeof obj === 'object' && obj && prop in obj;
}

export function recurse(value:Object, fn:Function, fnContinue?:Function):any {
    function recurse(value, fn, fnContinue, state) {
        var error;
        if (state.objs.indexOf(value) !== -1) {
            error = new Error('Circular reference detected (' + state.path + ')');
            error.path = state.path;
            throw error;
        }

        var obj, key;
        if (fnContinue && fnContinue(value) === false) {
            // Skip value if necessary.
            return value;
        } else if (kindOf(value) === 'array') {
            // If value is an array, recurse.
            return value.map(function (item, index) {
                return recurse(item, fn, fnContinue, {
                    objs: state.objs.concat([value]),
                    path: state.path + '[' + index + ']',
                });
            });
        } else if (kindOf(value) === 'object') {
            // If value is an object, recurse.
            obj = {};
            for (key in value) {
                obj[key] = recurse(value[key], fn, fnContinue, {
                    objs: state.objs.concat([value]),
                    path: state.path + (/\W/.test(key) ? '["' + key + '"]' : '.' + key),
                });
            }
            return obj;
        } else {
            // Otherwise pass value into fn and return.
            return fn(value);
        }
    }

    return recurse(value, fn, fnContinue, {objs: [], path: ''});
}

/**
 * Copy an object, creating a new object and leaving the old intact
 * @param object
 * @returns {T}
 */
export function copyObject<T> (object:T):T {
    var objectCopy = <T>{};

    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            objectCopy[key] = object[key];
        }
    }

    return objectCopy;
}

/**
 * Get the current viewport
 * @returns {{width: *, height: *}}
 */
export function getViewPort():any {
    var e:any = window,
        a:any = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }

    return {
        width: e[a + 'Width'],
        height: e[a + 'Height']
    };
}

/**
 * Checks if the device currently used is a touch device
 * @returns {boolean}
 */
export function isTouchDevice():boolean {
    try {
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Get a random generated id string
 *
 * @param length
 * @returns {string}
 */
export function getRandomId(length?:number):string {
    if (!_.isNumber(length)) {
        length = 15;
    }
    var text:string = "";
    var possible:string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function applyMixins(derivedCtor:any, baseCtors:any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        })
    });
}

export function addJqueryUtils() {
    if (kindOf($.fn.prefixedData) === 'function') {
        return;
    }
    $.fn.prefixedData = function (prefix) {
        var origData = $(this).first().data();
        var data = {};
        for (var p in origData) {
            var pattern = new RegExp("^" + prefix + "[A-Z]+");
            if (origData.hasOwnProperty(p) && pattern.test(p)) {
                var shortName = p[prefix.length].toLowerCase() + p.substr(prefix.length + 1);
                data[shortName] = origData[p];
            }
        }
        return data;
    };

    $.fn.removeAttributes = function ():JQuery {
        return this.each(function () {
            var attributes = $.map(this.attributes, function (item) {
                return item.name;
            });
            var img = $(this);
            $.each(attributes, function (i, item) {
                img.removeAttr(item);
            });
        });
    };

    $.fn.ensureClass = function (clas:string, has:boolean = true):JQuery {

        var $this:JQuery = $(this);
        if (has === true && $this.hasClass(clas) === false) {
            $this.addClass(clas);
        } else if (has === false && $this.hasClass(clas) === true) {
            $this.removeClass(clas);
        }
        return this;
    };
}

/**
 * Flatten an object to a dot notated associative array
 * @param obj
 * @param prefix
 * @returns {any}
 */
export function dotize(obj:any, prefix?:any) {
    if (!obj || typeof obj != "object") {
        if (prefix) {
            var newObj = {};
            newObj[prefix] = obj;
            return newObj;
        }
        else
            return obj;
    }

    var newObj = {};

    function recurse(o:any, p:any, isArrayItem?:any) {
        for (var f in o) {
            if (o[f] && typeof o[f] === "object") {
                if (Array.isArray(o[f]))
                    newObj = recurse(o[f], (p ? p : "") + (isNumber(f) ? "[" + f + "]" : "." + f), true); // array
                else {
                    if (isArrayItem)
                        newObj = recurse(o[f], (p ? p : "") + "[" + f + "]"); // array item object
                    else
                        newObj = recurse(o[f], (p ? p + "." : "") + f); // object
                }
            } else {
                if (isArrayItem || isNumber(f))
                    newObj[p + "[" + f + "]"] = o[f]; // array item primitive
                else
                    newObj[(p ? p + "." : "") + f] = o[f]; // primitive
            }
        }

        if (isEmptyObj(newObj))
            return obj;

        return newObj;
    }

    function isNumber(f) {
        return !isNaN(parseInt(f));
    }

    function isEmptyObj(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }

        return true;
    }

    return recurse(obj, prefix);
}

export function escapeHtml(string:string):string {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}

