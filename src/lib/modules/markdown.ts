/// <reference path='./../types.d.ts' />
import util = require('util');
import path = require('path');
import _ = require('lodash');
import fse = require('fs-extra');
import globule = require('globule');
import jsyaml = require('js-yaml');
import marked = require('marked');

import {objectGet,objectSet,kindOf} from './../modules/utilities';

var fmExp = /---[\s\t\n]([\w\W]*?)\n---/;

var renderer:any = new marked['Renderer']();
renderer.heading = function (text:string, level:number) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

    return '<h' + level + '><a name="' +
        escapedText +
        '" class="anchor" href="#' +
        escapedText +
        '"><span class="header-link"></span></a>' +
        text + '</h' + level + '>';

};

export function getRawFM(str):string {
    return str.match(fmExp)[1];
}

export function removeFM(str):string {
    return str.replace(fmExp, '');
}

export function parseFM(fileContent:string):{} {
    return jsyaml.safeLoad(fileContent.toString().match(fmExp)[1]);
}

export function parse(fileContent, removeFrontMatter):string {
    removeFrontMatter = typeof removeFrontMatter === 'undefined' ? true : removeFrontMatter;

    fileContent = removeFrontMatter ? removeFM(fileContent) : fileContent;
    return marked.parse(fileContent, {
        renderer: renderer,
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    });
}
