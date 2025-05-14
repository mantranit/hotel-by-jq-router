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

  var KeyboardModule = {
    init: function() {
      this.bindEvents();
      window.homeKeyboard = {
        currentIndex: 0,
        cursor: 0,
      };
    },

    bindEvents: function() {
      document.addEventListener("keydown", this.handleKeyDown.bind(this));
    },

    handleKeyDown: function(event) {
      const keyCode = event.keyCode || event.which;
      if ($("#welcome").is(":visible")) {
        if (keyCode === keyboard.ENTER) {
          window.location.href = "#/";
        }
      }
      if ($("#home").is(":visible")) {
        if (keyCode === window.keyboard.RIGHT) {
          window.homeKeyboard.currentIndex = Math.min(
            window.homeKeyboard.currentIndex + 1,
            window.menu.length - 1
          );
          window.homeKeyboard.cursor = Math.min(
            window.homeKeyboard.cursor + 1,
            4
          );
        } else if (keyCode === window.keyboard.LEFT) {
          window.homeKeyboard.currentIndex = Math.max(
            window.homeKeyboard.currentIndex - 1,
            0
          );
          window.homeKeyboard.cursor = Math.max(
            window.homeKeyboard.cursor - 1,
            0
          );
        } else if (keyCode === window.keyboard.ENTER) {
          const currentItem = window.menu[window.homeKeyboard.currentIndex];
          console.log(currentItem.path, "#" + currentItem.path);
          window.location.href = "#" + currentItem.path;
        }
        if (window.homeKeyboard.cursor === window.homeKeyboard.currentIndex) {
          $("#btnArrowLeft").addClass("disabled");
        } else {
          $("#btnArrowLeft").removeClass("disabled");
        }
        if (
          4 - window.homeKeyboard.cursor ===
          16 - window.homeKeyboard.currentIndex
        ) {
          $("#btnArrowRight").addClass("disabled");
        } else {
          $("#btnArrowRight").removeClass("disabled");
        }
        $("#menuCursor").css({
          transform: `translate(${window.homeKeyboard.cursor * 236}px, 0)`,
        });
        $("#menuScroller").css({
          transform: `translateX(${-(
            window.homeKeyboard.currentIndex - window.homeKeyboard.cursor
          ) * 236}px)`,
        });
      }
      window.TelevisionModule.handleKeyDown(event);
    },
  };

  window.KeyboardModule = KeyboardModule;
  window.KeyboardModule.init();
});
