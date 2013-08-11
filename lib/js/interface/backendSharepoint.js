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
//Backend-Sharepoint
var backendSharepoint = function () {
    this.implements = ["Backend"];
    this.host = false;
    this.loginStatus = false;
    this.debugMode = false;
    this.webdav = false;
    this.downloadFunction = false;
    this.uploadFunction = false;

    this.doInit = function (obj) {
        //Auf Interface-Einhaltung prüfen, sonst wird Fehler generiert
        InterfaceHelper.ensureImplements(this, Backend);

        this.debug("Backend-Interface: Sharepooint");

        // Verbindunsdetails
        this.host = apphelper.normalizePath(obj.host, { trailingSlash: false, prependSlash: false });
        //this.webdav = "/DokumenteApp";
        this.webdav = apphelper.normalizePath(obj.relativePath, { trailingSlash: false, prependSlash: true });
        this.downloadFunction = obj.downloadFunction;
        this.uploadFunction = obj.uploadFunction;

        //Konfigurationsdaten
        this.debugMode = obj.debug;

        return true;
    };

    this.debug = function (msg) {
        // Debug-Meldung ausgeben, falls im Debug-Modus
        if (typeof this.debugMode !== 'undefined' && this.debugMode === true) {
            console.log(msg.toString());
        }
    }

    this.hasFunctionality = function (obj) {
        console.log("Backend-Funktion hasFunctionality");

        var result = false;

        switch (obj.functionkey) {
            case "getPublicLink": result = false; break;
            case "getRemainingSpace": result = false; break;
            case "getDeletedFiles": result = false; break;
            case "getFileHistory": result = false; break;
            case "shareFile": result = false; break;
            case "fileee": result = false; break;
            case "hasWordPreview": result = true; break;
            default:
                result = false;
        }

        return result;
    };

    this.doAuthentication = function (obj, successCallback, errorCallback) {
        obj.successCallback = successCallback;
        obj.errorCallback = errorCallback;

        this.requestToken(obj, this.signIn);
    };

    this.requestToken = function (obj, callback) {
        console.log(obj.username + ':' + obj.password);

        var token = this.token;

        $.ajax({
            'url': 'https://login.microsoftonline.com/extSTS.srf',
            dataType: 'text',
            type: 'POST',
            'data': '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"><s:Header><a:Action s:mustUnderstand="1">http://schemas.xmlsoap.org/ws/2005/02/trust/RST/Issue</a:Action><a:MessageID>urn:uuid:40c1407d-b2a4-4e05-8248-8a92b71102b6</a:MessageID><a:ReplyTo><a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address></a:ReplyTo><a:To s:mustUnderstand="1">https://login.microsoftonline.com/extSTS.srf</a:To><o:Security s:mustUnderstand="1" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"><u:Timestamp u:Id="_0"><u:Created>2012-07-26T16:13:00.622Z</u:Created><u:Expires>2012-07-26T16:18:00.622Z</u:Expires></u:Timestamp><o:UsernameToken u:Id="uuid-69882db9-2d6b-45d3-b016-c2156cb6c01d-1"><o:Username>'
                    + obj.username + '</o:Username><o:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">'
                    + obj.password + '</o:Password></o:UsernameToken></o:Security></s:Header><s:Body><t:RequestSecurityToken xmlns:t="http://schemas.xmlsoap.org/ws/2005/02/trust"><wsp:AppliesTo xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy"><a:EndpointReference><a:Address>https://somethingonline.sharepoint.com/_forms/default.aspx?wa=wsignin1.0</a:Address></a:EndpointReference></wsp:AppliesTo><t:KeyType>http://schemas.xmlsoap.org/ws/2005/05/identity/NoProofKey</t:KeyType><t:RequestType>http://schemas.xmlsoap.org/ws/2005/02/trust/Issue</t:RequestType><t:TokenType>urn:oasis:names:tc:SAML:1.0:assertion</t:TokenType></t:RequestSecurityToken></s:Body></s:Envelope>',
            headers: {
                Accept: "application/soap+xml; charset=utf-8"
            },
            success: function (result, textStatus, jqXHR) {
                var xmlDoc = $.parseXML(result);
                var xml = $(xmlDoc)
                var binToken = xml.find("BinarySecurityToken").text() || xml.find("wsse\\:BinarySecurityToken").text();

                //Einloggen mit Token
                token = binToken;
                obj.token = binToken;
                callback(obj);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown + 'error login:' + jqXHR.responseText);

                obj.errorCallback("AUTHENTICATIONERROR");
            }
        });
    }


    this.signIn = function (obj) {
        console.log('Start Sharepoint SignIn with token ' + obj.token);
        $.ajax({
            'url': 'https://pscloudservices.sharepoint.com/_forms/default.aspx?wa=wsignin1.0',
            dataType: 'text',
            type: 'POST',
            'data': obj.token,
            headers: {
                Accept: "application/x-www-form-urlencoded"
            },
            success: function (result, textStatus, jqXHR) {
                var error = /ms-error-header/;
                if (error.test(jqXHR.responseText)) {
                    console.log("Error while signing in");
                    obj.errorCallback();
                } else {
                    console.log('SP signin successful');
                    obj.successCallback("FULLSUCCESS");
                } 
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('error SP signin:' + jqXHR.responseText);

                obj.errorCallback("AUTHENTICATIONERROR");
            }
        });
    }
   
    this.doReAuthentication = function (obj) {
        //Nothing to do in sharepoint
        return true;
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
        var host = this.host;
        var debug = this.debug;

        var isRoot = false;
        if (obj.path == '/') {
            // Rootordner enthält Ordner "Forms" der aussortiert werden muss
            isRoot = true;
        }
        this.debug("Get directory for path: " + host + "/_api/web/GetFolderByServerRelativeUrl('" + this.webdav + obj.path + "')/Folders");

        // Files and folders
        var elems = [];
        var fileSuccess = false;
        var folderSuccess = false;

        var self = this;

        $.ajax({
            'url': host + "/_api/web/GetFolderByServerRelativeUrl('" + encodeURI(self.webdav) + obj.path + "')/Folders",
            type: 'GET',
            headers: {
                Accept: "application/json;odata=verbose"
            },
            success: function (result, textStatus, jqXHR) {
                debug('REST request for folders successful');
                var objects = result.d.results;

                $(objects).each(function (e) {
                    var child = {
                        isDir: true,
                        fileSize: objects[e].Length,
                        path: objects[e].ServerRelativeUrl.substring(self.webdav.length)
                    };

                    debug(JSON.stringify(child));
                    if (isRoot && objects[e].Name == "Forms") {
                        // Element ist "Forms" Ordner, der ausgeblendet werden muss
                    } else {
                        elems.push(child);
                    }
                });

                if (fileSuccess) {
                    var callback = callbackList.pop();
                    callback(elems, callbackList, errorCallback, frontendContext);
                } else {
                    folderSuccess = true;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                debug('error with folders:' + jqXHR.responseText);
                errorCallback();
            }
        });

        //Files
        $.ajax({
            'url': host + "/_api/web/GetFolderByServerRelativeUrl('" + encodeURI(self.webdav) + obj.path + "')/Files",
            //  dataType: 'xml',
            type: 'GET',
            headers: {
                // Accept: "text/html,application/xhtml+xml,application/xml"
                Accept: "application/json;odata=verbose"
            },
            success: function (result, textStatus, jqXHR) {
                debug('REST request for files successful');
                var objects = result.d.results;

                $(objects).each(function (e) {
                    var child = {
                        isDir: false,
                        fileSize: objects[e].Length,
                        path: objects[e].ServerRelativeUrl.substring(self.webdav.length)
                    };

                    debug(JSON.stringify(child));
                    elems.push(child);
                });

                if (folderSuccess) {
                    var callback = callbackList.pop();
                    callback(elems, callbackList, errorCallback, frontendContext);
                } else {
                    fileSuccess = true;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                debug('error with files:' + jqXHR.responseText);
                errorCallback();
            }
        });
    }

    this.getRemainingSpace = function () {
        this.debug("Backend-Funktion getRemainingSpace");
        //Keine Funktion
        return true;
    }

    this.deleteObject = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion deleteObject");
        this.debug("Delete: " + this.host + this.webdav + obj.path);
        var debug = this.debug;

        $.ajax({
            'url': this.host + this.webdav + obj.path,
            type: 'DELETE',
            headers: {
                Accept: "application/json;odata=verbose"
            },
            success: function (result, textStatus, jqXHR) {
                if (jqXHR.status == 204) { //empty success response 
                    debug('Object deleted');
                    successCallback();
                } else {
                    debug('Object delete failed');
                    errorCallback();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                debug('Object deletion failed:' + jqXHR.responseText);
                errorCallback();
            }
        });
    }
    
    this.moveObject = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion moveObject");
        this.debug("Move from: " + this.host + this.webdav + obj.srcPath + " TO: " + this.host + this.webdav + obj.srcPath);
        var debug = this.debug;

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

        $.ajax({
            'url': this.host + this.webdav + obj.srcPath,
            type: 'MOVE',
            headers: {
                Accept: "application/json;odata=verbose",
                Destination: this.host + this.webdav + obj.targetPath
            },
            success: function (result, textStatus, jqXHR) {
                if (jqXHR.status == 201 || jqXHR.status == 204) { // created response || empty success response 
                    debug('Object moved');
                    successCallback();
                } else {
                    debug('Object move failed');
                    errorCallback();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                debug('Object move failed:' + jqXHR.responseText);
                errorCallback();
            }
        });
    }

    this.createFolder = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion createFolder");
        this.debug("Create folder: " + this.host + this.webdav + obj.path + obj.folderName);

        var debug = this.debug;
        $.ajax({
            'url': this.host + this.webdav + obj.path + obj.folderName,
            type: 'MKCOL',
            headers: {
                Accept: "application/json;odata=verbose"
            },
            success: function (result, textStatus, jqXHR) {
                if (jqXHR.status == 201) { // success response code
                    debug('Folder created');
                    successCallback();
                } else {
                    this.debug('Folder creation failed');
                    errorCallback();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                debug('Folder creation failed: ' + jqXHR.responseText);
                errorCallback();
            }
        });
    }
    
    this.uploadFile = function (obj, successCallback, errorCallback) {
        this.debug("Backend-Funktion uploadFile");

        this.doReAuthentication({});

        //TODO: Crash sofern Upload-Ordner in Zwischenzeit gelöscht wurde

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

        this.doReAuthentication({});

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
        var callback = callbackList.pop();
        callback([], callbackList, errorCallback, frontendContext);
    }

    this.restoreFile = function (obj, successCallback, errorCallback) {
        errorCallback();
    }

    this.getVersions = function (obj, successCallback, errorCallback) {
        errorCallback();
    }

    this.restoreVersion = function (obj, successCallback, errorCallback) {
        errorCallback();
    }

    this.shareObject = function (obj, successCallback, errorCallback) {

    }

    this.getShareLink = function (obj, callbackList, errorCallback, context) {

    }

    this.unshareObject = function (obj, successCallback, errorCallback) {

    }

    this.getShareStatus = function (obj, successCallback, errorCallback) {

    }

    this.getShareAutocomplete = function (obj, callback) {
        callback({ shareTargets: [] });
    }

    this.fileeeAnalyse = function (obj, successCallback, errorCallback) {

    }

    this.getFileeeContent = function (obj, successCallback, errorCallback) {

    }

    this.getDocxFulltext = function (obj, successCallback, errorCallback) {

    }
}

/* var client = new $.RestClient("https://pscloudservices.sharepoint.com/_api/");

 client.add('web');

 var request = client.web.read("GetFolderByServerRelativeUrl('/Dokumente/Kickoff')/Files").always(function (data) {
     console.log(data);
     $(data.responseData.results).each(function (index, value) {
         console.log("Result: " + value.title);
     });
 });*/
