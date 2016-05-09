/**
 * Created by stephan.smola on 09.05.2016.
 */

module.exports = {

    name: "Test3",
    description: "post transformation of parameters",
    params: [
        { name: "value", description: "A value"}
    ],
    transform: function(answers) {
        answers.uppercase = ("" + answers.value).toUpperCase();
    }
};
