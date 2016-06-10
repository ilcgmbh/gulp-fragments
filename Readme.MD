gulp-fragments
==============

Build project fragements (sets of artifacts) from filesystem based templates using a gulp task.  

The templates support parameters for file contents and file names and reusage of templates within templates. 
Nothing more. You basically setup the files you want to be copied and describe your parameters. That's it. If you need 
fancier stuff like conditionals or more sophisticated user interaction take a look at [slush](http://slushjs.github.io/) 
or [yeoman](http://yeoman.io/).

Templates are invoked directly using [gulp](http://gulpjs.com/) from local gulp files. They can be invoked multiple 
times and with the dynamic filenames are great for creating project fragments during the whole development process.

# Installation

`npm install -SD gulp-scaffold`

# Defining a template

A template consists of a file structure containing the files that are reproduced when using the template and a
template description.

## The template description

The template description is a JavaScript file called `template.js` that exports metadata and the parameters supported by the template.

**Example**

    module.exports = {
        name: "Application",
        description: "Creates a basic application.",
        params:
            [
                { name: "namespace", description: "Namespace"},
                { name: "applicationTitle", description: "Title"},
                { name: "applicationDescription", description: "Description"}
            ]
    };
   
This describes the template and defines three parameters that the user will have to porivde values for when using the 
template

## The file structure

In the subfolder `files` the template specifies the files that will be copied when using the template.

### Using parameters in filenames

When you want the file to be named using a parameter surround the parameter name with double underscores `__`.

    View__viewname__.js
    
This will generate a file ViewView1, when the user gives the value `View1` for the parameter `viewname`.

Parameters that are referenced in the filename but don't exist in the template will be ignored. 

### Using parameters in file contents

To use a parameter in the file itself surround its name by double curly braces `{{paramname}}`

    sap.ui.define([
        "sap/ui/core/UIComponent"
    ], (UIComponent) => {
    
        return UIComponent.extend("{{namespace}}.Component", {
            metadata: {
                manifest: "json"
            },
    
            init() {
                // call the init function of the parent, i.e. super call
                UIComponent.prototype.init.apply(this, arguments);                    
            }
        });
    });
 
Parameters that are referenced in the file but don't exist in the template will be ignored.

## The complete template

The complete template might look like this:
 
    Application
        |---> template.js
        |---> files
                |---> __viewname__.js
                |---> __controller__.js
                |---> package.json
                
                
## Definig your gulp task

    import gulp from 'gulp'
    import {createTemplateTasksForDirectory} from 'gulp-scaffold'
    
    createTemplateTasksForDirectory(gulp, 'path/to/your/templates');
    
`createTemplateTasksForDirectory` will scan the whole directory given and create a task for every template it finds using
either the name of the template folder or the name given in the `template.js` file.


# Templates as node modules

For teams it is useful to share templates. You can define a node module for your template.

First add a `package.json` to your template directory that has at least the `main` value set.

    {
      "main": "template.js"
    }
    
Second add one specific value `files` to your `template.js` file. 


    module.exports = {
        name: "Application",
        description: "Creates a basic application.",
        params:
            [
                { name: "namespace", description: "Namespace"},
                { name: "applicationTitle", description: "Title"},
                { name: "applicationDescription", description: "Description"}
            ]
        files: __dirname
    };

This tells gulp-scaffolder where to find the template files.

Now you can define your gulp task like so


    import gulp from 'gulp'
    import {createTemplateTasksForModule} from 'gulp-scaffold'
    
    createTaskForModule(gulp, require("templateModuleName");


# Reusing templates in other templates
 
Imagine you have a template that defines an application and your application consists of views. So you define a template for
views as well, so everytime you create a new view you can use that template. Now you want your application template to create
 the first view so the user can get started right away. You can achieve this by including your view template into your application
 template.
 
     module.exports = {
         name: "Application",
         description: "Creates a basic application.",
         includes: [require("viewTemplateModule")]
         params:
             [
                 { name: "namespace", description: "Namespace"},
                 { name: "applicationTitle", description: "Title"},
                 { name: "applicationDescription", description: "Description"}
             ]
         files: __dirname
     };
     
When scaffolding the system will merge all parameters and only asks the user once. This merge is done by parameter-name.

Includes can be nested, so in our example the view template itself could include another templates. Includes work with modules
and templates that reside in the same directory.

# Default values for parameters

You can define default values for your parameters.

__Static default values__
   
    { name: "applicationTitle", description: "Title"},
    
__Dynamic default values__

    { name: "applicationTitle", description: answers => answers.namespace + "App" },

For dynamic defaults you will be provided with all answers that are already given.

# Validating parameters

You can use all validation mechanisms that [inquirer](https://github.com/SBoudrias/Inquirer.js/) provides.

__If no validation is given a default validation will be used that will prevent empty values__

# Transforming answers

After all answers are given you can specify a function to transform these answers

    module.exports = {
    
        name: "Test3",
        description: "post transformation of parameters",
        params: [
            { name: "value", description: "A value"}
        ],
        transform: answers => answers.uppercase = ("" + answers.value).toUpperCase()        
    };

You can modify given answers or create new parameters with values.

# Creating a main directory

A template can define that it will create a main directory using the parameter `createDir` in the template definition.

`createDir` supports the same syntax that works for filenames. Using double underscores `__` allows you to create a 
directory based on a parameter value.  

    module.exports = {
    
        name: "Test3",
        description: "post transformation of parameters",
        createDir: "Directory__value__",
        params: [
            { name: "value", description: "A value"}
        ]        
    };


# License


> The MIT License (MIT)
>
> Copyright © 2016 ILC GmbH, support@ilc-solutions.de
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the “Software”), to deal in
> the Software without restriction, including without limitation the rights to
> use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
> the Software, and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
> FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
> COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
> IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


