/// <reference path='./types.d.ts' />
import util = require('util');
import path = require('path');
import _ = require('lodash');
import fs = require('fs');
import express = require('express');
import sass = require('node-sass');
import _s = require('underscore.string');
import fse = require('fs-extra');
import tmp = require('tmp');
import globule = require('globule');
import chalk = require('chalk');

import {
    VERSION,config,loadConfigFile,
    paths,rootPath,destPath,docsPath
} from "./index";

var VERBOSE_LEVEL:number = 0; //argv.verbose;
var LOG_ENABLED:boolean = false;

export interface ILOG {
    info(...args:any[]): ILOG;
    warn(...args:any[]): ILOG;
    debug(...args:any[]): ILOG;
    error(...args:any[]): ILOG;
    ok(msg:string): ILOG;
    color:Chalk.ChalkStyle;
    show(val:any): ILOG;
    setVerbosity(verbosityLevel:number): ILOG;
    getVerbosity():number;
    is(verbosityName:string):boolean;
    setEnabled(enabled:boolean):ILOG;
    isEnabled():boolean;
}
export var LOG:ILOG = {
    info: function(...args:any[]): ILOG  { VERBOSE_LEVEL >= 0 && console.log.apply(console, [chalk.cyan('INFO: ')].concat(args)); return LOG; },
    warn: function(...args:any[]): ILOG  { VERBOSE_LEVEL >= 1 && console.log.apply(console, [chalk.yellow.bold('WARN: ')].concat(args)); return LOG; },
    debug: function(...args:any[]): ILOG { VERBOSE_LEVEL >= 2 && console.log.apply(console, [chalk.blue.bold('DEBUG: ')].concat(args)); return LOG; },
    error: function(...args:any[]): ILOG { console.log.apply(console, [chalk.red.bold('ERROR: ')].concat(args)); process.exit(); return LOG; },
    ok: function(msg:string): ILOG { console.log(chalk.green(msg));  return LOG; },
    color: chalk,
    show: function(val:any): ILOG { console.log(util.inspect(val, { colors: true, hidden: true, depth: 7 })); return LOG; },
    setVerbosity: function(verbosityLevel:number): ILOG{ VERBOSE_LEVEL = verbosityLevel; return LOG; },
    getVerbosity: function(): number { return VERBOSE_LEVEL; },
    is: function(verbosityName:string):boolean {
        var n:string = verbosityName.toLowerCase();
        if(VERBOSE_LEVEL >= 0 && n === 'info') return true;
        if(VERBOSE_LEVEL >= 1 && n === 'warn') return true;
        if(VERBOSE_LEVEL >= 2 && n === 'debug') return true;
        return false;
    },
    setEnabled: function(enabled:boolean): ILOG { return LOG; },
    isEnabled: function(): boolean { return LOG_ENABLED; }
};

export function printTitle(){
    console.log(
        "\n" +
        chalk.green('Docgen ') + chalk.reset.bold.yellow(' v' + VERSION) +
        "\n"
    );
}
