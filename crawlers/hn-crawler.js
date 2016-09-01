module.exports = {
  crawlerOptions: {
    interval: 30 * 1000,
  },
  requestOptions: {
    url: "https://news.ycombinator.com",
  },
  onCrawlSuccess: function (domOrJson, emitter) {
    var topics = domOrJson.document.querySelectorAll(".title .storylink");
    var result = [];
    for (var i = 0; i < topics.length; i++) {
      var topic = topics[i];
      result.push({
        title: topic.innerHTML,
        url: topic.getAttribute("href")
      });
    }
    emitter.emit(result);
  },
  onCrawlError: function (error) {
    console.log("error");
  },
};
