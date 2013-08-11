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
//Version 4.20.130708

//Specification of the backend interface
var Backend = new Interface("Backend",
    [
        //////////////
        // WICHTIG: Keine Änderungen ohne Absprache! 
        // Jede neue Version ist separat nochmal als backendInterface-Vx.x.yymmdd.js 
        // im Ordner "res" zu speichern (z.B. backendInterface-V0.1.130514.js)
        // (0=iteration, 1=version inkrementell, 130514=datum)
        //////////////

        //////////////
        // GRUNDLAGEN:
        //- Funktionen nutzen camelCase
        //- Funktionsbenennung: Verb + Beschreibung
        //- Englische Bezeichnung
        //- Parameter und Rückgabewerte sind nach Möglichkeit gesammelt als ein Objekt zu übergeben
        //- Nicht-unterstützte Funktionen geben nichts zurück, müssen aber vorhanden sein
        //- Die aufrufende Funktion soll sicherstellen, dass nicht-unterstützte Funktionen 
        //  möglichst gar nicht erst aufgerufen werden
        //////////////

        /**
        Initialize Backend
        @param = obj = {
            host                (string)    url
            port                (integer)   port number of custom backend
            downloadFunction    (function)  function to be called for file download
            uploadFunction      (function)  function to be called for file upload
            }
        @return (boolean) Result of Initialization
        */
        "doInit",

        /**
        Print debug message if config is set to debug-mode
        ! This function is against the convention on purpose to keep the call short!
        @param msg  (string) Message to print
        @return -
        */
        "debug",

        /**
        Check if the function in question is supported by the backend implementation
        @param = obj = {
            functionkey     (string) identifier of the function to be tested
            }
        @return (boolean) support of this function
        */
        "hasFunctionality",

        /**
        Perform all necessary actions to initially authenticate the user, 
        e.g. login, authorization protocol, api-key generation,...
        @param obj = {
            username        (string) user name
            password        (string) password
            }
        @return (boolean) Result of Authentication efforts
        */
        "doAuthentication",

        /**
        Perform all necessary actions to reauthenticate the user, 
        e.g. login-renewal, authorization protocol, api-key refresh,...
        @param obj = {
            }
        @param successCallback
        @param errorCallback
        @return (boolean) Result of Authentication efforts
        */
        "doReAuthentication",

        /**
        Checks if the current authentication is still valid
        @param --
        @return (boolean) login status
        */
        "isLoggedIn",

        /**
        Sets login status
        @param obj = {
            loginStatus     (boolean) login status
        }
        @return --
        */
        "setLoggedIn",

        /**
        Get files and folders of a directory (ASYNCHRONOUS)
        @param obj = {
            path            (string) path of target directory
            }
        @param successCallback      (function) to be called when authentification is done and successful
        @param errorCallback        (function) to be called when authentification is done and with errors
        @return --
        @return ASYNC Array(obj) = [{
            path            (string)    path of element from root element
            isDir           (boolean)   is the element a directory itself?
            fileSize        (integer)   filesize in bytes
            }]
        */
        "getDirectoryContent",


        /**
        Get the remaining space that is allocated to the user (ASYNCHRONOUS)
        @param --
        @param successCallback      (function) to be called when authentification is done and successful
        @param errorCallback        (function) to be called when authentification is done and with errors
        @return --
        @return ASYNC (obj) = {
            remainingBytes      (integer)   remaining userspace in bytes
            remainingBestNum    (integer)   remaining userspace in best fitting numerical value (in byte, kb, mb or gb) 
                                            (best = where value between 0 and 999)
            remainingBestText   (string)    remaining userspace in best fitting numerical value (in byte, kb, mb or gb) 
                                            (best = where value between 0 and 999)
            usedBytes           (integer)   used userspace in bytes
            usedBestNum         (integer)   remaining userspace in best fitting numerical value (in byte, kb, mb or gb) 
                                            (best = where value between 0 and 999)
            usedBestText        (string)    remaining userspace in best fitting numerical value (in byte, kb, mb or gb) 
                                            (best = where value between 0 and 999)
            totalBytes          (integer)   total userspace in bytes
            totalBestNum        (integer)   total userspace in best fitting numerical value (in byte, kb, mb or gb) 
                                            (best = where value between 0 and 999)
            totalBestText       (string)    total userspace in best fitting numerical value (in byte, kb, mb or gb) 
                                            (best = where value between 0 and 999)
            }
        */
        "getRemainingSpace",


        /**
        Delete the file or folder and its content  (ASYNCHRONOUS)

        @param (obj) = {
            path            (string)        path to be deleted
            }
        @param successCallback      (function) to be called when authentification is done and successful
        @param errorCallback        (function) to be called when authentification is done and with errors
        @return --
        */
        "deleteObject",


        /**
        Move the file or folder and its content (ASYNCHRONOUS)

        @param (obj) = {
            srcPath         (string)     source path to be moved from
            targetPath      (string)     target path to be moved to
            }
        @param successCallback      (function) to be called when authentification is done and successful
        @param errorCallback        (function) to be called when authentification is done and with errors
        @return --
        */
        "moveObject",


        /**
        Create a folder on the server (ASYNCHRONOUS)

        @param (obj) = {
            path            (string)     path to the containing folder
            folderName      (string)     name of the folder
            }
        @param successCallback      (function) to be called when authentification is done and successful
        @param errorCallback        (function) to be called when authentification is done and with errors
        @return --
        */
        "createFolder",


        /**
        Upload a file (ASYNCHRONOUS)

        @param (obj) = {
            targetPath      (string)    target path to be uploaded to
            }
        @param successCallback      (function) to be called when authentification is done and successful
        @param errorCallback        (function) to be called when authentification is done and with errors
        @return --
        */
        "uploadFile",


        /**
        Download a file (ASYNCHRONOUS)

        @param (obj) = {
            dirName         (string)    target path to be downloaded from
            fileType        (string)    file type
            fileName        (string)    filename
            }
        @param successCallback      (function) to be called when authentification is done and successful
        @param errorCallback        (function) to be called when authentification is done and with errors
        @return --
        */
        "downloadFile",


        /**
        Get a list of deleted files (ASYNCHRONOUS)
        @param obj = {
            path                    (string) path of target directory
            }
        @param successCallback      (function) to be called when authentification is done and successful
        @param errorCallback        (function) to be called when authentification is done and with errors
        @return --
        @return ASYNC Array(obj) = [{
            path            (string)    path of element from root element
            isDir           (boolean)   is the element a directory itself?
            fileSize        (integer)   filesize in bytes
            }]
        */
        "getDeletedFiles",


        /**
        Restore a deleted file (ASYNCHRONOUS)
        @param obj = {
            path                (string)    the path (incl. filename) to the element to be restored
            deletedId           (integer)   the timestamp of the element to be restored
            }
        @param  successCallback (function)  to be called when deletion is done and successful
        @param  errorCallback   (function)  to be called when deletion is done and with errors
        @return --
        */
        "restoreFile",


        /**
        Show previous versions of a file (ASYNCHRONOUS)
        @param obj = {
            path                (string)    the path (incl. filename) to the element
        }
        @param  successCallback (function)  to be called when authentification is done and successful
        @param  errorCallback   (function)  to be called when authentification is done and with errors
        @return --
        @return ASYNC Array(obj) = [{
            path                (string)    full path of an element
            versionId           (string)    version id
        }]
        */
        "getVersions",


        /**
        Restore a previous version (ASYNCHRONOUS)
        @param obj = {
            path                (string)    the path (incl. filename) to the element to be restored
            versionId           (string)    version id of the element to be restored
            }
        @param  successCallback (function)  to be called when restore is done and successful
        @param  errorCallback   (function)  to be called when restore is done and with errors
        @return --
        */
        "restoreVersion",


        /**
        Share an element (ASYNCHRONOUS)
        @param obj = {
            path                (string)    the path (incl. filename) to the element to be shared
            permissionRead      (boolean)   share with read permissions
            permissionWrite     (boolean)   share with write permissions
            permissionCreate    (boolean)   share with create permissions
            permissionDelete    (boolean)   share with delete permissions
            permissionReshare   (boolean)   share with reshare permissions
            shareWith           (string)    the user or group to share with
            shareToUser         (boolean)   is the share target a user (=true) or group (=false)
            isDir               (boolean)   is the shared item a directory
            }
        @param  successCallback (function)  to be called when sharing is done and successful
        @param  errorCallback   (function)  to be called when sharing is done and with errors
        @return --
        */
        "shareObject",


        /**
        Get a share link (ASYNCHRONOUS)
        @param obj = {
            path                (string)    the path (incl. filename) to the element to be shared
            isDir               (boolean)   is the shared item a directory
            }
        @param  successCallback (function)  to be called when retrieving the link is done and successful
        @param  errorCallback   (function)  to be called when retrieving the link is done and with errors
        @return --
        */
        "getShareLink",


        /**
        Remove a sharing permission of an element (ASYNCHRONOUS)
        @param obj = {
            path                (string)    the path (incl. filename) to the element to be shared
            shareWith           (string)    the user to share with
            shareToUser         (boolean)   is the share target a user (=true) or group (=false)
            isDir               (boolean)   is the shared item a directory
            }
        @param  successCallback (function)  to be called when sharing is done and successful
        @param  errorCallback   (function)  to be called when sharing is done and with errors
        @return --
        */
        "unshareObject",


        /**
        Get the properties of a shared item (ASYNCHRONOUS)
        @param obj = {
            path                (string)    the path (incl. filename) to the element to be shared
            isDir               (boolean)   is the shared item a directory
            }
        @param  successCallback (function)  to be called when sharing is done and successful
        @param  errorCallback   (function)  to be called when sharing is done and with errors
        @return --
        @return ASYNC obj = [{
            permissionRead      (boolean)   shared with read permissions
            permissionWrite     (boolean)   shared with write permissions
            permissionCreate    (boolean)   shared with create permissions
            permissionDelete    (boolean)   shared with delete permissions
            permissionReshare   (boolean)   shared with reshare permissions
            shareWith           (string)    the user or group the object is shared with
            label               (string)    the label for a user or group like "admin (group)"
            shareType           (integer)   is the share target a user (0), group (1) or public link (3)
            }]
        */
        "getShareStatus",


        /**
        Get an autocomplete list of possible share targets (users or groups) (ASYNCHRONOUS)
        @param obj = {
            key                 (string)    the key of a user or group to search
            }
        @param  callback        (function)  the callback to use if an element was fetched
        @return --
        @return ASYNC obj = [{
            shareTargets        [{
                label           (string)    the label for a user or group like "admin (group)"
                shareWith       (string)    the user or group the object is shared with
                shareToUser     (boolean)   is the share target a user (=true) or group (=false)
                }]
            }]
        */
        "getShareAutocomplete",


        /**
        Get the content of files
        @param obj = {
            path                (string)    the path of the file
            }
        @param  successCallback (function)  to be called when sharing is done and successful
        @param  errorCallback   (function)  to be called when sharing is done and with errors
        @return --
        @return ASYNC obj = {
            content             (string)    the text of the object
        */
        "getFileeeContent",


        /**
        Send a file to fileee for analysis
        Only images (png, jpg, jpeg, gif, bmp) are allowed
        @param obj = {
            path                (string)    the path of the file
            isDir               (boolean)   is the path a directory
            }
        @param  successCallback (function)  to be called when sharing is done and successful
        @param  errorCallback   (function)  to be called when sharing is done and with errors
        @return --
        */
        "fileeeAnalyse",
    ]);

