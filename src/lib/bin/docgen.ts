/// <reference path="../types.d.ts" />
import util = require('util');
import yargs = require('yargs');
import _ = require('lodash');
import chalk = require('chalk');
import fse = require('fs-extra');
import path = require('path');


import * as docgen from './../index';
import {LOG,printTitle} from './../cli';
import {Generator} from './../generator'
import {startServer,startWatchers} from './../modules/server';


function addGlobals(argv:yargs.Argv){
    argv
        .version(docgen.VERSION)
        .wrap(yargs.terminalWidth() / 100 * 80)
        // OPTIONS
        .config('c').describe('c', 'Define custom docgen.json path')
        .boolean('D').alias('D', 'dev').describe('D', 'Enable dev mode, you should not use this.')
        .boolean('q').alias('q', 'quiet')
        .count('verbose').alias('v', 'verbose').describe('v', 'Set log verbosity level (-v = info, -vv = warnings, -vvv = debug )')
        .help('help').alias('h', 'help');
    return argv;
}

var argv:any = yargs
    .usage('$0 <command> [options] \n$0 help <command>')
    // COMMANDS
    .command('init', '  Initialise in this project. Creates a docgen.json file.')
    .command('generate', chalk.yellow('H') + ' Generate documentation.',
    function (yargs:yargs.Argv) {
        argv = addGlobals(yargs)
            .usage('$0 generate <command> [options]')
            .command('theme', 'Only generate the theme')
            .command('documents', 'Only generate documents')
            .command('sassdoc', 'Only generate SASS docs')
            .command('typedoc', 'Only generate typescript docs')
            .command('index', 'Only generate the index page')
            .option('clean', {type: 'boolean', describe: 'Clean/remove destination first'})
            .argv

    })
    .command('watch', '  Start file watchers')
    .command('serve', chalk.yellow('H') + ' Start a static server to preview the output and start file watchers',
    function (yargs:yargs.Argv) {
        argv = addGlobals(yargs)
            .usage('$0 serve [--watch]')
            .option('watch', {alias: 'w', type: 'boolean', describe: 'Also start file watchers'})
            .argv
    })


    // EXAMPLES
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
LOG.enable();
LOG.setVerbosity(argv.verbose);
argv.D && LOG.out(chalk.yellow.bold('Dev mode enabled'));
argv.D && LOG.show(argv);

function printHelp() {
    printTitle();
    yargs.showHelp();
}


// -q --quiet
if (argv.q) {
    LOG.disable()
}


var command:string = argv._[0];

/****************************/
// Create (init) or load the config file. If -c is provided, load custom path
/****************************/

var configFilePath:string = path.join(process.cwd(), 'docgen.json');
if (command === 'init') {
    LOG.debug('Writing config file to ' + configFilePath);
    if (fse.existsSync(configFilePath)) {
        LOG.error('Could not write config file. docgen.json already exists');
    }
    docgen.createConfigFile(configFilePath);
    LOG.ok('Initialized docgen.json');
    process.exit();
}

export function loadConfig(configFilePath:string) {
    if (!fse.existsSync(configFilePath)) {
        LOG.error('Could not read config file mdocz.json. You can create one using the init command.');
    }
    docgen.loadConfigFile(configFilePath);
}

if (argv.c) {
    LOG.debug('Using custom config path: ' + argv.c);
    loadConfig(argv.c);
} else {
    LOG.debug('Loading config from default path');
    loadConfig(configFilePath);
}

var watchers:string[] = ['docs', 'config'];
if (argv.dev) {
    watchers = watchers.concat(['dev_views', 'dev_sassdoc', 'dev_assets', 'dev_bower']);
}

var gen:Generator = new Generator();

switch (command) {

    case "generate":

        if (argv.clean) {
            gen.clean();
            LOG.ok('Cleaned up destination directory');
        }

        var nested = argv._[1];
        if (_.isUndefined(nested)) {

            LOG.ok('Generating files.');

            gen.createIndex()
                .theme.createAssets()
                .documents.generateAll()
                .sassdoc.generateAll()
                .typedoc.generateAll();

        } else {
            if (nested === 'theme') {

                LOG.ok('Generating theme');
                gen.theme.createAssets();

            } else if (nested === 'documents') {

                LOG.ok('Generating documents');
                gen.createIndex()
                    .documents.generateAll();

            } else if (nested === 'sassdoc') {

                LOG.ok('Generating SASS docs');
                gen.sassdoc.generateAll();

            } else if (nested === 'typedoc') {

                LOG.ok('Generating Typescript docs');
                gen.typedoc.generateAll();

            } else if (nested === 'index') {

                LOG.ok('Generating index page');
                gen.createIndex();
            }
        }
        LOG.ok('Files generated');

        break;

    case "serve":
        if (argv.watch) {
            LOG.ok('Startin watchers');
            startWatchers(watchers);
        }
        LOG.ok('Startin server on localhost:' + docgen.config('server.port'));
        startServer();
        break;

    case "watch":
        LOG.ok('Startin watchers');
        startWatchers(watchers);
        break;

    default:
        printHelp();
        break;
}
