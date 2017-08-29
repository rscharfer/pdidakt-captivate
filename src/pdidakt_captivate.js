var interfaceObj, eventEmitterObj, pd;

window.addEventListener("moduleReadyEvent", function(e) {

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

        lookForSIs:(si)=>{
             eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', (e) => {

                const element = document.getElementById(si);
                return element?true:false;
             })
        },

        activateProgressBar: (nameOfBar, fullWidth) => {
            // name of bar can be the name of the element on the first slide set to show for the rest of the project 
            nameOfBar += 'c';
            eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', (e) => {

                let interval = setInterval(() => {
                    checkForBar(nameOfBar)
                }, 50, false);
                const checkForBar = (nameOfBar) => {
                    let shape;
                    if (shape = document.getElementById(nameOfBar)) {
                        enlargeBar(shape);
                        clearInterval(interval);
                        interval = null;
                    }
                }

                function enlargeBar(shape) {
                    let w = Math.round(fullWidth / (window.cpInfoSlideCount / window.cpInfoCurrentSlide));
                    console.log(`The window width is ${window.totalWidth}, slide count is ${window.cpInfoSlideCount} and current slide ${window.cpInfoCurrentSlide}`);
                    shape.style.width = w + "px";
                }

            })


        },

        hideSubmitButton: function(slide) {
            if (!slide) slide = interfaceObj.getVariableValue('cpInfoCurrentSlideLabel');
            var submitButton = submitButtonMap[slide];
            cp.hide(submitButton);
        },

        showSubmitButton: function(slide) {
            if (!slide) slide = interfaceObj.getVariableValue('cpInfoCurrentSlideLabel');
            var submitButton = submitButtonMap[slide];
            cp.show(submitButton);
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

        

        addToggleToTOC: (tocButton)=>{
            // the click event listener checks to see if the toc is visible
            // if so, close
            // if not, open
            eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function(e) {
               
                const button = document.getElementById(tocButton);
                const toc = document.getElementById("toc");
                 console.log("slide entered",button,toc)
                if (button && toc) button.addEventListener('click',()=>{

                    if(interfaceObj.getVariableValue('cpCmndTOCVisible')) toc.animator.hideTOC();
                    else toc.animator.hideTOC();
                })
                else throw Error('The toggle button with this si number cannot be found.',button,toc)
            })
        },

        wireTogglePlayPause(TOCButton, playButton, pauseButton) {

            var playing = true;

            addSlideEnterListener()

            function addSlideEnterListener() {

                // call the play function and activate the buttons on every slide enter
                eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', function(e) {

                    play();

                    setTimeout(activateButtons, 1000);
                });
            }

            function play() {

                // if the TOC is visible, close it
                if (window.cpCmndTOCVisible) {

                    window.cpCmndTOCVisible = false;

                }

                // reset playing to true
                playing = true;
                // hide play button, show pause button
                cp.hide(playButton);
                cp.show(pauseButton);

                // play the project again
                window.cpCmndResume = 1;


                // after a tenth of a second hide play, show pause and play the project again
                setTimeout(function() {


                    cp.hide(playButton);
                    cp.show(pauseButton);
                    window.cpCmndResume = 1;





                }, 100)
            }

            function pause() {

                // hide pause button, show play, playing is false and project is paused
                window.cpCmndPause = 1;
                cp.hide(pauseButton);
                cp.show(playButton);
                playing = false;
            }
            
            function activateButtons() {

                var collapseIcon = document.querySelector("#collapseIcon");
                var playButtonDOM = document.getElementById(playButton);
                var pauseButtonDOM = document.getElementById(pauseButton);
                var TOCButtonDOM = document.getElementById(TOCButton);

                if (!TOCButtonDOM) TOCButtonDOM=this.findDOMElementByLocation(616,15);

                if (playButtonDOM && pauseButtonDOM && TOCButtonDOM) {
                    // if there is a play, pause, and TOC button

                    TOCButtonDOM.addEventListener('click', function() {
                        // add a click listener to the toc button .. if toc is is hidden, pause project and show toc when button is clicked
                        if (!window.cpCmndTOCVisible) {
                            pause()
                            window.cpCmndTOCVisible = true;

                            // it toc button is hwoing, play button when clicked
                        } else {
                            play()


                        }
                    });

                    // add correct event listeners to play and pause button
                    if(collapseIcon) collapseIcon.addEventListener('click',play,false);
                    playButtonDOM.addEventListener('click', play, false);
                    pauseButtonDOM.addEventListener('click', pause, false);




                }
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
                        console.info(`Found a DOM Element at the location with an id of ${div.id}`);
                        if (/^si\d+$/.exec(div.id)) return div
                    }
                }
                console.error("could not find a dom element at that location with an `si234-type` id");
            },





        recordUserInteraction: function(scrollTextVariable) {
            // from TLC Media Design
            SCORM2004_RecordInteraction("Student Response", scrollTextVariable, true, 0, 0, 0, 0, 0, Date(), "SCORM2004_INTERACTION_TYPE_LONG_FILL_IN");
        }

    }


})


