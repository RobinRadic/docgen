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
import cp = require('child_process');
import q = require('q');
import jade = require('jade');

import {config,paths,rootPath,destPath,docsPath} from "./index";
import {LOG} from "./cli";
import {kindOf,treeify} from "./modules/utilities";
import {parse,getRawFM,parseFM,removeFM} from './modules/markdown';
import {DocumentCollection,Document} from "./generators/documents";
import * as theme from './generators/theme';
import {ChildProcess} from "child_process";
import {Typedoc} from "./generators/typedoc";
import {Theme} from "./generators/theme";
import {Sassdoc} from "./generators/sassdoc";

export class Generator {

    private _menu:Menu;
    private _documents:DocumentCollection;
    private _theme:Theme;
    private _typedoc:Typedoc;
    private _sassdoc:Sassdoc;

    constructor() {
        this._menu = new Menu(config('menu'));
        this._documents = new DocumentCollection(this);
        this._theme = new Theme(this);
        this._typedoc = new Typedoc(this);
        this._sassdoc = new Sassdoc(this);
    }

    public clean():Generator {
        fse.removeSync(destPath());
        return this;
    }


    public get menu():Menu {
        return this._menu;
    }

    public get documents():DocumentCollection {
        return this._documents;
    }

    public get typedoc():Typedoc {
        return this._typedoc;
    }

    get sassdoc():Sassdoc {
        return this._sassdoc;
    }

    public get theme():Theme {
        return this._theme;
    }

    public compileView(view:string,vars?:any):any {
        var self:Generator = this;
        var viewPath:string = rootPath(path.join('src', 'views', view + '.jade'));
        var template:JadeTemplateFunction = jade.compileFile(viewPath, {
            filename: view + '.jade',
            pretty: true
        });
        var _template:any = function(locals:any) {
            return template(_.merge({
                _inspect: function (val:any) {
                    return util.inspect(val, {colors: false, hidden: true});
                },
                config: config.get(),
                menu: self.menu
            }, locals));
        };
        if(_.isUndefined(vars)){
            return _template;
        } else {
            return _template(vars);
        }

    }

    public createIndex():Generator {
        var indexDoc:Document = this.documents.make('../README.md');
        indexDoc.setFileDestPath('index.html');
        indexDoc.create();
        return this;
    }
}

export interface MenuItem {
    name?:string;
    icon?:string;
    id?:string;
    parentId?:string;
    typedoc?:string;
    sassdoc?:string;
    doc?:string;
    href?:string;
    type?:string;
    children?:Array<MenuItem>;
}

export class Menu {
    items:any[];

    constructor(items:any = {}) {
        this.items = [];
        this.process(items);
    }

    process(items:Array<MenuItem>, parentId?:any) {
        var self:Menu = this;
        items.forEach(function (item:MenuItem) {
            item = self.resolveType(item);
            item.id = item.name;
            if (kindOf(parentId) !== 'undefined') {
                item.parentId = parentId;
                item.id = [parentId, item.name].join('||');
            }
            if (kindOf(item.children) !== 'undefined') {
                self.process(item.children, item.id);
                delete item.children;
            }
            self.items.push(item);
        });
    }

    resolveType(item:MenuItem):MenuItem {
        switch (item.type) {
            case "doc":
                var filePath:string = path.basename(item.doc, path.extname(item.doc));
                item.href = path.join(config('baseUrl'), path.dirname(item.doc), filePath + '.html');
                break;
            case 'index':
                item.href = path.join(config('baseUrl'), 'index.html');
                break;
            case "parent":
                item.href = 'javascript:;';
                break;
            case "sassdoc":
                item.href = path.join(config('baseUrl'), 'sassdoc', item.sassdoc);
                break;
            case "typedoc":
                item.href = path.join(config('baseUrl'), 'typedoc', item.typedoc);
                break;
        }
        return item;
    }

    public find(opts:any) {
        return _.find(this.items, opts);
    }

    public getTree() {
        return treeify(this.items); //console.log(util.inspect(this.flat, { colors: true, depth: 5, hidden: true }));
    }

}
