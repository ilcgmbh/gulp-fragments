/**
 * Created by stephan.smola on 06.05.2016.
 */

module.exports = {
    name: "Application",
    description: "Creates a basic SAP UI5 Application.",
    include: ["AppManifest", "View"],
    params:
        [
            { name: "namespace", description: "Namespace"},
            { name: "applicationTitle", description: "Title"},
            { name: "applicationDescription", description: "Description"}
        ]
};