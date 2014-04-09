/**
 * @author Jackie lin
 * @date 2014-04-09
 * @content add grunt to build automation
 */
module.exports = function(grunt) {

    // project config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            css: {
                files: [
                    '**/*.css'
                ],
                tasks: ['cssmin']
            },
            js: {
                files: [
                    '**/*.js',
                    'Gruntfile.js'
                ],
                tasks: ['jshint']
            }
        },

        cssmin: {
            options: {
                'keepSpecialComments': 0
            },
            compress: {
                files: {
                    'assets/css/default.css': [
                        'css/style.css'
                    ]
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },

            all: ['Gruntfile.js', 'javascript/*.js']
        }
    });

    // load Grunt plug-in
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // register default task
    grunt.registerTask('default', ['watch']);
};