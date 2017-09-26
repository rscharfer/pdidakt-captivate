window.pd = {};


// collapseIcon is not really a si id, but normal id
pd.collapseButton = { si: 'collapseIcon' }

pd.wasPlayingWhenTOCClicked = null;

pd.reasonNotPlaying = null; // 'tocButton', 'pauseButton', 'endOfSlide'


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

        collapseTocDom.style.height = "31px";
        collapseTocDom.style.width = "31px";

        collapseTocDom.addEventListener('click', pd.hideTOCAndPossiblyPlay, false);

        collapseTocDom.addEventListener('touchstart', pd.hideTOCAndPossiblyPlay, false);


    }

    pd.hideTOCAndPossiblyPlay = () => {

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

    }




    pd.addPauseListener = () => {

        eventEmitterObj.addEventListener('CPAPI_MOVIEPAUSE', (e) => {

            if (!pd.reasonNotPlaying) {
                pd.reasonNotPlaying = "endOfSlide"
                pd.wasPlayingWhenTOCClicked = false;
            }

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

    pd.addSlideEnterListener = () => {



        eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', (e) => {

            //  pd.play(pd.pauseButton.si, pd.playButton.si);z
            pd.reasonNotPlaying = null;


            if (window.cpCmndTOCVisible) {

                window.cpCmndTOCVisible = false;

            }


            cp.hide(pd.playButton.si);

            cp.show(pd.pauseButton.si);


            setTimeout(() => {
                pd.wasPlayingWhenTOCClicked = true;
                const tocDom = document.querySelector('#' + pd.tocButton.si) || pd.queryByLocation(pd.tocButton.top, pd.tocButton.left)
                const playDom = document.querySelector('#' + pd.playButton.si) || pd.queryByLocation(pd.playButton.top, pd.playButton.left)
                const pauseDom = document.querySelector('#' + pd.pauseButton.si) || pd.queryByLocation(pd.pauseButton.top, pd.pauseButton.left)

                pd.addClickListenersToPlayPauseToc(tocDom, playDom, pauseDom);
                pd.adjustTOCCheckmarkMargins(tocDom);
                pd.hideTOCSlideTitleHeading();

            }, 250)

        });
    }

    pd.play = () => {


        interfaceObj.play()


        pd.reasonNotPlaying = null;
        pd.wasPlayingWhenTOCClicked = true;

        if (window.cpCmndTOCVisible) {

            window.cpCmndTOCVisible = false;

        }


        cp.hide(pd.playButton.si);

        cp.show(pd.pauseButton.si);

    }

    pd.pause = () => {

        interfaceObj.pause();
        cp.hide(pd.pauseButton.si);
        cp.show(pd.playButton.si);
    }

   

    pd.addClickListenersToPlayPauseToc = (tocDom, playDom, pauseDom) => {


        ['click', 'touchstart'].forEach(event => playDom.addEventListener(event, pd.play, false));

        ['click', 'touchstart'].forEach(event => pauseDom.addEventListener(event, ()=>{
            pd.reasonNotPlaying = "pauseButton";
            pd.wasPlayingWhenTOCClicked = false;
            pd.pause(pd.pauseButton.si, pd.playButton.si)
        }, false));

        ['click', 'touchstart'].forEach(event => tocDom.addEventListener(event, () => {

            if (!pd.reasonNotPlaying) pd.reasonNotPlaying = "tocButton"
            window.cpCmndTOCVisible = true;
            if (pd.wasPlayingWhenTOCClicked) {
                pd.pause(pd.pauseButton.si, pd.playButton.si)

            }

        }));
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