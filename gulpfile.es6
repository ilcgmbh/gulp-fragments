/**
 * Created by stephan on 04.05.16.
 */

import babel from 'gulp-babel';
import rename from 'gulp-rename';
import watch from 'gulp-watch';
import print from 'gulp-print';
import lazypipe from 'lazypipe';
import del from 'del';

import path from 'path';
import gulp from "gulp";
/*
import {createTemplateTasksForDirectory, createTaskForModule} from './src/scaffolder';

createTemplateTasksForDirectory(gulp, path.join(__dirname, "templates"));
createTaskForModule(gulp, require(path.join(__dirname, "templateModules", "gulp-scaffolder-module-template")));
*/

// Load package json data to reuse the babel settings from there
var packageJson = require("./package.json");

// Define sources to compile
var sourceDirectories = ["./src", "./test"];
var allES6Sources = ["./gulpfile.es6", ...sourceDirectories.map(d => d + "/**/*.es6")];


/**
 * Compile an ES6 files into a compiled ES5 files.
 */
const compileES6File = lazypipe()
    .pipe(babel, packageJson.babel);

/**
 *  Delete all files compiled from *.es6
 */
gulp.task("clean-compiled-inplace", () => {
    return del(
        sourceDirectories.map(d => d + "/**/*.js")
    );
});


/**
 *  Compile all *.es6 files into JavaScript using babel into the same directory
 */
gulp.task("compile-inplace", () => {
    return gulp.src(allES6Sources)
        .pipe(compileES6File())
        .pipe(gulp.dest(file => {
            return file.base;
        }))
});


/**
 * Watcher task. Watches al *.es6-files in source directories and recompiles
 * them inplace.
 */
gulp.task("watch-compile-inplace", () => {

    watch(allES6Sources, (vinyl) => {
        gulp.src(vinyl.path)
            .pipe(print(path => "Building " + path + "..."))
            .pipe(compileES6File())
            .on("error", (e) => {
                // Babel detected a syntax error
                // The code extract that shows where babel detects a syntax error is part of the stack info.
                // We try to extract it from the stack with the split. It's hacky.
                console.log("Error building " + vinyl.path, "\n", e.message, e.stack.split("at Parser")[0])
            })
            .pipe(gulp.dest(file => file.base))
            .pipe(print(path => "... done " + path))
    });
});