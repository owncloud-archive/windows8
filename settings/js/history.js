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

    //Liste der Dateiversionen
    var listViewItems;

    var historyView = WinJS.UI.Pages.define("/settings/html/history.html", {

        ready: function (element, options) {
            //Funktionen
            cloud.pages.history.restore = this.restoreFile;
            cloud.pages.history.cancel = this.cancelRestore;

            document.getElementById("historyProgressRing").style.visibility = 'hidden';

            //Seitentitel
            document.getElementById("filename").innerText = cloud.context.history.file.title;

            //Init Listview
            var listView = document.getElementById("historyView").winControl;
            //LAYOUT
            listView.layout = new WinJS.UI.ListLayout({ horizontal: false });
            listView.addEventListener("selectionchanged", historyView.prototype.selectionChangedEvent);
            this.loadHistory();
            this.selectionChangedEvent();

            //Übersetzung aktualisieren
            cloud.functions.translateApp();

            // History Tastatur-Kontext
            cloud.setKeystrokeContext({
                context: "directoryHistory",
                actions: {
                    restore: cloud.pages.history.restore,
                }
            });

            this.addEventListener("beforehide", function ()
            {
                //Tastaturkontext zurück setzen
                cloud.getPreviousKeystrokeContext();
            });
        },

        unload: function () {
            // Remove the handlers for dismissal
        },

        selectionChangedEvent: function(){
            var listView = document.getElementById("historyView").winControl;
            if (listView.selection.count() == 1) {
                var indices = listView.selection.getIndices();
                var selectedItem = listViewItems.getAt(indices[0]);
                if (selectedItem.versionId == "current") {
                    //Verhindere Selektion
                    listView.selection.set([]);
                } else{
                    document.getElementById("restoreSelectedFile").disabled = false;
                }
            } else {
                document.getElementById("restoreSelectedFile").disabled = true;
            }
        },

        loadHistory: function () {
            document.getElementById("historyProgressRing").style.visibility = 'visible';
            //Dateihistorie laden
            cloud.getVersions({
                path: cloud.context.history.file.path,
            },
                historyView.prototype.reloadHistoryView,
                function () {
                    cloud.functions.showMessageDialog("HISTORYERROR");
                    document.getElementById("historyProgressRing").style.visibility = 'hidden';
                    cloud.showError();
                });
        },

        reloadHistoryView: function (historyList) {
            //Loading Indicator anzeigen
            document.getElementById("historyProgressRing").style.visibility = 'visible';
            var listView = document.getElementById("historyView").winControl;
            //Auslesen der Dateihistorie
            var items = [];

            var versionCounter = historyList.length + 1;

            //Aktuelle Version
            items[0] = {
                title: cloud.translate("VERSION") + ": " + versionCounter + " (" + cloud.translate("CURRENT") + ")",
                versionId: "current",
                date: cloud.context.history.file.date,
                picture: cloud.getFileIcon({ fileType: cloud.context.history.file.fileType }),
            };

            var index = 1;
            for (var i in historyList) {
                items[index] = {
                    title: cloud.translate("VERSION") + ": " + (versionCounter - index),
                    path: historyList[i].path,
                    versionId: historyList[i].versionId,
                    date: historyList[i].date,
                    picture: cloud.getFileIcon({ fileType: cloud.context.history.file.fileType }),
                };
                index++;
            }

            //Übertragen der Title-Liste in ListView
            listViewItems = new WinJS.Binding.List(items);

            //ListView Listeninhalt übergeben
            listView.itemDataSource = listViewItems.dataSource;

            //Loading Indicator ausblenden
            document.getElementById("historyProgressRing").style.visibility = 'hidden';
        },

        restoreFile: function (e) {
            var listView = document.getElementById("historyView").winControl;
            if (listView.selection.count() == 1) {
                var indices = listView.selection.getIndices();
                var selectedItem = listViewItems.getAt(indices[0]);

                if (selectedItem.versionId != "current") {

                    cloud.restoreVersion(
                        {
                            path: selectedItem.path,
                            versionId: selectedItem.versionId
                        },
                        function () {
                            cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FILERESTOREDFROMHISTORY"), "/images/notifications/success.png");
                            //Sofern eine Datei wiederhergestellt wird, die gerade angezeigt wird:
                            //Vorschau ggf. aktuallisieren
                            if (document.getElementById("previewHeader").innerText == cloud.context.history.file.title) {
                                cloud.context.history.file.hasTemporaryFile = false;
                                cloud.context.history.file.temporaryFile = null;
                                cloud.pages.directoryView.updatePreview();
                            }

                            cloud.pages.directoryView.loadFolder();
                            window.focus();
                        },
                        function () {
                            //error
                            cloud.functions.showMessageDialog("FILERESTOREERROR");
                            window.focus();
                        });
                } else {
                    //UNUSED
                    cloud.functions.showMessageDialog("FILEALREADYCURRENT");
                }
            }
        },
    });
})();

