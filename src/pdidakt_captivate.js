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

	// true if user is using Safari 11 
	const isSafari11 = navigator.userAgent.indexOf("Safari/604")> -1 ? true : false;
		console.log("I am using Safari 11",isSafari11)
		
		if (isSafari11){
			cp.show("AudioGrayHinweis");
			cp.show("AudioOrangeHinweis");
		}

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

            let tocDom, playDom, pauseDom;

            const buttonsAvailable = new Promise((resolve,reject)=>{
                let numberOfChecks = 0;

                const buttonCheckInterval = setInterval(()=>{

                    numberOfChecks++;
                    tocDom = document.querySelector('#' + pd.tocButton.si) || pd.queryByLocation(pd.tocButton.top, pd.tocButton.left)
                    playDom = document.querySelector('#' + pd.playButton.si) || pd.queryByLocation(pd.playButton.top, pd.playButton.left)
                    pauseDom = document.querySelector('#' + pd.pauseButton.si) || pd.queryByLocation(pd.pauseButton.top, pd.pauseButton.left)

                    if(tocDom&&playDom&&pauseDom) {
                        clearInterval(buttonCheckInterval);
                        resolve();
                        console.log(`checked for the dom elements ${numberOfChecks} times.`)
                    }

                    if(numberOfChecks>10) 
                        reject();

                },1)


            })


            buttonsAvailable.then(()=>{   
     
                pd.wasPlayingWhenTOCClicked = true;
                pd.addClickListenersToPlayPauseToc(tocDom, playDom, pauseDom);
                pd.adjustTOCCheckmarkMargins(tocDom);
                pd.hideTOCSlideTitleHeading();},(e)=>{console.log('could not find the buttons',e)})
             

        

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