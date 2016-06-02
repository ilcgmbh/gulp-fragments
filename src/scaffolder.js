'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.createTemplateTasksForDirectory = createTemplateTasksForDirectory;
exports.createTaskForModule = createTaskForModule;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulpPrint = require('gulp-print');

var _gulpPrint2 = _interopRequireDefault(_gulpPrint);

var _gulpRename = require('gulp-rename');

var _gulpRename2 = _interopRequireDefault(_gulpRename);

var _gulpReplace = require('gulp-replace');

var _gulpReplace2 = _interopRequireDefault(_gulpReplace);

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _runSequence = require('run-sequence');

var _runSequence2 = _interopRequireDefault(_runSequence);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _osLocale = require('os-locale');

var _osLocale2 = _interopRequireDefault(_osLocale);

var _gulpConflict = require('gulp-conflict');

var _gulpConflict2 = _interopRequireDefault(_gulpConflict);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Created by stephan.smola on 06.05.2016.
                                                                                                                                                                                                     */

var contentReg = /\{\{([^}]+)\}\}/g;
var fileNameReg = /\_\_([^_]+)\_\_/g;

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
        var includes = template.include.map(function (i) {
            if (typeof i === "string") {
                return getTemplateDescription(i, _path2.default.join(template.files, ".."));
            } else {
                return i;
            }
        });
        includes.map(function (i) {
            return expandIncludes(i, basepath);
        }).forEach(function (a) {
            return r.push.apply(r, _toConsumableArray(a));
        });
    }

    return r;
}

/**
 * Merge parameters of multiple templates into one array of parameters. First occurrence of a parameter - identified
 * by name - wins.
 * @param templates
 * @returns {Array}
 */
function mergeParams() {
    var params = {};
    var result = [];

    for (var _len = arguments.length, templates = Array(_len), _key = 0; _key < _len; _key++) {
        templates[_key] = arguments[_key];
    }

    templates.forEach(function (template) {
        template.params && template.params.forEach(function (parameter) {
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
    for (var p in responses) {
        if (responses.hasOwnProperty(p)) {
            r[p] = responses[p];
        }
    }
    return r;
}

function transformResponses(template, responses) {
    if (typeof template.transform === "function") {
        console.log("transforming");
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

    console.log("Creating files for template", template.name, "in", _path2.default.join(template.files, "files", "**", "*"));

    var dest = destination;

    gulp.src(_path2.default.join(template.files, "files", "**", "*")).pipe((0, _gulpReplace2.default)(contentReg, function (m, name) {
        return lResponses[name] || "{{" + name + "}}";
    })).pipe((0, _gulpRename2.default)(function (file) {
        file.basename = file.basename.replace(fileNameReg, function (m, name) {
            return lResponses[name] || "__" + name + "__";
        });
        console.log("\t\t" + file.basename + file.extname + " -> " + dest);
    })).pipe((0, _gulpConflict2.default)(dest, { defaultChoice: "n" })).pipe(gulp.dest(dest));
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
        validate: p.validate || function (v) {
            return v != "";
        }
    };
}

/**
 * Converts an array of template parameters into gulp-prompt parameters
 * @param parameters
 * @returns {Array}
 */
function convertParameters(parameters) {
    return parameters.map(convertParam);
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

    var locale = _osLocale2.default.sync().replace("_", "-");
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
            var dirName = rootTemplate.createDir.replace(fileNameReg, function (m, name) {
                return lResponses[name] || "__" + name + "__";
            });
            console.log(dest);
            dest = _path2.default.join(dest, dirName);
            console.log(dest);
        } catch (e) {
            console.log(e.stack);
            return;
        }
    }

    var ans = mixinStandardParameters(responses);
    templates.forEach(function (atemplate) {
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
    gulp.task((prefix || "") + template.name, function () {
        var parameters = template.params;
        var includes = expandIncludes(template);

        console.log(template.name + '\n================\n' + template.description + '\n\n' + (includes && "Includes templates " + includes.map(function (i) {
            return i.name;
        }).join(", ")));

        parameters = mergeParams.apply(undefined, [template].concat(_toConsumableArray(includes)));

        _inquirer2.default.prompt(convertParameters(parameters)).then(processTemplatesWithValues.bind(null, gulp, includes, template));
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
        description = require(basepath + '/' + name + '/template.js');
    } catch (e) {
        console.log('Error: Cannot read template definition for ' + basepath + '/' + name + '/template.js');
        return;
    }

    if (!description.name) {
        description.name = name;
    }

    description.files = _path2.default.join(basepath, name);
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
    if (description) {
        makeTemplateTask(gulp, prefix, description);
    }
}

/**
 * Creates a gulp tasks for each template found in the given directory
 * @param gulp      The gulp instance to use
 * @param path      Path to the directory to search for tasks
 * @param prefix    Prefix for the task names. Usefull in complex gulp files.
 */
function createTemplateTasksForDirectory(gulp, path, prefix) {
    _fs2.default.readdirSync(path).map(function (file) {
        return [file, _fs2.default.lstatSync(path + "/" + file)];
    }).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var name = _ref2[0];
        var stat = _ref2[1];

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
function createTaskForModule(gulp, module, prefix) {
    makeTemplateTask(gulp, prefix, module, _path2.default.normalize(_path2.default.join(module.files, "..")));
}