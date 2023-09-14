
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
        .pipe(rename('three_0.151.0.min.js'))
        .pipe(gulp.dest(dist + '/lib'));
  });

//  'Copy three.module.js into icn3dnpm',
gulp.task('libs-three-module',
//gulp.series('clean'),
function() {
  return gulp.src([
          "node_modules/three/build/three.module.js"
      ])
      .pipe(gulp.dest(icn3dnpm));
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
            "node_modules/jquery-ui/dist/jquery-ui.min.js"
        ])
        .pipe(gulp.dest(dist + '/lib'))
        .pipe(rename('jquery-ui-1.13.2.min.js'))
        .pipe(gulp.dest(dist + '/lib'));
  });

//  'Copy jquery-ui.min.css into dist/libs',
gulp.task('libs-jquery-ui-css',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "node_modules/jquery-ui/dist/themes/ui-lightness/jquery-ui.min.css"
        ])
        .pipe(gulp.dest(dist + '/lib'))
        .pipe(rename('jquery-ui-1.13.2.min.css'))
        .pipe(gulp.dest(dist + '/lib'));
  });

//  'Copy jquery-ui images into dist/libs',
gulp.task('libs-jquery-ui-images1',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "node_modules/jquery-ui/dist/themes/ui-lightness/images"
        ])
        .pipe(gulp.dest(dist + '/lib'));
  });

//  'Copy jquery-ui images into dist/lib',
gulp.task('libs-jquery-ui-images2',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "node_modules/jquery-ui/dist/themes/ui-lightness/images/**"
        ])
        .pipe(gulp.dest(dist + '/lib/images'))
        .pipe(gulp.dest(icn3dnpm + '/css/lib/images'));
  });

//  'Copy line-awesome fonts into dist/lib',
gulp.task('libs-line-awesome-fonts',
//gulp.series('clean'),
function() {
  return gulp.src([
          "node_modules/line-awesome/dist/line-awesome/fonts/**"
      ])
      .pipe(gulp.dest(dist + '/lib/fonts'))
      .pipe(gulp.dest(icn3dnpm + '/css/lib/fonts'));
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
            'LICENSE.md',
            'CHANGELOG.md',
            'README.md'
        ])
        .pipe(gulp.dest(dist));
  });

//  'modify line-awesome',
gulp.task('mod-line-awesome',
//gulp.series('clean'),
function() {
  return gulp.src(["node_modules/line-awesome/dist/line-awesome/css/line-awesome.min.css"])
      .pipe(replace('../fonts/', 'lib/fonts/'))
      .pipe(gulp.dest(tmpdir))
    });

//  'Copy and rename css files',
gulp.task('copy-rename2',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "css/icn3d.css",
            "src/thirdparty/color-pick/color-picker.css",
            "./tmpdir/line-awesome.min.css",
        ])
        .pipe(concat('icn3d.css'))
        .pipe(gulp.dest(dist))
        .pipe(gulp.dest(icn3dnpm + '/css'))
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

    "src/thirdparty/mmtfRcsbMod.js"
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

var alljs = [
    //"tmpdir/icn3d_rollup_vr.js",
    "tmpdir/third.js",
    "tmpdir/icn3d_rollup.js"
];

var allminjs = [
    //"tmpdir/icn3d_rollup_vr.min.js",
    "tmpdir/third.min.js",
    "tmpdir/icn3d_rollup.min.js"
];

var allnodejs = [
    "tmpdir/third_node.js",
    "tmpdir/icn3d_rollup_node.js"
];

var allmodulejs = [
    //"tmpdir/icn3d_rollup_vr_module.js",
    "tmpdir/third.js",
    "tmpdir/icn3d_rollup_module.js"
    //,
    //"src/thirdparty/moduleExport.js"
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
        .pipe(gulp.dest(icn3dnpm))
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
        .pipe(gulp.dest(build))
        .pipe(gulp.dest(icn3dnpm));
  });

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
    return gulp.src(['icn3d.html', 'share.html'])
      .pipe(gulp.dest(dist));
  });

gulp.task("html4",
  function() {
    return gulp.src(['example/example.html', 'example/module.html', 'example/loadStateFile.js', 'example/addAnnoLocal.html', 'example/annoLocal.js'])
      .pipe(gulp.dest(dist + '/example'));
  });

//  'Prepare all the distribution files (except the .zip).',
gulp.task('dist',
  gulp.series('clean', 'libs-three','libs-three-module','libs-jquery','libs-jquery-ui','libs-jquery-ui-css','libs-jquery-ui-images1',
    'libs-jquery-ui-images2','libs-line-awesome-fonts','ssimages','copy','mod-line-awesome','copy-rename2','third','third_node','rollup','rollupmin',
    'rollupnode','rollupmodule','all','allmin','allnode','allmodule',
    'html','html2','html3','html4')
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
