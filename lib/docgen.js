var path = require('path');
var _ = require('lodash');
var fse = require('fs-extra');
var index_1 = require("./index");
var utilities_1 = require("./modules/utilities");
var documents_1 = require("./modules/documents");
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
var Docgen = (function () {
    function Docgen() {
        this.menu = new Menu(index_1.config.get('menu'));
        this.documents = new documents_1.DocumentCollection();
    }
    Docgen.prototype.clean = function () {
        fse.removeSync(index_1.destPath());
        return this;
    };
    return Docgen;
})();
exports.Docgen = Docgen;
//# sourceMappingURL=docgen.js.map