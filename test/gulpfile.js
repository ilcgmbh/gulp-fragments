'use strict';

var _scaffolder = require('../src/scaffolder');

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(__dirname); /**
                         * Created by Stephan on 07.05.2016.
                         */

(0, _scaffolder.createTemplateTasksForDirectory)(_gulp2.default, _path2.default.join(__dirname, "templates"));