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
var pdfScale;
var initialScale;
var counter;


// Allgemeine App-Funktionen für die Windows-App definieren
if (!cloud.functions) {
    cloud.functions = {};
}

cloud.functions.translateApp = function () {
    // Seite übersetzen
    cloud.translateAll();

    // Charmbar-Settings übersetzen und registrieren
    WinJS.Application.onsettings = function (e) {
        if (cloud.isLoggedIn()) {
            e.detail.applicationcommands = {
                "general":  { title: cloud.translate("GENERAL"), href: "/settings/html/general.html" },
                "account":  { title: cloud.translate("ACCOUNT"), href: "/settings/html/account.html" },
                "help":     { title: cloud.translate("HELP"), href: "/settings/html/help.html" },
                "about":    { title: cloud.translate("ABOUT"), href: "/settings/html/about.html" },
            };
        } else {
            e.detail.applicationcommands = {
                "general":  { title: cloud.translate("GENERAL"), href: "/settings/html/general.html" },
                "register": { title: cloud.translate("NEWUSER"), href: "/settings/html/register.html" },
                "help":     { title: cloud.translate("HELP"), href: "/settings/html/help.html" },
                "about": { title: cloud.translate("ABOUT"), href: "/settings/html/about.html" },
            };
        }

        WinJS.UI.SettingsFlyout.populateSettings(e);
    };
}

//Zeige Account Menü
cloud.functions.showAccountSettings = function () {
    WinJS.UI.SettingsFlyout.showSettings("account", "/settings/html/account.html");
}

//Zeige Help Menü
cloud.functions.showHelpSettings = function () {
    WinJS.UI.SettingsFlyout.showSettings("help", "/settings/html/help.html");
}

cloud.functions.login = function (authObj, serverObj, successCallback, errorCallback) {
    //MANUELLE SERVERKONFIGURATION
    if (serverObj.selectedServerType == "manual") {
        //BACKEND-TYP wählen...
        //Pfad zum Server
        if (serverObj.manualServerType == 1) { //OC
            var backendType = new Object({ type: "owncloud", host: serverObj.manualCloudServer, relativePath: serverObj.manualDocumentPath /*port: serverObj.manualCloudPort*/ });
        }
        else if (serverObj.manualServerType == 2) { //SP
            var backendType = new Object({ type: "sharepoint", host: serverObj.manualCloudServer, relativePath: serverObj.manualDocumentPath /*port: serverObj.manualCloudPort*/ });
        }
    }
        //Vorkonfiguriert
    else if (serverObj.selectedServerType) {
        var backendType = { type: "config", host: serverObj.selectedServer };
    }

    // Upload und Download
    backendType.uploadFunction = cloud.functions.uploadFile;
    backendType.downloadFunction = cloud.functions.downloadFile;

    //Backend festlegen und Anmelden
    if (backendType && authObj.password != "") {
        if (cloud.setBackend(backendType)) {
            cloud.doAuthentication(authObj, successCallback, errorCallback);
        } else {
            errorCallback("NOBACKEND");
        }
    }
    else {
        //Sofern es ein Atuologin war (start der App) und Login fehlgeschlagen ist, soll die Fehlermeldung nicht direkt bei Appstart angezeigt werden
        errorCallback();
    }
}

cloud.functions.tryAutoLogin = function (tryAutoLogin, path) {
    if (tryAutoLogin) {
        //LOGIN-Daten auslesen
        var authObj = new Object({
            username: Windows.Storage.ApplicationData.current.roamingSettings.values["username"],
            password: Windows.Storage.ApplicationData.current.roamingSettings.values["password"]
        });
        //Server auslesen
        var serverObj = new Object({
            selectedServerType: Windows.Storage.ApplicationData.current.roamingSettings.values["selectedServerType"],
            selectedServer: Windows.Storage.ApplicationData.current.roamingSettings.values["selectedServer"],
            manualCloudServer: Windows.Storage.ApplicationData.current.roamingSettings.values["manualCloudServer"],
            manualDocumentPath: Windows.Storage.ApplicationData.current.roamingSettings.values["manualDocumentPath"],
            //manualCloudPort: Windows.Storage.ApplicationData.current.roamingSettings.values["manualCloudPort"],
            manualServerType: Windows.Storage.ApplicationData.current.roamingSettings.values["manualServerType"]
        });

        if (typeof path === "undefined") {
            path = "/pages/directoryView/directoryView.html";
        }
        cloud.functions.login(authObj, serverObj, function () { cloud.functions.autoLoginSuccess(path); }, cloud.functions.autoLoginError);
    } else {
        cloud.functions.autoLoginError();
    }
}

//Login erfolgreich --> Überspringe die Loginseite
cloud.functions.autoLoginSuccess = function (path) {
        cloud.setLoggedIn({ loginStatus: true });

        //Navigieren zur Verzeichnisansicht
        WinJS.Navigation.navigate(path);

        //Vermeiden, dass die Loginseite im Zurück-Pfad angezeigt wird
        WinJS.Navigation.history.backStack = [];
}

//Autologin fehlgeschlafen --> Navigiere zur Loginseite (Home)
cloud.functions.autoLoginError = function () {
    WinJS.Navigation.navigate(Application.navigator.home);
}

//Logout-Funktion:
cloud.functions.logout = function () {
    //Laufende Downloads und Uploads unterbrechen
    cloud.cancelTransfer({ type: "preview" });
    cloud.cancelTransfer({ type: "download" });
    cloud.cancelTransfer({ type: "share" });
    cloud.cancelTransfer({ type: "upload" });

    //Reset settings
    var appData = Windows.Storage.ApplicationData.current;
    var roamingSettings = appData.roamingSettings;

    roamingSettings.values["username"] = "";
    roamingSettings.values["password"] = "";

    cloud.setLoggedIn({ loginStatus: false });
    roamingSettings.values["loginStatus"] = false;

    cloud.session.tryAutoLogin = false;
    //Leere Navigationslisten
    cloud.resetNavigation();

    //Leere Selektionen
    //Selektion leeren
    cloud.pages.directoryView.selectedDirectoryContent = [];
    WinJS.Application.sessionState.selectedDirectoryContent = [];


    //Codemirror Editor Verweis zurücksetzten um einen Crash beim erneuten Login zu vermeiden --> Ausloggen mit angezeigten Editor und anschließend öffnen einer neuen Vorschau
    cloud.pages.directoryView.editor = "";

    //Navigiere zur Loginseite
    WinJS.Navigation.navigate("/pages/home/home.html");
};


// Zurücksetzen aller lokal gespeicherten Einstellungen
cloud.functions.resetSettings = function () {
    Windows.Storage.ApplicationData.current.clearAsync();
    cloud.functions.logout();
};


cloud.functions.showNotification = function (title, message, imageSrc) {
    var Notifications = Windows.UI.Notifications;
    var ToastContent = NotificationsExtensions.ToastContent;

    // Get the toast manager for the current app.
    var notificationManager = Notifications.ToastNotificationManager;

    // Create the toast content using the notifications content library.
    var content;

    content = ToastContent.ToastContentFactory.createToastImageAndText02();
    content.textHeading.text = title;
    content.textBodyWrap.text = message;

    content.image.src = imageSrc;
    var altText = "Image";
    content.image.alt = altText;

    // Create a toast, then create a ToastNotifier object
    // to send the toast.
    var toast = content.createNotification();

    notificationManager.createToastNotifier().show(toast);
}

/*
Windows-Downloadfunktion
@param obj = {
    path        (string)    full path without filename
    fileName    (string)    filename
    fileType    (string)    filetype
    username    (string)    username
    password    (string)    password
    type        (string)    downloadtyp für transfermanager
    }
*/
cloud.functions.downloadFile = function (obj, successCallback, errorCallback, targetFile, totalSize) {
    // Vorabprüfung
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
        } else { //mehrere Dateien ausgewählt
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
                    //Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.addOrReplace("PickedFolderToken", folder);

                    for (var i = 0; i < obj.length; i++) {
                        cloud.functions.processSingleMultiDownload(obj[i], folder, successCallback, errorCallback, i == obj.length-1);
                    }
                } else {
                    // The picker was dismissed with no selected file
                    cloud.pages.directoryView.operationPending.style.visibility = 'hidden';
                }
            });
        }
    } else { //Einzelne Datei soll in konkrete Datei gespeichert werden
        var uriString = obj[0].path + obj[0].fileName + obj[0].fileType;
        cloud.functions.processDownload(obj[0], successCallback, errorCallback, uriString, targetFile, true);
    }
}

//Funktion die für jede Datei eines Multi-Downloads eine leere Datei anlegt und den Download durchführt.
//Wird benötigt, da die Schleife sonst weiterläuft bevor der asynchrone success Callback durchgeführt wird
cloud.functions.processSingleMultiDownload = function (obj, folder, successCallback, errorCallback, isLast) {
    folder.createFileAsync(obj.fileName + obj.fileType, Windows.Storage.CreationCollisionOption.generateUniqueName).then(function (file) {
            var uriString = obj.path + obj.fileName + obj.fileType;
            cloud.functions.processDownload(obj, successCallback, errorCallback, uriString, file, isLast);
        });
}

//Download durchführen und Datei in targetFile speichern
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

    // Create a new download operation.
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
Windows-Uploadfunktion
@param obj = {
    dirName     (string)    taregt path without filename
    username    (string)    username
    password    (string)    password
    }
*/
cloud.functions.uploadFile = function (obj, successCallback, errorCallback, file) {
    //Ansonsten wähle Datei über filepicker
    if (!file) {
        // Create the picker object and set options
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.desktop;

        // Beliebige Dateien herunterladen
        openPicker.fileTypeFilter.replaceAll(["*"]);

        // Default file name if the user does not type one in or selects a file to replace
        //openPicker.suggestedFileName = cloud.translate("UNSAVED");

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
        // Wenn bereits eine Datei übergeben wurde, kann diese direkt hochgeladen werden
    } else {
        cloud.functions.getFileSizeForUpload(obj, successCallback, errorCallback, file, true);
    }
}

cloud.functions.getFileSizeForUpload = function (obj, successCallback, errorCallback, srcFile, isLast) {
    if (!obj.fileSize) {// Filesize der hochzuladenden Datei herausfinden 
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

            // Vorabprüfung
            if (typeof obj.fileSize == "undefined" || !cloud.functions.beforeTransfer(obj, obj.fileSize)) {
                errorCallback();
                return;
            }

            // Background worker to upload file
            var uri = Windows.Foundation.Uri(obj.path + srcFile.name);
            var uploader = new Windows.Networking.BackgroundTransfer.BackgroundUploader();
            uploader.setRequestHeader("Authorization", "Basic " + obj.authToken);
            //  uploader.serverCredential = new Windows.Security.Credentials.PasswordCredential(obj.username, obj.password, "unnecessary");
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
Checks for einem Datentransfer: In beschränkten Netzwerken explizite Nutzererlaubnis anfordern
(Anforderung für die App-Zertifizierung)
*/
cloud.functions.beforeTransfer = function (obj, totalSize) {
    //Mögliche Erweiterung: Testen mit beschränkung und außerhalb des home-netzwerks
    //Mögliche Erweiterung: Bei Fehler Nutzer zur Bestätigung auffordern

    // Wenn der Nutzer das Vorgehen explizit bestätigt hat
    if (obj.userAgrees) {
        return true;
    }

    if (obj && typeof totalSize !== "undefined") {
        var networkInfo = Windows.Networking.Connectivity.NetworkInformation;
        var internetProfile = networkInfo.getInternetConnectionProfile();

        var currentCostType = internetProfile.getConnectionCost();
        var allCostTypes = Windows.Networking.Connectivity.NetworkCostType;

        if (currentCostType === allCostTypes.variable || currentCostType === allCostTypes.fixed) {
            // Begrenztes Netzwerk, maximale Übertragungsgrößen prüfen
            var dataPlanStatus = internetProfile.getDataPlanStatus();
            if (dataPlanStatus) {
                var maxTransferSizeInMegabytes = dataPlanStatus.maxTransferSizeInMegabytes;
                console.log("Max transfer size: " + maxTransferSizeInMegabytes);
                if (maxTransferSizeInMegabytes !== null && totalSize / 1000000 > maxTransferSizeInMegabytes) {
                    //TODO: Notification Abfrage Ja/Nein
                    var messageDialog = new Windows.UI.Popups.MessageDialog(cloud.translate("UPLOADRANGE"), cloud.translate("UPLOADRANGEMESSAGE"));
                    messageDialog.commands.append(new Windows.UI.Popups.UICommand(cloud.translate("YES"), function (command) {
                        //Falls der Nutzer "Ja" anklickt
                        console.log("Resume upload clicked no");
                        return true;
                    }));
                    messageDialog.commands.append(new Windows.UI.Popups.UICommand(cloud.translate("NO"), function (command) {
                        //Falls der Nutzer "Nein" anklickt
                        console.log("Resume upload clicked yes");
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

//Datei in externem Viewer öffnen
cloud.functions.openFileFromSystem = function (targetFile) {
    var options = new Windows.System.LauncherOptions();
    options.displayApplicationPicker = true;

    Windows.System.Launcher.launchFileAsync(targetFile, options).then(function (success) {
        if (success) {
            // Yay!
            console.log('File opened externally');
        } else {
            // FROWN :(
            console.log('Couldn\'t open file');
        }
    });
}

cloud.pages.directoryView.pdfDoc = null;
cloud.pages.directoryView.pdfPageNum = null;

cloud.functions.showPDF = function(file){
    // Dateiinhalt als Uint8Array beschaffen
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

cloud.functions.renderPage = function(num, scale) {
    // Using promise to fetch the page
    cloud.pages.directoryView.pdfDoc.getPage(num).then(function (page) {
        try {
            //Alte Seite löschen
            $('#pdfPreview > canvas').remove();

            //Neue Seite laden
            //
            // Prepare canvas using PDF page dimensions
            //
            var canvas = document.createElement("canvas");

            var flipViewDOM = document.getElementById("pdfPreview");
            var flipView = flipViewDOM.winControl;
            var width = flipViewDOM.clientWidth;
            var height = flipViewDOM.clientHeight;

            var tmpScale;

            flipViewDOM.appendChild(canvas);

            var context = canvas.getContext('2d');

            var viewport = page.getViewport(1);
           
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            var tmpHeight = canvas.height;
            var tmpHeight2 = tmpHeight;
           


            //if (counter < 1) {
                
            //    var tmpScale = document.getElementById("contentGrid").clientHeight / canvas.height;
            //}
            //else {
            //    var tmpScale = document.getElementById("contentGrid").clientHeight / canvas.height;
            //    initialScale = tmpScale;

            //}

            var tmpScale = (document.getElementById("contentGrid").clientHeight - 10) / canvas.height;
            
            

            if (tmpScale > 1 | tmpScale < 1) {
                pdfScale = tmpScale;

                cloud.functions.renderPage2(cloud.pages.directoryView.pdfPageNum, tmpScale);
       
            }

            cloud.pages.directoryView.pdfCurrentZoom = tmpScale;

            counter += 1;

            //
            // Render PDF page into canvas context
            //
            page.render({ canvasContext: context, viewport: viewport });
            $('#sectionWrap').scrollTo($('#previewTag'), 0, { axis: 'x' });
        } catch (error) {
            console.log(e);
        }
    });
}

cloud.functions.renderPage2 = function (num, scale) {
    // Using promise to fetch the page
    cloud.pages.directoryView.pdfDoc.getPage(num).then(function (page) {
        try {
            //Alte Seite löschen
            $('#pdfPreview > canvas').remove();

            //Neue Seite laden
            //
            // Prepare canvas using PDF page dimensions
            //
            var canvas = document.createElement("canvas");

            var flipViewDOM = document.getElementById("pdfPreview");
            var flipView = flipViewDOM.winControl;
            var width = flipViewDOM.clientWidth;
            var height = flipViewDOM.clientHeight;

            flipViewDOM.appendChild(canvas);

            var context = canvas.getContext('2d');
            
            var viewport = page.getViewport(scale);
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            var tmpHeight = canvas.height;
            var tmpHeight2 = tmpHeight;
         

            //
            // Render PDF page into canvas context
            //
            page.render({ canvasContext: context, viewport: viewport });
            $('#sectionWrap').scrollTo($('#previewTag'), 0, { axis: 'x' });
        } catch (error) {
            console.log(e);
        }
    });
}

//
// Go to previous page
//
cloud.functions.pdfGoPrevious = function() {
    if (cloud.pages.directoryView.pdfPageNum <= 1)
        return;
    cloud.pages.directoryView.pdfPageNum--;
    cloud.pages.directoryView.pdfPageNumDOM.value = cloud.pages.directoryView.pdfPageNum;
    cloud.functions.renderPage2(cloud.pages.directoryView.pdfPageNum, pdfScale);
}

//
// Go to next page
//
cloud.functions.pdfGoNext = function () {
    if (cloud.pages.directoryView.pdfPageNum >= cloud.pages.directoryView.pdfDoc.numPages)
        return;
    cloud.pages.directoryView.pdfPageNum++;
    cloud.pages.directoryView.pdfPageNumDOM.value = cloud.pages.directoryView.pdfPageNum;
    cloud.functions.renderPage2(cloud.pages.directoryView.pdfPageNum, pdfScale);
}

cloud.functions.pdfZoomOut = function () {
    if (pdfScale <= 0.2)
        return;
   pdfScale -= 0.1;
   cloud.functions.renderPage2(cloud.pages.directoryView.pdfPageNum, pdfScale);
}

cloud.functions.pdfZoomIn = function () {
    if (pdfScale >= 2.0)
        return;
    pdfScale += 0.1;
    cloud.functions.renderPage2(cloud.pages.directoryView.pdfPageNum, pdfScale);
}

var waitingForMessageDialog = false;
// Show notification window
cloud.functions.showMessageDialog = function (translateKey, callback) {
    if (!callback) {
        callback = function () { /* do nothing */ }
    }

    //App versucht doppelte Fehlernachricht anzuzeigen --> App stürzt ab wenn nicht abgefangen
    if (!waitingForMessageDialog) {
        waitingForMessageDialog = true;
        messageDialog = new Windows.UI.Popups.MessageDialog(cloud.translate(translateKey));
        messageDialog.showAsync().done(function(){
            callback();
            waitingForMessageDialog = false;
        });   
    }
}
