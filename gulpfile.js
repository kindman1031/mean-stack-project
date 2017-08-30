(function() {
  'use strict';

  var gulp = require('gulp');
  var es = require('event-stream');
  var runSequence = require('run-sequence');
  var notifyVanilla = require('node-notifier');
  var modRewrite = require('connect-modrewrite');
  var path = require('path');
  var del = require('del');
  var revDel = require('rev-del');

  var $ = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
    replaceString: /\bgulp[\-.]/
  });

  var bowerLib = require('bower-files')();

  var server = 'server',
    client = 'client',
    dist = 'dist',
    tmp = '.tmp',
    bowerDir = client + '/bower_components';

  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var htmlFilter = $.filter('**/*.html');
  var sassFilter = $.filter('**/*.scss');

  var config = {
    sass: {
      src: client + '/sass/app.scss',
      inject: {
        src: [
          client + "/components/**/*.scss",
          client + "/states/**/*.scss"
        ],
        settings: {
          transform: function(filePath, file, i, length) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('.scss', '');
            filePath = filePath.replace('_', '');
            console.log(filePath);
            //console.log('inject:settings:tramsform -> filePath:'+'\n'+file.inspect());
            return '@import "../' + filePath + '";';
          },
          starttag: '// inject:{{ext}}',
          endtag: '// endinject'
        }
      },
      dest: client + '/css/',
      settings: {
        // Required if you want to use SASS syntax
        style: 'expanded',
        // See https://github.com/dlmanning/gulp-sass/issues/81
        sourceComments: 'map',
        imagePath: '/images', // Used by the image-url helper
        fontPath: '/fonts',
        errLogToConsole: true,
        require: 'breakpoint'
      }
    },
    rubySass: {
      src: client + '/sass/app.scss',
      settings: {
        sourcemap: true
      }
    },
    autoPrefixer: {
      settings: [
        'last 3 versions',
        'ie >= 8',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
      ]
    },
    imagemin: {
      settings: {
        progressive: true
      }
    },
    fonts: {
      src: [
        bowerDir.concat('/font-awesome/fonts/**/*'),
        bowerDir.concat('/bootstrap/fonts/**/*')
      ],
      dest: client + "/fonts"
    },
    angular: {
      module: 'frontEndApp',
      templates: {
        root: '/views/',
        src: client + '/views/**/*.html',
        dest: client + '/scripts'
      }
    },
    nodemon: {
      settings: {
        script: 'index.js',
        verbose: true
      }
    },
    mochaTest: {
      test: {
        src: [
          './test/.js'
        ],
        options: {
          reporter: 'spec',
          timeout: 120000
        }
      }
    }
  };
  gulp.task('default', ['nodemon', 'watching']);
  gulp.task('serve:dist', ['nodemon:dist', 'watching:dist']);

  gulp.task('watching', function() {
    gulp.watch(client + '/{javascripts,components}/**/*.{js,css,html}', ['inject']);
    gulp.watch(client + '/**/*.{scss,sass}', ['sass']);
  });

  gulp.task('watching:dist', function() {});

  gulp.task('nodemon', function(cb) {
    $.nodemon(config.nodemon.settings).on('start', function() {
      notifyVanilla.notify({
        title: 'Nodemon',
        subtitle: 'started',
        message: 'Application has been started.'
      });
    }).on('restart', function() {
      notifyVanilla.notify({
        title: 'Nodemon',
        subtitle: 'restarted',
        message: 'Application has been restarted.'
      });
    }).on('crash', function() {
      notifyVanilla.notify({
        title: 'Nodemon',
        subtitle: 'ERROR',
        message: 'Application start halted due to error.'
      });
    });
    cb();
  });

  gulp.task('nodemon:dist', function(cb) {
    var settings = config.nodemon.settings;
    settings.env = {
      SERVE_DIST: true
    };

    $.nodemon(settings).on('start', function() {
      notifyVanilla.notify({
        title: 'Nodemon',
        subtitle: 'started',
        message: 'Application has been started.'
      });
    }).on('restart', function() {
      notifyVanilla.notify({
        title: 'Nodemon',
        subtitle: 'restarted',
        message: 'Application has been restarted.'
      });
    }).on('crash', function() {
      notifyVanilla.notify({
        title: 'Nodemon',
        subtitle: 'ERROR',
        message: 'Application start halted due to error.'
      });
    });
    cb();
  });

  /*---------------------------------------------------------------
   DEVELOPMENT
   Tasks used generally for development purposes, watching, etc.
  ---------------------------------------------------------------*/
  gulp.task('fonts', [], function() {
    gulp.src(config.fonts.src)
      .pipe(gulp.dest(config.fonts.dest));
  });

  gulp.task('sass', ['inject:sass'], function() {
    var target = gulp.src(config.sass.src);

    return $.rubySass(config.rubySass.src, config.rubySass.settings)
      .pipe($.autoprefixer(config.autoPrefixer.settings))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(client + '/css'));
  });

  gulp.task('angular:templates', function() {
    var src = [
      client + '/components/**/*.html'
    ];

    return gulp.src(src)
      //.pipe($.htmlmin({collapseWhitespace: true}))
      .pipe($.angularTemplatecache({
        module: 'app',
        root: 'components/'
      }))
      .pipe(gulp.dest(client + '/javascripts'));
  });

  gulp.task('inject', ['inject:bower', 'sass', 'inject:app']);

  gulp.task('inject:app', ['angular:templates'], function() {
    var origin = gulp.src(client + '/index.html');
    var sources = gulp.src([
      client + '/javascripts/utils.js',
      client + '/javascripts/routingConfig.js',
      client + '/javascripts/**/*.js',
      client + '/components/**/*.js',
      client + '/css/*.css',
      '!' + bowerDir + '/*'
    ]);
    return origin
      .pipe($.inject(sources, {
        name: 'app',
        relative: true,
        addRootSlash: true
      }))
      .pipe(gulp.dest(client));
  });

  gulp.task('inject:sass', function() {
    var target = gulp.src(client + '/sass/app.scss');
    var sources = gulp.src(config.sass.inject.src);
    return target.pipe(
        $.inject(sources, config.sass.inject.settings))
      .pipe(gulp.dest(client + '/sass'));
  });

  gulp.task('inject:bower', function() {
    var origin = gulp.src([
      client + '/*.html'
    ]);
    var sources = gulp.src($.mainBowerFiles());

    return origin
      .pipe($.inject(sources, {
        name: 'bower',
        relative: true,
        addRootSlash: true
      }))
      .pipe(gulp.dest(client));
  });


  /*---------------------------------------------------------------
   BUILD
   Tasks used generally for minification, revisioning, etc.
   ---------------------------------------------------------------*/

  gulp.task('build', ['build:clean'], function() {
    gulp.start('build:ready');
  });

  gulp.task('build:ready', ['build:compile'], function() {
    // Revision everything
    return gulp.src([
        dist + '/{components,images,javascripts,css}/**/*.*',
        dist + '/*.html'
      ])
      .pipe($.revAll({
        //quiet: true,
        ignore: [
          /^\/favicon/g, // ignore /favicon
          /^\/ping/g, // ignore /ping.gif
          /^\/fonts\/fontawesome/g, // ignore font awesome
          /^\/fonts\/glyphicons/g, // ignore font awesome
          '.html',
        ]
      }))
      .pipe(gulp.dest(dist))
      .pipe($.revAll.manifest())
      .pipe(gulp.dest(dist))
      .pipe($.revNapkin());
  });

  gulp.task('build:clean', function(cb) {
    del([dist + '/**/*'], cb);
    //return gulp.src(dist + '/**/*', {read:false})
    //  .pipe($.clean({force:true}))
    //  .pipe(gulp.dest(dist));;
  });

  gulp.task('build:compile', ['build:fonts', 'build:favicon', 'build:images', 'inject'], function() {
    return gulp.src(client + '/*.html')
      .pipe($.usemin({
        //html: [$.minifyHtml({empty: true})],

        appCss: [$.sourcemaps.init(), $.minifyCss(), 'concat', $.sourcemaps.write('.')],
        appJs: [$.sourcemaps.init(), $.ngAnnotate(), $.sourcemaps.write('.')],

        vendorCss: [$.sourcemaps.init(), $.minifyCss(), 'concat', $.sourcemaps.write('./')],
        vendorJs: [$.sourcemaps.init(), $.ngAnnotate(), $.uglify(), $.sourcemaps.write('./')]
      }))
      .pipe(gulp.dest(dist));
  });

  gulp.task('build:fonts', function() {
    return gulp.src(config.fonts.src)
      .pipe(gulp.dest(dist + '/fonts'));
  });

  gulp.task('build:favicon', function() {
    return gulp.src(client + '/favicon/**/*.*')
      .pipe($.imagemin(config.imagemin))
      .pipe(gulp.dest(dist + '/favicon'));
  });

  gulp.task('build:images', function() {
    return gulp.src(client + '/images/**/*.*')
      .pipe($.imagemin(config.imagemin))
      .pipe(gulp.dest(dist + '/images'));
  });



  /*---------------------------------------------------------------
   TESTING
   ---------------------------------------------------------------*/
  gulp.task('updateFixtures', function() {

  });

  gulp.task('installFixtures', ['updateFixtures'], function() {

  });

  gulp.task('test', ['installFixtures'], function() {

  });

}());
