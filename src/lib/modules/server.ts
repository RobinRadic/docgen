/// <reference path='./../types.d.ts' />
import util = require('util');
import path = require('path');
import _ = require('lodash');
import fse = require('fs-extra');
import fs = require('fs');
import globule = require('globule');
import jsyaml = require('js-yaml');
import marked = require('marked');
import jade = require('jade');
import * as express from "express";
import serveStatic = require('serve-static');
import cp = require('child_process');

import {objectGet,objectSet,kindOf} from './../modules/utilities';
import {config,paths,rootPath,destPath,docsPath,loadConfigFile} from "./../index";
import {LOG} from './../cli';
import {Express,Handler} from "express";
import {FSWatcher} from "fs";
import {Generator} from "../generator";


export function startServer() {
    var app:Express = express();


    app.use('*', function (req:express.Request, res:express.Response, next:any) {
        if (config('server.logHttpRequests')) {
            console.log(req.originalUrl);
        }
        next();
    });

    var staticHandler:any = serveStatic(destPath(), {'index': ['index.html']});
    app.use(staticHandler);

    app.listen(config.get('server.port'));
}


var watchers:any = {};

export function addWatcher(name:string, files:string[], fn:any){
    watchers[name] = { files: files, fn: fn };
}

export function startWatcher(name:string){

    var fsTimeout:any;
    var watcher:any = watchers[name];
    watcher.files.forEach(function(fileGlob){
        globule.find(fileGlob).forEach(function(filePath){
            watchers[name].current = fs.watch(filePath, function(event:any, filename:any){
                LOG.info(name, filePath + ' was modified');
                if (!fsTimeout) {
                    watcher.fn(filePath, event, filename, watchers[name]);
                    fsTimeout = setTimeout(function () {
                        fsTimeout = null
                    }, 500)
                }
            });

        })
    });
    LOG.ok('Started watcher: ' + name);

}
export function startWatchers(names?:string[]){
    if(_.isUndefined(names)){
        names = Object.keys(watchers);
    }
    names.forEach(function(name:string){
        startWatcher(name);
    });
}

function gen():Generator {
    return new Generator();
}

addWatcher('dev_views', [ rootPath('src/views/**/*.jade') ], function(filePath:string, event:any, fileName:any, w:any){
    gen().createIndex().documents.generateAll(); LOG.ok('Regenerated all documents');
});

addWatcher('dev_sassdoc', [ rootPath('src/views/sassdoc.jade'), rootPath('src/sassdoc-theme/views/**/*.swig') ], function(filePath:string, event:any, fileName:any, w:any){
    gen().sassdoc.generateAll(); LOG.ok('Regenerated dev_sassdoc');
});

addWatcher('dev_assets', [ rootPath('dist/assets/{scripts,styles}/**/*') ], function(filePath:string, event:any, fileName:any, w:any){
    setTimeout(function(){
        gen().theme.copyToAssets('dist/assets', ['scripts', 'styles']).copyToAssets('src', ['images', 'fonts']); LOG.ok('Regenerated assets');
        w.current.close();
        startWatcher('dev_assets');
    }, 500);
});
addWatcher('dev_bower', [ rootPath('bower_components/*') ], function(){
    gen().theme.copyToAssets('', ['bower_components']); LOG.ok('Regenerated assets');
});

addWatcher('docs', [ docsPath('**/*.md') ], function(filePath:string, event:any, fileName:any, w:any){
    var relFilePath:string = path.relative(docsPath(), filePath);
    LOG.ok('Regenerating document.'); LOG.debug('Filename:', fileName); LOG.debug('filePath:', filePath); LOG.debug('relFilePath:', relFilePath);
    gen().createIndex().documents.create(relFilePath);
});

addWatcher('config', [ destPath('docgen.json') ], function(filePath:string, event:any, fileName:any, w:any){
    loadConfigFile(filePath); gen().createIndex().documents.generateAll(); LOG.ok('Reloaded config file and regenerated documents');
});

