/// <reference path="types.d.ts" />
import {Packadic} from './Packadic';
import $ = require('jquery');
import util  = require('./modules/utilities');
import {IConfigProperty} from './modules/configuration';

import {Plugins} from './plugins';
import {Layout} from './layout';

import {debug} from './modules/debug';
var log:any = debug.log;


export class BaseApp {
    public p:Packadic;

    constructor(p:Packadic) {
        this.p = p;
        p.on('make', this._make.bind(this));
        p.on('init', this._init.bind(this));
        p.on('boot', this._boot.bind(this));
        p.on('booted', this._booted.bind(this));
    }

    protected get config():IConfigProperty {
        return this.p.config;
    }

    private _make() {
        this.make();
    }

    private _init() {
        this.init();
    }

    private _boot() {
        this.boot();
    }

    private _booted() {
        this.booted();
    }

    protected make() {

    }

    protected init() {

    }

    protected boot() {

    }

    protected booted() {

    }
}
