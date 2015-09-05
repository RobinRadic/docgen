#!/usr/bin/env node

/// <reference path="../types.d.ts" />
var util = require('util');
var yargs = require('yargs');
var _ = require('lodash');
var fse = require('fs-extra');
var path = require('path');
var docgen = require('./../index');
var cli_1 = require('./../cli');
var generator_1 = require('./../generator');
var server_1 = require('./../modules/server');
function dump(val) {
    console.log(util.inspect(val, { colors: true, hidden: true, depth: 7 }));
}
var argv = yargs
    .usage('$0 <command> [options] \n$0 help <command>')
    .version(docgen.VERSION)
    .command('init', 'Initialise in this project. Creates a docgen.json file.')
    .command('generate', 'Generate documentation.', function (yargs) {
    argv = yargs
        .usage('$0 generate <command> [options]')
        .command('theme', 'Only generate the theme')
        .command('documents', 'Only generate documents')
        .command('sassdoc', 'Only generate SASS docs')
        .command('typedoc', 'Only generate typescript docs')
        .command('index', 'Only generate the index page')
        .option('clean', { type: 'boolean', describe: 'Clean/remove destination first' })
        .help('help')
        .argv;
})
    .command('watch', 'Start file watchers')
    .command('serve', 'Start a static server to preview the output and start file watchers')
    .help('help').alias('h', 'help')
    .config('c').describe('c', 'Define custom docgen.json path').alias('c', 'config')
    .boolean('q').alias('q', 'quiet')
    .count('verbose').alias('v', 'verbose').describe('v', 'Set log verbosity level (-v = info, -vv = warnings, -vvv = debug )')
    .example('$0 help generate', 'Show help for the generate command, shows all sub-commands and options too')
    .example('$0 generate theme --clean', 'Clean/remove old files then generate the theme files only')
    .example('$0 serve --watch', 'Start a local http server to preview the result and start file watchers that will auto-generate on file change')
    .example('$0 generate -vvv', 'Run a command with log verbosity level 3 (debug) showing additional information. Usefull if you encounter errors.')
    .wrap(yargs.terminalWidth() / 100 * 80)
    .argv;
cli_1.LOG.setEnabled(true);
cli_1.LOG.setVerbosity(argv.verbose);
cli_1.LOG.is('debug') && dump(argv);
function printHelp() {
    cli_1.printTitle();
    yargs.showHelp();
}
if (argv.help) {
    printHelp();
    process.exit();
}
if (argv.q) {
    cli_1.LOG.setEnabled(false);
}
exports.configFilePath = path.join(process.cwd(), 'docgen.json');
function loadConfig() {
    if (!fse.existsSync(exports.configFilePath)) {
        cli_1.LOG.error('Could not read config file mdocz.json. You can create one using the init command.');
    }
    docgen.loadConfigFile(exports.configFilePath);
}
exports.loadConfig = loadConfig;
var command = argv._[0];
if (command === 'init') {
    cli_1.LOG.debug('Writing config file to ' + exports.configFilePath);
    if (fse.existsSync(exports.configFilePath)) {
        cli_1.LOG.error('Could not write config file. docgen.json already exists');
    }
    docgen.createConfigFile(exports.configFilePath);
    cli_1.LOG.ok('Initialized docgen.json');
    process.exit();
}
loadConfig();
var gen = new generator_1.Generator();
switch (command) {
    case "generate":
        if (argv.clean) {
            gen.clean();
            cli_1.LOG.ok('Cleaned up destination directory');
        }
        var nested = argv._[1];
        if (_.isUndefined(nested)) {
            cli_1.LOG.ok('Generating files.');
            gen.clean().createIndex()
                .theme.createAssets()
                .documents.generateAll()
                .sassdoc.generateAll()
                .typedoc.generateAll();
        }
        else {
            if (nested === 'theme') {
                cli_1.LOG.ok('Generating theme');
                gen.theme.createAssets();
            }
            else if (nested === 'documents') {
                cli_1.LOG.ok('Generating documents');
                gen.documents.generateAll();
            }
            else if (nested === 'sassdoc') {
                cli_1.LOG.ok('Generating SASS docs');
                gen.sassdoc.generateAll();
            }
            else if (nested === 'typedoc') {
                cli_1.LOG.ok('Generating Typescript docs');
                gen.typedoc.generateAll();
            }
            else if (nested === 'index') {
                cli_1.LOG.ok('Generating index page');
                gen.createIndex();
            }
        }
        cli_1.LOG.ok('Files generated');
        break;
    case "serve":
        cli_1.LOG.ok('Startin watchers');
        server_1.startWatchers();
        cli_1.LOG.ok('Startin server on localhost:' + docgen.config('server.port'));
        server_1.startServer();
        break;
    case "watch":
        cli_1.LOG.ok('Startin watchers');
        server_1.startWatchers();
        break;
    default:
        printHelp();
        break;
}
//# sourceMappingURL=docgen.js.map