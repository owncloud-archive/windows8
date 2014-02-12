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
//Sinnvolle Hilfefunktionen, z.B. für Format-Umwandlung etc.
var apphelper = {
    /** 
    The Filesize is converted from bytes into other dimensions.
    Figures should be rounded according to the following scheme:
    - one digit after the comma should be returned only in case the main value is < 100, e.g. "56.7 MB"
    - two digits after the comma should be returned only in case the main value is < 10, e.g. "5.67 MB"
    - otherwise no decimals are needed, e.g. "567 KB"
    - "best" is the dimension where the main value is between 0 and 999, like 123 KB or 23,4 MB
    @param obj = {
        fileSize    (integer) filesize in bytes
    }
    @return obj = {
        bestNum         (integer)   filesize in best fitting numerical value (in byte, kb, mb or gb) 
                                    (best = where value between 0 and 999)
        bestText        (string)    filesize in best fitting value with text suffix, e.g. "234 KB"
                                    (best = where value between 0 and 999)
        bNum            (integer)   filesize in bytes
        bText           (integer)   filesize in bytes with text suffix, e.g. "123 Byte"
        kbNum           (integer)   filesize in kilobytes
        kbText          (integer)   filesize in kilobytes with text suffix, e.g. "123 KB"
        mbNum           (integer)   filesize in megabytes
        mbText          (integer)   filesize in megabytes with text suffix, e.g. "123 MB"
        gbNum           (integer)   filesize in gigabytes
        gbText          (integer)   filesize in gigabytes with text suffix, e.g. "123 GB"
    }
    */
    convertInAllFilesizes: function(obj){
        var result = {};

        if (typeof obj.fileSize === "undefined" || obj.fileSize === false) {
            result.bNum = 0;
            result.kbNum = 0;
            result.mbNum = 0;
            result.gbNum = 0;
            result.bestNum = 0;
            result.bText = "";
            result.kbText = "";
            result.mbText = "";
            result.gbText = "";
            result.bestText = "";
            return result;
        }

        // Zahlenwerte erzeugen
        result.bNum = obj.fileSize;

        result.kbNum = this.roundTotalThreeDigits(obj.fileSize / 1000);
        result.mbNum = this.roundTotalThreeDigits(obj.fileSize / 1000000);
        result.gbNum = this.roundTotalThreeDigits(obj.fileSize / 1000000000);

        // Textwerte setzen
        result.bText = apptranslator.formatNumber({ key: result.bNum }) + " " + apptranslator.translate("BYTESHORT");
        result.kbText = apptranslator.formatNumber({ key: result.kbNum }) + " " + apptranslator.translate("KBYTESHORT");
        result.mbText = apptranslator.formatNumber({ key: result.mbNum }) + " " + apptranslator.translate("MBYTESHORT");
        result.gbText = apptranslator.formatNumber({ key: result.gbNum }) + " " + apptranslator.translate("GBYTESHORT");

        // Best size, wenn Wert zwischen 0 und 999
        if (result.bNum < 1000) {
            result.bestNum = result.bNum;
            result.bestText = apptranslator.formatNumber({ key: result.bestNum }) + " " + apptranslator.translate("BYTESHORT");
        } else if (result.kbNum < 1000){
            result.bestNum = result.kbNum;
            result.bestText = apptranslator.formatNumber({ key: result.bestNum }) + " " + apptranslator.translate("KBYTESHORT");
        } else if (result.mbNum < 1000) {
            result.bestNum = result.mbNum;
            result.bestText = apptranslator.formatNumber({ key: result.bestNum }) + " " + apptranslator.translate("MBYTESHORT");
        } else {
            result.bestNum = result.gbNum;
            result.bestText = apptranslator.formatNumber({ key: result.bestNum }) + " " + apptranslator.translate("GBYTESHORT");
        }
        
        return result;
    },


    /** 
    Custom rounding:
    - one digit after the comma should be returned only in case the main value is < 100, e.g. "56.7 MB"
    - two digits after the comma should be returned only in case the main value is < 10, e.g. "5.67 MB"
    - otherwise no decimals are needed, e.g. "567 KB"
    @param value (number)   value to be converted
    */
    roundTotalThreeDigits: function (value) {
        if (value > 100) {
            // no digits
            return apphelper.roundDigits(value, 0);
        } else if (value > 10) {
            // one digit
            return apphelper.roundDigits(value, 1);
        } else {
            // two digits
            return apphelper.roundDigits(value, 2);
        }
    },


    /**
    Round number to specified amount of digits
    @param value    (number)    value to be converted
    @param digits   (integer)   amount of digits after comma
    */
    roundDigits: function (value, digits){
        if (typeof digits !== "undefined" && digits >= 0) {
            var factor = Math.pow(10, digits);
            return Math.round(value * factor) / factor;
        } else {
            return value;
        }
    },


    /**
    Extract name, type and directory of a file or directory
    @param obj = {
        path            (string)    path of a file or directory
        isDir           (boolean)   is the element a directory?
        }
    @return Array(obj) = [{
        path            (string)    full path of the element
        dirName         (string)    path of the element's parent folder with trailing "/"
        fileFullName    (string)    filename + filetype
        fileName        (string)    filename of the element
        fileType        (string)    filetype of the element, if it is a file
    */
    convertPath: function (obj) {
        var splitPath = obj.path.match('^(.*/)?(.*)');

        var filename = splitPath[2];
        var filetype = "";

        // Special treatment of files
        if (!obj.isDir) {

            // Test if file has a filetype
            if (splitPath[2].indexOf('.') > 0) {
                var splitFilename = splitPath[2].match('^(.+)[.](.+)');
                filename = splitFilename[1];
                filetype = "." + splitFilename[2];
            } else if (splitPath[2].indexOf('.') == 0) {
                var fileTypeIndex = splitPath[2].lastIndexOf('.')
                if (fileTypeIndex != 0) {
                    filename = splitPath[2].substring(0, fileTypeIndex);
                    filetype = splitPath[2].substring(fileTypeIndex, splitPath[2].length);
                } else {
                    filename = "";
                    filetype = splitPath[2];
                }
            }
        }

        // Root level
        var dirName = "";
        if (typeof splitPath[1] !== "undefined") {
            dirName = splitPath[1];
        }

        var result = {};

        result.dirName = dirName;
        result.fileName = filename;
        result.fileType = filetype;
        result.fileFullName = filename + filetype;

        return result;
    },

    sortByName: function (first, second) {
        // Folders first
        if (first.isDir && !second.isDir) {
            return -1;
        } else if (!first.isDir && second.isDir) {
            return 1;
        } else if (first.isDir && second.isDir) {
            // Sort folders alphabetically
            if (first.fileName.toLowerCase() == second.fileName.toLowerCase()) {
                return 0;
            }
            else if (first.fileName.toLowerCase() < second.fileName.toLowerCase()) {
                return -1;
            } else {
                return 1;
            }
        } else {
            // Sort files aphabetically 
            if (first.fileName.toLowerCase() == second.fileName.toLowerCase()) {
                return 0;
            }
            else if (first.fileName.toLowerCase() < second.fileName.toLowerCase()) {
                return -1;
            } else {
                return 1;
            }
        }
    },

    sortBySizeDesc: function (first, second) {
        // Folders first (have no size)
        if (first.isDir && !second.isDir) {
            return -1;
        } else if (!first.isDir && second.isDir) {
            return 1;
        } else if (first.isDir && second.isDir) {
            // Sort folders by name
            if (first.fileName.toLowerCase() == second.fileName.toLowerCase()) {
                return 0;
            }
            else if (first.fileName.toLowerCase() < second.fileName.toLowerCase()) {
                return -1;
            } else {
                return 1;
            }
        } else {
            // Sort files by size
            if (first.bNum == second.bNum) {
                return 0;
            }
            else if (first.bNum < second.bNum) {
                return 1;
            } else {
                return -1;
            }
        }
    },

    sortByKey: function (first, second) {
        /* Key weights
            alt     = 8
            ctrl    = 4
            shift   = 2
            andere  = 1 */
        var weightFirst = 0;
        if (first.altKey)       { weightFirst += 8; }
        if (first.ctrlKey)      { weightFirst += 4; }
        if (first.shiftKey)     { weightFirst += 2; }
        if (first.origKey)      { weightFirst += 1; }

        var weightSecond = 0;
        if (second.altKey)      { weightSecond += 8; }
        if (second.ctrlKey)     { weightSecond += 4; }
        if (second.shiftKey)    { weightSecond += 2; }
        if (second.origKey)     { weightSecond += 1; }

        if (weightFirst > weightSecond) {
            return -1;
        } else if (weightFirst < weightSecond) {
            return 1;
        } else {
            // Gleiche Zusatztasten, grobe Sortierung nach Zahl bzw. Buchstaben-Ascii-Wert
            if(Number(first.origKey) < Number(second.origKey)){
                return -1;
            } else {
                // Rest egal
                return 0;
            }
        }
    },

    sortByParam: function (param) {
        return function (firstObj, secondObj) {
            var first = firstObj[param];
            var second = secondObj[param];

            if (typeof firstObj[param] === "string") {
                first = firstObj[param].toLowerCase();
                second = secondObj[param].toLowerCase();
            }

            if (first < second) {
                return -1;
            } else if (first == second) {
                return 0;
            } else {
                return 1;
            }
        };
    },

    /**
    Strip double slashes from root directory and add trailing slash
    @param path             (string)    the path to convert
    @param params = obj {
        trailingSlash       (boolean)   finish path with slash (default true)
        prependSlash        (boolean)   start path with slash (default false)
        }
    @return                 (string)    the converted path
    */
    normalizePath: function (path, params) {
        // Set params
        if (!params) {
            var params = {};
        }
        if (typeof params.trailingSlash === "undefined") {
            params.trailingSlash = true;
        }
        if (typeof params.prependSlash === "undefined") {
            params.prependSlash = false;
        }

        if (path.substring(0, 2) === "//") {
            path = path.substring(1);
        }

        // Trailing Slash 
        if (params.trailingSlash && path.substring(path.length - 1) !== "/") {
            path = path + "/";
        } else if (!params.trailingSlash && path.substring(path.length - 1) === "/") {
            path = path.substring(0, path.length - 1);
        }

        // Start with Slash 
        if (params.prependSlash && path.substring(0, 1) !== "/") {
            path = "/" + path;
        } else if (!params.prependSlash && path.substring(0, 1) === "/") {
            path = path.substring(1);
        }

        return path;
    }
}
