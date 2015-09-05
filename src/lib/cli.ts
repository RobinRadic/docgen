/// <reference path='./types.d.ts' />
import util = require('util');
import path = require('path');
import _ = require('lodash');
//import fs = require('fs');
import fse = require('fs-extra');
//import tmp = require('tmp');
import globule = require('globule');
import chalk = require('chalk');
//import program = require('commander');

import {
    VERSION,config,loadConfigFile,
    paths,rootPath,destPath,docsPath
} from "./index";

var VERBOSE_LEVEL:number = 0; //argv.verbose;
var VERBOSE_LEVEL_WARN:number = 1;
var VERBOSE_LEVEL_INFO:number = 2;
var VERBOSE_LEVEL_DEBUG:number = 3;
var LOG_ENABLED:boolean = false;
var ARGS:any = {};

export interface ILOG {
    info(...args:any[]): ILOG;
    warn(...args:any[]): ILOG;
    debug(...args:any[]): ILOG;
    error(...args:any[]): ILOG;
    ok(msg:string): ILOG;
    color:Chalk.ChalkStyle;
    show(val:any): ILOG;
    out(...args:any[]): ILOG;
    setVerbosity(verbosityLevel:number): ILOG;
    getVerbosity():number;
    is(verbosityName:string):boolean;
    enable():ILOG;
    disable():ILOG;
    isEnabled():boolean;
}
export var LOG:ILOG = {
    warn: function(...args:any[]): ILOG  { VERBOSE_LEVEL >= VERBOSE_LEVEL_WARN && LOG_ENABLED && console.log.apply(console, [chalk.yellow.bold('WARN: ')].concat(args)); return LOG; },
    info: function(...args:any[]): ILOG  { VERBOSE_LEVEL >= VERBOSE_LEVEL_INFO && LOG_ENABLED && console.log.apply(console, [chalk.cyan('INFO: ')].concat(args)); return LOG; },
    debug: function(...args:any[]): ILOG { VERBOSE_LEVEL >= VERBOSE_LEVEL_DEBUG && LOG_ENABLED && console.log.apply(console, [chalk.blue.bold('DEBUG: ')].concat(args)); return LOG; },
    error: function(...args:any[]): ILOG { LOG_ENABLED && console.log.apply(console, [chalk.red.bold('ERROR: ')].concat(args)); process.exit(); return LOG; },
    ok: function(msg:string): ILOG { LOG_ENABLED && console.log(chalk.green(msg));  return LOG; },
    color: chalk,
    out: function(...args:any[]): ILOG { LOG_ENABLED && console.log.apply(console, args); return LOG },
    show: function(val:any): ILOG { LOG_ENABLED && console.log(util.inspect(val, { colors: true, hidden: true, depth: 7 })); return LOG; },
    setVerbosity: function(verbosityLevel:number): ILOG{ VERBOSE_LEVEL = verbosityLevel; return LOG; },
    getVerbosity: function(): number { return VERBOSE_LEVEL; },
    is: function(verbosityName:string):boolean {
        var n:string = verbosityName.toLowerCase();
        if(VERBOSE_LEVEL >= VERBOSE_LEVEL_WARN && n === 'warn') return true;
        if(VERBOSE_LEVEL >= VERBOSE_LEVEL_INFO && n === 'info') return true;
        if(VERBOSE_LEVEL >= VERBOSE_LEVEL_DEBUG && n === 'debug') return true;
        return false;
    },
    enable: function(): ILOG { LOG_ENABLED = true; return LOG; },
    disable: function(): ILOG { LOG_ENABLED = false; return LOG; },
    isEnabled: function(): boolean { return LOG_ENABLED; }
};

export function printTitle(){
    console.log(
        "\n" +
        chalk.green('Docgen ') + chalk.reset.bold.yellow(' v' + VERSION) +
        "\n"
    );
}



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
