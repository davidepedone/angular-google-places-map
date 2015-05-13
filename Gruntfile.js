/*
 * angular-google-places-map
 *
 * Copyright (c) 2015 Davide Pedone
 * Licensed under the MIT license.
 * https://github.com/davidepedone/angular-google-places-map
 */

'use strict';

module.exports = function (grunt) {
	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({

		clean: {
            js: [ 'dist/js' ],
            build: [ 'dist/' ]
		},

		uglify: {
			dist: {
				files: {
					'dist/js/ngplacesmap.min.js': ['src/js/ngplacesmap.js']
				}
			}
		},
        jshint: {
            options: {
                jshintrc: '.jshintrc',
            },
            js: [ 'src/js/**/*.js']
        },
        watch: {
            js: {
                files: 'src/js/*.js',
                tasks: [ 'clean:js', 'jshint', 'uglify' ]
            }
        }
	});

	grunt.registerTask('build', ['clean:build', 'jshint:js', 'uglify']);

	grunt.registerTask('default', ['build']);
};
