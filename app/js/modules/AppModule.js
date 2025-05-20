$(function() {
  window.keyboard = {
    LEFT: 37,
    TOP: 38,
    RIGHT: 39,
    BOTTOM: 40,
    ENTER: 13,
    BACK: [8, 10009, 461], // Back PC, SAMSUNG, LG
    BUTTON_RED: [82], // R
    BUTTON_GREEN: [87], // W
    BUTTON_YELLOW: [69], // E
    BUTTON_BLUE: [81], // Q
    CH_UP: [10007], // Channel Up
    CH_DOWN: [10006], // Channel Down
    VOL_UP: [10005], // Volume Up
    VOL_DOWN: [10004], // Volume Down
    PLAY: [415], // Play
    PAUSE: [19], // Pause
    STOP: [413], // Stop
    REWIND: [412], // Rewind
    FAST_FORWARD: [417], // Fast Forward
    NEXT: [409], // Next
    PREVIOUS: [410], // Previous
    INFO: [457], // Info
    MENU: [4096], // Menu
    EXIT: [10000], // Exit
  };

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
