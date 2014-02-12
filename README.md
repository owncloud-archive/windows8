# Windows 8 App for ownCloud

## Content
1. Overview
2. Architecture
3. File structure
4. Design principles and hints


## 1. Overview
The windows app was originally developed by a Bachelor project seminar team at the University of Münster as a prototype for a cloud storage frontend and released as open-source. It is also available for download in the Windows Store named "Campus Cloud".
The initial concept used a flexible approach concerning backends and frontends which is reflected in the general architecture described below.


## 2. Architecture
The general architecture includes 3 layers:

1. The server component
2. A framework with interfaces to frontend and backend providing common functions (roughly a model component). It is written in JavaScript and part of the app package.
3. The frontend part of the app with device-specific functions and the view component.

As can be seen in the diagram, the original layout included multiple frontends and backends. Apart from the focus on ownCloud, Sharepoint (more precisely: Office 365 libraries) was supported as possible backend with a more limited scope of functions. Other frontends for mobile apps were developed as proof-of-concept, but are currently not continued (there are alternatives like the native ownCloud apps).

![windows8 app architecture overview](https://raw.github.com/owncloud/windows8/master/res/architecture_overview.png "Windows 8 app architecture overview")


The logic layer is responsible for validating inputs and passing the method calls down to the backend connectors. Apart from that, it contains some other modules:
* lib/js/translator.js: Multi-language support for the app
	* The language files in /lib/lang/ containing key-value pairs are used for translation.
	* The whole page can be translated the translateAll function. It will convert all HTML element values with the translated text when it contains a "lang" attribute referencing the translation key.
	* Additional functions for language-specific formatting of numbers and dates.
	* lib/js/keyboard.js: Functions for setting keyboard shortcuts and button click event targets
	* Individual keyboard actions can be grouped in keyboard contexts representing available actions in a certain context, e.g. only "Enter" and "Back" in modal dialogues.
* lib/js/helper.js: Helper functions, e.g. for path and file size conversions
* lib/config/config.js: Provides configuration parameters that are used by the logic layer

![windows8 app logic layer architecture](https://raw.github.com/owncloud/windows8/master/res/architecture_logic_layer.png "Windows 8 app logic layer architecture")


## 3. File structure
The repository contains a running Visual Studio 2012 project. Some notes about the file structure
* /css: General stylesheets
* /images: Self-explaining
* /js: General windows-specific functions, e.g. navigation, downloads, file handling
* /lib: The logic layer (platform-independent)
	* /config: Cofiguration
	* /js/interface: Interfaces and their implementations
	* /js/lang: Language files
	* /js/logic: Main logic
	* /js/plugins: JavaScript libraries like jQuery, pdfJS, codemirror
	* /unittests: QUnit test cases for logic and backend layer implementations
* /pages: The major app pages with specific html, css and js files
	* /directoryView: The main page containing the navigable directory
	* /home: The login page
* /settings: The app flyouts with specific html, css and js files


## 4. Design principles and hints
* Levels of abstraction: The logic layer was designed to use device-independent JavaScript functions. 
* Interfaces: As JavaScript does not provide interfaces as in other object-oriented languages, this behaviour was simulated. The definition of functions happens in frontendInterface.js (together with specification of use and parameters). Interfacs.js provides means to ensure the existence of these functions in the implementation (frontendProduction.js). The validation of parameters needs to be checked in the implementation manually (this applies similarly for backendInterface.js etc.).
* Callbacks: Most backend functions use callback functions success and error results of the operation to allow asynchronous method calls. In some cases, e.g. getDirectoryView() this might be extended to cascades of callbacks for pre- and post-processing of the server requests.
* Unit tests: QUnit is used for testing logic layer and backend connectors. Integration with Visual Studio is posisble using the [Chutzpah extension](http://visualstudiogallery.msdn.microsoft.com/f8741f04-bae4-4900-81c7-7c9bfb9ed1fe)
* Contexts: The main directoryView page is used in several contexts which may influence design, available actions and layout:
	* Normal context: Normal navigable file and folder view
	* FileMover context: Only folders to select a target when moving files
	* ShareTarget context: Side flyout appearing when sharing files from an other app to this app, with folder-only view to select target
	* FileSavePicker context: Fullscreen folder-only view to select a target folder when saving files from other apps to our app (using the save dialogue of the other app, not the charmbar sharing function)
	* FileOpenPicker context: Fullscreen folder and files view to select a file for opening it in another app (using the open dialogue of the other app)