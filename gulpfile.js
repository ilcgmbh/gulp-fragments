'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _scaffolder = require('./src/scaffolder');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _scaffolder.createTemplateTasksForDirectory)(_gulp2.default, _path2.default.join(__dirname, "templates"));
//createTaskForModule(gulp, require("./templateModules/View"));
/**
 * Created by stephan on 04.05.16.
 */

//# sourceMappingURL=gulpfile.js.map