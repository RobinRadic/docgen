#!/usr/bin/env node

var yargs = require('yargs');
var _ = require('lodash');
var chalk = require('chalk');
var fse = require('fs-extra');
var path = require('path');
var docgen = require('./../index');
var cli_1 = require('./../cli');
var generator_1 = require('./../generator');
var server_1 = require('./../modules/server');
var argv = yargs
    .usage('$0 <command> [options] \n$0 help <command>')
    .version(docgen.VERSION)
    .wrap(yargs.terminalWidth() / 100 * 80)
    .command('init', '  Initialise in this project. Creates a docgen.json file.')
    .command('generate', chalk.yellow('H') + ' Generate documentation.', function (yargs) {
    argv = yargs
        .usage('$0 generate <command> [options]')
        .command('theme', 'Only generate the theme')
        .command('documents', 'Only generate documents')
        .command('sassdoc', 'Only generate SASS docs')
        .command('typedoc', 'Only generate typescript docs')
        .command('index', 'Only generate the index page')
        .option('clean', { type: 'boolean', describe: 'Clean/remove destination first' })
        .help('help').alias('h', 'help')
        .count('verbose').alias('v', 'verbose').describe('v', 'Set log verbosity level (-v = info, -vv = warnings, -vvv = debug )')
        .argv;
})
    .command('watch', '  Start file watchers')
    .command('serve', chalk.yellow('H') + ' Start a static server to preview the output and start file watchers', function (yargs) {
    argv = yargs
        .usage('$0 serve [--watch]')
        .option('watch', { alias: 'w', type: 'boolean', describe: 'Also start file watchers' })
        .help('help').alias('h', 'help')
        .argv;
})
    .config('c').describe('c', 'Define custom docgen.json path').alias('c', 'config')
    .boolean('D').alias('D', 'dev').describe('D', 'Enable dev mode, you should not use this.')
    .boolean('q').alias('q', 'quiet')
    .count('verbose').alias('v', 'verbose').describe('v', 'Set log verbosity level (-v = info, -vv = warnings, -vvv = debug )')
    .help('help').alias('h', 'help')
    .example('$0 help generate', 'Show help for the generate command, shows all sub-commands and options too')
    .example('$0 generate theme --clean', 'Clean/remove old files then generate the theme files only')
    .example('$0 serve --watch', 'Start a local http server to preview the result and start file watchers that will auto-generate on file change')
    .example('$0 generate -vvv', 'Run a command with log verbosity level 3 (debug) showing additional information. Usefull if you encounter errors.')
    .argv;
// -h --help
if (argv.help) {
    printHelp();
    process.exit();
}
// Set log
cli_1.LOG.enable();
cli_1.LOG.setVerbosity(argv.verbose);
argv.D && cli_1.LOG.out(chalk.yellow.bold('Dev mode enabled'));
argv.D && cli_1.LOG.show(argv);
function printHelp() {
    cli_1.printTitle();
    yargs.showHelp();
}
// -q --quiet
if (argv.q) {
    cli_1.LOG.disable();
}
var command = argv._[0];
/****************************/
// Create (init) or load the config file. If -c is provided, load custom path
/****************************/
var configFilePath = path.join(process.cwd(), 'docgen.json');
if (command === 'init') {
    cli_1.LOG.debug('Writing config file to ' + configFilePath);
    if (fse.existsSync(configFilePath)) {
        cli_1.LOG.error('Could not write config file. docgen.json already exists');
    }
    docgen.createConfigFile(configFilePath);
    cli_1.LOG.ok('Initialized docgen.json');
    process.exit();
}
function loadConfig(configFilePath) {
    if (!fse.existsSync(configFilePath)) {
        cli_1.LOG.error('Could not read config file mdocz.json. You can create one using the init command.');
    }
    docgen.loadConfigFile(configFilePath);
}
exports.loadConfig = loadConfig;
if (argv.c) {
    cli_1.LOG.debug('Using custom config path: ' + argv.c);
    loadConfig(argv.c);
}
else {
    cli_1.LOG.debug('Loading config from default path');
    loadConfig(configFilePath);
}
var watchers = ['docs', 'config'];
if (argv.dev) {
    watchers.concat(['dev_views', 'dev_sassdoc', 'dev_assets', 'dev_bower']);
}
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
        if (argv.watch) {
            cli_1.LOG.ok('Startin watchers');
            server_1.startWatchers(watchers);
        }
        cli_1.LOG.ok('Startin server on localhost:' + docgen.config('server.port'));
        server_1.startServer();
        break;
    case "watch":
        cli_1.LOG.ok('Startin watchers');
        server_1.startWatchers(watchers);
        break;
    default:
        printHelp();
        break;
}
