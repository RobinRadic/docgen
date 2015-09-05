var path = require('path');
var fse = require('fs-extra');
var sass = require('node-sass');
var index_1 = require("./../index");
function copyToAssets(pathRoot, filePaths) {
    filePaths.forEach(function (filePath) {
        fse.copySync(index_1.rootPath(path.join(pathRoot, filePath)), index_1.destPath(path.join('assets', filePath)));
    });
}
exports.copyToAssets = copyToAssets;
function createStyle(srcFile) {
    var fileName = path.basename(srcFile, path.extname(srcFile));
    var outFile = index_1.destPath(path.join('assets', 'styles', path.dirname(srcFile), fileName + '.css'));
    var rendered = sass.renderSync({
        file: index_1.rootPath(path.join('src/styles', srcFile)),
        outFile: outFile,
        outputStyle: 'compressed'
    });
    fse.mkdirpSync(path.dirname(outFile));
    fse.writeFileSync(outFile, rendered.css);
}
exports.createStyle = createStyle;
function createStyles(files) {
    files.forEach(function (file) {
        createStyle(file);
    });
}
exports.createStyles = createStyles;
function createAssets() {
    createStyles(['stylesheet.scss', 'themes/theme-default.scss']);
    copyToAssets('src', ['images', 'fonts']);
    copyToAssets('dist/assets', ['scripts']);
    copyToAssets('', ['bower_components']);
}
exports.createAssets = createAssets;
//# sourceMappingURL=theme.js.map