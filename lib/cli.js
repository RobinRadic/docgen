/// <reference path='./types.d.ts' />
var util = require('util');
var chalk = require('chalk');
//import program = require('commander');
var index_1 = require("./index");
var VERBOSE_LEVEL = 0; //argv.verbose;
var VERBOSE_LEVEL_WARN = 1;
var VERBOSE_LEVEL_INFO = 2;
var VERBOSE_LEVEL_DEBUG = 3;
var LOG_ENABLED = false;
var ARGS = {};
exports.LOG = {
    warn: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        VERBOSE_LEVEL >= VERBOSE_LEVEL_WARN && LOG_ENABLED && console.log.apply(console, [chalk.yellow.bold('WARN: ')].concat(args));
        return exports.LOG;
    },
    info: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        VERBOSE_LEVEL >= VERBOSE_LEVEL_INFO && LOG_ENABLED && console.log.apply(console, [chalk.cyan('INFO: ')].concat(args));
        return exports.LOG;
    },
    debug: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        VERBOSE_LEVEL >= VERBOSE_LEVEL_DEBUG && LOG_ENABLED && console.log.apply(console, [chalk.blue.bold('DEBUG: ')].concat(args));
        return exports.LOG;
    },
    error: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        LOG_ENABLED && console.log.apply(console, [chalk.red.bold('ERROR: ')].concat(args));
        process.exit();
        return exports.LOG;
    },
    ok: function (msg) { LOG_ENABLED && console.log(chalk.green(msg)); return exports.LOG; },
    color: chalk,
    out: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        LOG_ENABLED && console.log.apply(console, args);
        return exports.LOG;
    },
    show: function (val) { LOG_ENABLED && console.log(util.inspect(val, { colors: true, hidden: true, depth: 7 })); return exports.LOG; },
    setVerbosity: function (verbosityLevel) { VERBOSE_LEVEL = verbosityLevel; return exports.LOG; },
    getVerbosity: function () { return VERBOSE_LEVEL; },
    is: function (verbosityName) {
        var n = verbosityName.toLowerCase();
        if (VERBOSE_LEVEL >= VERBOSE_LEVEL_WARN && n === 'warn')
            return true;
        if (VERBOSE_LEVEL >= VERBOSE_LEVEL_INFO && n === 'info')
            return true;
        if (VERBOSE_LEVEL >= VERBOSE_LEVEL_DEBUG && n === 'debug')
            return true;
        return false;
    },
    enable: function () { LOG_ENABLED = true; return exports.LOG; },
    disable: function () { LOG_ENABLED = false; return exports.LOG; },
    isEnabled: function () { return LOG_ENABLED; }
};
function printTitle() {
    console.log("\n" +
        chalk.green('Docgen ') + chalk.reset.bold.yellow(' v' + index_1.VERSION) +
        "\n");
}
exports.printTitle = printTitle;
/**
program
    .version(VERSION)
    .usage('[options] <file ...>')
    .option('-q, --quiet', 'Disable output logging')
    .option('-c, --config [path]', 'Define custom docgen.json path', 'docgen.json')
    .option('-v, --verbose', 'Set log verbosity level (-v = info, -vv = warnings, -vvv = debug )', increaseVerbosity, 0);

export function handleOptions(program:commander.ICommand){

    var opts:any = program.opts();
    LOG.enable();
    program['quiet'] && LOG.disable();
    program['verbose'] && LOG.setVerbosity(program['verbose']);
    LOG.out('handleOptions', opts);
    if(opts.config){
        loadConfigFile(opts.config);
    }
}

function requireCommands() {
    var commandsDir:string = path.join(__dirname, 'commands');
    globule.find(commandsDir + ' ').forEach(function (filePath:string) {
        var fileName:string = path.basename(filePath, path.extname(filePath));
        var relativePath:string = path.relative(__dirname, filePath);
        var nodePath:string = path.join(path.dirname(relativePath), fileName);
        LOG.debug('Require command: ', nodePath);
        require('./' + nodePath)(program,handleOptions);
    });
}

export function parse(argv:any){
    requireCommands();
    program.parse(argv);
    LOG.is('debug') && LOG.show(program);
//    console.log('  - %s cheese', program['config']);
//    console.log('opts', program.opts())
}

*/
