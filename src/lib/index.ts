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

import {ConfigObject,IConfig,IConfigProperty} from "./modules/configuration";
import {kindOf} from "./modules/utilities";
import {Generator} from "./generator";


export var VERSION:string = require('./../package.json').version;

export function getDefaultConfig() {
    return {
        title: 'Documentation for my project',
        copyright: 'Copyright 2015 &copy; Docgen',
        docs: 'docs',
        dest: 'docz',
        baseUrl: '/',
        index: 'README.md',
        generators: {
            typedoc: {
                browser: {files: ['src/ts/**/*.ts'], options: {name: 'Scripting API', module: 'umd', rootDir: './', target: 'es5', mode: 'file', experimentalDecorators: ''}}
            },
            sassdoc: {
                styles: {files: ['src/styles'], options: {}}
            },
            jsdoc: []
        },
        server: {
            port: 3000,
            logHttpRequests: false
        },
        types: {
            doc: {
                view: 'document',
                title: 'Document'
            }
        },
        menu: [
            {name: 'Home', type: 'index', icon: 'fa fa-home'},
            {
                name: 'API', type: 'parent', icon: 'fa fa-file-code-o', children: [
                {name: 'Javascript', typedoc: 'browser', type: 'typedoc', icon: 'fa fa-code'},
                {name: 'SCSS', sassdoc: 'styles', type: 'sassdoc', icon: 'fa fa-github'}
            ]},
            {
                name: 'Getting Started', type: 'parent', icon: 'fa fa-dashboard', children: [
                {name: 'Installation', doc: 'getting-started/installation.md', type: 'doc', icon: 'fa fa-dashboard'},
                {name: 'Configuration', doc: 'getting-started/configuration.md', type: 'doc', icon: 'fa fa-dashboard'}
            ]},
            {name: 'About', doc: 'about.md', type: 'doc', icon: 'fa fa-bullhorn'},
            {name: 'Contributing', doc: 'contributing.md', type: 'doc', icon: 'fa fa-github'},
            {name: 'Github', href: 'https://github.com', type: 'href', icon: 'fa fa-github'}
        ],

        googleAnalytics: "UA-XXXXX-YY",
        tracking: "<img src=\"http://piwik.example.org/piwik.php?idsite={$IDSITE}amp;rec=1\" style=\"border:0\" alt=\"\" />"

    };
}

var _config:IConfig = new ConfigObject({});
export var config:IConfigProperty = ConfigObject.makeProperty(_config);

var _rootPath = path.join(__dirname, '..');
export var paths:any = {
    root: _rootPath,
    docs: '',
    dest: ''
};
export function setPaths(cwd:string) {
    paths = {
        root: _rootPath,
        docs: path.join(cwd, config('docs')),
        dest: path.join(cwd, config('dest')),
        cwd: process.cwd()
    }
}
export function rootPath(relPath:string=''):string {
    return path.join(paths.root, relPath);
}
export function docsPath(relPath:string=''):string {
    return path.join(paths.docs, relPath);
}
export function destPath(relPath:string=''):string {
    return path.join(paths.dest, relPath);
}
export function cwdPath(relPath:string=''):string {
    console.log(paths);
    return path.join(paths.cwd, relPath);
}

export function createConfigFile(filePath:string) {
    fse.outputFileSync(filePath, JSON.stringify(getDefaultConfig(), null, 4));
}

export function loadConfigFile(filePath:string) {
    var json:any = fse.readJsonSync(filePath);
    config.merge(getDefaultConfig());
    config.merge(json);
    setPaths(process.cwd());
}

export function createGenerator():Generator {
    return new Generator();
}
