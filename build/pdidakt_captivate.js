"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _from = require("babel-runtime/core-js/array/from");

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.pd = {};

// collapseIcon is not really a si id, but normal id
pd.collapseButton = { si: 'collapseIcon' };

pd.wasPlayingWhenTOCClicked = null;

pd.reasonNotPlaying = null; // 'tocButton', 'pauseButton', 'endOfSlide'


// these three funcions are called by the user after the file
window.configPlay = function (si, top, left) {

        pd.playButton = { si: si, top: top, left: left };
};

window.configPause = function (si, top, left) {

        pd.pauseButton = { si: si, top: top, left: left };
};

window.configToc = function (si, top, left) {

        pd.tocButton = { si: si, top: top, left: left };
};

// all global varaibles should be prefixed with window

window.addEventListener("moduleReadyEvent", function (e) {

        // true if user is using Safari 11 
        var isSafari11 = navigator.userAgent.indexOf("Safari/604") > -1 ? true : false;
        console.log("I am using Safari 11", isSafari11);

        if (isSafari11) {
                cp.show("AudioGrayHinweis");
                cp.show("AudioOrangeHinweis");
        }

        window.interfaceObj = e.Data;
        window.eventEmitterObj = interfaceObj.getEventEmitter();

        pd.configureCollapseButton = function () {

                var collapseTocDom = document.querySelector('#collapseIcon');

                collapseTocDom.style.height = "31px";
                collapseTocDom.style.width = "31px";

                collapseTocDom.addEventListener('click', pd.hideTOCAndPossiblyPlay, false);

                collapseTocDom.addEventListener('touchstart', pd.hideTOCAndPossiblyPlay, false);
        };

        pd.hideTOCAndPossiblyPlay = function () {

                window.cpCmndTOCVisible = false;

                if (pd.wasPlayingWhenTOCClicked) {

                        pd.play(pd.pauseButton.si, pd.playButton.si);
                } else {

                        if (pd.reasonNotPlaying === 'pauseButton') {

                                cp.hide(pd.pauseButton.si);

                                cp.show(pd.playButton.si);
                        } else if (pd.reasonNotPlaying === "endOfSlide") {

                                cp.show(pd.pauseButton.si);

                                cp.hide(pd.playButton.si);
                        }
                }
        };

        pd.addPauseListener = function () {

                eventEmitterObj.addEventListener('CPAPI_MOVIEPAUSE', function (e) {

                        if (!pd.reasonNotPlaying) {
                                pd.reasonNotPlaying = "endOfSlide";
                                pd.wasPlayingWhenTOCClicked = false;
                        }
                });
        };

        pd.adjustTOCCheckmarkMargins = function (tocButtonDom) {

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
        };

        pd.hideTOCSlideTitleHeading = function () {
                var slideTitleText = document.querySelector('.tocSlideTitleHeading');
                slideTitleText.style.display = "none";
        };

        pd.addSlideEnterListener = function () {

                eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function (e) {

                        //  pd.play(pd.pauseButton.si, pd.playButton.si);z
                        pd.reasonNotPlaying = null;

                        if (window.cpCmndTOCVisible) {

                                window.cpCmndTOCVisible = false;
                        }

                        cp.hide(pd.playButton.si);

                        cp.show(pd.pauseButton.si);

                        var tocDom = void 0,
                            playDom = void 0,
                            pauseDom = void 0;

                        var buttonsAvailable = new _promise2.default(function (resolve, reject) {
                                var numberOfChecks = 0;

                                var buttonCheckInterval = setInterval(function () {

                                        numberOfChecks++;
                                        tocDom = document.querySelector('#' + pd.tocButton.si) || pd.queryByLocation(pd.tocButton.top, pd.tocButton.left);
                                        playDom = document.querySelector('#' + pd.playButton.si) || pd.queryByLocation(pd.playButton.top, pd.playButton.left);
                                        pauseDom = document.querySelector('#' + pd.pauseButton.si) || pd.queryByLocation(pd.pauseButton.top, pd.pauseButton.left);

                                        if (tocDom && playDom && pauseDom) {
                                                clearInterval(buttonCheckInterval);
                                                resolve();
                                                console.log("checked for the dom elements " + numberOfChecks + " times.");
                                        }

                                        if (numberOfChecks > 10) reject();
                                }, 1);
                        });

                        buttonsAvailable.then(function () {

                                pd.wasPlayingWhenTOCClicked = true;
                                pd.addClickListenersToPlayPauseToc(tocDom, playDom, pauseDom);
                                pd.adjustTOCCheckmarkMargins(tocDom);
                                pd.hideTOCSlideTitleHeading();
                        }, function (e) {
                                console.log('could not find the buttons', e);
                        });
                });
        };

        pd.play = function () {

                interfaceObj.play();

                pd.reasonNotPlaying = null;
                pd.wasPlayingWhenTOCClicked = true;

                if (window.cpCmndTOCVisible) {

                        window.cpCmndTOCVisible = false;
                }

                cp.hide(pd.playButton.si);

                cp.show(pd.pauseButton.si);
        };

        pd.pause = function () {

                interfaceObj.pause();
                cp.hide(pd.pauseButton.si);
                cp.show(pd.playButton.si);
        };

        pd.addClickListenersToPlayPauseToc = function (tocDom, playDom, pauseDom) {

                ['click', 'touchstart'].forEach(function (event) {
                        return playDom.addEventListener(event, pd.play, false);
                });

                ['click', 'touchstart'].forEach(function (event) {
                        return pauseDom.addEventListener(event, function () {
                                pd.reasonNotPlaying = "pauseButton";
                                pd.wasPlayingWhenTOCClicked = false;
                                pd.pause(pd.pauseButton.si, pd.playButton.si);
                        }, false);
                });

                ['click', 'touchstart'].forEach(function (event) {
                        return tocDom.addEventListener(event, function () {

                                if (!pd.reasonNotPlaying) pd.reasonNotPlaying = "tocButton";
                                window.cpCmndTOCVisible = true;
                                if (pd.wasPlayingWhenTOCClicked) {
                                        pd.pause(pd.pauseButton.si, pd.playButton.si);
                                }
                        });
                });
        };

        pd.queryByLocation = function (top, left) {

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
        };

        pd.configureCollapseButton();
        pd.addPauseListener();
        pd.addSlideEnterListener();
});

// this is how you configure the script
// configPlay('si5387768');
// configPause('si5387820');
// configToc('si7565085', 616, 15);