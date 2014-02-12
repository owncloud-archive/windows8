cloud.pages.introTour = {
    self: null,

    startTour: function () {
        console.log("Start tour");
        self = this;

        // Register click handler for close button
        $('#tourInstructionClose').on("click", this.stopTour);
        // Try to find underlying element to pass click to
        //$('#tourOverlay').on("click", this.propagateClick);

        // Create new keyboard context
        keyboard.setKeystrokeContext();

        // Set navbar event listeners
        keyboard.bindKeystrokeEvent({
            "key": "1",
            "callback": cloud.pages.directoryView.goToHomePage,
            "altKey": true,
            "addClickhandler": true,
            "clickhandlerElement": "#navButtonHome",
            "descriptionKey": "HOME"
        });
        keyboard.bindKeystrokeEvent({
            "key": "2",
            "callback": cloud.functions.logout,
            "altKey": true,
            "descriptionKey": "ACCOUNT",
            "addClickhandler": true,
            "clickhandlerElement": "#navButtonAccount"
        });
        keyboard.bindKeystrokeEvent({
            "key": "3",
            "callback": cloud.functions.showAccountSettings,
            "altKey": true,
            "descriptionKey": "LOGOUT",
            "addClickhandler": true,
            "clickhandlerElement": "#navButtonLogout"
        });

        // Start the tour with first step
        this.stepWelcome();
        cloud.debug("Tour started");
    },

    // Propagate click to lower element as if it was clicked directly
    /*propagateClick: function (e, ee) {
        if (e && e.target && e.target.id == "skipButton") {
            return;
        }
        
        // Hide overlay temporarily
        $('#tourOverlay').hide();

        // Try to find undelying element
        try {
            console.log("Click: Try to locate element below click position");
            ee = ee || {
                pageX: e.pageX,
                pageY: e.pageY
            };
            var next = document.elementFromPoint(ee.pageX, ee.pageY);
            next = (next.nodeType == 3) ? next.parentNode : next
            $(next).trigger('click', ee);
        } catch (err) {
            console.log("click pass through failed: " + err.message);
        } finally {
            // Show overlay again as if nothing happened
            $('#tourOverlay').show();
        }
    },*/

    stopTour: function () {
        cloud.debug("Stop tour");

        // Show general (transparent) overlay
        $('#tourOverlay').removeClass("showTour");
        $('#tourInstructionWrapper').removeClass("showTour");
        
        // Save new setting
        cloud.vars.roamingSettings.values["showIntroTour"] = false;

        // Go into normal context
        cloud.pages.directoryView.setKeyboardContextDirectoryView();
    },


    // Preparation that should take place before every step
    stepPreparation: function(){
        $('#tourOverlay').addClass("showTour");
        $('#tourInstructionWrapper').addClass("showTour");
    },

    // Tour steps
    stepWelcome: function () {
        self.stepPreparation();

        // Set texts
        $('#tourStepTitle').html(cloud.translate("TOURWELCOMETITLE"));
        $('#tourStepText').html(cloud.translate("TOURWELCOMETEXT"));
        document.getElementById('skipButton').winControl._labelSpan.innerHTML = cloud.translate("CONTINUE");

        //Register click handler for skip button
        $('#skipButton').off("click").on("click", self.stepOne);
    },

    stepOne: function () {
        self.stepPreparation();

        // Set texts
        $('#tourStepTitle').html(cloud.translate("TOURSTEP1TITLE"));
        $('#tourStepText').html(cloud.translate("TOURSTEP1TEXT"));
        document.getElementById('skipButton').winControl._labelSpan.innerHTML = cloud.translate("SKIP");

        //Register click handler for skip button
        $('#skipButton').off("click").on("click", self.stepTwo);

        // Set custom event handler for this step
        keyboard.addKeystrokeEvent({
            "key": "U",
            "altKey": true,
            "callback": self.stepOneNext,
            "addClickhandler": true,
            "type": "normal",
            "clickhandlerElement": "#uploadButton",
            "descriptionKey": "UPLOAD"
        });
    },

    // Function that triggers real function and the next step
    stepOneNext: function () {
        // Invoke the function
        cloud.pages.directoryView.uploadFileInternal(cloud.getNavigationPathCurrent(), null, null, function () {
            /*success*/
            // Move on to next step
            self.stepTwo();
        }, function () {/*error*/
            // Move also to next step to continue tour
            self.stepTwo();
        });
    },

    stepTwo: function () {
        self.stepPreparation();
        // Allow clicks anywhere
        $('#tourOverlay').removeClass("showTour");

        // Set texts
        $('#tourStepTitle').html(cloud.translate("TOURSTEP2TITLE"));
        $('#tourStepText').html(cloud.translate("TOURSTEP2TEXT"));

        //Register click handler for skip button
        $('#skipButton').off().on("click", self.stepThree);

        keyboard.addKeystrokeEvent({
            "key": "D",
            "ctrlKey": true,
            "callback": self.stepTwoNext,
            "addClickhandler": true,
            "clickhandlerElement": "#downloadButton",
            "descriptionKey": "DOWNLOAD"
        });
    },

    // Function that triggers real function and the next step
    stepTwoNext: function () {
        // Invoke the function
        cloud.pages.directoryView.downloadAndSaveFileButtonEvent();

        // Move on to next step
        self.stepThree();
    },

    stepThree: function () {
        self.stepPreparation();
        // Allow clicks anywhere
        $('#tourOverlay').removeClass("showTour");
        
        // Set texts
        $('#tourStepTitle').html(cloud.translate("TOURSTEP3TITLE"));
        $('#tourStepText').html(cloud.translate("TOURSTEP3TEXT"));
        document.getElementById('skipButton').winControl._labelSpan.innerHTML = cloud.translate("CONTINUE");

        //Register click handler for skip button
        $('#skipButton').off().on("click", self.stepFour);
    },

    // Function that triggers real function and the next step
    stepThreeNext: function () {
        // Invoke the function
        cloud.pages.directoryView.downloadAndSaveFileButtonEvent();
    },

    stepFour: function () {
        // Skip if we don't have share function
        if (!cloud.hasFunctionality({ functionkey: "getPublicLink" }) && !cloud.hasFunctionality({ functionkey: "shareFile" })) {
            self.stepEnd();
            return;
        }

        self.stepPreparation();
        // Allow clicks anywhere
        $('#tourOverlay').removeClass("showTour");

        // Set texts
        $('#tourStepTitle').html(cloud.translate("TOURSTEP4TITLE"));
        $('#tourStepText').html(cloud.translate("TOURSTEP4TEXT"));

        //Register click handler for skip button
        $('#skipButton').off().on("click", self.stepEnd);

        keyboard.addKeystrokeEvent({
            "key": "S",
            "altKey":true,
            "callback": self.stepFourNext,
            "addClickhandler": true,
            "clickhandlerElement": "#shareButtonAppbar",
            "descriptionKey": "SHARE"
        });
    },

    // Function that triggers real function and the next step
    stepFourNext: function () {
        // Invoke the function
        cloud.pages.directoryView.openShareFlyout();

        // Move on to next step
        self.stepEnd();
    },

    stepEnd: function () {
        self.stepPreparation();

        // Set texts
        $('#tourStepTitle').html(cloud.translate("TOURSTEPENDTITLE"));
        $('#tourStepText').html(cloud.translate("TOURSTEPENDTEXT"));
        document.getElementById('skipButton').winControl._labelSpan.innerHTML = cloud.translate("TOURFINISH");

        //Register click handler for skip button
        $('#skipButton').off().on("click", self.stopTour);
    },
};