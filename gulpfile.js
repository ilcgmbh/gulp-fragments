'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _gulpPrompt = require('gulp-prompt');

var _gulpPrompt2 = _interopRequireDefault(_gulpPrompt);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
                                                                                                                                                                                                     * Created by stephan on 04.05.16.
                                                                                                                                                                                                     */

var handleBarsReg = /\{\{([^}]+)\}\}/g;
var fileNameReg = /\_\_([^_]+)\_\_/g;

function stringSrc(filename, string) {
    var src = require('stream').Readable({ objectMode: true });
    src._read = function () {
        this.push(new _gulpUtil2.default.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }));
        this.push(null);
    };
    return src;
}

function expandIncludes(template, basepath) {
    if (!template) return [];
    var r = [template];

    if (template.include) {
        var includes = template.include.map(function (i) {
            return getTemplateDescription(i, basepath);
        });
        includes.map(function (i) {
            return expandIncludes(i, basepath);
        }).forEach(function (a) {
            return r.push.apply(r, _toConsumableArray(a));
        });
    }

    return r;
}

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

function applyTemplate(responses, basepath, template, destination) {
    _gulp2.default.src(_path2.default.join(basepath, template.name, "files", "**", "*")).pipe((0, _gulpReplace2.default)(handleBarsReg, function (m, name) {
        return responses[name] || "{{" + name + "}}";
    })).pipe((0, _gulpRename2.default)(function (file) {
        file.basename = file.basename.replace(fileNameReg, function (m, name) {
            return responses[name] || "__" + name + "__";
        });
    })).pipe(_gulp2.default.dest(destination));
}

function makeTemplateTask(template, basepath) {
    _gulp2.default.task(template.name, function () {
        var parameters = template.params;
        var includes = expandIncludes(template, basepath);
        parameters = mergeParams.apply(undefined, [template].concat(_toConsumableArray(includes)));

        stringSrc("dummy", "").pipe(_gulpPrompt2.default.prompt(parameters.map(function (p) {
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
            };
        }), function (res) {
            includes.forEach(function (atemplate) {
                applyTemplate(res, basepath, atemplate, process.env.INIT_CWD);
            });
        }));
    });
}

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

    description.basepath = basepath;
    return description;
}

function processTemplate(name, basepath) {
    var description = getTemplateDescription(name, basepath);
    if (description) {
        makeTemplateTask(description, basepath);
    }
}

function scanTemplatesFolder(path) {
    _fs2.default.readdirSync(path).map(function (file) {
        return [file, _fs2.default.lstatSync(path + "/" + file)];
    }).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var name = _ref2[0];
        var stat = _ref2[1];

        if (stat.isDirectory()) {
            processTemplate(name, path);
        }
    });
}

scanTemplatesFolder("./templates");

//# sourceMappingURL=gulpfile.js.map