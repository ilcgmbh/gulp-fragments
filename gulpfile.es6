/**
 * Created by stephan on 04.05.16.
 */
import fs from 'fs';
import path from 'path';

import gulp from "gulp";
import prompt from "gulp-prompt";
import print from 'gulp-print';
import rename from "gulp-rename";
import replace from "gulp-replace";
import gutil from "gulp-util";
import runSequence from "run-sequence";


const handleBarsReg = /\{\{([^}]+)\}\}/g;
const fileNameReg = /\_\_([^_]+)\_\_/g;

function stringSrc(filename, string) {
    var src = require('stream').Readable({ objectMode: true });
    src._read = function () {
        this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }));
        this.push(null)
    };
    return src
}




function expandIncludes(template, basepath) {
    if (!template) return [];
    var r = [template];

    if (template.include) {
        var includes = template.include.map(i => getTemplateDescription(i, basepath));
        includes.map(i => expandIncludes(i, basepath)).forEach(a => r.push(...a));
    }

    return r;
}

function mergeParams(...templates) {
    var params = {};
    var result = [];

    templates.forEach(template => {
        template.params && template.params.forEach(parameter => {
            if (!params[parameter.name]) {
                params[parameter.name] = true;
                parameter.description = (parameter.description || parameter.name) + " for " + template.name;
                result.push(parameter);
            }
        });
    });

    return result;
}

function applyTemplate(responses, basepath, template, destination) {
    gulp.src(path.join(basepath, template.name, "files", "**", "*"))
        .pipe(replace(handleBarsReg, (m, name) => responses[name] || "{{" + name + "}}"))
        .pipe(rename(file => {
            file.basename = file.basename.replace(fileNameReg, (m, name) => responses[name] || "__" + name + "__");
        }))
        .pipe(gulp.dest(destination));
}

function makeTemplateTask(template, basepath) {
    gulp.task(template.name, () => {
        var parameters = template.params;
        var includes = expandIncludes(template, basepath);
        parameters = mergeParams(template, ...includes);

        stringSrc("dummy", "")
            .pipe(prompt.prompt(
                parameters.map(p => {
                    var d = p.default;
                    if (typeof d === "function") {
                        d = d(process.env.INIT_CWD);
                    }
                    return {
                        type: "input",
                        name: p.name,
                        message: p.description,
                        default: d,
                        validate: p.validate
                    }})
            , (res) => {
                    includes.forEach(atemplate => {
                        applyTemplate(res, basepath, atemplate, process.env.INIT_CWD);
                    })
            }));
    });
}


function getTemplateDescription(name, basepath) {
    var description;
    try {
        description = require(`${basepath}/${name}/template.js`)
    } catch (e) {
        console.log(`Error: Cannot read template definition for ${basepath}/${name}/template.js`);
        return;
    }

    if(!description.name) {
        description.name = name;
    }

    description.basepath = basepath;
    return description;
}

function processTemplate(name, basepath) {
    var description = getTemplateDescription(name, basepath);
    if(description) {
        makeTemplateTask(description, basepath);
    }

}

function scanTemplatesFolder(path) {
    fs.readdirSync(path).map(file => {
       return [file, fs.lstatSync(path + "/" + file)]
    }).forEach(([name, stat]) => {
        if (stat.isDirectory()) {
            processTemplate(name, path);
        }
    });
}

scanTemplatesFolder("./templates");