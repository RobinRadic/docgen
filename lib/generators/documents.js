var path = require('path');
var _ = require('lodash');
var fse = require('fs-extra');
var globule = require('globule');
var index_1 = require("./../index");
var markdown_1 = require('./../modules/markdown');
var DocumentCollection = (function () {
    function DocumentCollection(generator) {
        var self = this;
        this._generator = generator;
        self.documents = {};
        globule.find(index_1.docsPath('**/*.md')).forEach(function (filePath) {
            var relFilePath = path.relative(index_1.docsPath(), filePath);
            self.documents[relFilePath] = new Document(self.generator, relFilePath);
        });
    }
    Object.defineProperty(DocumentCollection.prototype, "generator", {
        get: function () {
            return this._generator;
        },
        enumerable: true,
        configurable: true
    });
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
    DocumentCollection.prototype.generateAll = function () {
        _.each(this.documents, function (document) {
            document.create();
        });
        return this._generator;
    };
    DocumentCollection.prototype.make = function (filePath) {
        return new Document(this.generator, filePath);
    };
    return DocumentCollection;
})();
exports.DocumentCollection = DocumentCollection;
var Document = (function () {
    function Document(generator, filePath) {
        this._generator = generator;
        this.filePath = filePath;
        this.fileName = path.basename(filePath, path.extname(filePath));
        this.setFileDestPath(path.join(path.dirname(filePath), this.fileName + '.html'));
    }
    Object.defineProperty(Document.prototype, "generator", {
        get: function () {
            return this._generator;
        },
        enumerable: true,
        configurable: true
    });
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
        var html = this.generator.compileView(doc.view, {
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
