var util = require('util'),
    path = require('path');
var fs = require('fs-extra');

var _       = require('lodash'),
    exec    = require('child_process').execSync,
    grunt   = require('grunt'),
    globule = require('globule');
var docs = {};
//docs    = require('./src/lib/grunt/docs'),
//inspect = require('./src/lib/grunt').inspect;


//var lib = require('./src/lib/grunt');

module.exports = function (_grunt) {
    grunt = _grunt;
    var target = grunt.option('target') || 'dist';
    var vendorScripts = ['lodash/lodash.js', 'requirejs/require.js'];
    grunt.log.subhead('Packadic Builder for Packadic ' + require('./bower.json').version);
    //inspect(docs);
    var config = {
        /**/
        //      Targeting
        /**/
        target : {name: '', dest: ''},
        targets: {
            demo: {name: 'demo', dest: 'demo'},
            dist: {name: 'dist', dest: 'dist'}
        },

        /**/
        //      Basics & pre-processing
        /**/
        clean: {

            all              : {src: '<%= target.dest %>'},
            docs             : {src: '<%= target.dest %>/docs'},
            assets           : {src: '<%= target.dest %>/assets'},
            styles           : {src: '<%= target.dest %>/assets/styles'},
            scripts          : {src: '<%= target.dest %>/assets/scripts'},
            scripts_no_vendor: {src: ['<%= target.dest %>/assets/scripts/**/*.js', '!<%= target.dest %>/assets/scripts/vendor.min.js']},
            images           : {src: '<%= target.dest %>/assets/images'},
            bower            : {src: '<%= target.dest %>/assets/bower_components'},
            views            : {src: '<%= target.dest %>/**/*.html'}
        },
        copy : {
            images: {src: ['**'], cwd: 'src/images', expand: true, dest: '<%= target.dest %>/assets/images/'},
            bower : {src: ['**'], cwd: 'bower_components', expand: true, dest: '<%= target.dest %>/assets/bower_components/'},
            scss  : {src: ['**/*.scss'], cwd: 'src/styles', expand: true, dest: '<%= target.dest %>/assets/styles/scss/'},
            js    : {src: ['**/*.js'] ,cwd: 'src/js', expand: true, dest: '<%= target.dest %>/assets/scripts/'}
        },
        jade : {
            options  : {
                pretty: true, data: function () {
                    return _.merge(docs, {
                        _inspect: util.inspect
                    });
                }.call()
            },
            demo     : {files: [{expand: true, cwd: 'src/views', src: ['**/*.jade', '!{document,typedoc}.jade', '!metalshark/**/*.jade', '!partials/**/*.jade', '!layouts/**/*.jade', '!**/_*.jade'], ext: '.html', dest: '<%= target.dest %>'}]},
            dist     : {files: [{expand: true, cwd: 'src/views', src: ['**/*.jade', '!{document,typedoc}.jade', '!metalshark/**/*.jade', '!partials/**/*.jade', '!layouts/**/*.jade', '!**/_*.jade'], ext: '.html', dest: '<%= target.dest %>'}]},
            templates: {
                options: {client: true, pretty: false, amd: true, namespace: false},
                files  : [{expand: true, cwd: 'src/templates', src: ['**/*.jade', '!**/_*.jade'], ext: '.js', dest: '<%= target.dest %>/assets/scripts/templates'}]
            }
        },
        sass : {
            options: {sourceMap: false, outputStyle: 'expanded'}, // '<%= target.name === "demo" ? "expanded" : "compressed" %>'},
            styles : {
                files: {
                    '<%= target.dest %>/assets/styles/stylesheet.css'          : 'src/styles/stylesheet.scss',
                    '<%= target.dest %>/assets/styles/themes/theme-default.css': 'src/styles/themes/theme-default.scss',
                    '<%= target.dest %>/assets/styles/themes/theme-light.css'  : 'src/styles/themes/theme-light.scss',
                    '<%= target.dest %>/assets/styles/sassdoc/main.css'          : 'src/styles/sassdoc/main.scss',
                    '<%= target.dest %>/assets/styles/typedoc/main.css'          : 'src/styles/typedoc/main.sass'
                }
            }
        },


        /**/
        //      Scripting
        /**/
        uglify    : {
            vendor: {
                files: {
                    '<%= target.dest %>/assets/scripts/vendor.min.js'       : (function () {
                        var scripts = [];
                        for (var k in vendorScripts) {
                            scripts.push('bower_components/' + vendorScripts[k]);
                        }
                        return scripts;
                    }.call()),
                    '<%= target.dest %>/assets/scripts/jquery-custom.min.js': ['bower_components/jquery/dist/jquery.js', 'bower_components/jquery-migrate/jquery-migrate.js']
                }

            }
        },
        subgrunt  : {typescript: {'src/clones/grunt-typescript': ['build']}},
        typescript: {
            options  : {target: 'es5', rootDir: 'src', module: 'amd', sourceMap: false, declaration: false},
            lib      : {src: ['src/lib/**/*.ts', '!src/lib/**/*.d.ts'], dest: 'lib', options: {module: 'commonjs', sourceMap: target === 'demo', rootDir: 'src/lib'}},
            watch_lib: {src: ['src/lib/**/*.ts', '!src/lib/**/*.d.ts'], dest: 'lib', options: {module: 'commonjs', sourceMap: target === 'demo', rootDir: 'src/lib', watch: {path: 'src/lib'}}},
            //base      : {src: ['src/ts/*.ts', '!src/ts/**/*.d.ts', '!src/ts/app/**/*'], dest: '<%= target.dest %>/assets/scripts', options: {rootDir: 'src/ts'}},
            //watch_base: {src: ['src/ts/*.ts', '!src/ts/**/*.d.ts', '!src/ts/app/**/*'], dest: '<%= target.dest %>/assets/scripts', options: {rootDir: 'src/ts', watch: {path: 'src/ts'}}},
            tasks    : {src: ['src/tasks/*.ts', '!src/tasks/**/*.d.ts'], dest: 'src', options: {module: 'commonjs', sourceMap: target === 'demo'}}
        },
        ts        : {
            options: {
                compiler     : 'node_modules/typescript/bin/tsc',
                rootDir      : './', "target": "es5", "module": "umd", declaration: false, sourceMap: false,
                noImplicitAny: false, removeComments: true, noLib: false, experimentalDecorators: true, emitDecoratorMetadata: true,
                fast         : 'never'
            },
            base   : {files: [{src: ['src/ts/**/*.ts'], dest: '<%= target.dest  %>/assets/scripts'}]}
        },

        /**/
        //      Documentation
        /**/
        sassdoc: {styles: {src: 'src/styles', options: {dest: '<%= target.dest %>/docs/scss'}}},
        typedoc: {
            ts : {src: ['src/ts/**/*.ts'], options: {module: 'amd', out: '<%= target.dest %>/docs/ts', name: 'Packadic @ Browser', target: 'es5', mode: 'file', experimentalDecorators: ''}},
            lib: {src: 'src/lib/**/*.ts', options: {module: 'commonjs', out: '<%= target.dest %>/docs/lib', name: 'Packadic @ Node', target: 'es5', mode: 'file', experimentalDecorators: ''}}
        },

        /**/
        //      Serving, watching, deving
        /**/
        availabletasks: {
            tasks: {
                options: {
                    filter: 'include', tasks: ['styles', 'scripts', 'images', 'bower', 'views', 'demo', 'dist', 'serve', 'watch', 'lib', 'docs'],
                    groups: {
                        'Build'      : ['demo', 'dist', 'docs'],
                        'Partials'   : ['styles', 'scripts', 'images', 'bower', 'views'],
                        'Development': ['serve', 'watch', 'lib']
                    }
                }
            }
        },
        connect       : {demo: {options: {port: 8000, livereload: false, base: 'demo'}}}, // , keepalive: true
        concurrent    : {
            options: {logConcurrentOutput: true},
            watch  : ['typescript:watch_lib', 'default_watch']
        },
        default_watch : {
            options     : {livereload: true},
            tasks       : {files: ['src/tasks/**/*.ts', '!src/tasks/**/*.d.ts'], tasks: ['typescript:tasks']},
            templates   : {files: ['src/templates/**/*.jade'], tasks: ['jade:templates']},
            //newerViews      : {files: ['src/views/**/*.jade', '!src/views/partials/**/*.jade', '!src/views/metalshark/**/*.jade', '!src/views/**/_*.jade'], tasks: ['newer:jade:demo']},
            //views           : {files: ['src/views/partials/**/*.jade', 'src/views/**/_*.jade', 'src/views/metalshark/**/*.jade', 'src/views/layouts/**/*.jade', 'docs/**/*.md'], tasks: ['jade:demo']},
            styles          : {files: ['src/styles/**/*.{scss,sass}'], tasks: ['styles']},
            //grunt_typescript: {files: ['src/clones/grunt-typescript/src/**/*.ts'], tasks: ['subgrunt:typescript']},
            js          : {files: ['src/js/**/*.js'], tasks: ['copy:js']},
            scripts_base: {files: ['src/ts/**/*.ts'], tasks: ['ts:base']},
            bower       : {files: ['bower.json'], tasks: ['bower']},
            shebangify  : {files: ['lib/bin/docgen.js'], tasks: ['shebangify']},
            livereload  : {
                options: {livereload: 35729},
                files  : ['<%= target.dest %>/**/*', '!<%= target.dest %>/assets/bower_components/**/*']
            }
        }
    };

    target = config.target = config.targets[target];
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.task.renameTask('watch', 'default_watch');
    grunt.loadTasks('src/tasks');
    grunt.initConfig(config);

    [
        // default
        ['tasks', 'Shows all available tasks', ['availabletasks:tasks']],
        ['default', 'Show all available tasks', ['tasks']],
        // copy
        ['images', 'Copy images', ['clean:images', 'copy:images']],
        ['bower', 'Copy bower components', ['clean:bower', 'copy:bower']],
        // compile
        ['styles', 'Compile all SCSS stylesheets', ['clean:styles', 'sass:styles']],
        ['scripts', 'Concat & uglify vendor scripts and compile typescript files',
            ['clean:scripts', 'uglify:vendor', 'jade:templates', 'ts:base', 'typescript:lib', 'copy:js', 'typescript:tasks']
        ],
        ['views', 'Compile the jade view', ['clean:views', 'jade:' + target.name]],
        // build
        ['docs', 'Generate the docs', ['clean:docs', 'sassdoc:styles', 'typedoc:lib', 'typedoc:ts']],
        ['demo', 'Build the theme', ['clean:all', 'bower', 'images', 'styles', 'scripts', 'views', 'docs']],
        ['dist', 'Build the distribution version (optimized)', ['clean:all', 'bower', 'styles', 'scripts', 'images', 'views']],
        // dev
        ['lib', 'Compile typescript files in lib for node.', ['typescript:lib']],
        ['watch', 'Watch for file changes and fire tasks.', ['concurrent:watch']],
        ['serve', 'Create a local server. Builds & hosts the demo and watches for changes. Use serve:fast to skip demo build task.', function (opt) {
            if ( typeof opt === 'string' && opt === 'fast' ) {
                grunt.log.warn('Skipping demo build task');
                grunt.task.run(['connect:demo', 'watch'])
            } else {
                grunt.task.run(['demo', 'connect:demo', 'watch'])
            }
        }],
        ['shebangify', 'Shebang bang bang', function () {
            shebangFile = path.join(__dirname, 'lib/bin/docgen.js');
            var data = fs.readFileSync(shebangFile, 'utf-8');
            var exp = /^#!\/usr\/bin\/env\snode$/m;
            if ( ! exp.test(data) ) {
                fs.writeFileSync(shebangFile, "#!/usr/bin/env node\n\n" + data);
            }
        }]
    ].forEach(function (simpleTask) {
        grunt.registerTask(simpleTask[0], simpleTask[1], simpleTask[2]);
    }.bind(this));
};
