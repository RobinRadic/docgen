/// <reference path='./types.d.ts' />
var util = require('util');
var path = require('path');
var _ = require('lodash');
var fse = require('fs-extra');
var jade = require('jade');
var index_1 = require("./index");
var utilities_1 = require("./modules/utilities");
var documents_1 = require("./generators/documents");
var typedoc_1 = require("./generators/typedoc");
var theme_1 = require("./generators/theme");
var sassdoc_1 = require("./generators/sassdoc");
var Generator = (function () {
    function Generator() {
        this._menu = new Menu(index_1.config('menu'));
        this._documents = new documents_1.DocumentCollection(this);
        this._theme = new theme_1.Theme(this);
        this._typedoc = new typedoc_1.Typedoc(this);
        this._sassdoc = new sassdoc_1.Sassdoc(this);
    }
    Generator.prototype.clean = function () {
        fse.removeSync(index_1.destPath());
        return this;
    };
    Object.defineProperty(Generator.prototype, "menu", {
        get: function () {
            return this._menu;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Generator.prototype, "documents", {
        get: function () {
            return this._documents;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Generator.prototype, "typedoc", {
        get: function () {
            return this._typedoc;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Generator.prototype, "sassdoc", {
        get: function () {
            return this._sassdoc;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Generator.prototype, "theme", {
        get: function () {
            return this._theme;
        },
        enumerable: true,
        configurable: true
    });
    Generator.prototype.compileView = function (view, vars) {
        var self = this;
        var viewPath = index_1.rootPath(path.join('src', 'views', view + '.jade'));
        var template = jade.compileFile(viewPath, {
            filename: view + '.jade',
            pretty: true
        });
        var _template = function (locals) {
            return template(_.merge({
                _inspect: function (val) {
                    return util.inspect(val, { colors: false, hidden: true });
                },
                config: index_1.config.get(),
                menu: self.menu
            }, locals));
        };
        if (_.isUndefined(vars)) {
            return _template;
        }
        else {
            return _template(vars);
        }
    };
    Generator.prototype.createIndex = function () {
        var indexDoc = this.documents.make('../README.md');
        indexDoc.setFileDestPath('index.html');
        indexDoc.create();
        return this;
    };
    return Generator;
})();
exports.Generator = Generator;
var Menu = (function () {
    function Menu(items) {
        if (items === void 0) { items = {}; }
        this.items = [];
        this.process(items);
    }
    Menu.prototype.process = function (items, parentId) {
        var self = this;
        items.forEach(function (item) {
            item = self.resolveType(item);
            item.id = item.name;
            if (utilities_1.kindOf(parentId) !== 'undefined') {
                item.parentId = parentId;
                item.id = [parentId, item.name].join('||');
            }
            if (utilities_1.kindOf(item.children) !== 'undefined') {
                self.process(item.children, item.id);
                delete item.children;
            }
            self.items.push(item);
        });
    };
    Menu.prototype.resolveType = function (item) {
        switch (item.type) {
            case "doc":
                var filePath = path.basename(item.doc, path.extname(item.doc));
                item.href = path.join(index_1.config('baseUrl'), path.dirname(item.doc), filePath + '.html');
                break;
            case 'index':
                item.href = path.join(index_1.config('baseUrl'), 'index.html');
                break;
            case "parent":
                item.href = 'javascript:;';
                break;
            case "sassdoc":
                item.href = path.join(index_1.config('baseUrl'), 'sassdoc', item.sassdoc);
                break;
            case "typedoc":
                item.href = path.join(index_1.config('baseUrl'), 'typedoc', item.typedoc);
                break;
        }
        return item;
    };
    Menu.prototype.find = function (opts) {
        return _.find(this.items, opts);
    };
    Menu.prototype.getTree = function () {
        return utilities_1.treeify(this.items); //console.log(util.inspect(this.flat, { colors: true, depth: 5, hidden: true }));
    };
    return Menu;
})();
exports.Menu = Menu;
