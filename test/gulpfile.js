/**
 * Created by stephan.smola on 09.05.2016.
 */

var scaffolder = require("../src/scaffolder");
var gulp = require("gulp");
var path = require("path");

scaffolder.createTemplateTasksForDirectory(gulp, path.join(__dirname, "templates"));
