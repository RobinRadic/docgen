/// <reference path="types.d.ts" />
/// <amd-dependency path="bootstrap" />
/// <amd-dependency path="material" />


// Delete later, just for compiling it always
//import ExamplePlugin = require('./plugins/example');
import StylerPlugin = require('./plugins/styler');
import CustomizerPlugin = require('./plugins/customizer');
import material = require('./modules/material');
// end delete later



import $ = require('jquery');
import EventEmitter2 = require('eventemitter2');
import * as util from './modules/utilities';
import {Plugins} from './plugins';
import {Layout,Preferences} from './layout';
import {Loader} from './classes/Loader';

import {Debug,debug} from './modules/debug';
import {IConfig,IConfigProperty,ConfigObject} from './modules/configuration';
import {DeferredInterface,create} from './modules/promise';


var $window:JQuery = $(window),
    $document:JQuery = $(document),
    $body:JQuery = $(document.body);


var cre = util.cre,
    def = util.def,
    defined = util.defined,
    trim = util.trim;


util.addJqueryUtils();

// events: make, init, boot, booted

/**
 * @class Packadic
 */
export class Packadic {
    protected static _instance:Packadic;
    public DEBUG:boolean = false;

    public config:IConfigProperty;
    protected _config:IConfig;

    public initialised:boolean;
    public booted:boolean;
    public timers:any = {construct: null, init: null, boot: null};
    protected browser:any = {ie8: false, ie9: false, ie10: false};
    public util:any = util;

    public layout:Layout;
    public plugins:Plugins;
    public preferences:Preferences;
    public events:EventEmitter2;

    constructor() {
        this.events = new EventEmitter2({
            wildcard: true,
            delimiter: ':',
            maxListeners: 1000,
            newListener: true
        });
        $body.data('packadic', this);
        var self:Packadic = this;
        this.timers.construct = new Date;
        this.initialised = false;
        this.booted = false;

        this.layout = new Layout(this);
        this.plugins = new Plugins(this);

        this.browser.ie8 = !!navigator.userAgent.match(/MSIE 8.0/);
        this.browser.ie9 = !!navigator.userAgent.match(/MSIE 9.0/);
        this.browser.ie10 = !!navigator.userAgent.match(/MSIE 10.0/);

        var resize:number;
        $(window).resize(function () {
            if (resize) {
                clearTimeout(resize);
            }
            resize = setTimeout(function () {
                self.emit('resize');
            }, 50);
        });
        this.emit('make');
    }

    /**
     * @returns {Packadic}
     */
    public static get instance() {
        if (typeof Packadic._instance === "undefined") {
            Packadic._instance = new Packadic();
        }
        return Packadic._instance;
    }

    public init(opts:any = {}):Packadic {
        if (this.initialised) {
            return;
        } else {
            this.initialised = true;
        }
        this.timers.init = new Date;

        if (this.DEBUG) {
            debug.enable();
            debug.setStartDate(this.timers.construct);
        }

        this._config = new ConfigObject($.extend({}, typeof window.packadicConfig == 'object' && window.packadicConfig, opts));
        this.config = ConfigObject.makeProperty(this._config);
        this.emit('init');
        return this;
    }

    public boot():Packadic {
        if (this.booted) {
            return;
        } else {
            this.booted = true;
        }
        this.emit('boot');
        this.timers.boot = new Date;
        $('*[data-toggle="popover"]').popover();
        $('*[data-toggle="tooltip"]').tooltip();
        $.material.options = this.config.get('vendor.material');
        $.material.init();
        this.initHighlight();
        this.emit('booted');
        return this;
    }


    public el(selectorName:string):JQuery{
        var selector:string = this.config('app.selectors.' + selectorName);
        return $(selector);
    }

    public removePageLoader() {
        $('body').removeClass('page-loading');
    }

    public createLoader(name, el):Loader {
        return new Loader(name, el);
    }


    public isIE(version:number = 0):boolean {
        if (version === 0) {
            if (this.browser.ie8 || this.browser.ie9 || this.browser.ie10) {
                return true;
            }
        } else if (version === 8) {
            return <boolean> this.browser.ie8;
        } else if (version === 9) {
            return <boolean> this.browser.ie9;
        } else if (version === 10) {
            return <boolean> this.browser.ie10;
        } else {
            return false;
        }
    }

    /**
     * Returns the view port
     * @returns {{width: *, height: *}}
     */
    public getViewPort():any {
        return util.getViewPort()
    }

    /**
     * Checks if the current device is a touch device
     * @returns {boolean}
     */
    public isTouchDevice():boolean {
        return util.isTouchDevice();
    }

    /**
     * Generates a random ID
     * @param {Number} length
     * @returns {string}
     */
    public getRandomId(length?:number):string {
        return util.getRandomId(length);
    }

    public getBreakpoint(which:string) {
        return parseInt(this.config.get('app.breakpoints.screen-' + which + '-min').replace('px', ''));
    }

    public promise<T>():DeferredInterface<T> {
        return create();
    }



    public scrollTo(el?:any, offset?:number) {
        var $el:JQuery = typeof(el) === 'string' ? $(el) : el;
        var pos = ($el && $el.size() > 0) ? $el.offset().top : 0;

        if ($el) {
            if ($body.hasClass('page-header-fixed')) {
                pos = pos - $('.page-header').height();
            } else if ($body.hasClass('page-header-top-fixed')) {
                pos = pos - $('.page-header-top').height();
            } else if ($body.hasClass('page-header-menu-fixed')) {
                pos = pos - $('.page-header-menu').height();
            }
            pos = pos + (offset ? offset : -1 * $el.height());
        }

        $('html,body').animate({
            scrollTop: pos
        }, 'slow');
    }

    public scrollTop() {
        this.scrollTo();
    }



    public highlight(code:string, lang?:string, wrap:boolean = false, wrapPre:boolean = false):JQueryPromise<any> {
        var defer:JQueryDeferred<any> = $.Deferred();
        require(['highlightjs', 'css!highlightjs-css/' + this.config('highlightjs.theme')], function (hljs:HighlightJS) {
            var highlighted;
            if (lang && hljs.getLanguage(lang)) {
                highlighted = hljs.highlight(lang, code).value;
            } else {
                highlighted = hljs.highlightAuto(code).value;
            }
            if (wrap) {
                highlighted = '<code class="hljs">' + highlighted + '</code>';
            }
            if (wrapPre) {
                highlighted = '<pre>' + highlighted + '</pre>';
            }
            defer.resolve(highlighted);
        });
        return defer.promise();
    }

    initHighlight() {
        require(['highlightjs', 'css!highlightjs-css/' + this.config('vendor.highlightjs.theme')], function (hljs:HighlightJS) {
            hljs.initHighlighting();
        });
    }


    public makeSlimScroll(el:any, opts:any = {}) {
        var self:Packadic = this;
        var $el:JQuery = typeof(el) === 'string' ? $(el) : el;
        require(['slimscroll'], function () {
            $el.each(function () {
                if ($(this).attr("data-initialized")) {
                    return; // exit
                }
                var height = $(this).attr("data-height") ? $(this).attr("data-height") : $(this).css('height');
                var data = _.merge(self.config('vendor.slimscroll'), $(this).data(), {height: height});
                $(this).slimScroll($.extend(true, data, opts));
                $(this).attr("data-initialized", "1");
            });
        });
    }

    public destroySlimScroll(el:any) {
        var $el:JQuery = typeof(el) === 'string' ? $(el) : el;
        $el.each(function () {
            if ($(this).attr("data-initialized") === "1") { // destroy existing instance before updating the height
                $(this).removeAttr("data-initialized");
                $(this).removeAttr("style");

                var attrList = {};

                // store the custom attribures so later we will reassign.
                if ($(this).attr("data-handle-color")) {
                    attrList["data-handle-color"] = $(this).attr("data-handle-color");
                }
                if ($(this).attr("data-wrapper-class")) {
                    attrList["data-wrapper-class"] = $(this).attr("data-wrapper-class");
                }
                if ($(this).attr("data-rail-color")) {
                    attrList["data-rail-color"] = $(this).attr("data-rail-color");
                }
                if ($(this).attr("data-always-visible")) {
                    attrList["data-always-visible"] = $(this).attr("data-always-visible");
                }
                if ($(this).attr("data-rail-visible")) {
                    attrList["data-rail-visible"] = $(this).attr("data-rail-visible");
                }

                $(this).slimScroll(<any> {
                    wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                    destroy: true
                });

                var the = $(this);

                // reassign custom attributes
                $.each(attrList, function (key, value) {
                    the.attr(key, value);
                });

                $(this).parent().find('> .slimScrollBar, > .slimScrollRail').remove();
            }
        });
    }



    public get debug():Debug {
        return debug;
    }

    /****************************/
    // Events
    /****************************/

    public on(event:string, listener:Function):Packadic {
        this.events.on(event, listener);
        return this;
    }

    public once(event:string, listener:Function):Packadic {
        this.events.once(event, listener);
        return this;
    }

    public off(event:string, listener:Function):Packadic {
        this.events.off(event, listener);
        return this;
    }

    public emit(event:string, ...args:any[]):Packadic {
        if(this.DEBUG) {
            debug.logEvent(event, args);
        }
        this.events.emit(event, args);
        return this;
    }
}

export var instance:Packadic = Packadic.instance;
