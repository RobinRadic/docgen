var path = require('path');
var _ = require('lodash');
var fse = require('fs-extra');
var globule = require('globule');
var cp = require('child_process');
var index_1 = require("./../index");
var cli_1 = require("./../cli");
var Typedoc = (function () {
    function Typedoc(generator) {
        this._generator = generator;
        this.defaults = {
            readme: 'none',
            theme: index_1.rootPath('src/typedoc-theme'),
            hideGenerator: ''
        };
    }
    Object.defineProperty(Typedoc.prototype, "generator", {
        get: function () {
            return this._generator;
        },
        enumerable: true,
        configurable: true
    });
    Typedoc.prototype.transformGenerated = function (name) {
        var self = this;
        var item = this.getConfig(name);
        var template = this.generator.compileView('typedoc');
        var glob = path.join(item.options.out, '**/*.html');
        //LOG.debug('transformGenerated:glob', glob);
        globule.find(glob).forEach(function (filePath) {
            //LOG.debug('transformGenerated:forEach', filePath);
            var rootPath = path.relative(path.dirname(filePath), index_1.destPath());
            rootPath = rootPath.length > 0 ? rootPath + '/' : '';
            var fileContent = fse.readFileSync(filePath, 'utf-8');
            var html = template({
                typedoc: {
                    content: fileContent
                },
                rootPath: rootPath
            });
            fse.writeFileSync(filePath, html);
        });
        return this;
    };
    Typedoc.prototype.getConfig = function (name) {
        var self = this;
        var tc = index_1.config('generators.typedoc');
        var t = tc[name];
        var options = _.merge(this.defaults, {
            out: index_1.destPath(path.join('typedoc', name)),
            name: index_1.config('name')
        }, t.options);
        var files = [];
        t.files.forEach(function (fileGlob) {
            files = files.concat(globule.find(fileGlob));
        });
        return {
            name: name,
            files: files,
            options: options
        };
    };
    Typedoc.prototype.generate = function (name) {
        var self = this;
        var docItem = this.getConfig(name);
        this.exec(docItem.files, docItem.options);
        self.transformGenerated(name);
        return this;
    };
    Typedoc.prototype.generateAll = function () {
        var self = this;
        var tc = index_1.config('generators.typedoc');
        if (Object.keys(tc).length === 0) {
            return;
        }
        Object.keys(tc).forEach(function (name) {
            self.generate(name);
        });
        return this._generator;
    };
    Typedoc.prototype.exec = function (files, options) {
        var args = [];
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                args.push('--' + key);
                if (!!options[key]) {
                    args.push(options[key]);
                }
            }
        }
        for (var i = 0; i < files.length; i++) {
            args.push(files[i]);
        }
        var winExt = /^win/.test(process.platform) ? '.cmd' : '';
        var executable = path.resolve(require.resolve('typedoc/package.json'), '..', '..', '.bin', 'typedoc' + winExt);
        var child = cp.execFileSync(executable, args, {
            stdio: cli_1.LOG.is('debug') ? 'inherit' : 'pipe',
            env: process.env
        });
        return this;
    };
    return Typedoc;
})();
exports.Typedoc = Typedoc;
