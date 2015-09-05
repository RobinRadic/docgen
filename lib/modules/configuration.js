/// <reference path="../types.d.ts" />
var utilities_1 = require('./utilities');
var _ = require('lodash');
var ConfigObject = (function () {
    function ConfigObject(obj) {
        this.allDelimiters = {};
        this.addDelimiters('config', '<%', '%>');
        this.data = obj || {};
    }
    ConfigObject.makeProperty = function (config) {
        var cf = function (prop) {
            return config.get(prop);
        };
        cf.get = config.get.bind(config);
        cf.set = config.set.bind(config);
        cf.unset = config.unset.bind(config);
        cf.merge = config.merge.bind(config);
        cf.raw = config.raw.bind(config);
        cf.process = config.process.bind(config);
        return cf;
    };
    ConfigObject.prototype.unset = function (prop) {
        prop = prop.split('.');
        var key = prop.pop();
        var obj = utilities_1.objectGet(this.data, ConfigObject.getPropString(prop.join('.')));
        delete obj[key];
    };
    ConfigObject.getPropString = function (prop) {
        return Array.isArray(prop) ? prop.map(this.escape).join('.') : prop;
    };
    ConfigObject.escape = function (str) {
        return str.replace(/\./g, '\\.');
    };
    ConfigObject.prototype.raw = function (prop) {
        if (prop) {
            return utilities_1.objectGet(this.data, ConfigObject.getPropString(prop));
        }
        else {
            return this.data;
        }
    };
    ConfigObject.prototype.get = function (prop) {
        return this.process(this.raw(prop));
    };
    ConfigObject.prototype.set = function (prop, value) {
        utilities_1.objectSet(this.data, ConfigObject.getPropString(prop), value);
        return this;
    };
    ConfigObject.prototype.merge = function (obj) {
        this.data = _.merge(this.data, obj);
        return this;
    };
    /**
     *
     * @param raw
     * @returns {any}
     */
    ConfigObject.prototype.process = function (raw) {
        var self = this;
        return utilities_1.recurse(raw, function (value) {
            // If the value is not a string, return it.
            if (typeof value !== 'string') {
                return value;
            }
            // If possible, access the specified property via config.get, in case it
            // doesn't refer to a string, but instead refers to an object or array.
            var matches = value.match(ConfigObject.propStringTmplRe);
            var result;
            if (matches) {
                result = self.get(matches[1]);
                // If the result retrieved from the config data wasn't null or undefined,
                // return it.
                if (result != null) {
                    return result;
                }
            }
            // Process the string as a template.
            return self.processTemplate(value, { data: self.data });
        });
    };
    ConfigObject.prototype.addDelimiters = function (name, opener, closer) {
        var delimiters = this.allDelimiters[name] = {};
        // Used by grunt.
        delimiters.opener = opener;
        delimiters.closer = closer;
        // Generate RegExp patterns dynamically.
        var a = delimiters.opener.replace(/(.)/g, '\\$1');
        var b = '([\\s\\S]+?)' + delimiters.closer.replace(/(.)/g, '\\$1');
        // Used by Lo-Dash.
        delimiters.lodash = {
            evaluate: new RegExp(a + b, 'g'),
            interpolate: new RegExp(a + '=' + b, 'g'),
            escape: new RegExp(a + '-' + b, 'g')
        };
    };
    ConfigObject.prototype.setDelimiters = function (name) {
        // Get the appropriate delimiters.
        var delimiters = this.allDelimiters[name in this.allDelimiters ? name : 'config'];
        // Tell Lo-Dash which delimiters to use.
        _.templateSettings = delimiters.lodash;
        // Return the delimiters.
        return delimiters;
    };
    ConfigObject.prototype.processTemplate = function (tmpl, options) {
        if (!options) {
            options = {};
        }
        // Set delimiters, and get a opening match character.
        var delimiters = this.setDelimiters(options.delimiters);
        // Clone data, initializing to config data or empty object if omitted.
        var data = Object.create(options.data || this.data || {});
        // Keep track of last change.
        var last = tmpl;
        try {
            // As long as tmpl contains template tags, render it and get the result,
            // otherwise just use the template string.
            while (tmpl.indexOf(delimiters.opener) >= 0) {
                tmpl = _.template(tmpl)(data); //, delimiters.lodash);
                // Abort if template didn't change - nothing left to process!
                if (tmpl === last) {
                    break;
                }
                last = tmpl;
            }
        }
        catch (e) {
        }
        // Normalize linefeeds and return.
        return tmpl.toString().replace(/\r\n|\n/g, '\n');
    };
    ConfigObject.propStringTmplRe = /^<%=\s*([a-z0-9_$]+(?:\.[a-z0-9_$]+)*)\s*%>$/i;
    return ConfigObject;
})();
exports.ConfigObject = ConfigObject;
var Configuration = (function () {
    function Configuration() {
    }
    Configuration.prototype.setConfig = function (opts, defaults) {
        this._config = new ConfigObject(_.merge(defaults, opts));
        this.config = ConfigObject.makeProperty(this._config);
    };
    return Configuration;
})();
exports.Configuration = Configuration;
//# sourceMappingURL=configuration.js.map