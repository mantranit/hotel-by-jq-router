$(function() {
  var AppModule = {
    fullscreen: function() {
      var clientWidth = document.documentElement.clientWidth;
      if (clientWidth >= 1920) {
        $("html").css({
          zoom: clientWidth / 1280,
        });
      }
    },
    renderDynamicData: function() {
      $("#clock").text(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      $("#date").text(
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    },
  };

  AppModule.fullscreen();
  AppModule.renderDynamicData();
  setInterval(function() {
    AppModule.renderDynamicData();
  }, 60 * 1000);
});
