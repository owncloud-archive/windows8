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

    //Liste der Freigabeziele
    var searchUserViewItems;
    var userShareViewItems;

    var shareError = false;
    var shareErrorType = null;

    var shareFlyout = WinJS.UI.Pages.define("/settings/html/share.html", {

        ready: function (element, options) {
            document.getElementById("shareProgressRing").style.visibility = 'hidden';
            document.getElementById("searchUserProgressRing").style.visibility = 'hidden';

            this.updatePublicLink();
            this.initUserShareView();
            this.getPossibleUsers();
            this.loadShares();
            this.updateRemoveButton();

            //Eventlistener
            document.getElementById("sendShareLink").addEventListener("click", this.sendShareLink, false);
            document.getElementById("addUserButton").addEventListener("click", this.addUserButtonEvent, false);
            document.getElementById("removeUserButton").addEventListener("click", this.removeUserButtonEvent, false);

            document.getElementById("shareTarget").addEventListener("keyup", this.getPossibleUsers, false);
            

            //Übersetzung aktualisieren
            cloud.functions.translateApp();

            // History Tastatur-Kontext
            cloud.setKeystrokeContext({
                context: "shareView",
                actions: {
                    //TODO sofern benötigt
                }
            });

            this.addEventListener("afterhide", function () {
                //Tastaturkontext zurück setzen
                cloud.getPreviousKeystrokeContext();
            });
        },

        unload: function () {
            // Remove the handlers for dismissal
        },

        //Public Link in Appbar Flyout eintragen
        updatePublicLink: function (selectedItem) {
            //Prüfen ob Backend einen öffentlichen Link bereitstellen kann
            if (cloud.hasFunctionality({ functionkey: "getPublicLink" })) {
                $(document.getElementById("shareLink")).removeClass("invisible");

                cloud.getShareLink({
                    path: cloud.context.share.file.path,
                    isDir: cloud.context.share.file.fileType == "folder"
                },
                    function (obj) { /*success*/
                        //Link in Flyout übertragen
                        document.getElementById("publicShareLinkInput").innerText = obj.link;
                        return;
                    },
                    function (error) { /*error*/
                        if (error == "NOPERMISSION") {
                            //Der Benutzer hat wahrscheinlich keine Berechtigung das ausgewählte Element zu teilen
                            cloud.functions.showMessageDialog("NOPERMISSION");
                        } else {
                            //TODO: Abfangen ob wirklich keine Berechtigung vorliegt oder es nur einen Fehler gab...
                            cloud.functions.showMessageDialog("NOPERMISSION");
                            //cloud.functions.showNotification(cloud.translate("ACTIONINTERRUPTED"), cloud.translate("SHARELINKERROR"), "/images/notifications/warning.png");
                        }
                        return;
                    }
                );
            } else {
                $(document.getElementById("shareLink")).addClass("invisible");
            }
        },

        //Freigabelink per Mail verschicken
        sendShareLink: function () {
            //Standard Mail App öffnen
            var mailto = new Windows.Foundation.Uri("mailto:?to=&subject=" + cloud.translate("SHARELINK") + " " + cloud.context.share.file.title + "&body=" + escape(document.getElementById("publicShareLinkInput").value));
            Windows.System.Launcher.launchUriAsync(mailto);
        },

        //Init. für Benutzeranzeige
        initUserShareView: function() {
            if (cloud.hasFunctionality({ functionkey: "shareFile" })) {
                $(document.getElementById("shareWith")).removeClass("invisible");

                //Init Listview
                var userShareView = document.getElementById("userShareView").winControl;
                var searchUserView = document.getElementById("searchUserView").winControl;
                //LAYOUT
                searchUserView.layout = new WinJS.UI.ListLayout({ horizontal: false });
                searchUserView.addEventListener("selectionchanged", this.updateAddButton, false);
                userShareView.layout = new WinJS.UI.ListLayout({ horizontal: false });
                userShareView.addEventListener("selectionchanged", this.updateRemoveButton, false);

            } else {
                $(document.getElementById("shareWith")).addClass("invisible");
            }
        },

        //Lade die Benutzer, an die das Element aktuell freigegeben ist
        loadShares: function () {
            document.getElementById("shareProgressRing").style.visibility = 'visible';
            //Freigaben laden
            cloud.getShareStatus({
                path: cloud.context.share.file.path,
                isDir: cloud.context.share.file.fileType == "folder"
            },
                shareFlyout.prototype.reloadShareView,
                function (error) {
                    if (error == "NOPERMISSION") {
                        //Der Benutzer hat wahrscheinlich keine Berechtigung das ausgewählte Element zu teilen
                        cloud.functions.showMessageDialog("NOPERMISSION");
                    } else {
                        //TODO: Abfangen ob wirklich keine Berechtigung vorliegt oder es nur einen Fehler gab...
                        cloud.functions.showMessageDialog("NOPERMISSION");
                        //cloud.functions.showNotification(cloud.translate("ACTIONINTERRUPTED"), cloud.translate("SHARELISTERROR"), "/images/notifications/warning.png");
                    }
                    document.getElementById("shareProgressRing").style.visibility = 'hidden';
                    return;
                });
        },

        //Übertragen der aktuellen Freigabe in ListView
        reloadShareView: function (userList) {
            var userShareView = document.getElementById("userShareView").winControl;
            //Auslesen der Dateihistorie
            var items = [];

            var index = 0;
            for (var i in userList) {
                //Permission String erstellen
                var permissionString = cloud.translate("PERMISSION") + ": ";
                if (userList[i].permissionRead) {
                    permissionString += "R"
                }
                if (userList[i].permissionWrite) {
                    permissionString += "W"
                }
                if (userList[i].permissionDelete) {
                    permissionString += "D"
                }
                if (userList[i].permissionReshare) {
                    permissionString += "S"
                }

                items[index] = {
                    title: userList[i].label,
                    shareWith: userList[i].shareWith,
                    subTitle: permissionString,
                    permissionRead: userList[i].permissionRead,
                    permissionWrite: userList[i].permissionWrite,
                    permissionCreate: userList[i].permissionCreate,
                    permissionDelete: userList[i].permissionDelete,
                    permissionReshare: userList[i].permissionReshare,
                    shareToUser: userList[i].shareToUser,
                };
                index++;
            }

            //Übertragen der Title-Liste in ListView
            userShareViewItems = new WinJS.Binding.List(items);

            //ListView Listeninhalt übergeben
            userShareView.itemDataSource = userShareViewItems.dataSource;

            //Loading Indicator ausblenden
            document.getElementById("shareProgressRing").style.visibility = 'hidden';
        },

        //Lade mögliche Benutzer. Wird mit document.getElementById("shareTarget").value gefiltert. Ansonsten werden alle Benutzer zurückgegeben
        getPossibleUsers: function () {
            var input = document.getElementById("shareTarget").value;
            document.getElementById("searchUserProgressRing").style.visibility = 'visible';
            cloud.getShareAutocomplete({ key: input },
                shareFlyout.prototype.reloadSearchUserView,
                function () {
                    cloud.functions.showNotification(cloud.translate("ACTIONINTERRUPTED"), cloud.translate("SHARELISTERROR"), "/images/notifications/warning.png");
                    document.getElementById("searchUserProgressRing").style.visibility = 'hidden';
                });
        },

        //Übertrage mögliche Benutzer in ListView
        reloadSearchUserView: function(searchResult){
            var searchUserView = document.getElementById("searchUserView").winControl;
            //Auslesen der Dateihistorie
            var items = [];

            var index = 0;
            for (var i in searchResult.shareTargets) {
                items[index] = {
                    title: searchResult.shareTargets[i].label,
                    shareWith: searchResult.shareTargets[i].shareWith,
                    subTitle: "",
                    shareToUser: searchResult.shareTargets[i].shareToUser,
                };
                index++;
            }

            //Übertragen der Title-Liste in ListView
            searchUserViewItems = new WinJS.Binding.List(items);

            //ListView Listeninhalt übergeben
            searchUserView.itemDataSource = searchUserViewItems.dataSource;

            //Loading Indicator ausblenden
            document.getElementById("searchUserProgressRing").style.visibility = 'hidden';
        },

        //Schleife: Benutzer nacheinander zur Freigabe hinzufügen
        addUserButtonEvent: function () {
            var searchUserView = document.getElementById("searchUserView").winControl;
            var indices = searchUserView.selection.getIndices();

            if (searchUserView.selection.count() >= 1) {
                document.getElementById("shareProgressRing").style.visibility = 'visible';

                for (var i = 0; i < searchUserView.selection.count() ; i++) {
                    var isLast = i == searchUserView.selection.count() - 1;
                    var currentUser = searchUserViewItems.getAt(indices[i]);
                    shareFlyout.prototype.addUserToSharing(currentUser.shareWith, currentUser.shareToUser, isLast);
                }
            }
        },

        //Einzelner Benutzer wird Freigabe hinzugefügt
        addUserToSharing: function (shareWith, shareToUser, isLast) {
            cloud.shareObject(
                {
                    path: cloud.context.share.file.path,
                    permissionRead: document.getElementById("readPerm").checked,
                    permissionWrite: document.getElementById("writePerm").checked,
                    permissionCreate: document.getElementById("writePerm").checked, //Soll gleichzeitig gesetzt werden
                    permissionDelete: document.getElementById("deletePerm").checked,
                    permissionReshare: document.getElementById("sharePerm").checked,
                    shareWith: shareWith,
                    shareToUser: shareToUser,
                    isDir: cloud.context.share.file.fileType == "folder"
                },
                function () {
                    //success
                    if (isLast) {
                        if (!shareError) {
                            //Behindert weitere Aktionen in der Freigabe. Status ist für den nutzer offensichtlich
                            //cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("SHARECOMPLETED"), "/images/notifications/success.png");
                            document.getElementById("shareTarget").value = "";
                            shareFlyout.prototype.getPossibleUsers();
                        } else {
                            cloud.functions.showNotification(cloud.translate("ACTIONINTERRUPTED"), cloud.translate("SHAREERROR"), "/images/notifications/warning.png");
                        }
                        document.getElementById("shareProgressRing").style.visibility = 'hidden';
                        shareError = false;
                        shareFlyout.prototype.loadShares();
                    }
                },
                function (error) {
                    //error
                    shareError = true;
                    shareErrorType = error;
                    if (isLast) {
                        document.getElementById("shareProgressRing").style.visibility = 'hidden';
                        if (shareErrorType == "ALREADYHASSHARE") {
                            cloud.functions.showNotification(cloud.translate("ACTIONINTERRUPTED"), cloud.translate("SHAREERRORUSERHASFILE"), "/images/notifications/warning.png");
                        } else {
                            cloud.functions.showNotification(cloud.translate("ACTIONINTERRUPTED"), cloud.translate("SHAREERROR"), "/images/notifications/warning.png");
                        }
                        
                        shareError = false;
                        shareErrorType = null;
                    }
                }
            );
        },

        updateAddButton: function () {
            var searchUserView = document.getElementById("searchUserView").winControl;
            if (searchUserView.selection.count() >= 1) {
                document.getElementById("addUserButton").disabled = false;
            } else {
                document.getElementById("addUserButton").disabled = true;
            }
        },

        updateRemoveButton: function () {
            var userShareView = document.getElementById("userShareView").winControl;
            if (userShareView.selection.count() >= 1) {
                document.getElementById("removeUserButton").disabled = false;
            } else {
                document.getElementById("removeUserButton").disabled = true;
            }
        },

        //Schleife: Benutzer nacheinander in Schleife aus Freigabe
        removeUserButtonEvent: function () {
            var userShareView = document.getElementById("userShareView").winControl;
            var indices = userShareView.selection.getIndices();


            if (userShareView.selection.count() >= 1) {
                document.getElementById("shareProgressRing").style.visibility = 'visible';

                for (var i = 0; i < userShareView.selection.count() ; i++) {
                    var isLast = i == userShareView.selection.count() - 1;
                    var currentUser = userShareViewItems.getAt(indices[i]);
                    shareFlyout.prototype.removeUserFromSharing(currentUser.shareWith, currentUser.shareToUser, isLast);
                }
            }
        },

        //Einzelnen Benutzer aus Freigabe entfernen
        removeUserFromSharing: function (shareWith, shareToUser, isLast) {
            cloud.unshareObject(
                {
                    path: cloud.context.share.file.path,
                    shareWith: shareWith,
                    shareToUser: shareToUser,
                    isDir: cloud.context.share.file.fileType == "folder"
                },
                function () {
                    //success
                    if (isLast) {
                        if (!shareError) {
                            //Behindert weitere Aktionen in der Freigabe. Status ist für den nutzer offensichtlich
                            //cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("UNSHARECOMPLETED"), "/images/notifications/success.png");
                        } else {
                            cloud.functions.showNotification(cloud.translate("ACTIONINTERRUPTED"), cloud.translate("UNSHAREERROR"), "/images/notifications/warning.png");
                        }
                        document.getElementById("shareProgressRing").style.visibility = 'hidden';
                        shareFlyout.prototype.loadShares();
                        shareError = false;
                    }
                    
                },
                function () {
                    //error
                    if (isLast) {
                        //document.getElementById("shareProgressRing").style.visibility = 'hidden';
                        cloud.functions.showNotification(cloud.translate("ACTIONINTERRUPTED"), cloud.translate("UNSHAREERROR"), "/images/notifications/warning.png");
                        shareError = false;
                    } else {
                        shareError = true;
                    }
                }
            );
        }
    });
})();

