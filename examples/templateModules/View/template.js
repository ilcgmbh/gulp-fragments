/**
 * Created by {{USER}} on {{DATE}}.
 */
var path = require("path");

function getManifest(taskPath) {
    var m;
    var p = path.normalize(taskPath);
    do {
        try{
            m = require(path.join(p, "manifest.json"));
        } catch(e) {
            if (p === process.cwd()) {
                p = null;
            }
            p = path.normalize(path.join(p, ".."));
            continue;
        }
        console.log("Found manifest at" + p);
        break;
    } while(p);

    return m;
}

module.exports = {
    name: "View",
    description: "Creates a SAPUI5 XML View and the according controller (ES6) for it.",
    include: [require("../Controller")],
    params:
        [
            { name: "namespace",
              description: "Namespace",
              default: function(taskPath) {
                            var m = getManifest(taskPath);
                            if (m && m["sap.app"] && m["sap.app"]["id"]) {
                                return m["sap.app"]["id"];
                            }
                        } },
        { name: "name", description: "Viewname"}
    ],

    files: __dirname
};