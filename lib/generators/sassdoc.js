var path = require('path');
var _ = require('lodash');
var fse = require('fs-extra');
var globule = require('globule');
var sassdoc = require('sassdoc');
var index_1 = require("./../index");
var cli_1 = require("./../cli");
var Sassdoc = (function () {
    function Sassdoc(generator) {
        this._generator = generator;
        this.defaults = {
            readme: 'none',
            theme: index_1.rootPath('src/typedoc-theme'),
            hideGenerator: ''
        };
    }
    Object.defineProperty(Sassdoc.prototype, "generator", {
        get: function () {
            return this._generator;
        },
        enumerable: true,
        configurable: true
    });
    Sassdoc.prototype.generate = function (name) {
        var item = this.getConfig(name);
        return sassdoc(item.files, item.options);
    };
    Sassdoc.prototype.getConfig = function (name) {
        var self = this;
        var item = index_1.config('generators.sassdoc.' + name);
        if (_.isUndefined(item.options)) {
            item.options = {};
        }
        item.options = _.merge(item.options, {
            dest: index_1.destPath(path.join('sassdoc', name)),
            theme: index_1.rootPath('src/sassdoc-theme')
        });
        return item;
    };
    Sassdoc.prototype.generateAll = function () {
        var self = this;
        var sassDocItems = index_1.config('generators.sassdoc');
        Object.keys(sassDocItems).forEach(function (name) {
            self.generate(name).then(function () {
                self.transformGenerated(name);
            });
        });
        return this._generator;
    };
    Sassdoc.prototype.transformGenerated = function (name) {
        var self = this;
        var item = this.getConfig(name);
        var template = this.generator.compileView('sassdoc');
        var glob = path.join(item.options.dest, '**/*.html');
        cli_1.LOG.debug('transformGenerated:glob', glob);
        globule.find(glob).forEach(function (filePath) {
            cli_1.LOG.debug('transformGenerated:forEach', filePath);
            var fileContent = fse.readFileSync(filePath, 'utf-8');
            var html = template({
                sassdoc: {
                    content: fileContent
                }
            });
            cli_1.LOG.debug('writing sassoc file ' + filePath);
            fse.writeFileSync(filePath, html);
        });
        return this;
    };
    return Sassdoc;
})();
exports.Sassdoc = Sassdoc;
//# sourceMappingURL=sassdoc.js.map