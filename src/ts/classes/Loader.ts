/// <reference path="../types.d.ts" />
import {IConfig} from './../modules/configuration';
import $ = require('jquery');

export class Loader {
    private name:string;
    private $el:JQuery;
    private $loader:JQuery;
    private $parent:JQuery;
    private started:boolean;

    constructor(name:string, el:any) {
        this.name = name;
        this.$el = typeof(el) === 'string' ? $(el) : el;
    }

    public stop() {
        if (!this.started) {
            return;
        }
        this.$el.removeClass(this.name + '-loader-content');
        this.$parent.removeClass(this.name + '-loading');
        this.$loader.remove();
        this.started = false;
    }

    public start() {
        if (this.started) {
            return;
        }
        this.$el.addClass(this.name + '-loader-content');
        this.$parent = this.$el.parent().addClass(this.name + '-loading');
        var $loaderInner = $('<div>').addClass('loader loader-' + this.name);
        this.$loader = $('<div>').addClass(this.name + '-loader');
        this.$loader.append($loaderInner).prependTo(this.$parent);
    }
}
