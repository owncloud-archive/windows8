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
//Frontend-Dummy
var frontendDummy = function () {
    this.implements = ["Frontend"];

    //Eigenschaften
    this.helper = false;
    this.translator = false;
    this.config = false;
    this.navigationList = {};
    this.loggedIn = false;

    this.dummy = function () {
        console.log("Frontend test!");
    };

    this.doInit = function (obj) {
        InterfaceHelper.ensureImplements(this, Frontend);

        this.debug("Frontend-Interface: Dummy-Implementierung");

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
    }

    this.showError = function (obj) {
        if (obj && obj.msg) {
            $('#errorMessage').html(obj.msg);
        }
    };

    this.hasFunctionality = function (obj) {
        this.debug("Frontend-Funktion hasFunctionality");

        return true;
    }

    this.setBackend = function (obj) {
        this.debug("Frontend-Funktion setBackend");

        // Check host url
        if (obj.type === "config") {
            if (typeof this.config.servers[obj.host] === "undefined" || (this.config.servers[obj.host] && this.config.servers[obj.host].length == 0)) {
                return false;
            }
        } else if (!(obj.host.indexOf('http://') == 0) && !(obj.host.indexOf('https://') == 0)) {
            return false;
        }

        return true;
    }

    this.doAuthentication = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion doAuthentication");
        
        if (obj.password != "" && obj.username != "") {
            this.loggedIn = true;
            successCallback("FULLSUCCESS");
        } else {
            errorCallback();
        }
        return;
    }

    this.doReAuthentication = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion doReAuthentication");

        if (obj.password == "" || obj.username == "") {
            errorCallback();
        } else {
            successCallback();
        }
    }

    this.isLoggedIn = function () {
        this.debug("Frontend-Funktion isLoggedIn");

        return this.loggedIn;
    };

    this.setLoggedIn = function (obj) {
        this.debug("Frontend-Funktion setLoggedIn");

        return;
    }

    this.getDirectoryContent = function (obj, callback, errorCallback) {
        this.debug("Frontend-Funktion getDirectoryContent");

        if (obj.path == "/") {
            var deletedFiles = obj.deletedFiles;
            var obj = new Array();

            if (deletedFiles == "both") {
                obj.push({
                    path: "/geloeschteDatei.pdf",
                    dirName: "/",
                    fileName: "geloeschteDatei",
                    fileType: ".pdf",
                    isDir: false,
                    bestNum: 1.35,
                    bestText: "1,35 MB",
                    bNum: 1345678,
                    bText: "1.345.678 Byte",
                    kbNum: 1345.69,
                    kbText: "1345,69 KB",
                    mbNum: 1.35,
                    mbText: "1,35 MB",
                    gbNum: 0.0,
                    gbText: "0 GB",
                    deleted: true
                });
            }

            obj.push({
                path: "/Ziemlich cooler Ordner",
                dirName: "/",
                fileName: "Ziemlich cooler Ordner",
                fileType: "",
                isDir: true,
                bestNum: 0,
                bestText: "0 KB",
                bNum: 0,
                bText: "0 Byte",
                kbNum: 0,
                kbText: "0 KB",
                mbNum: 0,
                mbText: "0 MB",
                gbNum: 0,
                gbText: "0 GB",
                deleted: false
            });
            obj.push({
                path: "/Ordner1",
                dirName: "/",
                fileName: "Ordner1",
                fileType: "",
                isDir: true,
                bestNum: 0,
                bestText: "0 KB",
                bNum: 0,
                bText: "0 Byte",
                kbNum: 0,
                kbText: "0 KB",
                mbNum: 0,
                mbText: "0 MB",
                gbNum: 0,
                gbText: "0 GB",
                deleted: false
            });
            obj.push({
                path: "/hallo.txt",
                dirName: "/",
                fileName: "hallo",
                fileType: ".txt",
                isDir: false,
                bestNum: 123.45,
                bestText: "123,45 KB",
                bNum: 123456,
                bText: "12.345 Byte",
                kbNum: 123.45,
                kbText: "123,45 KB",
                mbNum: 0.12,
                mbText: "0,12 MB",
                gbNum: 0.0,
                gbText: "0 GB",
                deleted: false
            });
            obj.push({
                path: "/welt.pdf",
                dirName: "/",
                fileName: "welt",
                fileType: ".pdf",
                isDir: false,
                bestNum: 1.35,
                bestText: "1,35 MB",
                bNum: 1345678,
                bText: "1.345.678 Byte",
                kbNum: 1345.69,
                kbText: "1345,69 KB",
                mbNum: 1.35,
                mbText: "1,35 MB",
                gbNum: 0.0,
                gbText: "0 GB",
                deleted: false
            });
            obj.push({
                path: "/42.wmv",
                dirName: "/",
                fileName: "42",
                fileType: ".wmv",
                isDir: false,
                bestNum: 2.35,
                bestText: "3,35 MB",
                bNum: 3345678,
                bText: "3.345.678 Byte",
                kbNum: 3345.69,
                kbText: "3345,69 KB",
                mbNum: 3.35,
                mbText: "3,35 MB",
                gbNum: 0.0,
                gbText: "0 GB",
                deleted: false
            });
            obj.push({
                path: "/w00t.mp3",
                dirName: "/",
                fileName: "w00t",
                fileType: ".mp3",
                isDir: false,
                bestNum: 4.35,
                bestText: "4,35 MB",
                bNum: 4345678,
                bText: "4.345.678 Byte",
                kbNum: 4345.69,
                kbText: "4345,69 KB",
                mbNum: 4.35,
                mbText: "4,35 MB",
                gbNum: 0.0,
                gbText: "0 GB",
                deleted: false
            });
            obj.push({
                path: "/fancy.zip",
                dirName: "/",
                fileName: "fancy",
                fileType: ".zip",
                isDir: false,
                bestNum: 5.35,
                bestText: "5,35 MB",
                bNum: 5345678,
                bText: "5.345.678 Byte",
                kbNum: 5345.69,
                kbText: "5345,69 KB",
                mbNum: 5.35,
                mbText: "5,35 MB",
                gbNum: 0.0,
                gbText: "0 GB",
                deleted: false
            });
        }
        else if (obj.path == "/Ordner1") {
            var obj = new Array();
            obj.push({
                path: "/ordner1/film.wmv",
                dirName: "/ordner1/",
                fileName: "film",
                fileType: ".wmv",
                isDir: false,
                bestNum: 123.45,
                bestText: "123,45 KB",
                bNum: 123456,
                bText: "12.345 Byte",
                kbNum: 123.45,
                kbText: "123,45 KB",
                mbNum: 0.12,
                mbText: "0,12 MB",
                gbNum: 0.0,
                gbText: "0 GB",
                deleted: false
            });
            obj.push({
                path: "/ordner1/ordner2",
                dirName: "/ordner1/",
                fileName: "ordner2",
                fileType: "",
                isDir: true,
                bestNum: 0,
                bestText: "0 KB",
                bNum: 0,
                bText: "0 Byte",
                kbNum: 0,
                kbText: "0 KB",
                mbNum: 0,
                mbText: "0 MB",
                gbNum: 0,
                gbText: "0 GB",
                deleted: false
            });
        }
        else {
            var obj = new Array();
            obj.push({
                path: "/bild.jpg",
                dirName: "/ordner1/ordner2/",
                fileName: "bild",
                fileType: ".jpg",
                isDir: false,
                bestNum: 123.45,
                bestText: "123,45 KB",
                bNum: 123456,
                bText: "12.345 Byte",
                kbNum: 123.45,
                kbText: "123,45 KB",
                mbNum: 0.12,
                mbText: "0,12 MB",
                gbNum: 0.0,
                gbText: "0 GB",
                deleted: false
            });
        }

        callback(obj);
    }

    this.getRemainingSpace = function (successCallback, errorCallback) {
        return;
    }

    this.translate = function (key) {
        this.debug("Frontend-Funktion translate:" + key);

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

    this.getSystemLanguage = function () {
        this.debug("Frontend-Funktion getSystemLanguage");

        return { "language": "de-de" };
    }

    this.setCustomLanguage = function (obj) {
        this.debug("Frontend-Funktion setCustomLanguage");

        if (typeof obj.customLanguage !== 'undefined') {
            this.debug("Benutzersprache geladen:" + obj.customLanguage);
            this.translator.setCustomLanguage({ lang: obj.customLanguage });
        }
    }

    this.deleteObject = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion deleteObject");

        successCallback();
    }

    this.moveObject = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion moveObject");

        successCallback();
    }

    this.renameObject = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion renameObject");

        successCallback();
    }

    this.createFolder = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion createFolder");

        return true;
    }

    this.uploadFile = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion uploadFile");

        successCallback();
    }

    this.downloadFile = function (obj, successCallback, errorCallback, targetFile) {
        this.debug("Frontend-Funktion downloadFile");

        successCallback();
    }

    this.getFileIcon = function (obj) {
        // Get icon path from config file
        if (obj.fileType && this.config.fileTypes && this.config.fileTypes[obj.fileType]
            && this.config.fileTypes[obj.fileType].icon && this.config.theme + this.config.fileTypesThemeRoot) {

            return this.config.fileTypesThemeRoot + this.config.theme + "/" + this.config.fileTypes[obj.fileType].icon;

            // show generic images
        } else if (obj.filetype && obj.filetype === "folder") {
            return "images/folder.svg";
        } else {
            return "images/generic_file.svg";
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
        return;
    }

    this.cancelTransfer = function (obj) {
        return;
    }

    this.removeTransfer = function (obj) {
        return;
    }

    this.updateTransferStatus = function (obj) {
        return;
    }

    this.restoreFile = function (obj, successCallback, errorCallback) {
        successCallback();
    }

    this.getVersions = function (obj, successCallback, errorCallback) {
        this.debug("Frontend-Funktion getDirectoryContent");

        var obj = new Array();

        obj.push({
            path: "/fancy.zip",
            versionId: "1",
            date: "4.2.2042",
        });
        obj.push({
            path: "/fancy.zip",
            versionId: "2",
            date: "5.2.2042",
        });
        obj.push({
            path: "/fancy.zip",
            versionId: "3",
            date: "6.2.2042",
        });

        successCallback(obj);
    }

    this.restoreVersion = function (obj, successCallback, errorCallback) {
        successCallback();
    }

    this.shareObject = function (obj, successCallback, errorCallback) {
        successCallback();
    }

    this.getShareLink = function (obj, successCallback, errorCallback) {
        successCallback();
    }

    this.unshareObject = function (obj, successCallback, errorCallback) {
        successCallback();
    }

    this.getShareStatus = function (obj, successCallback, errorCallback) {
        successCallback([{
            permissionRead: true,
            permissionWrite: true,
            permissionCreate: true,
            permissionReshare: true,
            shareWith: "patrick",
            shareToUser: true
        }, {
            permissionRead: true,
            permissionWrite: false,
            permissionCreate: false,
            permissionReshare: false,
            shareWith: "benni",
            shareToUser: false
        }]);
    }

    this.getShareAutocomplete = function (obj, callback) {
        callback({ shareTargets: [] });
    }

    this.fileeeAnalyse = function (obj, successCallback, errorCallback) {
        successCallback();
    }

    this.getFileeeContent = function (obj, successCallback, errorCallback) {
        successCallback({ content: "Dummytext" });
    }

    this.getFileFulltext = function (obj, successCallback, errorCalback) {
        successCallback({ htmlText: "<p>Dummytext</p><p>More text</p>" });
    }
};
