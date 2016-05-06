/**
 * Created by stephan on 04.05.16.
 */

import path from 'path';
import gulp from "gulp";
import {createTemplateTasksForDirectory, createTaskForModule} from './src/scaffolder';

createTemplateTasksForDirectory(gulp, path.join(__dirname, "templates"));
//createTaskForModule(gulp, require("./templateModules/View"));