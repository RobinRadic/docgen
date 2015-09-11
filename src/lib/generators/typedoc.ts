/// <reference path='./../types.d.ts' />
import util = require('util');
import path = require('path');
import _ = require('lodash');
import fse = require('fs-extra');
import globule = require('globule');
import jsyaml = require('js-yaml');
import marked = require('marked');
import jade = require('jade');
import cp = require('child_process');
import q = require('q');


import {objectGet,objectSet,kindOf} from './../modules/utilities';
import {config,paths,rootPath,destPath,docsPath} from "./../index";
import {LOG} from "./../cli";
import {parse,getRawFM,parseFM,removeFM} from './../modules/markdown';
import {Generator} from "../generator";
import {ChildProcess} from "child_process";

export class Typedoc  {

    protected _generator:Generator;
    protected defaults:any;

    constructor(generator:Generator) {
        this._generator = generator;
        this.defaults = {
            readme: 'none',
            theme: rootPath('src/typedoc-theme'),
            hideGenerator: ''
        };

    }

    public get generator():Generator {
        return this._generator;
    }

    public transformGenerated(name:string):Typedoc{
        var self:Typedoc = this;
        var item:any = this.getConfig(name);
        var template:any = this.generator.compileView('typedoc');
        var glob:string = path.join(item.options.out, '**/*.html');
        //LOG.debug('transformGenerated:glob', glob);
        globule.find(glob).forEach(function(filePath:string){
            //LOG.debug('transformGenerated:forEach', filePath);
            var rootPath:string = path.relative(path.dirname(filePath), destPath());
            rootPath = rootPath.length > 0 ? rootPath + '/' : '';
            var fileContent:string = fse.readFileSync(filePath, 'utf-8');
            var html:string = template({
                typedoc: {
                    content: fileContent
                },
                rootPath: rootPath
            });
            fse.writeFileSync(filePath, html);
        });
        return this;
    }

    public getConfig(name:string):any{
        var self:Typedoc = this;
        var tc:any = config('generators.typedoc');
        var t:any = tc[name];

        var options:any = _.merge(this.defaults, {
            out: destPath(path.join('typedoc', name)),
            name: config('name')
        }, t.options);

        var files:Array<string> = [];
        t.files.forEach(function (fileGlob) {
            files = files.concat(globule.find(fileGlob));
        });
        return {
            name: name,
            files: files,
            options: options
        }
    }

    public generate(name:string):Typedoc {
        var self:Typedoc = this;
        var docItem:any = this.getConfig(name);
        this.exec(docItem.files, docItem.options)
        self.transformGenerated(name);
        return this;
    }

    public generateAll():Generator {
        var self:Typedoc = this;
        var tc:any = config('generators.typedoc');
        if(Object.keys(tc).length === 0){
            return;
        }
        Object.keys(tc).forEach(function(name:string){
            self.generate(name);
        });
        return this._generator;
    }

    public exec(files, options):Typedoc {
        var args = [];
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                args.push('--' + key);
                if (!!options[key]) {
                    args.push(options[key]);
                }
            }
        }
        for (var i = 0; i < files.length; i++) {
            args.push(files[i]);
        }

        var winExt = /^win/.test(process.platform) ? '.cmd' : '';
        var executable = path.resolve(require.resolve('typedoc/package.json'), '..', '..', '.bin', 'typedoc' + winExt);
        var child:ChildProcess = cp.execFileSync(executable, args, {
            stdio: LOG.is('debug') ? 'inherit' : 'pipe',
            env: process.env

        });
        return this;
    }
}
