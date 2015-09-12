module.exports = function (grunt) {
    grunt.registerTask('tasks2md', 'Converts the registered grunt tasks to markdown documentation', function (tar) {
        //this.requiresConfig('tasks2md');
        var options = this.options({
            dest: null,
            exclude: [],
            only: [],
            format: {
                name: '#### %s \n',
                desc: '%s \n'
            }
        });
    });
};
