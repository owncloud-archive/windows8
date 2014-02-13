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

    var loginPage = WinJS.UI.Pages.define("/pages/home/home.html", {
        /**
        Initialize page when user switches to it
        */
        ready: function (element, options) {
            // Define publicly available functions
            cloud.pages.login.loginButtonEvent = this.loginButtonEvent;
            cloud.pages.login.listViewItems = null; // ListView items of preconfigured server

            // Initialize list view
            this.initListView();

            // Restore values after logout or restart (not password for security reasons)
            var username = Windows.Storage.ApplicationData.current.roamingSettings.values["username"];
            var checked = Windows.Storage.ApplicationData.current.roamingSettings.values["saveLogin"];
            var server = Windows.Storage.ApplicationData.current.roamingSettings.values["manualCloudServer"];
            var documentFolder = Windows.Storage.ApplicationData.current.roamingSettings.values["manualDocumentPath"];
            var serverType = Windows.Storage.ApplicationData.current.roamingSettings.values["manualServerType"];

            if (username)       document.getElementById("nameInput").value = username;
            if (checked)        document.getElementById("loginCheckbox").checked = checked;
            if (server)         document.getElementById("manualCloudServer").value = server;
            if (documentFolder) document.getElementById("manualDocumentPath").value = documentFolder;
            if (serverType)     document.getElementById("manualServerTypeSelection").value = serverType;

            // Add event to appbar
            var appbar = document.getElementById("appbar").winControl;
            appbar.getCommandById("helpButton").addEventListener("click", cloud.functions.showHelpSettings, false);
            
            // Deactivate standard navigation button
            WinJS.Navigation.history.backStack = [];
            $("header[role=banner] .win-backbutton").attr("disabled", "disabled");

            // Prepare manual fields
            this.refreshManualVisibility();
            this.updateDocumentPathPlaceholder();

            // Register events
            document.getElementById("registerButton").addEventListener("click", this.openRegisterFlyout, false);
            document.getElementById("manualServerTypeSelection").addEventListener("change", this.updateDocumentPathPlaceholder, false);

            // Start keyboard context
            cloud.setKeystrokeContext({
                context: "login",
                allowGlobal: false,
                actions: {
                    doLogin: cloud.pages.login.loginButtonEvent
                },
            });
        },

        /**
        Event for click on listView element
        Saves server configuration and refreshes view if manual server is selected
        */
        updateServerSelection: function (eventInfo) {
            var listView = document.getElementById("serverList").winControl;
            var indices = listView.selection.getIndices()[0];

            var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
            if (listView.selection.count() > 0) {
                var selectedItem = cloud.pages.login.listViewItems.getAt(indices);
                cloud.session.selectedServer = selectedItem.serverName;
                cloud.session.selectedServerType = selectedItem.serverType;
                roamingSettings.values["backendSelection"] = selectedItem.configName;
            } else {
                // Reset variable
                cloud.session.selectedServer = "";
                cloud.session.selectedServerType = "";
                roamingSettings.values["backendSelection"] = "";
            }

            // Speichern der restlichen AppData
            roamingSettings.values["selectedServer"] = cloud.session.selectedServer;
            roamingSettings.values["selectedServerType"] = cloud.session.selectedServerType;

            // Refresh view
            loginPage.prototype.refreshManualVisibility();
        },

        /**
        Initialize list view element
        */
        initListView: function (itemList) {
            var listView = document.getElementById("serverList").winControl;

            // Vertical scrolling
            listView.layout = new WinJS.UI.ListLayout({
                horizontal: false
            });

            // Register events
            listView.addEventListener("iteminvoked", this.updateServerSelection, false);

            // Get preconfigured servers from config
            var i = 0;
            var items = [];
            for (var serverObj in cloud.config.servers) {
                items[i] = {
                    configName: cloud.config.servers[serverObj].name,
                    title: cloud.config.servers[serverObj].title,
                    text: cloud.config.servers[serverObj].description,
                    picture: cloud.config.servers[serverObj].iconPath,
                    serverType: cloud.config.servers[serverObj].type,
                    serverName: serverObj,
                    langKey: cloud.config.servers[serverObj].langKey,
                    langKeyDesc: cloud.config.servers[serverObj].langKeyDesc
                };
                i++;
            }

            //Nach Namen sortieren
            items.sort(cloud.helper.sortByParam("order"));

            // Add tile for manual entry
            items[i] = {
                configName: "",
                title: "Benutzerdefiniert",
                text: "Manuelle Konfiguration des Servers",
                picture: "images/homeListIcons/gear.png",
                serverType: "manual",
                serverName: "",
                langKey: "SERVERCUSTOM",
                langKeyDesc: "SERVERDESCRIPTIONCUSTOM",
            };
            
            // Create list view from list
            cloud.pages.login.listViewItems = new WinJS.Binding.List(items);
            listView.itemDataSource = cloud.pages.login.listViewItems.dataSource;

            // Restore backend type from appdata
            var serverSelection = Windows.Storage.ApplicationData.current.roamingSettings.values["backendSelection"];
            var selectedServerType = Windows.Storage.ApplicationData.current.roamingSettings.values["selectedServerType"];

            if (selectedServerType == "manual") {
                // Mark last element
                listView.selection.set(items.length - 1);
            } else if (serverSelection) {
                // Search tileID of restored item. Important as new servers might be added in the meantime, thus having other position
                for (var id = 0; id < cloud.pages.login.listViewItems.length; id++) {
                    if (cloud.pages.login.listViewItems.getAt(id).configName == serverSelection) {
                        listView.selection.set(id);
                        break;
                    }
                }
            }
        },

        /**
        Login button event
        */
        loginButtonEvent: function (eventInfo) {
            // Show progress ring as user feedback
            document.getElementById("loginProgressRing").style.visibility = 'visible';

            // Read user input
            var authObj = new Object({
                username: document.getElementById("nameInput").value,
                password: document.getElementById("passInput").value
            });

            var serverObj = new Object({
                manualCloudServer : document.getElementById("manualCloudServer").value,
                manualDocumentPath : document.getElementById("manualDocumentPath").value,
                manualServerType : document.getElementById("manualServerTypeSelection").value
            });

            cloud.functions.login(authObj, serverObj, loginPage.prototype.loginSuccess, loginPage.prototype.loginError);
        },

        /**
        Event if login was successful
        */
        loginSuccess: function (e) {
            // Try to avoid double login attempts
            try {
                var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;

                // Only save user inputs on full success 
                // Partial success indicates that correct credentials were set but maybe in a Windows Popup which is out of reach
                if (document.getElementById("loginCheckbox").checked && e === "FULLSUCCESS") {
                    roamingSettings.values["username"] = document.getElementById("nameInput").value;
                    roamingSettings.values["password"] = document.getElementById("passInput").value;
                    roamingSettings.values["saveLogin"] = document.getElementById("loginCheckbox").checked;

                    //Autologin für den nächsten Appstart aktivieren
                    cloud.session.tryAutoLogin = cloud.isLoggedIn();
                    roamingSettings.values["loginStatus"] = cloud.session.tryAutoLogin;

                    //Speichern der Servereinstellungen in Appdaten
                    roamingSettings.values["manualCloudServer"] = document.getElementById("manualCloudServer").value;
                    roamingSettings.values["manualDocumentPath"] = document.getElementById("manualDocumentPath").value;
                    roamingSettings.values["manualServerType"] = document.getElementById("manualServerTypeSelection").value;
                } else {
                    roamingSettings.values["password"] = "";
                }

                //Ausblenden des Laderings
                document.getElementById("loginProgressRing").style.visibility = 'hidden';

                //Navigieren zur Verzeichnisansicht
                WinJS.Navigation.navigate("/pages/directoryView/directoryView.html");

                //Vermeiden, dass die Loginseite im Zurück-Pfad angezeigt wird
                WinJS.Navigation.history.backStack = [];
            } catch (e) {
                // do nothing
                console.log("Second Login");
            }
        },

        /**
        An error occurred while trying to log in.
        @param reason   (string)    Reason for which login failed (should be the error string identifier for simplicity reasons)
        */
        loginError: function (reason) {
            // Stop login progress bar
            document.getElementById("loginProgressRing").style.visibility = 'hidden';

            // Show error (specific or generic)
            if (typeof reason !== "undefined" && reason != "") {
                cloud.functions.showMessageDialog(reason);
            } else {
                cloud.functions.showMessageDialog("LOGINERROR");
            }
        },

        /**
        Refresh visibility of manual fields
        */
        refreshManualVisibility: function (eventInfo) {
            var manualConfig = document.getElementById("manualConfig");

            if (cloud.session.selectedServerType == "manual") {
                manualConfig.style.display = 'block';
                document.getElementById("registerButton").style.display = 'none';
            } else {
                manualConfig.style.display = 'none';
                document.getElementById("registerButton").style.display = 'inline';
            }
        },

        /**
        Refresh caption of manual field for relative path according to server type
        */
        updateDocumentPathPlaceholder: function(eventInfo) {
            if (document.getElementById("manualServerTypeSelection").value == 1) {
                document.getElementById("manualDocumentPath").placeholder = cloud.translate("MANUALWEBDAVPATH");
            } else {
                document.getElementById("manualDocumentPath").placeholder = cloud.translate("MANUALFOLDERPATH");
            }
        },

        /**
        Show flyout for information on registration
        */
        openRegisterFlyout: function (eventInfo) {
            WinJS.UI.SettingsFlyout.showSettings("register", "/settings/html/register.html");
        },
    });
})();
