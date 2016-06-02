/**
 * Created by {{USER}} on {{DATE}}.
 */

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

            /* You could set a model here
            var oData = {
                recipient : {
                    name : "Component Dude"
                }
            };
            var oModel = new JSONModel(oData);
            this.setModel(oModel);
             */
        }
    });
});