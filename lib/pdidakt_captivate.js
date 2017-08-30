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

                        lookForSIs: function lookForSIs(si) {
                                    eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function (e) {

                                                var element = document.getElementById(si);
                                                return element ? true : false;
                                    });
                        },

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


                        togglePlayPause: function () {
                                    var isPlaying = 1;
                                    return function () {
                                                if (isPlaying) {
                                                            isPlaying = 0;
                                                            interfaceObj.pause();
                                                } else {
                                                            isPlaying = 1;
                                                            interfaceObj.play();
                                                }
                                    };
                        }(),

                        addToggleToTOC: function addToggleToTOC(tocButton) {
                                    // the click event listener checks to see if the toc is visible
                                    // if so, close
                                    // if not, open
                                    eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function (e) {

                                                var button = document.getElementById(tocButton);
                                                var toc = document.getElementById("toc");
                                                console.log("slide entered", button, toc);
                                                if (button && toc) button.addEventListener('click', function () {

                                                            if (interfaceObj.getVariableValue('cpCmndTOCVisible')) toc.animator.hideTOC();else toc.animator.hideTOC();
                                                });else throw Error('The toggle button with this si number cannot be found.', button, toc);
                                    });
                        },

                        playing: true,

                        wireTogglePlayPause: function wireTogglePlayPause(TOCButton, playButton, pauseButton) {
                                    var _this = this;

                                    // call the play function and activate the buttons on every slide enter
                                    eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function (e) {

                                                _this.play(pauseButton, playButton);
                                                _this.activateButtons(TOCButton, playButton, pauseButton);
                                    });

                                    // this.activateButtons(TOCButton, playButton, pauseButton);

                        },
                        play: function play(pauseButton, playButton) {

                                    // if the TOC is visible, close it
                                    if (window.cpCmndTOCVisible) {

                                                window.cpCmndTOCVisible = false;
                                    }

                                    // reset playing to true
                                    this.playing = true;
                                    // hide play button, show pause button
                                    cp.hide(playButton);
                                    cp.show(pauseButton);

                                    // play the project again
                                    window.cpCmndResume = 1;

                                    // after a tenth of a second hide play, show pause and play the project again
                                    setTimeout(function () {

                                                cp.hide(playButton);
                                                cp.show(pauseButton);
                                                window.cpCmndResume = 1;
                                    }, 100);
                        },
                        pause: function pause(pauseButton, playButton) {

                                    // hide pause button, show play, playing is false and project is paused
                                    window.cpCmndPause = 1;
                                    cp.hide(pauseButton);
                                    cp.show(playButton);
                                    this.playing = false;
                        },
                        activateButtons: function activateButtons(TOCButton, playButton, pauseButton) {
                                    var _this2 = this;

                                    var self = this;
                                    setTimeout(function () {
                                                console.log('activate buttons body called');
                                                var collapseIcon = _this2.getElementByIdOrLocation("collapseIcon");
                                                var playButtonDOM = _this2.getElementByIdOrLocation(playButton);
                                                var pauseButtonDOM = _this2.getElementByIdOrLocation(pauseButton);
                                                var TOCButtonDOM = _this2.getElementByIdOrLocation(TOCButton, 616, 15);

                                                if (playButtonDOM && pauseButtonDOM && TOCButtonDOM) {
                                                            // if there is a play, pause, and TOC button

                                                            TOCButtonDOM.addEventListener('click', function () {
                                                                        // add a click listener to the toc button .. if toc is is hidden, pause project and show toc when button is clicked
                                                                        console.log('toc button clicked');
                                                                        if (!window.cpCmndTOCVisible) {
                                                                                    self.pause(pauseButton, playButton);
                                                                                    window.cpCmndTOCVisible = true;

                                                                                    // it toc button is hwoing, play button when clicked
                                                                        } else {
                                                                                    self.play(pauseButton, playButton);
                                                                        }
                                                            });

                                                            // add correct event listeners to play and pause button
                                                            if (collapseIcon) collapseIcon.addEventListener('click', function (pauseButton, playButton) {
                                                                        self.play(pauseButton, playButton);
                                                            }, false);
                                                            playButtonDOM.addEventListener('click', function (pauseButton, playButton) {
                                                                        self.play(pauseButton, playButton);
                                                            }, false);
                                                            pauseButtonDOM.addEventListener('click', function (pauseButton, playButton) {
                                                                        self.pause(pauseButton, playButton);
                                                            }, false);
                                                }
                                    }, 2000);
                        },
                        findDOMElementByLocation: function findDOMElementByLocation(top, left) {

                                    if (typeof top !== 'number' || typeof left !== 'number') console.error("The findDOMElementByLocation only expects numbers as arguments");

                                    // convert arguments to strings
                                    top = top + 'px', left = left + 'px';

                                    // assumes pertinent Captivate container is #div_Slide
                                    var containerToSearch = document.querySelector("#div_Slide");
                                    if (!containerToSearch) console.error("An element with the id 'div_Slide' was not found");

                                    // assumes what we are looking for is a div
                                    var allDivs = containerToSearch.querySelectorAll('div');

                                    var element = void 0;

                                    var _iteratorNormalCompletion = true;
                                    var _didIteratorError = false;
                                    var _iteratorError = undefined;

                                    try {
                                                for (var _iterator = allDivs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                                            var div = _step.value;

                                                            if (div.style.top === top && div.style.left === left) {
                                                                        console.info("Found a DOM Element at the location with an id of " + div.id);
                                                                        if (/^si\d+$/.exec(div.id)) return div;
                                                            }
                                                }
                                    } catch (err) {
                                                _didIteratorError = true;
                                                _iteratorError = err;
                                    } finally {
                                                try {
                                                            if (!_iteratorNormalCompletion && _iterator.return) {
                                                                        _iterator.return();
                                                            }
                                                } finally {
                                                            if (_didIteratorError) {
                                                                        throw _iteratorError;
                                                            }
                                                }
                                    }

                                    console.error("could not find a dom element at that location with an `si234-type` id");
                        },
                        getElementByIdOrLocation: function getElementByIdOrLocation(id, top, left) {

                                    id = '#' + id;

                                    if (document.querySelector(id)) return document.querySelector(id);else if (top && left) return this.findDOMElementByLocation(top, left);else console.error("A button with id " + id + " and top value of " + top + " and left value of " + left + " was not found.");
                        },


                        recordUserInteraction: function recordUserInteraction(scrollTextVariable) {
                                    // from TLC Media Design
                                    SCORM2004_RecordInteraction("Student Response", scrollTextVariable, true, 0, 0, 0, 0, 0, Date(), "SCORM2004_INTERACTION_TYPE_LONG_FILL_IN");
                        }

            };
});