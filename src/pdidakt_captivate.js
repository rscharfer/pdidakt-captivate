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

        activateProgessBar: (nameOfBar,fullWidth) => {
            // name of bar can be the name of the element on the first slide set to show for the rest of the project 
            nameOfBar+='c';
            eventEmitterObj.addEventListener('CPAPI_SLIDEENTER', (e) => {

                let interval = setInterval(checkForBar, 50, false);
                const checkForBar = (nameOfBar) => {
                  if (document.getElementById(nameOfBar)){
                    enlargeBar();
                    clearInterval(interval);
                    interval = null;
                  } 
                }
                
                function enlargeBar() {
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

        hidePlayShowPause: function(playButton,pauseButton) {

            //  playButton is a string representing the si id of the play button e.g. 'si61740';
            //  pauseButton is a string representing the si id of the pause button e.g.  'si59879';



            cp.show(pauseButton);
            cp.hide(playButton);



        },

        recordUserInteraction: function(scrollTextVariable) {
            // from TLC Media Design
            SCORM2004_RecordInteraction("Student Response", scrollTextVariable, true, 0, 0, 0, 0, 0, Date(), "SCORM2004_INTERACTION_TYPE_LONG_FILL_IN");
        }

    }


})