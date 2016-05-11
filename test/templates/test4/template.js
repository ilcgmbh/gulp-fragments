/**
 * Created by stephan.smola on 09.05.2016.
 */

module.exports = {
    name: "Test4",
    description: "Validation",
    params: [
        { name: "five",
            description: "A five letter word",
            validate: function (v) {
                return v && v.length && v.length === 5;
            }
        }
    ]
};