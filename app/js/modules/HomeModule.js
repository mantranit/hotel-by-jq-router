$(function() {
  window.homeKeyboard = {
    currentIndex: 0,
    cursor: 0,
  };
  var HomeModule = {
    handleKeyDown: function(event) {
      const keyCode = event.keyCode || event.which;
      if ($("#homePage").is(":visible")) {
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

        this.renderMenu();
      }
    },

    renderMenu: function() {
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

      $("#menuScroller").empty();
      window.menu.forEach(function(item, index) {
        $("#menuScroller").append(
          `<div class="menu-item">
          <div class="a">
            <div class="icon">` +
            item.icon +
            `</div>
            <div class="text">
              <span>` +
            item.text +
            `</span>
            </div>
          </div>
        </div>`
        );
      });
    },
  };

  window.HomeModule = HomeModule;
});
