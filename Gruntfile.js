module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		requirejs: {
			compile: {
				options: {
					baseUrl: 'public/js',
					out: 'public/build/js/main.js',
					paths: {
						tpl: '../templates'
					},
					include: ['main'],
					wrap: true
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-requirejs');
};

