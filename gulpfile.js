
var package = require('./package.json');
var gulp = require('gulp'); //require('gulp-help')(require('gulp'));
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var del = require('del');
var dom  = require('gulp-dom');
//var gh_pages = require('gulp-gh-pages');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');

var rollup = require('rollup');
var resolve = require('rollup-plugin-node-resolve');
//https://source.netsyms.com/Mirrors/Vestride_Shuffle/commit/3be38c640d9b8394054097fdd59dee5fadbe0b88
var {terser} = require('rollup-plugin-terser');

var dist = 'dist';
var build = 'build';
var icn3dnpm = 'icn3dnpm';
var tmpdir = 'tmpdir';
var base_name = 'icn3d-' + package.version;


//  'Removes the dist directory, for a clean build',
gulp.task('clean',
  function() {
    return del([dist]);
  });

//  'Copy three.min.js into dist/libs',
gulp.task('libs-three',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "node_modules/three/build/three.min.js"
        ])
        .pipe(rename('threeClass.min.js'))
        .pipe(gulp.dest(dist + '/lib'))
        .pipe(rename('three_0.128.0.min.js'))
        .pipe(gulp.dest(dist + '/lib'));
  });

//  'Copy jquery.min.js into dist/libs',
gulp.task('libs-jquery',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "node_modules/jquery/dist/jquery.min.js"
        ])
        .pipe(gulp.dest(dist + '/lib'))
        .pipe(rename('jquery-3.5.0.min.js'))
        .pipe(gulp.dest(dist + '/lib'));
  });

//  'Copy jquery-ui.min.js into dist/libs',
gulp.task('libs-jquery-ui',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "node_modules/jquery-ui/jquery-ui.min.js"
        ])
        .pipe(gulp.dest(dist + '/lib'))
        .pipe(rename('jquery-ui-1.12.1.min.js'))
        .pipe(gulp.dest(dist + '/lib'));
  });

//  'Copy jquery-ui.min.css into dist/libs',
gulp.task('libs-jquery-ui-css',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "node_modules/jquery-ui/themes/ui-lightness/jquery-ui.min.css"
        ])
        .pipe(gulp.dest(dist + '/lib'))
        .pipe(rename('jquery-ui-1.12.1.min.css'))
        .pipe(gulp.dest(dist + '/lib'));
  });

//  'Copy jquery-ui images into dist/libs',
gulp.task('libs-jquery-ui-images1',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "node_modules/jquery-ui/themes/ui-lightness/images"
        ])
        .pipe(gulp.dest(dist + '/lib'));
  });

//  'Copy jquery-ui images into dist/libs',
gulp.task('libs-jquery-ui-images2',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "node_modules/jquery-ui/themes/ui-lightness/images/**"
        ])
        .pipe(gulp.dest(dist + '/lib/images'));
  });

//  'Copy images to show secondary structures into dist/ssimages',
gulp.task('ssimages',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "ssimages/**"
        ])
        .pipe(gulp.dest(dist + '/ssimages'));
  });

//  'Copies several files as-is into dist, including source css and various metadata files.',
gulp.task('copy',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            'LICENSE',
            'README.md'
        ])
        .pipe(gulp.dest(dist));
  });

//  'Copy and rename css files',
gulp.task('copy-rename2',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "css/icn3d.css",
            "src/thirdparty/color-pick/color-picker.css"
        ])
        .pipe(concat('icn3d.css'))
        .pipe(gulp.dest(dist))
        .pipe(rename('icn3d_' + package.version + '.css'))
        .pipe(gulp.dest(dist));
  });

var common_js = [
    "src/thirdparty/shader/NGL_Shaders.js",
    "src/thirdparty/shader/SphereImpostor.frag",
    "src/thirdparty/shader/SphereImpostor.vert",
    "src/thirdparty/shader/CylinderImpostor.frag",
    "src/thirdparty/shader/CylinderImpostor.vert",
    "src/thirdparty/shader/SphereInstancing.frag",
    "src/thirdparty/shader/SphereInstancing.vert",
    "src/thirdparty/shader/CylinderInstancing.frag",
    "src/thirdparty/shader/CylinderInstancing.vert",
    "src/thirdparty/shader/Instancing.frag",
    "src/thirdparty/shader/Instancing.vert",

    "src/thirdparty/three/Projector.js",
    "src/thirdparty/three/TrackballControls.js",
    "src/thirdparty/three/OrthographicTrackballControls.js",

    "src/thirdparty/mmtfRcsbMod.js",
];

var third_node_js = ["src/thirdparty/defineWindow.js"].concat(common_js);

var third_js = common_js.concat([
    "src/thirdparty/color-pick/color-picker.js",
    "src/thirdparty/FileSaver.js",
    "src/thirdparty/canvas-to-blob.js",
//    "src/thirdparty/d3v4-force-graph.js",
]);

gulp.task("third_node",
  function() {
    return gulp.src(third_node_js)
        .pipe(concat('third_node.js'))
        .pipe(gulp.dest(tmpdir));
  });

gulp.task("third",
  function() {
    return gulp.src(third_js)
        .pipe(concat('third.js'))
        .pipe(gulp.dest(tmpdir))
        .pipe(uglify())
        .pipe(concat('third.min.js'))
        .pipe(gulp.dest(tmpdir));
  });

gulp.task('rollup', () => {
  return rollup.rollup({
    input: 'src/icn3dui.js',
    plugins: [
      resolve(),
      //terser(),
    ]
  }).then(bundle => {
    return bundle.write({
      name: 'icn3d',
      file: './tmpdir/icn3d_rollup.js',
      format: 'iife',
    });
  });
});

gulp.task('rollupmin', () => {
  return rollup.rollup({
    input: 'src/icn3dui.js',
    plugins: [
      resolve(),
      terser(),
    ]
  }).then(bundle => {
    return bundle.write({
      name: 'icn3d',
      file: './tmpdir/icn3d_rollup.min.js',
      format: 'iife',
    });
  });
});

gulp.task('rollupnode', () => {
  return rollup.rollup({
    input: 'src/icn3dui.js',
    plugins: [
      resolve(),
      //terser(),
    ]
  }).then(bundle => {
    return bundle.write({
      name: 'icn3d',
      file: './tmpdir/icn3d_rollup_node.js',
      format: 'cjs',
    });
  });
});

gulp.task('rollupmodule', () => {
  return rollup.rollup({
    input: 'src/icn3dui.js',
    plugins: [
      resolve(),
      //terser(),
    ]
  }).then(bundle => {
    return bundle.write({
      name: 'icn3d',
      file: './tmpdir/icn3d_rollup_module.js',
      format: 'es',
    });
  });
});

gulp.task('rollupmodulemin', () => {
  return rollup.rollup({
    input: 'src/icn3dui.js',
    plugins: [
      resolve(),
      terser(),
    ]
  }).then(bundle => {
    return bundle.write({
      name: 'icn3d',
      file: './tmpdir/icn3d_rollup_module.min.js',
      format: 'es',
    });
  });
});

var alljs = [
    "tmpdir/third.js",
    "tmpdir/icn3d_rollup.js"
];

var allminjs = [
    "tmpdir/third.min.js",
    "tmpdir/icn3d_rollup.min.js"
];

var allnodejs = [
    "tmpdir/third_node.js",
    "tmpdir/icn3d_rollup_node.js"
];

var allmodulejs = [
    "tmpdir/third.js",
    "tmpdir/icn3d_rollup_module.js",
    "src/thirdparty/moduleExport.js"
];

// Create the gulp tasks for simple and full:
gulp.task("all",
  function() {
    return gulp.src(alljs)
        .pipe(concat('icn3d.js'))
        .pipe(gulp.dest(dist))
        .pipe(gulp.dest(build));
  });

gulp.task("allmin",
  function() {
    return gulp.src(allminjs)
        .pipe(concat('icn3d.min.js'))
        .pipe(gulp.dest(dist))
        .pipe(gulp.dest(build))
        .pipe(rename('icn3d_' + package.version + '.min.js'))
        .pipe(gulp.dest(dist));
  });

gulp.task("allnode",
  function() {
    return gulp.src(allnodejs)
        .pipe(replace('alert(', 'var aaa = 1; //alert('))
        .pipe(concat('icn3d.js'))
        .pipe(gulp.dest(icn3dnpm));
  });

gulp.task("allmodule",
  function() {
    return gulp.src(allmodulejs)
        .pipe(concat('icn3d.module.js'))
        .pipe(gulp.dest(dist))
        .pipe(gulp.dest(build));
  });

/*
//  'Rewrite the link and script tags in the html',
gulp.task('html',
  //gulp.series('clean'),
  function() {
    return gulp.src(['index.html', 'full.html', 'full2.html', 'icn3d.html', 'share.html', 'example.html'])
        .pipe(dom(function() {
            var elems = this.querySelectorAll(
                "script[src],link[rel='stylesheet']");
            for (i = 0; i < elems.length; ++i) {
                var e = elems[i];
                var src_attr = (e.tagName == "SCRIPT") ? "src" : "href";
                var src_file = e.getAttribute(src_attr);

                var new_src, m, set_attr = true;
                if (m = src_file.match(/^(icn3d)\.css$/))
                    new_src = m[1] + "_" + package.version + ".css";
                else if (m = src_file.match(/^(icn3d)\.min\.js/))
                    new_src = m[1] + "_" + package.version + ".min.js";
                else if (m = src_file.match(/^(.*)$/)) {
                    new_src = m[1];
                }
                if (set_attr) e.setAttribute(src_attr, new_src);
            }
            return this;
        }))
        .pipe(gulp.dest(dist));
  });
*/

gulp.task("html",
  function() {
    return gulp.src(['index.html', 'full.html'])
      .pipe(replace('icn3d.css', 'icn3d_' + package.version + '.css'))
      .pipe(replace('icn3d.min.js', 'icn3d_' + package.version + '.min.js'))
      .pipe(gulp.dest(dist))
      .pipe(rename('full_' + package.version + '.html'))
      .pipe(gulp.dest(dist));
  });

gulp.task("html2",
  function() {
    return gulp.src(['full2.html'])
      .pipe(replace('icn3d.css', 'icn3d_' + package.version + '.css'))
      .pipe(replace('icn3d.min.js', 'icn3d_' + package.version + '.min.js'))
      .pipe(gulp.dest(dist))
      .pipe(rename('full2_' + package.version + '.html'))
      .pipe(gulp.dest(dist));
  });

gulp.task("html3",
  function() {
    return gulp.src(['icn3d.html', 'share.html', 'example.html', 'module.html'])
      .pipe(gulp.dest(dist));
  });

//  'Prepare all the distribution files (except the .zip).',
gulp.task('dist',
  gulp.series('clean', 'libs-three','libs-jquery','libs-jquery-ui','libs-jquery-ui-css','libs-jquery-ui-images1',
    'libs-jquery-ui-images2','ssimages','copy','copy-rename2','third','third_node','rollup','rollupmin',
    'rollupnode','rollupmodule','all','allmin','allnode','allmodule',
    'html','html2','html3')
/*
  gulp.series('clean', 'libs-three','libs-jquery','libs-jquery-ui','libs-jquery-ui-css','libs-jquery-ui-images1',
    'libs-jquery-ui-images2','ssimages','copy','copy-rename2','third','third_node','rollup','rollupmin',
    'all','allmin',
    'html','html2','html3','html4')
*/
);

//  'Zip up the dist into icn3d-<version>.zip',
gulp.task('zip',
  function() {
    return gulp.src('./dist/**')
      .pipe(rename(function(path) {
        path.dirname = base_name + '/' + path.dirname;
      }))
      .pipe(zip(base_name + '.zip'))
      .pipe(gulp.dest('dist'));
  });

//  'The default task creates the distribution files and the .zip from scratch',
gulp.task('default',
  gulp.series('dist','zip')
);
