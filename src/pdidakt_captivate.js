window.pd = {};


// collapseIcon is not really a si id, but normal id
pd.collapseButton = { si: 'collapseIcon' }


// these three funcions are called by the user after the file
window.configPlay = function(si, top, left) {

    pd.playButton = { si, top, left };
}


window.configPause = function(si, top, left) {

    pd.pauseButton = { si, top, left };
}


window.configToc = function(si, top, left) {

    pd.tocButton = { si, top, left };
}





// all global varaibles should be prefixed with window

window.addEventListener("moduleReadyEvent", function(e) {

    window.interfaceObj = e.Data;
    window.eventEmitterObj = interfaceObj.getEventEmitter();



    pd.configureCollapseButton = () => {

        const collapseTocDom = document.querySelector('#collapseIcon')

        if (collapseTocDom) collapseTocDom.addEventListener('click', () => {

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


    }

    pd.addPauseListener = () => {

        eventEmitterObj.addEventListener('CPAPI_MOVIEPAUSE', () => {

            window.pd.playing = false;
        })

    }


	pd.playing = true,

    pd.wasPaused = null,

    pd.pausedByUser = false,



    pd.siElementExists = (si) => {

        eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', (e) => {

            const element = document.getElementById(si);
            return element ? true : false;
        })
    }


    pd.adjustTOCCheckmarkMargins = (tocButtonDom) => {


        // add click event listener to <div id="toc"></div>
        var tocDivDom = document.querySelector("#toc");
        tocDivDom.addEventListener("click", adjustCheckmarkMargins, false)
        // add click eventlistener to the toc button
        tocButtonDom.addEventListener("click", adjustCheckmarkMargins, false)


        // get the toContent DOM element    
        var tocContent = document.querySelector("#tocContent");

        // gather all of the toc checkmarks into an array
        var checkmarks = Array.from(tocContent.querySelectorAll('img')).filter(img => /visited\.png/.exec(img.src));


        function adjustCheckmarkMargins() {

            for (let checkmark of checkmarks) {
                checkmark.style.marginLeft = checkOverflow(tocContent) ? "455px" : "472px";
                checkmark.style.marginTop = "11.5px";
            }

        }





        function checkOverflow(el) {

            var isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;



            return isOverflowing;
        }
    }


    pd.hideTOCSlideTitleHeading = () => {
        const slideTitleText = document.querySelector('.tocSlideTitleHeading');
        slideTitleText.style.display = "none";
    }


    pd.getLabelWSlideNumber = (slideNumber) => {

        // slideNumber is zero-based, so slide 1 in project has a slideNumber of 0

        var getSlides = cp.model.data.project_main.slides.split(',');
        var label = cp.model.data[getSlides[slideNumber]].lb;

        return label
    }


    pd.getSlideNumberWLabel = (label) => {

        var slideNumber;
        var getSlides = cp.model.data.project_main.slides.split(',');
        for (var i = 0; i <= getSlides.length; i++) {
            if (cp.model.data[getSlides[i]].lb === label) {
                slideNumber = i;
                break;
            }
        }

        return slideNumber
    }


    pd.jumpToPrevBookmark = (bookmark) => {
        // in Captivate, add a bookmark such as #thisIsMyBookmark to a slide label
        var getSlides = cp.model.data.project_main.slides.split(',');

        var currentSlide = interfaceObj.getVariableValue('cpInfoCurrentSlide')

        for (let i = currentSlide - 2; i >= 0; i--) {

            if (cp.model.data[getSlides[i]].lb.match(bookmark) !== null) {
                interfaceObj.setVariableValue('cpCmndGotoSlide', i);


                break;
            }
        }
    }

    pd.jumpToNextBookmark = (bookmark) => {
        // in Captivate, add a bookmark such as #thisIsMyBookmark to a slide label
        var getSlides = cp.model.data.project_main.slides.split(',');

        var currentSlide = interfaceObj.getVariableValue('cpInfoCurrentSlide')

        for (let i = currentSlide; i < getSlides.length; i++) {

            if (cp.model.data[getSlides[i]].lb.match(bookmark) !== null) {
                interfaceObj.setVariableValue('cpCmndGotoSlide', i);


                break;
            }
        }
    }


    pd.addSlideEnterListener = () => {





        eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', (e) => {

            pd.play(pd.pauseButton.si, pd.playButton.si);

            setTimeout(() => {

                const tocDom = document.querySelector('#' + pd.tocButton.si) || pd.queryByLocation(pd.tocButton.top, pd.tocButton.left)
                const playDom = document.querySelector('#' + pd.playButton.si) || pd.queryByLocation(pd.playButton.top, pd.playButton.left)
                const pauseDom = document.querySelector('#' + pd.pauseButton.si) || pd.queryByLocation(pd.pauseButton.top, pd.pauseButton.left)

                pd.addClickListenersToPlayPauseToc(tocDom, playDom, pauseDom);
                pd.adjustTOCCheckmarkMargins(tocDom);
                pd.hideTOCSlideTitleHeading();

            }, 1000)

        });
    }

    pd.play = (pause_si, play_si) => {



        pd.pausedByUser = false;

        if (window.cpCmndTOCVisible) {

            window.cpCmndTOCVisible = false;

        }


        pd.playing = true;


        cp.hide(play_si);

        cp.show(pause_si);

        window.cpCmndResume = 1;
    }

    pd.pause = (pause_si, play_si) => {

        window.cpCmndPause = 1;
        cp.hide(pause_si);
        cp.show(play_si);
        pd.pausedByUser = true;
    }

    pd.addClickListenersToPlayPauseToc = (tocDom, playDom, pauseDom) => {


        playDom.addEventListener('click', () => pd.play(pd.pauseButton.si, pd.playButton.si), false);
        pauseDom.addEventListener('click', () => pd.pause(pd.pauseButton.si, pd.playButton.si), false);

        tocDom.addEventListener('click', () => {

            window.cpCmndTOCVisible = true;

            if (pd.playing) {

                pd.wasPaused = false;
                pd.pause(pd.pauseButton.si, pd.playButton.si)

            } else {

                pd.wasPaused = true;

            }

        }, false);
    }

    pd.queryByLocation = (top, left) => {

        if (typeof top !== 'number' || typeof left !== 'number') console.error("The findDOMElementByLocation only expects numbers as arguments")

        // convert arguments to strings
        top = top + 'px', left = left + 'px';

        // assumes pertinent Captivate container is #div_Slide
        const containerToSearch = document.querySelector("#div_Slide");
        if (!containerToSearch) console.error("An element with the id 'div_Slide' was not found");

        // assumes what we are looking for is a div
        const allDivs = containerToSearch.querySelectorAll('div');

        let element;

        for (let div of allDivs) {
            if (div.style.top === top && div.style.left === left) {

                if (/^si\d+$/.exec(div.id)) return div
            }
        }
        console.error("could not find a dom element at that location with an `si234-type` id");
    }

    pd.configureCollapseButton();
    pd.addPauseListener();
    pd.addSlideEnterListener();
})






// this is how you configure the script
// configPlay('si5387768');
// configPause('si5387820');
// configToc('si7565085', 616, 15);