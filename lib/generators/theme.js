var path = require('path');
var fse = require('fs-extra');
var sass = require('node-sass');
var index_1 = require("./../index");
var Theme = (function () {
    function Theme(generator) {
        this._generator = generator;
    }
    Object.defineProperty(Theme.prototype, "generator", {
        get: function () {
            return this._generator;
        },
        enumerable: true,
        configurable: true
    });
    Theme.prototype.copyToAssets = function (pathRoot, filePaths) {
        filePaths.forEach(function (filePath) {
            fse.copySync(index_1.rootPath(path.join(pathRoot, filePath)), index_1.destPath(path.join('assets', filePath)));
        });
        return this;
    };
    Theme.prototype.createStyle = function (srcFile) {
        var fileName = path.basename(srcFile, path.extname(srcFile));
        var outFile = index_1.destPath(path.join('assets', 'styles', path.dirname(srcFile), fileName + '.css'));
        var rendered = sass.renderSync({
            file: index_1.rootPath(path.join('src/styles', srcFile)),
            outFile: outFile,
            outputStyle: 'compressed'
        });
        fse.mkdirpSync(path.dirname(outFile));
        fse.writeFileSync(outFile, rendered.css);
        return this;
    };
    Theme.prototype.createStyles = function (files) {
        var self = this;
        files.forEach(function (file) {
            self.createStyle(file);
        });
        return this;
    };
    Theme.prototype.createAssets = function () {
        this //.createStyles(['stylesheet.scss', 'themes/theme-default.scss', 'typedoc/main.sass', 'sassdoc/main.scss'])
            .copyToAssets('src', ['images', 'fonts'])
            .copyToAssets('dist/assets', ['scripts', 'styles'])
            .copyToAssets('', ['bower_components']);
        return this._generator;
    };
    return Theme;
})();
exports.Theme = Theme;
//# sourceMappingURL=theme.js.map