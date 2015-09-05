/// <reference path='./types.d.ts' />
var util = require('util');
var chalk = require('chalk');
var index_1 = require("./index");
var VERBOSE_LEVEL = 0; //argv.verbose;
var LOG_ENABLED = false;
exports.LOG = {
    info: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        VERBOSE_LEVEL >= 0 && console.log.apply(console, [chalk.cyan('INFO: ')].concat(args));
        return exports.LOG;
    },
    warn: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        VERBOSE_LEVEL >= 1 && console.log.apply(console, [chalk.yellow.bold('WARN: ')].concat(args));
        return exports.LOG;
    },
    debug: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        VERBOSE_LEVEL >= 2 && console.log.apply(console, [chalk.blue.bold('DEBUG: ')].concat(args));
        return exports.LOG;
    },
    error: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        console.log.apply(console, [chalk.red.bold('ERROR: ')].concat(args));
        process.exit();
        return exports.LOG;
    },
    ok: function (msg) { console.log(chalk.green(msg)); return exports.LOG; },
    color: chalk,
    show: function (val) { console.log(util.inspect(val, { colors: true, hidden: true, depth: 7 })); return exports.LOG; },
    setVerbosity: function (verbosityLevel) { VERBOSE_LEVEL = verbosityLevel; return exports.LOG; },
    getVerbosity: function () { return VERBOSE_LEVEL; },
    is: function (verbosityName) {
        var n = verbosityName.toLowerCase();
        if (VERBOSE_LEVEL >= 0 && n === 'info')
            return true;
        if (VERBOSE_LEVEL >= 1 && n === 'warn')
            return true;
        if (VERBOSE_LEVEL >= 2 && n === 'debug')
            return true;
        return false;
    },
    setEnabled: function (enabled) { return exports.LOG; },
    isEnabled: function () { return LOG_ENABLED; }
};
function printTitle() {
    console.log("\n" +
        chalk.green('Docgen ') + chalk.reset.bold.yellow(' v' + index_1.VERSION) +
        "\n");
}
exports.printTitle = printTitle;
