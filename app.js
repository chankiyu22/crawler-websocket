var fs = require("fs");
var path = require("path");
var request = require("request");
var jsdom = require("jsdom");

var socket = require("./socket");
var stores = require("./stores");

function onCrawlSuccess(crawler, domOrJson, emitter) {
  try {
    crawler.onCrawlSuccess(domOrJson, emitter);
  } catch (err) {
    console.log(err);
  }
}

function onCrawlError(crawler, error) {
  try {
    crawler.onCrawlError(error);
  } catch (err) {
    console.log(err);
  }
}

function initCrawler(id, crawler) {
  return setInterval(function () {
    var requestOptions = crawler.requestOptions;
    request(requestOptions, function (error, response, body) {
      if (error) {
        onCrawlError(crawler, error);
        return;
      }

      var parsed;
      var isJson = false;
      try {
        parsed = JSON.parse(body);
        isJson = true;
      } catch(err) {
        isJson = false;
      }

      if (isJson) {
        onCrawlSuccess(crawler, parsed, socket.getEmitter(id));
      } else {
        jsdom.env({
          html: body,
          done: function (err, window) {
            if (err) {
              onCrawlError(crawler, err);
            } else {
              onCrawlSuccess(crawler, window, socket.getEmitter(id));
            }
          },
        });
      }
    });
  }, crawler.crawlerOptions.interval);
}

function init() {
  fs.readdir(path.join(__dirname, "crawlers"), function (error, files) {
    files.forEach(function (file) {
      var data = require(path.join(__dirname, "crawlers", file));
      if (!stores.getStore(file)) {
        stores.setStore(file, {
          data: data,
          intervalId: initCrawler(file, data),
        });
      } else {
        var crawler = stores.getStore(file);
        if (crawler.data.crawlerOptions.interval !== data.crawlerOptions.interval) {
          clearInterval(crawler.data.intervalId);
          stores.setStore(file, {
            data: data,
            intervalId: initCrawler(file, data),
          });
        }
      }
    });
  });
}

init();
setInterval(init, 60 * 60 * 1000);
