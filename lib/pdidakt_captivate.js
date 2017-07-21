"use strict";

var interfaceObj, eventEmitterObj, pd;

window.addEventListener("moduleReadyEvent", function (e) {

    interfaceObj = e.Data;
    eventEmitterObj = interfaceObj.getEventEmitter();
    // ASSUMED:
    // all drag and drop submit buttons on cp.model.data have a property "type" with value of 641
    // the submit buttons of question slides and knowledge check slides have have a "qbt" property with value of "submit"

    var DRAGANDDROPSUBMITTYPE = 641;
    var submitButtonMap = {};
    var projectData = cp.model.data;
    for (var prop in projectData) {
        if (projectData.hasOwnProperty(prop)) {

            if (projectData[prop].type === DRAGANDDROPSUBMITTYPE || projectData[prop].qbt === "submit") {
                // encodedSlideLabel is how captivate identifies the slide on cp.model.data eg "slide7511768"
                var encodedSlideLabel = projectData[prop].apsn;
                var slideLabel = projectData[encodedSlideLabel].lb;
                submitButtonMap[slideLabel] = prop;
            }
        }
    }

    pd = {
        hideSubmitButton: function hideSubmitButton(slide) {
            if (!slide) slide = interfaceObj.getVariableValue('cpInfoCurrentSlideLabel');
            var submitButton = submitButtonMap[slide];
            cp.hide(submitButton);
        },
        showSubmitButton: function showSubmitButton(slide) {
            if (!slide) slide = interfaceObj.getVariableValue('cpInfoCurrentSlideLabel');
            var submitButton = submitButtonMap[slide];
            cp.show(submitButton);
        }
    };
});

var ans = ['yes', 'no'];