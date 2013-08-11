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
//Backend-Dummy
var backendDummy = function () {
   this.implements = ["Backend"];

   this.doInit = function (obj) {
       InterfaceHelper.ensureImplements(this, Backend);

       console.log("Backend-Interface: Dummy-Implementierung");

       return true;
   };

   this.debug = function (msg) {
       // Debug-Meldung ausgeben, falls im Debug-Modus
       if (typeof this.config.debug !== 'undefined' && this.config.debug === true) {
           console.log(msg.toString());
       }
   }

   this.hasFunctionality = function (key) {
       console.log("Backend-Funktion hasFunctionality");

       return true;
   }

   this.setBackend = function (obj) {
       console.log("Backend-Funktion setBackend");

       return true;
   }

   this.doAuthentication = function (obj, loginSuccess, loginError) {
       console.log("Backend-Funktion doAuthentication");

       loginSuccess();
   }

   this.doReAuthentication = function () {
       console.log("Backend-Funktion doReAuthentication");

       return true;
   }

   this.isLoggedIn = function () {
       console.log("Backend-Funktion isLoggedIn");

       return true;
   };

   this.getDirectoryContent = function (obj) {
       console.log("Backend-Funktion getDirectoryContent");

       var obj = new Array();
       obj.push({
           path: "/test.txt",
           isDir: false,
           filesize: 123456
       }, {
           path: "/datei2.pdf",
           isDir: false,
           filesize: 2345678
       }, {
           path: "/ordner1",
           isDir: true,
           filesize: 0
       });

       return obj;
   }

   this.getRemainingSpace = function () {
       this.debug("Backend-Funktion getRemainingSpace");

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

   this.uploadFile = function (obj, successCallback, errorCallback, file) {
       this.debug("Backend-Funktion uploadFile");

       this.doReAuthentication({});

       // Fehler, wenn die Funktion nicht gesetzt wurde
       if (this.uploadFunction) {
           var param = {
               path: this.host + this.webdav + obj.targetPath,
               username: this.username,
               password: this.password,
               authToken: this.authToken,
               fileSize: obj.fileSize
           };

           this.uploadFunction(param, successCallback, errorCallback, file);
       } else {
           errorCallback();
       }
   }

   this.downloadFile = function (obj, successCallback, errorCallback, targetFile) {
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

           this.downloadFunction(param, successCallback, errorCallback, targetFile, totalSize);
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
};
