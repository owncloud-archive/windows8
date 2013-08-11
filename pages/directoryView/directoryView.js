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
// Eine Einführung zur Seitensteuerelementvorlage finden Sie in der folgenden Dokumentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    //Wenn Sie eine deklarative Bindung vornehmen (wie im vorherigen Beispiel), sollten Sie die WinJS.Binding.optimizeBindingReferences-Eigenschaft im App-Code immer auf true festlegen. (Tun Sie das nicht, können die Bindungen in Ihrer App zu Arbeitsspeicherverlust führen.)//
    WinJS.Binding.optimizeBindingReferences = true;

    //Inhalte des aktuellen Verzeichnisses
    var listViewItems;

    //Errorhandling für Multi-Vorgänge
    var deleteError = false;
    var restoreError = false;
    var downloadError = false;
    var uploadError = false;
	
	//Initialisierung neuer Geste
    var newGesture;

    //appViewState nicht verändern!
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var lastLayout;

    //Code Editor / Preview
    cloud.pages.directoryView.editor = null;

    var directoryView = WinJS.UI.Pages.define("/pages/directoryView/directoryView.html", {
        // Diese Funktion wird immer aufgerufen, wenn ein Benutzer zu dieser Seite wechselt. Sie
        // füllt die Seitenelemente mit den Daten der App auf.
        ready: function (element, options) {
            // Felder
            cloud.pages.directoryView.downloadProgressBarLabel = document.getElementById("downloadProgressBarLabel");
            cloud.pages.directoryView.downloadProgressBar = document.getElementById("downloadProgressBar");
            cloud.pages.directoryView.uploadProgressBarLabel = document.getElementById("uploadProgressBarLabel");
            cloud.pages.directoryView.uploadProgressBar = document.getElementById("uploadProgressBar");
            cloud.pages.directoryView.operationPending = document.getElementById("operationPending");
            cloud.pages.directoryView.pdfNextButton = document.getElementById("pdfNextButton");
            cloud.pages.directoryView.pdfBackButton = document.getElementById("pdfBackButton");
            cloud.pages.directoryView.pdfGoToPageButton = document.getElementById("pdfGoToPageButton");
            cloud.pages.directoryView.pdfZoomOutButton = document.getElementById("pdfZoomOutButton");
            cloud.pages.directoryView.pdfZoomInButton = document.getElementById("pdfZoomInButton");
            cloud.pages.directoryView.pdfPageNumDOM = document.getElementById("pdfPageNum");

            cloud.pages.directoryView.currentSortType = false;
            cloud.pages.directoryView.currentListLayout = false;
            // Funktionen
            cloud.pages.directoryView.updateAppbar = this.updateAppBar;
            cloud.pages.directoryView.navigateBackEvent = this.navigateBackEvent;
            cloud.pages.directoryView.navigateForwardEvent = this.navigateForwardEvent;
            cloud.pages.directoryView.goToHomePage = this.goToHomePage;
            cloud.pages.directoryView.clearSelection = this.clearSelection;
            cloud.pages.directoryView.loadFolder = this.loadFolder;
            cloud.pages.directoryView.sortByName = this.sortByName;
            cloud.pages.directoryView.sortBySizeDesc = this.sortBySizeDesc;
            cloud.pages.directoryView.displayDeleted = this.displayDeleted;
            cloud.pages.directoryView.restoreFileButtonEvent = this.restoreFileButtonEvent;
            cloud.pages.directoryView.showHistory = this.showHistory;
            cloud.pages.directoryView.cameraUpload = this.cameraUpload;
            cloud.pages.directoryView.uploadLocalFile = this.uploadLocalFile;
            cloud.pages.directoryView.uploadSharedFile = this.uploadSharedFile;
            cloud.pages.directoryView.createFolder = this.createFolder;
            cloud.pages.directoryView.deleteFileButtonEvent = this.deleteFileButtonEvent;
            cloud.pages.directoryView.moveObject = this.moveObject;
            cloud.pages.directoryView.openFileButtonEvent = this.openFileButtonEvent;
            cloud.pages.directoryView.downloadAndSaveFileButtonEvent = this.downloadAndSaveFileButtonEvent;
            cloud.pages.directoryView.renameFile = this.renameFile;
            cloud.pages.directoryView.sortByFlex = this.sortByFlex;
            cloud.pages.directoryView.openShareMenu = this.openShareMenu,
            cloud.pages.directoryView.cancelFileMover = this.leaveFileMover;
            cloud.pages.directoryView.changeToGridLayout = this.changeToGridLayout;
            cloud.pages.directoryView.changeToListLayout = this.changeToListLayout;
            cloud.pages.directoryView.pdfNavNext = cloud.functions.pdfGoNext;
            cloud.pages.directoryView.pdfNavBack = cloud.functions.pdfGoPrevious;
            cloud.pages.directoryView.pdfZoomIn = cloud.functions.pdfZoomIn;
            cloud.pages.directoryView.pdfZoomOut = cloud.functions.pdfZoomOut;
            cloud.pages.directoryView.setPDFContext = this.setPDFContext;
            cloud.pages.directoryView.updatePreview = this.updatePreview;
            cloud.pages.directoryView.restore = this.restoreFileButtonEvent;
            cloud.pages.directoryView.recognizeTextFromPicture = this.recognizeTextFromPicture;


            cloud.pages.directoryView.pdfGoToPage = function () {
                var pageNum = cloud.pages.directoryView.pdfPageNumDOM.value;
                if (pageNum >= 1 && pageNum <= cloud.pages.directoryView.pdfDoc.numPages) {
                    cloud.pages.directoryView.pdfPageNum = pageNum;
                    cloud.functions.renderPage(pageNum, cloud.pages.directoryView.pdfCurrentZoom);
                }
            };

            //PDF Steuerelemente
            $(cloud.pages.directoryView.pdfBackButton).addClass("invisible");
            $(cloud.pages.directoryView.pdfNextButton).addClass("invisible");
            $(cloud.pages.directoryView.pdfGoToPageButton).addClass("invisible");
            $(cloud.pages.directoryView.pdfZoomOutButton).addClass("invisible");
            $(cloud.pages.directoryView.pdfZoomInButton).addClass("invisible");
            $(cloud.pages.directoryView.pdfPageNumDOM).addClass("invisible");

            document.getElementById("pdfControls").style.visibility = "hidden";
            document.getElementById("pdfPreview").style.visibility = "hidden";

            //Selektion leere Button immer ausblenden
            $('#clearSelectionButton').addClass("invisible");
            $('#emptyDirectory').addClass("invisible");

            //Sessiondaten wiederherstellen
            //Gespeicherte Sortierung wiederherstellen
            if (WinJS.Application.sessionState.currentSortType) {
                cloud.pages.directoryView.currentSortType = WinJS.Application.sessionState.currentSortType;
            } else {
                //Wenn es keine Sessiondaten über die Sortierreihenfolge gibt, wird nach dem namen sortiert
                cloud.pages.directoryView.currentSortType = "name";
            }

            //ListLayout wiederherstellen
            var appData = Windows.Storage.ApplicationData.current;
            var roamingSettings = appData.roamingSettings;
            if (roamingSettings.values["currentLayout"]) {
                cloud.pages.directoryView.currentLayout = roamingSettings.values["currentLayout"];
                //Ansichtsänderungsbuttons ausblenden
                document.getElementById("changeToGridLayout").style.visibility = "visible";
                document.getElementById("changeToListLayout").style.visibility = "hidden";
            } else {
                cloud.pages.directoryView.currentLayout = "GridLayout";
                document.getElementById("changeToGridLayout").style.visibility = "hidden";
                document.getElementById("changeToListLayout").style.visibility = "visible";
            }

            //APPBAR
            var appBarDiv = document.getElementById("appbar");
            var appbar = document.getElementById("appbar").winControl;
            //Verberge Appbar Knöpfe
            appbar.hideCommands(appBarDiv.querySelectorAll('button'));

            /*###############################################################################################*/

            $(appbar).on('beforehide', function () {
                var viewstateAppbar = Windows.UI.ViewManagement.ApplicationView.value;
                if (viewstateAppbar == Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                }
                else {
                    $('.directoryView section[role=main]').css('height', '100%');
                    $('.contentGrid').css('height', 'calc(100% - 130px)');
                }
            });
            $(appbar).on('beforeshow', function () {
                var viewstateAppbar = Windows.UI.ViewManagement.ApplicationView.value;
                if (viewstateAppbar == Windows.UI.ViewManagement.ApplicationViewState.snapped) {

                }
                else {
                    $('.directoryView section[role=main]').css('height', 'calc(100% - 100px)');
                    $('.contentGrid').css('height', 'calc(100% - 30px)');
                }

            });
            /*###############################################################################################*/

            ////////////////////////////KONTEXTWAHL////////////////////////////
            //Filepicker (=An die App soll geteilt werden)
            if (cloud.context.fileMover.isFileMover || cloud.context.isShareTarget) { //Reine Ordneransicht mit Appbar Knöpfen
                document.getElementById("syncButton").style.display = "none";
                document.getElementById("changeLayout").style.display = "none";
                document.getElementById("sortButton").style.display = "none";

                navbar.disabled = true;

                //Appbar dauerhaft einblenden
                appbar.sticky = true;
                appbar.addEventListener("afterhide", function () { appbar.show(); });
                appbar.show();

                if (cloud.context.fileMover.isFileMover) {  //Datei soll verschoben werden
                    appbar.showCommands(appBarDiv.querySelectorAll('.fileCopied'));

                    //Dateiverschieben Tastatur-Kontext
                    cloud.setKeystrokeContext({
                        context: "fileMover",
                        actions: {
                            home: cloud.pages.directoryView.goToHomePage,
                            navigateBack: cloud.pages.directoryView.navigateBackEvent,
                            navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                            paste: directoryView.prototype.pasteObject,
                            cancel: cloud.pages.directoryView.cancelFileMover,
                        }
                    });
                } else if (cloud.context.isShareTarget) { //App wurde als Freigabeziel gewählt und Datei soll hochgeladen werden
                    appbar.showCommands(appBarDiv.querySelectorAll('.upload'));
                    //document.getElementById("takePictureButton").style.display = "none";

                    //Dateiverschieben Tastatur-Kontext
                    cloud.setKeystrokeContext({
                        context: "shareTarget",
                        actions: {
                            home: cloud.pages.directoryView.goToHomePage,
                            navigateBack: cloud.pages.directoryView.navigateBackEvent,
                            navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                            upload: directoryView.prototype.uploadSharedFile,
                        }
                    });
                }
            } else if (cloud.context.isSavePicker) { //FileSavePicker (FilePicker Buttons one Appbar)
                appbar.disabled = true;
                navbar.disabled = true;

                cloud.context.pickerContext.addEventListener("targetfilerequested", this.onTargetFileRequested, false);

                //Dateiverschieben Tastatur-Kontext
                cloud.setKeystrokeContext({
                    context: "savePicker",
                    actions: {
                        home: cloud.pages.directoryView.goToHomePage,
                        navigateBack: cloud.pages.directoryView.navigateBackEvent,
                        navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                    }
                });
            } else if (cloud.context.isOpenPicker) { //FileOpenPicker (FilePicker Buttons one Appbar)

                appbar.disabled = true;
                navbar.disabled = true;

                //Dateiverschieben Tastatur-Kontext
                cloud.setKeystrokeContext({
                    context: "openPicker",
                    actions: {
                        home: cloud.pages.directoryView.goToHomePage,
                        navigateBack: cloud.pages.directoryView.navigateBackEvent,
                        navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                    }
                });
            } else { //Normaler Kontext --> Dateibrowser
                appbar.disabled = false;

                ///////////Ereignishandler///////////

                //Freigeben von Inhalten aus DirectoryView
                var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
                dataTransferManager.addEventListener("datarequested", this.dataRequested);

                document.getElementById("pdfPageNum").addEventListener("click", function () {
                    cloud.setKeystrokeContext({
                        context: "pdfPageNum",
                        actions: {
                            home: cloud.pages.directoryView.goToHomePage,
                            zoomIn: cloud.pages.directoryView.pdfZoomIn,
                            zoomOut: cloud.pages.directoryView.pdfZoomOut,
                            pageBtn: cloud.pages.directoryView.pdfGoToPage,
                            navigateBack: cloud.pages.directoryView.navigateBackEvent,
                            navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                            deleteFileButtonEvent: function () { document.getElementById('deleteFileButtonAppbar').click(); },
                        }
                    });
                });
                document.getElementById("pdfPageNum").addEventListener("focusout", function () {
                    cloud.pages.directoryView.setPDFContext();
                });

                //////////Tastatur-Kontexte//////////////
                // Standard-Kontext im Dateibrowser
                this.setDirectoryViewContext();

                // Objekt umbenennen Tastatur-Kontext
                document.getElementById("renameFlyout").addEventListener("beforeshow", function () {
                    cloud.setKeystrokeContext({
                        context: "directoryRename",
                        actions: {
                            //Hier ist scheinbar (anders als beim delete Flyout) ein Shotcut nötig, da sonst das Bestätigen mit Enter nicht möglich ist...
                            renameConfirm: cloud.pages.directoryView.renameFile,
                        }
                    });
                }, false);
                document.getElementById("renameFlyout").addEventListener("afterhide", function () { cloud.getPreviousKeystrokeContext(); }, false);
                //EventListener hier nicht nötig, da Keyboard Shortcut gesetzt wird und dort der Listener hinzugefügt wird
                //document.getElementById("renameButton").addEventListener("click", this.renameFile, false);

                // Objekt löschen Tastatur-Kontext
                document.getElementById("deleteFlyout").addEventListener("beforeshow", function () {
                    cloud.setKeystrokeContext({
                        context: "directoryDelete",
                        actions: {
                            //Nicht nötig, da einziger Button im Flyout bereits durch Enter ausgelöst werden kann --> addEventListener dafür nötig
                            //deleteConfirm: cloud.pages.directoryView.deleteFileButtonEvent,
                        }
                    });
                }, false);
                document.getElementById("deleteFlyout").addEventListener("afterhide", function () { cloud.getPreviousKeystrokeContext(); }, false);
                document.getElementById("confirmDeleteButton").addEventListener("click", this.deleteFileButtonEvent, false);

                // Ordner erstellen Tastatur-Kontext
                document.getElementById("createFolderFlyout").addEventListener("beforeshow", function () {
                    cloud.setKeystrokeContext({
                        context: "directoryCreateFolder",
                        actions: {
                            //Nicht nötig, da einziger Button im Flyout bereits durch Enter ausgelöst werden kann --> addEventListener dafür nötig
                            //folderCreateConfirm: cloud.pages.directoryView.createFolder,
                        }
                    });
                }, false);
                document.getElementById("createFolderFlyout").addEventListener("afterhide", function () { cloud.getPreviousKeystrokeContext(); }, false);
                document.getElementById("createFolder").addEventListener("click", this.createFolder, false);

                //Fokus wieder auf das oberste Element setzten, nachdem Appbar versteckt wurde
                appbar.addEventListener("afterhide", this.setListViewFocus);

                //MediaPlayer Control Events
                // Declare a variable that you will use as an instance of an object
                var mediaControls;

                // Assign the button object to mediaControls
                mediaControls = Windows.Media.MediaControl;

                // Add an event listener for the Play, Pause Play/Pause toggle button
                mediaControls.addEventListener("playpausetogglepressed", this.playpausetoggle, false);
                mediaControls.addEventListener("playpressed", this.playbutton, false);
                mediaControls.addEventListener("pausepressed", this.pausebutton, false);
				
				//Gesten Initialisierung
                //Ziel für die Gestensteuerung setzen
                this.setTarget("pdfPreview");
                
                //Flag für neue Geste
                newGesture = true;
				
                //Aktuallisisere die Appbar 6 Sekunden nach Abschluss der Initialisierung um auf getFunctionality zu warten
                //Try nötig, da bei schnellem Logout sonst die App Crasht
                setTimeout(function () { try { cloud.pages.directoryView.updateAppbar } catch (e) { } }, 6000)
            }

            

            ///////Allgemeine Initialisierung (für alle Kontexte)///////

            document.getElementById("changeToGridLayout").addEventListener("click", this.changeToGridLayout, false);
            document.getElementById("changeToListLayout").addEventListener("click", this.changeToListLayout, false);

            //Verhindern von Anzeigeflakern der Vorschau
            document.getElementById("previewHeader").style.visibility = 'hidden';
            document.getElementById("previewTag").style.visibility = 'hidden';
            //Der PreviewHeaderContainer existiert nicht mehr
            document.getElementById("previewHeaderContainer").style.visibility = 'hidden';
            document.getElementById("backButton").style.visibility = 'hidden';
            document.getElementById("forwardButton").style.visibility = 'hidden';

            //Verbergen des allgemeinen Ladebalkens
            document.getElementById("operationPending").style.visibility = 'hidden';

            //List-View initialisieren
            this.initListView();
            document.getElementById("directoryProgressRing").style.visibility = 'visible';
            directoryView.prototype.loadFolder();

            // Navigation vorbereiten und Button entfernen
            WinJS.Navigation.history.backStack = [];
            $("header[role=banner] .win-backbutton").attr("disabled", "disabled");

            //SortierButton Events
            document.getElementById("sortButton").addEventListener("click", this.showSortFlyout, false);
        },

        unload: function () {
            var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.removeEventListener("datarequested", this.dataRequested);

            if (cloud.context.isSavePicker) { //FileSavePicker
                cloud.context.pickerContext.removeEventListener("targetfilerequested", this.onTargetFileRequested, false);
            }
        },

        //Appcontext auf DirectoryView-Startcontext setzen
        setDirectoryViewContext: function () {
            cloud.setKeystrokeContext({
                context: "directoryStart",
                actions: {
                    home: cloud.pages.directoryView.goToHomePage,
                    logout: cloud.functions.logout,
                    account: cloud.functions.showAccountSettings,
                    navigateBack: cloud.pages.directoryView.navigateBackEvent,
                    navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                    clearSelection: cloud.pages.directoryView.clearSelection,
                    refresh: cloud.pages.directoryView.loadFolder,
                    sortByName: cloud.pages.directoryView.sortByName,
                    sortBySizeDesc: cloud.pages.directoryView.sortBySizeDesc,
                    displayDeleted: cloud.pages.directoryView.displayDeleted,
                    restoreFile: cloud.pages.directoryView.restoreFileButtonEvent,
                    showHistory: cloud.pages.directoryView.showHistory,
                    cameraUpload: cloud.pages.directoryView.cameraUpload,
                    upload: cloud.pages.directoryView.uploadLocalFile,
                    moveObject: cloud.pages.directoryView.moveObject,
                    openFile: cloud.pages.directoryView.openFileButtonEvent,
                    download: cloud.pages.directoryView.downloadAndSaveFileButtonEvent,
                    ocr: cloud.pages.directoryView.recognizeTextFromPicture,
                    rename: function () {
                        var listView = document.getElementById("directoryView").winControl;
                        if (listView.selection.count() == 1) {
                            document.getElementById('renameButtonAppbar').click();
                        }
                    },
                    share: cloud.pages.directoryView.openShareMenu,
                    showFileInfo: function () {
                        var listView = document.getElementById("directoryView").winControl;
                        if (listView.selection.count() == 1) {
                            var indices = listView.selection.getIndices();
                            if (listViewItems.getAt(indices[0]).fileType != "folder") {
                                document.getElementById('fileInfoButtonAppbar').click();
                            }
                        }
                    },
                    deleteFileButtonEvent: function () {
                        var listView = document.getElementById("directoryView").winControl;
                        if (listView.selection.count() == 1) {
                            document.getElementById('deleteFileButtonAppbar').click();
                        }
                    },
                    createFolder: function () { document.getElementById('addFolderButtonAppbar').click(); },
                    //createFolder: function () { document.getElementById('newFolderButton').click(); },
                }
            });
        },

        //Appcontext auf PDFContext setzen
        setPDFContext: function () {
            cloud.setKeystrokeContext({
                context: "pdf",
                actions: {
                    home: cloud.pages.directoryView.goToHomePage,
                    logout: cloud.functions.logout,
                    account: cloud.functions.showAccountSettings,
                    next: cloud.pages.directoryView.pdfNavNext,
                    back: cloud.pages.directoryView.pdfNavBack,
                    zoomIn: cloud.pages.directoryView.pdfZoomIn,
                    zoomOut: cloud.pages.directoryView.pdfZoomOut,
                    pageBtn: cloud.pages.directoryView.pdfGoToPage,
                    navigateBack: cloud.pages.directoryView.navigateBackEvent,
                    navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                    clearSelection: cloud.pages.directoryView.clearSelection,
                    refresh: cloud.pages.directoryView.loadFolder,
                    sortByName: cloud.pages.directoryView.sortByName,
                    sortBySizeDesc: cloud.pages.directoryView.sortBySizeDesc,
                    displayDeleted: cloud.pages.directoryView.displayDeleted,
                    restoreFile: cloud.pages.directoryView.restoreFileButtonEvent,
                    showHistory: cloud.pages.directoryView.showHistory,
                    cameraUpload: cloud.pages.directoryView.cameraUpload,
                    upload: cloud.pages.directoryView.uploadLocalFile,
                    moveObject: cloud.pages.directoryView.moveObject,
                    openFile: cloud.pages.directoryView.openFileButtonEvent,
                    download: cloud.pages.directoryView.downloadAndSaveFileButtonEvent,
                    ocr: cloud.pages.directoryView.recognizeTextFromPicture,
                    rename: function () {
                        var listView = document.getElementById("directoryView").winControl;
                        if (listView.selection.count() == 1) {
                            document.getElementById('renameButtonAppbar').click();
                        }
                    },
                    share: cloud.pages.directoryView.openShareMenu,
                    showFileInfo: function () {
                        var listView = document.getElementById("directoryView").winControl;
                        if (listView.selection.count() == 1) {
                            var indices = listView.selection.getIndices();
                            if (listViewItems.getAt(indices[0]).fileType != "folder") {
                                document.getElementById('fileInfoButtonAppbar').click();
                            }
                        }
                    },
                    deleteFileButtonEvent: function () {
                        var listView = document.getElementById("directoryView").winControl;
                        if (listView.selection.count() == 1) {
                            document.getElementById('deleteFileButtonAppbar').click();
                        }
                    },
                    createFolder: function () { document.getElementById('addFolderButtonAppbar').click(); },
                    //Buttons oben links
                    //createFolder: function () { document.getElementById('newFolderButton').click(); },
                }
            });
        },

        ///////AUDIO & VIDEO CONTROLLS///////
        // The event handler for the play/pause button
        playpausetoggle: function () {
            if (mediaControls.isPlaying === true) {
                document.getElementById("audiotag").pause();
                document.getElementById("videotag").pause();
            } else {
                document.getElementById("audiotag").play();
                document.getElementById("videotag").play();
            }
        },

        // The event handler for the pause button
        pausebutton: function () {
            document.getElementById("audiotag").pause();
            document.getElementById("videotag").pause();
        },

        // The event handler for the play button
        playbutton: function () {
            document.getElementById("audiotag").play();
            document.getElementById("videotag").play();
        },

        ///////AUDIO & VIDEO CONTROLLS ENDE///////

        //Teilen von Inhalten an andere Apps (Charmbar-Share-Button-Event)
        dataRequested: function (e) {
            //Lade Datei Temporär runter sofern diese noch nicht in der aktuellen Ansicht vorhanden ist
            //Durch das übergeben von request erkennt die downloadFileTemporary-Funktion, dass das request-Objekt genutzt werden soll um nach Abschluss des Downloads die Datei an die Charmbar weiter zu geben
            //Außerdem wird der Titel und die Beschreibung der geteilten Datei über das request-Objekt an die Charmbar übergeben
            directoryView.prototype.downloadFileTemporary(function () { }, function () { }, e.request);
        },

        /////// FILE SAVE PICKER STUFF ///////

        //Empfangen von Dateien aus anderen Apps indem diese App als Speicherort ausegwählt wird
        //http://msdn.microsoft.com/de-de/library/windows/apps/windows.storage.pickers.provider.targetfilerequestedeventargs
        onTargetFileRequested: function (e) {
            var deferral;
            //Warten bis unsere App eine leere Datei für die Quell-App bereitgestellt hat
            deferral = e.request.getDeferral();

            // Create a file to provide back to the Picker
            Windows.Storage.ApplicationData.current.localFolder.createFileAsync(cloud.context.pickerContext.fileName, Windows.Storage.CreationCollisionOption.replaceExisting).done(function (file) {

                // Assign the resulting file to the targetFile property and complete the deferral to indicate success
                e.request.targetFile = file;
                //Datei wurde bereitgestellt, Quellapp kann Datei nun beschreiben
                deferral.complete();

                //Warte darauf, dass Datei wirklich fertig bereitgestellt wurde und lade sie danach hoch
                directoryView.prototype.checkFileComplete(file);

            }, function () {
                // Display a dialog indicating to the user that a corrective action needs to occur
                cloud.functions.showMessageDialog("FILEOPENPICKERERROR", function () {
                    // Set the targetFile property to null and complete the deferral to indicate failure once the user has closed the
                    // dialog.  This will allow the user to take any neccessary corrective action and click the Save button once again.
                    e.request.targetFile = null;
                    deferral.complete();
                });
            });
        },

        //Prüfen ob Datei von der Quellapp komplett bereitgestellt wurde und Lade diese erst nach Abschluss hoch --> Leider teilt diese uns das nicht mit...
        //Problem war: Der FileSavePicker ist nicht darauf ausgelegt auf Dateien zu warten und danach noch was mit dieser Datei zu machen.
        //Der Picker geht normalerweise davon aus, dass sobald ein Speicherort in der App ausgewählt wurde (hier eine temporäre Datei unserer App)
        //die Operation abgeschlossen ist. Bei uns muss aber erst nach Abschluss der Bereitstellung von der Quellapp (z.B: mit vorherigem Download)
        //der Upload durchgeführt werden. Ohne diese Funktion würde eine leere Datei hochgeladen.
        checkFileComplete: function (file) {
            directoryView.prototype.sleep(2000);
            file.getBasicPropertiesAsync().then(
                function (basicProperties) {
                    if (basicProperties.size > 0) {
                        directoryView.prototype.uploadFile(cloud.getNavigationPathCurrent(), file, basicProperties.size, function () { }, function () { });
                    } else {
                        directoryView.prototype.checkFileComplete(file);
                    }
                },
                function () {
                    directoryView.prototype.checkFileComplete(file);
                });
        },

        //Ermöglicht Verzögerung bei Ready-Check im FileSavePicker
        sleep: function (millis) {
            var date = new Date();
            var curDate = null;

            do { curDate = new Date(); }
            while (curDate - date < millis);
        },

        ///////FILE SAVE PICKER STUFF ENDE///////



        ///////FILE OPEN PICKER STUFF/////// 
        //Selection-Changed Event --> Fürgt im FileOpenPicker Dateien zum Basket hinzu
        addFileToBasket: function () {
            var listView = document.getElementById("directoryView").winControl;
            if (listView.selection.count() == 1) {
                var indices = listView.selection.getIndices();
                var selectedItem = listViewItems.getAt(indices[0]);
                if (selectedItem.fileType != "folder" && !selectedItem.deleted) {
                    //Lade Datei temorär herunter
                    directoryView.prototype.downloadFileTemporary(
                        function (fileToAdd) {
                            // Programmatically add the file to the basket 
                            // Only supported FileTypes will work
                            var inBasket;
                            switch (cloud.context.pickerContext.addFile(selectedItem.path, fileToAdd)) {
                                case Windows.Storage.Pickers.Provider.AddFileResult.added:
                                    // notify user that the file was added to the basket
                                    WinJS.log && WinJS.log(SdkSample.fileAdded, "sample", "status");
                                    // Fallthrough is intentional here.
                                case Windows.Storage.Pickers.Provider.AddFileResult.alreadyAdded:
                                    // Optionally notify the user that the file is already in the basket
                                    inBasket = true;
                                    break;
                                case Windows.Storage.Pickers.Provider.AddFileResult.notAllowed:
                                    // Optionally notify the user that the file is not allowed in the basket
                                case Windows.Storage.Pickers.Provider.AddFileResult.unavailable:
                                    // Optionally notify the user that the basket is not currently available
                                default:
                                    inBasket = false;
                                    WinJS.log && WinJS.log(SdkSample.fileAddFailed, "sample", "status");
                                    break;
                            }
                        },
                        function (error) {
                            cloud.functions.showMessageDialog("FILEOPENPICKERDOWNLOADERROR");
                        });
                }
            }
        },

        ///////FILE OPEN PICKER STUFF ENDE/////// 

        /*#############################################       Layout ändern - Anfang         ##############################################*/

        //##################################################################################
        //UNUSED: Parallax Scrolling - Später implementieren
        attachParallax: function (listQuery) {
            var listViewDOM = document.querySelector(listQuery);
            var listView = listViewDOM.winControl;
            var backGroundHolder = document.querySelector("#body");
            document.querySelector(listQuery + " .win-viewport").addEventListener("scroll", function (e) {
                setImmediate(function () {
                    backGroundHolder.style["background-position-x"] =
                     -((listViewDOM.scrollLeft / listViewDOM.scrollWidth) *
                        listViewDOM.clientWidth * 0.2) + "px";
                });
            });
        },

        updateLayout: function (element, viewState, lastViewState) {
            var listView = element.querySelector("#directoryView").winControl;
            if (lastViewState !== viewState) {
                if (viewState === appViewState.snapped) {
                    //this.initializeLayout(listView, viewState);
                    directoryView.prototype.changeToListLayout();
                    document.getElementById("sectionWrap").style.height = 100 + "%";
                    document.getElementById("contentGrid").style.height = 100 + "%";
                    

                }
                else {
                    /*Wiederherstellen des letzten aktiven Layout in der
                    landscape- oder filled-Ansicht.*/
                    if (lastLayout == "GridLayout") {
                        cloud.pages.directoryView.currentLayout = "GridLayout";
                        directoryView.prototype.changeToGridLayout();
                    }

                    else {
                        cloud.pages.directoryView.currentLayout = "ListLayout";
                        directoryView.prototype.changeToListLayout();
                    }
                    document.getElementById("sectionWrap").style.height = "calc(100% - 100px)";
                    document.getElementById("contentGrid").style.height = "calc(100% - 30px)";
                }
            }

        },
        
        //Gridlayout für Verzeichnisansicht
        changeToGridLayout: function (eventInfo) {
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            var listView = document.getElementById("directoryView").winControl;
            listView.layout = new WinJS.UI.GridLayout;


            //In Session Daten Speichern
            var appData = Windows.Storage.ApplicationData.current;
            var roamingSettings = appData.roamingSettings;

            cloud.pages.directoryView.currentLayout = "GridLayout";
            roamingSettings.values["currentLayout"] = cloud.pages.directoryView.currentLayout;

            if (currentState != appViewState.snapped) {
                lastLayout = "GridLayout";
            }

            //Anpassen der Preview auf die neuen Maße
            directoryView.prototype.updatePreview();
            document.getElementById("changeToGridLayout").style.visibility = "hidden";
            document.getElementById("changeToListLayout").style.visibility = "visible";
        },

        //Listlayout für Verzeichnisansicht
        changeToListLayout: function (eventInfo) {
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            var listView = document.getElementById("directoryView").winControl;
            listView.layout = new WinJS.UI.ListLayout({
                horizontal: false
            });

            //In Session Daten Speichern
            var appData = Windows.Storage.ApplicationData.current;
            var roamingSettings = appData.roamingSettings;
            cloud.pages.directoryView.currentLayout = "ListLayout";
            roamingSettings.values["currentLayout"] = cloud.pages.directoryView.currentLayout;

            if (currentState != appViewState.snapped) {
                lastLayout = "ListLayout";
            }


            //Anpassen der Preview auf die neuen Maße
            directoryView.prototype.updatePreview();

            document.getElementById("changeToGridLayout").style.visibility = "visible";
            document.getElementById("changeToListLayout").style.visibility = "hidden";

           
        },
        /*#############################################       Layout ändern - ENDE         ##############################################*/


        //Initiiere die ListView
        initListView: function () {
            var listView = document.getElementById("directoryView").winControl;

            //Normaler File Browser Kontext
            if (!cloud.context.isOpenPicker && !cloud.context.isSavePicker && !cloud.context.fileMover.isFileMover && !cloud.context.isShareTarget) {
                // Event Handler registrieren
                listView.addEventListener("selectionchanged", directoryView.prototype.selectionChangedEvent);

                //Layout auswählen
                if (cloud.pages.directoryView.currentLayout == "GridLayout") {
                    directoryView.prototype.changeToGridLayout();

                    document.getElementById("changeToGridLayout").style.visibility = "hidden";
                    document.getElementById("changeToListLayout").style.visibility = "visible";

                } else if (cloud.pages.directoryView.currentLayout == "ListLayout") {
                    directoryView.prototype.changeToListLayout();

                    document.getElementById("changeToGridLayout").style.visibility = "visible";
                    document.getElementById("changeToListLayout").style.visibility = "hidden";
                }
            } else {
                //Nur Einzelselektion sofern es ein FilePicker ist & keine mehrfach Selektion erlauben
                listView.selectionMode = WinJS.UI.SelectionMode.single;
                listView.swipeBehavior = WinJS.UI.SwipeBehavior.none;

                if (cloud.context.isShareTarget) {
                    //Automatisch ListLayout im ShareTarget --> Schmale Ansicht
                    directoryView.prototype.changeToListLayout();
                } else if (cloud.context.isOpenPicker || cloud.context.isSavePicker || cloud.context.fileMover.isFileMover) {
                    //automatisch GridView wählen
                    directoryView.prototype.changeToGridLayout();

                    if (cloud.context.isOpenPicker) {
                        //Eigenes Selectionchanged Event beim Open Picker --> Datei Temporär herunterladen und in Basket packen
                        listView.addEventListener("selectionchanged", directoryView.prototype.addFileToBasket);
                    }
                }
            }
            //Navigationsevent registrieren
            listView.addEventListener("iteminvoked", directoryView.prototype.invokeDirectoryItem, false);
        },

        //Fokus standartmäßig auf das erste Element der ListView setzen
        setListViewFocus: function () {
            var listView = document.getElementById("directoryView").winControl;

            //Erstes Element der listView focussieren
            listView.currentItem = { index: 0, hasFocus: true, showFocus: true }
        },

        //Zeige gelöschte Dateien an
        displayDeleted: function () {
            if (cloud.hasFunctionality({ functionkey: "getDeletedFiles" })) {
                document.getElementById('appbar').winControl.hide();
                document.getElementById('navbar').winControl.hide();

                if (cloud.context.showDeletedFiles) {
                    cloud.context.showDeletedFiles = false;
                    /*Verzeichnis aktualisieren. Nachdem gelöschte Dateien ausgeblendet werden
                    gibt es ein Problem mit der Anzeige, welche zu diesem Zeitpunkt (in dem 
                    die gelöschten Dateien ausgeblendet werden) noch die Breite hat, wie in dem Zustand
                    wenn diese angezeigt werden.. Im Klartext gibt es also ansonsten rechts ne übelst große Lücke*/
                    directoryView.prototype.loadFolder();
                    document.getElementById("showDeletedButton").style.textShadow = "";


                } else {
                    cloud.context.showDeletedFiles = true;
                    document.getElementById("showDeletedButton").style.textShadow = "0 0 10px #fff";
                    
                }

                //Selektionen leeren
                cloud.pages.directoryView.selectedDirectoryContent = [];
                WinJS.Application.sessionState.selectedDirectoryContent = [];

                directoryView.prototype.loadFolder();
            }
        },

        //Lade den Inhalt des aktuell in der Back-Liste an erster Stelle stehenden Ordners
        loadFolder: function () {
            document.getElementById("directoryProgressRing").style.visibility = 'visible';
            //Entscheiden ob gelöschte angezeigt werden
            if (cloud.context.showDeletedFiles) {
                var showDeleted = "both";
            } else {
                var showDeleted = "onlyCurrent";
            }
            //Ordnerinhalt laden
            cloud.getDirectoryContent({
                path: cloud.getNavigationPathCurrent(),
                sortBy: cloud.pages.directoryView.currentSortType,
                deletedFiles: showDeleted
            },
                directoryView.prototype.reloadListView,
                function (error) {
                    if (error === "no such element") {
                        //Es gab einen Fehler bei der Navigation --> Zurücksetzten zum root Verzeichnis
                        cloud.resetNavigation();
                        directoryView.prototype.loadFolder();
                        cloud.functions.showMessageDialog("NOSUCHELEMENT");
                    }
                    document.getElementById("directoryProgressRing").style.visibility = 'hidden';
                    cloud.showError();
                });
        },

        //Update der ListView Inhalte abhängig vom aktuellen Verzeichnis
        reloadListView: function (directoryContent) {
            //Loading Indicator anzeigen
            document.getElementById("directoryProgressRing").style.visibility = 'visible';
            var listView = document.getElementById("directoryView").winControl;
            //Auslesen der Inhalte des aktuellen Ordners
            var items = [];

            var index = 0;

            if (directoryContent.length == 0) {
                //Zeige Nachricht im SPAN an wenn Verzeichnis leer ist
                $('#emptyDirectory').removeClass("invisible");
            } else {
                //Überführen der Verzeichnisinhalte in Listview
                $('#emptyDirectory').addClass("invisible");
                for (var i in directoryContent) {
                    //Wenn es ein Ordner ist
                    if (directoryContent[i].isDir) {
                        items[index] = {
                            title: directoryContent[i].fileName,
                            sizeText: "",
                            fileName: directoryContent[i].fileName,
                            path: directoryContent[i].path,
                            dirName: directoryContent[i].dirName,
                            fileType: "folder",
                            sizeNum: 0,
                            bNum: directoryContent[i].bNum,
                            picture: cloud.getFileIcon({ fileType: "folder" }),
                            hasTemporaryFile: false,
                            temporaryFile: null,
                            date: null,
                            deleted: directoryContent[i].deleted,
                            deletedId: directoryContent[i].deletedId,
                            deletedClass: directoryContent[i].deleted ? "directoryViewItem isDeleted" : "directoryViewItem",
                        };
                        index++;
                    }
                        //Andere Dateitypen
                        //Nur anzeigen wenn es nicht um eine reine Ordnerauswahl geht
                    else if (!cloud.context.isSavePicker && !cloud.context.isShareTarget && !cloud.context.fileMover.isFileMover) {
                        var supportedFileType = false;
                        if (cloud.context.isOpenPicker) {
                            //Wenn es ein FileOpenPicker ist, dürfen nur Dateien angezeigt werden, die von der Anfragenden App unterstützt werden
                            //http://msdn.microsoft.com/en-US/library/windows/apps/windows.storage.pickers.provider.fileopenpickerui.allowedfiletypes
                            if (cloud.context.pickerContext.allowedFileTypes[0] == "*") {
                                //Sofern alle Dateitypen zugelassen sind --> Alle anzeigen
                                supportedFileType = true;
                            } else {
                                //Ansonsten teste für jede Datei, ob diese in allowedFileTypes enthalten ist
                                for (var idx = 0; idx <= cloud.context.pickerContext.allowedFileTypes.size - 1; idx++) {
                                    //Wenn Dateityp unterstützt wird
                                    if (cloud.context.pickerContext.allowedFileTypes[idx] == directoryContent[i].fileType.toLowerCase()) {
                                        supportedFileType = true;
                                        break;
                                    } else if (cloud.context.pickerContext.allowedFileTypes[idx] == "*") {
                                        //Sofern "*" in allowedFileTypes, werden alle Dateitypen unterstützt
                                        supportedFileType = true;
                                        break;
                                    }
                                }
                            }
                            //Sonst ist es der normale DirectoryView Kontext und alle Dateitypen können angezeigt werden
                        } else {
                            supportedFileType = true;
                        }

                        if (supportedFileType) {
                            items[index] = {
                                title: directoryContent[i].fileName + directoryContent[i].fileType.toLowerCase(),
                                sizeText: directoryContent[i].bestText,
                                fileName: directoryContent[i].fileName,
                                path: directoryContent[i].path,
                                dirName: directoryContent[i].dirName,
                                fileType: directoryContent[i].fileType.toLowerCase(),
                                sizeNum: directoryContent[i].bestNum,
                                bNum: directoryContent[i].bNum,
                                picture: cloud.getFileIcon({ fileType: directoryContent[i].fileType.toLowerCase() }),
                                hasTemporaryFile: false,
                                temporaryFile: null,
                                date: directoryContent[i].date,
                                deleted: directoryContent[i].deleted,
                                deletedId: directoryContent[i].deletedId,
                                deletedClass: directoryContent[i].deleted ? "directoryViewItem isDeleted" : "directoryViewItem",
                            };
                            index++;
                        }
                    }
                }
            }

            //Übertragen der Title-Liste in ListView
            listViewItems = new WinJS.Binding.List(items);

            //ListView Listeninhalt übergeben
            listView.itemDataSource = listViewItems.dataSource;
            directoryView.prototype.setListViewFocus();
            //Selektion wiederherstellen (ggf. aus Session Selektionen übernommen) --> Löst updatePreview aus
            if (items.length > 0 && !cloud.context.isSavePicker && !cloud.context.isShareTarget && !cloud.context.fileMover.isFileMover) {
                if (cloud.pages.directoryView.selectedDirectoryContent != []) {
                    listView.selection.set(cloud.pages.directoryView.selectedDirectoryContent);
                }
            }

            //Seitentitel aktualisieren
            var title = document.getElementById("pagetitle");
            var path = cloud.helper.convertPath({ path: cloud.getNavigationPathCurrent(), isDir: true });
            //Wenn ein Ordner gewählt werden muss Überschrift zur Ordnerwahl ergänzen
            if (cloud.context.isSavePicker || cloud.context.fileMover.isFileMover) {
                title.innerText = cloud.translate("CHOOSEDIRECTORY") + path.fileName;
            } else if (cloud.context.isShareTarget) {
                title.innerText = cloud.shareOperation.data.properties.title + " hochladen";
            } else {
                title.innerText = path.fileName;
            }

            //Button anzeigen oder ausblenden (im Root ausblenden)
            if (!cloud.navigationHasPrevious()) {
                document.getElementById("backButton").style.visibility = 'hidden';
            } else {
                document.getElementById("backButton").style.visibility = 'visible';
            }

            //Vorwärtsbutton anzeigen
            if (!cloud.navigationHasNext()) {
                document.getElementById("forwardButton").style.visibility = 'hidden';
            } else {
                document.getElementById("forwardButton").style.visibility = 'visible';
            }

            //Appbar neu laden, da sonst in leeren Ordnern die Appbar immer noch für eine einzelne Ordner Selektion angezeigt wird
            if (!cloud.context.isSavePicker && !cloud.context.isShareTarget && !cloud.context.fileMover.isFileMover && !cloud.context.isOpenPicker) {
                directoryView.prototype.updateAppBar();
            }

            //Loading Indicator ausblenden
            document.getElementById("directoryProgressRing").style.visibility = 'hidden';
        },

        //Navigation
        //Linksklick auf Ordner öffnet diesen, ansonsten wurde eine Datei selektiert oder deselektiert --> Aktualisiere Preview
        invokeDirectoryItem: function (eventInfo) {
            var listView = document.getElementById("directoryView").winControl;
            var indices = listView.selection.getIndices();

            //Sofern etwas angeklickt wurde...
            if (listView.selection.count() == 1) {
                var selectedItem = listViewItems.getAt(indices[0]);
                //Ordner öffnen --> NAVIGIEREN
                if (selectedItem.fileType == "folder") {
                    cloud.navigationGotoPath({ path: selectedItem.path });

                    //Navigationslisten der Session aktuellisieren
                    WinJS.Application.sessionState.navigationListBackwards = cloud.getNavigationListBack();
                    WinJS.Application.sessionState.navigationListForwards = cloud.getNavigationListForward();

                    //Selektionen leeren
                    cloud.pages.directoryView.selectedDirectoryContent = [];
                    WinJS.Application.sessionState.selectedDirectoryContent = [];

                    //Navigieren zum Ordner -> reloadListView
                    directoryView.prototype.loadFolder();
                } else if (!selectedItem.deleted) { //Vorschau aktuallisieren sofern es keine gelöschte Datei ist
                    if (!cloud.context.isOpenPicker && !cloud.context.isSavePicker && !cloud.context.isShareTarget && !cloud.context.fileMover.isFileMover) {
                        directoryView.prototype.updatePreview();
                    }
                }
            }
        },

        //Selektion ändert sich sofer der Benutzer eine Datei selektiert oder einen Ordner zur Navigation auswählt
        selectionChangedEvent: function (eventInfo) {
            //TODO: Sofern es eine Navigation ist wird kurz ein Ordner Selektiert. Diese Selektion soll kein Update der Appbar auslösen!
            if (!cloud.context.isSavePicker && !cloud.context.isShareTarget && !cloud.context.fileMover.isFileMover) {
                directoryView.prototype.updateAppBar();

                //Speichern der Selektion in Sessiondaten
                var listView = document.getElementById("directoryView").winControl;
                var indices = listView.selection.getIndices();
                //Speichern der Auswahl in SessionDaten
                WinJS.Application.sessionState.selectedDirectoryContent = indices;
                cloud.pages.directoryView.selectedDirectoryContent = indices;
            }
        },

        //Fileinfos in Appbar aktualisieren
        updateFileInfo: function (selectedItem) {
            if (selectedItem.fileType != "folder" && !selectedItem.deleted) {
                document.getElementById("fileInfoName").innerText = selectedItem.title;
                document.getElementById("fileInfoPath").innerText = selectedItem.dirName;
                document.getElementById("fileInfoDateCreated").innerText = selectedItem.date;
                document.getElementById("fileInfoSize").innerText = selectedItem.sizeText;
            }
        },

        //Dateinamen in das Flyout der Appbar eintragen
        updateRenameField: function (selectedItem) {
            document.getElementById('renameInput').innerText = selectedItem.fileName;
        },

        //Dateivorschau aktualisieren --> Auslesen der Dateiinfos sofern eine Datei ausgewählt (gedownloaded) wurde
        updatePreview: function () {
            var listView = document.getElementById("directoryView").winControl;
            var previewHeader = document.getElementById("previewHeader");
            var previewTag = document.getElementById("previewTag");
            var previewHeaderContainer = document.getElementById("previewHeaderContainer");
            //document.getElementById("preview").style.width = "490px";
            

            //Wenn es kein Ordner ist --> Vorschau aktualisieren
            if (listView.selection.count() == 1) {
                var indices = listView.selection.getIndices();
                var selectedItem = listViewItems.getAt(indices[0]);
                //Vorschau bei Ordnern und gelöschten Dateien nicht vorgesehen
                if (selectedItem.fileType != "folder" && !selectedItem.deleted) {
                    //Prüfen ob Dateivorschau möglich ist
                    if (cloud.config && cloud.config.fileTypes && cloud.config.fileTypes[selectedItem.fileType.toLowerCase()]
                        && typeof cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType !== "undefined") {

                        //Wordpreview ohne Download
                        if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType == "word" && cloud.hasFunctionality({ functionkey: "hasPreviewDocx" })) {
                            cloud.functions.showNotification(cloud.translate("ATTENTION"), cloud.translate("NOIMAGEINWORD"), "/images/notifications/warning.png");
                            //Vorschau auf neue Anzeige vorbereiten
                            directoryView.prototype.preparePreview(selectedItem);

                            //HTML der Vorschau dynamisch einfügen
                            directoryView.prototype.setFilePreviewHTML(selectedItem, null);
                        //Sonstige Vorschauelemente
                        } else if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType != "word") {
                            //Datei temporär herunterladen, sofern diese in der aktuellen Ansicht noch nicht verfügbar ist
                            try{
                                directoryView.prototype.downloadFileTemporary(
                                function (targetFile) {
                                    //Sofern es keine leere Datei ist, die ohnehin nicht angezeigt werden kann
                                    //Tritt auf, wenn die Datei ohnehin leer ist oder wenn sie auf Grund eines falsch codierten Dateinamens nicht vollständig heruntergeladen werden kann
                                    targetFile.getBasicPropertiesAsync().then(
                                        function (basicProperties) {
                                            if (basicProperties.size > 0) {
                                                //Vorschau auf neue Anzeige vorbereiten
                                                directoryView.prototype.preparePreview(selectedItem);

                                                //HTML der Vorschau dynamisch einfügen
                                                directoryView.prototype.setFilePreviewHTML(selectedItem, targetFile);
                                            } else {
                                                cloud.functions.showMessageDialog("CORRUPTEDFILEERROR");
                                            }
                                        });
                                },
                                function () {
                                    return; //tue nix
                                    //Wenn es einen Fehler gab, soll einfach die alte Datei weiter angezeigt werden
                                    //Ansonsten einfach ausblenden
                                });
                            } catch (e) {
                                /* catch download of non-existent files */
                            }
                        }
                    }
                }
            }
        },

        //Preview auf neue Dateivorschau vorbereiten (Einblenden bzw. löschen des alten Previews)
        preparePreview: function (selectedItem) {
            document.getElementById("previewHeader").innerText = selectedItem.title;
            document.getElementById("previewHeader").style.visibility = 'visible';
            document.getElementById("previewTag").style.visibility = 'visible';
            document.getElementById("previewHeaderContainer").style.visibility = 'visible';

            document.getElementById("previewTag").innerHTML = "";
            document.getElementById("code").textContent = "";

            //EDITOR VERBERGEN
            if (cloud.pages.directoryView.editor) {
                // Löscht Editor falls vorhanden
                cloud.pages.directoryView.editor.toTextArea();
                //Geht das so?
                cloud.pages.directoryView.editor = null;
            }
        },

        protoTypeTimer: function (interval, calls, onend) {
            var count = 0;
            var payloadFunction = this;
            var startTime = new Date();
            var callbackFunction = function () {
                return payloadFunction(startTime, count);
            };
            var endFunction = function () {
                if (onend) {
                    onend(startTime, count, calls);
                }
            };
            var timerFunction = function () {
                count++;
                if (count < calls && callbackFunction() != false) {
                    window.setTimeout(timerFunction, interval);
                } else {
                    endFunction();
                }
            };
            timerFunction();
        },

        setFilePreviewHTML: function (selectedItem, targetFile) {
                var previewHTML = "";

                //App in den normalen Kontext zurück führen.
                this.setDirectoryViewContext();
                var currentState = Windows.UI.ViewManagement.ApplicationView.value;


                if (targetFile) {
                    var fileSrcBlob = URL.createObjectURL(targetFile, { oneTimeOnly: true });
                } //Sonst nicht benötigt --> Word-Preview        

                ////////PDF////////
                // Vorschau-Elemente löschen
                $('#pdfPreview > canvas').remove();
                $('#previewTag > canvas').remove();
            
            
                document.getElementById("code").style.maxWidth = "";
                document.getElementById("previewTag").style.width = "";
                document.getElementById("pdfPreview").style.width = "";

                $('#pdfPreview > img').remove();
                /*Falls word angezeigt wurd wird der Hintergrund wieder resettet*/
                if (document.getElementById("previewTag").style.backgroundColor !== "") {
                    document.getElementById("previewTag").style.backgroundColor = "";
                    document.getElementById("previewTag").style.padding = "";
                    document.getElementById("previewTag").style.overflowY = "";
                    document.getElementById("previewTag").style.backgroundImage = "";
                }
            
            

                //Steuerelemente verbergen
                //PDF Steuerelemente
                $(cloud.pages.directoryView.pdfBackButton).addClass("invisible");
                $(cloud.pages.directoryView.pdfNextButton).addClass("invisible");
                $(cloud.pages.directoryView.pdfGoToPageButton).addClass("invisible");
                $(cloud.pages.directoryView.pdfZoomOutButton).addClass("invisible");
                $(cloud.pages.directoryView.pdfZoomInButton).addClass("invisible");
                $(cloud.pages.directoryView.pdfPageNumDOM).addClass("invisible");

                document.getElementById("pdfControls").style.visibility = "hidden";
                document.getElementById("pdfPreview").style.visibility = "hidden";

                //PDF-Controls
                if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType == "reader") {
                    this.setPDFContext();
                    document.getElementById("pdfControls").style.display = "block";
                    document.getElementById("pdfPreview").style.display = "block";

                }
                else {
                    document.getElementById("pdfControls").style.display = "none";
                    document.getElementById("pdfPreview").style.display = "none";
                }

                //Bildervorschau
                if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType == "image") {
                    if (typeof cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].hasFileeeSupport !== "undefined"
                    && cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].hasFileeeSupport == true) {
                        if (cloud.hasFunctionality({ functionkey: "fileee" })) {
                            cloud.getFileeeContent({ path: selectedItem.path }, function (fileee) {
                           
                                if (currentState !== Windows.UI.ViewManagement.ApplicationViewState.snapped) {

                                    //Code auslesen
                                    if (fileee.content != "" && fileee.content != "null") {
                                        document.getElementById("code").textContent = fileee.content;
                                        document.getElementById("code").style.maxWidth = document.getElementById("contentGrid").clientWidth - 520 + "px";

                                        //Editor konfigurieren
                                        cloud.pages.directoryView.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
                                            mode: "",
                                            styleActiveLine: true,
                                            lineNumbers: true,
                                            lineWrapping: true,
                                            readOnly: true,
                                            theme: "monokai", //http://codemirror.net/demo/theme.html
                                        

                                        });
                                    }
                                }
                            }, function () { });
                        }
                    }

                    previewHTML = "<img id=\"displayImage\" src=" + fileSrcBlob + " />";
                

                    var tmpBild = $('<img id="displayImage" src="' + fileSrcBlob + '" />"');
                    var ratio;


                    if (cloud.pages.directoryView.currentLayout == "GridLayout" && currentState !== Windows.UI.ViewManagement.ApplicationViewState.snapped) {

                        //Die nachfolgende Konsolenausgabe bloß nicht löschen
                        // Ohne diese schafft es das Programm nicht die naturalWidth und naturalHeight
                        // in der nachfolgenden If-Abfrage zu berechnen. Das Problem tritt nur im Simulator auf

                        //Workaround #1
                        //console.log(tmpBild[0].width);

                        //Workaround #2 --> Better
                        var abbruch = false;
                        while (!abbruch) {

                            if (tmpBild[0].naturalWidth) {
                                abbruch = true;
                            }
                        }
                        this.setTarget("previewTag");

                        if (tmpBild[0].naturalHeight < tmpBild[0].naturalWidth) {
                            console.log(tmpBild[0].naturalWidth);
                            ratio = tmpBild[0].naturalWidth / tmpBild[0].naturalHeight;
                            //picture touch controle workarround: komplett neue 3 Zeilen
                            //document.getElementById("preview").style.maxWidth = document.getElementById("contentGrid").clientHeight * ratio + "px";
                            //document.getElementById("preview").style.maxHeight = document.getElementById("contentGrid").clientHeight + "px";
                            //document.getElementById("previewTag").style.maxHeight = document.getElementById("contentGrid").clientHeight + "px";
                            //picture touch controle workarround: MaxWidth wieder statt width
                            document.getElementById("previewTag").style.maxWidth = document.getElementById("contentGrid").clientHeight * ratio + "px";
                        }
                        else if (tmpBild[0].naturalHeight > tmpBild[0].naturalWidth) {

                            ratio = tmpBild[0].naturalWidth / tmpBild[0].naturalHeight;
                            //picture touch controle workarround: komplett neue 3 Zeilen
                            //document.getElementById("preview").style.maxWidth = document.getElementById("contentGrid").clientHeight * ratio + "px";
                            //document.getElementById("preview").style.maxHeight = document.getElementById("contentGrid").clientHeight + "px";
                            //document.getElementById("previewTag").style.maxHeight = document.getElementById("contentGrid").clientHeight + "px";
                            //picture touch controle workarround: MaxWidth wieder statt width
                            document.getElementById("previewTag").style.maxWidth = document.getElementById("contentGrid").clientHeight * ratio + "px";
                        }
                        else {

                            document.getElementById("previewTag").style.maxHeight = document.getElementById("contentGrid").clientHeight + "px";
                            //picture touch controle workarround: komplett neue 2 Zeilen
                            //document.getElementById("preview").style.maxWidth = document.getElementById("contentGrid").clientHeight + "px";
                            //document.getElementById("preview").style.maxHeight = document.getElementById("contentGrid").clientHeight + "px";
                            //picture touch controle workarround: MaxWidth wieder statt width
                            document.getElementById("previewTag").style.maxWidth = document.getElementById("contentGrid").clientHeight + "px";
                        }

                        //var ratio = tmpBild.naturalWidth/tmpBild.naturalHeight;
                        //document.getElementById("previewTag").style.width = tmpBild[0].naturalWidth + "px";
                    } else if (cloud.pages.directoryView.currentLayout == "ListLayout") {
                        if (currentState !== Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                            document.getElementById("previewTag").style.width = document.body.clientWidth - 490 + "px";
                        }
                    }

                    //Videovorschau
                } else if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType == "video") {
                    previewHTML = "<video id='video' controls=\"\" src=\"" + fileSrcBlob + "\" type=\"video/" + "></video>";

                    //Audio
                } else if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType == "audio") {
                    if (currentState !== Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                
                        previewHTML = "<audio class=\"audioplayer\" controls=\"controls\" src=\"" + fileSrcBlob + "\"></audio>";
                    }
                    //Codepreview
                } else if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType == "code") {

                    /*Da die Code-Anzeige in der Snapview keinen Sinn macht, wird dem Benutzer die Anzeige
                    asugegeben, dass er doch bitte in eine andere Ansicht wechseln solle*/
                    if (currentState !== Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                 
                        //Code auslesen
                        Windows.Storage.FileIO.readTextAsync(targetFile).then(function (contents) {
                            document.getElementById("code").textContent = contents;

                            //Editor konfigurieren
                            var codeType = cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].codeType;
                            cloud.pages.directoryView.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
                                mode: codeType,
                                styleActiveLine: true,
                                lineNumbers: true,
                                lineWrapping: true,
                                readOnly: true,
                                theme: "monokai", //http://codemirror.net/demo/theme.html

                            });
                        });
                    }
                    //PDF
                } else if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType == "reader") {
                    if (currentState !== Windows.UI.ViewManagement.ApplicationViewState.snapped) {

                        //PDF Steuerelemente anzeigen
                        $(cloud.pages.directoryView.pdfBackButton).removeClass("invisible");
                        $(cloud.pages.directoryView.pdfNextButton).removeClass("invisible");
                        $(cloud.pages.directoryView.pdfPageNumDOM).removeClass("invisible");
                        $(cloud.pages.directoryView.pdfZoomOutButton).removeClass("invisible");
                        $(cloud.pages.directoryView.pdfZoomInButton).removeClass("invisible");
                        $(cloud.pages.directoryView.pdfGoToPageButton).removeClass("invisible");
                        document.getElementById("pdfControls").style.visibility = "visible";
                        document.getElementById("pdfPreview").style.visibility = "visible";
                        document.getElementById("pdfPreview").style.maxHeight = document.getElementById("contentGrid").clientHeight;


                        //Erste Seite Rendern und anzeigen
                        cloud.functions.showPDF(targetFile);
                    }


                
                    //Word-Preview
                }
                else if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType == "word") {
                    if (cloud.hasFunctionality({ functionkey: "hasPreviewDocx" })) {
                        cloud.getFileFulltext(
                            {
                                path: selectedItem.path,
                                fileType: selectedItem.fileType
                            },
                        function (htmlText) {
                            if (currentState !== Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                         
                                //success
                                document.getElementById("previewTag").innerHTML = toStaticHTML(htmlText);
                                document.getElementById("previewTag").style.backgroundColor = "#272822";
                                document.getElementById("previewTag").style.color = "white";
                                document.getElementById("previewTag").style.overflowY = "auto";
                                document.getElementById("previewTag").style.padding = "20px";
                                //document.getElementById("previewTag").style.boxShadow = "0px 1px 3px black";
                           
                                document.getElementById("previewTag").style.maxWidth = document.body.clientWidth - 500 + "px";
                                document.getElementById("previewTag").style.maxHeight = document.getElementById("contentGrid").clientHeight + "px";
                            

                            }
                        },
                        function () {
                            //error
                            console.log("ERROR");
                        });
                    }
                }

                if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType == "reader") {
                    if (currentState !== Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                        document.getElementById("pdfPreview").innerHTML = toStaticHTML(previewHTML);
                    }
                    else {
                   
                    }
                }
                else {
                    document.getElementById("previewTag").innerHTML = toStaticHTML(previewHTML);
                }

                //while (document.getElementById("canvas").clientHeight < document.getElementById("contentGrid").clientHeight) {
                //    cloud.pages.directoryView.pdfCurrentZoom += 0.1;

                //}


                /*#######################             Video - Anfang         #############################*/
                // Nachträglich videocontainer skalieren
                if ($('#previewTag video').size() > 0) {
                    $('#previewTag video').bind("loadedmetadata", function () {
                        var width = this.videoWidth;
                        var height = this.videoHeight;

                        if (cloud.pages.directoryView.currentLayout == "GridLayout") {
                            if (height < width) {
                                ratio = width / height;
                                document.getElementById("video").style.maxWidth = document.getElementById("contentGrid").clientHeight * ratio + "px";

                            }
                            else if (height > width) {
                                ratio = width / height;
                                document.getElementById("video").style.maxWidth = document.getElementById("contentGrid").clientHeight * ratio + "px";

                            }
                            else {
                                document.getElementById("video").style.maxHeight = document.getElementById("contentGrid").clientHeight
                                document.getElementById("video").style.maxWidth = document.getElementById("contentGrid").clientHeight
                            }
                            //var ratio = tmpBild.naturalWidth/tmpBild.naturalHeight;
                            //document.getElementById("previewTag").style.width = tmpBild[0].naturalWidth + "px";
                        } else if (cloud.pages.directoryView.currentLayout == "ListLayout") {

                            if (currentState !== Windows.UI.ViewManagement.ApplicationViewState.snapped) {

                                document.getElementById("video").style.maxWidth = document.body.clientWidth - 475 + "px";
                                document.getElementById("video").style.maxHeight = document.getElementById("contentGrid").clientHeight - 130 + "px";
                            }
                        }


                        /*#######################             Video - Ende         #############################*/
                    });

                }    
                // Scrollen zur Vorschau
                if (Windows.Storage.ApplicationData.current.roamingSettings.values["autoScroll"] && cloud.pages.directoryView.currentLayout == "GridLayout") {
                    $.scrollTo(0);
                    setTimeout("$('#sectionWrap').scrollTo($('#previewTag'), 800, { axis: 'x' })", 200);
                }
            
        },


        //Appbar Funktionen abhängig von Selektion ein und ausblenden
        updateAppBar: function () {
            var appBarDiv = document.getElementById("appbar");
            var appbar = document.getElementById('appbar').winControl;
            var listView = document.getElementById("directoryView").winControl;
            var count = listView.selection.count();

            directoryView.prototype.showGeneralAppbar(appbar, appBarDiv);
            appbar.hideCommands(appBarDiv.querySelectorAll('.restore'));
            appbar.hideCommands(appBarDiv.querySelectorAll('.singleSelectNoFolder'));
            appbar.hideCommands(appBarDiv.querySelectorAll('.manage'));
            appbar.hideCommands(appBarDiv.querySelectorAll('.multiSelect'));
            $('#clearSelectionButton').addClass("invisible");
            appbar.hideCommands(appBarDiv.querySelectorAll('.download'));
            document.getElementById("moveHR").winControl.hidden = true;
            document.getElementById("moveFileButton").winControl.hidden = true;
            document.getElementById("renameButtonAppbar").winControl.hidden = true;
            document.getElementById("renameHR").winControl.hidden = true;
            document.getElementById("deleteHR").winControl.hidden = true;
            document.getElementById("deleteFileButtonAppbar").winControl.hidden = true;
            document.getElementById("shareButtonAppbar").winControl.hidden = true;
            document.getElementById("shareHR").winControl.hidden = true;
            document.getElementById("historyButton").winControl.hidden = true;
            document.getElementById("historyHR").winControl.hidden = true;
            document.getElementById("ocrButton").winControl.hidden = true;
            appbar.hideCommands(appBarDiv.querySelectorAll('.fileCopied'));

            //Nur ein Element ausgewält
            if (count == 1) {
                var indices = listView.selection.getIndices();
                var selectedItem = listViewItems.getAt(indices[0]);

                //Allgemein bei Selektion
                $('#clearSelectionButton').removeClass("invisible");
                appbar.hideCommands(appBarDiv.querySelectorAll('.multiSelect'));

                //Gelöschte Datei
                if (selectedItem.deleted) {
                    appbar.showCommands(appBarDiv.querySelectorAll('.restore'));
                } else {
                    //Verberge Umbenennebutton wenn es der "Shared" Ordner ist, oder es sich um Elemente im Shared Ordner handelt (können nicht unbenannt werden)
                    if (selectedItem.path != "/Shared" && selectedItem.path.indexOf("/Shared") == -1) {
                        document.getElementById("renameButtonAppbar").winControl.hidden = false;
                        document.getElementById("renameHR").winControl.hidden = false;
                    }

                    //Spezifisch für bestimmte Dateitypen
                    if (selectedItem.fileType == "folder") {

                        //Sofern es der Ordner nicht der Ordner "Shared" ist, kann der Ordner verschoben, gelöscht oder geteilt werden
                        if (selectedItem.path != "/Shared") {
                            appbar.showCommands(appBarDiv.querySelectorAll('.manage'));
                            document.getElementById("moveHR").winControl.hidden = false;
                            document.getElementById("moveFileButton").winControl.hidden = false;
                            document.getElementById("deleteHR").winControl.hidden = false;
                            document.getElementById("deleteFileButtonAppbar").winControl.hidden = false;

                            //Dateifreigabe
                            if (cloud.hasFunctionality({ functionkey: "getPublicLink" }) || cloud.hasFunctionality({ functionkey: "shareFile" })) {
                                document.getElementById("shareButtonAppbar").winControl.hidden = false;
                                document.getElementById("shareHR").winControl.hidden = false;
                            }
                        }
                    } else { //Alle anderen Dateitypen
                        //Andere Elemente können immer verschoben und meist auch geteilt werden
                        appbar.showCommands(appBarDiv.querySelectorAll('.manage'));
                        appbar.showCommands(appBarDiv.querySelectorAll('.singleSelectNoFolder'));
                        appbar.showCommands(appBarDiv.querySelectorAll('.download'));
                        document.getElementById("moveHR").winControl.hidden = false;
                        document.getElementById("moveFileButton").winControl.hidden = false;
                        document.getElementById("deleteHR").winControl.hidden = false;
                        document.getElementById("deleteFileButtonAppbar").winControl.hidden = false;

                        //Dateifreigabe
                        if (cloud.hasFunctionality({ functionkey: "getPublicLink" }) || cloud.hasFunctionality({ functionkey: "shareFile" })) {
                            document.getElementById("shareButtonAppbar").winControl.hidden = false;
                            document.getElementById("shareHR").winControl.hidden = false;
                        }

                        if (cloud.config && cloud.config.fileTypes && cloud.config.fileTypes[selectedItem.fileType.toLowerCase()]
                        && typeof cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].hasFileeeSupport !== "undefined"
                        && cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].hasFileeeSupport == true) {
                            if (cloud.hasFunctionality({ functionkey: "fileee" })) {
                                document.getElementById("ocrButton").winControl.hidden = false;
                            }
                        }

                        //Dateihistorie
                        if (cloud.hasFunctionality({ functionkey: "getFileHistory" })) {
                            document.getElementById("historyButton").winControl.hidden = false;
                            document.getElementById("historyHR").winControl.hidden = false;
                        }
                    }

                    //Flyouts der Appbar anpassen
                    directoryView.prototype.updateFileInfo(selectedItem);
                    directoryView.prototype.updateRenameField(selectedItem);
                }

                appbar.sticky = true;
                appbar.show();

                //Mehrere Dateien selektiert
            } else if (count > 1) {
                //Prüfe ob gemischt gelöschte und nicht gelöschte Dateien gewählt wurden
                var selectedDeletedFile = false;
                var selectedNormalFile = false;
                if (cloud.context.showDeletedFiles) {
                    var indices = listView.selection.getIndices();
                    for (var i = 0; i < listView.selection.count() ; i++) {

                        var selectedItem = listViewItems.getAt(indices[i]);
                        if (selectedItem.deleted) {
                            selectedDeletedFile = true;
                        } else {
                            selectedNormalFile = true;
                        }
                    }
                } else {
                    //Multiselekt für normalen Kontext ohne gelöschte Dateien
                    selectedNormalFile = true;
                }

                //Allgemeine Appbar Einstellungen --> auch gemixt
                $('#clearSelectionButton').removeClass("invisible");
                document.getElementById("moveHR").winControl.hidden = false;
                document.getElementById("moveFileButton").winControl.hidden = false;

                if (selectedDeletedFile && !selectedNormalFile) {
                    //Nur gelöschte Dateien gewählt
                    appbar.showCommands(appBarDiv.querySelectorAll('.restore'));
                } else if (!selectedDeletedFile && selectedNormalFile) {
                    //Nur nicht gelöschte Dateien gewählt
                    appbar.showCommands(appBarDiv.querySelectorAll('.manage'));
                    appbar.showCommands(appBarDiv.querySelectorAll('.multiSelect'));
                    appbar.showCommands(appBarDiv.querySelectorAll('.download'));
                    document.getElementById("deleteHR").winControl.hidden = false;
                    document.getElementById("deleteFileButtonAppbar").winControl.hidden = false;
                }

                appbar.sticky = true;
                appbar.show();

                //Keine Selektion
            } else {
                // Verbergen aller Selektionsrelevanter AppBar Buttons
                appbar.hide();
                appbar.sticky = false;
            }
        },

        //Allgemeine / globale Buttons einglenden
        showGeneralAppbar: function (appbar, appBarDiv) {
            var cloudCanRestore = cloud.hasFunctionality({ functionkey: "getDeletedFiles" });

            //Sofern Cloud wiederherstellen kann anzeigen, sonst nicht
            if (cloudCanRestore) {
                appbar.showCommands(appBarDiv.querySelectorAll('.showDeleted'));

            } else {
                appbar.hideCommands(appBarDiv.querySelectorAll('.showDeleted'));
            }
            appbar.showCommands(appBarDiv.querySelectorAll('.general'));
        },

        //Beim Zurücknavigieren wird der Verzeichnisstack um das letzte Element erleichtert
        navigateBackEvent: function (eventInfo) {
            if (cloud.navigationHasPrevious()) {
                cloud.navigationGotoPrevious();

                //Selektion leeren
                cloud.pages.directoryView.selectedDirectoryContent = [];
                WinJS.Application.sessionState.selectedDirectoryContent = [];

                //Verzeichnis laden
                directoryView.prototype.loadFolder();

                //Session Speichern
                WinJS.Application.sessionState.navigationListBackwards = cloud.getNavigationListBack();
                WinJS.Application.sessionState.navigationListForwards = cloud.getNavigationListForward();
            }
        },

        //Beim Vornavigieren wird der Verzeichnisstack um ein Element erweitert
        navigateForwardEvent: function (eventInfo) {
            if (cloud.navigationHasNext()) {
                cloud.navigationGotoNext();

                //Selektion leeren
                cloud.pages.directoryView.selectedDirectoryContent = [];
                WinJS.Application.sessionState.selectedDirectoryContent = [];

                //Verzeichnis laden
                directoryView.prototype.loadFolder();

                //Session Speichern
                WinJS.Application.sessionState.navigationListBackwards = cloud.getNavigationListBack();
                WinJS.Application.sessionState.navigationListForwards = cloud.getNavigationListForward();
            }
        },

        //Zum Root-Verzeichnis navigieren
        goToHomePage: function (eventInfo) {
            //Nur navigieren sofern man nicht bereits im Hauptverzeichnis ist
            if (cloud.getNavigationPathCurrent() != "/") {
                cloud.navigationGotoPath({ path: "/" });
                directoryView.prototype.loadFolder();
            }
        },

        //Sortieren der Verzeichnisinhalte
        sortByName: function () {
            cloud.pages.directoryView.sortByFlex({ sortBy: "name" });
        },
        sortBySizeDesc: function () {
            cloud.pages.directoryView.sortByFlex({ sortBy: "sizeDesc" });
        },
        sortByFlex: function (obj) {
            //Sortierung Speichern
            cloud.pages.directoryView.currentSortType = obj.sortBy;
            WinJS.Application.sessionState.currentSortType = cloud.pages.directoryView.currentSortType;

            //Verzeichnis Laden
            cloud.pages.directoryView.loadFolder();

            //Appbar verbergen sofern Sortieren darüber ausgelöst wurde
            document.getElementById("appbar").winControl.hide();
            document.getElementById("navbar").winControl.hide();
        },

        //Aktuelle Auswahl aufheben
        clearSelection: function () {
            var listView = document.getElementById("directoryView").winControl;
            listView.selection.set([]);
            cloud.pages.directoryView.selectedDirectoryContent = [];
            WinJS.Application.sessionState.selectedDirectoryContent = [];
        },

        //Datei zu Path hochladen. Sofern file übergeben wird, wird dieses direkt hochgeladen, ansonsten kann der Benutzer eine Datei über den filePicker von einer anderen Datenquelle auswählen
        uploadFile: function (path, file, fileSize, successCallback, errorCallback) {
            document.getElementById("operationPending").style.visibility = 'visible';

            cloud.uploadFile(
                {
                    targetPath: path,
                    fileSize: fileSize,
                    file: file // ggf. bereits Vorhandene Datei (z.B. Bild/Video von Kamera oder aus shareTarget)
                },
                function (uploadedFile, isLast) {
                    if (isLast) {
                        document.getElementById("operationPending").style.visibility = 'hidden';
                        if (!deleteError) {
                            cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("UPLOADCOMPLETED"), "/images/notifications/success.png");
                        } else {
                            cloud.functions.showMessageDialog("UPLOADINTERRUPTED");
                        }
                        uploadError = false;

                        //Lade die Anzeige nach Abschluss des Uploads neu, sofern der Benutzer im Uploadverzeichnis ist
                        if (!cloud.isShareTarget && !cloud.isSavePicker) {
                            //Sofern eine Datei wiederhergestellt wird, die gerade angezeigt wird:
                            //Vorschau ggf. aktualisieren
                            if (document.getElementById("previewHeader").innerText == uploadedFile) {
                                document.getElementById("previewHeader").innerText = "";
                                document.getElementById("previewHeader").style.visibility = 'hidden';
                                document.getElementById("previewTag").style.visibility = 'hidden';
                                document.getElementById("previewHeaderContainer").style.visibility = 'hidden';

                                //EDITOR VERBERGEN --> Gab noch Error, benötigt fix
                                /*if (cloud.pages.directoryView.editor) {
                                    // Löscht Editor falls vorhanden
                                    cloud.pages.directoryView.editor.toTextArea();
                                    //Geht das so?
                                    cloud.pages.directoryView.editor = null;
                                }*/
                            }

                            if (path == cloud.getNavigationPathCurrent()) {
                                //Selektionen leeren
                                cloud.pages.directoryView.selectedDirectoryContent = [];
                                WinJS.Application.sessionState.selectedDirectoryContent = [];
                                //Verzeichnis neu laden
                                directoryView.prototype.loadFolder();
                            }
                        }
                        successCallback();
                    }
                    return;
                },
                function (isLast) {
                    if (isLast) {
                        cloud.functions.showMessageDialog("UPLOADINTERRUPTED");
                        document.getElementById("operationPending").style.visibility = 'hidden';
                        directoryView.prototype.loadFileError();
                        uploadError = false;
                        errorCallback();
                    } else {
                        uploadError = true;
                    }
                });
        },

        //Bild oder Video mit Kamera aufnehmen und hochladen
        cameraUpload: function () {
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
                !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
                // Fail silently if we can't unsnap
                return;
            }

            //KameraGUI öffnen
            var captureUI = new Windows.Media.Capture.CameraCaptureUI();
            captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photoOrVideo).then(function (capturedItem) {
                //Sofern der Benutzer ein Bild gemacht hat
                if (capturedItem) {
                    console.log("User captured a photo or video.");
                    var path = cloud.getNavigationPathCurrent();
                    directoryView.prototype.uploadFile(path, capturedItem, null, function () {/*success*/}, function () {/*error*/});
                } else {
                    console.log("User didn't capture a photo or video.");
                }
            });

        },

        //Lokale Datei aus Datenquelle auswählen und hochladen
        uploadLocalFile: function () {
            // Verify that we are currently not snapped, or that we can unsnap to open the picker
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
                !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
                // Fail silently if we can't unsnap
                return;
            }
            var path = cloud.getNavigationPathCurrent();
            directoryView.prototype.uploadFile(path, null, null, function () { }, function () { });
        },

        //Upload aller an die App geteilten Dateien
        //Sharm Bar Share Funktion
        uploadSharedFile: function () {
            var appbar = document.getElementById("appbar").winControl;
            appbar.disabled = true;

            //System darüber zu informieren, dass App noch ausgeführt wird --> Benutzer kann die UI der App verlassen und mit der vorherigen Tätigkeit fortfahren
            //Nach dem Aufruf von reportStarted sollte die App keine Benutzerinteraktion mehr verlangen.
            cloud.shareOperation.reportStarted();
            //Bericht, dass App Daten erhalten hat --> Quellapp kann ggf. beendet werden
            if (cloud.shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems)) {
                cloud.shareOperation.data.getStorageItemsAsync().then(function (storageItems) {
                    for (var i = 0; i < storageItems.size; i++) {
                        //Jede Datei hochladen
                        directoryView.prototype.uploadFile(cloud.getNavigationPathCurrent(), storageItems.getAt(i), null, function () { cloud.shareOperation.reportCompleted(); }, function () { cloud.shareOperation.reportError(cloud.translate("UPLOADINTERRUPTED")); });
                    }
                });
            }
        },

        loadFileError: function (error) {
            console.log("Error.");
        },

        //Datei Temporär Downloaden (Für Preview oder Teilen an andere App=
        //shareRequest enthält ggf. das request Element des Charmbar-Share Events
        downloadFileTemporary: function (successCallback, errorCallback, shareRequest) {
            var listView = document.getElementById("directoryView").winControl;
            //Sofern etwas angeklickt wurde...
            if (listView.selection.count() == 1) {
                var indices = listView.selection.getIndices();
                var selectedItem = listViewItems.getAt(indices[0]);
                //Ordner und gelöschte Dateien können nicht direkt runtergeladen werden
                if (selectedItem.fileType != "folder" && !selectedItem.deleted) {

                    //////////////TEILEN AN ANDERE TEIL1 APP//////////////
                    //Sofern die Datei vom Share-Charm-Bar-Element angefordert wurde
                    var deferral;
                    if (shareRequest) {
                        // Title is required
                        var dataPackageTitle = selectedItem.title;
                        if ((typeof dataPackageTitle === "string") && (dataPackageTitle !== "")) {

                            shareRequest.data.properties.title = dataPackageTitle;

                            //The description is optional.
                            var dataPackageDescription = cloud.translate("CHOOSEAPP");
                            if ((typeof dataPackageDescription === "string") && (dataPackageDescription !== "")) {
                                shareRequest.data.properties.description = dataPackageDescription;
                            }

                            deferral = shareRequest.getDeferral();
                        } else {
                            //Titel muss gegeben sein, sonst Fehler!
                            shareRequest.failWithDisplayText(SdkSample.missingTitleError);
                        }
                    }

                    //////////////TEILEN AN ANDERE APP TEIL1 ENDE//////////////

                    //Wenn Datei in aktueller Ansicht nicht temporär vorhanden ist
                    //Datei temporär herunterladen
                    if (!selectedItem.hasTemporaryFile) {
                        var applicationData = Windows.Storage.ApplicationData.current;
                        var temporaryFolder = applicationData.temporaryFolder;
                        //Temporäre Datei anlegen
                        temporaryFolder.createFileAsync(selectedItem.title, Windows.Storage.CreationCollisionOption.replaceExisting)
                            .then(function (targetFile) {

                                //Download File
                                var param = [];
                                param[0] = cloud.helper.convertPath({ path: selectedItem.path });
                                param[0].fileSize = selectedItem.sizeNum;
                                if (shareRequest) {
                                    param[0].type = "share";
                                } else {
                                    param[0].type = "preview";
                                }
                                param[0].targetFile = targetFile;

                                document.getElementById("operationPending").style.visibility = 'visible';
                                cloud.downloadFile(param,
                                    function () {
                                        /* success */
                                        //Gedownloadete Datei an ListView anhängen --> Anzeige in Vorschau erleichtern und Download ersparen
                                        selectedItem.hasTemporaryFile = true;
                                        selectedItem.temporaryFile = targetFile;


                                        // Show Thumbnail for downloaded pictures
                                        if (appconfig.fileTypes && appconfig.fileTypes[selectedItem.fileType] && appconfig.fileTypes[selectedItem.fileType].previewType == "image") {
                                            var blob = URL.createObjectURL(targetFile, { oneTimeOnly: true });
                                            selectedItem.picture = blob;
                                            listView.forceLayout();
                                        }

                                        //cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("DOWNLOADCOMPLETED"), "/images/notifications/success.png");
                                        document.getElementById("operationPending").style.visibility = 'hidden';

                                        //////////////TEILEN AN ANDERE TEIL2 APP//////////////
                                        if (shareRequest) {
                                            shareRequest.data.setStorageItems([targetFile]);
                                            deferral.complete();
                                        }
                                        //////////////TEILEN AN ANDERE TEIL2 APP ENDE//////////////

                                        successCallback(targetFile);
                                    }, function (e) {
                                        /* error */
                                        if (e == "DOWNLOADFOLDER") {
                                            cloud.functions.showMessageDialog("DOWNLOADFOLDER");
                                            document.getElementById("operationPending").style.visibility = 'hidden';
                                        } else if (e && e.description && e.description == "Canceled") {
                                            // The preview download was canceled, do nothing
                                            //Pending-Anzeige nicht ausblenden, da diese aktuell eh wieder angezeigt wird, da Download nur durch neuen Download unterbrochen wird --> Verhindert so Crash der App beim Logout während eines aktiven Transfers
                                        } else {
                                            cloud.functions.showMessageDialog("DOWNLOADINTERRUPTED");
                                            document.getElementById("operationPending").style.visibility = 'hidden';
                                        }

                                        //////////////TEILEN AN ANDERE TEIL3 APP//////////////
                                        if (shareRequest) {
                                            deferral.complete();
                                        }
                                        //////////////TEILEN AN ANDERE TEIL3 APP ENDE//////////////

                                        errorCallback(targetFile);
                                    });
                            }).done(function () {
                            });
                    } else { //Bereits vorhandene Temp Datei öffnen
                        var targetFile = selectedItem.temporaryFile;

                        //////////////TEILEN AN ANDERE TEIL4 APP//////////////
                        if (shareRequest) {
                            shareRequest.data.setStorageItems([targetFile]);
                            deferral.complete();
                        }
                        //////////////TEILEN AN ANDERE TEIL4 APP ENDE//////////////

                        successCallback(targetFile);
                    }
                } else {
                    //ORDNER SELEKTIERT --> Nicht sinnvoll ohne ZIP-Download von Ordnern
                    //ODER GELÖSCHTE DATEI
                }
            } else {
                //mehrere Dateien --> kein Termporärer Download angedacht
            }
        },

        //Wenn nötig temporären Download durchführen und Datei öffnen
        openFileButtonEvent: function () {
            var listView = document.getElementById("directoryView").winControl;
            //Sofern etwas angeklickt wurde...
            if (listView.selection.count() == 1) {
                //Wenn Datei in aktueller Ansicht nicht temporär vorhanden ist
                //Datei wenn nicht bereits vorhanden temporär herunterladen
                directoryView.prototype.downloadFileTemporary(
                    function (targetFile) {
                        //Datei in externem Viewer öffnen
                        cloud.functions.openFileFromSystem(targetFile);
                    },
                    function () {
                        return;
                    });
            }
        },

        //Eine oder mehrere Dateien herunterladen und im durch dem FilePicker gewählten Ort speichern --> Nicht unterstützte Selektionen werden hier aussortiert
        downloadAndSaveFileButtonEvent: function () {
            // Verify that we are currently not snapped, or that we can unsnap to open the picker
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
                !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
                // Fail silently if we can't unsnap
                return;
            }

            var listView = document.getElementById("directoryView").winControl;

            //Prüfen ob eine oder mehrere Dateien selektiert wurden
            if (listView.selection.count() >= 1) {
                var indices = listView.selection.getIndices();
                //App-Bar verbergen
                document.getElementById('appbar').winControl.hide();
                document.getElementById('navbar').winControl.hide();

                //Für Fehlermeldung
                var containsFolderOrDeleted  = false;

                //Parameter vorbereiten
                var param = [];
                var idx = 0
                for (var i = 0; i < listView.selection.count() ; i++) {
                    var selectedItem = listViewItems.getAt(indices[i]);
                    if (selectedItem.fileType != "folder" && !selectedItem.deleted) {
                        //Pro Datei: Pfad und Dateigröße --> Bereits über ListView bekannt
                        param[idx] = cloud.helper.convertPath({ path: selectedItem.path });
                        param[idx].fileSize = selectedItem.sizeNum;
                        idx++;
                    } else if (selectedItem.fileType == "folder") {
                        containsFolderOrDeleted = true;
                    } else if (selectedItem.deleted) {
                        containsFolderOrDeleted = true;
                    }
                }

                //Sofern gelöschte oder Ordner selektiert waren --> Benutzer darüber benachrichtigen, dass dies nicht geht.
                if (containsFolderOrDeleted) {
                    //Zeige Fehlermeldung an und führen Download danach durch
                    cloud.functions.showMessageDialog("DOWNLOADFOLDERORDELETEDERROR", function () { directoryView.prototype.downloadAndSaveFile(param) });
                } else {
                    //Führe Download durch
                    directoryView.prototype.downloadAndSaveFile(param);
                }
            }
        },

        //Download durchführen --> Nicht unterstützte Selektionen durch Buttonevent ignoriert
        downloadAndSaveFile: function(param) {
            //Nicht nur ein Ordner ausgewählt
            if (param.length > 0) {
                document.getElementById("operationPending").style.visibility = 'visible';

                //Dateien herunterladen
                cloud.downloadFile(param,
                    function (isLast) {
                        /* success */
                        if (isLast) {
                            if (!downloadError) {
                                cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("DOWNLOADCOMPLETED"), "/images/notifications/success.png");
                            } else {
                                cloud.functions.showMessageDialog("DOWNLOADINTERRUPTED");
                            }
                            document.getElementById("operationPending").style.visibility = 'hidden';
                            downloadError = false;
                        }
                        return;
                    }, function (error, isLast) {
                        /* error */
                        if (isLast) {
                            cloud.functions.showMessageDialog("DOWNLOADINTERRUPTED");
                            document.getElementById("operationPending").style.visibility = 'hidden';
                            downloadError = false;
                        } else {
                            downloadError = true;
                        }
                        return;
                    });
            } else {
                //ORDNER SELEKTIERT --> Nicht sinnvoll ohne ZIP-Download von Ordnern
            }
        },
        
        //Ausgewählte gelöschte Dateien nacheinander wiederherstellen (Schleife)
        restoreFileButtonEvent: function () {
            var listView = document.getElementById("directoryView").winControl;
            if (listView.selection.count() >= 1 && cloud.context.showDeletedFiles) {
                var isLast = false;
                var indices = listView.selection.getIndices();

                //Appbar nach Klick ausblenden
                document.getElementById('appbar').winControl.hide();
                document.getElementById('navbar').winControl.hide();

                //Speichern des Uploadverzeichnisses um das aktuelle Verzeichnis neu zu laden sofern der Benutzer sich noch in diesem befindet
                var restoreDirectory = cloud.getNavigationPathCurrent();
                document.getElementById("operationPending").style.visibility = 'visible';

                //Für jede ausgewählte Datei
                for (var i = 0; i < listView.selection.count() ; i++) {
                    var selectedItem = listViewItems.getAt(indices[i]);
                    //Sofern es eine gelöschte Datei ist
                    var targetFile = selectedItem.path;
                    
                    //Rufe Funktion Rekursiv auf, sofern es die letzte zu löschende Datei ist, teile dies der Löschenfunktion mit
                    directoryView.prototype.restoreFile(targetFile, selectedItem.deletedId, restoreDirectory, i == listView.selection.count() - 1);
                }
            }
        },

        //Einzelne gelöschte Datei wiederherstellen, bei der letzten Datei Erfolgs- oder Fehlermeldung anzeigen
        restoreFile: function (targetFile, deleted, restoreDirectory, isLast) {
            var listView = document.getElementById("directoryView").winControl;
            //Letzte ausgewählte Datei ist keine gelöschte
            if (deleted) {
                if (targetFile != null) {
                    var indices = listView.selection.getIndices();
                    var selectedItem = listViewItems.getAt(indices[0]);

                    cloud.restoreFile({ path: targetFile, deletedId: deleted },
                        function () { //success
                            //Sofern es das letzte Element ist und wir uns immer noch im gleichen Verzeichnis befinden
                            if (isLast && restoreDirectory == cloud.getNavigationPathCurrent()) {
                                //Selektionen leeren
                                cloud.pages.directoryView.selectedDirectoryContent = [];
                                WinJS.Application.sessionState.selectedDirectoryContent = [];

                                //Gelöschte Dateien ausblenden
                                cloud.context.showDeletedFiles = false;

                                //Verzeichnis neu laden
                                cloud.pages.directoryView.loadFolder();
                            }

                            if (isLast) {
                                document.getElementById("operationPending").style.visibility = 'hidden';

                                if (restoreError) {
                                    cloud.functions.showMessageDialog("FILENOTRESTORED");
                                } else {
                                    cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FILERESTORED"), "/images/notifications/success.png");
                                }

                            }
                            return;
                        },
                        function () { //error
                            restoreError = true;

                            //Sofern es das letzte Element ist und wir uns immer noch im gleichen Verzeichnis befinden
                            if (isLast && restoreDirectory == cloud.getNavigationPathCurrent()) {
                                cloud.context.showDeletedFiles = false;
                                //Verzeichnis neu laden
                                directoryView.prototype.loadFolder();
                            }

                            if (isLast) {
                                //Sofern es im Verlauf einen Fehler gab, einen Fehler anzeigen.
                                if (restoreError) {
                                    cloud.functions.showMessageDialog("FILENOTRESTORED");
                                }
                                document.getElementById("operationPending").style.visibility = 'hidden';
                            }
                            return;
                        });
                }
            } else {
                //keine gelöschte Datei --> Nötig, da in der Selektion aktuell auch nicht gelöschte Dateien sein können
                if (isLast) {
                    document.getElementById("operationPending").style.visibility = 'hidden';

                    //Selektionen leeren
                    cloud.pages.directoryView.selectedDirectoryContent = [];
                    WinJS.Application.sessionState.selectedDirectoryContent = [];

                    //Verzeichnis neu laden
                    directoryView.prototype.loadFolder();

                    if (restoreError) {
                        cloud.functions.showMessageDialog("FILENOTRESTORED");
                    } else {
                        cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FILERESTORED"), "/images/notifications/success.png");
                    }
                }
                return;
            }
        },

        //Event des Delete-File Buttons --> Schleife über alle ausgewählte Dateien um diese einzeln zu löschen
        deleteFileButtonEvent: function (e) {
            var listView = document.getElementById("directoryView").winControl;
            if (listView.selection.count() >= 1) {
                var isLast = false;
                var indices = listView.selection.getIndices();

                //Speichern des Löschverzeihnisses um das aktuelle Verzeichnis neu zu laden sofern der Benutzer sich noch in diesem befindet
                var deleteDirectory = cloud.getNavigationPathCurrent();

                //Für jede ausgewählte Datei
                var alreadyDeletedOrSharedFolder = false;
                for (var i = 0; i < listView.selection.count() ; i++) {
                    var selectedItem = listViewItems.getAt(indices[i]);
                    //Sofern es keine gelöschte Datei ist
                    if (!selectedItem.deleted && selectedItem.path != "/Shared") {
                        var pathAndName = selectedItem.path;
                        var fileName = selectedItem.title;
                        if (i == 0) {
                            //Appbar nach Klick ausblenden
                            document.getElementById('appbar').winControl.hide();
                            document.getElementById('navbar').winControl.hide();

                            document.getElementById("operationPending").style.visibility = 'visible';
                        }
                        //Rufe Funktion Rekursiv auf, sofern es die letzte zu löschende Datei ist, teile dies der Löschenfunktion mit
                        directoryView.prototype.deleteFile(pathAndName, fileName, deleteDirectory, i == listView.selection.count() - 1);
                    } else {
                        //Datei ist bereits gelöscht oder Shared-Ordner
                        alreadyDeletedOrSharedFolder = true;
                    }
                }
                //Sofern eine gelöschte Datei dabei war, wird diese einfach übersprungen und im Anschluss an die Operation ein Fehler angezeigt
                if (alreadyDeletedOrSharedFolder) {
                    cloud.functions.showMessageDialog("OBJECTCANTBEDELETED");
                }
            }
        },

        //deletePath = zu löschende Datei (übergeben aus Button-Click Event)
        //fileName = Zum checken der aktuellen Vorschau
        //IsLast = Schließt beim letzten zu löschenden Element in der SuccessMethode die Erfolgsmeldung ein
        deleteFile: function (deletePath, fileName, deleteDirectory, isLast) {
            if (deletePath != null) {
                cloud.deleteObject({ path: deletePath },
                    function () { //success
                        //Lade die Anzeige nach Abschluss des Löschvorgangs neu, sofern der Benutzer im gleichen Verzeichnis ist
                        if (isLast && deleteDirectory == cloud.getNavigationPathCurrent()) {
                            //Selektionen leeren
                            cloud.pages.directoryView.selectedDirectoryContent = [];
                            WinJS.Application.sessionState.selectedDirectoryContent = [];

                            //Verzeichnis neu laden
                            directoryView.prototype.loadFolder();
                        }

                        //Vorschau ggf. ausblenden
                        if (document.getElementById("previewHeader").innerText == fileName) {
                            document.getElementById("previewHeader").innerText = "";
                            document.getElementById("previewHeader").style.visibility = 'hidden';
                            document.getElementById("previewTag").style.visibility = 'hidden';
                            document.getElementById("previewHeaderContainer").style.visibility = 'hidden';
                        }

                        //Bei der letzten Datei Vorgang abschließen & ggf. Fehler anzeigen oder Success
                        if (isLast) {
                            document.getElementById("operationPending").style.visibility = 'hidden';

                            //Sofern es im Verlauf einen Fehler gab
                            if (deleteError) {
                                cloud.functions.showMessageDialog("FILENOTDELETED");
                            //Sofern der gesamte Vorgang erfolgreich war
                            } else {
                                cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FILEDELETED"), "/images/notifications/success.png");
                            }
                            deleteError = false;
                        }
                        return;
                    },
                    function () { //error
                        deleteError = true;

                        //Sofern es der letzte Löschvorgang ist und wir uns immer noch im gleichen Verzeichnis befinden
                        if (isLast && deleteDirectory == cloud.getNavigationPathCurrent()) {
                            //Ansicht neu laden
                            directoryView.prototype.loadFolder();
                        }

                        if (isLast) {
                            //Sofern es im Verlauf einen Fehler gab, einen Fehler anzeigen.
                            if (deleteError) {
                                cloud.functions.showMessageDialog("FILENOTDELETED");
                            }
                            document.getElementById("operationPending").style.visibility = 'hidden';
                            deleteError = false;
                        }
                        return;
                    });
            }
        },

        //Datei umbenennen
        renameFile: function () {
            var listView = document.getElementById("directoryView").winControl;

            if (listView.selection.count() == 1) {
                var indices = listView.selection.getIndices();
                var selectedItem = listViewItems.getAt(indices[0]);

                if (!selectedItem.deleted && selectedItem.path != "/Shared" && selectedItem.path.indexOf("/Shared") == -1) {
                    //Speichern des RenameVerzeichnisses um das aktuelle Verzeichnis neu zu laden sofern der Benutzer sich noch in diesem befindet
                    var renameDirectory = cloud.getNavigationPathCurrent();

                    var selectedItem = listViewItems.getAt(indices[0]);
                    document.getElementById('appbar').winControl.hide();
                    document.getElementById('navbar').winControl.hide();

                    document.getElementById("operationPending").style.visibility = 'visible';

                    //Neuen Namen zusammensetzten --> Wenn es eine Datei und kein Ordner ist, Dateitypen ranhängen
                    if (selectedItem.fileType == "folder") {
                        var targetName = document.getElementById('renameInput').value;
                    } else {
                        var targetName = document.getElementById('renameInput').value + selectedItem.fileType;
                    }

                    //Datei umbenennen
                    cloud.renameObject({ srcPath: selectedItem.path, targetName: targetName, isDir: selectedItem.fileType == "folder" },
                        function () { /*success*/
                            cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FILERENAMED"), "/images/notifications/success.png");
                            document.getElementById("operationPending").style.visibility = 'hidden';
                            //Lade die Anzeige nach Abschluss des renames neu, sofern der Benutzer im Renameverzeichnis ist
                            if (renameDirectory == cloud.getNavigationPathCurrent()) {
                                //Im vorraus ListView Item Titel überschrieben, (nur Anzeige) damit ggf. Preview Titel geupdatet werden kann (loadFolder ist noch nicht fertig wenn updatePreview danach direkt aufgerufen wird (da ansynchron))
                                selectedItem.title = targetName;
                                //Vorschau ggf. ausblenden
                                if (document.getElementById("previewHeader").innerText == selectedItem.fileName) {
                                    document.getElementById("previewHeader").innerText = targetName;
                                }

                                //Selektionen leeren
                                cloud.pages.directoryView.selectedDirectoryContent = [];
                                WinJS.Application.sessionState.selectedDirectoryContent = [];

                                directoryView.prototype.loadFolder();
                            }
                            return;
                        },
                        function () { /*error*/
                            //Überprüfung auf einen eingegebenen nicht leeren Namen
                            if (document.getElementById('renameInput').value == "") {
                                cloud.functions.showMessageDialog("EMPTYDATANAMETEXT");
                            } else {
                                cloud.functions.showMessageDialog("FILENOTRENAMED");
                            }
                            document.getElementById("operationPending").style.visibility = 'hidden';
                            return;
                        });
                }
            }
        },

        //Einfügen der zum verschieben ausgewählten Objekte
        //Wird im fileMover ausgeführt
        pasteObject: function () {
            document.getElementById("operationPending").style.visibility = 'visible';
            var moveCount;
            var moveError = false;
            var moveErrorType = null;

            //Verschiebe jede ausgewählte Datei einzeln
            for (var i = 0; i < cloud.context.fileMover.cutObjectPath.length ; i++) {
                var targetPath = cloud.getNavigationPathCurrent() + "/" + cloud.context.fileMover.cutObjectName[i];
                moveCount = i;

                //Datei verschieben
                cloud.moveObject({ srcPath: cloud.context.fileMover.cutObjectPath[i], targetPath: targetPath, isDir: cloud.context.fileMover.cutObjectIsDir[i] },
                    function () {
                        //Sofern das letzte Element erfolgreich verschoben wurde
                        if (moveCount == cloud.context.fileMover.cutObjectPath.length - 1) {
                            //Wenn es im Verlauf einen Fehler gab, gebe diesen aus
                            if (moveError) {
                                if (moveErrorType == "IDENTICAL") {
                                    cloud.functions.showNotification(cloud.translate("IDENTICALINDEX"), cloud.translate("IDENTICALINDEXTEXT"), "/images/notifications/warning.png");
                                } else if (moveErrorType == "RECURSION") {
                                    cloud.functions.showMessageDialog("RECURSIONTEXT");
                                } else {
                                    cloud.functions.showMessageDialog("MOVEERRORGENERAL");
                                }
                            } else { //Ansonsten berichte den Erfolg
                                cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FILEMOVED"), "/images/notifications/success.png");
                            }
                            
                            document.getElementById("operationPending").style.visibility = 'hidden';
                            //Variablen resetten
                            cloud.context.fileMover.cutObjectPath = [];
                            cloud.context.fileMover.cutObjectName = [];
                            cloud.context.fileMover.cutObjectIsDir = [];

                            //Sofern eine Datei verschoben wurde, muss die "Verschieben-Ansicht" wieder verlassen werden und zurück zum Browser navigiert werden
                            directoryView.prototype.leaveFileMover();
                        }
                        return;
                    },
                    function (e) {
                        moveError = true;
                        moveErrorType = e;

                        //Sofern es im Verlauf des Verschiebens einen Fehler gab
                        if (i == cloud.context.fileMover.cutObjectPath.length - 1) {
                            document.getElementById("operationPending").style.visibility = 'hidden';

                            //Variablen resetten
                            cloud.context.fileMover.cutObjectPath = [];
                            cloud.context.fileMover.cutObjectName = [];
                            cloud.context.fileMover.cutObjectIsDir = [];

                            //Gebe Fehler für einzelne Fehlertypen aus
                             if (moveErrorType == "IDENTICAL") {
                                 cloud.functions.showMessageDialog("IDENTICALINDEXTEXT");
                             } else if (moveErrorType == "RECURSION") {
                                 cloud.functions.showMessageDialog("RECURSIONTEXT");
                             } else {
                                 cloud.functions.showMessageDialog("MOVEERRORGENERAL");
                             }

                            //FileMover verlassen
                            directoryView.prototype.leaveFileMover();
                        }
                    });
            }
        },

        //Öffne fileMover View
        moveObject: function (path, isLast) {
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
                !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
                // Fail silently if we can't unsnap
                return;
            }

            var listView = document.getElementById("directoryView").winControl;

            if (listView.selection.count() >= 1) {
                cloud.context.fileMover.isFileMover = true;
                var listView = document.getElementById("directoryView").winControl;
                var indices = listView.selection.getIndices();

                var containsDeletedOrSharedFolder = false;
                var containsMoveableObject = false;

                var idx = 0;
                for (var i = 0; i < listView.selection.count() ; i++) {
                    var selectedItem = listViewItems.getAt(indices[i]);
                    if (!selectedItem.deleted && selectedItem.path != "/Shared") {
                        containsMoveableObject = true;
                        cloud.context.fileMover.cutObjectPath[idx] = selectedItem.path;
                        cloud.context.fileMover.cutObjectName[idx] = selectedItem.title;
                        if (selectedItem.fileType == "folder") {
                            cloud.context.fileMover.cutObjectIsDir[idx] = true;
                        } else {
                            cloud.context.fileMover.cutObjectIsDir[idx] = false;
                        }
                        idx++;
                    } else {
                        //Gelöschte Datei oder der Ordner shared --> Zeig vor Start des Vorgangs eine Fehlermeldung an
                        containsDeletedOrSharedFolder = true;
                    }
                }
        
                //Navigation zurücksetzen
                cloud.resetNavigation();

                //Sofern gelöschte Dateien selektiert waren --> Benutzer darüber benachrichtigen, dass dies nicht geht.
                if (containsDeletedOrSharedFolder) {
                    //Zeige Fehlermeldung an und öffne Filemover erst danach
                    cloud.functions.showMessageDialog("MOVENOTPOSSIBLEERROR", function () {
                        if (containsMoveableObject) {
                            WinJS.Navigation.navigate("/pages/directoryView/directoryView.html");
                        }
                    });
                } else {
                    //Führe Download durch
                    WinJS.Navigation.navigate("/pages/directoryView/directoryView.html");
                }                
            }
        },

        //Verlasse den fileMover bzw. ShareTarget
        leaveFileMover: function () {
            cloud.context.fileMover.isFileMover = false;
            cloud.context.fileMover.cutObjectPath = [];
            cloud.context.fileMover.cutObjectName = [];
            cloud.context.fileMover.cutObjectIsDir = [];

            //Vorwärtsliste leeren
            cloud.clearNavigationListForward();

            //Selektion leeren
            cloud.pages.directoryView.selectedDirectoryContent = [];
            WinJS.Application.sessionState.selectedDirectoryContent = [];

            //Verzeichnisansicht im normalen Kontext neu laden
            WinJS.Navigation.navigate("/pages/directoryView/directoryView.html");
        },

        //Neuen Ordner anlegen
        createFolder: function () {
            //Speichern des Verzeichnisses um das aktuelle Verzeichnis neu zu laden sofern der Benutzer sich noch in diesem befindet
            var createFolderDirectory = cloud.getNavigationPathCurrent();
            var targetPath = createFolderDirectory;
            
            document.getElementById('appbar').winControl.hide();
            document.getElementById('navbar').winControl.hide();

            document.getElementById("operationPending").style.visibility = 'visible';

            var folderName = document.getElementById('folderNameInput').value;

            //Suche ob Ordner bereits existiert --> Doppeltes erstellen eines Ordners zwar nicht schädlich, jedoch irreführend
            var alreadyExistsFolder = false;
            var id = 0;
            for (; id < listViewItems.length;) {
                if (listViewItems.getAt(id).fileType == "folder" && listViewItems.getAt(id).fileName == folderName) {
                    alreadyExistsFolder = true;
                    break;
                } else {
                    id++;                  
                }
            }

            //Sofern der Ordner noch nicht existiert, lege ihn an
            if (!alreadyExistsFolder) {
                cloud.createFolder({ path: targetPath, folderName: folderName },
                    function () { /*success*/
                        cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FOLDERCREATED"), "/images/notifications/success.png");
                        document.getElementById("operationPending").style.visibility = 'hidden';
                        document.getElementById('folderNameInput').value = "";
                        if (createFolderDirectory == cloud.getNavigationPathCurrent()) {
                            //Selektionen leeren
                            cloud.pages.directoryView.selectedDirectoryContent = [];
                            WinJS.Application.sessionState.selectedDirectoryContent = [];

                            //Verzeichnis neu laden
                            directoryView.prototype.loadFolder();
                        }
                        return;
                    },
                    function (e) { /*error*/
                        cloud.functions.showMessageDialog("FOLDERNOTCREATED");
                        if (e == "NONAME") {
                            cloud.functions.showMessageDialog("NONAMETEXT");
                        }
                        document.getElementById("operationPending").style.visibility = 'hidden';
                    });
            } else { //Wenn der Ordner bereits existiert, zeige Fehlermeldung
                cloud.functions.showMessageDialog("FOLDERALREADYEXISTS");
                document.getElementById("operationPending").style.visibility = 'hidden';
            }
        },

        //Dateihistorie anzeigen
        showHistory: function () {
            if (cloud.hasFunctionality({ functionkey: "getFileHistory" })) {
                var listView = document.getElementById("directoryView").winControl;
                if (listView.selection.count() == 1) {
                    var indices = listView.selection.getIndices();
                    var selectedItem = listViewItems.getAt(indices[0]);

                    if (selectedItem.fileType != "folder" && !selectedItem.deleted) {

                        //Stelle Flyout Datei zur Verfügung
                        cloud.context.history.file = selectedItem;

                        //Zeige Flyout
                        WinJS.UI.SettingsFlyout.showSettings("history", "/settings/html/history.html");
                    }
                }
            }
        },

        //Öffne das Share-Settings-Flyout
        openShareMenu: function () {
            if (cloud.hasFunctionality({ functionkey: "getPublicLink" }) || cloud.hasFunctionality({ functionkey: "shareFile" })) {
                var listView = document.getElementById("directoryView").winControl;
                if (listView.selection.count() == 1) {
                    var indices = listView.selection.getIndices();
                    var selectedItem = listViewItems.getAt(indices[0]);

                    if (!selectedItem.deleted && selectedItem.path != "/Shared") {

                        //Stelle Flyout Datei zur Verfügung
                        cloud.context.share.file = selectedItem;

                        //Zeige Flyout
                        WinJS.UI.SettingsFlyout.showSettings("share", "/settings/html/share.html");
                    }
                }
            }
        },

        //Öffne das Sortieren-Flyout
        showSortFlyout: function () {
            document.getElementById("sortFlyout").winControl.show(sortButton, "auto");

            if (cloud.pages.directoryView.currentSortType == "name") {
                document.getElementById("sortByName").style.backgroundColor = "#009DD1";
                document.getElementById("sortBySize").style.backgroundColor = "white";


            }
            else {
                document.getElementById("sortByName").style.backgroundColor = "white";
                document.getElementById("sortBySize").style.backgroundColor = "#009DD1";

            }
            //cloud.pages.showFlyOut(sortFlyout, sortButton, "top");

        },

        showFlyOut: function (flyout, anchor, placement) {
            flyout.winControl.show(anchor, placement);
        },

        //Starte ORC Erkennung --> Sende Datei an Fileee sofern die ownCloud Instance dies unterstützt
        recognizeTextFromPicture: function () {
            var listView = document.getElementById("directoryView").winControl;
            var count = listView.selection.count();

            //Prüfe ob Backend die Funktion bereitstellt
            if (cloud.hasFunctionality({ functionkey: "fileee" })) {
                //Nur ein Element ausgewält
                if (count == 1) {
                    var indices = listView.selection.getIndices();
                    var selectedItem = listViewItems.getAt(indices[0]);
                    //Prüfe ob Dateityp für Analyse geeignet
                    if (cloud.config && cloud.config.fileTypes && cloud.config.fileTypes[selectedItem.fileType.toLowerCase()]
                    && typeof cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].hasFileeeSupport !== "undefined"
                    && cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].hasFileeeSupport == true) {
                        cloud.fileeeAnalyse({ path: selectedItem.path, isDir: selectedItem.fileType == "folder" },
                            function () {
                                //success
                                cloud.functions.showMessageDialog("FILEEEANALYSESTARTED");
                            },
                            function () {
                                //error
                                cloud.functions.showMessageDialog("FILEEEANALYSEERROR");
                            });
                    }
                }
            }
        },

		//Touch-Gesten Interaktionsziel definieren.
        setTarget: function (obj) {
            var preview = document.getElementById(obj);
            console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            console.log(preview);
            //Gestenerkennung erstellen
            var msGesture = new MSGesture();
            msGesture.target = preview;
            preview.gesture = msGesture;
            //Handhabung multipler Pointer
            preview.gesture.pointerType = null;

            //Pointerarray zum verfolgen der Pointer
            preview.pointers = [];

            //Eventhandler der Gestenerkennung
            preview.addEventListener("MSPointerDown", this.onMSPointerDown, false);
            preview.addEventListener("MSGestureChange", this.onMSGestureChange, false);
            preview.addEventListener("MSGestureEnd", this.onMSGestureEnd, false);
        },

        //PDF Gesten

        //Funktion für das "Runter-Drücken"
        onMSPointerDown: function (e) {
            //Pointererstellung
            //Erstkontakt der Geste
            if (this.gesture.pointerType === null) {
                console.log("FirstContact");
                this.gesture.addPointer(e.pointerId);
                this.gesture.pointerType = e.pointerType;
            }
                //Weiterer Kontakt der Geste
            else if (e.pointerType === this.gesture.pointerType) {
                console.log("subsequent contact");
                this.gesture.addPointer(e.pointerId);
            }
                //Neue Geste
            else {
                console.log("new pointer type");
                var msGesture = new MSGesture();
                msGesture.target = e.target;
                e.target.gesture = msGesture;
                e.target.gesture.pointerType = e.pointerType;
                e.target.gesture.addPointer(e.pointerId);
            }
        },

        //Gestenänderung, für swipen, rotieren und zoomen.
        onMSGestureChange: function (e) {
            console.log("Gesture change");

            //Für die PDF Steuerung

            if (this == document.getElementById("pdfPreview")) {
                //Bei negativem Zoom
                if (e.scale < 1) {
                    //Sofern im erlaubten Bereich
                    if (cloud.pages.directoryView.pdfCurrentZoom >= 0.2) {
                        //Verringere den Zoom
                        cloud.pages.directoryView.pdfCurrentZoom -= 0.1;
                        cloud.functions.renderPage(cloud.pages.directoryView.pdfPageNum, cloud.pages.directoryView.pdfCurrentZoom);
                        console.log(cloud.pages.directoryView.pdfCurrentZoom);
                    }
                    //Bei positivem Zoom
                } else {
                    //Sofern im Bereich und der Zoom nicht auf 1 (Standart) steht.
                    if (cloud.pages.directoryView.pdfCurrentZoom <= 2.0 && e.scale > 1) {
                        //Erhöhe Zoom
                        cloud.pages.directoryView.pdfCurrentZoom += 0.1;
                        cloud.functions.renderPage(cloud.pages.directoryView.pdfPageNum, cloud.pages.directoryView.pdfCurrentZoom);
                        console.log(cloud.pages.directoryView.pdfCurrentZoom);
                    }
                }
                //Falls es sich um den Erstkontakt einer Geste handelt und die Geste auf eine PDF gewirkt wird
                if (newGesture && (this == document.getElementById("pdfPreview"))) {
                    //Falls es sich um eine negative Bewegung auf der X-Achse handelt.
                    if (e.translationX < -10) {
                        cloud.functions.pdfGoNext();
                        //Flag für bekannte Geste setzen
                        newGesture = false;
                        //Falls es sich um eine positive Bewegung auf der X-Achse handelt.
                    } else if (e.translationX > 10) {
                        cloud.functions.pdfGoPrevious();
                        //Flag für bekannte Geste setzen
                        newGesture = false;
                    }
                }
                console.log(e.translationX);
            //} else {

            //    //Für die Picture Steuerung
            //    //Größe des Pictures auslesen
            //    var width = this.clientWidth;
            //    var height = this.clientHeight;
            //    //document.getElementById("previewTag").style.maxWidth = screen.width - 40 + "px";
            //    //document.getElementById("previewTag").style.maxHeight = screen.height + "px";
            //    //document.getElementById("preview").style.maxWidth = screen.width - 40 + "px";
            //    //document.getElementById("preview").style.maxHeight = screen.height + "px";

            //    //Bei negativem Zoom
            //    //if (e.scale < 1) {
            //    //    console.log("Picture negativ zoom width: "+width+", height: "+height);
            //    //    //Sofern im erlaubten Bereich
            //    //    if (width > 400 && height > 300) {
            //    //        //Verringere den Zoom
            //    //        document.getElementById("preview").style.width = (width * 0.9) + "px";
            //    //        document.getElementById("displayImage").style.width = (width * 0.9) + "px";
            //    //        this.style.width = (width * 0.9) + "px";
            //    //        document.getElementById("preview").style.height = (height * 0.9) + "px";
            //    //        document.getElementById("displayImage").style.height = (height * 0.9) + "px";
            //    //        this.style.height = (width * 0.9) + "px";
            //    //        console.log("Picture width: "+width+" Picture height: "+height);
            //    //    }
            //    //} else {
            //    //    //Bei positivem Zoom
            //    //    console.log("Picture positiv zoom width: " + width + ", height: " + height);
            //    //    //Sofern im Bereich und der Zoom nicht auf 1 (Standart) steht.
            //    //    if (width < (400*8) && height < (300*8) && e.scale > 1) {
            //    //        //Erhöhe Zoom
            //    //        document.getElementById("preview").style.width = (width * 1.1) + "px";
            //    //        document.getElementById("displayImage").style.width = (width * 1.1) + "px";
            //    //        this.style.width = (width * 1.1) + "px";
            //    //        document.getElementById("preview").style.height = (height * 1.1) + "px";
            //    //        document.getElementById("displayImage").style.height = (height * 1.1) + "px";
            //    //        this.style.height = (width * 1.1) + "px";
            //    //        console.log("Picture width: "+width+" Picture height: "+height);
            //    //    }
            //    }
            }
        },

        //Gesten-Beendung
        onMSGestureEnd: function (e){
            if(e.target === this){
                //Flag für neue Geste setzen
                newGesture = true;
            }
            console.log("GestureEnd");
        },

        //Picture Gesten

        /*//Touch-Gesten Interaktionsziel definieren.
        setPictureTarget: function () {
            var picturePreview = document.getElementById("displayImage");
            //Gestenerkennung erstellen
            var msPictureGesture = new MSGesture();
            msPictureGesture.target = picturePreview;
            picturePreview.gesture = msPictureGesture;
            //Handhabung multipler Pointer
            picturePreview.gesture.pointerType = null;

            //Pointerarray zum verfolgen der Pointer
            picturePreview.pointers = [];

            //Eventhandler der Gestenerkennung
            pdfPreview.addEventListener("MSPointerDown", this.onMSPointerDown, false);
            //pdfPreview.addEventListener("MSPointerUp", this.onMSPointerUp, false);
            //pdfPreview.addEventListener("MSPointerCancel", this.onMSPointerCancel, false);
            //pdfPreview.addEventListener("MSLostPointerCapture", this.onMSPointerCancel, false);
            pdfPreview.addEventListener("MSGestureChange", this.onMSGestureChange, false);
            //pdfPreview.addEventListener("MSGestureTap", this.onMSGestureTap, false);
            pdfPreview.addEventListener("MSGestureEnd", this.onMSGestureEnd, false);
            //pdfPreview.addEventListener("MSGestureHold", this.onMSGestureHold, false);
        },

        //Funktion für das "Runter-Drücken"
        onMSPointerDown: function (e) {
            var pdfPreview = document.getElementById("pdfPreview");
            //Pointererstellung
            this.style.borderStyle = "double";
            //Erstkontakt der Geste
            if (this.gesture.pointerType === null) {
                console.log("FirstContact");
                this.gesture.addPointer(e.pointerId);
                this.gesture.pointerType = e.pointerType;
            }
                //Weiterer Kontakt der Geste
            else if (e.pointerType === this.gesture.pointerType) {
                console.log("subsequent contact");
                this.gesture.addPointer(e.pointerId);
            }
                //Neue Geste
            else {
                console.log("new pointer type");
                var msGesture = new MSGesture();
                msGesture.target = e.target;
                e.target.gesture = msGesture;
                e.target.gesture.pointerType = e.pointerType;
                e.target.gesture.addPointer(e.pointerId);
            }
        },

        //Gestenänderung, für swipen, rotieren und zoomen.
        onMSGestureChange: function (e) {
            console.log("Gesture change");
            //Bei negativem Zoom
            if (e.scale < 1) {
                //Sofern im erlaubten Bereich
                if (cloud.pages.directoryView.pdfCurrentZoom >= 0.2) {
                    //Verringere den Zoom
                    cloud.pages.directoryView.pdfCurrentZoom -= 0.1;
                    cloud.functions.renderPage(cloud.pages.directoryView.pdfPageNum, cloud.pages.directoryView.pdfCurrentZoom);
                    console.log(cloud.pages.directoryView.pdfCurrentZoom);
                }
                //Bei positivem Zoom
            } else {
                //Sofern im Bereich und der Zoom nicht auf 1 (Standart) steht.
                if (cloud.pages.directoryView.pdfCurrentZoom <= 2.0 && e.scale > 1) {
                    //Erhöhe Zoom
                    cloud.pages.directoryView.pdfCurrentZoom += 0.1;
                    cloud.functions.renderPage(cloud.pages.directoryView.pdfPageNum, cloud.pages.directoryView.pdfCurrentZoom);
                    console.log(cloud.pages.directoryView.pdfCurrentZoom);
                }
            }
            //Falls es sich um den Erstkontakt einer Geste handelt
            if (newPDFGesture) {
                //Falls es sich um eine negative Bewegung auf der X-Achse handelt.
                if (e.translationX < -10) {
                    cloud.functions.pdfGoNext();
                    //Flag für bekannte Geste setzen
                    newPDFGesture = false;
                    //Falls es sich um eine positive Bewegung auf der X-Achse handelt.
                } else if (e.translationX > 10) {
                    cloud.functions.pdfGoPrevious();
                    //Flag für bekannte Geste setzen
                    newPDFGesture = false;
                }
            }
            console.log(e.translationX);
        },

        //Gesten-Beendung
        onMSGestureEnd: function (e){
            if(e.target === this){
                this.style.borderStyle = "solid";
                //Flag für neue Geste setzen
                newPDFGesture = true;
            }
            console.log("GestureEnd");
        },*/
    });
})();
