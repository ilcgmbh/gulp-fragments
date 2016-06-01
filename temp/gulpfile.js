/**
 * Created by stephan.smola on 01.06.2016.
 */

var gulp = require("gulp");
var scaffold = require("../src/scaffolder");
var path = require("path");

scaffold.createTemplateTasksForDirectory(gulp, path.join(__dirname, "..", "examples", "templates"));

