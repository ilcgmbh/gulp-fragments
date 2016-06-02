/**
 * Created by stephan.smola on 06.05.2016.
 */

import fs from 'fs';
import path from 'path';

import print from 'gulp-print';
import rename from "gulp-rename";
import replace from "gulp-replace";
import gutil from "gulp-util";
import runSequence from "run-sequence";
import inquirer from "inquirer";
import osLocale from "os-locale";
import conflict from 'gulp-conflict';

const contentReg = /\{\{([^}]+)\}\}/g;
const fileNameReg = /\_\_([^_]+)\_\_/g;


/**
 * Resolves all (nested) includes of a given template.
 *
 * @param template
 * @param basepath
 * @returns {*}
 */
function expandIncludes(template, basepath) {
    if (!template) return [];
    var r = [template];

    if (template.include) {
        var includes = template.include.map(i => {
            if (typeof i === "string") {
                return getTemplateDescription(i, path.join(template.files, ".."));
            } else {
                return i;
            }
        });
        includes.map(i => expandIncludes(i, basepath)).forEach(a => r.push(...a));
    }

    return r;
}

/**
 * Merge parameters of multiple templates into one array of parameters. First occurrence of a parameter - identified
 * by name - wins.
 * @param templates
 * @returns {Array}
 */
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


function copyResponses(responses) {
    var r = {};
    for( var p in responses) {
        if (responses.hasOwnProperty(p)) {
            r[p] = responses[p];
        }
    }
    return r;
}

function transformResponses(template, responses) {
    if (typeof template.transform === "function") {
        console.log("transforming")
        var r = copyResponses(responses);
        template.transform(r);
        return r;
    }
    return responses;
}

/**
 * Applies a single template to a destination directory
 * @param gulp
 * @param responses
 * @param template
 * @param destination
 */
function applyTemplate(gulp, responses, template, destination) {
    var lResponses = transformResponses(template, responses);

    console.log("Creating files for template", template.name, "in", path.join(template.files, "files", "**", "*"));

    var dest = destination;

    gulp.src(path.join(template.files, "files", "**", "*"))
        .pipe(replace(contentReg, (m, name) => lResponses[name] || "{{" + name + "}}"))
        .pipe(rename(file => {
            file.basename = file.basename.replace(fileNameReg, (m, name) => lResponses[name] || "__" + name + "__");
            console.log("\t\t" + file.basename + file.extname + " -> " + dest);
        }))
        .pipe(conflict(dest, { defaultChoice : "n"}))
        .pipe(gulp.dest(dest));
}

/**
 * Converts a single template parameter in a gulp prompt parameter
 * @param p
 * @returns {{type: string, name: *, message: (string|string|string|string|string|string|*), default: (*|boolean|default), validate: *}}
 */
function convertParam(p) {

    return {
        type: "input",
        name: p.name,
        message: p.description,
        default: p.default,
        validate: p.validate || (v => v != "")
    }
}

/**
 * Converts an array of template parameters into gulp-prompt parameters
 * @param parameters
 * @returns {Array}
 */
function convertParameters(parameters) {
    return parameters.map(convertParam)
}


function getUserName() {
    //Win
    return process.env.USERNAME;
}

/**
 * Enrich anser object with defaults
 */

function mixinStandardParameters(responses) {
    var r = copyResponses(responses);
    
    if (!r.USERNAME) {
        r.USERNAME = getUserName();
    }

    var locale = osLocale.sync().replace("_", "-");
    if (!r.DATE) {
        r.DATE = new Date().toLocaleDateString(locale);
    }
    if (!r.TIME) {
        r.TIME = new Date().toLocaleTimeString(locale);
    }

    return r;
}

/**
 * Takes parameter values and applies them to a set of templates using these values
 * @param gulp
 * @param templates
 * @param responses
 * @param rootTemplate the template that initiated the creation
 */
function processTemplatesWithValues(gulp, templates, rootTemplate, responses) {
    var lResponses = transformResponses(rootTemplate, responses);

    var dest = process.env.INIT_CWD;
    if (rootTemplate.createDir) {
        console.log("Preparing target directory name");
        try {
            var dirName = rootTemplate.createDir.replace(fileNameReg, (m, name) => lResponses[name] || "__" + name + "__");
            console.log(dest);
            dest = path.join(dest, dirName);
            console.log(dest);
        } catch(e) {
            console.log(e.stack);
            return;
        }
    }

    var ans = mixinStandardParameters(responses);
    templates.forEach(atemplate => {
        applyTemplate(gulp, ans, atemplate, dest);
    });
}

/**
 * Creates a template task
 * @param gulp
 * @param prefix
 * @param template
 */
function makeTemplateTask(gulp, prefix, template) {
    gulp.task((prefix || "") + template.name, () => {
        var parameters = template.params;
        var includes = expandIncludes(template);

        console.log(`${template.name}\n================\n${template.description}\n\n${includes && "Includes templates " + includes.map(i => i.name).join(", ")}`);

        parameters = mergeParams(template, ...includes);

        inquirer.prompt(convertParameters(parameters))
            .then(processTemplatesWithValues.bind(null, gulp, includes, template));
    });
}

/**
 * Gets a files based template description
 * @param name
 * @param basepath
 * @returns {*}
 */
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

    description.files = path.join(basepath, name);
    return description;
}

/**
 * Takes a files based template and creates a task for it.
 * @param gulp
 * @param name
 * @param prefix
 * @param basepath
 */
function convertTemplateToTask(gulp, name, prefix, basepath) {
    var description = getTemplateDescription(name, basepath);
    if(description) {
        makeTemplateTask(gulp, prefix, description);
    }
}


/**
 * Creates a gulp tasks for each template found in the given directory
 * @param gulp      The gulp instance to use
 * @param path      Path to the directory to search for tasks
 * @param prefix    Prefix for the task names. Usefull in complex gulp files.
 */
export function createTemplateTasksForDirectory(gulp, path, prefix) {
    fs.readdirSync(path).map(file => {
        return [file, fs.lstatSync(path + "/" + file)]
    }).forEach(([name, stat]) => {
        if (stat.isDirectory()) {
            convertTemplateToTask(gulp, name, prefix, path);
        }
    });
}

/**
 * Creates a task for a module based template
 * @param gulp
 * @param module
 * @param prefix
 */
export function createTaskForModule(gulp, module, prefix) {
    makeTemplateTask(gulp, prefix, module, path.normalize(path.join(module.files, "..")));
}