/// reference path="../../lib/js/plugins/qunit-1.12.0.js" />
/// <reference path="../../lib/config/config.js" />
/// <reference path="../../lib/js/logic/helper.js" />
/// <reference path="../../lib/js/logic/translator.js" />
/// <reference path="../../lib/js/logic/keyboard.js" />
/// <reference path="../../lib/js/lang/de-de.js" />
/// <reference path="../../lib/js/lang/en-us.js" />

/// <reference path="../../lib/js/interface/interface.js" />
/// <reference path="../../lib/js/interface/backendInterface.js" />
/// <reference path="../../lib/js/interface/backendDummy.js" />
/// <reference path="../../lib/js/interface/backendOwncloud.js" />
/// <reference path="../../lib/js/interface/backendSharepoint.js" />
/// <reference path="../../lib/js/interface/frontendInterface.js" />
/// <reference path="../../lib/js/interface/frontendDummy.js" />
/// <reference path="../../lib/js/interface/frontendProduction.js" />

/// <reference path="../../lib/js/plugins/jquery-2.0.0.js" />
/// <reference path="../../lib/js/plugins/webdav.js" />
/// <reference path="../../lib/js/plugins/base64.js" />
/// <reference path="../../lib/js/plugins/jquery.dateFormat-1.0.js" />
/// <reference path="../../lib/js/plugins/jquery.scrollTo-1.4.3.1.js" />

/// <reference path="unittest_prepare.js" />


// General implementation
test("Test frontend interface specification", function () {
    console.log("Test frontend interface specification");

    ok(InterfaceHelper.ensureImplements(cloud, Frontend), "Frontend interface implementation does not match specification");
});

// hasFunctionality
test("Test hasFunctionality", function () {
    console.log("Test frontend hasFunctionality");

    ok(cloud.hasFunctionality({ functionkey: "setBackend" }), "Frontend interface cannot set backend type");
});

// Set backend
test("Test setting backend manually", function () {
    console.log("Test frontend set backend manually");

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    ok(result, "Setting backend manually failed");
});

test("Test setting backend from config", function () {
    console.log("Test frontend set backend from config");

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    ok(result, "Setting backend from config failed");
});

test("Test setting wrong url", function () {
    console.log("Test frontend set wrong url");

    var result = cloud.setBackend({
        type: "owncloud",
        host: "www.abc.de",
        relativePath: "/fgh",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    ok(result, "Wrong url was accepted");
});

test("Test setting non-existing backend from config", function () {
    console.log("Test frontend set non-existing backend from config");

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc-nonexisting-server-instance",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    ok(!result, "Non-existing backend was set");
});

test("Test setting backend twice", function () {
    console.log("Test frontend set backend twice");

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    if (result) {
        result = cloud.setBackend({
            type: "owncloud",
            host: "https://pscloud.uni-muenster.de/owncloud",
            relativePath: "/files/webdav.php",
            downloadFunction: function () { },
            uploadFunction: function () { }
        });
    }

    ok(result, "Setting backend twice failed");
});

// doAuthentication
asyncTest("Test doAuthentication correct", function () {
    console.log("Test frontend doAuthentication correct");
    expect(1);

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () { start(); ok(true, ""); },
        function () { start(); ok(false, "doAuthentication failed"); });
});

asyncTest("Test doAuthentication incorrect", function () {
    console.log("Test frontend doAuthentication incorrect");
    expect(1);

    cloud.doAuthentication({ username: "kajchöoaisjdkajneeöolkjndkc", password: "sahdkjsahdkjsha" },
        function () { start(); ok(false, "doAuthentication accepted wrong user"); },
        function () { start(); ok(true, ""); });
});

asyncTest("Test doAuthentication empty user", function () {
    console.log("Test frontend doAuthentication empty user");
    expect(1);

    cloud.doAuthentication({ username: "", password: "sahdkjsahdkjsha" },
        function () { start(); ok(false, "doAuthentication accepted wrong user"); },
        function () { start(); ok(true, "doAuthentication failed"); });
});

asyncTest("Test doAuthentication empty password", function () {
    console.log("Test frontend doAuthentication empty password");
    expect(1);

    cloud.doAuthentication({ username: "kajchöoaisjdkajneeöolkjndkc", password: "" },
        function () { start(); ok(false, "doAuthentication accepted empty password"); },
        function () { start(); ok(true, "doAuthentication failed"); });
});

// doReAuthentication
asyncTest("Test doReAuthentication", function () {
    console.log("Test frontend doReAuthentication");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.doReAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
                function () { start(); ok(true, "doReAuthentication failed"); },
                function () { start(); ok(false, "doReAuthentication failed"); });
        },
        function () { start(); ok(false, "doReAuthentication failed at first authentication"); });
});


// isLoggedIn
asyncTest("Test isLoggedIn after correct login", function () {
    console.log("Test frontend isLoggedIn after correct login");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () { start(); ok(cloud.isLoggedIn(), "isLoggedIn false after login"); },
        function () { start(); ok(false, "isLoggedIn login failed"); });
});

// setLoggedIn
test("Test setLoggedIn normal", function () {
    console.log("Test frontend setLoggedIn normal");

    cloud.setLoggedIn({ "loginStatus": true });
    equal(cloud.isLoggedIn(), true, "Login status was not set correctly");
    cloud.setLoggedIn({ "loginStatus": false });
    equal(cloud.isLoggedIn(), false, "Login status was not set correctly");
});

test("Test setLoggedIn wrong parameters", function () {
    console.log("Test frontend setLoggedIn wrong parameters");

    cloud.setLoggedIn(); // no parameter
    equal(cloud.isLoggedIn(), false, "Login status output wrong using no parameter");
    cloud.setLoggedIn({ "login": false }); // wrong parameter
    equal(cloud.isLoggedIn(), false, "Login status output wrong using wrong parameter");
});

// getDirectoryContent
asyncTest("Test getDirectoryContent correct", function () {
    console.log("Test frontend getDirectoryContent correct");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.getDirectoryContent({
                "path": "/" // minimal parameters
            }, function (obj) {
                start();
                if (obj.length > 0) {
                    if (typeof obj[0].path !== "undefined" && typeof obj[0].dirName !== "undefined" && typeof obj[0].fileName !== "undefined"
                        && typeof obj[0].fileType !== "undefined" && typeof obj[0].isDir !== "undefined" && typeof obj[0].bestNum !== "undefined"
                        && typeof obj[0].bestText !== "undefined" && typeof obj[0].bNum !== "undefined" && typeof obj[0].bText !== "undefined"
                        && typeof obj[0].kbNum !== "undefined" && typeof obj[0].kbText !== "undefined" && typeof obj[0].mbNum !== "undefined"
                        && typeof obj[0].mbText !== "undefined" && typeof obj[0].gbNum !== "undefined" && typeof obj[0].gbText !== "undefined"
                        && typeof obj[0].deleted !== "undefined" && typeof obj[0].deletedId !== "undefined") {
                        ok(true, "");
                    } else {
                        ok(false, "Content is not complete: " + JSON.stringify(obj[0]));
                    }
                } else {
                    ok(false, "Directory has no elements");
                }
            }, function () {
                start(); ok(false, "GetDirectoryContent produces error");
            });
        },
        function () { start(); ok(false, "getDirectoryContent: doAuthentication failed"); });
});

asyncTest("Test getDirectoryContent correct extended", function () {
    console.log("Test frontend getDirectoryContent correct extended");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.getDirectoryContent({ // all parameters set
                "path": "/",
                "sortBy": "nameDesc",
                "deletedFiles": "both"
            }, function (obj) {
                start(); ok(obj.length > 0, "");
            }, function () {
                start(); ok(false, "GetDirectoryContent produces error");
            });
        },
        function () { start(); ok(false, "getDirectoryContent: doAuthentication failed"); });
});

asyncTest("Test getDirectoryContent no parameters", function () {
    console.log("Test frontend getDirectoryContent no parameters");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.getDirectoryContent(null, // no parameter
                function (obj) { start(); ok(false, "Response although parameter is missing"); },
                function () { start(); ok(true, "");
                });
        },
        function () { start(); ok(false, "getDirectoryContent: doAuthentication failed"); ok(false, "error"); });
});

asyncTest("Test getDirectoryContent no parameters 2", function () {
    console.log("Test frontend getDirectoryContent no parameters 2");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.getDirectoryContent({}, // wrong parameter content: nothing
                function (obj) { start(); ok(false, "Response although parameter is missing"); },
                function () { start(); ok(true, "");
                });
        },
        function () { start(); ok(false, "getDirectoryContent: doAuthentication failed"); ok(false, "error"); });
});

asyncTest("Test getDirectoryContent wrong parameters", function () {
    console.log("Test frontend getDirectoryContent wrong parameters");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.getDirectoryContent({
                "path": "nonroot/impossible/", // error
                "sortBy": "inexistent",
                "deletedFiles": "inexistent"
            }, function (obj) {
                start(); ok(obj.length == 0, "getDirectoryContent: There are objects in non-existing folder");
            }, function () {
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getDirectoryContent: doAuthentication failed"); });
});

// getRemainingSpace
asyncTest("Test getRemainingSpace", function () {
    console.log("Test frontend getRemainingSpace");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    if (!cloud.hasFunctionality({ "functionkey": "getRemainingSpace" })) {
        start(); ok(true, ""); // It's ok, if there is no plugin
        return;
    }

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.getRemainingSpace(function (obj) {
                start();
                if (obj) {
                    if (typeof obj.remainingBytes !== "undefined" && typeof obj.remainingBestNum !== "undefined" 
                        && typeof obj.remainingBestText !== "undefined" && typeof obj.usedBytes !== "undefined" 
                        && typeof obj.usedBestNum !== "undefined" && typeof obj.usedBestText !== "undefined" 
                        && typeof obj.totalBytes !== "undefined" && typeof obj.totalBestNum !== "undefined" 
                        && typeof obj.totalBestText !== "undefined" && typeof obj.usedPercentNum !== "undefined" 
                        && typeof obj.remainingPercentNum !== "undefined" && typeof obj.usedPercent !== "undefined" 
                        && typeof obj.remainingPercent !== "undefined" ) {
                        ok(true, "");
                    } else {
                        ok(false, "Content is not complete: " + JSON.stringify(obj));
                    }
                } else {
                    ok(false, "Nothing is returned");
                }
            }, function () {
                start(); ok(false, "");
            });
        },
        function () { start(); ok(false, "getDirectoryContent: doAuthentication failed"); });
});

// getSystemLanguage
test("Test getSystemLanguage", function () {
    console.log("Test frontend getSystemLanguage");

    var result = cloud.getSystemLanguage();
    if (result === false || typeof result.language === "undefined" || result.language.length == 0) {
        ok(false, "getSystemLanguage: There is no system language: " + result);
    } else {
        ok(true, "");
    }
});

// setCustomLanguage
test("Test setCustomLanguage", function () {
    console.log("Test frontend setCustomLanguage");

    var result = cloud.setCustomLanguage({ "customLanguage": "de-de" });
    ok(true, "");
});

// translate
test("Test translate function", function () {
    console.log("Test frontend translate");

    cloud.setCustomLanguage({ "customLanguage": "de-de" });
    var result = cloud.translate("GREETING");
    if (result !== "Hallo") {
        ok(false, "translate: Translation function produced wrong output:" + result);
    } else {
        ok(true, "");
    }
});

// translateAll
test("Test translateAll function", function () {
    console.log("Test frontend translateAll");

    cloud.setCustomLanguage({ "customLanguage": "de-de" });
    cloud.translateAll();
    ok(true, ""); // There is not more to check as it refers to untestable view
});

// formatNumber
test("Test formatNumber", function () {
    console.log("Test frontend formatNumber");

    cloud.setCustomLanguage({ "customLanguage": "de-de" }); // formatting depends on 
    var result = cloud.formatNumber({ "key": "1234.567" });
    equal("1.234,567", result, "#1 Simple formatting failed: " + result);

    result = cloud.formatNumber({ "key": "1234.567", "numDecimals": 0 });
    equal("1.235", result, "#2 Formatting without decimals failed: " + result);

    result = cloud.formatNumber({ "key": "1234.567", "numDecimals": 1 });
    equal("1.234,6", result, "#3 Formatting with one decimal failed: " + result);

    result = cloud.formatNumber({ "key": "1234.567", "numDecimals": 4 });
    equal("1.234,5670", result, "#4 Formatting with more decimals than exist failed: " + result);

    result = cloud.formatNumber({ "key": "1234.567", "numDecimals": -1 });
    equal("1.235", result, "#5 Formatting with impossible negative decimals failed: " + result);

    result = cloud.formatNumber({ "key": "1234.567.890", "numDecimals": 1 });
    equal("1234.567.890", result, "#6 Formatting invalid number failed: " + result);

    result = cloud.formatNumber({ "key": "1234,7567,890", "numDecimals": 1 });
    equal("1234,7567,890", result, "#7 Formatting invalid number failed: " + result);
});

// deleteObject - test only wrong inputs
asyncTest("Test deleteObject impossible path", function () {
    console.log("Test frontend deleteObject impossible path");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.deleteObject({ "path": "nonroot/impossible" }, function () {
                start();
                ok(false, "deleteObject accepted imposible path ");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "deleteObject failed at authentication"); });
});

asyncTest("Test deleteObject no path", function () {
    console.log("Test frontend deleteObject no path");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.deleteObject(null, function () {
                start();
                ok(false, "deleteObject accepted no path ");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "deleteObject failed at authentication"); });
});

asyncTest("Test deleteObject empty path", function () {
    console.log("Test frontend deleteObject empty path");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.deleteObject({ path: "" }, function () {
                start();
                ok(false, "deleteObject accepted empty path ");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "deleteObject failed at authentication"); });
});

// moveObject - test only wrong inputs
asyncTest("Test moveObject empty path", function () {
    console.log("Test frontend moveObject empty path");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.moveObject({ "srcPath": "", "targetPath": "", isDir: false }, function () {
                start();
                ok(false, "moveObject accepted empty path");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "moveObject failed at authentication"); });
});

asyncTest("Test moveObject impossible path", function () {
    console.log("Test frontend moveObject impossible path");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.moveObject({ "srcPath": "nonroot/impossible", "targetPath": "someOtherImpossible/path", isDir: false }, function () {
                start();
                ok(false, "moveObject accepted impossible path");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "moveObject failed at authentication"); });
});

asyncTest("Test moveObject identical path", function () {
    console.log("Test frontend moveObject identical path");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.moveObject({ "srcPath": "/someFolder/testfile.txt", "targetPath": "/someFolder/testfile.txt", isDir: false }, function () {
                start();
                ok(false, "moveObject accepted identical path");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "moveObject failed at authentication"); });
});

// renameObject
asyncTest("Test renameObject identical path", function () {
    console.log("Test frontend renameObject identical name");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.renameObject({ "srcPath": "/someFolder/testfile.txt", "targetName": "testfile.txt", isDir: false }, function () {
                start();
                ok(false, "renameObject accepted identical path");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "renameObject failed at authentication"); });
});

asyncTest("Test renameObject empty parameters", function () {
    console.log("Test frontend renameObject empty parameters");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.renameObject({ "srcPath": "", "targetName": "", isDir: false }, function () {
                start();
                ok(false, "renameObject accepted empty parameter");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "renameObject failed at authentication"); });
});

asyncTest("Test renameObject impossible path", function () {
    console.log("Test frontend renameObject impossible parameters");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.renameObject({ "srcPath": "nonroot/impossible", "targetName": "testfile.txt", isDir: false }, function () {
                start();
                ok(false, "renameObject accepted impossible parameter");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "renameObject failed at authentication"); });
});

// createFolder
asyncTest("Test createFolder no parameters", function () {
    console.log("Test frontend createFolder no parameters");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.createFolder({}, function () {
                start();
                ok(false, "createFolder accepted no parameter");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "createFolder failed at authentication"); });
});

asyncTest("Test createFolder empty path", function () {
    console.log("Test frontend createFolder empty parameters");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.createFolder({ "path": "", "folderName": "testfolder" }, function () {
                start();
                ok(false, "createFolder accepted empty parameter");
            }, function () { // error
                start();
                ok(true, "");
            });
        },
        function () { start(); ok(false, "createFolder failed at authentication"); });
});

asyncTest("Test createFolder and deleteObject combined", function () {
    console.log("Test frontend createFolder/deleteObject combined");
    expect(1);

    var result = cloud.setBackend({
        type: "config",
        host: "uni-muenster-oc",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloud.getDirectoryContent({
                "path": "/"
            }, function () {
                cloud.createFolder({ "path": "/", "folderName": "testfoldername" }, function () {
                    cloud.deleteObject({ "path": "/testfoldername" }, function () {
                        start();
                        ok(true, "");
                    }, function () {
                        start();
                        ok(false, "createFolder/deleteObject delete produced an error");
                    });
                }, function (e) { // error
                    start();
                    if (!e) { e = ""; }
                    ok(false, "createFolder/deleteObject create produced an error: " + e);
                });
            }, function () {
                start(); ok(false, "createFolder/deleteObject failed at getting directory content");
            });
        },
        function () { start(); ok(false, "createFolder/deleteObject failed at authentication"); });
});

// getFileIcon
test("Test frontend getFileIcon", function(){
    console.log("Test frontend getFileIcon");

    var result = cloud.getFileIcon({ "fileType": ".jpg" });
    equal("images/fileIcons/green/image.svg", result, "getFileIcon filetype jpg not found, instead: " + result);

    result = cloud.getFileIcon({ "fileType": " " }); // unknown filetype
    equal("images/fileIcons/green/unknown.svg", result, "getFileIcon icon for unknown filetype not found, instead: " + result);

    result = cloud.getFileIcon(); // no paramater
    equal("", result, "getFileIcon icon found for no parameter: " + result);
});

// keystrokeContexts
test("Test frontend keystrokeContexts", function () {
    console.log("Test frontend setKeystrokeContext");

    cloud.setKeystrokeContext();
    cloud.getPreviousKeystrokeContext();
    cloud.getNextKeystrokeContext();
    ok(true, "");
});

// addKeystrokeEvent
test("Test frontend custom keystroke actions", function () {
    console.log("Test frontend addKeystrokeEvent");

    cloud.addKeystrokeEvent("Enter", function () { });
    ok(true, "");
});

// Navigation list tests
test("Test frontend getNavigationListForward", function () {
    console.log("Test frontend getNavigationListForward");

    var list = cloud.getNavigationListForward();
    ok($.isArray(list) && list.length == 0, "getNavigationListForward is not empty");
});

test("Test frontend getNavigationListBack", function () {
    console.log("Test frontend getNavigationListBack");

    var list = cloud.getNavigationListBack(); // initial standard is "/"
    ok($.isArray(list) && list.length == 1, "getNavigationListBack is incorrect: "+ list[0]);
});

test("Test frontend setNavigationListBack", function () {
    console.log("Test frontend setNavigationListBack");

    cloud.setNavigationListBack({ "list": ["/", "/Test"] });
    var list = cloud.getNavigationListBack();
    ok($.isArray(list) && list.length == 2, "setNavigationListBack is not empty");
});

test("Test frontend setNavigationListBack no parameter", function () {
    console.log("Test frontend setNavigationListBack");

    cloud.setNavigationListBack({ "list": ["/", "/Test"] });
    cloud.setNavigationListBack({}); // wrong input
    var list = cloud.getNavigationListBack();
    ok($.isArray(list) && list.length == 2, "setNavigationListBack was changed although it should not");
});

test("Test frontend setNavigationListBack no parameter 2", function () {
    console.log("Test frontend setNavigationListBack");

    cloud.setNavigationListBack({ "list": ["/", "/Test"] });
    cloud.setNavigationListBack(); // wrong input
    var list = cloud.getNavigationListBack();
    ok($.isArray(list) && list.length == 2, "setNavigationListBack was changed although it should not");
});

test("Test frontend setNavigationListForward", function () {
    console.log("Test frontend setNavigationListForward");

    cloud.setNavigationListForward({ "list": ["/", "/Test"] });
    var list = cloud.getNavigationListBack();
    ok($.isArray(list) && list.length == 2, "setNavigationListForward is not empty");
});

test("Test frontend setNavigationListForward no parameter", function () {
    console.log("Test frontend setNavigationListForward");

    cloud.setNavigationListForward({ "list": ["/", "/Test"] });
    cloud.setNavigationListForward({}); // wrong input
    var list = cloud.getNavigationListForward();
    ok($.isArray(list) && list.length == 2, "setNavigationListBack was not changed although it should");

    cloud.setNavigationListForward({ "list": ["/", "/Test"] });
    cloud.setNavigationListForward(); // wrong input
    var list = cloud.getNavigationListForward();
    ok($.isArray(list) && list.length == 2, "setNavigationListForward was not changed although it should");
});

test("Test frontend resetNavigation", function () {
    console.log("Test frontend resetNavigation");

    cloud.setNavigationListBack({ "list": ["/", "/Test"] });
    cloud.setNavigationListForward({ "list": ["/", "/Test"] });
    cloud.resetNavigation();
    var list = cloud.getNavigationListBack();
    ok($.isArray(list) && list.length == 1, "setNavigationListBack was not changed although it should");
    list = cloud.getNavigationListForward();
    ok($.isArray(list) && list.length == 0, "setNavigationListForward was not changed although it should");
});

test("Test frontend navigationGotoPath", function () {
    console.log("Test frontend navigationGotoPath");

    cloud.setNavigationListBack({ "list": ["/Back"] });
    cloud.setNavigationListForward({ "list": ["/Forward"] });
    cloud.navigationGotoPath({ "path": "/Test" });
    var list = cloud.getNavigationListBack();
    ok($.isArray(list) && list.length == 2, "navigationListBack was not changed correctly");
    list = cloud.getNavigationListForward();
    ok($.isArray(list) && list.length == 0, "navigationListForward was not changed correctly");
});

test("Test frontend navigationGotoPath no parameter", function () {
    console.log("Test frontend navigationGotoPath");

    cloud.setNavigationListBack({ "list": ["/Back"] });
    cloud.setNavigationListForward({ "list": ["/Forward"] });
    cloud.navigationGotoPath({ });
    var list = cloud.getNavigationListBack();
    ok($.isArray(list) && list.length == 1, "navigationListBack was not changed correctly");
    list = cloud.getNavigationListForward();
    ok($.isArray(list) && list.length == 1, "navigationListForward was not changed correctly");

    cloud.setNavigationListBack({ "list": ["/Back"] });
    cloud.setNavigationListForward({ "list": ["/Forward"] });
    cloud.navigationGotoPath();
    var list = cloud.getNavigationListBack();
    ok($.isArray(list) && list.length == 1, "navigationListBack was not changed correctly");
    list = cloud.getNavigationListForward();
    ok($.isArray(list) && list.length == 1, "navigationListForward was not changed correctly");
});

test("Test frontend getNavigationPathCurrent", function () {
    console.log("Test frontend getNavigationPathCurrent");

    cloud.setNavigationListBack({ "list": ["/", "/Test"] });
    var result = cloud.getNavigationPathCurrent();
    equal("/Test", result, "getNavigationPathCurrent #1 is not correct: "+ result);

    cloud.setNavigationListBack({ "list": [] });
    var result = cloud.getNavigationPathCurrent();
    equal("", result, "getNavigationPathCurrent #2 is not correct: " + result);
});

test("Test frontend getNavigationPathNext", function () {
    console.log("Test frontend getNavigationPathNext");

    cloud.setNavigationListForward({ "list": ["/", "/Test"] });
    var result = cloud.getNavigationPathNext();
    equal("/Test", result, "getNavigationPathNext is not correct: " + result);
});

test("Test frontend navigationHasPrevious", function () {
    console.log("Test frontend navigationHasPrevious");

    cloud.setNavigationListBack({ "list": ["/", "/Test"] });
    var result = cloud.navigationHasPrevious();
    equal(true, result, "navigationHasPrevious is not correct: " + result);

    cloud.resetNavigation();
    result = cloud.navigationHasPrevious();
    equal(false, result, "navigationHasPrevious is not correct: " + result);
});

test("Test frontend navigationHasNext", function () {
    console.log("Test frontend navigationHasNext");

    cloud.setNavigationListForward({ "list": ["/Test"] });
    var result = cloud.navigationHasNext();
    equal(true, result, "navigationHasNext #1 is not correct: " + result);

    cloud.resetNavigation();
    result = cloud.navigationHasNext();
    equal(false, result, "navigationHasNext #2 is not correct: " + result);
});

test("Test frontend navigationGotoPrevious", function () {
    console.log("Test frontend navigationGotoPrevious");

    cloud.setNavigationListBack({ "list": ["/", "/Test"] });
    cloud.navigationGotoPrevious();
    var result = cloud.getNavigationPathCurrent();
    equal("/", result, "navigationGotoPrevious #1 is not correct: " + result);
    result = cloud.getNavigationPathNext();
    equal("/Test", result, "navigationGotoPrevious #2 is not correct: " + result);

    cloud.resetNavigation();
    cloud.navigationGotoPrevious();
    result = cloud.getNavigationPathCurrent();
    equal("/", result, "navigationGotoPrevious #3 is not correct: " + result);
    cloud.navigationGotoPrevious(); // should change nothing
    result = cloud.getNavigationPathCurrent();
    equal("/", result, "navigationGotoPrevious #4 is not correct: " + result);
});

test("Test frontend navigationGotoNext", function () {
    console.log("Test frontend navigationGotoNext");

    cloud.setNavigationListBack({ "list": [] });
    cloud.setNavigationListForward({ "list": ["/", "/Test"] });

    var result = cloud.navigationGotoNext();
    equal("/Test", result, "navigationGotoNext #1 is not correct: " + result);
    result = cloud.getNavigationPathCurrent();
    equal("/Test", result, "navigationGotoNext #2 is not correct: " + result);

    result = cloud.navigationGotoNext();
    equal("/", result, "navigationGotoNext #3 is not correct: " + result);
    list = cloud.getNavigationPathCurrent();
    equal("/", result, "navigationGotoNext #4 is not correct: " + result);

    cloud.setNavigationListBack({ "list": ["/"] });
    result = cloud.navigationGotoNext();
    equal(false, result, "navigationGotoNext #5 is not correct: " + result);
    result = cloud.getNavigationPathCurrent();
    equal("/", result, "navigationGotoNext #6 is not correct: " + result);
});

// transfer manager tests
test("Test frontend addTransfer", function () {
    console.log("Test frontend addTransfer");

    var promise = { "cancel": function() {} };
    var result = cloud.addTransfer({ "promise": promise, "type": "preview" });
    equal(true, result, "addTransfer #1 is not correct: " + result);

    result = cloud.addTransfer({ "promise": promise, "type": "upload" });
    equal(true, result, "addTransfer #2 is not correct");

    result = cloud.addTransfer({ "promise": promise, "type": "download" });
    equal(true, result, "addTransfer #3 is not correct");

    var emptyPromise = {};
    result = cloud.addTransfer({ "promise": emptyPromise, "type": "upload" });
    equal(false, result, "addTransfer #4 is not correct");

    result = cloud.addTransfer({ "promise": promise, "type": "someunknownstring" });
    equal(false, result, "addTransfer #5 is not correct");

    result = cloud.addTransfer({ "promise": promise });
    equal(false, result, "addTransfer #6 is not correct");

    result = cloud.addTransfer({ });
    equal(false, result, "addTransfer #7 is not correct");

    result = cloud.addTransfer();
    equal(false, result, "addTransfer #8 is not correct");
});

asyncTest("Test frontend cancelTransfer correct 1", function () {
    console.log("Test frontend cancelTransfer correct 1");
    expect(1);

    var promise = {
        "cancel": function () {
            start(); ok(true, "");
        }
    };

    var result = cloud.addTransfer({ "promise": promise, "type": "preview" });
    if(!result){
        start(); ok(false, "cancelTransfer: adding transfer failed");
    }

    result = cloud.cancelTransfer({ "type": "preview" });
    if(!result){
        start();  ok(false, "cancelTransfer: canceling transfer failed");
    }
});

asyncTest("Test frontend cancelTransfer correct 2", function () {
    console.log("Test frontend cancelTransfer correct 2");
    expect(1);

    var promise = { "cancel": function() {
        start(); ok(true, "");
    } };

    var result = cloud.addTransfer({ "promise": promise, "type": "upload" });
    if(!result){
        start(); ok(false, "cancelTransfer: adding transfer failed");
    }

    result = cloud.cancelTransfer({ "type": "upload" });
    if(!result){
        start(); ok(false, "cancelTransfer: canceling transfer failed");
    }
});

asyncTest("Test frontend cancelTransfer correct 3", function () {
    console.log("Test frontend cancelTransfer correct 3");
    expect(1);

    cloud.transfers = [];

    var promise = {
        "cancel": function () {
            start(); ok(true, "");
        }
    };
    
    var result = cloud.addTransfer({ "promise": promise, "type": "download" });
    if(!result){
        start(); ok(false, "cancelTransfer: adding transfer failed");
    }
    
    result = cloud.cancelTransfer({ "type": "download" });
    if(!result){
        start(); ok(false, "cancelTransfer: canceling transfer failed");
    }
});

asyncTest("Test frontend cancelTransfer correct 4", function () {
    console.log("Test frontend cancelTransfer correct 4");
    expect(1);

    cloud.transfers = [];

    var promise = { cancel: function() {
        start(); ok(true, "");
    } };

    var promise2 = { cancel: function() { } };

    var result = cloud.addTransfer({ "promise": promise, "type": "preview" });
    if(!result){
        start(); ok(false, "cancelTransfer: adding transfer failed");
    }

    result = cloud.addTransfer({ "promise": promise2, "type": "upload" });
    if(!result){
        start(); ok(false, "cancelTransfer: adding transfer 2 failed");
    }

    result = cloud.cancelTransfer({ "type": "all" });
    if(!result){
        start(); ok(false, "cancelTransfer: canceling transfer failed");
    }
});

test("Test frontend cancelTransfer incorrect parameters", function () {
    console.log("Test frontend cancelTransfer incorrect parameters");

    result = cloud.cancelTransfer({ "type": "someunknownstring" });
    equal(false, result, "cancelTransfer #1 is not correct");

    result = cloud.cancelTransfer({ });
    equal(false, result, "cancelTransfer #2 is not correct");

    result = cloud.cancelTransfer();
    equal(false, result, "cancelTransfer #3 is not correct");
});

// getVersions
asyncTest("Test frontend getVersions correct", function () {
    console.log("Test frontend getVersions correct");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getFileHistory" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getVersions({
                "path": appconfig.demoaccount.demofilepath,
                "date": appconfig.demoaccount.demofiledate,
                "fileType": appconfig.demoaccount.demofiletype
            }, function (obj) {
                start();
                if ($.isArray(obj)) {
                    if (obj.length >= 2) {
                        if (typeof obj[0].path !== "undefined" && typeof obj[0].versionId !== "undefined" ||
                            typeof obj[0].title !== "undefined" && typeof obj[0].date !== "undefined" ||
                            typeof obj[0].picture !== "undefined") {
                            ok(true, "");
                        } else {
                            ok(false, "Content is not complete: " + JSON.stringify(obj[0]));
                        }
                    } else {
                        ok(false, "There is no prior version for an existing file. Minimum should be 2 (=current file + prior version)");
                    }
                } else {
                    ok(false, "getVersions returns no array");
                }
            }, function () {
                start(); ok(false, "getVersions produces error");
            });
        },
        function () { start(); ok(false, "getVersions: doAuthentication failed"); });
});

asyncTest("Test frontend getVersions non-existent file or folder", function () {
    console.log("Test frontend getVersions non-existent file");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getFileHistory" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getVersions({
                "path": "/veryunlikelyfilenamekjdskkudsfndmwnjfnweflwkndslkdsf.txt" // should return empty array
            }, function (obj) {
                start(); ok(false, "getVersions: Non-existing file is found");
            }, function () {
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getVersions: doAuthentication failed"); });
});

asyncTest("Test frontend getVersions impossible parameter", function () {
    console.log("Test frontend getVersions impossible parameter");
    expect(1);

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getFileHistory" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getVersions({
                "path": "nonroot/impossible"
            }, function (obj) {
                start(); ok(false, "getVersions: There is a version for an impossible element");
            }, function () {
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getVersions: doAuthentication failed"); });
});

// share tests
asyncTest("Test frontend getShareLink correct", function () {
    console.log("Test frontend getShareLink correct");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getShareLink" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getShareLink({
                "path": appconfig.demoaccount.demofilepath,
                "isDir": false
            }, function (obj) {
                start();
                if(obj && typeof obj.link !== "undefined" && obj.link != ""){
                    ok(true, "");
                } else {
                    ok(false, "Content is not complete: " + JSON.stringify(obj[0]));
                }
            }, function () {
                start(); ok(false, "getShareLink produces error");
            });
        },
        function () { start(); ok(false, "getShareLink: doAuthentication failed"); });
});

asyncTest("Test frontend getShareLink empty parameters", function () {
    console.log("Test frontend getShareLink empty parameters");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getShareLink" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getShareLink({
                "path": appconfig.demoaccount.demofilepath
            }, function (obj) {
                start(); ok(false, "getShareLink accepted no parameters");
            }, function () {
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getShareLink: doAuthentication failed"); });
});

asyncTest("Test frontend getShareLink empty parameters 2", function () {
    console.log("Test frontend getShareLink empty parameters 2");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getShareLink" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getShareLink({ }, function (obj) {
                start(); ok(false, "getShareLink accepted no parameters");
            }, function () {
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getShareLink: doAuthentication failed"); });
});

asyncTest("Test frontend getShareLink no object", function () {
    console.log("Test frontend getShareLink no object");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getShareLink" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getShareLink(null, function (obj) {
                start(); ok(false, "getShareLink accepted no parameters");
            }, function () {
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getShareLink: doAuthentication failed"); });
});

asyncTest("Test frontend getShareAutocomplete correct", function () {
    console.log("Test frontend getShareAutocomplete correct");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getShareAutocomplete" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getShareAutocomplete({ "key": "a" }, function (obj) {
                start(); 
                if(obj && typeof obj.shareTargets !== "undefined" && $.isArray(obj.shareTargets) && obj.shareTargets.length > 0){
                    var target = obj.shareTargets[0];
                    if(typeof target.label !== "undefined" && typeof target.shareWith !== "undefined" && typeof target.shareToUser !== "undefined"){
                        ok(true, "");
                    } else {
                        ok(false, "getShareAutocomplete share target is not complete: " + JSON.stringify(target));
                    }
                } else {
                    ok(false, "getShareAutocomplete has no share targets");
                }
            });
        },
        function () { start(); ok(false, "getShareAutocomplete: doAuthentication failed"); });
});

asyncTest("Test frontend getShareAutocomplete no object", function () {
    console.log("Test frontend getShareAutocomplete no object");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getShareAutocomplete" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getShareAutocomplete(null, function (obj) {
                start(); 
                if(obj && typeof obj.shareTargets !== "undefined" && $.isArray(obj.shareTargets)){
                    ok(true, "");
                } else {
                    ok(false, "getShareAutocomplete has invalid return structure");
                }
            });
        },
        function () { start(); ok(false, "getShareAutocomplete: doAuthentication failed"); });
});

asyncTest("Test frontend getShareStatus correct", function () {
    // requires previously shared file
    console.log("Test frontend getShareStatus correct");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getShareStatus" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getShareStatus({ 
                "path": appconfig.demoaccount.demofilepath,
                "isDir": false
            }, function (obj) {
                start(); 
                if(obj && $.isArray(obj) && obj.length > 0){
                    if(typeof obj[0].permissionRead !== "undefined" && typeof obj[0].permissionWrite !== "undefined" && 
                        typeof obj[0].permissionCreate !== "undefined" && typeof obj[0].permissionRead !== "undefined" && 
                        typeof obj[0].permissionRead !== "undefined" && typeof obj[0].permissionDelete !== "undefined" && 
                        typeof obj[0].permissionReshare !== "undefined" && typeof obj[0].shareWith !== "undefined" && 
                        typeof obj[0].label !== "undefined" && typeof obj[0].shareToUser !== "undefined"){
                        ok(true, "");
                    } else {
                        ok(false, "getShareStatus is not complete: " + JSON.stringify(obj[0]));
                    }
                } else {
                    ok(false, "getShareStatus has no shares");
                }
            }, function(){
                ok(false, "getShareStatus produced an error");
            });
        },
        function () { start(); ok(false, "getShareStatus: doAuthentication failed"); });
});

asyncTest("Test frontend getShareStatus missing parameters", function () {
    console.log("Test frontend getShareStatus missing parameters");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getShareStatus" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getShareStatus({ }, function (obj) {
                start(); ok(false, "getShareStatus accepted no parameters");
            }, function(){
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getShareStatus: doAuthentication failed"); });
});

asyncTest("Test frontend getShareStatus impossible file", function () {
    console.log("Test frontend getShareStatus impossible file");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getShareStatus" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getShareStatus({ "path": "nonroot/impossible", "isDir": true }, function (obj) {
                start(); ok(false, "getShareStatus accepted impossible location");
            }, function(){
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getShareStatus: doAuthentication failed"); });
});

asyncTest("Test frontend getShareStatus no object", function () {
    console.log("Test frontend getShareStatus no object");
    expect(1);

    var result = cloud.setBackend({
        type: "owncloud",
        host: "https://pscloud.uni-muenster.de/owncloud",
        relativePath: "/files/webdav.php",
        downloadFunction: function () { },
        uploadFunction: function () { }
    });

    cloud.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            if (!cloud.hasFunctionality({ "functionkey": "getShareStatus" })) {
                start(); ok(false, "no plugin available");
                return;
            }

            cloud.getShareStatus(null, function (obj) {
                start(); ok(false, "getShareStatus accepted no parameters");
            }, function(){
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getShareStatus: doAuthentication failed"); });
});