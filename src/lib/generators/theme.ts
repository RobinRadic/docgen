/// <reference path='./../types.d.ts' />
import util = require('util');
import path = require('path');
import _ = require('lodash');
import fse = require('fs-extra');
import globule = require('globule');
import jsyaml = require('js-yaml');
import marked = require('marked');
import jade = require('jade');
import sass = require('node-sass');

import {objectGet,objectSet,kindOf} from './../modules/utilities';
import {config,paths,rootPath,destPath,docsPath} from "./../index";
import {parse,getRawFM,parseFM,removeFM} from './../modules/markdown';
import {Result} from "node-sass";
import {Generator} from "../generator";


export class Theme {
    protected _generator:Generator;

    constructor(generator:Generator) {
        this._generator = generator;
    }

    public get generator():Generator {
        return this._generator;
    }

    public copyToAssets(pathRoot:string, filePaths:string[]):Theme  {
        filePaths.forEach(function (filePath:string) {
            fse.copySync(rootPath(path.join(pathRoot, filePath)), destPath(path.join('assets', filePath)));
        });
        return this;
    }

    public createStyle(srcFile:string):Theme  {
        var fileName:string = path.basename(srcFile, path.extname(srcFile));
        var outFile:string = destPath(path.join('assets', 'styles', path.dirname(srcFile), fileName + '.css'));
        var rendered:Result = sass.renderSync({
            file: rootPath(path.join('src/styles', srcFile)),
            outFile: outFile,
            outputStyle: 'compressed'
        });
        fse.mkdirpSync(path.dirname(outFile));
        fse.writeFileSync(outFile, rendered.css);
        return this;

    }


    public createStyles(files:string[]):Theme {
        var self:Theme = this;
        files.forEach(function (file) {
            self.createStyle(file);
        });
        return this;
    }

    public createAssets():Generator {
        this//.createStyles(['stylesheet.scss', 'themes/theme-default.scss', 'typedoc/main.sass', 'sassdoc/main.scss'])
            .copyToAssets('src', ['images', 'fonts'])
            .copyToAssets('dist/assets', ['scripts', 'styles'])
            .copyToAssets('', ['bower_components']);
        return this._generator;
    }
}
