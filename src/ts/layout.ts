/// <reference path="types.d.ts" />
import {Packadic} from './Packadic';
import * as $ from 'jquery';
import async = require('async');
import {BaseApp} from './BaseApp';
import util  = require('./modules/utilities');
import {DeferredInterface} from './modules/promise';
import {ConfigObject,IConfig,IConfigProperty} from './modules/configuration';
import storage  = require('./modules/storage');
import svg = require('svg');

import {debug} from './modules/debug';
var log:any = debug.log;



var $window:JQuery = $(<any> window),
    $document:JQuery = $(<any> document),
    $body:JQuery = $('body'),
    $header:JQuery = $.noop(),
    $headerInner:JQuery = $.noop(),
    $container:JQuery = $.noop(),
    $content:JQuery = $.noop(),
    $sidebar:JQuery = $.noop(),
    $sidebarMenu:JQuery = $.noop(),
    $search:JQuery = $.noop(),
    $footer:JQuery = $.noop();


function assignElements($e:any) {
    $header = $e('header');
    $headerInner = $e('header-inner');
    $container = $e('container');
    $content = $e('content');
    $sidebar = $e('sidebar');
    $sidebarMenu = $e('sidebar-menu');
    $footer = $e('footer');
    $search = $e('search');
}


export class Layout extends BaseApp {

    public openCloseInProgress:boolean = false;
    public closing:boolean = false;
    public logo:any = {};

    public boot() {
        var self:Layout = this;
        assignElements(self.p.el.bind(self.p)); //assignElements((selectorName:string) => { return self.p.el(selectorName) });
        self._initHeader();
        self._initFixed();
        self._initSubmenus();
        self._initToggleButton();
        self._initGoTop();
        self._initPreferences();
        self._initLogo();
        self.sidebarResolveActive();
        self.p.on('resize', function(){
            self._initFixed();
        });
        self.fixBreadcrumb();
    }

    public setLogoText(logoText:string):any {
        window['SVG'] = svg;
        var logo:svgjs.Doc = svg('logo');
        logo.clear();
        logo.size(200, 50)
            .viewbox(0, 0, 200, 50)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        var text:svgjs.Element = logo.text(logoText);
        var image:svgjs.Element = logo.image('http://svgjs.com//images/shade.jpg');

        text.attr('dy', '.3em')
            .font(<any> {
            family: 'Purisa, Source Code Pro',
            anchor: 'start',
            size: this.config('docgen.logo.size'),
            leading: 1
        })
            .x(this.config('docgen.logo.x'))
            .y(this.config('docgen.logo.y'));


        image
            .size(650, 650)
            .y(-150)
            .x(-150)
            .clipWith(text);

        this.logo = { container: logo, text: text, image:image };

    }

    protected _initLogo(){
        this.setLogoText(this.config('docgen.logo.text'))
    }


    /****************************/
    // Initialisation
    /****************************/


    protected _initHeader() {
        var self:Layout = this;

    }

    public fixBreadcrumb(){
        var $i:JQuery = $('.page-breadcrumb').find('> li').last().find('i');
        if($i.size() > 0){
            $i.remove();
        }
    }

    protected _initGoTop() {
        var self:Layout = this;
        var offset = 300;
        var duration = 500;

        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) { // ios supported
            $window.bind("touchend touchcancel touchleave", function (e) {
                if ($(this).scrollTop() > offset) {
                    $('.scroll-to-top').fadeIn(duration);
                } else {
                    $('.scroll-to-top').fadeOut(duration);
                }
            });
        } else { // general
            $window.scroll(function () {
                if ($(this).scrollTop() > offset) {
                    $('.scroll-to-top').fadeIn(duration);
                } else {
                    $('.scroll-to-top').fadeOut(duration);
                }
            });
        }

        $('.scroll-to-top').click(function (e) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: 0
            }, duration);
            return false;
        });

    }

    protected _initFixed() {
        this.p.destroySlimScroll($sidebarMenu);
        //$sidebarMenu.parent().find('.slimScrollDiv, .slimScrollBar, .slimScrollRail').remove();
        if (!this.isFixed()) {
            return;
        }
        if (this.p.getViewPort().width >= this.p.getBreakpoint('md')) {
            $sidebarMenu.attr("data-height", this.calculateViewportHeight());
            this.p.makeSlimScroll($sidebarMenu);
            $('.page-content').css('min-height', this.calculateViewportHeight() + 'px');
        }
    }

    protected _initSubmenus() {
        var self:Layout = this;
        $sidebar.on('click', 'li > a', function (e) {
            var $this = $(this);
            if (self.p.getViewPort().width >= self.p.getBreakpoint('md') && $this.parents('.page-sidebar-menu-hover-submenu').size() === 1) { // exit of hover sidebar menu
                return;
            }

            if ($this.next().hasClass('sub-menu') === false) {
                if (self.p.getViewPort().width < self.p.getBreakpoint('md') && $sidebarMenu.hasClass("in")) { // close the menu on mobile view while laoding a page
                    $('.page-header .responsive-toggler').click();
                }
                return;
            }

            if ($this.next().hasClass('sub-menu always-open')) {
                return;
            }

            var $parent = $this.parent().parent();
            var $subMenu = $this.next();

            if (self.config('app.sidebar').keepExpand !== true) {
                $parent.children('li.open').children('a').children('.arrow').removeClass('open');
                $parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(self.config('app.sidebar').slideSpeed);
                $parent.children('li.open').removeClass('open');
            }


            var slideOffeset = -200;

            if ($subMenu.is(":visible")) {
                $this.find('.arrow').removeClass("open");
                $this.parent().removeClass("open");
                $subMenu.slideUp(self.config('app.sidebar').slideSpeed, function () {
                    if (self.config('app.sidebar').autoScroll === true && self.isClosed() === false) {
                        if ($body.hasClass('page-sidebar-fixed')) {
                            $sidebar.slimScroll(<any> {
                                'scrollTo': ($this.position()).top
                            });
                        } else {
                            self.p.scrollTo($this, slideOffeset);
                        }
                    }
                });
            } else {
                $this.find('.arrow').addClass("open");
                $this.parent().addClass("open");
                $subMenu.slideDown(self.config('app.sidebar').slideSpeed, function () {
                    if (self.config('app.sidebar').autoScroll === true && self.isClosed() === false) {
                        if (self.isFixed()) {
                            $sidebar.slimScroll(<any> {
                                'scrollTo': ($this.position()).top
                            });
                        } else {
                            self.p.scrollTo($this, slideOffeset);
                        }
                    }
                });
            }

            e.preventDefault();
        });
        $document.on('click', '.page-header-fixed-mobile .responsive-toggler', function(){
            self.p.scrollTop();
        });
    }

    protected _initToggleButton() {
        var self:Layout = this;
        $body.on('click', self.config('app.sidebar').togglerSelector, function (e) {
            if (self.isClosed()) {
                self.openSidebar();
            } else {
                self.closeSidebar();
            }
        });

        self._initFixedHovered();
    }

    protected _initFixedHovered() {
        var self:Layout = this;
        if (self.isFixed()) {
            $sidebarMenu.on('mouseenter', function () {
                if (self.isClosed()) {
                    $sidebar.removeClass('page-sidebar-menu-closed');
                }
            }).on('mouseleave', function () {
                if (self.isClosed()) {
                    $sidebar.addClass('page-sidebar-menu-closed');
                }
            });
        }
    }


    /*************/
    // Preferences
    /*************/

    protected _preferences:Preferences;

    public get preferences():Preferences {
        return this._preferences;
    }

    protected _initPreferences() {
        var self:Layout = this;
        var prefs:Preferences = this._preferences = new Preferences(this);

        prefs.bind('header.fixed', 'set', this.setHeaderFixed);
        prefs.bind('footer.fixed', 'set', this.setFooterFixed);
        prefs.bind('page.boxed', 'set', this.setBoxed);

        /*
        prefs.bind('sidebar.hidden', 'set', () => this.sidebar.then(function (sidebar:SidebarPlugin) {
            prefs.get('sidebar.hidden') ? sidebar.hide() : sidebar.show();
        }));
        prefs.bind('sidebar.closed', 'set', () => this.sidebar.then(function (sidebar:SidebarPlugin) {
            prefs.get('sidebar.closed') ? sidebar.close() : sidebar.open();
        }));
        prefs.bind('sidebar.fixed', 'set', () => this.sidebar.then(function (sidebar:SidebarPlugin) {
            sidebar.setFixed(prefs.get('sidebar.fixed'))
        }));
        prefs.bind('sidebar.compact', 'set', () => this.sidebar.then(function (sidebar:SidebarPlugin) {
            sidebar.setCompact(prefs.get('sidebar.compact'))
        }));
        prefs.bind('sidebar.hover', 'set', () => this.sidebar.then(function (sidebar:SidebarPlugin) {
            sidebar.setHover(prefs.get('sidebar.hover'))
        }));
        prefs.bind('sidebar.reversed', 'set', () => this.sidebar.then(function (sidebar:SidebarPlugin) {
            sidebar.setReversed(prefs.get('sidebar.reversed'))
        }));
        */
        prefs.callAllBindings();
    }


    /****************************/
    // Sidebar interaction
    /****************************/

    protected setSidebarClosed(closed:boolean = true) {
        $body.ensureClass("page-sidebar-closed", closed);
        $sidebarMenu.ensureClass("page-sidebar-menu-closed", closed);
        if (this.isClosed() && this.isFixed()) {
            $sidebarMenu.trigger("mouseleave");
        }
        $window.trigger('resize');
    }

    public closeSubmenus() {
        var self:Layout = this;
        $sidebarMenu.find('ul.sub-menu').each(function () {
            var $ul:JQuery = $(this);
            if ($ul.is(":visible")) {
                $('.arrow', $ul).removeClass("open");
                $ul.parent().removeClass("open");
                $ul.slideUp(self.config('app.sidebar').slideSpeed);
            }
        });
        this.p.emit('sidebar:close-submenus');
    }

    public closeSidebar(callback?:any):JQueryPromise<any> {
        var self:Layout = this;
        var $main = $('main');

        if (self.openCloseInProgress || self.isClosed()) {
            return;
        }
        self.openCloseInProgress = true;
        self.closing = true;
        var defer:any = $.Deferred();

        this.p.emit('sidebar:close');
        self.closeSubmenus();

        var $title = $sidebarMenu.find('li a span.title, li a span.arrow');
        var $content = self.p.el('content');

        async.parallel([
            function (cb:any) {
                $content.animate({
                    'margin-left': self.config('app.sidebar').closedWidth
                }, self.config('app.sidebar').openCloseDuration, function () {
                    cb();
                })
            },
            function (cb:any) {
                $sidebar.animate({
                    width: self.config('app.sidebar').closedWidth
                }, self.config('app.sidebar').openCloseDuration, function () {
                    cb();
                })
            },
            function (cb:any) {
                var closed = 0;
                $title.animate({
                    opacity: 0
                }, self.config('app.sidebar').openCloseDuration / 3, function () {
                    closed++;
                    if (closed == $title.length) {
                        $title.css('display', 'none');
                        cb();
                    }
                })
            }
        ], function (err, results) {

            self.setSidebarClosed(true);
            $sidebar.removeAttr('style');
            $content.removeAttr('style');
            $title.removeAttr('style');

            self.closing = false;
            self.openCloseInProgress = false;

            if (_.isFunction(callback)) {
                callback();
            }
            defer.resolve();
            self.p.emit('sidebar:closed');
        });
        return defer.promise();
    }

    public openSidebar(callback?:any):JQueryPromise<any> {
        var self:Layout = this;
        if (self.openCloseInProgress || !self.isClosed()) {
            return;
        }

        self.openCloseInProgress = true;
        var defer:any = $.Deferred();
        var $title:JQuery = $sidebarMenu.find('li a span.title, li a span.arrow');
        var $content = self.p.el('content');
        self.setSidebarClosed(false);

        this.p.emit('sidebar:open');
        async.parallel([
            function (cb:any) {
                $content.css('margin-left', self.config('app.sidebar').closedWidth)
                    .animate({
                    'margin-left': self.config('app.sidebar').openedWidth
                }, self.config('app.sidebar').openCloseDuration, function () {
                    cb();
                })
            },
            function (cb:any) {
                $sidebar.css('width', self.config('app.sidebar').closedWidth)
                    .animate({
                    width: self.config('app.sidebar').openedWidth
                }, self.config('app.sidebar').openCloseDuration, function () {
                    cb();
                })
            },
            function (cb:any) {
                var opened = 0;

                $title.css({
                    opacity: 0,
                    display: 'none'
                });
                setTimeout(function () {
                    $title.css('display', 'initial');
                    $title.animate({
                        opacity: 1
                    }, self.config('app.sidebar').openCloseDuration / 2, function () {
                        opened++;
                        if (opened == $title.length) {
                            $title.css('display', 'none');
                            cb();
                        }
                    })
                }, self.config('app.sidebar').openCloseDuration / 2)
            }
        ], function (err, results) {
            $content.removeAttr('style');
            $sidebar.removeAttr('style');
            $title.removeAttr('style');

            self.openCloseInProgress = false;

            if (_.isFunction(callback)) {
                callback();
            }
            defer.resolve();

            self.p.emit('sidebar:opened');
        });
        return defer.promise();
    }

    public hideSidebar() {
        if (this.preferences.get('sidebar.hidden')) {
            return;
        }

        if (!$body.hasClass('page-sidebar-closed')) {
            $body.addClass('page-sidebar-closed');
        }
        if (!$body.hasClass('page-sidebar-hide')) {
            $body.addClass('page-sidebar-hide');
        }
        $('header.top .sidebar-toggler').hide();
        this.p.emit('sidebar:hide');
    }

    public showSidebar() {
        //this.options.hidden = false;
        $body.removeClass('page-sidebar-closed')
            .removeClass('page-sidebar-hide');
        $('header.top .sidebar-toggler').show();
        this.p.emit('sidebar:show');
    }

    protected sidebarResolveActive() {
        var self:Layout = this;
        if(this.config('app.sidebar.resolveActive') !== true) return;
        var currentPath = util.trim(location.pathname.toLowerCase(), '/');
        var md = this.p.getBreakpoint('md');
        if (this.p.getViewPort().width < md) {
            return; // not gonna do this for small devices
        }
        $sidebarMenu.find('a').each(function () {
            var href:string = this.getAttribute('href');
            if (!_.isString(href)) {
                return;
            }

            href = util.trim(href)
                .replace(location['origin'], '')
                .replace(/\.\.\//g, '');

            if(location['hostname'] !== 'localhost'){
                href = self.config('docgen.baseUrl') + href;
            }

            var path = util.trim(href, '/');
            debug.log(path, currentPath, href);

            if (path == currentPath) { //util.strEndsWith(path, currentPath)
                debug.log('Resolved active sidebar link', this);
                var $el = $(this);
                $el.parent('li').not('.active').addClass('active');
                var $parentsLi = $el.parents('li').addClass('open');
                $parentsLi.find('.arrow').addClass('open');
                $parentsLi.has('ul').children('ul').show();
            }
        })

    }




    public setSidebarFixed(fixed:boolean) {
        $body.ensureClass("page-sidebar-fixed", fixed);

        $sidebarMenu.ensureClass("page-sidebar-menu-fixed", fixed);
        $sidebarMenu.ensureClass("page-sidebar-menu-default", !fixed);
        if (!fixed) {
            $sidebarMenu.unbind('mouseenter').unbind('mouseleave');
        } else {
            this._initFixedHovered();
        }
        this._initFixed();
        this.p.emit('sidebar:' + fixed ? 'fix' : 'unfix');
    }

    public setSidebarCompact(compact:boolean) {
        $sidebarMenu.ensureClass("page-sidebar-menu-compact", compact);
        this.p.emit('sidebar:' + compact ? 'compact' : 'decompact');
    }

    public setSidebarHover(hover:boolean) {
        $sidebarMenu.ensureClass("page-sidebar-menu-hover-submenu", hover && !this.isFixed());
        this.p.emit('sidebar:' + hover ? 'hover' : 'dehover');
    }

    public setSidebarReversed(reversed:boolean) {
        $body.ensureClass("page-sidebar-reversed", reversed);
        this.p.emit('sidebar:' + reversed ? 'set-right' : 'set-left');
    }

    public setHeaderFixed(fixed:boolean) {
        if (fixed === true) {
            $body.addClass("page-header-fixed");
            $header.removeClass("navbar-static-top").addClass("navbar-fixed-top");
        } else {
            $body.removeClass("page-header-fixed");
            $header.removeClass("navbar-fixed-top").addClass("navbar-static-top");
        }
    }

    public setFooterFixed(fixed:boolean) {
        if (fixed === true) {
            $body.addClass("page-footer-fixed");
        } else {
            $body.removeClass("page-footer-fixed");
        }
    }

    public setBoxed(boxed:boolean) {
        if (boxed === true) {
            $body.addClass("page-boxed");
            $headerInner.addClass("container");
            var cont = $('body > .clearfix').after('<div class="container"></div>');
            $container.appendTo('body > .container');
            if (this.preferences.get('footer.fixed')) {
                $footer.html('<div class="container">' + $footer.html() + '</div>');
            } else {
                $footer.appendTo('body > .container');
            }
            this.p.emit('resize');
        }
    }

    public reset() {
        $body.
            removeClass("page-boxed").
            removeClass("page-footer-fixed").
            removeClass("page-sidebar-fixed").
            removeClass("page-header-fixed").
            removeClass("page-sidebar-reversed");

        $header.removeClass('navbar-fixed-top');
        $headerInner.removeClass("container");

        if ($container.parent(".container").size() === 1) {
            $container.insertAfter('body > .clearfix');
        }

        if ($('.page-footer > .container').size() === 1) {
            $footer.html($('.page-footer > .container').html());
        } else if ($footer.parent(".container").size() === 1) {
            $footer.insertAfter($container);
            $('.scroll-to-top').insertAfter($footer);
        }

        $('body > .container').remove();

    }


    /****************************/
    // Helpers
    /****************************/


    public calculateViewportHeight() {
        var self:Layout = this;
        var sidebarHeight = util.getViewPort().height - $('.page-header').outerHeight() - 30;
        if ($body.hasClass("page-footer-fixed")) {
            sidebarHeight = sidebarHeight - $footer.outerHeight();
        }

        return sidebarHeight;
    }

    public isClosed():boolean {
        return $body.hasClass('page-sidebar-closed')
    }

    public isHidden():boolean {
        return $body.hasClass('page-sidebar-hide');
    }

    public isFixed():boolean {
        return $('.page-sidebar-fixed').size() !== 0;
    }
}


export class Preferences {

    protected layout:Layout;
    protected p:Packadic;

    constructor(layout:Layout) {
        this.layout = layout;
        this.p = layout.p;

        this.bindings = new ConfigObject();
        this.defaultPreferences = util.dotize(this.config('app.preferences'));
        this.preferencesKeys = Object.keys(this.defaultPreferences);
    }

    protected get config():IConfigProperty {
        return this.p.config;
    }

    protected bindings:IConfig;
    protected preferencesKeys:string[];
    protected defaultPreferences:any;

    public save(key:string, val?:any):Preferences {
        val = util.def(val, this.config('app.preferences.' + key));
        storage.set('packadic.preference.' + key, val);
        this.set(key, val);
        return this;
    }

    public set(key:string, val?:any):Preferences {
        this.config.set('app.preferences.' + key, val);
        this.callBindings(key);
        return this;
    }

    public get(key:string) {
        return storage.get('packadic.preference.' + key, {
            def: this.config('app.preferences.' + key)
        });
    }

    public has(key:string):boolean {
        return this.preferencesKeys.indexOf(key) !== -1;
    }

    public all():any {
        var self:Preferences = this;
        var all:any = {};
        this.preferencesKeys.forEach(function (key) {
            all[key] = self.get(key);
        });
        return all;
    }


    public bind(key:string, name:string, callback:any):Preferences {
        this.bindings.set(key + '.' + name, callback);
        return this;
    }

    public hasBindings(key:string):boolean {
        return typeof this.bindings.get(key) === 'object' && Object.keys(this.bindings.get(key)).length > 0;
    }

    public bound(key:string, name:string):boolean {
        return typeof this.bindings.get(key + '.' + name) === 'function';
    }

    public unbind(key:string, name:string):Preferences {
        this.bindings.unset(key + '.' + name);
        return this;
    }

    public callBindings(key:string):Preferences {
        var self:Preferences = this;
        if (this.hasBindings(key)) {
            var val:any = self.get(key);
            Object.keys(this.bindings.get(key)).forEach(function (name:any) {
                var binding:any = self.bindings.get(key + '.' + name);
                binding.call(self, val);
            })
        }
        return this;
    }

    public callAllBindings():Preferences {
        var self:Preferences = this;
        Object.keys(this.all()).forEach(function(key){
            self.callBindings(key);
        });
        return this;
    }

    public getBindings() {
        return this.bindings.get();
    }
}
