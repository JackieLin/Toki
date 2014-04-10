/**
 * @author Jackie lin
 * @date 2014-04-09
 * @content add grunt to build automation
 * npm install --dev --save-dev        development env
 * npm install --production --save-dev production env
 * To test travis cli
 */
module.exports = function(grunt) {
    'use strict';

    // project config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['node_modules/**', 'node_modules/.bin/**','conf/**','fonts/**', 'icons/**', 'images/**'],
                        dest: 'build'
                    },
                    {expand: true, src: ['main.html', 'LICENSE', 'README.md', 'package.json'], dest: 'build'}
                ]
            }
        },

        cssmin: {
            options: {
                'keepSpecialComments': 0
            },
            combine: {
                files: {
                    'build/css/style.css': [
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

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },

            dist: {
                files: [{
                    cwd: 'javascript',
                    src: '**/*.js',                 // source files mask
                    dest: 'build/javascript',       // destination folder
                    expand: true,                   // allow dynamic building
                    flatten: true                   // remove all unnecessary nesting
                    /*ext: '.min.js'                // replace .js to .min.js*/
                }]
            }
        },

        htmlhint: {
            options: {
                htmlhintrc: '.htmlhintrc'
            },
            src: ['*.html']
        },

        watch: {
            css: {
                files: ['css/**/*.css'],
                tasks: ['cssmin']
            },
            js: {
                files: ['<%= jshint.files %>'],
                tasks: ['jshint']
            },
            uglify: {
                files: ['javascript/**/*.js'],
                tasks: ['uglify']
            },

            htmlhint: {
                files: ['*.html'],
                tasks: ['htmlhint']
            },

            copy: {
                files: ['**'],
                tasks: ['copy']
            }
        }
    });

    // load Grunt plug-in
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-htmlhint');

    // register default task
    grunt.registerTask('test', ['watch']);
    grunt.registerTask('default', ['cssmin', 'jshint', 'uglify', 'htmlhint', 'copy']);
};