'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.interfaceObj, window.eventEmitterObj, window.pd, window.config = {};

window.configPlay = function (si, top, left) {

            config.play = { si: si, top: top, left: left };
};

window.configPause = function (si, top, left) {

            config.pause = { si: si, top: top, left: left };
};

window.configToc = function (si, top, left) {

            config.toc = { si: si, top: top, left: left };
};

window.addEventListener("moduleReadyEvent", function (e) {

            window.interfaceObj = e.Data;
            window.eventEmitterObj = interfaceObj.getEventEmitter();

            window.pd = {

                        playButton: config.play,

                        pauseButton: config.pause,

                        tocButton: config.toc,

                        playing: true,

                        wasPaused: null,

                        // technically the collapse buttons doesnt have a si it its id..

                        collapseButton: { si: 'collapseIcon' },

                        siExits: function siExits(si) {
                                    // on slide enter, checks to see if a DOM element with an si id exists
                                    eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function (e) {

                                                var element = document.getElementById(si);
                                                return element ? true : false;
                                    });
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
                                    var checkmarks = (0, _from2.default)(tocContent.querySelectorAll('img')).filter(function (img) {
                                                return (/visited\.png/.exec(img.src)
                                                );
                                    });

                                    function adjustCheckmarkMargins() {
                                                var _iteratorNormalCompletion = true;
                                                var _didIteratorError = false;
                                                var _iteratorError = undefined;

                                                try {

                                                            for (var _iterator = (0, _getIterator3.default)(checkmarks), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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

                                                var isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

                                                return isOverflowing;
                                    }
                        },

                        enlargeCollapseButton: function enlargeCollapseButton(collapseTocDom) {

                                    collapseTocDom.style.height = "31px";
                                    collapseTocDom.style.width = "31px";
                        },

                        hideTOCSlideTitleHeading: function hideTOCSlideTitleHeading() {
                                    var slideTitleText = document.querySelector('.tocSlideTitleHeading');
                                    slideTitleText.style.display = "none";
                        },


                        getLabelWSlideNumber: function getLabelWSlideNumber(slideNumber) {

                                    // slideNumber is zero-based, so slide 1 in project has a slideNumber of 0

                                    var getSlides = cp.model.data.project_main.slides.split(',');
                                    var label = cp.model.data[getSlides[slideNumber]].lb;

                                    return label;
                        },

                        getSlideNumberWLabel: function getSlideNumberWLabel(label) {

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
                                    // in Captivate, add a bookmark such as #thisIsMyBookmark to a slide label
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
                                    // in Captivate, add a bookmark such as #thisIsMyBookmark to a slide label
                                    var getSlides = cp.model.data.project_main.slides.split(',');

                                    var currentSlide = interfaceObj.getVariableValue('cpInfoCurrentSlide');

                                    for (var i = currentSlide; i < getSlides.length; i++) {

                                                if (cp.model.data[getSlides[i]].lb.match(bookmark) !== null) {
                                                            interfaceObj.setVariableValue('cpCmndGotoSlide', i);

                                                            break;
                                                }
                                    }
                        },

                        initialize: function initialize(tocConfigObject, playConfigObject, pauseConfigObject) {

                                    var self = this;

                                    // call the play function and activate the buttons on every slide enter
                                    eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function (e) {

                                                setTimeout(function () {

                                                            var tocDom = self.getElementByIdOrLocation(tocConfigObject);
                                                            var playDom = self.getElementByIdOrLocation(playConfigObject);
                                                            var pauseDom = self.getElementByIdOrLocation(pauseConfigObject);
                                                            var collapseTocDom = self.getElementByIdOrLocation(self.collapseButton);

                                                            self.play(pauseConfigObject.si, playConfigObject.si);
                                                            self.wirePlayPauseTocCollapseButtons(tocDom, playDom, pauseDom, collapseTocDom);
                                                            self.tocContentWidth(tocDom);
                                                            self.enlargeCollapseButton(collapseTocDom);
                                                            self.hideTOCSlideTitleHeading();
                                                }, 1000);
                                    });
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

                                    var playVisibilityValue = document.querySelector('#' + play_si + 'c').style.visibility;

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
                                    var pauseVisibilityValue = document.querySelector('#' + pause_si + 'c').style.visibility;

                                    this.playing = false;
                        },
                        wirePlayPauseTocCollapseButtons: function wirePlayPauseTocCollapseButtons(tocDom, playDom, pauseDom, collapseTocDom) {

                                    var self = this;

                                    if (!tocDom) throw Error('toc button not found');
                                    if (!playDom) throw Error('play button not found');
                                    if (!pauseDom) throw Error('pause button not found');

                                    if (playDom && pauseDom && tocDom) {

                                                // if there is a play, pause, and TOC button

                                                tocDom.addEventListener('click', function () {
                                                            // add a click listener to the toc button .. if toc is is hidden, pause project and show toc when button is clicked
                                                            if (typeof window.cpCmndTOCVisible !== 'boolean') throw Error("where is the cpCmndTOCVisible variable?");
                                                            // if (!window.cpCmndTOCVisible) {

                                                            self.playing ? self.wasPaused = false : self.wasPaused = true;

                                                            self.pause(self.pauseButton.si, self.playButton.si);

                                                            window.cpCmndTOCVisible = true;

                                                            // it toc button is showing, play button when clicked, change in future to check to see if it was paused?
                                                            // } else self.play(self.pauseButton.si, self.playButton.si)

                                                });

                                                // add correct event listeners to play and pause button
                                                if (collapseTocDom) collapseTocDom.addEventListener('click', function () {

                                                            if (self.wasPaused) {

                                                                        window.cpCmndTOCVisible = false;
                                                            } else {

                                                                        self.play(self.pauseButton.si, self.playButton.si);
                                                            }
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
                                                for (var _iterator2 = (0, _getIterator3.default)(allDivs), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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

                                    if (document.querySelector(id)) return document.querySelector(id);else if (top && left) return this.findDOMElementByLocation(top, left);else console.error('A button with id ' + id + ' and top value of ' + top + ' and left value of ' + left + ' was not found.');
                        }
            };

            pd.initialize(pd.tocButton, pd.playButton, pd.pauseButton);
});

// this is how you configure the script
// configPlay('si5387768');
// configPause('si5387820');
// configToc('si7565085', 616, 15);