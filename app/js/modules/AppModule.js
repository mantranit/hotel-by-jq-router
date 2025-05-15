$(function() {
  var AppModule = {
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

  AppModule.renderDynamicData();
  setInterval(function() {
    AppModule.renderDynamicData();
  }, 60 * 1000);
});
