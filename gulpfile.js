var package = require('./package.json');
var gulp = require('gulp'); //require('gulp-help')(require('gulp'));
var concat = require('gulp-concat');
var del = require('del');
var dom  = require('gulp-dom');
//var gh_pages = require('gulp-gh-pages');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');

var dist = 'dist';
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
        .pipe(gulp.dest(dist + '/lib'))
        .pipe(rename('three_0.103.0.min.js'))
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
gulp.task('copy-rename1',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "css/icn3d_simple_ui.css"
        ])
        .pipe(gulp.dest(dist))
        .pipe(rename('icn3d_simple_ui_' + package.version + '.css'))
        .pipe(gulp.dest(dist));
  });

//  'Copy and rename css files',
gulp.task('copy-rename2',
  //gulp.series('clean'),
  function() {
    return gulp.src([
            "css/icn3d_full_ui.css",
            "src/color-pick/color-picker.css"
        ])
        .pipe(concat('icn3d_full_ui.css'))
        .pipe(gulp.dest(dist))
        .pipe(rename('icn3d_full_ui_' + package.version + '.css'))
        .pipe(gulp.dest(dist));
  });

// Helper function to create a gulp task to concatenate and minify
// simple and full
//      'Concat and minify the ' + name + ' javascript',
function make_js_task(name, src) {
    gulp.task("src-js-" + name,
      //gulp.series('clean'),
      function() {
        return gulp.src(src)
            .pipe(concat('icn3d_' + name + '_ui.js'))
            .pipe(gulp.dest(dist))
            .pipe(uglify())
            .pipe(rename({ extname: '.min.js' }))
            .pipe(gulp.dest(dist))
            .pipe(rename('icn3d_' + name + '_ui_' + package.version + '.min.js'))
            .pipe(gulp.dest(dist))
            .pipe(rename(name + '_ui_all.min.js'))
            .pipe(gulp.dest(dist));
      });
}

// These source JavaScript files are common to both simple and full
var common_js = [
    "src/utils/Detector.js",
    "src/trackball/TrackballControls.js",
    "src/trackball/OrthographicTrackballControls.js",
    "src/Projector.js",
    "src/mmtf_es5.js",
    "src/shader/NGL_Shaders.js",
    "src/shader/SphereImpostor.frag",
    "src/shader/SphereImpostor.vert",
    "src/shader/CylinderImpostor.frag",
    "src/shader/CylinderImpostor.vert",
    "src/shader/SphereInstancing.frag",
    "src/shader/SphereInstancing.vert",
    "src/shader/CylinderInstancing.frag",
    "src/shader/CylinderInstancing.vert",
    "src/shader/Instancing.frag",
    "src/shader/Instancing.vert",
    "src/icn3d/icn3d.js",
    "src/icn3d/loadpdb.js",
    "src/icn3d/draw/drawing.js",
    "src/icn3d/display/display_common.js",
    "src/icn3d/draw/impostor.js",
    "src/icn3d/draw/instancing.js",
    "src/icn3d/other.js",
    "src/utils/canvas-to-blob.js",
    "src/utils/FileSaver.js"
];

var simple_js = [
    "src/icn3d/display/display_simple.js"
];

var full_js = [
    "src/surface/marchingcube.js",
    "src/surface/ProteinSurface4.js",
    "src/surface/setupsurface.js",
    "src/surface/ElectronMap.js",
    "src/surface/setupmap.js",
    "src/icn3d/draw/drawing_full.js",
    "src/icn3d/display/display_full.js",
    "src/icn3d/other_full.js"
];

var common_uijs = [
    "src/icn3dui/common_full_simple.js",
    "src/utils/rmsd_supr.js",
    "src/icn3dui/parsers/mmcif_mmdb_parser.js",
    "src/icn3dui/parsers/mmtf_parser.js",
    "src/icn3dui/parsers/pdb_parser.js",
    "src/icn3dui/parsers/sdf_parser.js"
];

var full_uijs = [
    "src/icn3dui/3dprint/stl.js",
    "src/icn3dui/3dprint/vrml.js",
    "src/icn3dui/3dprint/threedprint.js",
    "src/icn3dui/parsers/mmcif_mmdb_parser_align.js",
    "src/icn3dui/parsers/mol2_parser.js",
    "src/icn3dui/parsers/xyz_parser.js",
    "src/icn3dui/parsers/dsn6_parser.js",
    "src/icn3dui/webservices/delphi.js",
    "src/icn3dui/webservices/symd.js",
    "src/icn3dui/webservices/scap.js",
    "src/icn3dui/annotations/annotations.js",
    "src/icn3dui/annotations/addtrack.js",
    "src/icn3dui/selection/selection.js",
    "src/icn3dui/selection/advanced.js",
    "src/icn3dui/selection/sets.js",
    "src/icn3dui/selection/commands.js",
    "src/icn3dui/highlight/hl_sequence.js",
    "src/icn3dui/highlight/hl_update.js",
    "src/icn3dui/html/set_html.js",
    "src/icn3dui/html/events.js",
    "src/icn3dui/html/dialogs.js",
    "src/icn3dui/twoddiagram.js",
    "src/color-pick/color-picker.js",
];

// Create the gulp tasks for simple and full:
make_js_task("simple", common_js.concat(simple_js).concat("src/icn3dui/simple_ui.js").concat(common_uijs).concat("src/icn3dui/highlight/hl_update_simple.js"));
make_js_task("full", common_js.concat(full_js).concat("src/icn3dui/full_ui.js").concat(common_uijs).concat(full_uijs));

//  'Rewrite the link and script tags in the html',
gulp.task('html',
  //gulp.series('clean'),
  function() {
    return gulp.src(['index.html', 'icn3d.html', 'share.html', 'example.html'])
        .pipe(dom(function() {
            var elems = this.querySelectorAll(
                "script[src],link[rel='stylesheet']");
            for (i = 0; i < elems.length; ++i) {
                var e = elems[i];
                var src_attr = (e.tagName == "SCRIPT") ? "src" : "href";
                var src_file = e.getAttribute(src_attr);

                var new_src, m, set_attr = true;
                if (m = src_file.match(/^(icn3d.*)\.css$/))
                    new_src = m[1] + "_" + package.version + ".css";
                else if (m = src_file.match(/^(icn3d.*)\.min\.js/))
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

gulp.task('html2',
  //gulp.series('clean'),
  function() {
    return gulp.src(['full.html'])
        .pipe(dom(function() {
            var elems = this.querySelectorAll(
                "script[src],link[rel='stylesheet']");
            for (i = 0; i < elems.length; ++i) {
                var e = elems[i];
                var src_attr = (e.tagName == "SCRIPT") ? "src" : "href";
                var src_file = e.getAttribute(src_attr);

                var new_src, m, set_attr = true;
                if (m = src_file.match(/^(icn3d.*)\.css$/))
                    new_src = m[1] + "_" + package.version + ".css";
                else if (m = src_file.match(/^(icn3d.*)\.min\.js/))
                    new_src = m[1] + "_" + package.version + ".min.js";
                else if (m = src_file.match(/^(.*)$/)) {
                    new_src = m[1];
                }
                if (set_attr) e.setAttribute(src_attr, new_src);
            }
            return this;
        }))
        .pipe(gulp.dest(dist))
        .pipe(rename('full_' + package.version + '.html'))
        .pipe(gulp.dest(dist));
  });

gulp.task('html3',
  //gulp.series('clean'),
  function() {
    return gulp.src(['full2.html'])
        .pipe(dom(function() {
            var elems = this.querySelectorAll(
                "script[src],link[rel='stylesheet']");
            for (i = 0; i < elems.length; ++i) {
                var e = elems[i];
                var src_attr = (e.tagName == "SCRIPT") ? "src" : "href";
                var src_file = e.getAttribute(src_attr);

                var new_src, m, set_attr = true;
                if (m = src_file.match(/^(icn3d.*)\.css$/))
                    new_src = m[1] + "_" + package.version + ".css";
                else if (m = src_file.match(/^(icn3d.*)\.min\.js/))
                    new_src = m[1] + "_" + package.version + ".min.js";
                else if (m = src_file.match(/^(.*)$/)) {
                    new_src = m[1];
                }
                if (set_attr) e.setAttribute(src_attr, new_src);
            }
            return this;
        }))
        .pipe(gulp.dest(dist))
        .pipe(rename('full2_' + package.version + '.html'))
        .pipe(gulp.dest(dist));
  });

//  'Prepare all the distribution files (except the .zip).',
gulp.task('dist',
  gulp.series('clean', 'libs-three','libs-jquery','libs-jquery-ui','libs-jquery-ui-css','libs-jquery-ui-images1','libs-jquery-ui-images2',
   'ssimages','copy','copy-rename1','copy-rename2','src-js-simple','src-js-full','html','html2','html3')
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
