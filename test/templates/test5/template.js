/**
 * Created by stephan.smola on 09.05.2016.
 */

module.exports = {
    name: "Test5",
    description: "Default values",
    params: [
        { name: "fixed", description: "Fixed default value", default: "DefaultValue" },
        { name: "helper", description: "Helper value"},
        { name: "dynamic", description: "Dynamic default values", default: function(answers) {
            return answers.helper.toUpperCase();
        }}
    ]
};