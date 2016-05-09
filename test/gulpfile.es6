/**
 * Created by Stephan on 07.05.2016.
 */

import {createTemplateTasksForDirectory} from '../src/scaffolder';
import gulp from 'gulp';
import path from "path";

console.log(__dirname);
createTemplateTasksForDirectory(gulp, path.join(__dirname, "templates"));
