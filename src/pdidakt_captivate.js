var interfaceObj, eventEmitterObj, pd, config = {};


function configPlay(si, top, left) {

    config.play = { si, top, left };
}


function configPause(si, top, left) {

    config.pause = { si, top, left };
}


function configToc(si, top, left) {

    config.toc = { si, top, left };
}






window.addEventListener("moduleReadyEvent", function(e) {

    interfaceObj = e.Data;
    eventEmitterObj = interfaceObj.getEventEmitter();
    // ASSUMED:
    // all drag and drop submit buttons on cp.model.data have a property "type" with value of 641
    // the submit buttons of question slides and knowledge check slides have have a "qbt" property with value of "submit"

    var DRAGANDDROPSUBMITTYPE = 641;
   
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

        siExits: (si) => {
            // on slide enter, checks to see if a DOM element with an si id exists
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
            var checkmarks = Array.from(tocContent.querySelectorAll('img')).filter(img=>/visited\.png/.exec(img.src));


            function adjustCheckmarkMargins() {
                console.log('this is called')
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

        
        getLabelWSlideNumber: function(slideNumber) {

            // slideNumber is zero-based, so slide 1 in project has a slideNumber of 0

            var getSlides = cp.model.data.project_main.slides.split(',');
            var label = cp.model.data[getSlides[slideNumber]].lb;

            return label
        },


        findSlideNumberWithLabel: function(label) {

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
            var getSlides = cp.model.data.project_main.slides.split(',');

            var currentSlide = interfaceObj.getVariableValue('cpInfoCurrentSlide')

            for (let i = currentSlide; i < getSlides.length; i++) {

                if (cp.model.data[getSlides[i]].lb.match(bookmark) !== null) {
                    interfaceObj.setVariableValue('cpCmndGotoSlide', i);


                    break;
                }
            }
        },

        hidePlayShowPause: function(playButton, pauseButton) {

            //  playButton is a string representing the si id of the play button e.g. 'si61740';
            //  pauseButton is a string representing the si id of the pause button e.g.  'si59879';



            cp.show(pauseButton);
            cp.hide(playButton);



        },

        // 
        showCorrectImageOnPlayPauseChange(playButton, pauseButton) {
            eventEmitterObj.addEventListener('CPAPI_MOVIERESUME', () => {

                cp.show(pauseButton);
                cp.hide(playButton);



            })

            eventEmitterObj.addEventListener('CPAPI_MOVIESTART', () => {

                cp.show(pauseButton);
                cp.hide(playButton);



            })

            eventEmitterObj.addEventListener('CPAPI_MOVIEPAUSE', () =>

                {
                    cp.hide(pauseButton);
                    cp.show(playButton);

                })
        },

        togglePlayPause: (() => {
            let isPlaying = 1;
            return () => {
                if (isPlaying) {
                    isPlaying = 0;
                    interfaceObj.pause();

                } else {
                    isPlaying = 1;
                    interfaceObj.play();

                }
            }

        })(),



        addToggleToTOC: (tocButton) => {
            // the click event listener checks to see if the toc is visible
            // if so, close
            // if not, open
            eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function(e) {

                const button = document.getElementById(tocButton);
                const toc = document.getElementById("toc");
                console.log("slide entered", button, toc)
                if (button && toc) button.addEventListener('click', () => {

                    if (interfaceObj.getVariableValue('cpCmndTOCVisible')) toc.animator.hideTOC();
                    else toc.animator.hideTOC();
                })
                else throw Error('The toggle button with this si number cannot be found.', button, toc)
            })
        },

        playing: true,

        wireTogglePlayPause(tocConfigObject, playConfigObject, pauseConfigObject) {


            let self = this;







            // call the play function and activate the buttons on every slide enter
            eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', (e) => {


                setTimeout(() => {




                    const tocDom = self.getElementByIdOrLocation(tocConfigObject)
                    const playDom = self.getElementByIdOrLocation(playConfigObject)
                    const pauseDom = self.getElementByIdOrLocation(pauseConfigObject)
                    const collapseTocDom = self.getElementByIdOrLocation(self.collapseButton)

                    self.play(pauseConfigObject, playConfigObject);
                    self.activateButtons(tocDom, playDom, pauseDom, collapseTocDom);
                    self.tocContentWidth(tocDom);


                }, 1000)

            });






            // this.activateButtons(TOCButton, playButton, pauseButton);







        },

        play(pause_si, play_si) {



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
            this.playing = false;
        },

        activateButtons(tocDom, playDom, pauseDom, collapseTocDom) {

            const self = this;





            if (playDom && pauseDom && tocDom) {
                // if there is a play, pause, and TOC button

                tocDom.addEventListener('click', function() {
                    // add a click listener to the toc button .. if toc is is hidden, pause project and show toc when button is clicked

                    if (!window.cpCmndTOCVisible) {
                        self.pause(self.pauseButton.si, self.playButton.si)
                        window.cpCmndTOCVisible = true;

                        // it toc button is hwoing, play button when clicked
                    } else {
                        self.play(self.pauseButton.si, self.playButton.si)


                    }
                });

                // add correct event listeners to play and pause button
                if (collapseTocDom) collapseTocDom.addEventListener('click', () => self.play(self.pauseButton.si, self.playButton.si), false);
                playDom.addEventListener('click', () => self.play(self.pauseButton.si, self.playButton.si), false);
                pauseDom.addEventListener('click', () => self.pause(self.pauseButton.si, self.playButton.si), false);




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
        },





        recordUserInteraction: function(scrollTextVariable) {
            // from TLC Media Design
            SCORM2004_RecordInteraction("Student Response", scrollTextVariable, true, 0, 0, 0, 0, 0, Date(), "SCORM2004_INTERACTION_TYPE_LONG_FILL_IN");
        }

    }

    pd.wireTogglePlayPause(pd.tocButton, pd.playButton, pd.pauseButton);
})






// this is how you configure the script
// configPlay('si5387768');
// configPause('si5387820');
// configToc('si7565085', 616, 15);