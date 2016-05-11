'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _chai = require('chai');

var _runSequence = require('run-sequence');

var _runSequence2 = _interopRequireDefault(_runSequence);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _scaffolder = require('../src/scaffolder');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by Stephan on 06.05.2016.
 */

var exec = require('child_process').exec;

var tempPath = _path2.default.join(__dirname, "tmp");

function checkTempFile(name) {
    var contents = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    var f;
    try {
        f = _fs2.default.readFileSync(_path2.default.join(tempPath, name), { encoding: "utf8" });
    } catch (e) {
        console.log("Cannot read", _path2.default.join(tempPath, name), e.message);
        f = null;
    }
    (0, _chai.expect)(f).to.not.equal(null);
    if (typeof contents === "string") {
        (0, _chai.expect)(f).to.equal(contents);
    }
}

function runTask(task, done) {
    return exec('gulp ' + task, {
        cwd: tempPath
    }, function (stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        done();
    });
}

describe("Scaffolder", function () {
    it("creates a task for a template directory", function () {
        (0, _scaffolder.createTemplateTasksForDirectory)(_gulp2.default, _path2.default.join(__dirname, "templates"));
        (0, _chai.expect)(_gulp2.default.tasks.Test1).to.be.ok;
        _gulp2.default.reset();
    });

    describe("creates a task that", function () {
        before(function () {
            if (!_fs2.default.existsSync(tempPath)) {
                _fs2.default.mkdirSync(tempPath);
            }
        });

        afterEach(function (done) {
            done();
            return;
            (0, _del2.default)(_path2.default.join(__dirname, "tmp", "**", "*")).then(function () {
                return done();
            });
        });

        it("creates files based on templates", function (done) {
            var cp = runTask("Test1", function () {
                checkTempFile("file1.txt", "Static text with Value1 contents.");
                checkTempFile("Value1file2.txt");
                done();
            });
            cp.stdin.write("Value1\n");
        });

        it("is provided the current username, time and date to use in a template", function (done) {
            var cp = runTask("Test2", function () {
                checkTempFile("test.txt");
                done();
            });
        });

        it("applies transforms to responses defined by a template", function (done) {
            var cp = runTask("Test3", function () {
                checkTempFile("test.txt", "abcde\r\nABCDE");
                done();
            });
            cp.stdin.write("abcde\n");
        });

        it("can validate parameter values", function () {
            var cp = runTask("Test4", function () {
                checkTempFile("test4.txt", "seven");
                done();
            });
            cp.stdin.write("five\n");
            cp.stdin.write("five\n");
            cp.stdin.write("five\n");
            cp.stdin.write("five\n");
            cp.stdin.write("five\n");
            cp.stdin.write("five\n");
            cp.stdin.write("five\n");
            cp.stdin.write("seven\n");
        });

        it("can have default values", function () {
            var cp = runTask("Test5", function () {
                checkTempFile("test5.txt", "DefaultValue\r\nHELPER");
                done();
            });
            cp.stdin.write("\nhelper\n\n");
        });
    });
});