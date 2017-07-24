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

                activateProgressBar: function activateProgressBar(nameOfBar, fullWidth) {
                        // name of bar can be the name of the element on the first slide set to show for the rest of the project 
                        nameOfBar += 'c';
                        eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function (e) {

                                var interval = setInterval(function () {
                                        checkForBar(nameOfBar);
                                }, 50, false);
                                var checkForBar = function checkForBar(nameOfBar) {
                                        var shape = void 0;
                                        if (shape = document.getElementById(nameOfBar)) {
                                                enlargeBar(shape);
                                                clearInterval(interval);
                                                interval = null;
                                        }
                                };

                                function enlargeBar(shape) {
                                        var w = Math.round(fullWidth / (window.cpInfoSlideCount / window.cpInfoCurrentSlide));
                                        console.log("The window width is " + window.totalWidth + ", slide count is " + window.cpInfoSlideCount + " and current slide " + window.cpInfoCurrentSlide);
                                        shape.style.width = w + "px";
                                }
                        });
                },

                hideSubmitButton: function hideSubmitButton(slide) {
                        if (!slide) slide = interfaceObj.getVariableValue('cpInfoCurrentSlideLabel');
                        var submitButton = submitButtonMap[slide];
                        cp.hide(submitButton);
                },

                showSubmitButton: function showSubmitButton(slide) {
                        if (!slide) slide = interfaceObj.getVariableValue('cpInfoCurrentSlideLabel');
                        var submitButton = submitButtonMap[slide];
                        cp.show(submitButton);
                },

                getLabelWSlideNumber: function getLabelWSlideNumber(slideNumber) {

                        // slideNumber is zero-based, so slide 1 in project has a slideNumber of 0

                        var getSlides = cp.model.data.project_main.slides.split(',');
                        var label = cp.model.data[getSlides[slideNumber]].lb;

                        return label;
                },

                findSlideNumberWithLabel: function findSlideNumberWithLabel(label) {

                        var slideNumber;
                        var getSlides = cp.model.data.project_main.slides.split(',');
                        for (var i = 0; i <= getSlides.length; i++) {
                                if (cp.model.data[getSlides[i]].lb === label) {
                                        slideNumber = i;
                                        break;
                                }
                        }

                        return slideNumber;
                },

                jumpToPrevBookmark: function jumpToPrevBookmark(bookmark) {
                        var getSlides = cp.model.data.project_main.slides.split(',');

                        var currentSlide = interfaceObj.getVariableValue('cpInfoCurrentSlide');

                        for (var i = currentSlide - 2; i >= 0; i--) {

                                if (cp.model.data[getSlides[i]].lb.match(bookmark) !== null) {
                                        interfaceObj.setVariableValue('cpCmndGotoSlide', i);

                                        break;
                                }
                        }
                },

                jumpToNextBookmark: function jumpToNextBookmark(bookmark) {
                        var getSlides = cp.model.data.project_main.slides.split(',');

                        var currentSlide = interfaceObj.getVariableValue('cpInfoCurrentSlide');

                        for (var i = currentSlide; i < getSlides.length; i++) {

                                if (cp.model.data[getSlides[i]].lb.match(bookmark) !== null) {
                                        interfaceObj.setVariableValue('cpCmndGotoSlide', i);

                                        break;
                                }
                        }
                },

                hidePlayShowPause: function hidePlayShowPause(playButton, pauseButton) {

                        //  playButton is a string representing the si id of the play button e.g. 'si61740';
                        //  pauseButton is a string representing the si id of the pause button e.g.  'si59879';


                        cp.show(pauseButton);
                        cp.hide(playButton);
                },

                // 
                showCorrectImageOnPlayPauseChange: function showCorrectImageOnPlayPauseChange(playButton, pauseButton) {
                        eventEmitterObj.addEventListener('CPAPI_MOVIERESUME', function () {

                                cp.show(pauseButton);
                                cp.hide(playButton);
                        });

                        eventEmitterObj.addEventListener('CPAPI_MOVIESTART', function () {

                                cp.show(pauseButton);
                                cp.hide(playButton);
                        });

                        eventEmitterObj.addEventListener('CPAPI_MOVIEPAUSE', function () {
                                cp.hide(pauseButton);
                                cp.show(playButton);
                        });
                },


                getPlayPauseFunction: function () {
                        var isPlaying = 1;
                        return function () {
                                if (isPlaying) {
                                        isPlaying = 0;
                                        interfaceObj.pause();
                                        console.log('paused');
                                } else {
                                        isPlaying = 1;
                                        interfaceObj.play();
                                        console.log('played');
                                }
                        };
                }(),

                recordUserInteraction: function recordUserInteraction(scrollTextVariable) {
                        // from TLC Media Design
                        SCORM2004_RecordInteraction("Student Response", scrollTextVariable, true, 0, 0, 0, 0, 0, Date(), "SCORM2004_INTERACTION_TYPE_LONG_FILL_IN");
                }

        };
});