$(function() {
  window.connectivityKeyboard = {
    cursorX: 0,
    cursorY: 0,
  };
  var ConnectivityModule = {
    handleKeyDown: function(event) {
      var itemInARow = 2;
      const keyCode = event.keyCode || event.which;
      if ($("#connectivityPage").is(":visible")) {
        if (keyCode === window.keyboard.RIGHT) {
          var nextCursorX = Math.min(
            window.connectivityKeyboard.cursorX + 1,
            itemInARow - 1
          );
          if (
            window.sourceList[
              nextCursorX + window.connectivityKeyboard.cursorY * itemInARow
            ]
          ) {
            window.connectivityKeyboard.cursorX = nextCursorX;
          }
        } else if (keyCode === window.keyboard.LEFT) {
          window.connectivityKeyboard.cursorX = Math.max(
            window.connectivityKeyboard.cursorX - 1,
            0
          );
        } else if (keyCode === window.keyboard.TOP) {
          window.connectivityKeyboard.cursorY = Math.max(
            window.connectivityKeyboard.cursorY - 1,
            0
          );
        } else if (keyCode === window.keyboard.BOTTOM) {
          var nextCursorY = Math.min(
            window.connectivityKeyboard.cursorY + 1,
            Math.ceil(window.sourceList.length / itemInARow) - 1
          );
          if (
            window.sourceList[
              window.connectivityKeyboard.cursorX + nextCursorY * itemInARow
            ]
          ) {
            window.connectivityKeyboard.cursorY = nextCursorY;
          } else {
            if (
              window.sourceList[
                window.connectivityKeyboard.cursorX -
                  1 +
                  nextCursorY * itemInARow
              ]
            ) {
              window.connectivityKeyboard.cursorX =
                window.connectivityKeyboard.cursorX - 1;
              window.connectivityKeyboard.cursorY = nextCursorY;
            }
          }
        } else if (keyCode === window.keyboard.ENTER) {
          $("#connectivityAlert .site-modal-title").text(
            i18njs.get(
              window.sourceList[
                window.connectivityKeyboard.cursorX +
                  window.connectivityKeyboard.cursorY * itemInARow
              ].name
            )
          );
          $("#connectivityAlert .intro").text(
            i18njs.get(
              window.sourceList[
                window.connectivityKeyboard.cursorX +
                  window.connectivityKeyboard.cursorY * itemInARow
              ].content
            )
          );
          $("#connectivityAlert").toggle();
        } else if (window.keyboard.BACK.includes(keyCode)) {
          if ($("#connectivityAlert").is(":visible")) {
            $("#connectivityAlert").toggle();
          } else {
            window.location.href = "#/";
          }
        }

        this.renderSources();
      }
    },

    renderSources: function() {
      $("#connectivityCursor").css({
        transform: `translate(${window.connectivityKeyboard.cursorX *
          (400 + 20)}px, ${window.connectivityKeyboard.cursorY * (90 + 20)}px)`,
      });

      $("#connectivityList").empty();
      window.sourceList.forEach(function(item, index) {
        $("#connectivityList").append(
          `<li class="connectivity-item"><i class="` +
            item.icon +
            `"></i><span>` +
            i18njs.get(item.name) +
            `</span></li>`
        );
      });
    },
  };

  window.ConnectivityModule = ConnectivityModule;
});
