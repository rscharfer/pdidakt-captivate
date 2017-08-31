"use strict";

var interfaceObj,
    eventEmitterObj,
    pd,
    config = {};

function configPlay(si, top, left) {

            config.play = { si: si, top: top, left: left };
}

function configPause(si, top, left) {

            config.pause = { si: si, top: top, left: left };
}

function configToc(si, top, left) {

            config.toc = { si: si, top: top, left: left };
}

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

                        playButton: config.play,

                        pauseButton: config.pause,

                        tocButton: config.toc,

                        // technically the collapse buttons doesnt have a si it its id..

                        collapseButton: { si: 'collapseIcon' },

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

                        tocContentWidth: function tocContentWidth(tocButtonDom) {

                                    // add click event listener to <div id="toc"></div>
                                    var tocDivDom = document.querySelector("#toc");
                                    tocDivDom.addEventListener("click", adjustCheckmarkMargins, false);
                                    // add click eventlistener to the toc button
                                    tocButtonDom.addEventListener("click", adjustCheckmarkMargins, false);

                                    // get the toContent DOM element    
                                    var tocContent = document.querySelector("#tocContent");

                                    // gather all of the toc checkmarks into an array
                                    var checkmarks = Array.from(tocContent.querySelectorAll('img')).filter(function (img) {
                                                return (/visited\.png/.exec(img.src)
                                                );
                                    });

                                    function adjustCheckmarkMargins() {
                                                console.log('this is called');
                                                var _iteratorNormalCompletion = true;
                                                var _didIteratorError = false;
                                                var _iteratorError = undefined;

                                                try {
                                                            for (var _iterator = checkmarks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                                                        var checkmark = _step.value;

                                                                        checkmark.style.marginLeft = checkOverflow(tocContent) ? "455px" : "472px";
                                                                        checkmark.style.marginTop = "11.5px";
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
                                    }

                                    function checkOverflow(el) {
                                                // get the current overflow style value of the element. it it's not set, it will be an empty string
                                                // const curOverflow = el.style.overflow;
                                                // console.log(`The original overflow value is ${curOverflow}`)

                                                // // if there is no overflow set or overflow is set to visible, make it hidden
                                                // if (!curOverflow || curOverflow === "visible")
                                                //     el.style.overflow = "hidden";

                                                // if the overflow is hidden 
                                                var isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

                                                // give it back its original value because we dont want to change anything
                                                // el.style.overflow = curOverflow;

                                                return isOverflowing;
                                    }
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

                        wireTogglePlayPause: function wireTogglePlayPause(tocConfigObject, playConfigObject, pauseConfigObject) {

                                    var self = this;

                                    // call the play function and activate the buttons on every slide enter
                                    eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function (e) {

                                                setTimeout(function () {

                                                            var tocDom = self.getElementByIdOrLocation(tocConfigObject);
                                                            var playDom = self.getElementByIdOrLocation(playConfigObject);
                                                            var pauseDom = self.getElementByIdOrLocation(pauseConfigObject);
                                                            var collapseTocDom = self.getElementByIdOrLocation(self.collapseButton);

                                                            self.play(pauseConfigObject, playConfigObject);
                                                            self.activateButtons(tocDom, playDom, pauseDom, collapseTocDom);
                                                            self.tocContentWidth(tocDom);
                                                }, 1000);
                                    });

                                    // this.activateButtons(TOCButton, playButton, pauseButton);

                        },
                        play: function play(pause_si, play_si) {

                                    // if the TOC is visible, close it
                                    if (window.cpCmndTOCVisible) {

                                                window.cpCmndTOCVisible = false;
                                    }

                                    // reset playing to true
                                    this.playing = true;
                                    // hide play button, show pause button
                                    cp.hide(play_si);
                                    cp.show(pause_si);

                                    // play the project again
                                    window.cpCmndResume = 1;

                                    // after a tenth of a second hide play, show pause and play the project again
                                    setTimeout(function () {

                                                cp.hide(play_si);
                                                cp.show(pause_si);
                                                window.cpCmndResume = 1;
                                    }, 100);
                        },
                        pause: function pause(pause_si, play_si) {

                                    // hide pause button, show play, playing is false and project is paused
                                    window.cpCmndPause = 1;
                                    cp.hide(pause_si);
                                    cp.show(play_si);
                                    this.playing = false;
                        },
                        activateButtons: function activateButtons(tocDom, playDom, pauseDom, collapseTocDom) {

                                    var self = this;

                                    if (playDom && pauseDom && tocDom) {
                                                // if there is a play, pause, and TOC button

                                                tocDom.addEventListener('click', function () {
                                                            // add a click listener to the toc button .. if toc is is hidden, pause project and show toc when button is clicked

                                                            if (!window.cpCmndTOCVisible) {
                                                                        self.pause(self.pauseButton.si, self.playButton.si);
                                                                        window.cpCmndTOCVisible = true;

                                                                        // it toc button is hwoing, play button when clicked
                                                            } else {
                                                                        self.play(self.pauseButton.si, self.playButton.si);
                                                            }
                                                });

                                                // add correct event listeners to play and pause button
                                                if (collapseTocDom) collapseTocDom.addEventListener('click', function () {
                                                            return self.play(self.pauseButton.si, self.playButton.si);
                                                }, false);
                                                playDom.addEventListener('click', function () {
                                                            return self.play(self.pauseButton.si, self.playButton.si);
                                                }, false);
                                                pauseDom.addEventListener('click', function () {
                                                            return self.pause(self.pauseButton.si, self.playButton.si);
                                                }, false);
                                    }
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

                                    var _iteratorNormalCompletion2 = true;
                                    var _didIteratorError2 = false;
                                    var _iteratorError2 = undefined;

                                    try {
                                                for (var _iterator2 = allDivs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                                            var div = _step2.value;

                                                            if (div.style.top === top && div.style.left === left) {

                                                                        if (/^si\d+$/.exec(div.id)) return div;
                                                            }
                                                }
                                    } catch (err) {
                                                _didIteratorError2 = true;
                                                _iteratorError2 = err;
                                    } finally {
                                                try {
                                                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                                                        _iterator2.return();
                                                            }
                                                } finally {
                                                            if (_didIteratorError2) {
                                                                        throw _iteratorError2;
                                                            }
                                                }
                                    }

                                    console.error("could not find a dom element at that location with an `si234-type` id");
                        },
                        getElementByIdOrLocation: function getElementByIdOrLocation(configObject) {

                                    var id = '#' + configObject.si;
                                    var top = configObject.top;
                                    var left = configObject.left;

                                    if (document.querySelector(id)) return document.querySelector(id);else if (top && left) return this.findDOMElementByLocation(top, left);else console.error("A button with id " + id + " and top value of " + top + " and left value of " + left + " was not found.");
                        },


                        recordUserInteraction: function recordUserInteraction(scrollTextVariable) {
                                    // from TLC Media Design
                                    SCORM2004_RecordInteraction("Student Response", scrollTextVariable, true, 0, 0, 0, 0, 0, Date(), "SCORM2004_INTERACTION_TYPE_LONG_FILL_IN");
                        }

            };

            pd.wireTogglePlayPause(pd.tocButton, pd.playButton, pd.pauseButton);
});

// this is how you configure the script
// configPlay('si5387768');
// configPause('si5387820');
// configToc('si7565085', 616, 15);