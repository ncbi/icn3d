var package = require('./package.json');
var gulp = require('gulp-help')(require('gulp'));
var concat = require('gulp-concat');
var del = require('del');
var dom  = require('gulp-dom');
var gh_pages = require('gulp-gh-pages');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');

var dist = 'dist';
var base_name = 'icn3d-' + package.version;


gulp.task('clean',
  'Removes the dist directory, for a clean build',
  function () {
    return del([dist]);
  });

gulp.task('libs',
  'Copy library files (css and js) into dist/libs',
  ['clean'],
  function() {
    return gulp.src([
            "node_modules/jquery-ui/themes/ui-lightness/**",
            "node_modules/jquery/dist/jquery.min.js",
            "node_modules/jquery-ui/jquery-ui.min.js",
            "node_modules/three/three.min.js",
            "node_modules/three/three_0.71.1.min.js",
        ])
        .pipe(gulp.dest(dist + '/lib'));
  });

gulp.task('copy',
  'Copies several files as-is into dist, including source css and ' +
  'various metadata files.',
  ['clean'],
  function () {
    return gulp.src([
            'LICENSE',
            'README.md'
        ])
        .pipe(gulp.dest(dist));
  });

gulp.task('copy-rename1',
  'Copy and rename css files',
  ['clean'],
  function () {
    return gulp.src([
            "src/icn3d_simple_ui.css"
        ])
        .pipe(gulp.dest(dist))
		.pipe(rename('icn3d_simple_ui_' + package.version + '.css'))
		.pipe(gulp.dest(dist));
  });

gulp.task('copy-rename2',
  'Copy and rename css files',
  ['clean'],
  function () {
    return gulp.src([
            "src/icn3d_full_ui.css"
        ])
        .pipe(gulp.dest(dist))
		.pipe(rename('icn3d_full_ui_' + package.version + '.css'))
		.pipe(gulp.dest(dist));
  });

// Helper function to create a gulp task to concatenate and minify
// simple and full
function make_js_task(name, src) {
    gulp.task("src-js-" + name,
      'Concat and minify the ' + name + ' javascript',
      ['clean'],
      function() {
        return gulp.src(src)
            .pipe(concat(name + '_ui_all.js'))
            .pipe(gulp.dest(dist))
            .pipe(uglify())
            .pipe(rename({ extname: '.min.js' }))
            .pipe(gulp.dest(dist))
            .pipe(rename(name + '_ui_all_' + package.version + '.min.js'))
            .pipe(gulp.dest(dist));
      });
}

// These source JavaScript files are common to both simple and full
var common_js = [
    "src/1utils.js",
    "src/3globals.js",
    "src/1math/1math-constants.js",
    "src/1math/array-utils.js",
    "src/1math/math-utils.js",
    "src/1math/matrix-utils.js",
    "src/1math/vector-utils.js",
    "src/2shader/1chunk/dull_interior_fragment.glsl",
    "src/2shader/1chunk/fog_fragment.glsl",
    "src/2shader/1chunk/nearclip_fragment.glsl",
    "src/2shader/1chunk/nearclip_vertex.glsl",
    "src/2shader/1chunk/opaque_back_fragment.glsl",
    "src/2shader/1chunk/radiusclip_fragment.glsl",
    "src/2shader/1chunk/radiusclip_vertex.glsl",
    "src/2shader/BasicLine.frag",
    "src/2shader/BasicLine.vert",
    "src/2shader/CylinderImpostor.frag",
    "src/2shader/CylinderImpostor.vert",
    "src/2shader/HyperballStickImpostor.frag",
    "src/2shader/HyperballStickImpostor.vert",
    "src/2shader/Image.frag",
    "src/2shader/Image.vert",
    "src/2shader/Line.frag",
    "src/2shader/Line.vert",
    "src/2shader/LineSprite.frag",
    "src/2shader/LineSprite.vert",
    "src/2shader/Mesh.frag",
    "src/2shader/Mesh.vert",
    "src/2shader/ParticleSprite.frag",
    "src/2shader/ParticleSprite.vert",
    "src/2shader/Point.frag",
    "src/2shader/Point.vert",
    "src/2shader/Quad.frag",
    "src/2shader/Quad.vert",
    "src/2shader/Ribbon.vert",
    "src/2shader/SDFFont.frag",
    "src/2shader/SDFFont.vert",
    "src/2shader/SphereHalo.frag",
    "src/2shader/SphereHalo.vert",
    "src/2shader/SphereImpostor.frag",
    "src/2shader/SphereImpostor.vert",
    "src/2shader/shader-utils.js",
    "src/3buffer/1buffer.js",
    "src/3buffer/2buffer-utils.js",
    "src/3buffer/3contour-buffer.js",
    "src/3buffer/3doublesided-buffer.js",
    "src/3buffer/3image-buffer.js",
    "src/3buffer/3line-buffer.js",
    "src/3buffer/3mapped-buffer.js",
    "src/3buffer/3mesh-buffer.js",
    "src/3buffer/3point-buffer.js",
    "src/3buffer/3trace-buffer.js",
    "src/3buffer/3vector-buffer.js",
    "src/3buffer/4box-buffer.js",
    "src/3buffer/4geometry-buffer.js",
    "src/3buffer/5alignedbox-buffer.js",
    "src/3buffer/5conegeometry-buffer.js",
    "src/3buffer/5cylindergeometry-buffer.js",
    "src/3buffer/5ellipsoidgeometry-buffer.js",
    "src/3buffer/5quad-buffer.js",
    "src/3buffer/5spheregeometry-buffer.js",
    "src/3buffer/6cone-buffer.js",
    "src/3buffer/6cylinderimpostor-buffer.js",
    "src/3buffer/6ellipsoid-buffer.js",
    "src/3buffer/6hyperballstickimpostor-buffer.js",
    "src/3buffer/6sphereimpostor-buffer.js",
    "src/3buffer/7arrow-buffer.js",
    "src/3buffer/7cylinder-buffer.js",
    "src/3buffer/7hyperballstick-buffer.js",
    "src/3buffer/7ribbon-buffer.js",
    "src/3buffer/7sphere-buffer.js",
    "src/3buffer/7surface-buffer.js",
    "src/3buffer/7text-buffer.js",
    "src/3buffer/7tubemesh-buffer.js",
    "src/Detector.js",
    "src/CanvasRenderer.js",
    "src/TrackballControls.js",
    "src/OrthographicTrackballControls.js",
    "src/Projector.js",
    "src/marchingcube.js",
    "src/ProteinSurface4.js",
    "src/setupsurface.js",
    "src/mmtf.js",
    "src/icn3d/icn3d.js",
    "src/icn3d/loadpdb.js",
    "src/icn3d/drawing.js",
    "src/icn3d/display.js",
    "src/icn3d/other.js"
];

var common_uijs = [
    "src/icn3dui/common.js",
    "src/icn3dui/parsers/mmcif_mmdb_parser.js",
    "src/icn3dui/parsers/mmtf_parser.js",
    "src/icn3dui/parsers/mol2_parser.js",
    "src/icn3dui/parsers/pdb_parser.js",
    "src/icn3dui/parsers/sdf_parser.js",
    "src/icn3dui/parsers/xyz_parser.js"
];

// Create the gulp tasks for simple and full:
make_js_task("simple", common_js.concat("src/icn3dui/simple_ui.js").concat(common_uijs));
make_js_task("full", common_js.concat("src/icn3dui/full_ui.js").concat(common_uijs));

gulp.task('html',
  'Rewrite the link and script tags in the html',
  ['clean'],
  function() {
    return gulp.src(['index.html', 'full.html', 'icn3d.html'])
        .pipe(dom(function() {
            var elems = this.querySelectorAll(
                "script[src],link[rel='stylesheet']");
            for (i = 0; i < elems.length; ++i) {
                var e = elems[i];
                var src_attr = (e.tagName == "SCRIPT") ? "src" : "href";
                var src_file = e.getAttribute(src_attr);

                var new_src, m,
                    set_attr = true;
                if (m = src_file.match(/^node_modules\/.*\/(.*)/))
                    new_src = "lib/" + m[1];
                else if (m = src_file.match(/^src\/(.*\.css)$/))
                    new_src = m[1];
                else if (m = src_file.match(/^src\/(.*_ui)\.js/))
                    new_src = m[1] + "_all.min.js";
                else {
                    e.parentNode.removeChild(e);
                    set_attr = false;
                }
                if (set_attr) e.setAttribute(src_attr, new_src);
            }
            return this;
        }))
        .pipe(gulp.dest(dist));
  });

gulp.task('dist',
  'Prepare all the distribution files (except the .zip).',
  ['libs', 'copy', 'copy-rename1', 'copy-rename2',
   'src-js-simple', 'src-js-full', 'html']);

gulp.task('zip',
  'Zip up the dist into icn3d-<version>.zip',
  ['dist'],
  function() {
    return gulp.src('./dist/**')
      .pipe(rename(function(path) {
        path.dirname = base_name + '/' + path.dirname;
      }))
      .pipe(zip(base_name + '.zip'))
      .pipe(gulp.dest('dist'));
  });


gulp.task('default',
  'The default task creates the distribution files and the .zip ' +
  'from scratch',
  ['zip']
);

var gh_pages_files = [
  'LICENSE',
  'README.md',
  'index.html',
  'icn3d.html',
  'full.html',
  '*.min.js',
  '*.css',
  'lib/**',
].map(function(f) { return 'dist/' + f; });

gulp.task('gh-pages',
  'Deploy project to GitHub pages',
  ['dist'],
  function () {
    return gulp.src(gh_pages_files, { base: 'dist' })
      .pipe(gh_pages({
        origin: "github",
        cacheDir: ".gh-pages",
      }))
  });

