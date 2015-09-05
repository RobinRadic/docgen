///<reference path="../types.d.ts"/>
import {defined} from './utilities'
import JSON = require('./JSON');

/**
 * A wrapper around the localStorage, allows expiration settings and JSON in/output
 * @exports storage
 */


/**
 * Add a event listener for the 'onstorage' event
 * @param {function} callback
 */
export function on( callback ){
    if( window.addEventListener ){
        window.addEventListener("storage", callback, false);
    } else {
        window.attachEvent("onstorage", callback);
    }
}

/**
 * @typedef StorageSetOptions
 * @type {object}
 * @property {boolean} [json=false] - Set to true if the value passed is a JSON object
 * @property {number|boolean} [expires=false] - Minutes until expired
 */
/**
 * Save a value to the storage
 * @param {string|number} key               - The unique id to save the data on
 * @param {*} val                           - The value, can be any datatype. If it's an object, make sure to enable json in the options
 * @param {StorageSetOptions} [options]     - Additional options, check the docs
 */
export function set( key:any, val:any, options?:any ){
    var options:any = _.merge({json: false, expires: false}, options);
    if( options.json ){
        val = JSON.stringify(val);
    }
    if( options.expires ){
        var now = Math.floor((Date.now() / 1000) / 60);
        window.localStorage.setItem(key + ':expire', now + options.expires);
    }
    window.localStorage.setItem(key, val);
}

/**
 * @typedef StorageGetOptions
 * @type {object}
 * @property {boolean} [json=false]     - Set to true if the value is a JSON object
 * @property {*} [default=false]        - The default value to return if the requested key does not exist
 */
/**
 * Get a value from the storage
 * @param key
 * @param {StorageGetOptions} [options] - Optional options, check the docs
 * @returns {*}
 */
export function get( key:any, options?:any ){
    var options:any = _.merge({json: false, def: null}, options);

    if( !defined(key) ){
        return options.def;
    }

    if( _.isString(window.localStorage.getItem(key)) ){
        if( _.isString(window.localStorage.getItem(key + ':expire')) ){
            var now = Math.floor((Date.now() / 1000) / 60);
            var expires = parseInt(window.localStorage.getItem(key + ':expire'));
            if( now > expires ){
                del(key);
                del(key + ':expire');
            }
        }
    }

    var val:any = window.localStorage.getItem(key);

    if( !defined(val) || defined(val) && val == null ){
        return options.def;
    }

    if( options.json ){
        return JSON.parse(val);
    }
    return val;
}


/**
 * Delete a value from the storage
 * @param {string|number} key
 */
export function del( key ){
    window.localStorage.removeItem(key);
}

/**
 * Clear the storage, will clean all saved items
 */
export function clear(){
    window.localStorage.clear();
}


/**
 * Get total localstorage size in MB. If key is provided,
 * it will return size in MB only for the corresponding item.
 * @param [key]
 * @returns {string}
 */
export function getSize( key ){
    key = key || false;
    if( key ){
        return ((localStorage[ x ].length * 2) / 1024 / 1024).toFixed(2);
    } else {
        var total = 0;
        for( var x in localStorage ){
            total += (localStorage[ x ].length * 2) / 1024 / 1024;
        }
        return total.toFixed(2);
    }
}
export interface IStorage {
    get(key:any, options?:any);
    set(key:any, val:any, options?:any);
    on(callback:any);
    del(key:any);
    clear();
    getSize(key:any);
}
export var storage:IStorage = {
    on: on,
    get: get,
    set: set,
    del: del,
    clear: clear,
    getSize: getSize,
};
