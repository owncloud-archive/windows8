// A raw WebDAV interface
var WebDAV = {

  GET: function(url, authToken, callback) {
    return this.request('GET', url, {}, null, 'text', authToken, callback);
  },

  PROPFIND: function(url, authToken, callback) {
    return this.request('PROPFIND', url, {Depth: "1" }, null, 'xml', authToken, callback);
  },

  MKCOL: function(url, authToken, callback) {
    return this.request('MKCOL', url, {}, null, 'text', authToken, callback);
  },

  MOVE: function (srcUrl, targetUrl, authToken, callback) {
      console.log("MOVE from: " + srcUrl + " to: " + targetUrl);
      return this.request('MOVE', srcUrl, { "Destination": targetUrl }, null, 'text', authToken, callback);
  },
  
  DELETE: function (url, authToken, callback) {
      console.log("DELETE: " + url);
      return this.request('DELETE', url, {}, null, 'text', authToken, callback);
  },

  PUT: function(url, data, authToken, callback) {
    return this.request('PUT', url, {}, data, 'text', authToken, callback);
  },
  
  request: function (verb, url, headers, data, type, authToken, callback) {
    var xhr = new XMLHttpRequest();
    var body = function () {
      var b = xhr.responseText;
      if (type == 'xml') {
        var xml = xhr.responseXML;
        if(xml) {
          b = xml.firstChild.nextSibling ? xml.firstChild.nextSibling : xml.firstChild;
        }
      }
      return b;
    };
    
    if (callback) {
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) { // complete.
              console.log("ASYNC webdav request done");
             var b = body();
             if ((b && !(xhr.status >= 400 && xhr.status < 600))   // xml-body and no client/server error
                 || (xhr.status >= 200 && xhr.status < 300)) { // successful response (see http://de.wikipedia.org/wiki/HTTP-Statuscode)
                 callback(b);
             } else {
                 // response not successful
                 var error = /<d:error/;
                 if (error.test(xhr.responseText)) {
                     callback("ERROR");
                 } else {
                     // do nothing to avoid conflict with Fs.dir loop
                 }
             }
          }
      };
    }

    xhr.open(verb, url, !!callback);
    xhr.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
    xhr.setRequestHeader("Authorization", "Basic " + authToken);
    //xhr.responseType = type; // fails on mobile

    for (var header in headers) {
        xhr.setRequestHeader(header, headers[header]);
    }

    xhr.send(data);

    if(!callback) {
      return body();
    }
  }
};

// An Object-oriented API around WebDAV.
WebDAV.Fs = function(rootUrl, authToken, context) {
    this.rootUrl = rootUrl;
    this.authToken = authToken;

  var fs = this;
  
  this.file = function(href, prop) {
    this.type = 'file';

    // Filesize
    var contentlength = prop.getElementsByTagName('getcontentlength')[0] || prop.getElementsByTagName('d:getcontentlength')[0];
    this.fileSize = Number(contentlength.firstChild.data);
    if (typeof this.fileSize == "undefined" || this.fileSize == "NaN") {
        this.fileSize = 0;
    }

    this.date = prop.getElementsByTagName('getlastmodified')[0] || prop.getElementsByTagName('d:getlastmodified')[0];
    this.date = this.date.firstChild.data;

    this.url = fs.urlFor(href);
    var regex = new RegExp(apphelper.normalizePath(context.webdav, { "trailingSlash": false }) + "(.*)");
    this.path = href.match(regex)[1];
    //this.path = href.match(/webdav.php(.*)/)[1];

    this.name = fs.nameFor(this.url);

    /**this.read = function(callback) {
      return WebDAV.GET(this.url, callback);
    };
    */
    this.write = function(data, callback) {
      return WebDAV.PUT(this.url, data, callback);
    };

    /*this.rm = function(callback) {
      return WebDAV.DELETE(this.url, callback);
    };*/

    return this;
  };
  
  this.dir = function(href) {
    this.type = 'dir';

    this.url = fs.urlFor(href);
    var regex = new RegExp(apphelper.normalizePath(context.webdav, { "trailingSlash": false }) + "(.*)");
    this.path = href.match(regex)[1];

    this.name = fs.nameFor(this.url);

    this.children = function (authToken, callbackList, errorCallback, context) {
      var callback = callbackList.pop();

      var childrenFunc = function(doc) {
        if (doc.childNodes == null) {
            errorCallback("NOSUCHELEMENT");
        }
        var result = [];
        // Start at 1, because the 0th is the same as self (= containing folder)
        for(var i=1; i < doc.childNodes.length; i++) {
          var response     = doc.childNodes[i];
          var href = response.getElementsByTagName('href')[0] || response.getElementsByTagName('d:href')[0];
          href = href.firstChild.nodeValue;
          href = href.replace(/\/$/, ''); // Strip trailing slash
          var propstat     = response.getElementsByTagName('propstat')[0] || response.getElementsByTagName('d:propstat')[0];
          var prop         = propstat.getElementsByTagName('prop')[0] || propstat.getElementsByTagName('d:prop')[0];
          var resourcetype = prop.getElementsByTagName('resourcetype')[0] || prop.getElementsByTagName('d:resourcetype')[0];
          var collection = resourcetype.getElementsByTagName('collection')[0] || resourcetype.getElementsByTagName('d:collection')[0];

         if(collection) {
            result[i-1] = new fs.dir(href);
          } else {
            result[i-1] = new fs.file(href, prop);
          }
        }
        return result;
      };

      if(callback) {
          WebDAV.PROPFIND(this.url, authToken, function (doc) {
              if (doc !== "ERROR") {
                  callback(childrenFunc(doc), callbackList, errorCallback, context);
              } else {
                  callback("ERROR", callbackList, errorCallback, context);
              }
        });
      } else {
          return childrenFunc(WebDAV.PROPFIND(this.url));
      }
    };

    /*this.rm = function(callback) {
      return WebDAV.DELETE(this.url, callback);
    };

    this.mkdir = function(callback) {
      return WebDAV.MKCOL(this.url, callback);
    };*/

    return this;
  };
  
  this.urlFor = function(href) {
    return (/^http/.test(href) ? href : this.rootUrl + href);
  };
  
  this.nameFor = function(url) {
    return url.replace(/.*\/(.*)/, '$1');
  };

  return this;
};