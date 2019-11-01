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
gulp.task("copy-assets", () => gulp.src("./assets/**/*.*").pipe(gulp.dest("./dist/assets")));
gulp.task("copy-things", ["copy-html", "copy-css", "copy-assets"]);

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