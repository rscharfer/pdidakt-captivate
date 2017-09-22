'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.pd = {};

// collapseIcon is not really a si id, but normal id
pd.collapseButton = { si: 'collapseIcon'

    // these three funcions are called by the user after the file
};window.configPlay = function (si, top, left) {

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

    window.interfaceObj = e.Data;
    window.eventEmitterObj = interfaceObj.getEventEmitter();

    pd.configureCollapseButton = function () {

        var collapseTocDom = document.querySelector('#collapseIcon');

        if (collapseTocDom) collapseTocDom.addEventListener('click', function () {

            if (pd.wasPaused) {

                if (pd.pausedByUser) {

                    cp.hide(pd.pauseButton.si);
                    cp.show(pd.playButton.si);
                } else {

                    cp.show(pd.pauseButton.si);

                    cp.hide(pd.playButton.si);
                }

                window.cpCmndTOCVisible = false;
            } else {

                pd.play(pd.pauseButton.si, pd.playButton.si);
            }
        }, false);

        collapseTocDom.style.height = "31px";
        collapseTocDom.style.width = "31px";
    };

    pd.addPauseListener = function () {

        eventEmitterObj.addEventListener('CPAPI_MOVIEPAUSE', function () {

            window.pd.playing = false;
        });
    };

    pd.playing = true, pd.wasPaused = null, pd.pausedByUser = false, pd.siElementExists = function (si) {

        eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function (e) {

            var element = document.getElementById(si);
            return element ? true : false;
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

    pd.getLabelWSlideNumber = function (slideNumber) {

        // slideNumber is zero-based, so slide 1 in project has a slideNumber of 0

        var getSlides = cp.model.data.project_main.slides.split(',');
        var label = cp.model.data[getSlides[slideNumber]].lb;

        return label;
    };

    pd.getSlideNumberWLabel = function (label) {

        var slideNumber;
        var getSlides = cp.model.data.project_main.slides.split(',');
        for (var i = 0; i <= getSlides.length; i++) {
            if (cp.model.data[getSlides[i]].lb === label) {
                slideNumber = i;
                break;
            }
        }

        return slideNumber;
    };

    pd.jumpToPrevBookmark = function (bookmark) {
        // in Captivate, add a bookmark such as #thisIsMyBookmark to a slide label
        var getSlides = cp.model.data.project_main.slides.split(',');

        var currentSlide = interfaceObj.getVariableValue('cpInfoCurrentSlide');

        for (var i = currentSlide - 2; i >= 0; i--) {

            if (cp.model.data[getSlides[i]].lb.match(bookmark) !== null) {
                interfaceObj.setVariableValue('cpCmndGotoSlide', i);

                break;
            }
        }
    };

    pd.jumpToNextBookmark = function (bookmark) {
        // in Captivate, add a bookmark such as #thisIsMyBookmark to a slide label
        var getSlides = cp.model.data.project_main.slides.split(',');

        var currentSlide = interfaceObj.getVariableValue('cpInfoCurrentSlide');

        for (var i = currentSlide; i < getSlides.length; i++) {

            if (cp.model.data[getSlides[i]].lb.match(bookmark) !== null) {
                interfaceObj.setVariableValue('cpCmndGotoSlide', i);

                break;
            }
        }
    };

    pd.addSlideEnterListener = function () {

        eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function (e) {

            pd.play(pd.pauseButton.si, pd.playButton.si);

            setTimeout(function () {

                var tocDom = document.querySelector('#' + pd.tocButton.si) || pd.queryByLocation(pd.tocButton.top, pd.tocButton.left);
                var playDom = document.querySelector('#' + pd.playButton.si) || pd.queryByLocation(pd.playButton.top, pd.playButton.left);
                var pauseDom = document.querySelector('#' + pd.pauseButton.si) || pd.queryByLocation(pd.pauseButton.top, pd.pauseButton.left);

                pd.addClickListenersToPlayPauseToc(tocDom, playDom, pauseDom);
                pd.adjustTOCCheckmarkMargins(tocDom);
                pd.hideTOCSlideTitleHeading();
            }, 1000);
        });
    };

    pd.play = function (pause_si, play_si) {

        pd.pausedByUser = false;

        if (window.cpCmndTOCVisible) {

            window.cpCmndTOCVisible = false;
        }

        pd.playing = true;

        cp.hide(play_si);

        cp.show(pause_si);

        window.cpCmndResume = 1;
    };

    pd.pause = function (pause_si, play_si) {

        window.cpCmndPause = 1;
        cp.hide(pause_si);
        cp.show(play_si);
        pd.pausedByUser = true;
    };

    pd.addClickListenersToPlayPauseToc = function (tocDom, playDom, pauseDom) {

        playDom.addEventListener('click', function () {
            return pd.play(pd.pauseButton.si, pd.playButton.si);
        }, false);
        pauseDom.addEventListener('click', function () {
            return pd.pause(pd.pauseButton.si, pd.playButton.si);
        }, false);

        tocDom.addEventListener('click', function () {

            window.cpCmndTOCVisible = true;

            if (pd.playing) {

                pd.wasPaused = false;
                pd.pause(pd.pauseButton.si, pd.playButton.si);
            } else {

                pd.wasPaused = true;
            }
        }, false);
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