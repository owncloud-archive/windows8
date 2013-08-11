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
// Eine Einführung zur Navigationsvorlage finden Sie in der folgenden Dokumentation:
// http://go.microsoft.com/fwlink/?LinkId=232506

//Windows.Storage.ApplicationData.current.clearAsync();

//Instanziierung der App-Logik über das Interface
//var cloud = new frontendDummy();
var cloud = new frontendProduction();

//Initialisierung
cloud.doInit({});

// Eigenschaft für Zusatzfunktionen bereitstellen
if (!cloud.pages) {
    cloud.pages = {};
}
if (!cloud.functions) {
    cloud.functions = {};
}

// Cloud-Objekt erweitern
cloud.session = {};

//Gespeicherte Serverselektion wiederherstellen (wenn vorhanden)
cloud.session.selectedServer = Windows.Storage.ApplicationData.current.roamingSettings.values["selectedServer"];
cloud.session.selectedServerType = Windows.Storage.ApplicationData.current.roamingSettings.values["selectedServerType"];
//Ermitteln ob der Benutzer bei der letzten Verwendung eingeloggt war
cloud.session.tryAutoLogin = Windows.Storage.ApplicationData.current.roamingSettings.values["loginStatus"];

if (!cloud.pages.directoryView) {
    cloud.pages.directoryView = {};
}

if (!cloud.pages.login) {
    cloud.pages.login = {};
}

if (!cloud.pages.history) {
    cloud.pages.history = {};
} 

//Autoscroll anfangs aktivieren
if (typeof Windows.Storage.ApplicationData.current.roamingSettings.values["autoScroll"] === "undefined") {
    Windows.Storage.ApplicationData.current.roamingSettings.values["autoScroll"] = true;
}

//Selektierte Ordner und Dateien in aktuellem Ordner (Session)
cloud.pages.directoryView.selectedDirectoryContent = [];

//Kontext der App: Normal, FilePicker, ShareTarget
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

// Sprache einstellen - Systemsprache
var systemLang = cloud.getSystemLanguage();
cloud.setCustomLanguage({ customLanguage: systemLang });

// Falls vorhanden gespeicherte Sprache nutzen
var languageCode = Windows.Storage.ApplicationData.current.roamingSettings.values["language"];
if (languageCode && languageCode != "") {
    cloud.setCustomLanguage({ customLanguage: languageCode });
};

cloud.shareOperation = null;
function shareReady(args) {
    args.setPromise(WinJS.UI.processAll().then(function () {
        return cloud.functions.tryAutoLogin(cloud.session.tryAutoLogin);
    }));
}


//APP INITIALISIEREN
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    app.addEventListener("activated", function (args) {
        var thumbnail;

        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                //Diese Anwendung wurde neu eingeführt --> Die Anwendung hier initialisieren.

                // Superglobale und globale Tastaturbefehle definieren
                cloud.setKeystrokeContext({
                    context: "superglobal",
                    actions: {
                        showHelpSettings: cloud.functions.showHelpSettings
                    }
                });

                /*cloud.setKeystrokeContext({
                    context: "global",
                    actions: {
                        logout: cloud.functions.logout,
                        account: cloud.functions.showAccountSettings
                    }
                });*/
            } else {
                // Diese Anwendung war angehalten und wurde reaktiviert.
                // Anwendungszustand hier wiederherstellen.

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
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return cloud.functions.tryAutoLogin(cloud.session.tryAutoLogin, nav.location); // sonst getDirectory-Fehler
                    //return nav.navigate(nav.location, nav.state);
                } else {
                    //Versuche Autologin ansonsten navigiere zur Loginseite --> überspringt diese wenn möglich
                    return cloud.functions.tryAutoLogin(cloud.session.tryAutoLogin);
                }
            }));
        }if (args.detail.kind === activation.ActivationKind.fileOpenPicker) {
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
        
        // Make sure the following is called after the DOM has initialized. Typically this would be part of app initialization
        //WinJS.Application.start();
    });

    app.oncheckpoint = function (args) {
        // Diese Anwendung wird gleich angehalten. Jeden Zustand,
        // der über Anhaltevorgänge hinweg beibehalten muss, hier speichern. Wenn ein asynchroner 
        // Vorgang vor dem Anhalten der Anwendung abgeschlossen werden muss, 
        // args.setPromise() aufrufen.
        app.sessionState.history = nav.history;
    };

    app.start();
})();
