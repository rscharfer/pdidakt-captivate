window.config = {};


// collapseIcon is not really a si id, but normal id
config.collapse = {si:'collapseIcon'}


// these three funcions are called by the user after the file
window.configPlay = function(si, top, left) {

    config.play = { si, top, left };
}


window.configPause = function(si, top, left) {

    config.pause = { si, top, left };
}


window.configToc = function(si, top, left) {

    config.toc = { si, top, left };
}




// all global varaibles should be prefixed with window

window.addEventListener("moduleReadyEvent", function(e) {

    window.interfaceObj = e.Data;
    window.eventEmitterObj = interfaceObj.getEventEmitter();
    const collapseTocDom = document.querySelector('#collapseIcon')

    if (collapseTocDom) collapseTocDom.addEventListener('click', () => {
                   
                    if (pd.wasPaused) {
                       
                        if(pd.pausedByUser){
                        
                            cp.hide(window.config.pause.si);
                            cp.show(window.config.play.si);
                        }
                        else{
                       
                            cp.show(window.config.pause.si);
                            cp.hide(window.config.play.si);
                        }

                        window.cpCmndTOCVisible = false;
                        

                    } else {
                        
                        pd.play(window.config.pause.si, window.config.play.si);

                    }
                    pd.pausedByUser =false;
                    
                }, false);

    eventEmitterObj.addEventListener('CPAPI_MOVIEPAUSE', () => {

        window.pd.playing = false;
    })


    window.pd = {

        

       

       


        playing: true,

        wasPaused: null,

        pausedByUser: false,



        

        siElementExists: (si) => {
            
            eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', (e) => {

                const element = document.getElementById(si);
                return element ? true : false;
            })
        },


        tocContentWidth: function(tocButtonDom) {


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
        },

        enlargeCollapseButton: function(collapseTocDom) {

            collapseTocDom.style.height = "31px";
            collapseTocDom.style.width = "31px";
        },

        hideTOCSlideTitleHeading() {
            const slideTitleText = document.querySelector('.tocSlideTitleHeading');
            slideTitleText.style.display = "none";
        },


        getLabelWSlideNumber: function(slideNumber) {

            // slideNumber is zero-based, so slide 1 in project has a slideNumber of 0

            var getSlides = cp.model.data.project_main.slides.split(',');
            var label = cp.model.data[getSlides[slideNumber]].lb;

            return label
        },


        getSlideNumberWLabel: function(label) {

            var slideNumber;
            var getSlides = cp.model.data.project_main.slides.split(',');
            for (var i = 0; i <= getSlides.length; i++) {
                if (cp.model.data[getSlides[i]].lb === label) {
                    slideNumber = i;
                    break;
                }
            }

            return slideNumber

        },


        jumpToPrevBookmark: function(bookmark) {
            // in Captivate, add a bookmark such as #thisIsMyBookmark to a slide label
            var getSlides = cp.model.data.project_main.slides.split(',');

            var currentSlide = interfaceObj.getVariableValue('cpInfoCurrentSlide')

            for (let i = currentSlide - 2; i >= 0; i--) {

                if (cp.model.data[getSlides[i]].lb.match(bookmark) !== null) {
                    interfaceObj.setVariableValue('cpCmndGotoSlide', i);


                    break;
                }
            }
        },


        jumpToNextBookmark: function(bookmark) {
            // in Captivate, add a bookmark such as #thisIsMyBookmark to a slide label
            var getSlides = cp.model.data.project_main.slides.split(',');

            var currentSlide = interfaceObj.getVariableValue('cpInfoCurrentSlide')

            for (let i = currentSlide; i < getSlides.length; i++) {

                if (cp.model.data[getSlides[i]].lb.match(bookmark) !== null) {
                    interfaceObj.setVariableValue('cpCmndGotoSlide', i);


                    break;
                }
            }
        },


        initialize() {


            let self = this;

            // call the play function and activate the buttons on every slide enter
            eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', (e) => {


                setTimeout(() => {

                    const tocDom = self.getElementByIdOrLocation(window.config.toc)
                    const playDom = self.getElementByIdOrLocation(window.config.play)
                    const pauseDom = self.getElementByIdOrLocation(window.config.pause)
                    const collapseTocDom = self.getElementByIdOrLocation(window.config.collapse)

                    self.play(window.config.pause.si, window.config.play.si);
                    self.wirePlayPauseTocCollapseButtons(tocDom, playDom, pauseDom, collapseTocDom);
                    self.tocContentWidth(tocDom);
                    self.enlargeCollapseButton(collapseTocDom);
                    self.hideTOCSlideTitleHeading();



                }, 1000)

            });

        },

        play(pause_si, play_si) {



            pd.pausedByUser = false;

            // if the TOC is visible, close it
            if (window.cpCmndTOCVisible) {

                window.cpCmndTOCVisible = false;

            }

            // reset playing to true
            this.playing = true;

            // hide play button, show pause button
            cp.hide(play_si);
            cp.show(pause_si);

            const playVisibilityValue = document.querySelector('#' + play_si + 'c').style.visibility;



            // play the project again
            window.cpCmndResume = 1;




            // after a tenth of a second hide play, show pause and play the project again
            setTimeout(function() {


                cp.hide(play_si);
                cp.show(pause_si);
                window.cpCmndResume = 1;





            }, 100)
        },

        pause(pause_si, play_si) {


            // hide pause button, show play, playing is false and project is paused
            window.cpCmndPause = 1;
            cp.hide(pause_si);
            cp.show(play_si);
            const pauseVisibilityValue = document.querySelector('#' + pause_si + 'c').style.visibility;
            this.pausedByUser = true;
        },

        wirePlayPauseTocCollapseButtons(tocDom, playDom, pauseDom, collapseTocDom) {

            const self = this;


            if (!tocDom) throw Error('toc button not found')
            if (!playDom) throw Error('play button not found')
            if (!pauseDom) throw Error('pause button not found')

            if (playDom && pauseDom && tocDom) {


                // if there is a play, pause, and TOC button

                tocDom.addEventListener('click', function() {
                	
                    // add a click listener to the toc button .. if toc is is hidden, pause project and show toc when button is clicked
                    if (typeof window.cpCmndTOCVisible !== 'boolean') throw Error("where is the cpCmndTOCVisible variable?")
                    // if (!window.cpCmndTOCVisible) {

                    self.playing ? self.wasPaused = false : self.wasPaused = true;


                    if(self.playing) self.pause(window.config.pause.si, window.config.play.si)

                    window.cpCmndTOCVisible = true;

                    // it toc button is showing, play button when clicked, change in future to check to see if it was paused?
                    // } else self.play(self.pauseButton.si, self.playButton.si)


                });

                // add correct event listeners to play and pause button
                
                playDom.addEventListener('click', () => self.play(window.config.pause.si, window.config.play.si), false);
                pauseDom.addEventListener('click', () => self.pause(window.config.pause.si, window.config.play.si), false);




            }







        },

        findDOMElementByLocation(top, left) {

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
        },

        getElementByIdOrLocation(configObject) {

            let id = '#' + configObject.si;
            let top = configObject.top;
            let left = configObject.left;



            if (document.querySelector(id)) return document.querySelector(id)

            else if (top && left) return this.findDOMElementByLocation(top, left)

            else console.error(`A button with id ${id} and top value of ${top} and left value of ${left} was not found.`)
        }







    }

    pd.initialize();
})






// this is how you configure the script
// configPlay('si5387768');
// configPause('si5387820');
// configToc('si7565085', 616, 15);