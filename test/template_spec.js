'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                   * Created by Stephan on 06.05.2016.
                                                                                                                                                                                                                                                   */

var _chai = require('chai');

var _runSequence = require('run-sequence');

var _runSequence2 = _interopRequireDefault(_runSequence);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _scaffolder = require('../src/scaffolder');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var exec = require('child_process').exec;

/**
 * Goes through the given directory to return all files and folders recursively
 * @author Ash Blue ash@blueashes.com
 * @example getFilesRecursive('./folder/sub-folder');
 * @requires Must include the file system module native to NodeJS, ex. var fs = require('fs');
 * @param {string} folder Folder location to search through
 * @returns {object} Nested tree of the found files
 * https://gist.github.com/ashblue/3916348
 */
// var fs = require('fs');
function getFilesRecursive(folder) {
    var fileContents = _fs2.default.readdirSync(folder),
        fileTree = [],
        stats;

    fileContents.forEach(function (fileName) {
        stats = _fs2.default.lstatSync(folder + '/' + fileName);

        if (stats.isDirectory()) {
            fileTree.push({
                name: fileName,
                children: getFilesRecursive(folder + '/' + fileName)
            });
        } else {
            fileTree.push({
                name: fileName
            });
        }
    });

    return fileTree;
}

function checkDiretoryStructure(path, structure) {

    var s = getFilesRecursive(path);
    function check(files, str) {
        for (var i = 0; i < files.length; i++) {
            var e = files[i];
            if (!e.children) {
                //console.log(e.name);
                if (!str[e.name]) return false;
                if (_typeof(str[e.name]) === "object") return false;
                //console.log("...yes");
            } else {
                    //console.log(`[${e.name}]`)
                    if (!str[e.name]) {
                        return false;
                    }
                    if (_typeof(str[e.name]) !== "object") return false;
                    if (!check(e.children, str[e.name])) {
                        return false;
                    }
                    //console.log("...yes");
                }
        }
        return true;
    }

    return check(s, structure);
}

describe("Checking a directory structure", function () {
    it("works", function () {
        (0, _chai.expect)(checkDiretoryStructure(_path2.default.join(__dirname, "templates", "test1"), { "template.js": 1, files: {
                "__parameter1__file2.txt": 1,
                "file1.txt": 1
            } })).to.equal(true);
        (0, _chai.expect)(checkDiretoryStructure(_path2.default.join(__dirname, "templates", "test1"), { "template.js": 1, files: {
                "_parameter1__file2.txt": 1,
                "file1.txt": 1
            } })).to.equal(false);
        (0, _chai.expect)(checkDiretoryStructure(_path2.default.join(__dirname, "templates", "test1"), { "template.js": 1, files: 1 })).to.equal(false);
        (0, _chai.expect)(checkDiretoryStructure(_path2.default.join(__dirname, "templates", "test1"), { "1template.js": 1, files: {
                "__parameter1__file2.txt": 1,
                "file.txt": 1
            } })).to.equal(false);
    });
});

describe("Scaffolder", function () {
    it("creates a task for a template directory", function () {
        (0, _scaffolder.createTemplateTasksForDirectory)(_gulp2.default, _path2.default.join(__dirname, "templates"));
        (0, _chai.expect)(_gulp2.default.tasks.Test1).to.be.ok;
        _gulp2.default.reset();
    });

    describe("creates a task that", function () {
        before(function () {
            var dir = _path2.default.join(__dirname, "tmp");

            if (!_fs2.default.existsSync(dir)) {
                _fs2.default.mkdirSync(dir);
            }
        });

        afterEach(function (done) {
            (0, _del2.default)(_path2.default.join(__dirname, "tmp", "**", "*")).then(function () {
                done();
            });
        });

        it("works", function (done) {
            var cp = exec("gulp Test1", {
                cwd: _path2.default.join(__dirname, "tmp")
            }, function () {
                console.log("Done");
                done();
            });
            cp.stdin.write("Value1\n");
        });
    });
});