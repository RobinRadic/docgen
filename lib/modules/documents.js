/// <reference path='./../types.d.ts' />
var util = require('util');
var path = require('path');
var _ = require('lodash');
var fse = require('fs-extra');
var globule = require('globule');
var jade = require('jade');
var index_1 = require("./../index");
var markdown_1 = require('./markdown');
var DocumentCollection = (function () {
    function DocumentCollection(generator) {
        var self = this;
        self.generator = generator;
        self.documents = {};
        globule.find(index_1.docsPath('**/*.md')).forEach(function (filePath) {
            var relFilePath = path.relative(index_1.docsPath(), filePath);
            self.documents[relFilePath] = new Document(self.generator, relFilePath);
        });
    }
    DocumentCollection.prototype.all = function () {
        return this.documents;
    };
    DocumentCollection.prototype.get = function (relFilePath) {
        return this.documents[relFilePath];
    };
    DocumentCollection.prototype.has = function (relFilePath) {
        return typeof this.documents[relFilePath] !== 'undefined';
    };
    DocumentCollection.prototype.create = function (relFilePath) {
        this.documents[relFilePath].create();
        return this;
    };
    DocumentCollection.prototype.createAll = function () {
        _.each(this.documents, function (document) {
            document.create();
        });
        return this;
    };
    DocumentCollection.prototype.make = function (filePath) {
        return new Document(this.generator, filePath);
    };
    return DocumentCollection;
})();
exports.DocumentCollection = DocumentCollection;
var Document = (function () {
    function Document(generator, filePath) {
        this.generator = generator;
        this.filePath = filePath;
        this.fileName = path.basename(filePath, path.extname(filePath));
        this.setFileDestPath(path.join(path.dirname(filePath), this.fileName + '.html'));
    }
    Document.prototype.setFileDestPath = function (filePath) {
        this.fileDestPath = index_1.destPath(filePath);
    };
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
            _inspect: function (val) {
                return util.inspect(val, { colors: false, hidden: true });
            },
            config: index_1.config.get(),
            menu: this.generator.menu,
            doc: doc
        });
        fse.mkdirpSync(path.dirname(this.fileDestPath));
        fse.writeFileSync(this.fileDestPath, html);
        return this;
    };
    return Document;
})();
exports.Document = Document;
//# sourceMappingURL=documents.js.map