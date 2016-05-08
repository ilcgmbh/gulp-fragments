/**
 * Created by Stephan on 06.05.2016.
 */

import {expect} from 'chai';
import runSequence from 'run-sequence';
import del from 'del';
import path from 'path';
import fs from 'fs';
import gulp from "gulp";
const exec = require('child_process').exec;


import {createTemplateTasksForDirectory} from '../src/scaffolder'


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
function getFilesRecursive (folder) {
    var fileContents = fs.readdirSync(folder),
        fileTree = [],
        stats;

    fileContents.forEach(function (fileName) {
        stats = fs.lstatSync(folder + '/' + fileName);

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
            let e = files[i];
            if (!e.children) {
                //console.log(e.name);
                if (!str[e.name]) return false;
                if (typeof str[e.name] === "object") return false;
                //console.log("...yes");

            } else {
                //console.log(`[${e.name}]`)
                if (!str[e.name]) {
                    return false;
                }
                if (typeof str[e.name] !== "object") return false;
                if (!check(e.children, str[e.name])) {
                    return false
                }
                //console.log("...yes");

            }
        }
        return true;
    }


    return check(s, structure);
}


describe("Checking a directory structure", () => {
    it("works", () => {
        expect(checkDiretoryStructure(path.join(__dirname, "templates", "test1"),
            {"template.js": 1, files: {
                "__parameter1__file2.txt": 1,
                "file1.txt": 1
            }}
        )).to.equal(true);
        expect(checkDiretoryStructure(path.join(__dirname, "templates", "test1"),
            {"template.js": 1, files: {
                "_parameter1__file2.txt": 1,
                "file1.txt": 1
            }}
        )).to.equal(false);
        expect(checkDiretoryStructure(path.join(__dirname, "templates", "test1"),
            {"template.js": 1, files: 1}
        )).to.equal(false);
        expect(checkDiretoryStructure(path.join(__dirname, "templates", "test1"),
            {"1template.js": 1, files: {
                "__parameter1__file2.txt": 1,
                "file.txt": 1
            }}
        )).to.equal(false);
    });
});

describe("Scaffolder", () => {
    it("creates a task for a template directory", () => {
        createTemplateTasksForDirectory(gulp, path.join(__dirname, "templates"));
        expect(gulp.tasks.Test1).to.be.ok;
        gulp.reset();
    });

    describe("creates a task that", () => {
        before(() => {
            var dir = path.join(__dirname, "tmp");

            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
        });

        afterEach((done) => {
            del(path.join(__dirname, "tmp", "**", "*")).then(() => {done()})
        });

        it("works", (done) => {
            var cp = exec("gulp Test1", {
                cwd: path.join(__dirname, "tmp")
            }, () => {
                console.log("Done");
                done();
            });
            cp.stdin.write("Value1\n");
        })
    })
});