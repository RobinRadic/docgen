var path = require('path');
var fse = require('fs-extra');
var configuration_1 = require("./modules/configuration");
var generator_1 = require("./generator");
exports.VERSION = require('./../package.json').version;
function getDefaultConfig() {
    return {
        title: 'Documentation for my project',
        copyright: 'Copyright 2015 &copy; Docgen',
        docs: 'docs',
        dest: 'docz',
        baseUrl: '/',
        index: 'README.md',
        generators: {
            typedoc: {
                browser: { files: ['src/ts/**/*.ts'], options: { name: 'Scripting API', module: 'umd', rootDir: './', target: 'es5', mode: 'file', experimentalDecorators: '' } }
            },
            sassdoc: {
                styles: { files: ['src/styles'], options: {} }
            },
            jsdoc: []
        },
        server: {
            port: 3000,
            logHttpRequests: false
        },
        types: {
            doc: {
                view: 'document',
                title: 'Document'
            }
        },
        menu: [
            { name: 'Home', type: 'index', icon: 'fa fa-home' },
            {
                name: 'API', type: 'parent', icon: 'fa fa-file-code-o', children: [
                    { name: 'Javascript', typedoc: 'browser', type: 'typedoc', icon: 'fa fa-code' },
                    { name: 'SCSS', sassdoc: 'styles', type: 'sassdoc', icon: 'fa fa-github' }
                ] },
            {
                name: 'Getting Started', type: 'parent', icon: 'fa fa-dashboard', children: [
                    { name: 'Installation', doc: 'getting-started/installation.md', type: 'doc', icon: 'fa fa-dashboard' },
                    { name: 'Configuration', doc: 'getting-started/configuration.md', type: 'doc', icon: 'fa fa-dashboard' }
                ] },
            { name: 'About', doc: 'about.md', type: 'doc', icon: 'fa fa-bullhorn' },
            { name: 'Contributing', doc: 'contributing.md', type: 'doc', icon: 'fa fa-github' },
            { name: 'Github', href: 'https://github.com', type: 'href', icon: 'fa fa-github' }
        ],
        googleAnalytics: "UA-XXXXX-YY",
        tracking: "<img src=\"http://piwik.example.org/piwik.php?idsite={$IDSITE}amp;rec=1\" style=\"border:0\" alt=\"\" />"
    };
}
exports.getDefaultConfig = getDefaultConfig;
var _config = new configuration_1.ConfigObject({});
exports.config = configuration_1.ConfigObject.makeProperty(_config);
var _rootPath = path.join(__dirname, '..');
exports.paths = {
    root: _rootPath,
    docs: '',
    dest: ''
};
function setPaths(cwd) {
    exports.paths = {
        root: _rootPath,
        docs: path.join(cwd, exports.config('docs')),
        dest: path.join(cwd, exports.config('dest')),
        cwd: process.cwd()
    };
}
exports.setPaths = setPaths;
function rootPath(relPath) {
    if (relPath === void 0) { relPath = ''; }
    return path.join(exports.paths.root, relPath);
}
exports.rootPath = rootPath;
function docsPath(relPath) {
    if (relPath === void 0) { relPath = ''; }
    return path.join(exports.paths.docs, relPath);
}
exports.docsPath = docsPath;
function destPath(relPath) {
    if (relPath === void 0) { relPath = ''; }
    return path.join(exports.paths.dest, relPath);
}
exports.destPath = destPath;
function cwdPath(relPath) {
    if (relPath === void 0) { relPath = ''; }
    console.log(exports.paths);
    return path.join(exports.paths.cwd, relPath);
}
exports.cwdPath = cwdPath;
function createConfigFile(filePath) {
    fse.outputFileSync(filePath, JSON.stringify(getDefaultConfig(), null, 4));
}
exports.createConfigFile = createConfigFile;
function loadConfigFile(filePath) {
    var json = fse.readJsonSync(filePath);
    exports.config.merge(getDefaultConfig());
    exports.config.merge(json);
    setPaths(process.cwd());
}
exports.loadConfigFile = loadConfigFile;
function createGenerator() {
    return new generator_1.Generator();
}
exports.createGenerator = createGenerator;
//# sourceMappingURL=index.js.map