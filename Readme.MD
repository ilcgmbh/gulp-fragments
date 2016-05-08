gulp-scaffold
=============

Automatically creates scaffolding tasks for filesystem based templates. The templates support parameters for file contents
and file names and reusage of templates within templates. Nothing more. you basically setup the files you want to be copied
and describe your parameters. That's it. If you need fancier stuff like conditionals or more sophisticated user interaction 
take a look at `slush` or `yeoman`.

Templates are invoked directly using `gulp`. They can be invoked multiple times and with the dynamic filenames are great 
for creating project fragments during the whole development process.

# Installation

`npm install gulp-scaffold`

# Defining a template

A template consists of a file structure containing the files that are reproduced when using the template and a
template description

## The template description

The template description is a JavaScript called `template.js` file that exports metadata and the parameters supported by the template.

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

### Using parameters in file contents

To use a parameter in the file itself surround its name by double handlebars `{{paramname}}`

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
    
    createTemplateTasksForDirectory(gulp, `path/to/your/templates');
    
`createTemplateTasksForDirectory` will scan the whole directory given and create a task for every template it finds using
either the name of the template folder or the name given in the `template.js` file.


# Templates as node modules

For teams it is useful to share templates. You can define a node module for your template.

First add a `package.json` to your template directory that has at least the `main` value set.

    {
      "main": "template.js"
    }
    
Second add one specific line to your `template.js` file. 


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
    
    createTemplateTasksForDirectory(gulp, require("templateModuleName");


# Reusing templates in other templates
 
Imagine you have a template that defines an application and you application consists of views. So you define a template for
views as well, so everytime you create a new view you can use that template. Now you want your application template to create
 the first view so the user can get started right away. You can achieve this by including you view template into your application
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

# Validating parameters


# TODOS

* Define mapping of parameters when including
* Use gulp-conflict


# License

MIT. See LICENSE for further details.

