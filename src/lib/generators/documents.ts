/// <reference path='./../types.d.ts' />
import util = require('util');
import path = require('path');
import _ = require('lodash');
import fse = require('fs-extra');
import globule = require('globule');
import jsyaml = require('js-yaml');
import marked = require('marked');
import jade = require('jade');

import {objectGet,objectSet,kindOf} from './../modules/utilities';
import {config,paths,rootPath,destPath,docsPath} from "./../index";
import {parse,getRawFM,parseFM,removeFM} from './../modules/markdown';
import {Generator} from "./../generator";


export class DocumentCollection {
    protected documents:{[key: string]: Document };
    protected _generator:Generator;

    constructor(generator:Generator) {
        var self:DocumentCollection = this;
        this._generator = generator;
        self.documents = {};

        globule.find(docsPath('**/*.md')).forEach(function (filePath:string) {
            var relFilePath:string = path.relative(docsPath(), filePath);
            self.documents[relFilePath] = new Document(self.generator, relFilePath);
        })
    }

    public get generator():Generator {
        return this._generator;
    }

    public all():{[key: string]: Document } {
        return this.documents;
    }

    public get(relFilePath:string):Document {
        return this.documents[relFilePath];
    }

    public has(relFilePath:string):boolean {
        return typeof this.documents[relFilePath] !== 'undefined';
    }

    public create(relFilePath):DocumentCollection {
        this.documents[relFilePath].create();
        return this;
    }

    public generateAll():Generator {
        _.each(this.documents, function (document:Document) {
            document.create();
        });
        return this._generator;
    }

    public make(filePath:string):Document {
        return new Document(this.generator, filePath);
    }
}

export class Document {
    protected filePath:string;
    protected fileName:string;
    protected fileDestPath:string;
    protected _generator:Generator;

    constructor(generator:Generator, filePath:string) {
        this._generator = generator;
        this.filePath = filePath;
        this.fileName = path.basename(filePath, path.extname(filePath));
        this.setFileDestPath(path.join(path.dirname(filePath), this.fileName + '.html'));
    }

    public get generator():Generator {
        return this._generator;
    }

    public setFileDestPath(filePath){
        this.fileDestPath = destPath(filePath);
    }

    public create():Document {
        var self:Document = this;
        var doc:any = {};
        var raw:string = fse.readFileSync(docsPath(this.filePath), 'utf-8');
        var rootPath:string = path.relative(path.dirname(this.fileDestPath), destPath()); // + path.sep;
        rootPath = rootPath.length > 0 ? rootPath + '/' : '';

        doc = _.merge(config('types.doc'), parseFM(raw));
        doc.content = parse(raw, true);
        doc.menuItem = this.generator.menu.find({type: 'doc', doc: this.filePath});

        var html:string = this.generator.compileView(doc.view, {
            menu: this.generator.menu,
            doc: doc,
            rootPath: rootPath
        });


        fse.mkdirpSync(path.dirname(this.fileDestPath));
        fse.writeFileSync(this.fileDestPath, html);
        return this;
    }
}
