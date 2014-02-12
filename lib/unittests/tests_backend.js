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



/********************************************************************** 
** Note: Aspects resulting from wrong user inputs or app behaviour
** (wrong parameter amount / use) should have already been centrally
** intercepted by the frontend tests, therefore no focus on this here
***********************************************************************/


// General implementation 
test("Test backend interface specification", function () {
    console.log("Test backend interface specification");
    ok(InterfaceHelper.ensureImplements(cloudbackend, Backend), "Backend interface implementation does not match specification");
});


// hasFunctionality 
test("Test backend hasFunctionality", function () {
    console.log("Test backend hasFunctionality");
    ok(cloudbackend.hasFunctionality({ functionkey: "unittest" }), "Backend interface cannot verify functions");
});

// doAuthentication 
asyncTest("Test backend doAuthentication correct", function () {
    console.log("Test backend doReAuthentication correct");
    expect(1);

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () { start(); ok(true, ""); },
        function () { start(); ok(false, "doAuthentication failed"); });
});

asyncTest("Test backend doAuthentication incorrect", function () {
    console.log("Test backend doReAuthentication incorrect");
    expect(1);

    cloudbackend.doAuthentication({ username: "kajchöoaisjdkajneeöolkjndkc", password: "sahdkjsahdkjsha" },
        function () { start(); ok(false, "doAuthentication accepted wrong user"); },
        function () { start(); ok(true, ""); });
});

asyncTest("Test backend doAuthentication empty user", function () {
    console.log("Test backend doReAuthentication empty user");
    expect(1);

    cloud.doAuthentication({ username: "", password: "sahdkjsahdkjsha" },
        function () { start(); ok(false, "doAuthentication accepted wrong user"); },
        function () { start(); ok(true, "doAuthentication failed"); });
});

asyncTest("Test backend doAuthentication empty password", function () {
    console.log("Test backend doReAuthentication empty password");
    expect(1);

    cloudbackend.doAuthentication({ username: "kajchöoaisjdkajneeöolkjndkc", password: "" },
        function () { start(); ok(false, "doAuthentication accepted empty password"); },
        function () { start(); ok(true, "doAuthentication failed"); });
});

// doReAuthentication 
asyncTest("Test backend doReAuthentication", function () {
    console.log("Test backend doReAuthentication");
    expect(1);

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloudbackend.doReAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
                function () { start(); ok(true, "doReAuthentication failed"); },
                function () { start(); ok(false, "doReAuthentication failed"); });
        },
        function () { start(); ok(false, "doReAuthentication failed at first authentication"); });
});


// isLoggedIn 
asyncTest("Test backend isLoggedIn after correct login", function () {
    console.log("Test backend isLoggedIn after correct login");
    expect(1);

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () { start(); ok(cloudbackend.isLoggedIn(), "isLoggedIn false after login"); },
        function () { start(); ok(false, "isLoggedIn login failed"); });
});

// setLoggedIn 
test("Test backend setLoggedIn normal", function () {
    console.log("Test backend setLoggedIn normal");
    cloudbackend.setLoggedIn({ "loginStatus": true });
    equal(cloudbackend.isLoggedIn(), true, "Login status was not set correctly");
    cloudbackend.setLoggedIn({ "loginStatus": false });
    equal(cloudbackend.isLoggedIn(), false, "Login status was not set correctly");
});

test("Test backend setLoggedIn wrong parameters", function () {
    console.log("Test backend setLoggedIn wrong parameters");
    cloudbackend.setLoggedIn(); // no parameter
    equal(cloudbackend.isLoggedIn(), false, "Login status output wrong using no parameter");
    cloudbackend.setLoggedIn({ "login": false }); // wrong parameter
    equal(cloudbackend.isLoggedIn(), false, "Login status output wrong using wrong parameter");
});

// getDirectoryContent 
asyncTest("Test backend getDirectoryContent correct", function () {
    console.log("Test backend getDirectoryContent correct");
    expect(1);

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloudbackend.getDirectoryContent({
                "path": "/"
            }, [function (obj) {
                start();
                if (obj.length > 0) {
                    if (typeof obj[0].path !== "undefined" && typeof obj[0].isDir !== "undefined" && typeof obj[0].fileSize !== "undefined") {
                        ok(true, "");
                    } else {
                        ok(false, "Content is not complete: " + JSON.stringify(obj[0]));
                    }
                } else {
                    ok(false, "Directory has no elements");
                }
            }], function () {
                start(); ok(false, "GetDirectoryContent produces error");
            });
        },
        function () { start(); ok(false, "getDirectoryContent: doAuthentication failed"); });
});

asyncTest("Test backend getDirectoryContent wrong parameter", function () {
    console.log("Test backend getDirectoryContent wrong parameter");
    expect(1);

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloudbackend.getDirectoryContent({
                "path": "nonroot/impossible/"
            }, [function (obj) {
                start(); ok(obj.length == 0, "getDirectoryContent: There are objects in non-existing folder");
            }], function () {
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getDirectoryContent: doAuthentication failed"); });
});

// getRemainingSpace 
asyncTest("Test backend getRemainingSpace", function () {
    console.log("Test backend getRemainingSpace");
    expect(1);

    if (!cloudbackend.hasFunctionality({ "functionkey": "getRemainingSpace" })) {
        start(); ok(false, "no plugin available");
        return;
    }

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloudbackend.getRemainingSpace(function (obj) {
                start();
                if (obj) {
                    if (typeof obj.remainingBytes !== "undefined" && typeof obj.remainingBestNum !== "undefined"
                        && typeof obj.remainingBestText !== "undefined" && typeof obj.usedBytes !== "undefined"
                        && typeof obj.usedBestNum !== "undefined" && typeof obj.usedBestText !== "undefined"
                        && typeof obj.totalBytes !== "undefined" && typeof obj.totalBestNum !== "undefined"
                        && typeof obj.totalBestText !== "undefined" && typeof obj.usedPercentNum !== "undefined"
                        && typeof obj.remainingPercentNum !== "undefined" && typeof obj.usedPercent !== "undefined"
                        && typeof obj.remainingPercent !== "undefined") {
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

// getDeletedFiles 
asyncTest("Test backend getDeletedFiles correct", function () {
    console.log("Test backend getDeletedFiles correct");
    expect(1);

    if (!cloudbackend.hasFunctionality({ "functionkey": "getDeletedFiles" })) {
        start(); ok(false, "no plugin available");
        return;
    }

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloudbackend.getDeletedFiles({
                "path": "/"
            }, [function (obj) {
                start();
                if (obj.length > 0) {
                    if (typeof obj[0].path !== "undefined" && typeof obj[0].isDir !== "undefined" && typeof obj[0].fileSize !== "undefined"
                        || typeof obj[0].date !== "undefined" && typeof obj[0].deleted !== "undefined" && typeof obj[0].deletedId !== "undefined") {
                        ok(true, "");
                    } else {
                        ok(false, "Content is not complete: " + JSON.stringify(obj[0]));
                    }
                } else {
                    ok(false, "Directory has no elements");
                }
            }], function () {
                start(); ok(false, "getDeletedFiles produces error");
            });
        },
        function () { start(); ok(false, "getDeletedFiles: doAuthentication failed"); });
});

asyncTest("Test backend getDeletedFiles wrong parameter", function () {
    console.log("Test backend getDeletedFiles wrong parameter");
    expect(1);

    if (!cloudbackend.hasFunctionality({ "functionkey": "getDeletedFiles" })) {
        start(); ok(false, "no plugin available");
        return;
    }

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloudbackend.getDeletedFiles({
                "path": "nonroot/impossible/"
            }, [function (obj) {
                start(); ok(obj.length == 0, "getDeletedFiles: There are deleted objects in non-existing folder");
            }], function () {
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getDeletedFiles: doAuthentication failed"); });
});

// getVersions 
asyncTest("Test backend getVersions correct", function () {
    console.log("Test backend getVersions correct");
    expect(1);

    if (!cloudbackend.hasFunctionality({ "functionkey": "getDeletedFiles" })) {
        start(); ok(false, "no plugin available");
        return;
    }

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloudbackend.getVersions({
                "path": appconfig.demoaccount.demofilepath
            }, function (obj) {
                start();
                if ($.isArray(obj)) {
                    if (obj.length > 0) {
                        if (typeof obj[0].path !== "undefined" && typeof obj[0].versionId !== "undefined" ||
                            typeof obj[0].size !== "undefined" && typeof obj[0].date !== "undefined") {
                            ok(true, "");
                        } else {
                            ok(false, "Content is not complete: " + JSON.stringify(obj[0]));
                        }
                    } else {
                        ok(false, "No prior version available");
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

asyncTest("Test backend getVersions non-existent file or folder", function () {
    console.log("Test backend getVersions non-existent file");
    expect(1);

    if (!cloudbackend.hasFunctionality({ "functionkey": "getDeletedFiles" })) {
        start(); ok(false, "no plugin available");
        return;
    }

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloudbackend.getVersions({
                "path": "/veryunlikelyfilenamekjdskkudsfndmwnjfnweflwkndslkdsf.txt" // will return empty array
            }, function (obj) {
                start();
                if (obj.length > 0) {
                    ok(false, "getVersions: Non-existing file is found");
                } else {
                    ok(true, "");
                }
            }, function () {
                start(); ok(false, "getVersions: error thrown");
            });
        },
        function () { start(); ok(false, "getVersions: doAuthentication failed"); });
});

asyncTest("Test backend getVersions impossible parameter", function () {
    console.log("Test backend getVersions impossible parameter");
    expect(1);

    cloudbackend.doAuthentication({ username: appconfig.demoaccount.username, password: appconfig.demoaccount.password },
        function () {
            cloudbackend.getVersions({
                "path": "nonroot/impossible"
            }, function (obj) {
                start(); ok(false, "getVersions: There is a version for an impossible element");
            }, function () {
                start(); ok(true, "");
            });
        },
        function () { start(); ok(false, "getVersions: doAuthentication failed"); });
});