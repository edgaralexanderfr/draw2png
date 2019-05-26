const gulp        = require('gulp');
const cp          = require('child_process');
const browserSync = require('browser-sync').create();

gulp.task('compile-core', (done) => {
    const outputFilePath = 'res/js/Draw2PNG/dist/Draw2PNG.min.js'; 
    const folders        = [
        /**
         * Order matters and is the same we follow in _index.html_:
         */
        'res/js/Draw2PNG/src/functions/*.js', 
        'res/js/Draw2PNG/src/classes/*.js', 
        'res/js/Draw2PNG/src/Color.js', 
        'res/js/Draw2PNG/src/Pixmap.js', 
        'res/js/Draw2PNG/src/Filter.js', 
        'res/js/Draw2PNG/src/ColorToleranceFilter.js'
    ].join(' ');

    cp.execSync(
        './node_modules/.bin/google-closure-compiler ' + 
        '--js ' + folders + 
        ' --js_output_file ' + outputFilePath
    );
    done();
});

gulp.task('browser-sync', (done) => {
    const port = 9999;
    
    browserSync.init({
        port   : port, 
        server : {
            baseDir : './'
        }
    });
});

gulp.task('jsdoc', (done) => {
    cp.execSync(
        'rm -rf docs && ' + 
        './node_modules/.bin/jsdoc ' + 
        'res/js/Draw2PNG/src -r ' + 
        '-d docs ' + 
        '-R README.md'
    );
    done();
});
