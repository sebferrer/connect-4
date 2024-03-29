/* Dependencies */
var gulp = require("gulp"),
	runSequence = require("run-sequence"),
	del = require("del"),
	browserify = require("browserify"),
	source = require("vinyl-source-stream"),
	tsify = require("tsify");

/* Clean */
gulp.task("clean", () => del(["./dist"]));

/* Copy tasks */
gulp.task("copy-html", () => gulp.src("src/*.html").pipe(gulp.dest("dist")));
gulp.task("copy-css", () => gulp.src("./css/**/*.css").pipe(gulp.dest("./dist/css")));
gulp.task("copy-tmp-img", () => gulp.src("./tmp/img/**/*.*").pipe(gulp.dest("./dist/assets/img")));
gulp.task("copy-assets", () => gulp.src("./assets/**/**/*.*").pipe(gulp.dest("./dist/assets")));
gulp.task("copy-tmp-json", () => gulp.src("./tmp/json/*.*").pipe(gulp.dest("./dist")));
gulp.task("copy-json", () => gulp.src("./json/*.json.js").pipe(gulp.dest("./dist")));
gulp.task("copy-things", ["copy-html", "copy-css", "copy-tmp-img", "copy-assets", "copy-tmp-json", "copy-json"]);

/* TS */
gulp.task("ts", function () {
	return browserify({
		basedir: ".",
		debug: true,
		entries: ["src/main.ts"],
		cache: {},
		packageCache: {}
	})
		.plugin(tsify)
		.bundle()
		.pipe(source("bundle.js"))
		.pipe(gulp.dest("dist"));
});

/* Default */
gulp.task("default", function () {
	return runSequence(
		"clean",
		"copy-things",
		"ts"
	);
});