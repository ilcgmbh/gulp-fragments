"use strict";

var _gulp = require("gulp");

var _gulp2 = _interopRequireDefault(_gulp);

var _gulpPrompt = require("gulp-prompt");

var _gulpPrompt2 = _interopRequireDefault(_gulpPrompt);

var _gulpReplace = require("gulp-replace");

var _gulpReplace2 = _interopRequireDefault(_gulpReplace);

var _gulpUtil = require("gulp-util");

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by stephan on 04.05.16.
 */

var controllerTemplate = "sap.ui.define([\n\t\"sap/ui/core/mvc/Controller\",\n\t\"sap/m/MessageToast\"\n], function (Controller, MessageToast) {\n\t\"use strict\";\n\n\treturn Controller.extend(\"{{namespace}}.controller.{{name}}\", {\n\n\t\tonShowHello : function () {\n\t\t\t// read msg from i18n model\n\t\t\tvar oBundle = this.getView().getModel(\"i18n\").getResourceBundle();\n\t\t\tvar sRecipient = this.getView().getModel().getProperty(\"/recipient/name\");\n\t\t\tvar sMsg = oBundle.getText(\"helloMsg\", [sRecipient]);\n\n\t\t\t// show message\n\t\t\tMessageToast.show(sMsg);\n\t\t}\n\t});\n\n});";

var viewTemplate = "<mvc:View\n\tcontrollerName=\"{{namespace}}.controller.{{name}}\"\n\txmlns=\"sap.m\"\n\txmlns:mvc=\"sap.ui.core.mvc\">\n</mvc:View>";

function stringSrc(filename, string) {
    var src = require('stream').Readable({ objectMode: true });
    src._read = function () {
        this.push(new _gulpUtil2.default.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }));
        this.push(null);
    };
    return src;
}

var tempDescrForView = {
    params: [{ name: "namespace", description: "Namespace", default: function _default() {
            var m;
            try {
                m = require("./manifest.json");
            } catch (e) {
                return;
            }
            if (m && m["sap.app"] && m["sap.app"]["id"]) {
                return m["sap.app"]["id"];
            }
        } }, { name: "name", description: "Viewname" }],

    templates: [{
        name: "view",
        template: viewTemplate,
        path: "view",
        filename: "{{name}}.view.xml"
    }, {
        name: "controller",
        template: controllerTemplate,
        path: "controller",
        filename: "{{name}}.controller.js"
    }]
};

var handleBarsReg = /\{\{([^}]+)\}\}/g;
function makeTemplateTask(name, templateDescription) {
    _gulp2.default.task(name, function () {
        stringSrc("dummy", "").pipe(_gulpPrompt2.default.prompt(templateDescription.params.map(function (p) {
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
            };
        }), function (res) {
            templateDescription.templates.forEach(function (t) {
                stringSrc(t.filename.replace(handleBarsReg, function (m, name) {
                    return res[name];
                }), t.template).pipe((0, _gulpReplace2.default)(handleBarsReg, function (m, name) {
                    return res[name];
                })).pipe(_gulp2.default.dest([process.env.INIT_CWD, "test", t.path].join("/")));
            });
        }));
    });
}

_gulp2.default.task("Test", function () {
    console.log(process.env);
    console.log(process.cwd());
});

makeTemplateTask("View", tempDescrForView);

//# sourceMappingURL=gulpfile.js.map