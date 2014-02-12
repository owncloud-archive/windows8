/**** General configuration ****/
//QUnit.config.reorder = false;
QUnit.config.testTimeout = 20000;
console.log("Timeout increased");


/**** Frontend test preparation ****/
// To be changed according to what needs to be tested 
//var cloud = new frontendDummy();
var cloud = new frontendProduction();

// Initialize
cloud.doInit({});




/**** Backend test preparation ****/
// To be changed according to what needs to be tested
var cloudbackend = new backendOwncloud();
//var cloudbackend = new backendSharepoint();

var configuration = appconfig.servers[appconfig.demoaccount.server];
configuration.downloadFunction = function () { };
configuration.uploadFunction = function () { };

// Initialize
cloudbackend.doInit(configuration);
