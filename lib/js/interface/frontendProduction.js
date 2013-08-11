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
//Frontend-Produktions-Modul
var frontendProduction = function () {
    this.implements = ["Frontend"];

    //Eigenschaften
    this.backend = false;
    this.helper = false;
    this.translator = false;
    this.config = false;
    this.errorFunction = false;
    this.sortBy = "name";
    this.navigationList = {};
    this.transfers = [];
    this.contentDirCurrent = false;
    this.contentDirDeleted = false;

    this.doInit = function (obj) {
        InterfaceHelper.ensureImplements(this, Frontend);
       
        this.debug("Frontend Production");

        //Konfiguration laden
        this.config = appconfig;

        // Module einbinden (müssen vorher geladen sein)
        this.helper = apphelper;

        // Mehrsprachigkeit initialisieren
        this.translator = apptranslator;

        // Tastaturbedienung initialisieren
        this.keyboard = keyboard;
        this.keyboard.initKeyboard();

        // Ordner-Navigation
        this.navigationList.forward = [];
        this.navigationList.back = [];
        this.navigationList.back.push("/");

        // Standardsprache aus Konfiguration laden
        if (typeof this.config["standardLanguage"] !== 'undefined') {
            this.debug("Standardsprache geladen:" + this.config["standardLanguage"]);
            this.translator.setStandardLanguage({ lang: this.config["standardLanguage"] });
        }

        // Benutzersprache laden falls vorhanden
        if (obj.customLanguage) {
            this.setCustomLanguage({ customLanguage: obj.customLanguage });
        }

        return true;
    };

    this.debug = function (msg) {
        // Debug-Meldung ausgeben, falls im Debug-Modus
        if (typeof this.config.debug !== 'undefined' && this.config.debug === true) {
            console.log(msg.toString());
        }
    };

    this.showError = function (obj) {
        if (obj && obj.msg) {
            $('#errorMessage').html(obj.msg);
        }
    };

    this.hasFunctionality = function (obj) {
        this.debug("Frontend-Funktion hasFunctionality");

        var result = false;
   
        // Zusatzfunktionen der Logikschicht
        switch (obj.functionkey) {
            case "setBackend":              result = true; break;
            case "translate":               result = true; break;
            case "translateAll":            result = true; break;
            case "formatNumber":            result = true; break;
            case "doAuthentication":        result = true; break;
            case "doReAuthentication":      result = true; break;
            case "isLoggedIn":              result = true; break;
            case "setLoggedIn":             result = true; break;
            case "getDirectoryContent":     result = true; break;
            case "isLoggedIn":              result = true; break;
            case "setLoggedIn":             result = true; break;
            case "getSystemLanguage":       result = true; break;
            case "setCustomLanguage":       result = true; break;
            case "deleteObject":            result = true; break;
            case "moveObject":              result = true; break;
            case "createFolder":            result = true; break;
            case "uploadFile":              result = true; break;
            case "downloadFile":            result = true; break;
            default:
                result = false;
        }

        if (result) {
            // In der Logikschicht gefunden
            return result;
        } else if (this.backend) {
            // Sofern noch nichts gefunden wurde im Backend weitersuchen
            return this.backend.hasFunctionality(obj);
        } else {
            return false;
        }
    }

    this.setBackend = function (obj) {
        this.debug("Frontend-Funktion setBackend");

        result = false;

        // Übergabewerte nutzen
        var configuration = obj;

        // Vordefinierte Werte ermitteln und nutzen, falls vorhanden
        if (obj.type === "config") {
            // Config-Werte werden geklont, um weitere parameter angeben zu können
            configuration = jQuery.extend({}, this.config.servers[obj.host]);

            if (!configuration) {
                return false;
            }
        } else if (!(obj.host.indexOf('http://') == 0) && !(obj.host.indexOf('https://') == 0)) {
            return false;
        }

        // Debug-Modus weitergeben
        if (typeof this.config.debug !== 'undefined' && this.config.debug === true) {
            configuration.debug = true;
        }

        switch (configuration.type) {
            case "owncloud":
                this.backend = new backendOwncloud();
                result = true;
                break;
            case "sharepoint":
                this.backend = new backendSharepoint();
                result = true;
                break;
        }

        if (result) {
            configuration.downloadFunction = obj.downloadFunction;
            configuration.uploadFunction = obj.uploadFunction;

            result = this.backend.doInit(configuration);
        }
        return result;
    }

    this.doAuthentication = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion doAuthentication");

        this.backend.doAuthentication(obj, successCallback, errorCallback);

        return;
    }

    this.doReAuthentication = function (obj) {
        this.debug("Frontend-Funktion doReAuthentication");

        return this.backend.doReAuthentication(obj);
    }

    this.isLoggedIn = function () {
        this.debug("Frontend-Funktion isLoggedIn");

        if (this.backend)
            return this.backend.isLoggedIn();
        else
            return false;
    };

    this.setLoggedIn = function (obj) {
        this.debug("Frontend-Funktion setLoggedIn");

        if (this.backend && obj && typeof obj.loginStatus !== "undefined") {
            return this.backend.setLoggedIn(obj);
        } else {
            return false;
        }
    }


    this.getDirectoryContent = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion getDirectoryContent");

        if (!obj.deletedFiles) {
            obj.deletedFiles = "onlyCurrent"; // set default
        }

        // Clear previous results
        this.contentDirCurrent = false;
        this.contentDirDeleted = false;

        // Mehrere Callback-Ebenen als Stack
        var callbackList = [];
        if (successCallback) {
            callbackList.push(successCallback);
        }

        // Sortierreihenfolge speichern
        if (!obj.sortBy) {
            // aktuelle Reihenfolge beibehalten
        } else if (obj.sortBy == "size") {
            this.sortBy = "size";
        } else if (obj.sortBy == "nameDesc") {
            this.sortBy = "nameDesc";
        } else if (obj.sortBy == "sizeDesc") {
            this.sortBy = "sizeDesc";
        } else {
            this.sortBy = "name";
        }
        var sortBy = this.sortBy;
        
        // Vor der Rückgabe sortieren
        callbackList.push(function (result, sortCallbackList) {
            if (sortBy == "name"){
                result = result.sort(apphelper.sortByName);
            } else if (sortBy == "nameDesc") {
                // noch nicht implementiert
            } else if (sortBy == "size") {
                // noch nicht implementiert
            } else {
                result = result.sort(apphelper.sortBySizeDesc);
            }

            var sortCallback = sortCallbackList.pop();
            sortCallback(result);
        });

        callbackList.push(this.processGetDirectoryContent); // common result processing
        var callbackListDeleted = jQuery.extend([], callbackList);

        // Separate callbacks für normale und gelöschte Dateien
        callbackList.push(this.getDirectoryContentResult); // process current results
        callbackListDeleted.push(this.getDirectoryDeletedContentResult); // process deleted results

        // Get content for current and deleted files
        if (obj.deletedFiles === "onlyCurrent") {
            this.backend.getDirectoryContent(obj, callbackList, errorCallback, this);
            this.contentDirDeleted = []; // set deleted as empty array to continue result processing
        } else if (obj.deletedFiles === "onlyDeleted") {
            this.contentDirCurrent = []; // set current as empty array to continue result processing
            this.backend.getDeletedFiles(obj, callbackListDeleted, errorCallback, this);
        } else {
            this.backend.getDirectoryContent(obj, callbackList, errorCallback, this);
            this.backend.getDeletedFiles(obj, callbackListDeleted, errorCallback, this);
        }

        return;
    }

    this.getDirectoryContentResult = function (obj, callbackList, errorCallback, context) {
        if (context.contentDirDeleted) {
            // Deleted war schneller, jetzt weitermachen
            //var combined = jQuery.extend(obj, context.contentDirDeleted);
            var combined = obj.concat(context.contentDirDeleted);

            // Zurückreichen
            var callback = callbackList.pop();
            callback(combined, callbackList);
        } else {
            // I am first, save the results
            context.contentDirCurrent = obj;
        }
    }

    this.getDirectoryDeletedContentResult = function (obj, callbackList, errorCallback, context) {
        if (context.contentDirCurrent) {
            // Deleted war schneller, jetzt weitermachen
            //var combined = jQuery.extend(obj, context.contentDirCurrent);
            var combined = obj.concat(context.contentDirCurrent);


            // Zurückreichen
            var callback = callbackList.pop();
            callback(combined, callbackList);
        } else {
            // I am first, save the results
            context.contentDirDeleted = obj;
        }
    }

    this.processGetDirectoryContent = function (obj, callbackList, errorCallback) {
        var result = [];

        for (elem in obj) {

            // Dateipfad behandeln
            var paths = apphelper.convertPath(obj[elem]);
            obj[elem] = jQuery.extend(obj[elem], paths);

            obj[elem].fileName = decodeURI(obj[elem].fileName);
            obj[elem].dirName = decodeURI(obj[elem].dirName);
            obj[elem].path = decodeURI(obj[elem].path);

            obj[elem].date = obj[elem].date;
            if (typeof obj[elem].date === "undefined") {
                obj[elem].date = " - ";
            }

            // Filesizes berechnen
            var sizes = apphelper.convertInAllFilesizes(obj[elem]);
            obj[elem] = jQuery.extend(obj[elem], sizes);

            result.push(obj[elem]);
        }

        // Zurückreichen
        var callback = callbackList.pop();
        callback(result, callbackList);
    }

    this.getRemainingSpace = function (successCallback, errorCallback) {
        return this.backend.getRemainingSpace(successCallback, errorCallback);
    }

    this.getSystemLanguage = function () {
        this.debug("Frontend-Funktion getSystemLanguage");

        var systemLanguage = "";
        if (navigator && navigator.systemLanguage) {
            systemLanguage = navigator.systemLanguage.toLowerCase();
        } else if (navigator && navigator.browserLanguage) {
            systemLanguage = navigator.browserLanguage.toLowerCase();
        } else if (navigator && navigator.userLanguage) {
            systemLanguage = navigator.userLanguage.toLowerCase();
        } else if (navigator && navigator.language) {
            systemLanguage = navigator.language.toLowerCase();
        };
        
        var result = false;

        //Initialisierung
        switch (systemLanguage) {
            case "de-de":
                result = "de-de";
                break;
            case "en-us":
                result = "en-us";
                break;
            default:
                break;
        }
        
        return result;
    }

    this.setCustomLanguage = function (obj) {
        this.debug("Frontend-Funktion setCustomLanguage");

        if (typeof obj.customLanguage !== 'undefined' && obj.customLanguage && obj.customLanguage !== "") {
            this.debug("Benutzersprache geladen:" + obj.customLanguage);
            this.translator.setCustomLanguage({ lang: obj.customLanguage });
        }
    }

    this.translate = function (key) {
        return this.translator.translate(key);
    }

    this.translateAll = function () {
        this.debug("Frontend-Funktion translateAll");

        return this.translator.translateAll();
    }

    this.formatNumber = function (obj) {
        this.debug("Frontend-Funktion formatNumber");

        return this.translator.formatNumber(obj);
    }

    this.deleteObject = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion deleteObject");

        if (obj.path) {
            obj.path = encodeURI(obj.path);
            this.backend.deleteObject(obj, successCallback, errorCallback);
        } else {
            errorCallback();
        }

        return;
    }

    this.moveObject = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion moveObject");
        
        if (obj && obj.srcPath && obj.targetPath && typeof obj.isDir !== "undefined") {

            obj.srcPath = encodeURI(obj.srcPath);
            obj.targetPath = encodeURI(obj.targetPath);

            //Check if target is root
            if (obj.targetPath.indexOf("//") == 0) {
                obj.targetPath = obj.targetPath.substring(1);
            }

            this.backend.moveObject(obj, successCallback, errorCallback);
        } else {
            errorCallback();
        }
        
        return;
    }
    
    this.renameObject = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion renameObject");
        
        if(obj && (typeof obj.targetName === "undefined" || obj.targetName === "" || (!obj.isDir && obj.targetName.indexOf('.') <= 0))){
            errorCallback("NONAME");
            return;
        }

        if (obj && obj.srcPath && obj.targetName && typeof obj.isDir != "undefined") {
            var src = this.helper.convertPath({ path: obj.srcPath, isDir: obj.isDir });
            var targetPath = src.dirName + obj.targetName;

            if (obj.srcPath == targetPath) {
                successCallback();
                return;
            }

            this.backend.renameObject({ srcPath: obj.srcPath, targetPath: targetPath }, successCallback, errorCallback);
        } else {
            errorCallback();
        }

        return true;
    }

    this.createFolder = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion createFolder");

        if(obj && (typeof obj.folderName === "undefined" || obj.folderName === "")){
            errorCallback("NONAME");
            return;
        }

        if (obj.path && obj.folderName) {
            obj.path = encodeURI(this.helper.normalizePath(obj.path));
            this.backend.createFolder(obj, successCallback, errorCallback);
        } else {
            errorCallback();
        }

        return;
    }

    this.uploadFile = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion uploadFile");

        if (obj && obj.targetPath) {

            // Add trailing slash
            obj.targetPath = encodeURI(this.helper.normalizePath(obj.targetPath));
            this.backend.uploadFile(obj, successCallback, errorCallback);
        } else {
            errorCallback();
        }

        return;
    }

    this.downloadFile = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion downloadFile");

        this.backend.downloadFile(obj, successCallback, errorCallback);
        return;
    }

    this.getFileIcon = function (obj) {
        // Get icon path from config file
        if (obj.fileType && this.config.fileTypes && this.config.fileTypes[obj.fileType]
            && this.config.fileTypes[obj.fileType].icon && this.config.theme + this.config.fileTypesThemeRoot) {

            return this.config.fileTypesThemeRoot + this.config.theme + "/" + this.config.fileTypes[obj.fileType].icon;

        // show generic images
        } else {
            return this.config.fileTypesThemeRoot + this.config.theme + "/" + "file.svg";
        }
    }

    this.setKeystrokeContext = function (obj) {
        return this.keyboard.setKeystrokeContext(obj);
    }

    this.getPreviousKeystrokeContext = function () {
        return this.keyboard.getPreviousKeystrokeContext();
    }

    this.getNextKeystrokeContext = function () {
        return this.keyboard.getNextKeystrokeContext();
    }

    this.addKeystrokeEvent = function (obj) {
        return this.keyboard.addKeystrokeEvent(obj);
    }

    this.getKeystrokeList = function (obj) {
        return this.keyboard.getKeystrokeList(obj);
    }

    this.getNavigationListForward = function () {
        return this.navigationList.forward;
    }

    this.getNavigationListBack = function () {
        return this.navigationList.back;
    }

    this.setNavigationListForward = function (obj) {
        this.navigationList.forward = obj.list;
    }

    this.setNavigationListBack = function (obj) {
        this.navigationList.back = obj.list;
    }

    this.clearNavigationListForward = function () {
        this.navigationList.forward = [];
    }

    this.clearNavigationListBack = function () {
        this.navigationList.back = [];
    }

    this.getNavigationPathCurrent = function () {
        return this.navigationList.back[this.navigationList.back.length - 1];
    }

    this.getNavigationPathNext = function () {
        return this.navigationList.forward[this.navigationList.forward.length - 1];
    }

    this.resetNavigation = function () {
        this.navigationList.back.splice(1, this.navigationList.back.length);
        this.navigationList.forward = [];
        return this.getNavigationPathCurrent();
    }

    this.navigationGotoPath = function (obj) {
        if (!obj.path) { return; }

        //Vorwärtsnavigation bei Ordnernavigation leeren
        this.navigationList.forward = [];
        //Neues Verzeichnis
        this.navigationList.back.push(obj.path);
    }

    this.navigationHasPrevious = function () {
        return this.navigationList.back.length > 1;
    }

    this.navigationHasNext = function () {
        return this.navigationList.forward.length >= 1;
    }

    this.navigationGotoPrevious = function () {
        if (this.navigationHasPrevious()) {
            var path = this.navigationList.back.pop();
            this.navigationList.forward.push(path);
            return path;
        }
        return false;
    }

    this.navigationGotoNext = function () {
        if (this.navigationHasNext()) {
            var path = this.navigationList.forward.pop();
            this.navigationList.back.push(path);
            return path;
        }
        return false;
    }

    this.addTransfer = function (obj) {
        if(!obj || !obj.promise || !obj.type){
            return false;
        }

        // Set values for progress
        obj.bytesTotal = 0;
        obj.bytesTransfered = 0;

        this.transfers.push(obj);
        console.log("Added transfer: " + JSON.stringify(this.transfers));
        return true;
    }

    this.cancelTransfer = function (obj) {
        if (!obj || !obj.type) {
            return false;
        }

        for (elem in this.transfers) {
            if (this.transfers[elem].type === "all" || this.transfers[elem].type === obj.type) {
                this.debug("Stop transfer");

                this.transfers[elem].promise.cancel();

                // Remove from transfer list
                this.transfers.splice(elem, 1);
                console.log("Cancelled transfer: " + JSON.stringify(this.transfers));
            }
        }
        return true;
    }

    this.removeTransfer = function (obj) {
        if (!obj || !obj.promise) {
            return false;
        }

        for (elem in this.transfers) {
            if (this.transfers[elem].promise === obj.promise) {
                this.debug("Remove transfer from list");

                // Remove from transfer list
                this.transfers = this.transfers.splice(elem, 1);
                console.log("Removed transfer: " + JSON.stringify(this.transfers));
                return true;
            }
        }
    }

    this.updateTransferStatus = function (obj) {
        if (!obj || !obj.bytesTotal || !obj.bytesTransfered || !obj.promise) {
            return;
        }

        var uploadSumTotal = 0;
        var uploadSumTransfered = 0;
        var uploadCount = 0;
        var downloadSumTotal = 0;
        var downloadSumTransfered = 0;
        var downloadCount = 0;
        var currentType = "";

        for (elem in this.transfers) {
            if (this.transfers[elem].promise == obj.promise) {
                this.transfers[elem].bytesTotal = obj.bytesTotal;
                this.transfers[elem].bytesTransfered = obj.bytesTransfered;
                currentType = this.transfers[elem].type;
            }

            // Summing up
            if (this.transfers[elem].type === "upload") {
                uploadSumTotal += this.transfers[elem].bytesTotal;
                uploadSumTransfered += this.transfers[elem].bytesTransfered;
                uploadCount++;
            } else {
                downloadSumTotal += this.transfers[elem].bytesTotal;
                downloadSumTransfered += this.transfers[elem].bytesTransfered;
                downloadCount++;
            }
        }

        // Calculate progress
        if (currentType === "upload") {
            var sumTotal = uploadSumTotal;
            var sumTransfered = uploadSumTransfered;
            var count = uploadCount;
        } else {
            var sumTotal = downloadSumTotal;
            var sumTransfered = downloadSumTransfered;
            var count = downloadCount;
        }

        console.log(sumTransfered + " / " + sumTotal + " = " + this.translator.formatNumber({ key: sumTransfered / sumTotal * 100, numDecimals: 2}) + "% in " + count + " files.");
        return sumTransfered / sumTotal * 100;
    }

    this.restoreFile = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion restoreFile");
        
        return this.backend.restoreFile(obj, successCallback, errorCallback);
    }

    this.getVersions = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion getVersions");

        return this.backend.getVersions(obj, successCallback, errorCallback);
    }

    this.restoreVersion = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion restoreVersion");

        return this.backend.restoreVersion(obj, successCallback, errorCallback);
    }

    this.shareObject = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion shareObject");

        // Für Backend umkodieren
        if (obj.shareToUser) {
            obj.shareType = 0;
        } else {
            obj.shareType = 1;
        }

        return this.backend.shareObject(obj, successCallback, errorCallback);
    }

    this.getShareLink = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion getShareLink");

        return this.backend.getShareLink(obj, successCallback, errorCallback);
    }

    this.unshareObject = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion unshareObject");

        return this.backend.unshareObject(obj, successCallback, errorCallback);
    }

    this.getShareStatus = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion getShareStatus");

        return this.backend.getShareStatus(obj, successCallback, errorCallback);
    }

    this.getShareAutocomplete = function (obj, callback) {
        this.debug("Frontend-Funktion getShareAutocomplete");

        if (!obj.key) {
            obj.key = "";
        }

        return this.backend.getShareAutocomplete(obj, callback);
    }

    this.fileeeAnalyse = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion fileeeAnalyse");

        var paths = apphelper.convertPath(obj);
        if (paths.fileType == ".png" || paths.fileType == ".jpg" || paths.fileType == ".jpeg"
                || paths.fileType == ".gif" || paths.fileType == ".bmp") {
            this.backend.fileeeAnalyse(obj, successCallback, errorCallback);
        } else {
            errorCallback("UNSUPPORTEDFILETYPE");
        }
    }

    this.getFileeeContent = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion getFileeeContent");

        var paths = apphelper.convertPath(obj);
        if (paths.fileType == ".png" || paths.fileType == ".jpg" || paths.fileType == ".jpeg"
                || paths.fileType == ".gif" || paths.fileType == ".bmp") {
            this.backend.getFileeeContent(obj, successCallback, errorCallback);
        } else {
            errorCallback("UNSUPPORTEDFILETYPE");
        }
    }

    this.getFileFulltext = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion getFileFulltext");

        if (!obj || !obj.fileType || obj.fileType !== ".docx") {
            errorCallback();
            return;
        }

        obj.isDir = false;
        var paths = apphelper.convertPath(obj);
        if (paths.fileType == ".docx") {
            this.backend.getDocxFulltext(obj, successCallback, errorCallback);
        } else {
            errorCallback("UNSUPPORTEDFILETYPE");
        }
    }
};
