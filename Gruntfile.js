module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        phonegap : 'node_modules/.bin/phonegap',
        weinre : 'node_modules/.bin/weinre',
        appDir : 'ik-feeds-reader',
        wwwDir : '<%= appDir %>/www',

        pkg: grunt.file.readJSON('package.json'),
        clean: {
        	libs : ['<%= wwwDir %>/js/libs'],
        	jst : ['<%= wwwDir %>/js/jst.min.js']
        },
        copy: {
            libs: {
                files: [
                    {
                        expand: true, 
                        cwd: 'bower_components', 
                        src : [
                        	"requirejs/require.js",
    						"underscore/underscore.js",
    						"underscore.deferred/underscore.deferred.js",
    						"zepto-full/zepto.js",
    						"backbone/backbone.js"
                        ], 
                        dest: "<%= wwwDir %>/js/libs/"
                     }
                ]
            }
        },
        exec: {
        	'run-app-server' : {
        		cwd: '<%= appDir %>',
        		command: '../<%= phonegap %> serve'
        	},
        	'run-logging-server' : {
        		command: '<%= weinre %>'
        	}

        },
        jshint: { //TODO: review
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true,
                globals: {
                    exports: true,
                    zepto: true,
                    $: true,
                    _: true,
                    xit: true,
                    //document
                    window: false,
                    document: false,
                    // require.js
                    define: false,
                    // plug-ins
                    gaPlugin: false,
                    JREngage: false,
                    ExtractZipFile : false,
                    LocalFileSystem : false,
                    google : false,
                    // mocha testing
                    mochaPhantomJS : false
                },
            },
            src: '<%= wwwDir %>/js/**/*.js'
        },
        jst: {
            compile: {
                options: {
                    namespace: "JST",
                    amd : true,
                    processName: function(filename) {
                        //remove the 'src' prefix for the app
                        return filename.split('/').slice(1).join('/');
                    }
                },
                files: {
                    "<%= wwwDir %>/js/jst.min.js" : [
                        "resources/templates/**/*.html"
                    ]
                }
            }
        },
        'http-server' : {
            'dev' : {
                // the server root directory
                root: '<%= wwwDir %>', //<path>

                port: 8282,
                // port: function() { return 8282; }

                host: "127.0.0.1",

                cache: 0, //<sec>,
                showDir : true,
                autoIndex: true,
                defaultExt: "html",

                // run in parallel with other tasks
                runInBackground: false //true|false
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jst');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-exec');


    grunt.registerTask('build', ['clean', 'jshint', 'copy:libs', 'jst:compile'])
    grunt.registerTask('serve', ['exec:run-app-server']);
    grunt.registerTask('serve-web', ['http-server:dev']);
    grunt.registerTask('logging', ['exec:run-logging-server']);
};