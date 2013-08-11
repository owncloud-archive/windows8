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
//Objekt für spätere Sprachen
var lang = {};

//Translator-Modul
var apptranslator = {

    // Eigenschaften
    standardLanguage: undefined,
    customLanguage: undefined,

    setStandardLanguage: function (obj) {
        standardLanguage = obj.lang;
    },

    setCustomLanguage: function (obj) {
        customLanguage = obj.lang;
    },

    /**
    All elements of the current page which have a "lang"-Attribute are translated according to 
    the key of this attribute.
    Special treatment for 
        - input-Elements with placeholders
        - input-buttons like Submit-Buttons
        - button-Elements in the appbar (requires element with id "appbar" containing button element 
            containing element with class "win-label")
    */
    translateAll: function(){
        var elems = $("[lang]");
        var elemsLength = elems.length;

        while (elemsLength--) {
            var elemType = elems[elemsLength].tagName.toLowerCase();
            var elem = $(elems[elemsLength]);
            var langKey = elem.attr('lang').toUpperCase();

            // leere Felder überspringen
            if (langKey == 'undefined' || langKey === "") {
                continue;
            }

            if (elemType != 'HTML') {   
                // Spezialbehandlung für Placeholder
                if (elemType === 'input' && (elem.attr('type') === 'text' || elem.attr('type') === 'password')) {
                    elem.attr('placeholder', apptranslator.translate(langKey));

                // Spezialbehandlung App-Bar-Buttons
                } else if (elem.parent().is('#appbar') && elemType === 'button') {
                    $('#' + $(elem).attr('id') + ' > .win-label').html(apptranslator.translate(langKey));

                // Spezialbehandlung für Input-Buttons
                } else if (elemType == 'input' && (elem.attr('type') === 'button' || elem.attr('type') === 'submit')) {
                    elem.val(apptranslator.translate(langKey));

                // Normal den Text ersetzen
                } else {
                    elem.html(toStaticHTML(apptranslator.translate(langKey)));
                }
            }
        }
    },

    translate: function (key) {
        // Test, ob überhaupt eine Standardsprache geladen wurde
        if (typeof lang[standardLanguage] !== 'undefined') {
            
            // Rückgabe in bevorzugter Sprache
            if (typeof customLanguage !== 'undefined' &&
                typeof lang[customLanguage] !== 'undefined' &&
                typeof lang[customLanguage][key] !== 'undefined') {

                return lang[customLanguage][key];

            // Rückgabe in Standardsprache falls nicht vorhanden
            } else if (typeof lang[standardLanguage][key] !== 'undefined') {
                return lang[standardLanguage][key];

            // Das gewünschte Feld existiert nicht
            } else {
                return "no such field";
            }

        } else {
            return "no language specified";
        }
    },

    formatNumber: function (obj) {
        // Skip if delimiters are not defined
        if (!obj.key || Number(obj.key) == "NaN" || this.translate('NUMDECIMAL') == "no such field"
            || this.translate('NUMTHOUSAND') == "no such field") {
            return obj.key;
        }

        // Convert to number
        key = Number(obj.key);

        // Round number first if desired
        if (typeof obj.numDecimals !== "undefined" && obj.numDecimals >= 0) {
            var factor = Math.pow(10, obj.numDecimals);
            key = Math.round(key * factor) / factor;
        }

        // Set separators
        key += '';
        x = key.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? this.translate('NUMDECIMAL') + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + this.translate('NUMTHOUSAND') + '$2');
        }
        return x1 + x2;
    },

    /**
    Format a date object to a translated string

    @param  date    (date)  the date to be formatted
    */
    formatDate: function (date) {
        var daysInWeek = this.translate("daysInWeek");
        var shortMonthsInYear = this.translate("shortMonthsInYear");
        var longMonthsInYear = this.translate("longMonthsInYear");
        var prettyDateStrings = this.translate("prettyDateStrings");

        // Set locale strings
        jQuery.format.setLocale(daysInWeek, shortMonthsInYear, longMonthsInYear, prettyDateStrings);

        if (jQuery.format.prettyDate(date) == "more than 31 days") {
            return $.format.date(date, "dd/MM/yyyy HH:mm");
        } else {
            return jQuery.format.prettyDate(date);
        }
    }
}
