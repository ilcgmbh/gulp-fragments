/**
 * Created by stephan.smola on 06.05.2016.
 */

module.exports = {
    name: "Application",
    description: "Creates a basic SAP UI5 Application.",
    include: ["AppManifest", require("../../templateModules/View")],
    createDir: "__namespace__",
    params:
        [
            { name: "namespace", description: "Namespace"},
            { name: "applicationTitle", description: "Title", default: "AppTitle"},
            { name: "applicationDescription", description: "Description", default: "AppDescription"}
        ]
};