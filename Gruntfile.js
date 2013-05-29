/*jslint white:true*/
/*global
module
*/
module.exports = function(grunt) {

    'use strict';

    // Project configuration.
    grunt.initConfig({

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'src/actorpubsub.js'
            ]
        },

        mocha: {
            all: {
                options: {
                    run: true
                },
                src: ['test/allTests.html']
            }
        }

    });

    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('test', ['jshint', 'mocha']);

    // Default task.
    grunt.registerTask('default', 'test');
};