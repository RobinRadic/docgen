/// <reference path='./../types.d.ts' />
var util = require('util');
var path = require('path');
var _ = require('lodash');
var fse = require('fs-extra');
var jade = require('jade');
var index_1 = require("./../index");
var markdown_1 = require('./markdown');
var DocumentCollection = (function () {
    function DocumentCollection() {
    }
    return DocumentCollection;
})();
exports.DocumentCollection = DocumentCollection;
var Document = (function () {
    function Document(documentor, filePath) {
        this.generator = documentor;
        this.filePath = filePath;
        this.fileName = path.basename(filePath, path.extname(filePath));
        this.fileDestPath = index_1.destPath(path.join(path.dirname(filePath), this.fileName + '.html'));
    }
    Document.prototype.create = function () {
        var self = this;
        var doc = {};
        var raw = fse.readFileSync(index_1.docsPath(this.filePath), 'utf-8');
        doc = _.merge(index_1.config('types.doc'), markdown_1.parseFM(raw));
        doc.content = markdown_1.parse(raw, true);
        doc.menuItem = this.generator.menu.find({ type: 'doc', doc: this.filePath });
        var viewPath = index_1.rootPath(path.join('src', 'views', doc.view + '.jade'));
        var template = jade.compileFile(viewPath, {
            filename: this.fileName,
            pretty: true
        });
        var html = template({
            _inspect: function (val) { return util.inspect(val, { colors: false, hidden: true }); },
            config: index_1.config.get(),
            menu: this.generator.menu,
            doc: doc
        });
        fse.mkdirpSync(path.dirname(this.fileDestPath));
        fse.writeFileSync(this.fileDestPath, html);
    };
    return Document;
})();
exports.Document = Document;
//# sourceMappingURL=document.js.map
