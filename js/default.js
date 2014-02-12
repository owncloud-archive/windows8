 /*********************************************************************************	
 The Campus Cloud software is available under a dual license of MIT or GPL v3.0
 
 Copyright (C) 2013
 	Benjamin Barann, Arne Cvetkovic, Patrick Janning, Simon Lansmann, 
 	David Middelbeck, Christoph Rieger, Tassilo Tobollik, Jannik Weichert
 
 /********************************************************************************	
 MIT License:
 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:
 
 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 
 See the MIT License for more details: http://opensource.org/licenses/MIT
 /*******************************************************************************
 GPL License:
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 /*******************************************************************************/

// Instanciate app logic
//var cloud = new frontendDummy();
var cloud = new frontendProduction();

//Initialisierung
cloud.doInit({});

// Namespaces for additional functions and pages
if (!cloud.pages)                   cloud.pages = {};
if (!cloud.pages.directoryView)     cloud.pages.directoryView = {};
if (!cloud.pages.login)             cloud.pages.login = {};
if (!cloud.pages.history) cloud.pages.history = {};

cloud.functions = {};
cloud.session = {};
cloud.vars = {};

cloud.vars.roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings; // shortcut

// Version variable to check for updates
cloud.vars.version = Windows.ApplicationModel.Package.current.id.version; // current version

var lastVersion = { build: 0, major: 0, minor: 0, revision: 0 }; // default
if (cloud.vars.roamingSettings.values["currentVersion"] != null) { // last saved version
    lastVersion = JSON.parse(cloud.vars.roamingSettings.values["currentVersion"]);
}

if (cloud.vars.roamingSettings.values["currentVersion"] == null
    || (cloud.vars.version.build > lastVersion.build)
    || (cloud.vars.version.build == lastVersion.build && cloud.vars.version.major > lastVersion.major)
    || (cloud.vars.version.build == lastVersion.build && cloud.vars.version.major == lastVersion.major && cloud.vars.version.minor > lastVersion.minor)
    || (cloud.vars.version.build == lastVersion.build && cloud.vars.version.major == lastVersion.major && cloud.vars.version.minor == lastVersion.minor && cloud.vars.version.revision > lastVersion.revision)) {
    // Upgrade happened
    cloud.debug("Upgraded!");

    // Reset login settings to avoid auto login problems
    cloud.vars.roamingSettings.values["selectedServer"] = null;
    cloud.vars.roamingSettings.values["selectedServerType"] = null;
    cloud.vars.roamingSettings.values["loginStatus"] = false;
};
// Save current version
cloud.vars.roamingSettings.values["currentVersion"] = JSON.stringify(cloud.vars.version);

// Restore server selection if exists
cloud.session.selectedServer = cloud.vars.roamingSettings.values["selectedServer"];
cloud.session.selectedServerType = cloud.vars.roamingSettings.values["selectedServerType"];
cloud.session.tryAutoLogin = cloud.vars.roamingSettings.values["loginStatus"]; // last login status

// Autoscroll
if (typeof cloud.vars.roamingSettings.values["autoScroll"] === "undefined") {
    cloud.vars.roamingSettings.values["autoScroll"] = true; // default
}

// Selected objects in current folder
cloud.pages.directoryView.selectedDirectoryContent = [];

// App contexts: Normal, FilePicker, ShareTarget
cloud.context = {};
cloud.context.showDeletedFiles = false;
cloud.context.isOpenPicker = false;
cloud.context.isSavePicker = false;
cloud.context.isShareTarget = false;
cloud.context.pickerContext = null;
cloud.context.fileMover = {};
cloud.context.fileMover.isFileMover = false;
cloud.context.fileMover.cutObjectPath = [];
cloud.context.fileMover.cutObjectName = [];
cloud.context.fileMover.cutObjectIsDir = [];
cloud.context.history = {};
cloud.context.history.file = null;
cloud.context.share = {};
cloud.context.share.file = null;

cloud.shareOperation = null;
function shareReady(args) {
    args.setPromise(WinJS.UI.processAll().then(function () {
        return cloud.functions.tryAutoLogin(cloud.session.tryAutoLogin);
    }));
}


// Initialize App
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    app.addEventListener("activated", function (args) {
        var thumbnail;

        // General initialization on launch or reactivation
        // Restore custom language if exists
        var languageCode = cloud.vars.roamingSettings.values["language"];
        if (languageCode && languageCode != "") {
            cloud.setCustomLanguage({ customLanguage: languageCode });
        };

        // Keyboard contexts
        cloud.setKeystrokeContext({
            context: "superglobal",
            actions: {
                showHelpSettings: cloud.functions.showHelpSettings
            }
        });


        // Special treatments
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // Application is newly launched

            } else {
                // Application was stopped and reactived. Restore state here

                //Navigationslisten für Session wiederherstellen
                var navigationBackList = WinJS.Application.sessionState.navigationListBackwards;
                if (navigationBackList) {
                    cloud.setNavigationListBack({ list: navigationBackList });
                }

                var navigationForwardList = WinJS.Application.sessionState.navigationListForwards;
                if (navigationForwardList) {
                    cloud.setNavigationListForward({ list: navigationForwardList });
                }

                //Selektion in Verzeichnisansicht wiederherstellen
                var selectedDirectoryContent = WinJS.Application.sessionState.selectedDirectoryContent;
                if (selectedDirectoryContent) {
                    cloud.pages.directoryView.selectedDirectoryContent = selectedDirectoryContent;
                } else {
                    cloud.pages.directoryView.selectedDirectoryContent = [];
                }
            }

            if (app.sessionState.history) { 
                nav.history = app.sessionState.history;
            }

            // Try automatic login
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return cloud.functions.tryAutoLogin(cloud.session.tryAutoLogin, nav.location); // getDirectory error otherwise
                } else {
                    return cloud.functions.tryAutoLogin(cloud.session.tryAutoLogin);
                }
            }));
        } if (args.detail.kind === activation.ActivationKind.fileOpenPicker) {
            cloud.context.isOpenPicker = true;

            cloud.context.pickerContext = args.detail.fileOpenPickerUI;

            args.setPromise(WinJS.UI.processAll().then(function () {
                return cloud.functions.tryAutoLogin(cloud.session.tryAutoLogin);
            }));
        } else if (args.detail.kind === activation.ActivationKind.fileSavePicker) {
            cloud.context.isSavePicker = true;
            cloud.context.pickerContext = args.detail.fileSavePickerUI;

            args.setPromise(WinJS.UI.processAll().then(function () {
                return cloud.functions.tryAutoLogin(cloud.session.tryAutoLogin);
            }));
        } else if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.shareTarget) {
            cloud.context.isShareTarget = true;
            cloud.shareOperation = args.detail.shareOperation;

            WinJS.Application.addEventListener("shareready", shareReady, false);
            WinJS.Application.queueEvent({ type: "shareready" });
        }
    });

    app.oncheckpoint = function (args) {
        // Save eveything important here, the application will be terminated soon.
        // Use args.setPromise() to wait for asynchronous process before termination
        app.sessionState.history = nav.history;
    };

    // Launch
    app.start();
})();
