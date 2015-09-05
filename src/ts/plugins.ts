/// <reference path="types.d.ts" />
import $ = require('jquery');
import {Packadic} from './Packadic';
import {BaseApp} from './BaseApp';
import {kindOf,defined,ucfirst} from './modules/utilities';
import {debug} from './modules/debug';




export interface IPluginRegisterOptions {
    'namespace'?:string;
    'class'?:any;
    'name'?:string;
    'callback'?:Function,
    'loadPath'?:string;
}

export class Plugins extends BaseApp {
    protected namespacePrefix:string = 'packadic.';
    protected _plugins:{[key: string]: IPluginRegisterOptions} = {};
    protected defaultRegOpts:IPluginRegisterOptions = {
        loadPath: 'app/plugins/',
        callback: $.noop()
    };

    protected boot() {
        var self:Plugins = this;
        var plugins:string[] = this.config('app.plugins');
    }

    protected _add(name:string, PluginClass:any, regOpts?:IPluginRegisterOptions):IPluginRegisterOptions {
        if (this.has(name)) {
            throw new Error('Plugin already registered');
        }

        regOpts = <IPluginRegisterOptions> $.extend(true, this.defaultRegOpts, { 'class': PluginClass },regOpts);
        if(kindOf(regOpts.namespace) !== 'string') {
            regOpts.namespace = name;
        }
        regOpts.namespace = this.namespacePrefix + regOpts.namespace;
        return this._plugins[name] = regOpts;
    }

    public register(name:string, PluginClass:any, regOpts?:IPluginRegisterOptions) {
        regOpts = this._add(name, PluginClass, regOpts);
        var packadic:Packadic = this.p;

        function jQueryPlugin(options?:any, ...args:any[]) {
            var all:JQuery = this.each(function () {
                var $this:JQuery = $(this);
                var data:any = $this.data(regOpts.namespace);
                var opts:any = $.extend({}, PluginClass.defaults, $this.data(), typeof options == 'object' && options);

                if (!data) {
                    $this.data(regOpts.namespace, (data = new PluginClass(packadic, this, opts, regOpts.namespace)));
                }

                if (kindOf(options) === 'string') {
                    data[options].call(data, args);
                }

                if (kindOf(regOpts.callback) === 'function') {
                    regOpts.callback.apply(this, [data, opts]);
                }
            });


            if (kindOf(options) === 'string' && options === 'instance' && all.length > 0) {
                if (all.length === 1) {
                    return $(all[0]).data(regOpts.namespace);
                } else {
                    var instances:BasePlugin[] = [];
                    all.each(function () {
                        instances.push($(this).data(regOpts.namespace));
                    });
                    return instances;
                }
            }

            return all;
        }

        var old:any = $.fn[name];
        $.fn[name] = jQueryPlugin;
        $.fn[name].Constructor = PluginClass;
    }

    public load(name:any, cb?:Function, loadPath:string = 'plugins/') {
        var self:Plugins = this;
        if(kindOf(name) === 'array'){
            return name.forEach(function (n:string) {
                self.load(n, cb, loadPath);
            });
        }

        if (this.has(name)) {
            loadPath = this.get(name).loadPath;
        }

        require([loadPath + name], function () {
            if (kindOf(cb) === 'function') {
                cb.apply(this, arguments)
            }
        })

    }

    public has(name:string):boolean {
        return kindOf(name) === 'string' && Object.keys(this._plugins).indexOf(name) !== -1;
    }

    public get(name?:string):IPluginRegisterOptions {
        return defined(name) ? this._plugins[name] : this._plugins;
    }
}


export function register(name:string, PluginClass:any, ns?:string, callback?:Function){
    var packadic:Packadic = $('body').data('packadic');
    packadic.plugins.register.apply(packadic.plugins, arguments);
}

export class BasePlugin {
    public get options():any {
        return this._options;
    }
    public static register(name:string, PluginClass:any, ns?:string, callback?:Function){
        register.call(arguments);
    }

    public static defaults:any = {};

    public VERSION:string = '0.0.0';
    public NAMESPACE:string = 'packadic.';

    public enabled:boolean = true;
    protected packadic:Packadic;
    protected _options:any;
    protected $window:JQuery;
    protected $document:JQuery;
    protected $body:JQuery;
    protected $element:JQuery;

    constructor(packadic:Packadic, element:any, options:any, ns:string) {
        this.packadic = packadic;
        this._options = options;
        this.$window = $(window);
        this.$document = $(document);
        this.$body = $(document.body);
        this.$element = $(element);
        this.NAMESPACE = ns;
        this._trigger('create');
        this._create();
        this._trigger('created');
    }

    public instance():BasePlugin {
        return this;
    }


    protected _create() {
    }

    protected _destroy() {
    }

    public destroy() {
        this._trigger('destroy');
        this._destroy();
        this._trigger('destroyed');
    }


    public _trigger(name:string, extraParameters?:any[]|Object):BasePlugin {
        var e:JQueryEventObject = $.Event(name + '.' + this.NAMESPACE);
        this.$element.trigger(e, extraParameters);
        return this;
    }


    public _on(name:string, cb:any):BasePlugin;
    public _on(name:string, sel?:string, cb?:any):BasePlugin;
    public _on(...args:any[]):any {
        args[0] = args[0] + '.' + this.NAMESPACE;
        debug.log('plugin _on ', this, args);
        this.$element.on.apply(this.$element, args);
        return this;
    }
}
