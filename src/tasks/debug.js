module.exports = function (grunt) {
    grunt.registerTask('debug', 'example task', function (tar) {
        var taskDone = this.async();
        var o = this.options({ a: 'b' });
        var taskList = Object.keys(grunt.task['_tasks']);
        taskList.forEach(function (taskName) {
            grunt.log.writeln(taskName);
        });
        taskDone();
    });
};
//# sourceMappingURL=debug.js.map