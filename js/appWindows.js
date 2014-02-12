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
// Generall App functions for the windows app
if (!cloud.functions) {
    cloud.functions = {};
}

cloud.functions.translateApp = function () {
    // Translate page
    cloud.translateAll();

    // Translate charmbar settings and register them
    WinJS.Application.onsettings = function (e) {
        if (cloud.isLoggedIn()) {
            e.detail.applicationcommands = {
                "general": { title: cloud.translate("GENERAL"), href: "/settings/html/general.html" },
                "account": { title: cloud.translate("ACCOUNT"), href: "/settings/html/account.html" },
                "help": { title: cloud.translate("HELP"), href: "/settings/html/help.html" },
                "about": { title: cloud.translate("ABOUT"), href: "/settings/html/about.html" },
            };
        } else {
            e.detail.applicationcommands = {
                "general": { title: cloud.translate("GENERAL"), href: "/settings/html/general.html" },
                "register": { title: cloud.translate("NEWUSER"), href: "/settings/html/register.html" },
                "help": { title: cloud.translate("HELP"), href: "/settings/html/help.html" },
                "about": { title: cloud.translate("ABOUT"), href: "/settings/html/about.html" },
            };
        }

        WinJS.UI.SettingsFlyout.populateSettings(e);
    };
}

// Show charmbar account flyout
cloud.functions.showAccountSettings = function () {
    WinJS.UI.SettingsFlyout.showSettings("account", "/settings/html/account.html");
}

// Show charmbar help flyout
cloud.functions.showHelpSettings = function () {
    WinJS.UI.SettingsFlyout.showSettings("help", "/settings/html/help.html");
}

// Set backend and do login
cloud.functions.login = function (authObj, serverObj, successFunction, errorFunction) {
    var backendType = new Object();
    if (cloud.session.selectedServerType == "manual") {
        if (serverObj.manualServerType == 1) { //OC
            backendType = new Object({
                type: "owncloud",
                host: serverObj.manualCloudServer,
                relativePath: serverObj.manualDocumentPath
            });
        }
        else if (serverObj.manualServerType == 2) { //SP
            backendType = new Object({
                type: "sharepoint",
                host: serverObj.manualCloudServer,
                relativePath: serverObj.manualDocumentPath
            });
        }
    } else if (typeof cloud.session.selectedServer !== "undefined" && cloud.session.selectedServer != "") {
        backendType = {
            type: "config",
            host: cloud.session.selectedServer
        };
    }

    // upload and download parameters
    backendType.uploadFunction = cloud.functions.uploadFile;
    backendType.downloadFunction = cloud.functions.downloadFile;

    // Set backend and log in
    var setBackendResult = cloud.setBackend(backendType);
    if (setBackendResult === true) {
        cloud.doAuthentication(authObj, successFunction, errorFunction);
    } else {
        errorFunction(setBackendResult);
    }
}

cloud.functions.tryAutoLogin = function (tryAutoLogin, path) {
    if (tryAutoLogin) {
        // Read data from session storage
        var storage = Windows.Storage.ApplicationData.current.roamingSettings;
        var authObj = new Object({
            username: storage.values["username"],
            password: storage.values["password"]
        });

        var serverObj = new Object({
            selectedServerType: storage.values["selectedServerType"],
            selectedServer: storage.values["selectedServer"],
            manualCloudServer: storage.values["manualCloudServer"],
            manualDocumentPath: storage.values["manualDocumentPath"],
            manualServerType: storage.values["manualServerType"]
        });

        if (typeof path === "undefined") {
            path = "/pages/directoryView/directoryView.html";
        }
        cloud.functions.login(authObj, serverObj, function () {
            // On success skip login page
            WinJS.Navigation.navigate(path);

            // Avoid shówing login page in navigation stack
            WinJS.Navigation.history.backStack = [];
        }, function () {
            // On error go to login page 
            WinJS.Navigation.navigate(Application.navigator.home);
        });
    } else {
        // Skip autologin and go to home page
        WinJS.Navigation.navigate(Application.navigator.home);
    }
}

// Logout function
cloud.functions.logout = function () {
    //Cancel current transfers
    cloud.cancelTransfer({ type: "preview" });
    cloud.cancelTransfer({ type: "download" });
    cloud.cancelTransfer({ type: "share" });
    cloud.cancelTransfer({ type: "upload" });

    //Reset settings
    var appData = Windows.Storage.ApplicationData.current;
    var roamingSettings = appData.roamingSettings;

    roamingSettings.values["password"] = "";

    cloud.setLoggedIn({ "loginStatus": false });
    roamingSettings.values["loginStatus"] = false;

    cloud.session.tryAutoLogin = false;
    // Clear navigation lists
    cloud.resetNavigation();

    // Clear selections
    cloud.pages.directoryView.selectedDirectoryContent = [];
    WinJS.Application.sessionState.selectedDirectoryContent = [];

    // Reset Codemirror Editor reference to avoid crash on future login (editor open before shutdown -> try to reopen editor next time)
    cloud.pages.directoryView.editor = "";

    // Go to login page
    WinJS.Navigation.navigate("/pages/home/home.html");
};

// Reset all local settings
cloud.functions.resetSettings = function () {
    Windows.Storage.ApplicationData.current.clearAsync();
    cloud.functions.logout();
};

// Show notification window
cloud.functions.showNotification = function (title, message, imageSrc) {
    var Notifications = Windows.UI.Notifications;
    var ToastContent = NotificationsExtensions.ToastContent;

    // Create the toast content using the notifications content library
    var content = ToastContent.ToastContentFactory.createToastImageAndText02();
    content.textHeading.text = title;
    content.textBodyWrap.text = message;

    content.image.src = imageSrc;
    var altText = "Image";
    content.image.alt = altText;

    // Create a toast, then create a ToastNotifier object to send the toast
    var toast = content.createNotification();
    Notifications.ToastNotificationManager.createToastNotifier().show(toast);
}

/*
Windows download function
@param obj = {
    path        (string)    full path without filename
    fileName    (string)    filename
    fileType    (string)    filetype
    username    (string)    username
    password    (string)    password
    type        (string)    downloadtyp for transfer manager
    }
*/
cloud.functions.downloadFile = function (obj, successCallback, errorCallback, targetFile, totalSize) {
    // Checks
    if (typeof totalSize == "undefined" || !cloud.functions.beforeTransfer(obj, totalSize)) {
        errorCallback();
        return;
    }

    if (!targetFile) {
        if (obj.length == 1) { // Nur eine Datei gewählt
            var uriString = obj[0].path + obj[0].fileName + obj[0].fileType;

            // Create the picker object and set options
            var savePicker = new Windows.Storage.Pickers.FileSavePicker();
            savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;
            // Dropdown of file types the user can save the file as
            if (obj[0].fileType) {
                savePicker.fileTypeChoices.insert("", [obj[0].fileType]);
            } else { //Sofern Datei keine Dateiendung hat --> Hack to force the File Save Picker to allow any file type
                savePicker.fileTypeChoices.insert("Any", ["."]);
            }
            // Default file name if the user does not type one in or select a file to replace
            savePicker.suggestedFileName = obj[0].fileName;

            // Open picker
            savePicker.pickSaveFileAsync().then(function (newFile) {
                if (!newFile) {
                    // Es wurde nichts ausgewählt
                    cloud.pages.directoryView.operationPending.style.visibility = 'hidden';
                    return;
                }
                cloud.functions.processDownload(obj[0], successCallback, errorCallback, uriString, newFile, true);
            }, function (error) {
                cloud.debug("File picker for download with error: " + error);
                errorCallback();
            });
        } else { // multiple files selected
            // Create the picker object and set options
            var folderPicker = new Windows.Storage.Pickers.FolderPicker;
            folderPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;
            // Users expect to have a filtered view of their folders depending on the scenario.
            // For example, when choosing a documents folder, restrict the filetypes to documents for your application.
            //folderPicker.fileTypeFilter.replaceAll("Any", ["."]);
            folderPicker.fileTypeFilter.replaceAll(["*"]);

            folderPicker.pickSingleFolderAsync().then(function (folder) {
                if (folder) {
                    // Application now has read/write access to all contents in the picked folder (including sub-folder contents)
                    // Cache folder so the contents can be accessed at a later time
                    // Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.addOrReplace("PickedFolderToken", folder);

                    for (var i = 0; i < obj.length; i++) {
                        cloud.functions.processSingleMultiDownload(obj[i], folder, successCallback, errorCallback, i == obj.length - 1);
                    }
                } else {
                    // The picker was dismissed with no selected file
                    cloud.pages.directoryView.operationPending.style.visibility = 'hidden';
                }
            });
        }
    } else { // Save single file in specific file
        var uriString = obj[0].path + obj[0].fileName + obj[0].fileType;
        cloud.functions.processDownload(obj[0], successCallback, errorCallback, uriString, targetFile, true);
    }
}

/**
Create empty file for each file of a multi download and download content
Otherwise loop continues before asynchronous success callback is called
*/
cloud.functions.processSingleMultiDownload = function (obj, folder, successCallback, errorCallback, isLast) {
    folder.createFileAsync(obj.fileName + obj.fileType, Windows.Storage.CreationCollisionOption.generateUniqueName).then(function (file) {
        var uriString = obj.path + obj.fileName + obj.fileType;
        cloud.functions.processDownload(obj, successCallback, errorCallback, uriString, file, isLast);
    });
}

// Perform download and save in targetFile
cloud.functions.processDownload = function (obj, successCallback, errorCallback, uriString, targetFile, isLast) {
    var uri = Windows.Foundation.Uri(uriString);

    // Skip currently running file preview downloads
    if (obj.type && obj.type == "preview") {
        cloud.cancelTransfer({ type: "preview" });
    } else if (obj.type && obj.type == "download") {
        cloud.cancelTransfer({ type: "download" });
    } else if (obj.type && obj.type == "share") {
        cloud.cancelTransfer({ type: "share" });
    }

    // Background worker to download the files
    var downloader = new Windows.Networking.BackgroundTransfer.BackgroundDownloader();
    downloader.serverCredential = new Windows.Security.Credentials.PasswordCredential("unnecessary", obj.username, obj.password);

    // Create a new download operation
    download = downloader.createDownload(uri, targetFile);

    // Start the download and persist the promise to be able to cancel the download.
    promise = download.startAsync().then(
        function () {
            cloud.debug("File download completed");
            $(cloud.pages.directoryView.downloadProgressBar).addClass("invisible");
            $(cloud.pages.directoryView.downloadProgressBarLabel).addClass("invisible");
            cloud.pages.directoryView.downloadProgressBar.value = 0;
            // Remove from our transfer manager if completed
            cloud.removeTransfer({ promise: promise });
            successCallback(isLast);
        },
        function (error) {
            cloud.debug("File download with error: " + error);
            // Remove from our transfer manager if failed
            cloud.removeTransfer({ promise: promise });
            errorCallback(error, isLast);
        },
        function (e) {
            var progress = cloud.updateTransferStatus({
                promise: promise,
                bytesTransfered: e.progress.bytesReceived,
                bytesTotal: e.progress.totalBytesToReceive
            });

            $(cloud.pages.directoryView.downloadProgressBar).removeClass("invisible");
            $(cloud.pages.directoryView.downloadProgressBarLabel).removeClass("invisible");
            cloud.pages.directoryView.downloadProgressBar.value = progress;
        });

    // Add to our transfer manager
    if (obj.type && obj.type == "preview") {
        cloud.addTransfer({ promise: promise, type: "preview" });
    } else if (obj.type && obj.type == "share") {
        cloud.addTransfer({ promise: promise, type: "share" });
    } else {
        cloud.addTransfer({ promise: promise, type: "download" });
    }
}

/*
Windows upload function
@param obj = {
    dirName     (string)    target path without filename
    username    (string)    username
    password    (string)    password
    }
*/
cloud.functions.uploadFile = function (obj, successCallback, errorCallback, file) {
    // Otherwise choose file from filepicker
    if (!file) {
        // Create the picker object and set options
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;

        // Upload any file type
        openPicker.fileTypeFilter.replaceAll(["*"]);

        openPicker.pickMultipleFilesAsync().then(function (files) {
            if (files.size < 1) {
                // Es wurde nichts ausgewählt
                cloud.pages.directoryView.operationPending.style.visibility = 'hidden';
                return;
            }

            for (var i = 0; i < files.size; i++) {
                var srcFile = files[i];
                cloud.functions.getFileSizeForUpload(obj, successCallback, errorCallback, srcFile, i == files.size - 1);
            }
        }, function (error) {
            cloud.debug("Error: " + error);
            errorCallback();
        });
        // Direct upload if file is already provided
    } else {
        cloud.functions.getFileSizeForUpload(obj, successCallback, errorCallback, file, true);
    }
}

cloud.functions.getFileSizeForUpload = function (obj, successCallback, errorCallback, srcFile, isLast) {
    if (!obj.fileSize) {
        // Find out filesize of file to upload
        srcFile.getBasicPropertiesAsync().then(function (basicProperties) {
            obj.fileSize = basicProperties.size;
            cloud.functions.processUpload(obj, successCallback, errorCallback, srcFile, isLast);
        },
        function (error) {
            cloud.debug("Error: " + error);
            errorCallback();
        });
    } else {
        cloud.functions.processUpload(obj, successCallback, errorCallback, srcFile, isLast);
    }
}

cloud.functions.processUpload = function (obj, successCallback, errorCallback, srcFile, isLast) {
    console.log("Upload-Size: " + obj.fileSize);

    // Checks
    if (typeof obj.fileSize == "undefined" || !cloud.functions.beforeTransfer(obj, obj.fileSize)) {
        errorCallback();
        return;
    }

    // Background worker to upload file
    var uri = Windows.Foundation.Uri(obj.path + srcFile.name);
    var uploader = new Windows.Networking.BackgroundTransfer.BackgroundUploader();
    uploader.setRequestHeader("Authorization", "Basic " + obj.authToken);
    uploader.method = "PUT";
    // Create a new download operation.
    upload = uploader.createUpload(uri, srcFile);

    // Start the upload and persist the promise to be able to cancel the upload.
    promise = upload.startAsync().then(
        function () {
            cloud.debug("File upload complete");
            $(cloud.pages.directoryView.uploadProgressBarLabel).addClass("invisible");
            $(cloud.pages.directoryView.uploadProgressBar).addClass("invisible");
            cloud.pages.directoryView.uploadProgressBar.value = 0;
            // Remove from our transfer manager if completed
            cloud.removeTransfer({ promise: promise });
            successCallback(srcFile.name, isLast);
        },
        function (error) {
            cloud.debug("File upload error: " + error);
            // Remove from our transfer manager if completed
            cloud.removeTransfer({ promise: promise });
            errorCallback(isLast);
        },
        function (e) {
            var progress = cloud.updateTransferStatus({
                promise: promise,
                bytesTransfered: e.progress.bytesSent,
                bytesTotal: e.progress.totalBytesToSend
            });

            $(cloud.pages.directoryView.uploadProgressBarLabel).removeClass("invisible");
            $(cloud.pages.directoryView.uploadProgressBar).removeClass("invisible");
            cloud.pages.directoryView.uploadProgressBar.value = progress;
        });

    // Add to our transfer manager
    cloud.addTransfer({ promise: promise, type: "upload" });
}

/*
Checks befor file transfer: Get user authorization explicitly in limited networks
(App certification requirement)
*/
cloud.functions.beforeTransfer = function (obj, totalSize) {
    // TODO: Test with limits and outside of home network

    if (obj.userAgrees) {
        return true;
    }

    if (obj && typeof totalSize !== "undefined") {
        var networkInfo = Windows.Networking.Connectivity.NetworkInformation;
        var internetProfile = networkInfo.getInternetConnectionProfile();

        var currentCostType = internetProfile.getConnectionCost();
        var allCostTypes = Windows.Networking.Connectivity.NetworkCostType;

        if (currentCostType === allCostTypes.variable || currentCostType === allCostTypes.fixed) {
            // Limited network, check maximum transfer size
            var dataPlanStatus = internetProfile.getDataPlanStatus();
            if (dataPlanStatus) {
                var maxTransferSizeInMegabytes = dataPlanStatus.maxTransferSizeInMegabytes;
                console.log("Max transfer size: " + maxTransferSizeInMegabytes);
                if (maxTransferSizeInMegabytes !== null && totalSize / 1000000 > maxTransferSizeInMegabytes) {

                    // User notification
                    var messageDialog = new Windows.UI.Popups.MessageDialog(cloud.translate("UPLOADRANGE"), cloud.translate("UPLOADRANGEMESSAGE"));
                    messageDialog.commands.append(new Windows.UI.Popups.UICommand(cloud.translate("YES"), function (command) {
                        // User agrees
                        console.log("Resume upload clicked yes");
                        return true;
                    }));
                    messageDialog.commands.append(new Windows.UI.Popups.UICommand(cloud.translate("NO"), function (command) {
                        // User denies
                        console.log("Resume upload clicked no");
                        return false;
                    }));
                    messageDialog.showAsync();
                }
            }
        }
        return true;
    } else {
        return false;
    }
};

// Open file in external viewer
cloud.functions.openFileFromSystem = function (targetFile) {
    var options = new Windows.System.LauncherOptions();
    options.displayApplicationPicker = true;

    Windows.System.Launcher.launchFileAsync(targetFile, options).then(function (success) {
        if (success) {
            console.log('File opened externally');
        } else {
            console.log("Couldn't open file");
        }
    });
}

cloud.functions.showPDF = function (file) {
    // Get content as Uint8Array
    Windows.Storage.FileIO.readBufferAsync(file).done(
        function (buffer) {
            var myArray = new Uint8Array(buffer.length);

            var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
            dataReader.readBytes(myArray)
            dataReader.close();

            PDFJS.disableWorker = true;

            PDFJS.getDocument(myArray).then(function (pdf) {
                cloud.pages.directoryView.pdfDoc = pdf;
                cloud.pages.directoryView.pdfPageNum = 1;
                cloud.pages.directoryView.pdfCurrentZoom = 1.0;
                cloud.pages.directoryView.pdfMaxZoom = 1.0;
                cloud.pages.directoryView.pdfPageNumDOM.value = cloud.pages.directoryView.pdfPageNum;
                cloud.functions.renderPage(cloud.pages.directoryView.pdfPageNum, cloud.pages.directoryView.pdfCurrentZoom);
            }, function (error) {
                console.log(error);
            }, function (progress) {
                console.log(progress);
            });
        }
    );
}

cloud.functions.renderPage = function (num, scale) {
    // Using promise to fetch the page
    cloud.pages.directoryView.pdfDoc.getPage(num).then(function (page) {
        try {
            // Remove old page
            $('#pdfPreview > canvas').remove();

            // Prepare canvas using PDF page dimensions
            var canvas = document.createElement("canvas");
            var flipViewDOM = document.getElementById("pdfPreview");
            flipViewDOM.appendChild(canvas);

            var context = canvas.getContext('2d');

            // Get initial viewport size to calculate maxmimum scale
            var viewport = page.getViewport(1); // default scale
            var tmpScale = (document.getElementById("contentGrid").clientHeight - 10) / viewport.height;
            cloud.pages.directoryView.pdfMaxZoom = tmpScale;

            if (scale != 1) {
                // In case a specific scale was passed take this one first
                viewport = page.getViewport(scale);
                cloud.pages.directoryView.pdfCurrentZoom = scale;
            } else if (tmpScale > 1 || tmpScale < 1) {
                viewport = page.getViewport(tmpScale);
                cloud.pages.directoryView.pdfCurrentZoom = tmpScale;
            }

            // Set canvas dimensions
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            page.render({ canvasContext: context, viewport: viewport });
            $('#sectionWrap').scrollTo($('#previewTag'), 0, { axis: 'x' });
        } catch (error) {
            console.log(e);
        }
    });
}

// Jump to specific page
cloud.functions.pdfGoToPage = function () {
    var pageNum = cloud.pages.directoryView.pdfPageNumDOM.value;
    if (pageNum >= 1 && pageNum <= cloud.pages.directoryView.pdfDoc.numPages) {
        cloud.pages.directoryView.pdfPageNum = pageNum;
        cloud.functions.renderPage(pageNum, cloud.pages.directoryView.pdfCurrentZoom);
    }
};

// Go to previous PDF page
cloud.functions.pdfGoPrevious = function () {
    if (cloud.pages.directoryView.pdfPageNum <= 1)
        return;
    cloud.pages.directoryView.pdfPageNum--;
    cloud.pages.directoryView.pdfPageNumDOM.value = cloud.pages.directoryView.pdfPageNum;
    cloud.functions.renderPage(cloud.pages.directoryView.pdfPageNum, cloud.pages.directoryView.pdfCurrentZoom);
}

// Go to next PDF page
cloud.functions.pdfGoNext = function () {
    if (cloud.pages.directoryView.pdfPageNum >= cloud.pages.directoryView.pdfDoc.numPages)
        return;
    cloud.pages.directoryView.pdfPageNum++;
    cloud.pages.directoryView.pdfPageNumDOM.value = cloud.pages.directoryView.pdfPageNum;
    cloud.functions.renderPage(cloud.pages.directoryView.pdfPageNum, cloud.pages.directoryView.pdfCurrentZoom);
}

cloud.functions.pdfZoomOut = function () {
    if (cloud.pages.directoryView.pdfCurrentZoom <= 0.2)
        return;
    var pdfScale = cloud.pages.directoryView.pdfCurrentZoom - 0.1;
    cloud.functions.renderPage(cloud.pages.directoryView.pdfPageNum, pdfScale);
}

cloud.functions.pdfZoomIn = function () {
    if (cloud.pages.directoryView.pdfCurrentZoom >= cloud.pages.directoryView.pdfMaxZoom)
        return;
    var pdfScale = cloud.pages.directoryView.pdfCurrentZoom + 0.1;
    cloud.functions.renderPage(cloud.pages.directoryView.pdfPageNum, pdfScale);
}

// Show notification window
var waitingForMessageDialog = false;
cloud.functions.showMessageDialog = function (translateKey, callback) {
    if (!callback) {
        callback = function () { /* do nothing */ }
    }

    // App tries to show message twice which leads to crash if not handled
    if (!waitingForMessageDialog) {
        waitingForMessageDialog = true;
        messageDialog = new Windows.UI.Popups.MessageDialog(cloud.translate(translateKey));
        messageDialog.showAsync().done(function () {
            callback();
            waitingForMessageDialog = false;
        });
    }
}

cloud.functions.showFlyout = function (flyout, anchor, placement) {
    flyout.winControl.show(anchor, placement);
}

/*
Analyze a listview selection concerning shared or deleted items and split the content for further processing
@return obj = {
    containsSharedItems     (boolean)   does the selection contain files/folders in the "shared" folder or the "shared" folder itself
    containsDeletedItems    (boolean)   does the selection contain deleted files/folders
    containsNormalItems     (boolean)   does the selection contain non-deleted files/folders
    containsFolders         (boolean)   does the selection contain non-deleted folders
    containsFiles           (boolean)   does the selection contain non-deleted files
    onlyDeletedItems        (Array)     list of all deleted files/folders
    onlySharedItems         (Array)     list of all shared files/folders, including the "shared" folder itself
    onlyNormalItems         (Array)     list of all non-deleted files/folders
    onlyFolders             (Array)     list of all shared folders
    onlyFiles               (Array)     list of all shared files
    allItems                (Array)     list of all items in the selection
    size                    (integer)   number of items in the selection
*/
cloud.functions.analyzeSelection = function (selection) {
    var onlySharedItems = [];
    var onlyDeletedItems = [];
    var onlyNormalItems = []
    var onlyFolders = [];
    var onlyFiles = [];
    var allItems = [];

    var indices = selection.getIndices();
    for (var i = 0; i < selection.count() ; i++) {
        var selectedItem = cloud.pages.directoryView.listViewItems.getAt(indices[i]); // TODO make independent of directoryview
        if (selectedItem.deleted) {
            onlyDeletedItems.push(selectedItem);
        } else if (selectedItem.path.indexOf("/Shared") == 0) {
            onlySharedItems.push(selectedItem);
        } else if (selectedItem.fileType == "folder") {
            onlyFolders.push(selectedItem);
            onlyNormalItems.push(selectedItem);
        } else {
            onlyFiles.push(selectedItem);
            onlyNormalItems.push(selectedItem);
        }
        allItems.push(selectedItem);
    }

    return {
        "containsSharedItems": onlySharedItems.length > 0,
        "containsDeletedItems": onlyDeletedItems.length > 0,
        "containsNormalItems": onlyNormalItems.length > 0,
        "containsFolders": onlyFolders.length > 0,
        "containsFiles": onlyFiles.length > 0,
        "onlySharedItems": onlySharedItems,
        "onlyDeletedItems": onlyDeletedItems,
        "onlyNormalItems": onlyNormalItems,
        "onlyFolders": onlyFolders,
        "onlyFiles": onlyFiles,
        "allItems": allItems,
        "size": allItems.length
    }
}