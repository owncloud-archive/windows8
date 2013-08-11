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
//Backend-Owncloud
var backendOwncloud = function () {
    this.implements = ["Backend"];
    this.host = false;
    this.webdav = false; //"/remote.php/webdav/"; //"/files/webdav.php";
    this.port = false;
    this.username = false;
    this.password = false;
    this.authToken = false;
    this.loginStatus = false;
    this.debugMode = false;
    this.downloadFunction = false;
    this.uploadFunction = false;
    this.requestToken = false;

    // For asynchronous functionality checks - keep on null here, will be checked during initial authentication
    this.hasVersions = null;
    this.hasDeleted = null;
    this.hasSharelink = null;
    this.hasShare = null;
    this.hasFileee = null;
    this.hasRemainingSpace = null;
    this.hasPreviewDocx = null;

    this.initSuccessCallback = false;
    this.initSuccessTries = 20; // nach 20 Versuchen (= 6 sekunden) abbruch

    this.doInit = function (obj) {
        //Auf Interface-Einhaltung prüfen, sonst wird Fehler generiert
        InterfaceHelper.ensureImplements(this, Backend);

        console.log("Backend-Interface: Owncloud");

        // Verbindunsdetails
        this.host = apphelper.normalizePath(obj.host, { trailingSlash: false, prependSlash: false});
        this.port = obj.port;
        this.webdav = apphelper.normalizePath(obj.relativePath, { trailingSlash: false, prependSlash: true });
        this.downloadFunction = obj.downloadFunction;
        this.uploadFunction = obj.uploadFunction;

        //Konfigurationsdaten
        this.debugMode = obj.debug;

        // Initialisierung erfolgreich
        return true;
    };

    this.debug = function (msg) {
        // Debug-Meldung ausgeben, falls im Debug-Modus
        if (typeof this.debugMode !== 'undefined' && this.debugMode === true) {
            console.log(msg.toString());
        }
    }

    this.hasFunctionality = function (obj) {
        this.debug("Backend-Funktion hasFunctionality");

        var result = false;
        switch (obj.functionkey) {
            case "getRemainingSpace": result = this.hasRemainingSpace; break;
            case "getDeletedFiles": result = this.requestToken && this.hasDeleted; break;
            case "getFileHistory":  result = this.requestToken && this.hasVersions; break;
            case "getPublicLink":   result = this.requestToken && this.hasSharelink; break;
            case "shareFile":       result = this.requestToken && this.hasShare; break;
            case "fileee":          result = this.hasFileee; break;
            case "hasPreviewDocx":  result = this.hasPreviewDocx; break;
            default:
                result = false;
        }

        return result;
    }

    this.doAuthentication = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion doAuthentication");

        var self = this;
        this.username = obj.username;
        this.password = obj.password;
        this.authToken = base64.encode(obj.username + ':' + obj.password);
        this.debug(obj.username + ':' + obj.password);
        this.debug("Path: " + this.host + this.webdav);
        this.debug("Token: " + this.authToken);

        // Dummy-Verbindung aufbauen, um Autorisierung zu bestätigen
        var xhr = new XMLHttpRequest();
        
        xhr.onreadystatechange = function (e) {
            // Connection opened and empty result
            if (xhr.readyState == 1){// && xhr.status == 0) { //fails on mobile
                console.log("ASYNC authentication started");

                // Hack to check for unsuccessful authentication
                // There is no possibility to detect if the Windows Authentication Dialogue has popped up
                xhr.loginTime = e.timeStamp;

                // Connection attempt successful
            } else if (xhr.readyState == 4 && xhr.status == 200) {
                console.log("ASYNC authentication successful");

                var msg = "FULLSUCCESS";

                // Anmeldung > 3 sek. = eventuell falsche zugangsdaten
                if (e.timeStamp - xhr.loginTime > 3000) {
                    console.log("Authentication popup?");

                    // auto-login flag entfernen, da Verdacht auf falsche Zugangsdaten
                    msg = "PARTIALSUCCESS";
                }
                
                // Funktionalität prüfen, dazu zu erst ein Requesttoken erfragen
                self.getRequestToken(obj, function () {
                    // Versions is standard feature if we have a token
                    self.hasVersions = true;

                    // Check the other plugins
                    // Deleted files
                    self.getDeletedFiles({ path: "/" }, [function () {
                        /* success */
                        self.hasDeleted = true;
                    }], function () {
                        /* error */
                        self.hasDeleted = false;
                    });

                    // Data id for sharing
                    self.getShareStatus({ path: "/" }, function () {
                        /* success */
                        self.hasShare = true;
                        self.hasSharelink = true;
                    }, function () {
                        /* error */
                        self.hasShare = false;
                        self.hasSharelink = false;
                    });

                    // Data id for sharing
                    self.getFileeeContent({ path: "/dummy.png" }, function (result) {
                        /* success */
                        if (result && typeof result.content !== "undefined") {
                            self.hasFileee = true;
                        } else {
                            self.hasFileee = false;
                        }
                    }, function (result) { /* error, but may exist */
                        if (result && typeof result.status !== "undefined") {
                            self.hasFileee = true;
                        } else {
                            self.hasFileee = false;
                        }
                    });

                    self.getRemainingSpace(function (result) {
                        /* success */
                        if (result && typeof result.totalBytes !== "undefined") {
                            self.hasRemainingSpace = true;
                        } else {
                            self.hasRemainingSpace = false;
                        }
                    }, function (result) {
                        /* error */
                        self.hasRemainingSpace = false;
                    });

                    self.getDocxFulltext({ path: "", fileType: ".docx" }, function (result) {
                        /* success */
                        if (result) {
                            self.hasPreviewDocx = true;
                        } else {
                            self.hasPreviewDocx = false;
                        }
                    }, function (result) {
                        /* error */
                        if (result == "PLUGINERROR") {
                            self.hasPreviewDocx = true;
                        } else {
                            self.hasPreviewDocx = false;
                        }
                    });
                },
                function () {
                    /* error */
                    this.hasVersions = false;
                    this.hasDeleted = false;
                    this.hasSharelink = false;
                    this.hasShare = false;
                    this.hasFileee = false;
                    this.hasRemainingSpace = false;
                    this.hasPreviewDocx = false;
                }, self);


                // wait for Plugin-Checks before callback
                self.initSuccessCallback = function () { successCallback(msg) };
                setTimeout(self.pluginCheck(self), 500);

                // Connection successful but status not OK
            } else {
                console.log("ASYNC authentication with unknown result");

                this.hasVersions = false;
                this.hasDeleted = false;
                this.hasSharelink = false;
                this.hasShare = false;
                this.hasFileee = false;
                this.hasRemainingSpace = false;
                this.hasPreviewDocx = false;

                self.setLoggedIn(false);
                errorCallback();
            }
        };

        xhr.open('GET', this.host + this.webdav, false);
        xhr.setRequestHeader("Authorization", "Basic " + this.authToken);

        // Exception sofern keine Netzwerkverbindung besteht
        try {
            xhr.send(null);
        } catch (e) {
            errorCallback("NOCONNECTION");
        }
    }

    this.doReAuthentication = function (obj, successCallback, errorCallback) {
        // Get a current request token
        this.getRequestToken(obj, successCallback, errorCallback, this);
    }

    this.pluginCheck = function (self) {
        return function () {
            if ((self.hasVersions !== null && self.hasDeleted !== null && self.hasSharelink !== null && self.hasShare !== null
                && self.hasFileee !== null && self.hasRemainingSpace !== null && self.hasPreviewDocx !== null)
                || self.initSuccessTries <= 0) {
                self.initSuccessCallback();
                console.log("Plugin Check successful");
            } else {
                console.log("Plugin Check unsuccessful - WAIT 300 ms");
                self.initSuccessTries--;
                setTimeout(self.pluginCheck(self), 300);
            }
        };
    }

    /**
    General function to send requests
    */
    this.performRequest = function (verb, url, headers, data, successCallbackList, errorCallback, context) {
        if (!errorCallback) {
            errorCallback = function () { /* do nothing, avoid crash */ }
        };

        if (!verb || !url || !headers || !successCallbackList || successCallbackList.length == 0) {
            errorCallback();
            return;
        }

        var xhr = new XMLHttpRequest();
        if (successCallbackList.length > 0 && errorCallback) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (xhr.responseText === "") {
                            var successCallback = successCallbackList.pop();
                            successCallback("", successCallbackList, errorCallback, context); // Leere Antwort
                        } else {
                            var response;
                            try {
                                response = JSON.parse(xhr.responseText);
                            } catch (e) {
                                response = xhr.responseText;
                            }

                            var successCallback = successCallbackList.pop();
                            successCallback(response, successCallbackList, errorCallback, context);
                        }
                    } else {
                        errorCallback();
                    }
                }
            };
        }

        xhr.open(verb, url, true);
        for (var header in headers) {
            xhr.setRequestHeader(headers[header].name, headers[header].content);
        }
        xhr.setRequestHeader("Authorization", "Basic " + context.authToken);

        try {
            xhr.send(data);
        } catch (e) {
            errorCallback("NOCONNECTION");
        }
    }

    /**
    The request token is needed to perform update or write ajax calls in owncloud 
    when using the internal APIs. It is meant to avoid cross-site request forgery

    The param is needed because "this"-context might not be the backend if called within a request
    @param  context  (object)    the backendOwncloud context
    */
    this.getRequestToken = function (obj, successCallback, errorCallback, context) {
        this.debug("Backend-Funktion getRequestToken");

        var successCallbackList = [successCallback];
        
        // Process result
        successCallbackList.push(function (response, successCallbackList, errorCallback, context) {
            if (response && response.token) {
                 context.requestToken = response.token;
                console.log("Request token: " + context.requestToken);

                var callback = successCallbackList.pop();
                callback(context);
            } else {
                errorCallback("NOTOKEN");
            }
        });

        var verb = "GET";
        var url = context.host + '/index.php/apps/requesttoken/ajax/requesttoken.php';
        var headers = [];
        var data = null;

        context.performRequest(verb, url, headers, data, successCallbackList, errorCallback, context);
    }

    this.isLoggedIn = function (obj) {
        return this.loginStatus;
    }

    this.setLoggedIn = function (obj) {
        if (obj && typeof obj.loginStatus != 'undefined') {
            this.loginStatus = obj.loginStatus;
        }
    }

    this.getDirectoryContent = function (obj, callbackList, errorCallback, frontendContext) {
        this.debug("Backend-Funktion getDirectoryContent");

        var fs = new WebDAV.Fs(this.host, this.authToken, this);

        var urlid = function (u) {
            return u.replace(/:/g, '_').replace(/\//g, '_');
        };

        callbackList.push(function (children, callbackList, errorCallback, context) {
            var elems = [];

            if (children === "ERROR") {
                errorCallback("no such element");
                return;
            }

            for (var c in children) {
                var child = {
                    isDir: false,
                    fileSize: children[c].fileSize,
                    path: children[c].path,
                    date: children[c].date,
                    deleted: false,
                    deletedId: false
                };

                if (typeof child.date !== "undefined") {
                    // Create Date from Object
                    child.date = apptranslator.formatDate(new Date(child.date));
                }

                if(children[c].type === "dir"){
                    child.isDir = true;
                };

                elems.push(child);
            }
           
            var callback = callbackList.pop();
            callback(elems, callbackList, errorCallback, context);
        });

        fs.dir(this.host + this.webdav + obj.path).children(this.authToken, callbackList, errorCallback, frontendContext);
    };

    this.getRemainingSpace = function (successCallback, errorCallback) {
        this.debug("Backend-Funktion getRemainingSpace");

        var callbackList = [];
        callbackList.push(successCallback); // Rückgabe

        // Ergebnis aufbereiten
        callbackList.push(function (obj, callbackList, errorCallback) {
            var remainingAll = apphelper.convertInAllFilesizes({ fileSize: obj.remainingBytes });
            obj.remainingBestNum = remainingAll.bestNum;
            obj.remainingBestText = remainingAll.bestText;

            var usedAll = apphelper.convertInAllFilesizes({ fileSize: obj.usedBytes });
            obj.usedBestNum = usedAll.bestNum;
            obj.usedBestText = usedAll.bestText;

            var totalAll = apphelper.convertInAllFilesizes({ fileSize: obj.totalBytes });
            obj.totalBestNum = totalAll.bestNum;
            obj.totalBestText = totalAll.bestText;

            var remainingPercent = obj.remainingBytes / obj.totalBytes * 100;
            obj.remainingPercentNum = apphelper.roundDigits(remainingPercent, 1);
            obj.usedPercentNum = apphelper.roundDigits(100 - remainingPercent, 1);
            obj.remainingPercent = apptranslator.formatNumber({ key: remainingPercent, numDecimals: 1 }) + "%";
            obj.usedPercent = apptranslator.formatNumber({ key: 100 - remainingPercent, numDecimals: 1 }) + "%";

            var callback = callbackList.pop();
            callback(obj);
        });

        var type = 'dir';
        var url = this.host + this.webdav + "/";

        var children = function (doc, callbackList, errorCallback) {
            if (!doc || doc.childNodes == null) {
                errorCallback();
            } else {
                var response = doc.childNodes[0]; // element itself -> exists always
                var propstat = response.getElementsByTagName('propstat')[0] || response.getElementsByTagName('d:propstat')[0];
                var prop = propstat.getElementsByTagName('prop')[0] || propstat.getElementsByTagName('d:prop')[0];
                var usedBytes = prop.getElementsByTagName('quota-used-bytes')[0] || prop.getElementsByTagName('d:quota-used-bytes')[0];
                usedBytes = parseInt(usedBytes.firstChild.data);
                var availableBytes = prop.getElementsByTagName('quota-available-bytes')[0] || prop.getElementsByTagName('d:quota-available-bytes')[0];
                availableBytes = parseInt(availableBytes.firstChild.data);

                var callback = callbackList.pop();
                callback({
                    remainingBytes: availableBytes,
                    usedBytes: usedBytes,
                    totalBytes: availableBytes + usedBytes
                }, callbackList, errorCallback);
            }
        };
        
        WebDAV.PROPFIND(url, this.authToken, function (res) { children(res, callbackList, errorCallback) });
    }

    this.deleteObject = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion deleteObject");
        console.log(this.host + this.webdav + obj.path);
        WebDAV.DELETE(this.host + this.webdav + obj.path, this.authToken, function (response) {
            var error = /<d:error/;
            if (error.test(response)) {
                errorCallback();
            } else {
                console.log("File successfully deleted");
                successCallback();
            }
        });
    }

    this.moveObject = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion moveObject");

        // Skip identical location
        if (obj.srcPath == obj.targetPath) {
            errorCallback("IDENTICAL");
            return;
        }

        // Unendliche Rekursion vermeiden
        //var splitPath = apphelper.convertPath({ path: obj.srcPath, isDir: obj.isDir });
        var find = obj.targetPath.indexOf(obj.srcPath);
        if (find == 0 && obj.isDir == true) { // target folder starts with src directory path
            errorCallback("RECURSION");
            return;
        }

        WebDAV.MOVE(this.host + this.webdav + obj.srcPath, this.host + this.webdav + obj.targetPath, this.authToken, function(response){
            var error = /<d:error/;
            if (error.test(response)) {
                errorCallback();
            } else {
                console.log("File successfully moved/renamed");
                successCallback();
            }
        });
    }

    this.renameObject = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion renameObject");

        this.moveObject(obj, successCallback, errorCallback);
    }
    
    this.createFolder = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion createFolder");

        WebDAV.MKCOL(this.host + this.webdav + obj.path + obj.folderName, this.authToken, function (response) {
            var error = /<d:error/;
            if (error.test(response)) {
                errorCallback();
            } else {
                console.log("Folder created");
                successCallback();
            }
        });
    }

    this.uploadFile = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion uploadFile");

        // Fehler, wenn die Funktion nicht gesetzt wurde
        if (this.uploadFunction) {
            var param = {
                path: this.host + this.webdav + obj.targetPath,
                username: this.username,
                password: this.password,
                authToken: this.authToken,
                fileSize: obj.fileSize
            };

            this.uploadFunction(param, successCallback, errorCallback, obj.file);
        } else {
            errorCallback();
        }
    }

    this.downloadFile = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion downloadFile");

        // Fehler, wenn die Funktion nicht gesetzt wurde
        if (this.downloadFunction) {
            var param = [];

            var totalSize = 0;
            //Mehrere Dateien gleichzeitig
            for (var i in obj) {
                param[i] = {
                    path: this.host + this.webdav + obj[i].dirName,
                    fileName: obj[i].fileName,
                    fileType: obj[i].fileType,
                    username: this.username,
                    password: this.password,
                    fileSize: obj[i].fileSize,
                    type: obj[i].type
                };

                if (obj[i].fileSize && obj[i].fileSize >= 0) {
                    totalSize += obj[i].fileSize;
                }
            }

            this.downloadFunction(param, successCallback, errorCallback, obj[0].targetFile, totalSize);
        } else {
            errorCallback();
        }
    }

    this.getDeletedFiles = function (obj, callbackList, errorCallback, frontendContext) {
        this.debug("Backend-Funktion restoreVersion");

        // Wichtig: Success callback IMMER ausführen (ggf. leere Rückgabe), da getDirectory darauf wartet
        var callback = callbackList.pop();

        var result = [];

        // Fehler abfangen
        if (!obj || !obj.path) {
            errorCallback();
            callback(result, callbackList, errorCallback, frontendContext);
            return;
        }

        this.doReAuthentication({},
            function (context) {
                var xhr = new XMLHttpRequest();

                if (callback && errorCallback) {
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                if (xhr.responseText === "") {
                                    errorCallback("NORESPONSE");
                                } else {
                                    var children = JSON.parse(xhr.responseText);

                                    for (var c in children) {
                                        var child = {
                                            isDir: false,
                                            fileSize: false, // there is no filesize in the trash
                                            path: "",
                                            date: children[c].timestamp * 1000,
                                            deleted: true,
                                            deletedId: children[c].timestamp
                                        };

                                        // construct path
                                        if (children[c].path) {
                                            child.path = children[c].directory;
                                        }
                                        child.path = child.path + "/";
                                        if (children[c].name) {
                                            child.path = child.path + children[c].name;
                                        }

                                        if (typeof child.date !== "undefined") {
                                            // Create Date from Object
                                            child.date = apptranslator.formatDate(new Date(child.date));
                                        }

                                        if (children[c].type === "dir") {
                                            child.isDir = true;
                                        };

                                        // Nur Elemente anzeigen, die dem Pfad entsprechen
                                        var pathOnly = "/";
                                        if (children[c].directory) {
                                            pathOnly = children[c].directory;
                                        }
                                        if (pathOnly == obj.path) {
                                            result.push(child);
                                        }
                                    }
                                }
                                // always trigger success
                                callback(result, callbackList, errorCallback, frontendContext);
                            }
                        }
                    };
                }

                var verb = "GET";
                var url = context.host + "/apps/trash_list/ajax/getList.php";

                xhr.open(verb, url, true);
                xhr.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
                xhr.setRequestHeader("Authorization", "Basic " + context.authToken);

                try {
                    xhr.send(null);
                } catch (e) {
                    errorCallback("NOCONNECTION");
                    callback(result, callbackList, errorCallback, frontendContext);
                }
            }, function () {
                errorCallback("AUTHENTICATIONERROR");
                callback(result, callbackList, errorCallback, frontendContext);
            });
    }

    this.restoreFile = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion restoreFile");

        // Fehler abfangen
        if (!obj || !obj.path || !obj.deletedId) {
            errorCallback();
            return;
        }

        this.doReAuthentication({},
            function (context) {
                var successCallbackList = [successCallback];

                // Process result
                successCallbackList.push(function (response, successCallbackList, errorCallback, context) {
                    if (response === "") {
                        errorCallback("NORESPONSE");
                    } else {
                        if (response && response.status && response.status == "success") {
                            var callback = successCallbackList.pop();
                            callback();
                        } else {
                            errorCallback("ERROR");
                        }
                    }
                });

                var ocPath = encodeURI('["' + obj.path.substring(1) + ".d" + obj.deletedId + '"]');

                var verb = "POST";
                var url = context.host + "/index.php/apps/files_trashbin/ajax/undelete.php";
                var data = "files=" + ocPath + "&dirlisting=0";
                var headers = [];
                headers.push({ name: "Content-type", content: "application/x-www-form-urlencoded; charset=UTF-8" });
                headers.push({ name: "Content-length", content: data.length });
                headers.push({ name: "requesttoken", content: context.requestToken });
                headers.push({ name: "X-Requested-With", content: "XMLHttpRequest" });

                context.performRequest(verb, url, headers, data, successCallbackList, errorCallback, context);
            }, function () {
                errorCallback("AUTHENTICATIONERROR");
            });
    }

    this.getVersions = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion getVersions");

        // Fehler abfangen
        if (!obj || !obj.path) {
            errorCallback();
            return;
        }

        var xhr = new XMLHttpRequest();

        if (successCallback && errorCallback) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (xhr.responseText === "") {
                            successCallback([]); // Leere Antwort
                        } else {
                            var response = JSON.parse(xhr.responseText);
                            var result = [];
                            for (i in response) {
                                result.push({
                                    path: obj.path,
                                    size: response[i].size,
                                    versionId: response[i].version,
                                    date: apptranslator.formatDate(new Date(response[i].version * 1000))
                                });
                            }
                            //successCallback(result.splice(0,1)); // skip first element (=current version)
                            successCallback(result);
                        }
                    } else {
                        errorCallback();
                    }
                }
            };
        }

        var verb = "GET";
        var url = this.host + "/apps/files_versions/ajax/getVersions.php?source=" + encodeURI(obj.path);

        xhr.open(verb, url, true);
        xhr.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
        xhr.setRequestHeader("Authorization", "Basic " + this.authToken);
        //xhr.responseType = "json";

        try {
            xhr.send(null);
        } catch(e) {
            errorCallback();
        }
    }

    this.restoreVersion = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion restoreVersion");

        // Fehler abfangen
        if (!obj || !obj.path || !obj.versionId) {
            errorCallback();
            return;
        }

        this.doReAuthentication({},
            function(context){
                var xhr = new XMLHttpRequest();

                if (successCallback && errorCallback) {
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) { 
                            if (xhr.status >= 200 && xhr.status < 300) {
                                if (xhr.responseText === "") {
                                    errorCallback("NORESPONSE");
                                } else {
                                    var response = JSON.parse(xhr.responseText);
                                    if(response && response.status && response.status == "success"){
                                        successCallback();
                                    } else {
                                        errorCallback("ERROR");
                                    }
                                }
                            }
                        }
                    };
                }

                var verb = "GET";
                var url = context.host + "/apps/files_versions/ajax/rollbackVersion.php?"
                    + "file=" + encodeURI(obj.path)
                    + "&revision=" + encodeURI(obj.versionId)
                    + "&requesttoken=" + context.requestToken;

                xhr.open(verb, url, true);
                xhr.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
                xhr.setRequestHeader("Authorization", "Basic " + context.authToken);
                //xhr.responseType = "json";

                try {
                    xhr.send(null);
                } catch(e) {
                    errorCallback("NOCONNECTION");
                }
            }, function(){
                errorCallback("AUTHENTICATIONERROR");
            });
    }

    this.shareObject = function (obj, successCallback, errorCallback) {
        var callbackList = [];

        // Rückgabe
        callbackList.push(successCallback);

        // Share durchführen
        callbackList.push(this.shareFromDataId);

        this.getDataId(obj, callbackList, errorCallback, this);
    }

    this.getDataId = function (obj, callbackList, errorCallback, context) {
        this.debug("Backend-Funktion getDataId");

        // Fehler abfangen
        if (!obj || !obj.path) {
            errorCallback();
            return;
        }

        var xhr = new XMLHttpRequest();

        if (callbackList.length > 0 && errorCallback) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (xhr.responseText === "") {
                            errorCallback(); // Leere Antwort
                        } else {
                            var response = JSON.parse(xhr.responseText);
                            //Shared-Ordner gewählt
                            if (response["data-id"] == -1) {
                                //TODO: Spezifizieren
                                errorCallback();
                            } else {
                                obj.dataId = response["data-id"];

                                var callback = callbackList.pop();
                                callback(obj, callbackList, errorCallback, context);
                            }
                        }
                    } else {
                        errorCallback();
                    }
                }
            };
        }

        var verb = "POST";
        var url = this.host + "/index.php/apps/data_id/ajax/getId.php";
        var params = "path=" + encodeURI(obj.path) + "&requesttoken=" + this.requestToken;

        xhr.open(verb, url, true);
        xhr.setRequestHeader("Authorization", "Basic " + this.authToken);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.setRequestHeader("Content-length", params.length);
        xhr.setRequestHeader("requesttoken", this.requestToken);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        //xhr.responseType = "json";

        try {
            xhr.send(params);
        } catch (e) {
            errorCallback();
        }
    }

    this.shareFromDataId = function (obj, callbackList, errorCallback, context) {
        if (!obj || !obj.path || !obj.dataId || typeof obj.shareType === "undefined") {
            errorCallback();
            return;
        }

        var permission = 0;
        if (obj.permissionRead) permission += 1;
        if (obj.permissionWrite) permission += 2;
        if (obj.permissionCreate) permission += 4;
        if (obj.permissionDelete) permission += 8;
        if (obj.permissionReshare) permission += 16;
        itemType = null;
        if (obj.isDir)
            itemType = 'folder';
        else
            itemType = 'file';

        var xhr = new XMLHttpRequest();
        if (callbackList.length > 0 && errorCallback) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (xhr.responseText === "") {
                            errorCallback(); // Leere Antwort
                        } else {
                            var response = JSON.parse(xhr.responseText);
                            
                            //1) Sharing failed, because the sharing backend for folder could not find its source
                            //2) Sharing failed, because this item is already shared with user
                            if (response.status == "error") {
                                //TODO: Fehlermeldungen an errorCallback übergeben
                                if (response.data.message.indexOf("already shared with user")) {
                                    errorCallback("ALREADYHASSHARE");
                                /*} else if (response.data.message.indexOf("could not find its source")) {
                                    errorCallback("PERMISSIONERROR");*/
                                } else {
                                    errorCallback();
                                }
                            } else {
                                var callback = callbackList.pop();
                                callback(response);
                            }
                        }
                    } else {
                        errorCallback();
                    }
                }
            };
        }

        var verb = "POST";
        var url = context.host + "/index.php/core/ajax/share.php";
        var params = "action=share" + "&shareType=" + obj.shareType + "&shareWith=" + obj.shareWith + "&itemType=" + itemType + "&itemSource=" + obj.dataId + "&permissions=" + permission;

        xhr.open(verb, url, true);
        xhr.setRequestHeader("Authorization", "Basic " + context.authToken);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        xhr.setRequestHeader("Content-length", params.length);
        xhr.setRequestHeader("requesttoken", context.requestToken);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        //xhr.responseType = "json";

        try {
            xhr.send(params);
        } catch (e) {
            errorCallback();
        }
    }

    this.getShareLink = function (obj, successCallback, errorCallback) {
        obj.shareType = 3; // Link
        obj.shareWith = "";
        obj.permissionRead = true;

        var me = this;
        this.shareObject(obj, function (answer) {
            if (answer.status == "success" && answer.data && answer.data.token) {
                successCallback({ link: me.host + "/public.php?service=files&t=" + answer.data.token });
            } else {
                errorCallback();
            }
        }, errorCallback);
    }

    this.unshareObject = function (obj, successCallback, errorCallback) {
        var callbackList = [];

        // Rückgabe
        callbackList.push(successCallback);

        // Ergebnis aufbereiten
        callbackList.push(function (result, callbackList, errorCallback, context) {
            if (typeof result === "undefined" || result.status == "error") {
                errorCallback();
                return;
            }
            var callback = callbackList.pop();
            callback();
        });

        // Status abrufen
        callbackList.push(function (obj, callbackList, errorCallback, context) {
            var verb = "POST";

            var itemType = "file";
            if (obj.isDir) itemType = 'folder';

            var shareType = 1;
            if (obj.shareToUser) shareType = 0;

            var url = context.host + "/index.php/core/ajax/share.php";
            var data = "action=unshare&itemType=" + itemType + "&itemSource=" + obj.dataId + "&shareType=" + shareType + "&shareWith=" + obj.shareWith;

            var headers = [];
            headers.push({ name: "Content-Type", content: "application/x-www-form-urlencoded; charset=UTF-8" });
            headers.push({ name: "requesttoken", content: context.requestToken });
            headers.push({ name: "X-Requested-With", content: "XMLHttpRequest" });

            context.performRequest(verb, url, headers, data, callbackList, errorCallback, context);
        });

        // erst Data-id in Erfahrung bringen
        this.getDataId(obj, callbackList, errorCallback, this);
    }

    this.getShareStatus = function (obj, successCallback, errorCallback) {
        var callbackList = [];

        // Rückgabe
        callbackList.push(successCallback);

        // Ergebnis aufbereiten
        callbackList.push(function (result, callbackList, errorCallback, context) {
            if (!result || result == "" || result.status == "error" || !result.data) {
                errorCallback();
                return;
            }

            var shareList = [];
            for (var share in result.data.shares) {
                var elem = result.data.shares[share];

                // Permissions
                var permissionRead = false;
                var permissionWrite = false;
                var permissionCreate = false;
                var permissionDelete = false;
                var permissionReshare = false;
                if (elem.permissions >= 16) {
                    permissionReshare = true;
                    elem.permissions -= 16;
                }
                if (elem.permissions >= 8) {
                    permissionDelete = true;
                    elem.permissions -= 8;
                }
                if (elem.permissions >= 4) {
                    permissionCreate = true;
                    elem.permissions -= 4;
                }
                if (elem.permissions >= 2) {
                    permissionWrite = true;
                    elem.permissions -= 2;
                }
                if (elem.permissions >= 1) {
                    permissionRead = true;
                    elem.permissions -= 1;
                }

                var shareType = false;
                if (elem.share_type == 0) {
                    shareType = true;
                } else if (elem.share_type == 1){
                    elem.share_with_displayname = elem.share_with_displayname + " (group)";
                } else if (elem.share_type == 3) {
                    // Skip public link
                    continue;
                }

                shareList.push({
                    permissionRead: permissionRead,
                    permissionWrite: permissionWrite,
                    permissionCreate: permissionCreate,
                    permissionDelete: permissionDelete,
                    permissionReshare: permissionReshare,
                    label: elem.share_with_displayname,
                    shareWith: elem.share_with,
                    shareToUser: shareType
                });
            }

            var callback = callbackList.pop();
            callback(shareList);
        });

        // Status abrufen
        callbackList.push(function (obj, callbackList, errorCallback, context) {
            var verb = "GET";

            var itemType = "file";
            if (obj.isDir) itemType = 'folder';

            var url = context.host + "/index.php/core/ajax/share.php?fetch=getItem&itemType=" + itemType + "&itemSource=" + obj.dataId + "&checkReshare=true&checkShares=true";

            var headers = [];
            headers.push({ name: "Content-Type", content: "text/xml; charset=UTF-8" });
            headers.push({ name: "requesttoken", content: context.requestToken });
            headers.push({ name: "X-Requested-With", content: "XMLHttpRequest" });

            context.performRequest(verb, url, headers, "", callbackList, errorCallback, context);
        });

        // erst Data-id in Erfahrung bringen
        this.getDataId(obj, callbackList, errorCallback, this);
    }

    this.getShareAutocomplete = function (obj, callback) {
        var errorCallback = function () {
            callback({ shareTargets: [] }); // Return empty array 
        };
        
        if (typeof obj.key === "undefined") {
            errorCallback();
        }

        var callbackList = [];

        // Rückgabe
        callbackList.push(callback);

        // Ergebnis aufbereiten
        callbackList.push(function (result, callbackList, errorCallback, context) {
            if (typeof result === "undefined" || result.status == "error" || !result.data) {
                errorCallback();
                return;
            }

            var shareTargets = [];
            for (var elem in result.data) {
                // Manchmal leere Anzeigenamen
                var label = result.data[elem].label;
                if (label === " ") {
                    label = result.data[elem].value.shareWith;
                }

                shareTargets.push({
                    label: label,
                    shareWith: result.data[elem].value.shareWith,
                    shareToUser: !result.data[elem].value.shareType
                });
            }

            shareTargets = shareTargets.sort(apphelper.sortByParam("label"));

            var callback = callbackList.pop();
            callback({ shareTargets: shareTargets });
        });

        // Shareliste abrufen
        var verb = "GET";
        var url = this.host + "/index.php/core/ajax/share.php?fetch=getShareWith&search=" + obj.key + "&itemShares%5B%5D=true";
        var data = "";

        var headers = [];
        headers.push({ name: "Content-Type", content: "text/xml; charset=UTF-8" });
        headers.push({ name: "requesttoken", content: this.requestToken });
        headers.push({ name: "X-Requested-With", content: "XMLHttpRequest" });

        this.performRequest(verb, url, headers, data, callbackList, errorCallback, this);
    }

    this.getFileeeContent = function (obj, successCallback, errorCallback) {
        var callbackList = [];

        // Rückgabe
        callbackList.push(successCallback);

        // Ergebnis aufbereiten
        callbackList.push(function (result, callbackList, errorCallback, context) {
            if (typeof result === "undefined" || result == "" || result.status == "error") {
                errorCallback(result);
                return;
            }

            var resultcontent;
            if (result.result == "null") {
                resultcontent = "";
            } else {
                resultcontent = result.result.content;
            }

            var callback = callbackList.pop();
            callback({ content: resultcontent });
        });

        // Analyseergebnisse abrufen
        var verb = "POST";

        if (!obj.path) {
            errorCallback();
        }

        var url = this.host + "/index.php/apps/fileee_ocr/ajax/getAnalysedContent.php";
        var data = "path=" + encodeURI(obj.path);

        var headers = [];
        headers.push({ name: "Content-Type", content: "application/x-www-form-urlencoded; charset=UTF-8" });
        headers.push({ name: "X-Requested-With", content: "XMLHttpRequest" });

        this.performRequest(verb, url, headers, data, callbackList, errorCallback, this);
    }

    this.fileeeAnalyse = function (obj, successCallback, errorCallback) {
        var callbackList = [];

        // Rückgabe
        callbackList.push(successCallback);

        // Ergebnis aufbereiten
        callbackList.push(function (result, callbackList, errorCallback, context) {
            if (typeof result === "undefined" || result == "" || result.status == "error") {
                errorCallback();
                return;
            }
            var callback = callbackList.pop();
            callback();
        });

        // Analyse starten abrufen
        var verb = "POST";

        if (!obj.path) {
            errorCallback();
        }

        var url = this.host + "/index.php/apps/fileee_ocr/ajax/startAnalyse.php";
        var data = "path=" + encodeURI(obj.path);

        var headers = [];
        headers.push({ name: "Content-Type", content: "application/x-www-form-urlencoded; charset=UTF-8" });
        headers.push({ name: "X-Requested-With", content: "XMLHttpRequest" });

        this.performRequest(verb, url, headers, data, callbackList, errorCallback, this);
    }

    this.getDocxFulltext = function (obj, successCallback, errorCallback) {
        var callbackList = [];

        // Rückgabe
        callbackList.push(successCallback);

        // Ergebnis aufbereiten
        callbackList.push(function (result, callbackList, errorCallback, context) {
            if (typeof result === "undefined" || result == "") {
                errorCallback();
                return;
            }
            if (result.status && result.status == "error") {
                errorCallback("PLUGINERROR");
            }

            var callback = callbackList.pop();
            callback(result);
        });

        // Analyse starten abrufen
        var verb = "POST";

        
        if (typeof obj.path === "undefined" || !obj.fileType) {
            errorCallback();
        }
        if (obj.fileType !== ".docx") {
            errorCallback("UNSUPPORTEDFILETYPE");
        }

        var url = this.host + "/index.php/apps/word_reader/ajax/getWordContent.php";
        var data = "path=" + encodeURI(obj.path);

        var headers = [];
        headers.push({ name: "Content-Type", content: "application/x-www-form-urlencoded; charset=UTF-8" });
        headers.push({ name: "X-Requested-With", content: "XMLHttpRequest" });

        this.performRequest(verb, url, headers, data, callbackList, errorCallback, this);
    }
}
