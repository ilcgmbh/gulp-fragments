'use strict';

var _gulpBabel = require('gulp-babel');

var _gulpBabel2 = _interopRequireDefault(_gulpBabel);

var _gulpRename = require('gulp-rename');

var _gulpRename2 = _interopRequireDefault(_gulpRename);

var _gulpWatch = require('gulp-watch');

var _gulpWatch2 = _interopRequireDefault(_gulpWatch);

var _gulpPrint = require('gulp-print');

var _gulpPrint2 = _interopRequireDefault(_gulpPrint);

var _lazypipe = require('lazypipe');

var _lazypipe2 = _interopRequireDefault(_lazypipe);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _scaffolder = require('./src/scaffolder');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Created by stephan on 04.05.16.
                                                                                                                                                                                                     */

(0, _scaffolder.createTemplateTasksForDirectory)(_gulp2.default, _path2.default.join(__dirname, "templates"));
(0, _scaffolder.createTaskForModule)(_gulp2.default, require(_path2.default.join(__dirname, "templateModules", "gulp-scaffolder-module-template")));

// Load package json data to reuse the babel settings from there
var packageJson = require("./package.json");

// Define sources to compile
var sourceDirectories = ["./src", "./test"];
var allES6Sources = ["./gulpfile.es6"].concat(_toConsumableArray(sourceDirectories.map(function (d) {
    return d + "/**/*.es6";
})));

/**
 * Compile an ES6 files into a compiled ES5 files.
 */
var compileES6File = (0, _lazypipe2.default)().pipe(_gulpBabel2.default, packageJson.babel);

/**
 *  Delete all files compiled from *.es6
 */
_gulp2.default.task("clean-compiled-inplace", function () {
    return (0, _del2.default)(sourceDirectories.map(function (d) {
        return d + "/**/*.js";
    }));
});

/**
 *  Compile all *.es6 files into JavaScript using babel into the same directory
 */
_gulp2.default.task("compile-inplace", function () {
    return _gulp2.default.src(allES6Sources).pipe(compileES6File()).pipe(_gulp2.default.dest(function (file) {
        return file.base;
    }));
});

/**
 * Watcher task. Watches al *.es6-files in source directories and recompiles
 * them inplace.
 */
_gulp2.default.task("watch-compile-inplace", function () {

    (0, _gulpWatch2.default)(allES6Sources, function (vinyl) {
        _gulp2.default.src(vinyl.path).pipe((0, _gulpPrint2.default)(function (path) {
            return "Building " + path + "...";
        })).pipe(compileES6File()).on("error", function (e) {
            // Babel detected a syntax error
            // The code extract that shows where babel detects a syntax error is part of the stack info.
            // We try to extract it from the stack with the split. It's hacky.
            console.log("Error building " + vinyl.path, "\n", e.message, e.stack.split("at Parser")[0]);
        }).pipe(_gulp2.default.dest(function (file) {
            return file.base;
        })).pipe((0, _gulpPrint2.default)(function (path) {
            return "... done " + path;
        }));
    });
});