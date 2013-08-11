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

    //ListView Items der vorkonfigurierten Server
    var listViewItems;

    var loginPage = WinJS.UI.Pages.define("/pages/home/home.html", {
        // Diese Funktion wird immer aufgerufen, wenn ein Benutzer zu dieser Seite wechselt. Sie
        // füllt die Seitenelemente mit den Daten der App auf.
        ready: function (element, options) {
            // Öffentlich verfügbare Funktionen definieren, z.B. für Tastaturbedienung
            cloud.pages.login.loginButtonEvent = this.loginButtonEvent;

            //List-View initialisieren
            this.initListView();

            //Appbar
            var appbar = document.getElementById("appbar").winControl;
            appbar.getCommandById("helpButton").addEventListener("click", cloud.functions.showHelpSettings, false);

            //Sonstige AppDaten wiederherstellen
            var username = Windows.Storage.ApplicationData.current.roamingSettings.values["username"];
            var password = Windows.Storage.ApplicationData.current.roamingSettings.values["password"];

            //Benutzerdaten wiederherstellen
            if (username && password) {
                document.getElementById("nameInput").value = username;
                document.getElementById("passInput").value = password;
            }

            //Login merken
            var checked = Windows.Storage.ApplicationData.current.roamingSettings.values["saveLogin"];
            if (checked) {
                document.getElementById("loginCheckbox").checked = checked;
            }

            //Appdaten nach beenden wiederherstellen
            var server = Windows.Storage.ApplicationData.current.roamingSettings.values["manualCloudServer"];
            var documentFolder = Windows.Storage.ApplicationData.current.roamingSettings.values["manualDocumentPath"];
            //var port = Windows.Storage.ApplicationData.current.roamingSettings.values["manualCloudPort"];
            var serverType = Windows.Storage.ApplicationData.current.roamingSettings.values["manualServerType"];

            if (server) {
                document.getElementById("manualCloudServer").value = server;
            }

            if (documentFolder) {
                document.getElementById("manualDocumentPath").value = documentFolder;
            }

            //if (port) {
                //document.getElementById("manualCloudPort").value = port;
            //}

            if (serverType) {
                document.getElementById("manualServerTypeSelection").value = serverType;
            }

            //Navigation vorbereiten und Back-Button entfernen --> Standardnavigation deaktivieren
            WinJS.Navigation.history.backStack = [];
            $("header[role=banner] .win-backbutton").attr("disabled", "disabled");

            //Manuelle Felder vorbereiten
            this.refreshManualVisibility();
            this.updateDocumentPathPlaceholder();

            //Registrieren Button
            document.getElementById("registerButton").addEventListener("click", this.openRegisterFlyout, false);

            //Vorschlag für Webdav.php Pfad
            document.getElementById("manualServerTypeSelection").addEventListener("change", this.updateDocumentPathPlaceholder, false);

            // Tastatusbedienung
            cloud.setKeystrokeContext({
                context: "login",
                allowGlobal: false,
                actions: {
                    doLogin: cloud.pages.login.loginButtonEvent
                },
            });
        },

        //On-Klick Event für ListView (Speichert Serverkonfiguration und aktualisiert die Anzeige sofern ein manueller Server gewählt wurde)
        updateServerSelection: function (eventInfo) {
            var appData = Windows.Storage.ApplicationData.current;
            var roamingSettings = appData.roamingSettings;

            var listView = document.getElementById("serverList").winControl;
            var indices = listView.selection.getIndices()[0];

            //Sofern etwas angeklickt wurde...
            if (listView.selection.count() > 0) {
                var selectedItem = listViewItems.getAt(indices);
                cloud.session.selectedServer = selectedItem.serverName;
                cloud.session.selectedServerType = selectedItem.serverType;
                roamingSettings.values["backendSelection"] = selectedItem.configName;
            }
                //Ansonsten setzte Variablen zurück
            else {
                cloud.session.selectedServer = "";
                cloud.session.selectedServerType = "";
                roamingSettings.values["backendSelection"] = "";
            }

            //Speichern der restlichen AppData
            roamingSettings.values["selectedServer"] = cloud.session.selectedServer;
            roamingSettings.values["selectedServerType"] = cloud.session.selectedServerType;

            //Aktualisiere die Anzeige
            loginPage.prototype.refreshManualVisibility();
        },

        //Initiiere die ListView (horizontales Scrollen, Anlegen der Serverliste aus Config-File + manueller Server)
        initListView: function (itemList) {
            var listView = document.getElementById("serverList").winControl;

            //Vertikal Scrollen
            listView.layout = new WinJS.UI.ListLayout({
                horizontal: false
            });

            //Ereignishandler
            listView.addEventListener("iteminvoked", this.updateServerSelection, false);

            //Tile für manuelle Serverkonfiguration
            var manual = [];
            var items = [];
            manual[0] = {
                configName: "",
                title: "Benutzerdefiniert",
                text: "Manuelle Konfiguration des Servers",
                picture: "images/homeListIcons/gear.png",
                serverType: "manual",
                serverName: "",
                langKey: "SERVERCUSTOM",
                langKeyDesc: "SERVERDESCRIPTIONCUSTOM",
            };
            var i = 0;
            //Lade Serverobjekte aus Configdatei
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

            //Zusammenhängen der Server mit Benutzerdefiniert
            var sortedList = items.concat(manual);

            //Anhängen der Liste an ListView
            listViewItems = new WinJS.Binding.List(sortedList);
            listView.itemDataSource = listViewItems.dataSource;

            //Backend-Typ  wiederherstellen
            var serverSelection = Windows.Storage.ApplicationData.current.roamingSettings.values["backendSelection"];
            var selectedServerType = Windows.Storage.ApplicationData.current.roamingSettings.values["selectedServerType"];
            if (selectedServerType == "manual") {
                //Letztes Element (manueller Server)
                listView.selection.set(sortedList.length - 1);
            } else if (serverSelection) {
                var id = 0;
                //Suche nach TileID zur Markierung --> Wichtig, da neue Server dazu kommen können, und diese durch die alphabetische Sortierung nicht immer die gleiche position haben
                for (; id < listViewItems.length;) {
                    if (listViewItems.getAt(id).configName != serverSelection) {
                        id++;
                    } else {
                        //Wähle Tile aus  
                        listView.selection.set(id);
                        break;
                    }
                }    
            }
        },

        //Event des Loginbuttons
        loginButtonEvent: function (eventInfo) {
            document.getElementById("loginProgressRing").style.visibility = 'visible';

            //LOGIN-Daten auslesen
            var username = document.getElementById("nameInput").value;
            var password = document.getElementById("passInput").value;
            //Vermeide Login mit leeren Input Feldern
            if (username && password) {
                var authObj = new Object({ username: username, password: password });

                //Crash vermeiden der entsteht sofern kein Server ausgewählt wurde
                if ((cloud.session.selectedServer && cloud.session.selectedServer != "") || cloud.session.selectedServerType == "manual") {
                    //BACKEND-TYP wählen...
                    var manualCloudServer = document.getElementById("manualCloudServer").value;
                    var manualDocumentPath = document.getElementById("manualDocumentPath").value;
                    //var manualCloudPort = document.getElementById("manualCloudPort").value;
                    var manualServerType = document.getElementById("manualServerTypeSelection").value;

                    //Fehlerhafte Konfiguration des manuellen Servers
                    if (cloud.session.selectedServerType == "manual" && (manualCloudServer == "" || !manualServerType || manualDocumentPath == "")) {
                        loginPage.prototype.loginError();
                    } else {
                        //Server auslesen
                        var serverObj = new Object({
                            selectedServerType: cloud.session.selectedServerType,
                            selectedServer: cloud.session.selectedServer,
                            manualCloudServer: manualCloudServer,
                            manualServerTypeSelection: manualServerTypeSelection,
                            manualDocumentPath : manualDocumentPath,
                            //manualCloudPort: document.getElementById("manualCloudPort").value,
                            manualServerType: manualServerType
                        });

                        cloud.functions.login(authObj, serverObj, loginPage.prototype.loginSuccess, loginPage.prototype.loginError);
                    }
                } else {
                    //Keine Serverselektion
                    loginPage.prototype.loginError();
                }
            } else {
                //Kein Benutzername oder PW
                loginPage.prototype.loginError();
            }
        },

        //Event sofern Login erfolgreich war
        loginSuccess: function (e) {
            try { // Gegen doppelte Login-Versuche
                //Loginstatus auf true setzten
                cloud.setLoggedIn({ loginStatus: true });

                console.log("loginstatus: " + cloud.isLoggedIn());

                // Daten abfragen
                var username = document.getElementById("nameInput").value;
                var password = document.getElementById("passInput").value;
                var manualCloudServer = document.getElementById("manualCloudServer").value;
                var manualDocumentPath = document.getElementById("manualDocumentPath").value;
                //var manualCloudPort = document.getElementById("manualCloudPort").value;
                var manualServerType = document.getElementById("manualServerTypeSelection").value;

                // Speichern des Benutzernamen und des PWs über mehrere Sessions
                var savePassword = document.getElementById("loginCheckbox").checked;
                var appData = Windows.Storage.ApplicationData.current;
                var roamingSettings = appData.roamingSettings;

                // Speichern vermeiden, wenn eventuell falsche Daten eingegeben und durch Windows-Popup nachgefragt wurden
                if (savePassword && e === "FULLSUCCESS") {
                    roamingSettings.values["username"] = username;
                    roamingSettings.values["password"] = password;
                    roamingSettings.values["saveLogin"] = savePassword;

                    //Autologin für den nächsten Appstart aktivieren
                    cloud.session.tryAutoLogin = cloud.isLoggedIn();
                    roamingSettings.values["loginStatus"] = cloud.session.tryAutoLogin;

                    //Speichern der Servereinstellungen in Appdaten
                    roamingSettings.values["manualCloudServer"] = manualCloudServer;
                    roamingSettings.values["manualDocumentPath"] = manualDocumentPath;
                    //roamingSettings.values["manualCloudPort"] = manualCloudPort;
                    roamingSettings.values["manualServerType"] = manualServerType;
                }
                else {
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

        //Es gab einen Loginfehler
        loginError: function (e) {
            document.getElementById("loginProgressRing").style.visibility = 'hidden';
            //Zeige Loginfehler für
            //Kein ausgewählter Server
            if ((!cloud.session.selectedServer || cloud.session.selectedServer == "") && cloud.session.selectedServerType != "manual") {
                cloud.functions.showMessageDialog("NOSERVERSELECTED");
                //Manuelle Serverkonfiguration
            } else if (cloud.session.selectedServerType == "manual") {
                //Kein angegebener Serverport
                //if (document.getElementById("manualCloudPort").value == "") {
                    //cloud.functions.showMessageDialog("NOSERVERPORTINSERT");
                //}
                //Keine angegebene Serveradresse
                if (document.getElementById("manualCloudServer").value == "") {
                    cloud.functions.showMessageDialog("NOSERVERINSERT");
                } else if (!(document.getElementById("manualCloudServer").value.indexOf('http://') == 0)
                    && !(document.getElementById("manualCloudServer").value.indexOf('https://') == 0)) {
                    cloud.functions.showMessageDialog("INVALIDSERVER");
                } else if (document.getElementById("manualDocumentPath").value == "") {
                    cloud.functions.showMessageDialog("NODOCUMENTPATHINSERT");
                }
                else {
                    cloud.functions.showMessageDialog("LOGINERROR");
                }
                //Kein angegebener Nutzername
            } else if (document.getElementById("nameInput").value == "") {
                cloud.functions.showMessageDialog("NOUSERNAMEINSERT");
                //Kein angegebenes Passwort
            } else if (document.getElementById("passInput").value == "") {
                cloud.functions.showMessageDialog("NOPASSWORDINSERT");
            } else if (e == "NOCONNECTION") {
                cloud.functions.showMessageDialog("NOCONNECTION");
            } else {
                cloud.functions.showMessageDialog("LOGINERROR");
            }
        },

        //Aktualisieren der Sichtbarkeiten der manuellen Felder
        refreshManualVisibility: function (eventInfo) {
            //Manuelle Felder ein- / ausblenden
            var manualConfig = document.getElementById("manualConfig");

            if (cloud.session.selectedServerType == "manual") {
                manualConfig.style.display = 'block';
            }
            else {
                manualConfig.style.display = 'none';
            }

        },

        updateDocumentPathPlaceholder: function(eventInfo) {
            if (document.getElementById("manualServerTypeSelection").value == 1) {
                document.getElementById("manualDocumentPath").placeholder = cloud.translate("MANUALWEBDAVPATH");
            } else {
                document.getElementById("manualDocumentPath").placeholder = cloud.translate("MANUALFOLDERPATH");
            }
        },

        openRegisterFlyout: function (eventInfo) {
            //Zeige Flyout
            WinJS.UI.SettingsFlyout.showSettings("register", "/settings/html/register.html");
        },
    });
})();
