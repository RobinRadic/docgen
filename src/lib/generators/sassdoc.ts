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
import sassdoc = require('sassdoc');
import sassdocExtras = require('sassdoc-extras');

import {objectGet,objectSet,kindOf} from './../modules/utilities';
import {config,paths,rootPath,destPath,docsPath} from "./../index";
import {LOG} from "./../cli";
import {parse,getRawFM,parseFM,removeFM} from './../modules/markdown';
import {Generator} from "../generator";
import {ChildProcess} from "child_process";

export class Sassdoc  {

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

    public generate(name:string):Q.Promise<any>{
        var item:any = this.getConfig(name);
        return <Q.Promise<any>> sassdoc(item.files, item.options);
    }

    public getConfig(name:string):any {
        var self:Sassdoc = this;
        var item:any = config('generators.sassdoc.' + name);
        if(_.isUndefined(item.options)){
            item.options = {};
        }
        item.options = _.merge(item.options, {
            dest: destPath(path.join('sassdoc', name)),
            theme: rootPath('src/sassdoc-theme')
        });
        return item;
    }

    public generateAll():Generator {
        var self:Sassdoc = this;
        var sassDocItems:any = config('generators.sassdoc');
        Object.keys(sassDocItems).forEach(function(name:string){
            self.generate(name).then(function(){
                self.transformGenerated(name);
            });
        });
        return this._generator;
    }


    public transformGenerated(name:string):Sassdoc{
        var self:Sassdoc = this;
        var item:any = this.getConfig(name);
        var template:any = this.generator.compileView('sassdoc');
        var glob:string = path.join(item.options.dest, '**/*.html');
        globule.find(glob).forEach(function(filePath:string){
            var fileContent:string = fse.readFileSync(filePath, 'utf-8');
            var html:string = template({
                sassdoc: {
                    content: fileContent
                }
            });
            LOG.debug('writing sassoc file ' + filePath);
            fse.writeFileSync(filePath, html);
        });
        return this;
    }

}
