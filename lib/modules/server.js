var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var globule = require('globule');
var express = require("express");
var serveStatic = require('serve-static');
var index_1 = require("./../index");
var cli_1 = require('./../cli');
var generator_1 = require("../generator");
function startServer() {
    var app = express();
    app.use('*', function (req, res, next) {
        if (index_1.config('server.logHttpRequests')) {
            console.log(req.originalUrl);
        }
        next();
    });
    var staticHandler = serveStatic(index_1.destPath(), { 'index': ['index.html'] });
    app.use(staticHandler);
    app.listen(index_1.config.get('server.port'));
}
exports.startServer = startServer;
var watchers = {};
function addWatcher(name, files, fn) {
    watchers[name] = { files: files, fn: fn };
}
exports.addWatcher = addWatcher;
function startWatcher(name) {
    var fsTimeout;
    var watcher = watchers[name];
    watcher.files.forEach(function (fileGlob) {
        globule.find(fileGlob).forEach(function (filePath) {
            watchers[name].current = fs.watch(filePath, function (event, filename) {
                cli_1.LOG.info(name, filePath + ' was modified');
                if (!fsTimeout) {
                    watcher.fn(filePath, event, filename, watchers[name]);
                    fsTimeout = setTimeout(function () {
                        fsTimeout = null;
                    }, 500);
                }
            });
        });
    });
    cli_1.LOG.ok('Started watcher: ' + name);
}
exports.startWatcher = startWatcher;
function startWatchers(names) {
    if (_.isUndefined(names)) {
        names = Object.keys(watchers);
    }
    names.forEach(function (name) {
        startWatcher(name);
    });
}
exports.startWatchers = startWatchers;
function gen() {
    return new generator_1.Generator();
}
addWatcher('dev_views', [index_1.rootPath('src/views/**/*.jade')], function (filePath, event, fileName, w) {
    gen().createIndex().documents.generateAll();
    cli_1.LOG.ok('Regenerated all documents');
});
addWatcher('dev_sassdoc', [index_1.rootPath('src/views/sassdoc.jade'), index_1.rootPath('src/sassdoc-theme/views/**/*.swig')], function (filePath, event, fileName, w) {
    gen().sassdoc.generateAll();
    cli_1.LOG.ok('Regenerated dev_sassdoc');
});
addWatcher('dev_assets', [index_1.rootPath('dist/assets/{scripts,styles}/**/*')], function (filePath, event, fileName, w) {
    setTimeout(function () {
        gen().theme.copyToAssets('dist/assets', ['scripts', 'styles']).copyToAssets('src', ['images', 'fonts']);
        cli_1.LOG.ok('Regenerated assets');
        w.current.close();
        startWatcher('dev_assets');
    }, 500);
});
addWatcher('dev_bower', [index_1.rootPath('bower_components/*')], function () {
    gen().theme.copyToAssets('', ['bower_components']);
    cli_1.LOG.ok('Regenerated assets');
});
addWatcher('docs', [index_1.docsPath('**/*.md')], function (filePath, event, fileName, w) {
    var relFilePath = path.relative(index_1.docsPath(), filePath);
    cli_1.LOG.ok('Regenerating document.');
    cli_1.LOG.debug('Filename:', fileName);
    cli_1.LOG.debug('filePath:', filePath);
    cli_1.LOG.debug('relFilePath:', relFilePath);
    gen().createIndex().documents.create(relFilePath);
});
addWatcher('config', [index_1.destPath('docgen.json')], function (filePath, event, fileName, w) {
    index_1.loadConfigFile(filePath);
    gen().createIndex().documents.generateAll();
    cli_1.LOG.ok('Reloaded config file and regenerated documents');
});
