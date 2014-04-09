/**
 * @author Jackie lin
 * @date 2014-04-09
 * @content add grunt to build automation
 */
module.exports = function(grunt) {
    'use strict';

    // project config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        cssmin: {
            options: {
                'keepSpecialComments': 0
            },
            combine: {
                files: {
                    'assets/css/default.css': [
                        'css/*.css'
                    ]
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },

            files: ['Gruntfile.js', 'javascript/*.js', '!javascript/jquery-2.1.0.min.js']
        },

        watch: {
            css: {
                files: ['css/**/*.css'],
                tasks: ['cssmin']
            },
            js: {
                files: ['<%= jshint.files %>'],
                tasks: ['jshint']
            }
        }
    });

    // load Grunt plug-in
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // register default task
    grunt.registerTask('default', ['watch']);
};