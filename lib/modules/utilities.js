var kindsOf = {};
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
function kindOf(value) {
    // Null or undefined.
    if (value == null) {
        return String(value);
    }
    // Everything else.
    return kindsOf[kindsOf.toString.call(value)] || 'object';
}
exports.kindOf = kindOf;
/**
 * Round a value to a precision
 * @param value
 * @param places
 * @returns {number}
 */
function round(value, places) {
    var multiplier = Math.pow(10, places);
    return (Math.round(value * multiplier) / multiplier);
}
exports.round = round;
/**
 * Uppercase the first character of a string
 * @param str
 * @returns {string}
 */
function ucfirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.ucfirst = ucfirst;
/**
 * Create a string from an object
 *
 * @param object
 * @returns {any}
 */
function makeString(object) {
    if (object == null)
        return '';
    return '' + object;
}
exports.makeString = makeString;
/**
 * Escape a regexp str
 * @param str
 * @returns {*|any|string|void}
 */
function escapeRegExp(str) {
    return makeString(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}
exports.escapeRegExp = escapeRegExp;
function defaultToWhiteSpace(characters) {
    if (characters == null)
        return '\\s';
    else if (characters.source)
        return characters.source;
    else
        return '[' + escapeRegExp(characters) + ']';
}
exports.defaultToWhiteSpace = defaultToWhiteSpace;
/**
 * Trim a string
 *
 * @param str
 * @param characters
 * @returns {string}
 */
function trim(str, characters) {
    str = makeString(str);
    if (!characters && nativeTrim)
        return nativeTrim.call(str);
    characters = defaultToWhiteSpace(characters);
    return str.replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');
}
exports.trim = trim;
/**
 * Remove quotes from a string
 * @param str
 * @param quoteChar
 * @returns {string}
 */
function unquote(str, quoteChar) {
    if (quoteChar === void 0) { quoteChar = '"'; }
    //quoteChar = quoteChar || '"';
    if (str[0] === quoteChar && str[str.length - 1] === quoteChar)
        return str.slice(1, str.length - 1);
    else
        return str;
}
exports.unquote = unquote;
/**
 * If val is not defined, return def as default
 * @param val
 * @param def
 * @returns {any}
 */
function def(val, def) {
    return defined(val) ? val : def;
}
exports.def = def;
/**
 * Checks wether the passed variable is defined
 *
 * @param obj
 * @returns {boolean}
 */
function defined(obj) {
    return !_.isUndefined(obj);
}
exports.defined = defined;
function getParts(str) {
    return str.replace(/\\\./g, '\uffff').split('.').map(function (s) {
        return s.replace(/\uffff/g, '.');
    });
}
exports.getParts = getParts;
/**
 * Get a child of the object using dot notation
 * @param obj
 * @param parts
 * @param create
 * @returns {any}
 */
function objectGet(obj, parts, create) {
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
exports.objectGet = objectGet;
/**
 * Set a value of a child of the object using dot notation
 * @param obj
 * @param parts
 * @param value
 * @returns {any}
 */
function objectSet(obj, parts, value) {
    parts = getParts(parts);
    var prop = parts.pop();
    obj = objectGet(obj, parts, true);
    if (obj && typeof obj === 'object') {
        return (obj[prop] = value);
    }
}
exports.objectSet = objectSet;
/**
 * Check if a child of the object exists using dot notation
 * @param obj
 * @param parts
 * @returns {boolean|any}
 */
function objectExists(obj, parts) {
    parts = getParts(parts);
    var prop = parts.pop();
    obj = objectGet(obj, parts);
    return typeof obj === 'object' && obj && prop in obj;
}
exports.objectExists = objectExists;
function recurse(value, fn, fnContinue) {
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
        }
        else if (kindOf(value) === 'array') {
            // If value is an array, recurse.
            return value.map(function (item, index) {
                return recurse(item, fn, fnContinue, {
                    objs: state.objs.concat([value]),
                    path: state.path + '[' + index + ']',
                });
            });
        }
        else if (kindOf(value) === 'object') {
            // If value is an object, recurse.
            obj = {};
            for (key in value) {
                obj[key] = recurse(value[key], fn, fnContinue, {
                    objs: state.objs.concat([value]),
                    path: state.path + (/\W/.test(key) ? '["' + key + '"]' : '.' + key),
                });
            }
            return obj;
        }
        else {
            // Otherwise pass value into fn and return.
            return fn(value);
        }
    }
    return recurse(value, fn, fnContinue, { objs: [], path: '' });
}
exports.recurse = recurse;
/**
 * Copy an object, creating a new object and leaving the old intact
 * @param object
 * @returns {T}
 */
function copyObject(object) {
    var objectCopy = {};
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            objectCopy[key] = object[key];
        }
    }
    return objectCopy;
}
exports.copyObject = copyObject;
/**
 * Get the current viewport
 * @returns {{width: *, height: *}}
 */
function getViewPort() {
    var e = window, a = 'inner';
    if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
    }
    return {
        width: e[a + 'Width'],
        height: e[a + 'Height']
    };
}
exports.getViewPort = getViewPort;
/**
 * Checks if the device currently used is a touch device
 * @returns {boolean}
 */
function isTouchDevice() {
    try {
        document.createEvent("TouchEvent");
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isTouchDevice = isTouchDevice;
/**
 * Get a random generated id string
 *
 * @param length
 * @returns {string}
 */
function getRandomId(length) {
    if (!_.isNumber(length)) {
        length = 15;
    }
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
exports.getRandomId = getRandomId;
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
exports.applyMixins = applyMixins;
/**
 * Flatten an object to a dot notated associative array
 * @param obj
 * @param prefix
 * @returns {any}
 */
function dotize(obj, prefix) {
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
    function recurse(o, p, isArrayItem) {
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
            }
            else {
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
exports.dotize = dotize;
function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}
exports.escapeHtml = escapeHtml;
function treeify(list, idAttr, parentAttr, childrenAttr) {
    if (!idAttr)
        idAttr = 'id';
    if (!parentAttr)
        parentAttr = 'parentId';
    if (!childrenAttr)
        childrenAttr = 'children';
    var treeList = [];
    var lookup = {};
    list.forEach(function (obj) {
        lookup[obj[idAttr]] = obj;
        obj[childrenAttr] = [];
    });
    list.forEach(function (obj) {
        if (obj[parentAttr] != null) {
            lookup[obj[parentAttr]][childrenAttr].push(obj);
        }
        else {
            treeList.push(obj);
        }
    });
    return treeList;
}
exports.treeify = treeify;
//# sourceMappingURL=utilities.js.map