/// <reference path='../lib/types.d.ts' />
import _ = require('lodash');



module.exports = function(grunt:IGrunt){

    grunt.registerTask('tasks2md', 'Converts the registered grunt tasks to markdown documentation', function(tar){
        //this.requiresConfig('tasks2md');
        var options:any = this.options({
            dest: null,
            exclude: [],
            only: [],
            format: {
                name: '#### %s \n',
                desc: '%s \n'
            }

        });



    })
};
