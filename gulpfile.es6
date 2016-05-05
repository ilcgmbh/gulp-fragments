/**
 * Created by stephan on 04.05.16.
 */

import gulp from "gulp";
import prompt from "gulp-prompt";
import replace from "gulp-replace";
import gutil from "gulp-util";

var controllerTemplate = `sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("{{namespace}}.controller.{{name}}", {

		onShowHello : function () {
			// read msg from i18n model
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var sRecipient = this.getView().getModel().getProperty("/recipient/name");
			var sMsg = oBundle.getText("helloMsg", [sRecipient]);

			// show message
			MessageToast.show(sMsg);
		}
	});

});`;

var viewTemplate = `<mvc:View
	controllerName="{{namespace}}.controller.{{name}}"
	xmlns="sap.m"
	xmlns:mvc="sap.ui.core.mvc">
</mvc:View>`;


function stringSrc(filename, string) {
    var src = require('stream').Readable({ objectMode: true })
    src._read = function () {
        this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
        this.push(null)
    };
    return src
}


var tempDescrForView = {
    params: [
        { name: "namespace", description: "Namespace", default: () => {
            var m;
            try {
                m = require("./manifest.json");
            } catch(e) {
                return
            }
            if (m && m["sap.app"] && m["sap.app"]["id"]) {
                return m["sap.app"]["id"];
            }
        } },
        { name: "name", description: "Viewname"}
    ],

    templates: [
        {
            name: "view",
            template: viewTemplate,
            path: "view",
            filename: "{{name}}.view.xml"
        },
        {
            name: "controller",
            template: controllerTemplate,
            path: "controller",
            filename: "{{name}}.controller.js"
        }
    ]
};

const handleBarsReg = /\{\{([^}]+)\}\}/g;
function makeTemplateTask(name, templateDescription) {
    gulp.task(name, () => {
        stringSrc("dummy", "").pipe(prompt.prompt(
                templateDescription.params.map(p => {
                    var d = p.default;
                    if (typeof d === "function") {
                        d = d();
                    }
                    return {
                        type: "input",
                        name: p.name,
                        message: p.description,
                        default: d,
                        validate: p.validate
                    }})
            , (res) => {
                templateDescription.templates.forEach(t => {
                    stringSrc(t.filename.replace(handleBarsReg, (m, name) => res[name]), t.template)
                        .pipe(replace(handleBarsReg, (m, name) => res[name]))
                        .pipe(gulp.dest([process.env.INIT_CWD, "test", t.path].join("/")))

                })
            }));
    });
}


gulp.task("Test", () => {
    console.log(process.env);
    console.log(process.cwd())
});

makeTemplateTask("View", tempDescrForView)