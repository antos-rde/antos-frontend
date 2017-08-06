module.exports = function (grunt) {

    //console.log(grunt.file.readJSON('src/build.json'))
    var buildconf = grunt.file.readJSON('src/build.json')
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'build/htdocs/<%= pkg.name %>.js',
                dest: 'build/htdocs/<%= pkg.name %>.min.js'
            }
        },
        coffee: {
            compile: {
                files: {
                    'build/htdocs/<%= pkg.name %>.js': buildconf.coffee
                }
            }
            /*,
            glob_to_multiple: {
                expand: true,
                flatten: true,
                cwd: 'src/',
                src: ['*.coffee'],
                dest: 'build/htdocs/',
                ext: '.js'
            }*/
        },
        copy: {
            main: {
                files: buildconf.copy
            },
        },
        concat: {
            tags: {
                src: buildconf.tags,
                dest: 'build/htdocs/resources/tags/antos_tags.js'
            },
            themes:{
                src:buildconf.themes,
                dest:'build/htdocs/resources/themes/antos/antos.css'
            }
        },
        clean: ['build/htdocs/*']
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // coffee support
    grunt.loadNpmTasks('grunt-contrib-coffee');
    // Default task(s).
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['coffee']);
    grunt.registerTask('build', ['coffee:compile', 'copy:main', 'concat:tags', 'concat:themes']);
};