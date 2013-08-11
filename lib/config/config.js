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
//Konfigurationsdaten (Frontend-unabhängig!)
var appconfig = {
    // Standardsprache festlegen
    "standardLanguage": "en-us",

    // Vorkonfigurierte Serveradressen (über "name" identifiziert)
    "servers": {
        "dummy-oc": {
            "type": "owncloud",
            "name": "dummy-oc",
            "host": "http://path/to/owncloud",
            "relativePath": "/files/webdav.php",
            "port": "80",
            "title": "Dummy ownCloud server",
            "description": "Dummy ownCloud server",
            "iconPath": "images/homeListIcons/uni_muenster.jpg",
            "langKey": "SERVEROWNCLOUD",
            "langKeyDesc": "SERVERDESCRIPTIONOWNCLOUD",
            "order": 0
        },

        "dummy-sp": { // Sharepoint
            "type": "sharepoint",
            "name": "dummy-sp",
            "host": "https://o365instance.sharepoint.com",
            "relativePath": "/DokumenteApp",
            "port": "",
            "title": "Dummy Sharepoint server",
            "description": "Dummy Sharepoint server",,
            "iconPath": "images/homeListIcons/muenster_bnw.jpg",
            "langKey": "SERVERSHAREPOINT",
            "langKeyDesc": "SERVERDESCRIPTIONSHAREPOINT",
            "order": 1
        },
    },

    // Debug-Modus
    "debug": true,

    // Style der Icons: "white" oder "black"
    "theme": "green",

    // Dateitypen
    "fileTypesThemeRoot": "images/fileIcons/",
    "fileTypes": {
        "folder": {
            "icon": "folder.svg"
        },
        ".pdf": {
            "icon": "pdf.svg",
            "previewType": "reader",
        },
        ".xps": {
            "icon": "xps.svg",
        },
        ".oxps": {
            "icon": "oxps.svg",
        },
        ".cbz": {
            "icon": "pdf.svg",
            "previewType": "reader",
        },
        ".ppt": {
            "icon": "ppt.svg"
        },
        ".pptx": {
            "icon": "pptx.svg"
        },
        ".keynote": {
            "icon": "ppt.svg"
        },
        ".png": {
            "icon": "image.svg",
            "previewType": "image",
            "hasFileeeSupport": true
        },
        ".jpeg": {
            "icon": "image.svg",
            "previewType": "image",
            "hasFileeeSupport": true
        },
        ".jpg": {
            "icon": "image.svg",
            "previewType": "image",
            "hasFileeeSupport": true
        },
        ".gif": {
            "icon": "gif.svg",
            "previewType": "image",
            "hasFileeeSupport": true
        },
        ".bmp": {
            "icon": "image.svg",
            "previewType": "image",
            "hasFileeeSupport": true
        },
        ".txt": {
            "icon": "txt.svg",
            "previewType": "code",
        },
        ".log": {
            "icon": "log.svg",
            "previewType": "code",
        },
        ".svg": {
            "icon": "image.svg",
        },
        ".psd": {
            "icon": "image.svg"
        },
        ".xlsx": {
            "icon": "xlsx.svg"
        },
        ".xls": {
            "icon": "xls.svg"
        },
        ".doc": {
            "icon": "docx.svg"
        },
        ".docx": {
            "icon": "docx.svg",
            "previewType": "word",
        },
        ".vsd": {
            "icon": "visio.svg"
        },
        ".mp3": {
            "icon": "music.svg",
            "previewType": "audio",
        },
        ".m4a": {
            "icon": "music.svg"
        },
        ".wma": {
            "icon": "music.svg"
        },
        ".rar": {
            "icon": "compressed_2.svg"
        },
        ".zip": {
            "icon": "compressed_2.svg"
        },
        ".7z": {
            "icon": "compressed_2.svg"
        },
        ".gz": {
            "icon": "compressed_2.svg"
        },
        ".tar": {
            "icon": "compressed_2.svg"
        },
        ".java": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-java",
        },
        ".c": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-csrc",
        },
        ".cpp": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-c++src",
        },
        ".c#": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-csharp",
        },
        ".css": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/css",
        },
        ".diff": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-diff",
        },
        ".gitattributes": {
            "icon": "code.svg",
            "previewType": "code",
        },
        ".gitignore": {
            "icon": "code.svg",
            "previewType": "code",
        },
        ".hs": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-haskell",
        },
        ".html": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/html",
        },
        ".js": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/javascript",
        },
        ".lua": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-lua",
        },
        ".p": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-pascal",
        },
        ".perl": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-perl",
        },
        ".php": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-php",
        },
        ".py": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-python",
        },
        ".r": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-rsrc",
        },
        ".rb": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-ruby",
        },
        ".s": { 
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-scheme",
        },
        ".sql": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-sql",
        },
        ".stex": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-stex",
        },
        ".tex": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-stex",
        },
        ".vb": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/x-vb",
        },
        ".vba": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/vbscript",
        },
        ".vbe": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/vbscript",
        },
        ".vbs": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "text/vbscript",
        },
        ".xml": {
            "icon": "code.svg",
            "previewType": "code",
            "codeType": "application/xml",
        },
        ".mp4": {
            "icon": "video.svg",
            "previewType": "video",
        },
        ".wmv": {
            "icon": "video.svg",
            "previewType": "video",
        },
        ".m4v": {
            "icon": "video.svg",
            "previewType": "video",
        },
        ".webm": {
            "icon": "video.svg",
            "previewType": "video",
        },
        ".mpeg": {
            "icon": "video.svg",
        },
        ".ogg": {
            "icon": "video.svg",
        },
        ".mov": {
            "icon": "video.svg",
        },
        ".flv": {
            "icon": "video.svg",
        },
        ".mkv": {
            "icon": "video.svg",
        },
        ".avi": {
            "icon": "video.svg",
        },
        ".eml": {
            "icon": "mail.svg"
        },
        ".msg": {
            "icon": "mail.svg"
        },
        ".benni": {
            "icon": "benni.jpg"
        },
        ".benjamin": { // :P
            "icon": "benni.jpg"
        },
        ".barann": { // :P
            "icon": "benni.jpg"
        },
        ".christoph": {
            "icon": "christoph.jpg"
        },
        ".simon": {
            "icon": "simon.jpg"
        },
        ".jannik": {
            "icon": "jannik.jpg"
        },
        ".patrick": {
            "icon": "patrick.jpg"
        },
        ".arne": {
            "icon": "arne.jpg"
        },
        ".david": {
            "icon": "david.jpg"
        },
        ".tassilo": {
            "icon": "tassilo.jpg"
        },
        " ": {
            "icon": "unknown.svg"
        },
        "": {
        },
    },

    // Tastaturbedienung (für alle Aktionen, die nativ nicht gegeben sind)
    "keyboardContexts": {
        // Spezielle Tastaturbefehle, die ÜBERALL möglich sind (kann nicht abgeschaltet werden)
        // Sehr vorsichtig nur verwenden, z.B. für Flyouts
        "superglobal":
            [{
                "key": "H",
                "altKey": true,
                "action": "showHelpSettings",
                "type": "superglobal",
                "descriptionKey": "HELP",
                "addClickhandler": true,
                "clickhandlerElement": "#helpButton"
            }],
        // Spezielle Tastaturbefehle, die global gelten, aber in einzelnen Kontexten wie Dialogen
        // deaktiviert werden können. Empfohlen für allgemein verfügbare Funktionen (z.B. Navigationsbar)
        "global":
            [
            /*{
                "key": "2",
                "action": "account",
                "type": "global",
                "altKey": true,
                "descriptionKey": "ACCOUNT",
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonAccount"
            },
            {
                "key": "3",
                "action": "logout",
                "type": "global",
                "altKey": true,
                "descriptionKey": "LOGOUT",
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonLogout"
            },*/
            ],

        // alle normalen Kontexte sind hier als Array von Tastaturaktionen definiert, z.B. "login",...
        // zu beachten: Bennis neue implementierung mit mehreren Kontexten, in denen die seite geladen ist
        // außerdem sind wechselnde appbar-zustände jeweils neue kontexte (sonst wird die funktion trotz ausblendung ausgeführt)
        /*{ // Beispiel eines Befehls mit allen möglichen parametern, siehe zur Erklärung auch frontendInterface
                "key": "B",
                "action": "irgendwas",
                "type": "normal",
                "ctrlKey": true,
                "altKey": false,
                "shiftKey": true,
                "mode": "keydown",
                "descriptionKey": "SOMETHING",
                "target": "#textfield",
                "delegate": ".subelements",
                "addClickhandler": true,
                "clickhandlerElement": "#buttonid"
            } */
        "login":
            [{
                "key": "Enter",
                "action": "doLogin",
                "descriptionKey": "LOGIN",
                "addClickhandler": true,
                "clickhandlerElement": "#loginButton"
            }],
        "directoryStart":
            [{
                "key": "1",
                "action": "home",
                "altKey": true,
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonHome",
                "descriptionKey": "HOME"
            },
            {
                "key": "2",
                "action": "account",
                "altKey": true,
                "descriptionKey": "ACCOUNT",
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonAccount"
            },
            {
                "key": "3",
                "action": "logout",
                "altKey": true,
                "descriptionKey": "LOGOUT",
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonLogout"
            },
            {
                "key": "Back",
                "action": "navigateBack",
                "descriptionKey": "BACK",
                "addClickhandler": true,
                "clickhandlerElement": "#backButton",
                "descriptionKey": "HELPBACK"
            },
            {
                "key": "Back",
                "shiftKey": true,
                "action": "navigateForward",
                "descriptionKey": "FORWARD",
                "addClickhandler": true,
                "clickhandlerElement": "#forwardButton",
                "descriptionKey": "HELPFORWARD"
            },
            //KEINE AUSWAHL
            {
                "key": "Esc",
                "ctrlKey": false,
                "action": "clearSelection",
                "addClickhandler": true,
                "clickhandlerElement": "#clearSelectionButton",
                "descriptionKey": "CLEARSELECTION"
            },
            {
                "key": "E",
                "ctrlKey": true,
                "action": "refresh",
                "addClickhandler": true,
                "clickhandlerElement": "#syncButton",
                "descriptionKey": "REFRESH"
            },
            {
                "key": "N",
                "ctrlKey": true,
                "action": "sortByName",
                "addClickhandler": true,
                "clickhandlerElement": "#sortByName",
                "descriptionKey": "SORTBYNAME"
            },
            {
                "key": "S",
                "ctrlKey": true,
                "action": "sortBySizeDesc",
                "addClickhandler": true,
                "clickhandlerElement": "#sortBySize",
                "descriptionKey": "SORTBYSIZE"
            },
            {
                "key": "U",
                "ctrlKey": true,
                "action": "displayDeleted",
                "addClickhandler": true,
                "clickhandlerElement": "#showDeletedButton",
                "descriptionKey": "SHOWDELETED"
            },

         


            {
                "key": "Entf",
                "ctrlKey": true,
                "action": "restoreFile",
                "addClickhandler": true,
                "clickhandlerElement": "#restoreFileButton",
                "descriptionKey": "HELPRESTOREFILE"
            },
            {
                "key": "H",
                "ctrlKey": true,
                "action": "showHistory",
                "addClickhandler": true,
                "clickhandlerElement": "#historyButton",
                "descriptionKey": "HISTORY"
            },
            {
                "key": "C",
                "altKey": true,
                "action": "cameraUpload",
                "addClickhandler": true,
                "clickhandlerElement": "#cameraButton",
                "descriptionKey": "TAKEPHOTOORVIDEO"
            },
            {
                "key": "U",
                "altKey": true,
                "action": "upload",
                "addClickhandler": true,
                "clickhandlerElement": "#uploadButton",
                "descriptionKey": "UPLOAD"
            },
            {
                "key": "F",
                "ctrlKey": true,
                "action": "createFolder",
                "descriptionKey": "CREATEFOLDER"
            },
            //IMMER BEI AUSWAHL
            {
                "key": "Entf",
                "action": "deleteFileButtonEvent",
                "descriptionKey": "DELETE"
            },
            {
                "key": "M",
                "ctrlKey": true,
                "action": "moveObject",
                "addClickhandler": true,
                "clickhandlerElement": "#moveFileButton",
                "descriptionKey": "MOVE"
            },
            //1 AUSGEWÄHLTES ELEMENT
            {
                "key": "O",
                "ctrlKey": true,
                "action": "openFile",
                "addClickhandler": true,
                "clickhandlerElement": "#openButton",
                "descriptionKey": "OPEN"
            },
            {
                "key": "D",
                "ctrlKey": true,
                "action": "download",
                "addClickhandler": true,
                "clickhandlerElement": "#downloadButton",
                "descriptionKey": "DOWNLOAD"
            },
            {
                "key": "R",
                "ctrlKey": true,
                "action": "rename",
                "descriptionKey": "RENAME"
            },
            //1 "DATEI" AUSGEWÄHLT
            {
                "key": "S",
                "altKey": true,
                "action": "share",
                "addClickhandler": true,
                "clickhandlerElement": "#shareButtonAppbar",
                "descriptionKey": "SHARE"
            },
            {
                "key": "I",
                "altKey": true,
                "action": "showFileInfo",
                "descriptionKey": "FILEINFO"
            },
            {
                "key": "F",
                "altKey": true,
                "action": "ocr",
                "addClickhandler": true,
                "clickhandlerElement": "#ocrButton",
                "descriptionKey": "OCR"
            },
                //SelectAll? Strg+A
                //...
            ],
        "directoryRename":
            [{
                "key": "Enter",
                "action": "renameConfirm",
                "addClickhandler": true,
                "clickhandlerElement": "#renameButton",
                "descriptionKey": "CONFIRMRENAME"
            }],
        "directoryDelete":
            [/*{ //Nicht nötig, da einziger Button im Flyout bereits durch Enter ausgelöst werden kann --> addEventListener dafür nötig
                "key": "Enter",
                "action": "deleteConfirm",
                "addClickhandler": true,
                "clickhandlerElement": "#confirmDeleteButton",
                "descriptionKey": "CONFIRMDELETEBUTTON"
            }*/],
        "directoryCreateFolder":
            [{ //Nicht nötig, da einziger Button im Flyout bereits durch Enter ausgelöst werden kann --> addEventListener dafür nötig
                "key": "Enter",
                "action": "folderCreateConfirm",
                "addClickhandler": true,
                "clickhandlerElement": "#createFolder",
                "descriptionKey": "CREATEFOLDER"
            }],
        "fileMover":
            [{
                "key": "1",
                "action": "home",
                "altKey": true,
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonHome",
                "descriptionKey": "HOME"
            },
            {
                "key": "Back",
                "action": "navigateBack",
                "descriptionKey": "BACK",
                "addClickhandler": true,
                "clickhandlerElement": "#backButton",
                "descriptionKey": "HELPBACK"
            },
            {
                "key": "Back",
                "shiftKey": true,
                "action": "navigateForward",
                "descriptionKey": "FORWARD",
                "addClickhandler": true,
                "clickhandlerElement": "#forwardButton",
                "descriptionKey": "HELPFORWARD"
            },
            {
                "key": "V",
                "ctrlKey": true,
                "action": "paste",
                "addClickhandler": true,
                "clickhandlerElement": "#pasteFileButton",
                "descriptionKey": "PASTE"
            },
            {
                "key": "Esc",
                "action": "cancel",
                "addClickhandler": true,
                "clickhandlerElement": "#cancelButton",
                "descriptionKey": "CANCEL"
            }],
        "shareTarget":
            [{
                "key": "1",
                "action": "home",
                "altKey": true,
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonHome",
                "descriptionKey": "HOME"
            },
            {
                "key": "Back",
                "action": "navigateBack",
                "descriptionKey": "BACK",
                "addClickhandler": true,
                "clickhandlerElement": "#backButton",
                "descriptionKey": "HELPBACK"
            },
            {
                "key": "Back",
                "shiftKey": true,
                "action": "navigateForward",
                "descriptionKey": "FORWARD",
                "addClickhandler": true,
                "clickhandlerElement": "#forwardButton",
                "descriptionKey": "HELPFORWARD"
            },
            {
                "key": "U",
                "altKey": true,
                "action": "upload",
                "addClickhandler": true,
                "clickhandlerElement": "#uploadSharedButton",
                "descriptionKey": "UPLOAD"
            }],
        "savePicker":
            [{
                "key": "1",
                "action": "home",
                "altKey": true,
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonHome",
                "descriptionKey": "HOME"
            },
            {
                "key": "Back",
                "action": "navigateBack",
                "descriptionKey": "BACK",
                "addClickhandler": true,
                "clickhandlerElement": "#backButton",
                "descriptionKey": "HELPBACK"
            },
            {
                "key": "Back",
                "shiftKey": true,
                "action": "navigateForward",
                "descriptionKey": "FORWARD",
                "addClickhandler": true,
                "clickhandlerElement": "#forwardButton",
                "descriptionKey": "HELPFORWARD"
            }],
        "openPicker":
            [{
                "key": "1",
                "action": "home",
                "altKey": true,
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonHome",
                "descriptionKey": "HOME"
            },
            {
                "key": "Back",
                "action": "navigateBack",
                "descriptionKey": "BACK",
                "addClickhandler": true,
                "clickhandlerElement": "#backButton",
                "descriptionKey": "HELPBACK"
            },
            {
                "key": "Back",
                "shiftKey": true,
                "action": "navigateForward",
                "descriptionKey": "FORWARD",
                "addClickhandler": true,
                "clickhandlerElement": "#forwardButton",
                "descriptionKey": "HELPFORWARD"
            }],
        "pdf":
            [{
                "key": "1",
                "action": "home",
                "altKey": true,
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonHome",
                "descriptionKey": "HOME"
            },
            {
                "key": "2",
                "action": "account",
                "altKey": true,
                "descriptionKey": "ACCOUNT",
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonAccount"
            },
            {
                "key": "3",
                "action": "logout",
                "altKey": true,
                "descriptionKey": "LOGOUT",
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonLogout"
            },
            {
                "key": "Back",
                "action": "navigateBack",
                "descriptionKey": "BACK",
                "addClickhandler": true,
                "clickhandlerElement": "#backButton",
                "descriptionKey": "HELPBACK"
            },
            {
                "key": "Back",
                "shiftKey": true,
                "action": "navigateForward",
                "descriptionKey": "FORWARD",
                "addClickhandler": true,
                "clickhandlerElement": "#forwardButton",
                "descriptionKey": "HELPFORWARD"
            },
            //PDF spezifisch
            {
                "key": "ArrowRight",
                "action": "next",
                "descriptionKey": "PDFNEXT",
                "addClickhandler": true,
                "clickhandlerElement": "#pdfNextButton",
                "descriptionKey": "PDFNEXT"
            },
            {
                "key": "ArrowLeft",
                "action": "back",
                "descriptionKey": "PDFBACK",
                "addClickhandler": true,
                "clickhandlerElement": "#pdfBackButton",
                "descriptionKey": "PDFBACK"
            },
            {
                "key": "Plus",
                "key2": "PlusNum",
                "ctrlKey": true,
                "action": "zoomIn",
                "descriptionKey": "ZOOMIN",
                "addClickhandler": true,
                "clickhandlerElement": "#pdfZoomInButton",
                "descriptionKey": "ZOOMIN"
            },
            {
                "key": "Minus",
                "key2": "MinusNum",
                "ctrlKey": true,
                "action": "zoomOut",
                "descriptionKey": "ZOOMOUT",
                "addClickhandler": true,
                "clickhandlerElement": "#pdfZoomOutButton",
                "descriptionKey": "ZOOMOUT"
            },
            {
                "key": "Enter",
                "ctrlKey": true,
                "action": "pageBtn",
                "addClickhandler": true,
                "clickhandlerElement": "#pdfGoToPageButton",
                "descriptionKey": "GOTOPAGE"
            },
            //KEINE AUSWAHL
            {
                "key": "Esc",
                "ctrlKey": false,
                "action": "clearSelection",
                "addClickhandler": true,
                "clickhandlerElement": "#clearSelectionButton",
                "descriptionKey": "CLEARSELECTION"
            },
            {
                "key": "E",
                "ctrlKey": true,
                "action": "refresh",
                "addClickhandler": true,
                "clickhandlerElement": "#refreshButton",
                "descriptionKey": "REFRESH"
            },
            {
                "key": "N",
                "ctrlKey": true,
                "action": "sortByName",
                "addClickhandler": true,
                "clickhandlerElement": "#sortByName",
                "descriptionKey": "SORTBYNAME"
            },
            {
                "key": "S",
                "ctrlKey": true,
                "action": "sortBySizeDesc",
                "addClickhandler": true,
                "clickhandlerElement": "#sortBySize",
                "descriptionKey": "SORTBYSIZE"
            },
            {
                "key": "U",
                "ctrlKey": true,
                "action": "displayDeleted",
                "addClickhandler": true,
                "clickhandlerElement": "#showDeletedButton",
                "descriptionKey": "SHOWDELETED"
            },
            {
                "key": "Entf",
                "ctrlKey": true,
                "action": "restoreFile",
                "addClickhandler": true,
                "clickhandlerElement": "#restoreFileButton",
                "descriptionKey": "HELPRESTOREFILE"
            },
            {
                "key": "H",
                "ctrlKey": true,
                "action": "showHistory",
                "addClickhandler": true,
                "clickhandlerElement": "#historyButton",
                "descriptionKey": "HISTORY"
            },
            {
                "key": "C",
                "altKey": true,
                "action": "cameraUpload",
                "addClickhandler": true,
                "clickhandlerElement": "#cameraButton",
                "descriptionKey": "TAKEPHOTOORVIDEO"
            },
            {
                "key": "U",
                "altKey": true,
                "action": "upload",
                "addClickhandler": true,
                "clickhandlerElement": "#uploadButton",
                "descriptionKey": "UPLOAD"
            },
            {
                "key": "F",
                "ctrlKey": true,
                "action": "createFolder",
                "descriptionKey": "CREATEFOLDER"
            },
            //IMMER BEI AUSWAHL
            {
                "key": "Entf",
                "action": "deleteFileButtonEvent",
                "descriptionKey": "DELETE"
            },
            {
                "key": "M",
                "ctrlKey": true,
                "action": "moveObject",
                "addClickhandler": true,
                "clickhandlerElement": "#moveFileButton",
                "descriptionKey": "MOVE"
            },
            //1 AUSGEWÄHLTES ELEMENT
            {
                "key": "O",
                "ctrlKey": true,
                "action": "openFile",
                "addClickhandler": true,
                "clickhandlerElement": "#openButton",
                "descriptionKey": "OPEN"
            },
            {
                "key": "D",
                "ctrlKey": true,
                "action": "download",
                "addClickhandler": true,
                "clickhandlerElement": "#downloadButton",
                "descriptionKey": "DOWNLOAD"
            },
            {
                "key": "R",
                "ctrlKey": true,
                "action": "rename",
                "descriptionKey": "RENAME"
            },
            //1 "DATEI" AUSGEWÄHLT
            {
                "key": "S",
                "altKey": true,
                "action": "share",
                "addClickhandler": true,
                "clickhandlerElement": "#shareButtonAppbar",
                "descriptionKey": "SHARE"
            },
            {
                "key": "I",
                "altKey": true,
                "action": "showFileInfo",
                "descriptionKey": "FILEINFO"
            },
            {
                "key": "F",
                "altKey": true,
                "action": "ocr",
                "addClickhandler": true,
                "clickhandlerElement": "#ocrButton",
                "descriptionKey": "OCR"
            },],
        "pdfPageNum":
            [//PDF spezifisch
            {
                "key": "1",
                "action": "home",
                "altKey": true,
                "addClickhandler": true,
                "clickhandlerElement": "#navButtonHome",
                "descriptionKey": "HOME"
            },
            {
                "key": "ArrowRight",
                "ctrlKey": true,
                "action": "next",
                "descriptionKey": "PDFNEXT",
                "addClickhandler": true,
                "clickhandlerElement": "#pdfNextButton",
                "descriptionKey": "PDFNEXT"
            },
            {
                "key": "ArrowLeft",
                "ctrlKey": true,
                "action": "back",
                "descriptionKey": "PDFBACK",
                "addClickhandler": true,
                "clickhandlerElement": "#pdfBackButton",
                "descriptionKey": "PDFBACK"
            },
            {
                "key": "Plus",
                "ctrlKey": true,
                "action": "zoomIn",
                "descriptionKey": "ZOOMIN",
                "addClickhandler": true,
                "clickhandlerElement": "#pdfZoomInButton",
                "descriptionKey": "ZOOMIN"
            },
            {
                "key": "Minus",
                "ctrlKey": true,
                "action": "zoomOut",
                "descriptionKey": "ZOOMOUT",
                "addClickhandler": true,
                "clickhandlerElement": "#pdfZoomOutButton",
                "descriptionKey": "ZOOMOUT"
            },
            {
                "key": "Enter",
                "ctrlKey": true,
                "action": "pageBtn",
                "descriptionKey": "GOTOPAGE",
                "addClickhandler": true,
                "clickhandlerElement": "#pdfGoToPageButton",
                "descriptionKey": "GOTOPAGE"
            },
            //Bei einem ausgewählten Element
            {
                "key": "Entf",
                "action": "deleteFileButtonEvent",
                "descriptionKey": "DELETE"
            }, ],
        "directoryHistory":
            [{
                "key": "Enter",
                "ctrlKey": false,
                "action": "restore",
                "addClickhandler": true,
                "clickhandlerElement": "#restoreSelectedFile",
                "descriptionKey": "RESTOREBUTTON"
            }],
    }
};
