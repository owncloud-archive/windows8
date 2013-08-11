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
//Interface-Klasse
var Interface = function(name, methods) {
    this.name = name;
    this.methods = [];

    if (methods.constructor == Array)
        this.methods = methods;
    else if (methods.constructor == String)
        this.methods[0] = methods;
    else 
        throw new Error("Fehler: Interface enthält keine Methoden!");
};

var InterfaceHelper  = {
    ensureImplements : function(obj, interfaces) {
       // If interfaces is not an array, assume it's a function pointer
       var toImplement = interfaces.constructor == Array ? interfaces : [interfaces];
       var interface;

       // For every interface that obj must implement:
       for (var i = 0, len = toImplement.length; i < len; i++) {
          interface = toImplement[i];

          // Make sure it indeed is an interface
          if (interface.constructor != Interface)
             throw new Error("Fehler: Das Objekt " + interface.name + " ist kein Interface!");

          // Make sure obj has all of the methods described in the interface
          for (var j = 0, interfaceLen = interface.methods.length; j < interfaceLen; j++)
             if (!obj[interface.methods[j]])
                throw new Error("Fehler: Das zugrundeliegende Interface " 
                + interface.name + " erfordert eine Methode " + interface.methods[j]);
       }
       return true;
    }
};
