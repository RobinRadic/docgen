/// <reference path='../lib/types.d.ts' />
import util = require('util');
import fs = require('fs-extra');
import AsyncResultCatcher = grunt.task.AsyncResultCatcher;


module.exports = function(grunt:IGrunt){
    grunt.registerTask('debug', 'example task', function(tar){
        var taskDone:AsyncResultCatcher = this.async();
        var o = this.options({ a: 'b'});

        var taskList:string[] = Object.keys(grunt.task['_tasks']);
        taskList.forEach(function(taskName:string){
            grunt.log.writeln(taskName);
        });
        taskDone();
    })
};



