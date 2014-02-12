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
    WinJS.Binding.optimizeBindingReferences = true;
    
    // Shortcut variables
    var self;
    var listView; // listView winControl element

    // Error handling for multiple transfers
    var deleteError = false;
    var restoreError = false;
    var downloadError = false;
    var uploadError = false;

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;

    var directoryView = WinJS.UI.Pages.define("/pages/directoryView/directoryView.html", {
        // Initialize view
        ready: function (element, options) {
            // Make variables public
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

            cloud.pages.directoryView.editor = null;
            cloud.pages.directoryView.pdfDoc = null;
            cloud.pages.directoryView.pdfPageNum = null;
            cloud.pages.directoryView.newGesture = true;

            cloud.pages.directoryView.currentSortType = false;
            cloud.pages.directoryView.listViewItems = null; // ListView items of files and folders
            cloud.pages.directoryView.restoreError = false;
            cloud.pages.directoryView.deleteError = false;
            cloud.pages.directoryView.moveError = false;
            cloud.pages.directoryView.moveErrorType = null;
            
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
            cloud.pages.directoryView.showHistoryFlyout = this.showHistoryFlyout;
            cloud.pages.directoryView.cameraUpload = this.cameraUpload;
            cloud.pages.directoryView.uploadLocalFile = this.uploadLocalFile;
            cloud.pages.directoryView.uploadFileInternal = this.uploadFile;
            cloud.pages.directoryView.uploadSharedFile = this.uploadSharedFile;
            cloud.pages.directoryView.createFolder = this.createFolder;
            cloud.pages.directoryView.deleteFileButtonEvent = this.deleteFileButtonEvent;
            cloud.pages.directoryView.moveObject = this.moveObject;
            cloud.pages.directoryView.openFileButtonEvent = this.openFileButtonEvent;
            cloud.pages.directoryView.downloadAndSaveFileButtonEvent = this.downloadAndSaveFileButtonEvent;
            cloud.pages.directoryView.renameFile = this.renameFile;
            cloud.pages.directoryView.sortByFlex = this.sortByFlex;
            cloud.pages.directoryView.openShareFlyout = this.openShareFlyout,
            cloud.pages.directoryView.cancelFileMover = this.leaveFileMover;
            cloud.pages.directoryView.toggleLayout = this.toggleLayout;
            cloud.pages.directoryView.displayLayout = this.displayLayout;
            cloud.pages.directoryView.pdfNavNext = cloud.functions.pdfGoNext;
            cloud.pages.directoryView.pdfNavBack = cloud.functions.pdfGoPrevious;
            cloud.pages.directoryView.pdfZoomIn = cloud.functions.pdfZoomIn;
            cloud.pages.directoryView.pdfZoomOut = cloud.functions.pdfZoomOut;
            cloud.pages.directoryView.pdfGoToPage = cloud.functions.pdfGoToPage;
            cloud.pages.directoryView.setKeyboardContextPDF = this.setKeyboardContextPDF;
            cloud.pages.directoryView.updatePreview = this.updatePreview;
            cloud.pages.directoryView.restore = this.restoreFileButtonEvent;
            cloud.pages.directoryView.recognizeTextFromPicture = this.recognizeTextFromPicture;
            cloud.pages.directoryView.setKeyboardContextDirectoryView = this.setKeyboardContextDirectoryView;
            
            // Prepare initial appearance
            document.getElementById("pdfPreview").style.maxHeight = document.getElementById("contentGrid").clientHeight;
            document.getElementById("pdfControls").style.display = "none";
            document.getElementById("pdfPreview").style.display = "none";

            // Fill variables
            listView = document.getElementById("directoryView").winControl;
            self = this;

            /* Restore session data */
            // List sort type
            if (WinJS.Application.sessionState.currentSortType) {
                cloud.pages.directoryView.currentSortType = WinJS.Application.sessionState.currentSortType;
            } else {
                cloud.pages.directoryView.currentSortType = "name"; // default
            }

            // DirectoryView layout 
            if (cloud.vars.roamingSettings.values["currentLayout"]) {
                cloud.pages.directoryView.currentLayout = cloud.vars.roamingSettings.values["currentLayout"];
            } else {
                cloud.pages.directoryView.currentLayout = "GridLayout"; //default on startup
            }
            this.displayLayout();

            // Other appearance
            $('#clearSelectionButton').addClass("invisible");
            $('#emptyDirectory').addClass("invisible");

            // Initialize app bar
            var appBarDiv = document.getElementById("appbar");
            var appbar = document.getElementById("appbar").winControl;

            // Register events to change height according to appbar state (otherwise scrollbar issues)
            $(appbar).on('beforehide', function () {
                var viewstateAppbar = Windows.UI.ViewManagement.ApplicationView.value;
                if (viewstateAppbar != Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                    $('.directoryView section[role=main]').css('height', '100%');
                    $('.contentGrid').css('height', 'calc(100% - 130px)');
                }
            });
            $(appbar).on('beforeshow', function () {
                var viewstateAppbar = Windows.UI.ViewManagement.ApplicationView.value;
                if (viewstateAppbar != Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                    $('.directoryView section[role=main]').css('height', 'calc(100% - 100px)');
                    $('.contentGrid').css('height', 'calc(100% - 30px)');
                }
            });

            ////////////////////////////CONTEXTS////////////////////////////
            // Set default values
            navbar.disabled = false;
            appbar.disabled = false;
            appbar.sticky = false;

            // Filepicker (= send content to this app)
            if (cloud.context.fileMover.isFileMover || cloud.context.isShareTarget) {
                self.resetAppBar();

                // Show only directory structure and appbar
                document.getElementById("syncButton").style.display = "none";
                document.getElementById("changeLayout").style.display = "none";
                document.getElementById("sortButton").style.display = "none";
                navbar.disabled = true;

                // Force app bar
                appbar.sticky = true;
                appbar.addEventListener("afterhide", function () { appbar.show(); });
                appbar.show();

                // Set buttons and keyboard according to context
                if (cloud.context.fileMover.isFileMover) {
                    appbar.showCommands(appBarDiv.querySelectorAll('.fileCopied'));

                    cloud.setKeystrokeContext({
                        context: "fileMover",
                        actions: {
                            home: cloud.pages.directoryView.goToHomePage,
                            navigateBack: cloud.pages.directoryView.navigateBackEvent,
                            navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                            paste: self.pasteObject,
                            cancel: cloud.pages.directoryView.cancelFileMover,
                        }
                    });
                } else if (cloud.context.isShareTarget) {
                    // This app is share target of other app to upload file
                    appbar.showCommands(appBarDiv.querySelectorAll('.upload'));

                    cloud.setKeystrokeContext({
                        context: "shareTarget",
                        actions: {
                            home: cloud.pages.directoryView.goToHomePage,
                            navigateBack: cloud.pages.directoryView.navigateBackEvent,
                            navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                            upload: self.uploadSharedFile,
                        }
                    });
                }

            } else if (cloud.context.isSavePicker) {
                // FileSavePicker without app bar
                appbar.disabled = true;
                navbar.disabled = true;

                cloud.context.pickerContext.addEventListener("targetfilerequested", this.onTargetFileRequested, false);

                cloud.setKeystrokeContext({
                    context: "savePicker",
                    actions: {
                        home: cloud.pages.directoryView.goToHomePage,
                        navigateBack: cloud.pages.directoryView.navigateBackEvent,
                        navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                    }
                });

            } else if (cloud.context.isOpenPicker) {
                //FileOpenPicker without app bar
                appbar.disabled = true;
                navbar.disabled = true;

                cloud.setKeystrokeContext({
                    context: "openPicker",
                    actions: {
                        home: cloud.pages.directoryView.goToHomePage,
                        navigateBack: cloud.pages.directoryView.navigateBackEvent,
                        navigateForward: cloud.pages.directoryView.navigateForwardEvent,
                    }
                });
            } else {
                // Normal context: File browser
                this.initializeDirectoryViewContext();

                // Refresh appbar 6 seconds after initialization to wait for getFunctionality
                // Use TRY to avoid app crash after fast logout
                // TODO find better way
                setTimeout(function () { try { cloud.pages.directoryView.updateAppbar } catch (e) { /* do nothing */ } }, 6000);
            }

            
            /* General initialization for all contexts */
            document.getElementById("toggleLayout").addEventListener("click", this.toggleLayout, false);
            
            // Avoid flickering in document preview
            document.getElementById("previewHeader").style.visibility = 'hidden';
            document.getElementById("previewTag").style.visibility = 'hidden';
            document.getElementById("previewHeaderContainer").style.visibility = 'hidden';
            document.getElementById("backButton").style.visibility = 'hidden';
            document.getElementById("forwardButton").style.visibility = 'hidden';

            // Hide transfer progress bar
            document.getElementById("operationPending").style.visibility = 'hidden';

            // Initialize list view
            this.initListView();
            document.getElementById("directoryProgressRing").style.visibility = 'visible';
            this.loadFolder();

            // Prepare navigation and remove windows navigation button
            WinJS.Navigation.history.backStack = [];
            $("header[role=banner] .win-backbutton").attr("disabled", "disabled");

            // Sort button event
            document.getElementById("sortButton").addEventListener("click", this.openSortFlyout, false);
        },

        unload: function () {
            var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.removeEventListener("datarequested", this.dataRequested);

            if (cloud.context.isSavePicker) {
                cloud.context.pickerContext.removeEventListener("targetfilerequested", this.onTargetFileRequested, false);
            }
        },

        // initialize default directoryView context
        initializeDirectoryViewContext: function () {
            // Share content out of directoryView
            var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
            dataTransferManager.addEventListener("datarequested", this.dataRequested);

            // Register general event listeners which do not depend on a context
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
                cloud.pages.directoryView.setKeyboardContextPDF();
            });

            /*document.getElementById("deleteFlyout").addEventListener("beforeshow", function () {
                cloud.setKeystrokeContext({
                    context: "directoryDelete",
                    actions: {
                        // Not necessary as Enter key will automatically call the button
                        // deleteConfirm: cloud.pages.directoryView.deleteFileButtonEvent,
                    }
                });
            }, false);
            document.getElementById("deleteFlyout").addEventListener("afterhide", function () {
                    cloud.getPreviousKeystrokeContext(); // Not necessary due to above
            }, false);*/

            document.getElementById("confirmDeleteButton").addEventListener("click", this.deleteFileButtonEvent, false);
            

            document.getElementById("renameFlyout").addEventListener("beforeshow", function () {
                cloud.setKeystrokeContext({
                    context: "directoryRename",
                    actions: {
                        renameConfirm: cloud.pages.directoryView.renameFile, // In contrast to delete flyout it is necessary here
                    }
                });
            }, false);

            document.getElementById("renameFlyout").addEventListener("afterhide", function () {
                cloud.getPreviousKeystrokeContext();
            }, false);
            
            document.getElementById("createFolderFlyout").addEventListener("beforeshow", function () {
                cloud.setKeystrokeContext({
                    context: "directoryCreateFolder",
                    actions: {
                        // Not necessary as Enter key will automatically call the button
                        //folderCreateConfirm: cloud.pages.directoryView.createFolder,
                    }
                });
            }, false);

            document.getElementById("createFolderFlyout").addEventListener("afterhide", function () {
                cloud.getPreviousKeystrokeContext();
            }, false);
            document.getElementById("createFolder").addEventListener("click", this.createFolder, false);

            // Reset focus on top element after hiding app bar
            appbar.addEventListener("afterhide", this.setListViewFocus);

            // Initialize MediaPlayer
            Windows.Media.MediaControl.addEventListener("playpausetogglepressed", this.playpausetoggle, false);
            Windows.Media.MediaControl.addEventListener("playpressed", this.playbutton, false);
            Windows.Media.MediaControl.addEventListener("pausepressed", this.pausebutton, false);

            // Initialize gestures and set first keyboard context to normal mode
            this.setGestureTarget("pdfPreview");

            // Check if an introduction tour should be shown 
            cloud.debug("Show a tour? " + cloud.vars.roamingSettings.values["showIntroTour"]);
           // cloud.vars.roamingSettings.values["showIntroTour"] = true; /**** TODO remove after testing ****/
            if (cloud.vars.roamingSettings.values["showIntroTour"] == null || cloud.vars.roamingSettings.values["showIntroTour"] == true) {
                cloud.pages.introTour.startTour();
            } else {
                this.setKeyboardContextDirectoryView();
            };
        },

        setKeyboardContextDirectoryView: function () {
               cloud.setKeystrokeContext({
                context: "directoryStart",
                actions: {
                    home:           cloud.pages.directoryView.goToHomePage,
                    logout:         cloud.functions.logout,
                    account:        cloud.functions.showAccountSettings,
                    navigateBack:   cloud.pages.directoryView.navigateBackEvent,
                    navigateForward:cloud.pages.directoryView.navigateForwardEvent,
                    clearSelection: cloud.pages.directoryView.clearSelection,
                    refresh:        cloud.pages.directoryView.loadFolder,
                    sortByName:     cloud.pages.directoryView.sortByName,
                    sortBySizeDesc: cloud.pages.directoryView.sortBySizeDesc,
                    displayDeleted: cloud.pages.directoryView.displayDeleted,
                    restoreFile:    cloud.pages.directoryView.restoreFileButtonEvent,
                    showHistory:    cloud.pages.directoryView.showHistoryFlyout,
                    cameraUpload:   cloud.pages.directoryView.cameraUpload,
                    upload:         cloud.pages.directoryView.uploadLocalFile,
                    moveObject:     cloud.pages.directoryView.moveObject,
                    openFile:       cloud.pages.directoryView.openFileButtonEvent,
                    download:       cloud.pages.directoryView.downloadAndSaveFileButtonEvent,
                    ocr:            cloud.pages.directoryView.recognizeTextFromPicture,
                    rename: function () {
                        if (listView.selection.count() == 1) {
                            document.getElementById('renameButtonAppbar').click();
                        }
                    },
                    share: cloud.pages.directoryView.openShareFlyout,
                    showFileInfo: function () {
                        if (listView.selection.count() == 1) {
                            if (self.getSelectedItem().fileType != "folder") {
                                document.getElementById('fileInfoButtonAppbar').click();
                            }
                        }
                    },
                    deleteFileButtonEvent: function () {
                        if (listView.selection.count() == 1) {
                            document.getElementById('deleteFileButtonAppbar').click();
                        }
                    },
                    createFolder: function () { document.getElementById('addFolderButtonAppbar').click(); },
                }
            });
        },

        setKeyboardContextPDF: function () {
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
                    showHistory: cloud.pages.directoryView.showHistoryFlyout,
                    cameraUpload: cloud.pages.directoryView.cameraUpload,
                    upload: cloud.pages.directoryView.uploadLocalFile,
                    moveObject: cloud.pages.directoryView.moveObject,
                    openFile: cloud.pages.directoryView.openFileButtonEvent,
                    download: cloud.pages.directoryView.downloadAndSaveFileButtonEvent,
                    ocr: cloud.pages.directoryView.recognizeTextFromPicture,
                    rename: function () {
                        if (listView.selection.count() == 1) {
                            document.getElementById('renameButtonAppbar').click();
                        }
                    },
                    share: cloud.pages.directoryView.openShareFlyout,
                    showFileInfo: function () {
                        if (listView.selection.count() == 1) {
                            if (self.getSelectedItem().fileType != "folder") {
                                document.getElementById('fileInfoButtonAppbar').click();
                            }
                        }
                    },
                    deleteFileButtonEvent: function () {
                        if (listView.selection.count() == 1) {
                            document.getElementById('deleteFileButtonAppbar').click();
                        }
                    },
                    createFolder: function () { document.getElementById('addFolderButtonAppbar').click(); },
                }
            });
        },

        // Retrieve the selected item from the listView
        getSelectedItem: function () {
            var indices = listView.selection.getIndices();
            if (indices.length > 0) {
                return cloud.pages.directoryView.listViewItems.getAt(indices[0]);
            } else {
                return [];
            }
        },

        // Event handler for the play/pause button
        playpausetoggle: function () {
            if (mediaControls.isPlaying === true) {
                document.getElementById("audiotag").pause();
                document.getElementById("videotag").pause();
            } else {
                document.getElementById("audiotag").play();
                document.getElementById("videotag").play();
            }
        },

        // Event handler for the pause button
        pausebutton: function () {
            document.getElementById("audiotag").pause();
            document.getElementById("videotag").pause();
        },

        // Event handler for the play button
        playbutton: function () {
            document.getElementById("audiotag").play();
            document.getElementById("videotag").play();
        },

        // Sharing content to other apps through charmbar share button
        dataRequested: function (e) {
            // Download file temporarily. Parameter e.request allows the downloadFileTemporary function to pass the file
            // to the charm bar after completion together with title and description
            self.downloadFileTemporary(function () { }, function () { }, e.request);
        },

        /////// FILE SAVE PICKER STUFF ///////

        // Get file from other apps by selecting this app as target to save to
        // http://msdn.microsoft.com/de-de/library/windows/apps/windows.storage.pickers.provider.targetfilerequestedeventargs
        onTargetFileRequested: function (e) {
            var deferral;
            deferral = e.request.getDeferral();

            // Create a file to provide back to the Picker
            Windows.Storage.ApplicationData.current.localFolder.createFileAsync(cloud.context.pickerContext.fileName, Windows.Storage.CreationCollisionOption.replaceExisting).done(function (file) {

                // Assign the resulting file to the targetFile property and complete the deferral to indicate success
                e.request.targetFile = file;
                // File was provided, source app can now write file
                deferral.complete();

                // Wait for completion and upload file afterwards
                self.checkFileComplete(file);

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

        /* 
        Check if a file provided by another app is completly written to location -> No notification will happen!
        Problem: FileSavePicker normally doesn't wait for files to be written and perform actions afterwards! Normally, 
        selecting a target location (here, a temporary file) completes the operation. But we have to wait for a complete file
        otherwise an empty or corrupted file gets uploaded.
        To avoid infinite sleep for empty files, limit the amount of iterations
        TODO find a better way?
        */
        checkFileComplete: function (file, remaining) {
            // Check init and exit to avoid loop
            if (remaining == null) {
                remaining = 5;
            } else if (remaining == 0) {
                return;
            }

            // Delay and upload if file is not empty
            self.sleep(2000);
            file.getBasicPropertiesAsync().then(
                function (basicProperties) {
                    if (basicProperties.size > 0) {
                        self.uploadFile(cloud.getNavigationPathCurrent(), file, basicProperties.size, function () { }, function () { });
                    } else {
                        self.checkFileComplete(file, --remaining);
                    }
                },
                function () {
                    self.checkFileComplete(file, --remaining);
                });
        },

        // Delay processing
        sleep: function (millis) {
            var date = new Date();
            var curDate = null;

            do { curDate = new Date(); }
            while (curDate - date < millis);
        },
        ///////END FILE SAVE PICKER STUFF///////

        ///////FILE OPEN PICKER STUFF/////// 
        // Special selection-Changed Event to add files to a basket in the FileOpenPicker
        addFileToBasket: function () {
            if (listView.selection.count() == 1) {
                var selectedItem = self.getSelectedItem();
                if (selectedItem.fileType != "folder" && !selectedItem.deleted) {
                    // Download files temporarily
                    self.downloadFileTemporary(
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
        ///////END FILE OPEN PICKER STUFF/////// 

        // Change layout according to display style
        updateLayout: function (element, viewState, lastViewState) {
            var listView = element.querySelector("#directoryView").winControl;

            if (lastViewState === viewState) return; // nothing to change

            if (viewState === appViewState.snapped) {
                // Always list layout in snapped view
                cloud.pages.directoryView.currentLayout = "ListLayout";
            }
            // Apply
            cloud.pages.directoryView.displayLayout();
        },

        /*
        Switch between ListLayout and GridLayout (considering context constraints)
        */
        toggleLayout: function(){
            if (Windows.UI.ViewManagement.ApplicationViewState === appViewState.snapped ||
                cloud.context.isShareTarget) {
                // Always list layout in snapped view or share target
                cloud.pages.directoryView.currentLayout = "ListLayout";
            } else if (cloud.context.isOpenPicker || cloud.context.isSavePicker || cloud.context.fileMover.isFileMover) {
                // Always grid layout in these contexts
                cloud.pages.directoryView.currentLayout = "GridLayout";
            } else {
                var changeTo = cloud.pages.directoryView.currentLayout == "GridLayout" ? "ListLayout" : "GridLayout";
                cloud.pages.directoryView.currentLayout = changeTo;
            }
            // Apply
            cloud.pages.directoryView.displayLayout();
        },

        /*
        Apply a given layout (ListLayout or GridLayout) provided in cloud.pages.directoryView.currentLayout
        */
        displayLayout: function () {
            var changeTo = cloud.pages.directoryView.currentLayout;
            var currentViewState = Windows.UI.ViewManagement.ApplicationView.value;
            
            //Save to session data
            cloud.vars.roamingSettings.values["currentLayout"] = cloud.pages.directoryView.currentLayout;
            
            if (changeTo == "GridLayout" && currentViewState != appViewState.snapped) { // no grid layout in Snapview possible
                // Switch symbol
                document.getElementById("toggleLayout").innerText = ""; // list symbol
                
                // New layout
                listView.layout = new WinJS.UI.GridLayout;
                
                // Resize
               //XXX document.getElementById("sectionWrap").style.height = "100%";
               // document.getElementById("contentGrid").style.height = "100%";

            } else if (changeTo == "ListLayout") {
                // Switch symbol
                document.getElementById("toggleLayout").innerText = ""; // grid symbol

                // New layout
                listView.layout = new WinJS.UI.ListLayout({ horizontal: false });

                // Resize
             //XXX   document.getElementById("sectionWrap").style.height = "calc(100% - 100px)";
             //   document.getElementById("contentGrid").style.height = "calc(100% - 30px)";
            }

            self.updatePreview();
        },

        // Initialize list of files and folders
        initListView: function () {
            if (!cloud.context.isOpenPicker && !cloud.context.isSavePicker && !cloud.context.fileMover.isFileMover && !cloud.context.isShareTarget) {
                // Normal file browser context    
                listView.addEventListener("selectionchanged", self.selectionChangedEvent);
            } else {
                // Only allow single selection in file pickers
                listView.selectionMode = WinJS.UI.SelectionMode.single;
                listView.swipeBehavior = WinJS.UI.SwipeBehavior.none;

                // Change layout according to context
                cloud.pages.directoryView.toggleLayout(); 
            }

            if (cloud.context.isOpenPicker) {
                // Special selectionchanged event: download file temporarily and add to basket
                listView.addEventListener("selectionchanged", self.addFileToBasket);
            }

            // Always register navigation event
            listView.addEventListener("iteminvoked", self.invokeDirectoryItem, false);
        },

        // Set focus on first element of the listview element
        setListViewFocus: function () {
            listView.currentItem = { index: 0, hasFocus: true, showFocus: true }
        },

        // Show deleted files and folders
        displayDeleted: function () {
            if (cloud.hasFunctionality({ functionkey: "getDeletedFiles" })) {
                if (cloud.context.showDeletedFiles) {
                    cloud.context.showDeletedFiles = false;
                    document.getElementById("showDeletedButton").style.textShadow = "";
                } else {
                    cloud.context.showDeletedFiles = true;
                    document.getElementById("showDeletedButton").style.textShadow = "0 0 10px #fff";
                }
                self.loadFolder();
            }
        },

        /*
        Fetch content of the current folder (first element of back navigation stack)
        @param keepselection    (boolean)   *optional* keep the current selection
        @param asyncLastPath    (string)    *optional* load folder after an asynchronous operation. Refreshes the view only if the originally displayed folder is still shown
        */
        loadFolder: function (keepselection, asyncLastPath) {
            // Do nothing if the path has changed after an asynchronous operation
            if (asyncLastPath && asyncLastPath != cloud.getNavigationPathCurrent()) {
                return;
            }

            document.getElementById("directoryProgressRing").style.visibility = 'visible';

            // Decide whether to show deleted files
            var showDeleted = cloud.context.showDeletedFiles ? "both" : "onlyCurrent";

            // Clear selection
            if (keepselection !== true) {
                cloud.pages.directoryView.selectedDirectoryContent = [];
                WinJS.Application.sessionState.selectedDirectoryContent = [];
            }

            // Fetch folder content
            cloud.getDirectoryContent({
                path: cloud.getNavigationPathCurrent(),
                sortBy: cloud.pages.directoryView.currentSortType,
                deletedFiles: showDeleted
            },
            self.reloadListView /* success */,
            function (error) { /* error */
                if (error === "NOSUCHELEMENT") {
                    // Navigation error, reset to root directory
                    cloud.resetNavigation();
                    self.loadFolder();
                    cloud.functions.showMessageDialog("NOSUCHELEMENT");
                }
                document.getElementById("directoryProgressRing").style.visibility = 'hidden';
                cloud.showError();
            });
        },

        // Fill ListView element if fetching data (in loadFolder) was successful
        reloadListView: function (directoryContent) {
            var items = [];

            if (directoryContent.length == 0) {
                // Show message if directory is empty
                $('#emptyDirectory').removeClass("invisible");
            } else {
                $('#emptyDirectory').addClass("invisible");

                // Transfer content to listview element
                for (var i in directoryContent) {
                    // Adapt directory content properties
                    directoryContent[i].sizeText = directoryContent[i].bestText;
                    directoryContent[i].hasTemporaryFile = false;
                    directoryContent[i].deletedClass = directoryContent[i].deleted ? "directoryViewItem isDeleted" : "directoryViewItem";
                    
                    if (directoryContent[i].isDir) {
                        // If it is a folder add it directly
                        items.push(directoryContent[i]);

                    } else if (!cloud.context.isSavePicker && !cloud.context.isShareTarget && !cloud.context.fileMover.isFileMover) {    
                        // Show files only if we are not in a folder selection context

                        // FileOpenPicker: Only show files that are supported by the calling app
                        var supportedFileType = false;
                        
                        // http://msdn.microsoft.com/en-US/library/windows/apps/windows.storage.pickers.provider.fileopenpickerui.allowedfiletypes
                        if (cloud.context.isOpenPicker) {
                            for (var idx = 0; idx <= cloud.context.pickerContext.allowedFileTypes.length - 1; idx++) {
                                // Loop through allowed files types for match or "*"
                                if (cloud.context.pickerContext.allowedFileTypes[idx] == "*" ||
                                    cloud.context.pickerContext.allowedFileTypes[idx] == directoryContent[i].fileType.toLowerCase()) {
                                    supportedFileType = true;
                                    break;
                                }
                            }
                        } else {
                            // Normal directoryView context, all types allowed
                            supportedFileType = true;
                        }

                        if (supportedFileType) {
                            items.push(directoryContent[i]);
                        }
                    }
                }
            }

            // Create listView element from items
            cloud.pages.directoryView.listViewItems = new WinJS.Binding.List(items);
            listView.itemDataSource = cloud.pages.directoryView.listViewItems.dataSource;
            self.setListViewFocus();

            // Restore selection (from session selection)
            if (items.length > 0 && !cloud.context.isSavePicker && !cloud.context.isShareTarget && !cloud.context.fileMover.isFileMover) {
                if (cloud.pages.directoryView.selectedDirectoryContent != []) {
                    listView.selection.set(cloud.pages.directoryView.selectedDirectoryContent);
                }
            }

            // Refresh page title
            var title = document.getElementById("pagetitle");
            var path = cloud.helper.convertPath({ path: cloud.getNavigationPathCurrent(), isDir: true });
            $(title).parent().removeClass("folderview");

            if (cloud.context.isSavePicker || cloud.context.fileMover.isFileMover) {
                // If folder needs to be selected
                title.innerText = cloud.translate("CHOOSEDIRECTORY") + path.fileName;
                $(title).parent().addClass("folderview"); // Need to CSS-resize header (title)
            } else if (cloud.context.isShareTarget) {
                title.innerText = cloud.shareOperation.data.properties.title + cloud.translate("UPLOADSTUB");
                $(title).parent().addClass("folderview"); // Need to CSS-resize header (title)
            } else {
                title.innerText = path.fileName;
            }

            // Hide and show navigation buttons
            if (cloud.navigationHasPrevious()) {
                document.getElementById("backButton").style.visibility = 'visible';
            } else {
                document.getElementById("backButton").style.visibility = 'hidden';
            }
            if (cloud.navigationHasNext()) {
                document.getElementById("forwardButton").style.visibility = 'visible';
            } else {
                document.getElementById("forwardButton").style.visibility = 'hidden';
            }

            // Update app bar
            if (!cloud.context.isSavePicker && !cloud.context.isShareTarget && !cloud.context.fileMover.isFileMover && !cloud.context.isOpenPicker) {
                self.updateAppBar();
            }

            // Hide progess ring
            document.getElementById("directoryProgressRing").style.visibility = 'hidden';
        },

        // Handle click on listview element. Open folder on click or refresh preview on selection/unselection
        invokeDirectoryItem: function (eventInfo) {
            var selectedItem = cloud.pages.directoryView.listViewItems.getAt(eventInfo.detail.itemIndex);
                
            if (selectedItem.fileType == "folder") {
                // Navigate
                cloud.navigationGotoPath({ path: selectedItem.path });

                // Update session data storage
                WinJS.Application.sessionState.navigationListBackwards = cloud.getNavigationListBack();
                WinJS.Application.sessionState.navigationListForwards = cloud.getNavigationListForward();

                // Load content
                self.loadFolder();

            } else if (!cloud.context.isOpenPicker && !cloud.context.isSavePicker && !cloud.context.isShareTarget && !cloud.context.fileMover.isFileMover) {
                // File was invoked: Select manually and refresh preview
                listView.selection.set([eventInfo.detail.itemIndex]);
                self.selectionChangedEvent();
                self.updatePreview();
            }
        },

        // Handle selection/deselection of listView elements
        selectionChangedEvent: function (eventInfo) {
            if (!cloud.context.isSavePicker && !cloud.context.isShareTarget && !cloud.context.fileMover.isFileMover) {
                // Adapt app bar functions to current selection
                self.updateAppBar();

                // Update session data storage
                var indices = listView.selection.getIndices();
                WinJS.Application.sessionState.selectedDirectoryContent = indices;
                cloud.pages.directoryView.selectedDirectoryContent = indices;
            }
        },

        // Update file information in app bar
        updateFileInfo: function (selectedItem) {
            if (selectedItem.fileType != "folder" && !selectedItem.deleted) {
                document.getElementById("fileInfoName").innerText = selectedItem.title;
                document.getElementById("fileInfoPath").innerText = selectedItem.dirName == "" ? "/" : selectedItem.dirName;
                document.getElementById("fileInfoDateCreated").innerText = selectedItem.date;
                document.getElementById("fileInfoSize").innerText = selectedItem.bestText;
            }
        },

        // Prepare rename flyout in app bar to preset current filename
        updateRenameField: function (selectedItem) {
            document.getElementById('renameInput').innerText = selectedItem.fileName;
        },

        // File preview
        updatePreview: function () {
            if (listView.selection.count() != 1) {
                // File preview makes only sense on single selected files
                return;
            }

            // File preview not possible for folders or deleted files
            var selectedItem = self.getSelectedItem();
            if (selectedItem.fileType == "folder" || selectedItem.deleted) {
                return;
            }

            // Check if filetype allows preview
            if (!cloud.config || !cloud.config.fileTypes || !cloud.config.fileTypes[selectedItem.fileType.toLowerCase()]
                || typeof cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType === "undefined") {
                return;
            }

            // Word preview if plugin exists on server (requires no file download yet)
            if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType == "word" && cloud.hasFunctionality({ functionkey: "hasPreviewDocx" })) {
                // Notify users about restriction
                cloud.functions.showNotification(cloud.translate("ATTENTION"), cloud.translate("NOIMAGEINWORD"), "/images/notifications/warning.png");

                // Prepare preview and insert content
                self.preparePreview(selectedItem);
                self.setFilePreviewHTML(selectedItem, null);

            // Other preview types require temporary download of the file
            } else if (cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType != "word") {
                try {
                    self.downloadFileTemporary(
                    function (targetFile) {
                        targetFile.getBasicPropertiesAsync().then(
                            function (basicProperties) {
                                if (basicProperties.size > 0) {
                                    // Prepare preview and insert content
                                    self.preparePreview(selectedItem);
                                    self.setFilePreviewHTML(selectedItem, targetFile);
                                } else {
                                    // File is empty or cannot be read due to download problems with incorrectly encoded file names
                                    cloud.functions.showMessageDialog("CORRUPTEDFILEERROR");
                                }
                            });
                    },
                    function () {
                        cloud.functions.showMessageDialog("CORRUPTEDFILEERROR"); /* file download failed */
                    });
                } catch (e) { /* catch download of non-existent files: do nothing */ }
            }
        },

        // Prepare preview area for new file preview
        preparePreview: function (selectedItem) {
            // Reset appearance
            document.getElementById("previewHeader").innerText = (selectedItem) ? selectedItem.title : "";
            document.getElementById("previewHeader").style.visibility = 'visible';
            document.getElementById("previewHeaderContainer").style.visibility = 'visible';

            document.getElementById("previewTag").style.visibility = 'visible';
            document.getElementById("previewTag").innerHTML = "";
            document.getElementById("previewTag").style.width = "";
            document.getElementById("previewTag").style.backgroundColor = "";
            document.getElementById("previewTag").style.padding = "";
            document.getElementById("previewTag").style.overflowY = "";
            document.getElementById("previewTag").style.backgroundImage = "";

            document.getElementById("code").textContent = "";
            document.getElementById("code").style.maxWidth = "";

            $('#pdfPreview > canvas').remove();
            $('#previewTag > canvas').remove();
            $('#pdfPreview > img').remove();
            document.getElementById("pdfPreview").style.display = "none";
            document.getElementById("pdfControls").style.display = "none";

            // Avoid multiple editors
            if (cloud.pages.directoryView.editor) {
                cloud.pages.directoryView.editor.toTextArea();
                cloud.pages.directoryView.editor = null;
            }
            
            // Return to standard context
            this.setKeyboardContextDirectoryView();
        },

        setFilePreviewHTML: function (selectedItem, targetFile) {
            var previewHTML;
            var previewTagWidth;
            var previewType = cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].previewType;

            // No preview in SnapView
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped) {
                return;
            }

            // Create source object (not necessary for word preview)
            if (targetFile) {
                var fileSrcBlob = URL.createObjectURL(targetFile, { oneTimeOnly: true });
            }

            /***** pictures *****/
            if (previewType == "image") {

                // Show OCR content next to picture if currently not in Snapview and if functionality is given through plugin
                if (cloud.hasFunctionality({ functionkey: "fileee" }) && 
                    cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].hasFileeeSupport === true) {
                    
                    // Retrieve text content
                    cloud.getFileeeContent({ path: selectedItem.path }, function (fileee) {
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
                                theme: "monokai",
                            });
                        }
                    }, function () { /* error, do nothing */ });
                }

                // Create picture element
                previewHTML = $('<img id="displayImage" src="' + fileSrcBlob + '" />"');
                
                // Different appearance according to current layout
                if (cloud.pages.directoryView.currentLayout == "GridLayout") {
                    // Problem in Visual Studio simulator to calculate naturalWidth and naturalHeight
                    // Workaround #1: console.log(tmpPic[0].width);
                    // Workaround #2:
                    var cancel = false;
                    while (!cancel) {
                        if (previewHTML[0].naturalWidth) cancel = true;
                    }

                    // Resize container according to dimensions to avoid empty space when preview content changes
                    var ratio = previewHTML[0].naturalWidth / previewHTML[0].naturalHeight;
                    previewTagWidth = document.getElementById("contentGrid").clientHeight * ratio + "px";

                } else if (cloud.pages.directoryView.currentLayout == "ListLayout") {
                    previewTagWidth = document.body.clientWidth - 490 + "px";
                }

                // Set size
                document.getElementById("previewTag").style.width = previewTagWidth;

                // Add preview element to DOM
                $('#previewTag').append(previewHTML);

            /***** video player *****/
            } else if (previewType == "video") {
                previewHTML = "<video id='video' controls=\"\" src=\"" + fileSrcBlob + "\" type=\"video/" + "></video>";

                // Add preview element to DOM
                $('#previewTag').append(toStaticHTML(previewHTML));

                $('#video').bind("loadedmetadata", function () {
                    var width = this.videoWidth;
                    var height = this.videoHeight;

                    // Resize container according to dimensions to avoid empty space when preview content changes
                    if (cloud.pages.directoryView.currentLayout == "GridLayout") {

                        // Resize container according to dimensions to avoid empty space when preview content changes
                        var ratio = width / height;
                        document.getElementById("video").style.maxWidth = document.getElementById("contentGrid").clientHeight * ratio + "px";

                    } else if (cloud.pages.directoryView.currentLayout == "ListLayout") {

                        document.getElementById("video").style.maxWidth = document.body.clientWidth - 475 + "px";
                        document.getElementById("video").style.maxHeight = document.getElementById("contentGrid").clientHeight - 130 + "px";
                    }
                });


            /***** audio player *****/
            } else if (previewType == "audio") {
                previewHTML = "<audio class=\"audioplayer\" controls=\"controls\" src=\"" + fileSrcBlob + "\"></audio>";
                
                // Add preview element to DOM
                $('#previewTag').append(toStaticHTML(previewHTML));

            /***** code preview *****/
            } else if (previewType == "code") {
 
                // Retrieve text
                Windows.Storage.FileIO.readTextAsync(targetFile).then(function (contents) {
                    document.getElementById("code").textContent = contents;

                    // Configure editor
                    var codeType = cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].codeType;
                    cloud.pages.directoryView.editor = CodeMirror.fromTextArea(document.getElementById("code"), {
                        mode: codeType,
                        styleActiveLine: true,
                        lineNumbers: true,
                        lineWrapping: true,
                        readOnly: true,
                        theme: "monokai",
                    });
                });

            /***** PDF *****/
            } else if (previewType == "reader") {

                document.getElementById("pdfControls").style.display = "block";
                document.getElementById("pdfPreview").style.display = "block";
                
                this.setKeyboardContextPDF();

                // Show first page
                cloud.functions.showPDF(targetFile);
    
            /***** word preview *****/
            } else if (previewType == "word") {

                if (cloud.hasFunctionality({ functionkey: "hasPreviewDocx" })) {
                    cloud.getFileFulltext(
                        {
                            path: selectedItem.path,
                            fileType: selectedItem.fileType
                        },
                    function (htmlText) { /* success */
                        document.getElementById("previewTag").style.backgroundColor = "#272822";
                        document.getElementById("previewTag").style.color = "white";
                        document.getElementById("previewTag").style.overflowY = "auto";
                        document.getElementById("previewTag").style.padding = "20px";
                        document.getElementById("previewTag").style.maxWidth = document.body.clientWidth - 500 + "px";
                        document.getElementById("previewTag").style.maxHeight = document.getElementById("contentGrid").clientHeight + "px";

                        previewHTML = $('<span>' + htmlText + '</span>');

                        // Add preview element to DOM
                        $('#previewTag').append(previewHTML);
                    },
                    function () { /* error, do nothing */ });
                }
            }

            // Scroll to preview element
            if (cloud.vars.roamingSettings.values["autoScroll"] && cloud.pages.directoryView.currentLayout == "GridLayout") {
                setTimeout("$('#sectionWrap').scrollTo($('#previewTag'), 800, { axis: 'x' })", 200);
            }
        },

        // Show and hide appbar commands depending on current selection
        updateAppBar: function () {
            var appBarDiv = document.getElementById("appbar");
            var appbar = document.getElementById('appbar').winControl;

            // Reset all app bar commands
            self.resetAppBar();
            
            /* Show general commands that are independent of current selection */
            $('#clearSelectionButton').removeClass("invisible");
            appbar.showCommands(appBarDiv.querySelectorAll('.general'));
            if (cloud.hasFunctionality({ functionkey: "getDeletedFiles" })) {
                appbar.showCommands(appBarDiv.querySelectorAll('.showDeleted'));
            }

            var selectionContent = cloud.functions.analyzeSelection(listView.selection);

            /* Show commands for single selection */
            if (selectionContent.size == 1) {
                var selectedItem = selectionContent.allItems[0];

                if (selectionContent.containsDeletedItems) {
                    // Commands for deleted file
                    appbar.showCommands(appBarDiv.querySelectorAll('.restore'));

                } else {
                    // Existing items can be moved, renamed, deleted and shared unless they are located within the "Shared" folder (or the folder itself!)
                    if (!selectionContent.containsSharedItems) {

                        appbar.showCommands(appBarDiv.querySelectorAll('.manage'));
                        document.getElementById("renameButtonAppbar").winControl.hidden = false;
                        document.getElementById("renameHR").winControl.hidden = false;
                        document.getElementById("moveHR").winControl.hidden = false;
                        document.getElementById("moveFileButton").winControl.hidden = false;
                        document.getElementById("deleteHR").winControl.hidden = false;
                        document.getElementById("deleteFileButtonAppbar").winControl.hidden = false;

                        if (cloud.hasFunctionality({ functionkey: "getPublicLink" }) || cloud.hasFunctionality({ functionkey: "shareFile" })) {
                            document.getElementById("shareButtonAppbar").winControl.hidden = false;
                            document.getElementById("shareHR").winControl.hidden = false;
                        }
                    }

                    // File type specific commands
                    if (selectionContent.containsFolders) {
                        // Nothing folder-specific yet

                    } else {
                        // Single selection actions for all other files, e.g. Download, history, open file
                        appbar.showCommands(appBarDiv.querySelectorAll('.singleSelectNoFolder'));
                        appbar.showCommands(appBarDiv.querySelectorAll('.download'));
       
                        if (cloud.config && cloud.config.fileTypes && cloud.config.fileTypes[selectedItem.fileType.toLowerCase()]
                        && typeof cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].hasFileeeSupport !== "undefined"
                        && cloud.config.fileTypes[selectedItem.fileType.toLowerCase()].hasFileeeSupport == true) {
                            if (cloud.hasFunctionality({ functionkey: "fileee" })) {
                                document.getElementById("ocrButton").winControl.hidden = false;
                            }
                        }

                        if (cloud.hasFunctionality({ functionkey: "getFileHistory" })) {
                            document.getElementById("historyButton").winControl.hidden = false;
                            document.getElementById("historyHR").winControl.hidden = false;
                        }
                    }

                    // Update app bar flyouts for file information and rename field (set values)
                    self.updateFileInfo(selectedItem);
                    self.updateRenameField(selectedItem);
                }

                // Show app bar
                appbar.sticky = true;
                appbar.show();

            /* Multiselect */
            } else if (selectionContent.size > 1) {
                
                // Only deleted files are selected
                if (selectionContent.containsDeletedItems && !selectionContent.containsSharedItems && !selectionContent.containsNormalItems) {
                    appbar.showCommands(appBarDiv.querySelectorAll('.restore'));

                // Only normal files are selected
                } else if (selectionContent.containsNormalItems && !selectionContent.containsSharedItems && !selectionContent.containsDeletedItems) {
                    appbar.showCommands(appBarDiv.querySelectorAll('.manage'));
                    appbar.showCommands(appBarDiv.querySelectorAll('.multiSelect'));
                    document.getElementById("deleteHR").winControl.hidden = false;
                    document.getElementById("deleteFileButtonAppbar").winControl.hidden = false;
                    document.getElementById("moveHR").winControl.hidden = false;
                    document.getElementById("moveFileButton").winControl.hidden = false;

                    if (!selectionContent.containsFolders) {
                        appbar.showCommands(appBarDiv.querySelectorAll('.download'));
                    }
                }

                appbar.sticky = true;
                appbar.show();

            /* No selection */
            } else {
                appbar.hide();
                appbar.sticky = false;
            }
        },

        resetAppBar: function () {
            var appBarDiv = document.getElementById("appbar");
            var appbar = document.getElementById('appbar').winControl;

            // Reset all app bar commands
            appbar.hideCommands(appBarDiv.querySelectorAll('button'));
            $('#clearSelectionButton').addClass("invisible");
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
        },

        // Remove last element from stack when navigating back
        navigateBackEvent: function (eventInfo) {
            if (cloud.navigationHasPrevious()) {
                cloud.navigationGotoPrevious();

                // Load content
                self.loadFolder();

                // Save session data
                WinJS.Application.sessionState.navigationListBackwards = cloud.getNavigationListBack();
                WinJS.Application.sessionState.navigationListForwards = cloud.getNavigationListForward();
            }
        },

        // Add new element to stack when navigating forwards
        navigateForwardEvent: function (eventInfo) {
            if (cloud.navigationHasNext()) {
                cloud.navigationGotoNext();

                // Load content
                self.loadFolder();

                // Save session data
                WinJS.Application.sessionState.navigationListBackwards = cloud.getNavigationListBack();
                WinJS.Application.sessionState.navigationListForwards = cloud.getNavigationListForward();
            }
        },

        // Navigate to root directory (unless already there)
        goToHomePage: function (eventInfo) {
            if (cloud.getNavigationPathCurrent() != "/") {
                cloud.navigationGotoPath({ path: "/" });
                self.loadFolder();
            }
        },

        // Event handler for sort-content-by-name button
        sortByName: function () {
            cloud.pages.directoryView.sortByFlex({ sortBy: "name" });
        },

        // Event handler for sort-content-by-size-desc button
        sortBySizeDesc: function () {
            cloud.pages.directoryView.sortByFlex({ sortBy: "sizeDesc" });
        },

        // General sorting function
        sortByFlex: function (obj) {
            // Update sort type
            cloud.pages.directoryView.currentSortType = obj.sortBy;

            // Save session data
            WinJS.Application.sessionState.currentSortType = cloud.pages.directoryView.currentSortType;

            // Refresh folder content
            self.loadFolder();

            // Hide app bar
            document.getElementById("appbar").winControl.hide();
            document.getElementById("navbar").winControl.hide();
        },

        // Event handler to clear the current selection
        clearSelection: function () {
            listView.selection.set([]);
            cloud.pages.directoryView.selectedDirectoryContent = [];
            WinJS.Application.sessionState.selectedDirectoryContent = [];
        },

        // Upload a file to a specific path. If a file is provided take this one, otherwise ask user to pick a file
        uploadFile: function (path, file, fileSize, successCallback, errorCallback) {
            document.getElementById("operationPending").style.visibility = 'visible';

            cloud.uploadFile(
                {
                    targetPath: path,
                    fileSize: fileSize,
                    file: file // eventually existing file (from camera or shareTarget)
                },
                function (uploadedFile, isLast) {
                    // Notify user and update view only after the last upload in the queue
                    if (isLast) {
                        document.getElementById("operationPending").style.visibility = 'hidden';

                        // Notify user
                        if (!deleteError) {
                            cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("UPLOADCOMPLETED"), "/images/notifications/success.png");
                        } else {
                            cloud.functions.showMessageDialog("UPLOADINTERRUPTED");
                        }
                        uploadError = false;

                        // Reload directory if it's currently visible
                        self.loadFolder(true, path);

                        successCallback();
                    }

                    // Refresh preview if the selected file was reuploaded
                    var selectedItem = self.getSelectedItem();
                    if (selectedItem && selectedItem.title == uploadedFile) {
                        selectedItem.hasTemporaryFile = false;
                        self.updatePreview();
                    }
                },
                function (isLast) {
                    // Notify if any file encountered an error while uploading
                    cloud.functions.showMessageDialog("UPLOADINTERRUPTED");
                    document.getElementById("operationPending").style.visibility = 'hidden';
                    errorCallback();
                });
        },

        // Take a picture or video with the camera and upload
        cameraUpload: function () {
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
                !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
                // Inform user about fail to unsnap to open camera
                cloud.functions.showMessageDialog("NOSNAPVIEW");
                return;
            }

            // Open camera
            var captureUI = new Windows.Media.Capture.CameraCaptureUI();
            captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photoOrVideo).then(function (capturedItem) {
                if (capturedItem) {
                    // User captured a picture/video -> upload
                    var path = cloud.getNavigationPathCurrent();
                    self.uploadFile(path, capturedItem, null, function () {/*success*/ }, function () {/*error*/ });
                } else {
                    /* no picture taken, do nothing */
                }
            });
        },

        // Pick file from local data source and upload
        uploadLocalFile: function () {
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
                !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
                // Inform user about fail to unsnap to open picker
                cloud.functions.showMessageDialog("NOSNAPVIEW");
                return;
            }

            var path = cloud.getNavigationPathCurrent();
            self.uploadFile(path, null, null, function () { /*success*/ }, function () {/*error*/ });
        },

        // Upload files shared to this app via the charm bar
        uploadSharedFile: function () {
            var appbar = document.getElementById("appbar").winControl;
            appbar.disabled = true;

            // After reportStarted is called no interaction with the app should be required.
            cloud.shareOperation.reportStarted();
            
            // Upload files one by one
            if (cloud.shareOperation.data.contains(Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems)) {
                cloud.shareOperation.data.getStorageItemsAsync().then(function (storageItems) {
                    for (var i = 0; i < storageItems.size; i++) {
                        self.uploadFile(cloud.getNavigationPathCurrent(), storageItems.getAt(i), null, function () { cloud.shareOperation.reportCompleted(); }, function () { cloud.shareOperation.reportError(cloud.translate("UPLOADINTERRUPTED")); });
                    }
                });
            }
        },

        /*
        Temporary download of a file for file preview or sharing to other apps
        The shareRequrest parameter contains the request element of the charm bar share event if existing
        */
        downloadFileTemporary: function (successCallback, errorCallback, shareRequest) {
            //Sofern etwas angeklickt wurde...
            if (listView.selection.count() != 1) {
                // No temporary download for multiple or no files
                return;
            }
            
            // Don't download folders or deleted files
            var selectedItem = self.getSelectedItem();
            if (!selectedItem || selectedItem.fileType == "folder" || selectedItem.deleted) {
                return;
            }

            // Show progress bar
            document.getElementById("operationPending").style.visibility = 'visible';

            // Prepare sharing to other app via charm bar
            var deferral;
            if (shareRequest) {

                // Title is required
                var title = selectedItem.title;
                if (typeof title === "string" && title !== "") {
                    shareRequest.data.properties.title = title;
                } else {
                    shareRequest.failWithDisplayText(SdkSample.missingTitleError);
                }

                // The description is optional
                var description = cloud.translate("CHOOSEAPP");
                if ((typeof description === "string") && (description !== "")) {
                    shareRequest.data.properties.description = description;
                }

                deferral = shareRequest.getDeferral();
            }

            // Check if temporary file exists to serve directly
            if (selectedItem.hasTemporaryFile) {

                // Sharing to app: Set file
                if (shareRequest) {
                    shareRequest.data.setStorageItems([selectedItem.temporaryFile]);
                    deferral.complete();
                }

                successCallback(selectedItem.temporaryFile);
            } else {

                // Create temporary file to fill
                var temporaryFolder = Windows.Storage.ApplicationData.current.temporaryFolder;
                temporaryFolder.createFileAsync(selectedItem.title, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (targetFile) {

                    // Prepare file to download
                    var param = [];
                    param[0] = cloud.helper.convertPath({ path: selectedItem.path });
                    param[0].fileSize = selectedItem.sizeNum;
                    param[0].type = shareRequest ? "share" : "preview";
                    param[0].targetFile = targetFile;

                    // Download file to temporary file
                    cloud.downloadFile(param,
                        function () { /* success */

                            // Update listview item
                            selectedItem.hasTemporaryFile = true;
                            selectedItem.temporaryFile = targetFile;

                            // Show thumbnail for downloaded pictures
                            if (appconfig.fileTypes && appconfig.fileTypes[selectedItem.fileType] && appconfig.fileTypes[selectedItem.fileType].previewType == "image") {
                                var blob = URL.createObjectURL(targetFile, { oneTimeOnly: true });
                                selectedItem.picture = blob;
                                listView.forceLayout();
                            }

                            // Hide progress bar
                            document.getElementById("operationPending").style.visibility = 'hidden';

                            // Sharing to app: Pass file
                            if (shareRequest) {
                                shareRequest.data.setStorageItems([targetFile]);
                                deferral.complete();
                            }

                            successCallback(targetFile);
                        }, function (e) { /* error */

                            // Notify user
                            if (e == "DOWNLOADFOLDER") {
                                cloud.functions.showMessageDialog("DOWNLOADFOLDER");
                                document.getElementById("operationPending").style.visibility = 'hidden';
                            } else if (e && e.description && e.description == "Canceled") {
                                // The preview download was canceled, do nothing
                                // Don't hide progress bar to avoid crash when logging out during active transfer
                            } else {
                                cloud.functions.showMessageDialog("DOWNLOADINTERRUPTED");
                                document.getElementById("operationPending").style.visibility = 'hidden';
                            }

                            // Sharing to app: Notify app
                            if (shareRequest) {
                                deferral.complete();
                            }

                            errorCallback(targetFile);
                        });
                });
            }                
        },

        // Open file
        openFileButtonEvent: function () {
            if (listView.selection.count() != 1) {
                return;
            }

            // Download file temporarily and open
            self.downloadFileTemporary(
                function (targetFile) {
                    // Open in external application
                    cloud.functions.openFileFromSystem(targetFile);
                },
                function () { /* error, do nothing */ });
        },

        // Save file 
        downloadAndSaveFileButtonEvent: function () {
            // Verify that we are currently not snapped, or that we can unsnap to open the picker
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
                !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
                // Inform user about fail to unsnap to open file picker
                cloud.functions.showMessageDialog("NOSNAPVIEW");
                return;
            }

            // Check if selection exists
            if (listView.selection.count() == 0) {
                return;
            }
            
            // Prepare files to download, exclude folders and deleted files
            var containsFolderOrDeleted  = false;
            var indices = listView.selection.getIndices();

            //Parameter vorbereiten
            var param = [];
            var idx = 0; // file list index
            for (var i = 0; i < listView.selection.count() ; i++) {
                var selectedItem = cloud.pages.directoryView.listViewItems.getAt(indices[i]);
                if (selectedItem.fileType != "folder" && !selectedItem.deleted) {
                    param[idx] = cloud.helper.convertPath({ path: selectedItem.path });
                    param[idx].fileSize = selectedItem.sizeNum;
                    idx++;
                } else {
                    containsFolderOrDeleted = true;
                }
            }

            // Download
            if (containsFolderOrDeleted) {
                // Notify user about excluded items first
                cloud.functions.showMessageDialog("DOWNLOADFOLDERORDELETEDERROR", function () {
                    self.downloadAndSaveFile(param)
                });
            } else {
                self.downloadAndSaveFile(param);
            }
        },

        // Perform download (objects to download need to be validated before)
        downloadAndSaveFile: function(param) {
            if (param.length == 0) {
                return;
            }

            // Show progress bar
            document.getElementById("operationPending").style.visibility = 'visible';

            // Download file
            cloud.downloadFile(param,
                function (isLast) { /* success */
                    if (isLast) {
                        if (!downloadError) {
                            cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("DOWNLOADCOMPLETED"), "/images/notifications/success.png");
                        } else {
                            cloud.functions.showMessageDialog("DOWNLOADINTERRUPTED");
                        }
                        document.getElementById("operationPending").style.visibility = 'hidden';
                        downloadError = false;
                    }
                }, function (error, isLast) { /* error */
                    if (isLast) {
                        cloud.functions.showMessageDialog("DOWNLOADINTERRUPTED");
                        document.getElementById("operationPending").style.visibility = 'hidden';
                        downloadError = false;
                    } else {
                        downloadError = true;
                    }
                });
        },
        
        // Handles button to restore deleted files
        restoreFileButtonEvent: function () {
            if (listView.selection.count() == 0 || !cloud.context.showDeletedFiles) {
                return;
            }

            // Show progress ring
            document.getElementById("operationPending").style.visibility = 'visible';

            var indices = listView.selection.getIndices();
            var restoreDirectory = cloud.getNavigationPathCurrent();
            
            cloud.pages.directoryView.restoreError = false;

            // Iterate through selected files and restore
            for (var i = 0; i < listView.selection.count() ; i++) {
                var selectedItem = cloud.pages.directoryView.listViewItems.getAt(indices[i]);
                var isLast = i == listView.selection.count() - 1;

                self.restoreFile(selectedItem, selectedItem.deletedId, restoreDirectory, isLast);
            }
        },

        // Restore a single deleted file
        restoreFile: function (targetFile, deleted, restoreDirectory, isLast) {

            // Only restore deleted files
            if (!targetFile || !deleted) {
                cloud.pages.directoryView.restoreError = true;
                self.restoreFileFinally(restoreDirectory, isLast);
                return;
            }

            cloud.restoreFile({ path: targetFile.path, deletedId: deleted },
                function () { /* success */
                    self.restoreFileFinally(restoreDirectory, isLast);
                },
                function () { /* error */
                    cloud.pages.directoryView.restoreError = true;
                    self.restoreFileFinally(restoreDirectory, isLast);
                });
        },

        // Final actions to perform after any outcome of a file restoration
        restoreFileFinally: function (restoreDirectory, isLast) {
            if (isLast) {
                // Notify user on last element
                if (cloud.pages.directoryView.restoreError) {
                    cloud.functions.showMessageDialog("FILENOTRESTORED");
                } else {
                    cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FILERESTORED"), "/images/notifications/success.png");
                }

                // Reset view
                document.getElementById("operationPending").style.visibility = 'hidden';

                // Hide deleted files and reload folder
                cloud.context.showDeletedFiles = false;
                self.loadFolder(false, restoreDirectory);

                cloud.pages.directoryView.restoreError = false;
            }
        },

        // Handles button to delete files
        deleteFileButtonEvent: function (e) {
            if (listView.selection.count() == 0) {
                return;
            }

            var isLast = false;
            var indices = listView.selection.getIndices();
            var deleteDirectory = cloud.getNavigationPathCurrent();

            cloud.pages.directoryView.deleteError = false;

            // Iterate through files and delete
            for (var i = 0; i < listView.selection.count() ; i++) {
                var selectedItem = cloud.pages.directoryView.listViewItems.getAt(indices[i]);
                var isLast = i == listView.selection.count() - 1;
 
                self.deleteFile(selectedItem, deleteDirectory, isLast);
            }
        },

        // Delete a single file
        deleteFile: function (selectedItem, deleteDirectory, isLast) {
            // Delete only existing files and exclude shared files

            if (!selectedItem.path || selectedItem.deleted || selectedItem.path.indexOf("/Shared") == 0) {
                cloud.pages.directoryView.deleteError = true;
                self.deleteFileFinally(deleteDirectory, isLast);
                return;
            }

            cloud.deleteObject({ path: selectedItem.path },
                function () { /* success */
                    self.deleteFileFinally(deleteDirectory, isLast);
                },
                function () { /* error */
                    cloud.pages.directoryView.deleteError = true;
                    self.deleteFileFinally(deleteDirectory, isLast);
                });
        },

        // Final actions to perform after any outcome of a file deletion
        deleteFileFinally: function (deleteDirectory, isLast) {
            if (isLast) {
                // Notify user on last element
                if (cloud.pages.directoryView.deleteError) {
                    cloud.functions.showMessageDialog("FILENOTDELETED");
                } else {
                    cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FILEDELETED"), "/images/notifications/success.png");
                }

                // Reset view
                document.getElementById("operationPending").style.visibility = 'hidden';
                self.preparePreview(null);

                // Reload folder
                self.loadFolder(false, deleteDirectory);
            }
        },

        // Rename a file
        renameFile: function () {
            // Makes only sense for single files
            if (listView.selection.count() != 1) {
                return;
            }

            // Check that shared items are not renamed
            var selectedItem = self.getSelectedItem();
            if (selectedItem.deleted || selectedItem.path.indexOf("/Shared") == 0) {
                return;
            }

            // Check for empty input
            var targetName = document.getElementById('renameInput').value;
            if (targetName == "") {
                cloud.functions.showMessageDialog("EMPTYDATANAMETEXT");
                return;
            }

            // Show progress ring
            document.getElementById("operationPending").style.visibility = 'visible';
            
            // Add file extension in case of files
            if (selectedItem.fileType != "folder") {
                targetName += selectedItem.fileType;
            }

            var renameDirectory = cloud.getNavigationPathCurrent();

            // Rename
            cloud.renameObject({ srcPath: selectedItem.path, targetName: targetName, isDir: selectedItem.fileType == "folder" },
                function () { /*success*/
                    cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FILERENAMED"), "/images/notifications/success.png");
                    document.getElementById("operationPending").style.visibility = 'hidden';

                    // Reload view if still in same directory
                    if (renameDirectory == cloud.getNavigationPathCurrent()) {
                        // Update title in listView item to avoid errors before loadFolder is completed
                        selectedItem.title = targetName;

                        // Refresh name on preview
                        if (document.getElementById("previewHeader").innerText == selectedItem.fileName) {
                            document.getElementById("previewHeader").innerText = targetName;
                        }

                        self.loadFolder();
                    }
                    return;
                },
                function () { /*error*/
                    cloud.functions.showMessageDialog("FILENOTRENAMED");
                    document.getElementById("operationPending").style.visibility = 'hidden';
                });
        },

        // Insert selected objects while moving files
        pasteObject: function () {
            document.getElementById("operationPending").style.visibility = 'visible';

            // Move every file separately
            for (var i = 0; i < cloud.context.fileMover.cutObjects.length ; i++) {
                var targetPath = cloud.helper.normalizePath(cloud.getNavigationPathCurrent(), { "trailingSlash": true, "prependSlash": true }) + cloud.context.fileMover.cutObjects[i].title;
                var isLast = i == cloud.context.fileMover.cutObjects.length - 1;

                self.pasteObjectSingle(i, targetPath, isLast);
            }
        },

        // Move a single file
        pasteObjectSingle: function (index, targetPath, isLast) {
            cloud.moveObject({
                srcPath: cloud.context.fileMover.cutObjects[index].path,
                targetPath: targetPath,
                isDir: cloud.context.fileMover.cutObjects[index].fileType == "folder"
            },
                function () {
                    self.pasteObjectFinally(isLast);
                },
                function (e) {
                    cloud.pages.directoryView.moveError = true;
                    cloud.pages.directoryView.moveErrorType = e;
                    self.pasteObjectFinally(isLast);
                });
        },

        // Final actions to perform after any outcome of a file movement
        pasteObjectFinally: function(isLast) {
            if (isLast) {
                if (cloud.pages.directoryView.moveError) {
                    if (cloud.pages.directoryView.moveErrorType == "IDENTICAL") {
                        cloud.functions.showNotification(cloud.translate("IDENTICALINDEX"), cloud.translate("IDENTICALINDEXTEXT"), "/images/notifications/warning.png");
                    } else if (cloud.pages.directoryView.moveErrorType == "RECURSION") {
                        cloud.functions.showMessageDialog("RECURSIONTEXT");
                    } else {
                        cloud.functions.showMessageDialog("MOVEERRORGENERAL");
                    }
                } else { /* success */
                    cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FILEMOVED"), "/images/notifications/success.png");
                }

                document.getElementById("operationPending").style.visibility = 'hidden';

                // Reset variables
                cloud.context.fileMover.cutObjects = [];
                cloud.pages.directoryView.moveError = false;
                cloud.pages.directoryView.moveErrorType = null;

                // Back to file browser
                self.leaveFileMover();
            }
        },

        // Open file mover context
        moveObject: function (path, isLast) {
            var currentState = Windows.UI.ViewManagement.ApplicationView.value;
            if (currentState === Windows.UI.ViewManagement.ApplicationViewState.snapped &&
                !Windows.UI.ViewManagement.ApplicationView.tryUnsnap()) {
                // Fail silently if we can't unsnap
                return;
            }

            var selectionContent = cloud.functions.analyzeSelection(listView.selection);
            if (selectionContent.size == 0) {
                // Nothing to move
                return; 
            }

            cloud.context.fileMover.isFileMover = true; // switch to file mover context
            cloud.context.fileMover.cutObjects = selectionContent.onlyNormalItems;
        
            //Navigation zurücksetzen
            cloud.resetNavigation();

            // Open file mover by navigating to directoryView in fileMover context
            if (selectionContent.containsDeletedItems || selectionContent.containsSharedItems) {
                // Inform user about non-moveable items first
                cloud.functions.showMessageDialog("MOVENOTPOSSIBLEERROR", function () {
                    if (selectionContent.containsNormalItems) {
                        WinJS.Navigation.navigate("/pages/directoryView/directoryView.html");
                    }
                });
            } else {
                WinJS.Navigation.navigate("/pages/directoryView/directoryView.html");
            }
        },

        // Leave file mover / shareTarget (= folder view of directory structure)
        leaveFileMover: function () {
            // Reset context and variables
            cloud.context.fileMover.isFileMover = false;
            cloud.context.fileMover.cutObjects = [];

            // Reload directory in normal context
            cloud.resetNavigation();
            WinJS.Navigation.navigate("/pages/directoryView/directoryView.html");
        },

        // Create new folder
        createFolder: function () {
            // Show progress bar
            document.getElementById("operationPending").style.visibility = 'visible';

            var targetPath = cloud.getNavigationPathCurrent();
            var folderName = document.getElementById('folderNameInput').value;

            // Create folder
            cloud.createFolder({ path: targetPath, folderName: folderName },
                function () { /*success*/
                    cloud.functions.showNotification(cloud.translate("ACTIONCOMPLETE"), cloud.translate("FOLDERCREATED"), "/images/notifications/success.png");
                    document.getElementById("operationPending").style.visibility = 'hidden';
                    document.getElementById('folderNameInput').value = "";

                    // Reload folder if it is still current folder
                    self.loadFolder(false, targetPath);
                },
                function (e) { /*error*/
                    if (e && e == "NONAME") {
                        cloud.functions.showMessageDialog("NONAMETEXT");
                    } else {
                        cloud.functions.showMessageDialog("FOLDERNOTCREATED");
                    }
                    document.getElementById("operationPending").style.visibility = 'hidden';
                });
        },

        // Open file history flyout
        showHistoryFlyout: function () {
            if (cloud.hasFunctionality({ functionkey: "getFileHistory" })) {
                if (listView.selection.count() == 1) {
                    var selectedItem = self.getSelectedItem();
                    if (selectedItem.fileType != "folder" && !selectedItem.deleted) {

                        // Provide file to flyout
                        cloud.context.history.file = selectedItem;
                        WinJS.UI.SettingsFlyout.showSettings("history", "/settings/html/history.html");
                    }
                }
            }
        },

        // Open share flyout
        openShareFlyout: function () {
            if (cloud.hasFunctionality({ functionkey: "getPublicLink" }) || cloud.hasFunctionality({ functionkey: "shareFile" })) {
                if (listView.selection.count() == 1) {
                    var selectedItem = self.getSelectedItem();
                    if (!selectedItem.deleted && selectedItem.path != "/Shared") {

                        // Provide file to flyout
                        cloud.context.share.file = selectedItem;
                        WinJS.UI.SettingsFlyout.showSettings("share", "/settings/html/share.html");
                    }
                }
            }
        },

        // Open sorting flyout
        openSortFlyout: function () {
            document.getElementById("sortFlyout").winControl.show(sortButton, "auto");

            if (cloud.pages.directoryView.currentSortType == "name") {
                document.getElementById("sortByName").style.backgroundColor = "#009DD1";
                document.getElementById("sortBySize").style.backgroundColor = "white";
            } else {
                document.getElementById("sortByName").style.backgroundColor = "white";
                document.getElementById("sortBySize").style.backgroundColor = "#009DD1";
            }
        },

        // Start OCR analysis: send to fileee if supported by owncloudPlugin
        recognizeTextFromPicture: function () {
            var count = listView.selection.count();

            // Check for functionality
            if (cloud.hasFunctionality({ functionkey: "fileee" })) {
                // If one element was selected
                if (count == 1) {
                    var selectedItem = self.getSelectedItem();
                    cloud.fileeeAnalyse({ path: selectedItem.path, isDir: selectedItem.fileType == "folder" },
                        function () { //success
                            cloud.functions.showMessageDialog("FILEEEANALYSESTARTED");
                        },
                        function (message) { //error
                            if (message) {
                                cloud.functions.showMessageDialog(message);
                            } else {
                                cloud.functions.showMessageDialog("FILEEEANALYSEERROR");
                            }
                    });
                }
            }
        },

        /* PDF gestures */
		// Define gesture interaction target
        setGestureTarget: function (obj) {
            var preview = document.getElementById(obj);
            var msGesture = new MSGesture();
            msGesture.target = preview;
            preview.gesture = msGesture;
            preview.gesture.pointerType = null;

            // Pointerarray to follow pointer
            preview.pointers = [];

            // Register events for gestures
            preview.addEventListener("MSPointerDown", this.onMSPointerDown, false);
            preview.addEventListener("MSGestureChange", this.onMSGestureChange, false);
            preview.addEventListener("MSGestureEnd", this.onMSGestureEnd, false);
        },

        // Eventhandler to push down
        onMSPointerDown: function (e) {
            // Add pointers
            if (this.gesture.pointerType === null) {
                // First contact
                this.gesture.addPointer(e.pointerId);
                this.gesture.pointerType = e.pointerType;
            } else if (e.pointerType === this.gesture.pointerType) {
                // Subsequent contact
                this.gesture.addPointer(e.pointerId);
            } else {
                // New gesture
                var msGesture = new MSGesture();
                msGesture.target = e.target;
                e.target.gesture = msGesture;
                e.target.gesture.pointerType = e.pointerType;
                e.target.gesture.addPointer(e.pointerId);
            }
        },

        // Gesture change to swipe, rotate and zoom
        onMSGestureChange: function (e) {
            // PDF gesture
            if (this == document.getElementById("pdfPreview")) {
                if (e.scale < 1) {
                    // Negative zoom
                    cloud.functions.pdfZoomOut();
                } else if (e.scale > 1) {
                    // Positive zoom
                    cloud.functions.pdfZoomIn()
                }

                // In case of first contact on PDF
                if (cloud.pages.directoryView.newGesture) {
                    if (e.translationX < -10) {
                        // X-axis negative movement
                        cloud.functions.pdfGoNext();
                        cloud.pages.directoryView.newGesture = false;
                    } else if (e.translationX > 10) {
                        // X-axis positive movement
                        cloud.functions.pdfGoPrevious();
                        cloud.pages.directoryView.newGesture = false;
                    }
                }
            }
        },

        // Gesture end
        onMSGestureEnd: function (e){
            if(e.target === this){
                // Reset new gesture flag
                cloud.pages.directoryView.newGesture = true;
            }
        },
    });
})();
