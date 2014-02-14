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
(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/settings/html/general.html", {

        ready: function (element, options) {
            // Register the handlers for dismissal
            document.getElementById("programmaticInvocationSettingsFlyout").addEventListener("keydown", handleAltLeft);
            document.getElementById("programmaticInvocationSettingsFlyout").addEventListener("keypress", handleBackspace);

            //Sprache
            var languageSelection = document.getElementById("languageSelection");
            var languageCode = Windows.Storage.ApplicationData.current.roamingSettings.values["language"];

            if (typeof languageCode !== "undefined") {
                if (languageCode == "de-de") {
                    languageSelection.value = 1;
                }
                else if (languageCode == "en-us") {
                    languageSelection.value = 2;
                }
                else {
                    languageSelection.value = 2;
                }
            }

            //AutoScroll
            var autoscrollCheckbox = document.getElementById("autoscrollCheckbox");
            var autoScroll = Windows.Storage.ApplicationData.current.roamingSettings.values["autoScroll"];
            autoscrollCheckbox.checked = autoScroll;
            

            //Event Handler
            var languageSelection = document.getElementById("languageSelection");
            languageSelection.addEventListener("change", this.buttonChangeLanguage, false);

            autoscrollCheckbox.addEventListener("click", this.changeScrollType, false);

            var resetButton = document.getElementById("resetButton");
            resetButton.addEventListener("click", this.resetAllSettings, false);

            if (cloud.isLoggedIn) {
                $('#showIntroTour').show().on("click", this.showTour);
            } else {
                $('#showIntroTour').hide();
            }

            //Übersetzung aktualisieren
            cloud.functions.translateApp();

            //Autoscroll-Handling
            document.getElementById("autoscrollCheckbox").addEventListener("click", this.changeScrollType, false);
        },

        changeScrollType: function (eventInfo) {
            var appData = Windows.Storage.ApplicationData.current;
            var roamingSettings = appData.roamingSettings;

            roamingSettings.values["autoScroll"] = autoscrollCheckbox.checked;
        },

        unload: function () {
            // Remove the handlers for dismissal
            document.getElementById("programmaticInvocationSettingsFlyout").removeEventListener("keydown", handleAltLeft);
            document.getElementById("programmaticInvocationSettingsFlyout").removeEventListener("keypress", handleBackspace);
        },

        buttonChangeLanguage: function (eventInfo) {
            var languageSelection = document.getElementById("languageSelection").value;
                        
            //SPRACHAUSWAHL aktualisieren
            if (languageSelection == 1) {
                cloud.setCustomLanguage({ customLanguage: "de-de" });
                cloud.vars.roamingSettings.values["language"] = "de-de";
            }
            else if (languageSelection == 2) {
                cloud.setCustomLanguage({ customLanguage: "en-us" });
                cloud.vars.roamingSettings.values["language"] = "en-us";
            }
            else {
                cloud.setCustomLanguage({ customLanguage: "en-us" });
                cloud.vars.roamingSettings.values["language"] = "en-us";
            }

            //Sprache aktualisieren
            cloud.functions.translateApp();

            //Verhindere Crash auf Loginseite
            try{
                cloud.pages.directoryView.loadFolder();
            } catch (e) {
            }
        },

        showTour: function(){
            cloud.vars.roamingSettings.values["showIntroTour"] = true;
            WinJS.Navigation.navigate("/pages/directoryView/directoryView.html");
        },

        resetAllSettings: function () {
            cloud.functions.resetSettings();

            // Reset session variables to avoid infinite crah on autologin
            cloud.session.selectedServer = "";
            cloud.session.selectedServerType
        },
    });

    function handleAltLeft(evt) {
        // Handles Alt+Left in the control and dismisses it
        if (evt.altKey && evt.key === 'Left') {
            WinJS.UI.SettingsFlyout.show();
        }
    };

    function handleBackspace(evt) {
        // Handles the backspace key or alt left arrow in the control and dismisses it
        if (evt.key === 'Backspace') {
            WinJS.UI.SettingsFlyout.show();
        }
    };
})();

