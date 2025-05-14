$(function() {
  var keyboard = {
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

  var checkKey = function(key, keyCode) {
    for (var i = 0; i < key.length; i++) {
      if (key[i] === keyCode) {
        return true;
      }
    }
    return false;
  };

  var KeyboardModule = {
    init: function() {
      this.bindEvents();
      window.homeKeyboard = {
        currentIndex: 0,
        cursor: 0,
      };
      window.televisionKeyboard = {
        cursorX: 0,
        cursorY: 0,
      };
    },

    bindEvents: function() {
      $(document).on("keydown", this.handleKeyDown);
    },

    handleKeyDown: function(event) {
      event.preventDefault();
      const keyCode = event.keyCode || event.which;
      if ($("#welcome").is(":visible")) {
        if (keyCode === keyboard.ENTER) {
          window.location.href = "#/";
        }
      }
      if ($("#home").is(":visible")) {
        if (keyCode === keyboard.RIGHT) {
          window.homeKeyboard.currentIndex = Math.min(
            window.homeKeyboard.currentIndex + 1,
            window.menu.length - 1
          );
          window.homeKeyboard.cursor = Math.min(
            window.homeKeyboard.cursor + 1,
            4
          );
        } else if (keyCode === keyboard.LEFT) {
          window.homeKeyboard.currentIndex = Math.max(
            window.homeKeyboard.currentIndex - 1,
            0
          );
          window.homeKeyboard.cursor = Math.max(
            window.homeKeyboard.cursor - 1,
            0
          );
        } else if (keyCode === keyboard.ENTER) {
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
      if ($("#television").is(":visible")) {
        var itemInRow = 4;
        window.filteredChannels = window.channels;
        if (keyCode === keyboard.RIGHT) {
          if (window.televisionKeyboard.cursorX === itemInRow - 1) {
            if (
              window.filteredChannels[
                (window.televisionKeyboard.cursorY + 1) * itemInRow
              ]
            ) {
              window.televisionKeyboard.cursorX = 0;
              window.televisionKeyboard.cursorY++;
            }
          } else {
            var nextCursorX = Math.min(
              window.televisionKeyboard.cursorX + 1,
              itemInRow - 1
            );
            if (
              window.filteredChannels[
                nextCursorX + window.televisionKeyboard.cursorY * itemInRow
              ]
            ) {
              window.televisionKeyboard.cursorX = nextCursorX;
            }
          }
        } else if (keyCode === keyboard.LEFT) {
          if (window.televisionKeyboard.cursorX === 0) {
            if (
              window.filteredChannels[
                itemInRow -
                  1 +
                  (window.televisionKeyboard.cursorY - 1) * itemInRow
              ]
            ) {
              window.televisionKeyboard.cursorX = itemInRow - 1;
              window.televisionKeyboard.cursorY--;
            }
          } else {
            window.televisionKeyboard.cursorX = Math.max(
              window.televisionKeyboard.cursorX - 1,
              0
            );
          }
        } else if (keyCode === keyboard.TOP) {
          window.televisionKeyboard.cursorY = Math.max(
            window.televisionKeyboard.cursorY - 1,
            0
          );
        } else if (keyCode === keyboard.BOTTOM) {
          var nextCursorY = Math.min(
            window.televisionKeyboard.cursorY + 1,
            Math.ceil(window.filteredChannels.length / itemInRow) - 1
          );
          if (
            !window.filteredChannels[
              window.televisionKeyboard.cursorX + nextCursorY * itemInRow
            ]
          ) {
            window.televisionKeyboard.cursorX =
              (window.filteredChannels.length % itemInRow) - 1;
          }
          window.televisionKeyboard.cursorY = nextCursorY;
        } else if (keyCode === keyboard.ENTER) {
        } else if (checkKey(keyboard.BACK, keyCode)) {
          window.location.href = "#/";
        }

        $("#televisionCursor").css({
          transform: `translate(${window.televisionKeyboard.cursorX *
            (152 + 36)}px, ${window.televisionKeyboard.cursorY *
            (123 + 36)}px)`,
        });

        var televisionOuter = $("#televisionContent").get(0);
        var televisionInner = $("#televisionList").get(0);
        var children = televisionInner.children;
        if (
          children[
            window.televisionKeyboard.cursorX +
              window.televisionKeyboard.cursorY * itemInRow
          ]
        ) {
          var child =
            children[
              window.televisionKeyboard.cursorX +
                window.televisionKeyboard.cursorY * itemInRow
            ];
          var top = child.offsetTop;
          var bottom = top + child.clientHeight;
          var outerTop = televisionOuter.scrollTop;
          var outerBottom = outerTop + televisionOuter.clientHeight;
          if (top < outerTop) {
            televisionOuter.scrollTop = top;
          } else if (bottom > outerBottom) {
            televisionOuter.scrollTop = bottom - televisionOuter.clientHeight;
          }

          try {
            var activeChannel =
              window.filteredChannels[
                window.televisionKeyboard.cursorX +
                  window.televisionKeyboard.cursorY * itemInRow
              ];
            var // url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
              url = `${location.protocol}//${activeChannel.server}/dash/master-${activeChannel.ipAddress}/live.mpd`;
            window.player.attachSource(url);

            $("#channelTitle").html(activeChannel.name);
            $("#channelCategory").html(activeChannel.category.join(", "));
          } catch (e) {
            console.error("Error initializing video player:", e);
          }
        }
      }
    },
  };

  KeyboardModule.init();
});
