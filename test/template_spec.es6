/**
 * Created by Stephan on 06.05.2016.
 */

import fs from 'fs';
import {expect} from 'chai';
import runSequence from 'run-sequence';
import del from 'del';
import path from 'path';
import gulp from "gulp";
const exec = require('child_process').exec;

import {createTemplateTasksForDirectory} from '../src/scaffolder'

const tempPath = path.join(__dirname, "tmp");

function checkTempFile(name, contents = null) {
    var f;
    try {
        f = fs.readFileSync(path.join(tempPath,name), { encoding: "utf8"});
    } catch(e) {
        console.log("Cannot read", path.join(tempPath,name), e.message)
        f = null;
    }
    expect(f).to.not.equal(null);
    if (typeof contents === "string") {
        expect(f).to.equal(contents);
    }
}



function runTask(task, done) {
    return exec(`gulp ${task}`, {
        cwd: tempPath
    }, (stdout, stderr) => {
        console.log(stdout)
        console.log(stderr)
        done();
    });
}

describe("Scaffolder", () => {
    it("creates a task for a template directory", () => {
        createTemplateTasksForDirectory(gulp, path.join(__dirname, "templates"));
        expect(gulp.tasks.Test1).to.be.ok;
        gulp.reset();
    });

    describe("creates a task that", () => {
        before(() => {
            if (!fs.existsSync(tempPath)){
                fs.mkdirSync(tempPath);
            }
        });

        afterEach((done) => {
            done();
            return;
            del(path.join(__dirname, "tmp", "**", "*")).then(() => done())
        });

        it("creates files based on templates", (done) => {
            var cp = runTask("Test1", () => {
                checkTempFile("file1.txt", "Static text with Value1 contents.");
                checkTempFile("Value1file2.txt");
                done();
            });
            cp.stdin.write("Value1\n");
        });



        it("is provided the current username, time and date to use in a template", done => {
            var cp = runTask("Test2", () => {
                checkTempFile("test.txt");
                done()
            });
        });


        it("applies transforms to responses defined by a template", done => {
            var cp = runTask("Test3", () => {
                checkTempFile("test.txt", "abcde\r\nABCDE");
                done();
            });
            cp.stdin.write("abcde\n");
        });


        it("can validate parameter values", () => {
            var cp = runTask("Test4", () => {
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

        it("can have default values", () => {
            var cp = runTask("Test5", () => {
                checkTempFile("test5.txt", "DefaultValue\r\nHELPER");
                done();
            });
            cp.stdin.write("\nhelper\n\n");
        });
    });
});
