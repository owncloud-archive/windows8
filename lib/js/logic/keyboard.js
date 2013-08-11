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
// Keyboard-Modul
// Kümmert sich um die Umsetzung der Keystroke-Events

var keyboard = {
    // Array of contexts
    context: [],
    contextMetadata: [],

    // Pointer to current context
    currentContext: false,

    // Array of global commands
    globalCommands: [],

    // Namespaces for keyboard listeners
    namespaces: {},

    /**
        Initialize the keyboard module. To be called once during general initialisation of the frontend

        @param --
        @return --
    */
    initKeyboard: function () {
        this.namespaces["superglobal"] = ".keySuperglobal";
        this.namespaces["global"] = ".keyGlobal";
        this.namespaces["normal"] = ".keyNormal";

        this.currentContext = -1;
    },


    /**
    Set a new context, meaning a set of keystroke events to a given situation.
    New pages or dialogues most probably require a new context. This function keeps a record of the 
    current state and cares about the correct setting and removing of listeners
        
    @param obj = {
        context     (string)    *optional* name of a context predefined in the config file;
                                    default (or when not found) will create empty context
        allowGlobal (boolean)   *optional* allow global listeners to stay active, default is "true"
        }
    @return         (boolean)   result of new context creation
    */
    setKeystrokeContext: function (obj) {
        //console.log("Set new keystroke context");

        // Context object
        var newContext = [];

        // Iterate through all previous keystroke elements
        for (var elem in this.context[this.currentContext]) {
            var contextElement = this.context[this.currentContext][elem];

            // Keep superglobal listeners
            if (contextElement.type === "superglobal") {
                //contextElement.key = this.getKeyFromCode(contextElement.key);
                newContext.push(contextElement);
            }

            // Keep global listeners if allowed
            else if (obj && obj.allowGlobal !== false && contextElement.type === "global") {
                //contextElement.key = this.getKeyFromCode(contextElement.key);
                newContext.push(contextElement);
            }

            // Add global listeners to the global list for next context (if currently not allowed)
            else if (obj && obj.allowGlobal === false && contextElement.type === "global") {
                //contextElement.key = this.getKeyFromCode(contextElement.key);
                this.globalCommands.push(contextElement);
            }
        }

        // Retrieve new keyboard context information from config if passed as parameter
        if (obj && obj.context && obj.actions && appconfig && appconfig.keyboardContexts && appconfig.keyboardContexts[obj.context]) {
            var configProfile = appconfig.keyboardContexts[obj.context];

            //Iterate through profile
            for (var i in configProfile) {
                var action = configProfile[i].action;
                configProfile[i].callback = obj.actions[action];

                // Add to list
                var element = this.prepareContextElement(configProfile[i]);
                if (element) {
                    newContext.push(element);
                }
            }
        }

        // Set optional field allowGlobal
        if (typeof obj.allowGlobal !== "boolean") {
            obj.allowGlobal = true;
        }

        // Forget future contexts
        this.context = this.context.slice(0, this.currentContext + 1);
        this.contextMetadata = this.contextMetadata.slice(0, this.currentContext + 1);

        console.log("new Context (" + newContext.length + "): " + JSON.stringify(newContext));

        // Set all listeners
        this.insertContext({ newContext: newContext, allowGlobal: obj.allowGlobal });
    },


    /**
    @param obj = {
        newContext          [(Object)]      Array of context elements of the context to set
        previousContextId   (integer)       *optional* the context id where to remove the listeners, default is current pointer
        targetContextId     (integer)       *optional* the target id where to insert, default is append to list
        allowGlobal         (boolean)       *optional* allow adding global listeners, default is true
    */
    insertContext: function (obj) {
        //console.log("Insert context");

        // Remove all listeners from old context
        if (typeof obj.previousContextId !== "undefined") {
            this.currentContext = obj.previousContextId;
        }
        this.removeAllListeners();

        // Append context or replace current position in context list with target elements
        if (typeof obj.targetContextId !== "undefined" && obj.targetContextId < this.context.length) {
            this.currentContext = obj.targetContextId;
            this.context[this.currentContext] = obj.newContext;
            this.contextMetadata[this.currentContext].allowGlobal = obj.allowGlobal;
        } else {
            this.currentContext = this.context.length;
            this.context.push(obj.newContext);
            this.contextMetadata.push({
                allowGlobal: obj.allowGlobal
            });
        }

        // Allow global listeners?
        var allowGlobal = true;
        // if either metadata for current context is set or allowGlobal was passed as parameter
        if (this.contextMetadata[this.currentContext] && typeof this.contextMetadata[this.currentContext].allowGlobal !== "undefined"){
            allowGlobal = this.contextMetadata[this.currentContext].allowGlobal;
        } else if (obj && typeof obj.allowGlobal !== "undefined") {
            allowGlobal = obj.allowGlobal;
        }

        // Set all listeners from new context
        this.restoreContext({ allowGlobal: allowGlobal });
    },


    /**
    Sets new listeners for all elements of the current(!) context
    @param obj {
        allowGlobal     (boolean)   *optional* add global listeners? default is true
    */
    restoreContext: function (obj) {
        // Add previously deactivated global listeners
        if (typeof obj.allowGlobal !== "undefined" && obj.allowGlobal !== false) {

            for (var j in this.globalCommands) {
                this.context[this.currentContext].push(this.globalCommands[j]);
            }
            this.globalCommands = [];
        }

        // Set listener bindings
        for (var elem in this.context[this.currentContext]) {
            var contextElement = this.context[this.currentContext][elem];
            this.bindKeystrokeEvent(contextElement);
        }
    },


    /**
    Set the relevant fields for the context element
    */
    prepareContextElement: function (obj) {
        if (!obj || !obj.key || !obj.callback) {
            return;
        }

        var newElem = {};

        // Set given or default values for parameters
        newElem.callback = obj.callback;
        newElem.descriptionKey = obj.descriptionKey;
        newElem.addClickhandler = obj.addClickhandler;
        newElem.clickhandlerElement = obj.clickhandlerElement;

        if (!obj.ctrlKey) {
            newElem.ctrlKey = false;
        } else {
            newElem.ctrlKey = obj.ctrlKey;
        }

        if (!obj.altKey) {
            newElem.altKey = false;
        } else {
            newElem.altKey = obj.altKey;
        }

        if (!obj.shiftKey) {
            newElem.shiftKey = false;
        } else {
            newElem.shiftKey = obj.shiftKey;
        }

        if (!obj.type || (obj.type !== "normal" && obj.type !== "global" && obj.type !== "superglobal")) {
            newElem.type = "normal";
        } else {
            newElem.type = obj.type;
        }

        if (!obj.mode || (obj.mode !== "keydown" && obj.mode !== "keyup" && obj.mode !== "keypress")) {
            newElem.mode = "keyup";
        } else {
            newElem.mode = obj.mode;
        }

        if (!obj.target || typeof obj.target !== "string") {
            newElem.target = document;
        } else {
            newElem.target = obj.target;
        }

        if (!obj.delegate) {
            newElem.delegate = null;
        } else {
            newElem.delegate = obj.delegate;
        }

        // Convert key to number
        switch (obj.key) {
            case "Enter":
                newElem.key = 13;
                break;
            case "Back":
                newElem.key = 8;
                break;
            case "Esc":
                newElem.key = 27;
                break;
            case "ArrowUp":
                newElem.key = 38;
                break;
            case "ArrowDown":
                newElem.key = 40;
                break;
            case "ArrowLeft":
                newElem.key = 37;
                break;
            case "ArrowRight":
                newElem.key = 39;
                break;
            case "Tab":
                newElem.key = 9;
                break;
            case "Entf":
                newElem.key = 46;
                break;
            case "Plus":
                newElem.key = 187;//43
                break;
            case "Minus":
                newElem.key = 189;//45
                break;
            default:
                newElem.key = obj.key.charCodeAt(0);
        }

        if (!obj.key2) {
            newElem.key2 = "";
        } else {
            switch (obj.key2) {
                case "PlusNum":
                    newElem.key2 = 107;
                    break;
                case "MinusNum":
                    newElem.key2 = 109;
                    break;
                default:
                    newElem.key2 = "";
            }
        }

       return newElem;  
    },

    /**
    Add an event listener to the specified keystroke event and a callback to react on key

    @param obj = {
        keyCode             (integer)   the keycode to press
        callback            (function)  function to be called on keystroke event
        ctrlKey             (boolean)   Ctrl-key pressed?
        altKey              (boolean)   Alt-key pressed?
        shiftKey            (boolean)   Shift-key pressed?
        type                (string)    validity of the listener, can be "normal" (valid in current context),
                                            "global" (valid in all contexts that allow global listener access),
                                            "superglobal" (always valid, no override possible, careful!)
        mode                (string)    when should the event be triggered, 
                                            "keydown", "keyup" (default) or "keypress"
        descriptionKey      (string)    translation key of the description, 
                                            does not show up in list if not specified
        target              (string)    jQuery selector of the element to react on keystroke, 
                                            e.g. "tagname", "#ID", ".class",... default is document
        delegate            (string)    selector for all elements which are children of target that will be 
                                            called on the event. Useful to avoid Handler-Spam and dynamically added elements
        addClickhandler     (boolean)   for convenience, a click-handler can automatically be appended
                                            try clickhandlerElement if it is set, otherwise delegate or target
        clickhandlerElement (string)    a jQuery element selector where to set the clickhandler
        }
    @return --
    */
    bindKeystrokeEvent: function (obj) {
        console.log("Add listener on: " + obj.target + " from context: " + this.namespaces[obj.type]);

        // Add keyboard listener
        $(obj.target).on(obj.mode + this.namespaces[obj.type], obj.delegate, this.reactOnEvent(obj));

        //console.log("Set Handler" + JSON.stringify(obj.mode + this.namespaces[obj.type]) + JSON.stringify(obj));

        if (obj.addClickhandler) {
            //console.log("Set Clickhandler");

            var newClickElem = jQuery.extend({}, obj);

            // Delete description key to skip the output
            newClickElem.descriptionKey = false;

            // Add click listener
            $(newClickElem.clickhandlerElement).on("click" + this.namespaces[newClickElem.type], newClickElem.delegate, newClickElem.callback);
        }
    },


    /**
    Add keystroke event to the current context

    @param obj = {
            key                 (char)      the key to press, can be any character or number or from the following list:
                                            "Enter", "Back", "Esc", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"
            callback            (function)  function to be called on keystroke event
            ctrlKey             (boolean)   *optional* Ctrl-key pressed?
            altKey              (boolean)   *optional* Alt-key pressed?
            shiftKey            (boolean)   *optional* Shift-key pressed?
            type                (string)    *optional* validity of the listener, can be "normal" (valid in current context),
                                                "global" (valid in all contexts that allow global listener access),
                                                "superglobal" (always valid, no override possible, careful!)
            mode                (string)    *optional* when should the event be triggered, 
                                                "keydown", "keyup" (default) or "keypress"
            descriptionKey      (string)    *optional* translation key of the description, 
                                                does not show up in list if not specified
            target              (string)    *optional* jQuery selector of the element to react on keystroke, 
                                                e.g. "tagname", "#ID", ".class",... default is document
            delegate            (string)    *optional* selector for all elements which are children of target that will be 
                                                called on the event. Useful to avoid Handler-Spam and dynamically added elements
            addClickhandler     (boolean)   *optional* for convenience, a click-handler can automatically be appended
                                                try clickhandlerElement if it is set, otherwise delegate or target
            clickhandlerElement (string)    *optional* a jQuery element selector where to set the clickhandler
            }
        @return --
        */
    addKeystrokeEvent: function(obj){
        var elem = this.prepareContextElement(obj);
        if (elem) {
            this.context[this.currentContext].push(elem);
            this.bindKeystrokeEvent(obj);
        }
    },


    /**
    Checks whether the keystrokes match the desired keys and fires the callback on success
    */
    reactOnEvent: function(obj){
        return function (e) {
            if ((e.keyCode === obj.key || e.keyCode === obj.key2) && e.ctrlKey === obj.ctrlKey && e.altKey === obj.altKey && e.shiftKey === obj.shiftKey) {
                console.log("Successful key-Event for: " + e.keyCode + " / " + String.fromCharCode(e.keyCode));
                obj.callback();
            }
        };
    },


    /**
    Remove all keyboard listeners of the current context
    */
    removeAllListeners: function () {
        //var test2 = jQuery._data(document.getElementById("renameButton"), "events");
        for (var elem in this.context[this.currentContext]) {
            var contextElement = this.context[this.currentContext][elem];

            this.removeListener(contextElement);
        }
    },


    /**
    Removes a single listener of the current context
    */
    removeListener: function (obj) {
        // Remove keyboard listener
        $(obj.target).off(obj.mode + this.namespaces[obj.type], obj.delegate);//, this.reactOnEvent(obj));

        //console.log("Remove Handler" + JSON.stringify(obj.mode + this.namespaces[obj.type]) + JSON.stringify(obj));

        if (obj.addClickhandler) {
            //console.log("Remove Clickhandler");

            var newClickElem = jQuery.extend({}, obj);

            // Delete description key to skip the output
            newClickElem.descriptionKey = false;

            // Remove click listener
            $(newClickElem.clickhandlerElement).off("click" + this.namespaces[newClickElem.type], newClickElem.delegate);//, newClickElem.callback);
        }
    },


    /**
     Returns a list of all currently active keyboard listeners and their actions, if they
     have a specified description.

     @param obj = {
         html        (boolean)   return list in html list format as string
                                 "<ul><li><span class="key">...</span><span class="description">...</span></li></ul>"
                                 default return value is array of objects
         }
     @return [obj] = [{
        key         (string)    keys that trigger action
        description (string)    translated description of the key
        }]
     */
    getKeystrokeList: function (obj) {
        var listElems = [];
        for (var e in this.context[this.currentContext]) {
            var elem = this.context[this.currentContext][e];

            // Skip adding to list if no description exists
            if (!elem.descriptionKey) {
                continue;
            }

            // Build string representation of the keys
            var key = "";
            if (elem.ctrlKey) {
                key += apptranslator.translate("CTRLKEY") + " + ";
            }
            if (elem.altKey) {
                key += apptranslator.translate("ALTKEY") + " + ";
            }
            if (elem.shiftKey) {
                key += apptranslator.translate("SHIFTKEY") + " + ";
            }

            switch (elem.key) {
                case 13:
                    key += apptranslator.translate("ENTERKEY");
                    break;
                case 8:
                    key += apptranslator.translate("BACKKEY");
                    break;
                case 27:
                    key += apptranslator.translate("ESCKEY");
                    break;
                case 38:
                    key += apptranslator.translate("ARROWUPKEY");
                    break;
                case 40:
                    key += apptranslator.translate("ARROWDOWNKEY");
                    break;
                case 37:
                    key += apptranslator.translate("ARROWLEFTKEY");
                    break;
                case 39:
                    key += apptranslator.translate("ARROWRIGHTKEY");
                    break;
                case 46:
                    key += apptranslator.translate("ENTFKEY");
                    break;
                case 9:
                    key += apptranslator.translate("TABKEY");
                    break;
                case 187: //43
                case 107:
                    key += apptranslator.translate("PLUSKEY");
                    break;
                case 189: //45
                case 109:
                    key += apptranslator.translate("MINUSKEY");
                    break;
                default:
                    key += String.fromCharCode(elem.key);
            }

            // Fill list
            listElems.push({
                key: key,
                description: apptranslator.translate(elem.descriptionKey),
                // Needed for sorting
                altKey: elem.altKey,
                ctrlKey: elem.ctrlKey,
                shiftKey: elem.shiftKey,
                origKey: elem.key
            });
        }

        // Sort list
        listElems = listElems.sort(apphelper.sortByKey);

        // Check return mode
        if (!obj || !obj.html) {
            // return Object-Array
            return listElems;
        } else {
            // Generate HTML string from element list
            var result = "<ul>";
            for (var i in listElems) {
                result += '<li><span class="key">' + listElems[i].key + '</span>'
                        + '<span class="description">' + listElems[i].description + '</span></li>';
            }
            result += "</ul>";

            return result;
        }
    },

    getKeyFromCode: function (code) {
        var key = "";
        switch (code) {
            case 13:
                key = "Enter";
                break;
            case 8:
                key = "Back";
                break;
            case 27:
                key = "Esc";
                break;
            case 38:
                key = "ArrowUp";
                break;
            case 40:
                key = "ArrowDown";
                break;
            case 37:
                key = "ArrowLeft";
                break;
            case 39:
                key = "ArrowRight";
                break;
            case 46:
                key = "Entf";
                break;
            case 9:
                key = "Tab";
                break;
            case 187: //43
                key = "Plus";
                break;
            case 107:
                key = "PlusNum";
                break;
            case 189://45
                key = "Minus";
                break;
            case 109:
                key = "MinusNum";
                break;
            default:
                key = String.fromCharCode(code);
        }
        return key;
    },

    /**
    Saves the current keystroke context and switches to the previous one.
    Use case: A modal dialogue creates a new context and the old one needs to be restored afterwards
    Creates empty set if there is no previous context.

    @param --
    @return --
*/
    getPreviousKeystrokeContext: function () {
        console.log("get previous context");

        // Check if previous context exists
        if (this.currentContext > 0) {
            this.removeAllListeners();
            // Call function to set all listeners for the newly specified context
            this.currentContext--;
            this.restoreContext({});
        }
    },


    /**
        Moves to the next saved keystroke context if possible
        
        @param --
        @return --
    */
    getNextKeystrokeContext: function () {
        // Check if next context exists
        if (this.currentContext < this.context.length - 1) {
            this.removeAllListeners();
            // Call function to set all listeners for the newly specified context
            this.currentContext++;
            this.restoreContext({});
        }
    }
}
