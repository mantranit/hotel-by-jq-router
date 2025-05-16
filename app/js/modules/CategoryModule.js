$(function() {
  window.categoryKeyboard = {
    cursorX: 0,
    cursorY: 0,
  };
  var CategoryModule = {
    handleKeyDown: function(event) {
      var itemInARow = 2;
      const keyCode = event.keyCode || event.which;
      if ($("#categoryPage").is(":visible")) {
        if (keyCode === window.keyboard.RIGHT) {
          var nextCursorX = Math.min(
            window.categoryKeyboard.cursorX + 1,
            itemInARow - 1
          );
          if (
            window.sourceList[
              nextCursorX + window.categoryKeyboard.cursorY * itemInARow
            ]
          ) {
            window.categoryKeyboard.cursorX = nextCursorX;
          }
        } else if (keyCode === window.keyboard.LEFT) {
          window.categoryKeyboard.cursorX = Math.max(
            window.categoryKeyboard.cursorX - 1,
            0
          );
        } else if (keyCode === window.keyboard.TOP) {
          window.categoryKeyboard.cursorY = Math.max(
            window.categoryKeyboard.cursorY - 1,
            0
          );
        } else if (keyCode === window.keyboard.BOTTOM) {
          var nextCursorY = Math.min(
            window.categoryKeyboard.cursorY + 1,
            Math.ceil(window.sourceList.length / itemInARow) - 1
          );
          if (
            window.sourceList[
              window.categoryKeyboard.cursorX + nextCursorY * itemInARow
            ]
          ) {
            window.categoryKeyboard.cursorY = nextCursorY;
          } else {
            if (
              window.sourceList[
                window.categoryKeyboard.cursorX - 1 + nextCursorY * itemInARow
              ]
            ) {
              window.categoryKeyboard.cursorX =
                window.categoryKeyboard.cursorX - 1;
              window.categoryKeyboard.cursorY = nextCursorY;
            }
          }
        } else if (keyCode === window.keyboard.ENTER) {
          $("#connectivityAlert .site-modal-title").text(
            i18njs.get(
              window.sourceList[
                window.categoryKeyboard.cursorX +
                  window.categoryKeyboard.cursorY * itemInARow
              ].name
            )
          );
          $("#connectivityAlert .intro").text(
            i18njs.get(
              window.sourceList[
                window.categoryKeyboard.cursorX +
                  window.categoryKeyboard.cursorY * itemInARow
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

        this.renderCategory();
      }
    },

    renderCategory: function(categoryId) {
      $("#categoryCursor").css({
        transform: `translate(${window.categoryKeyboard.cursorX *
          (390 + 20)}px, ${window.categoryKeyboard.cursorY * (158 + 20)}px)`,
      });

      $("#categoryList").empty();
      window.dining
        .filter((item) => item.parentId === categoryId)
        .forEach(function(item, index) {
          console.log(item);
          $("#categoryList").append(
            `<div class="category-item">
            <div class="category-item-inner" style="width: 390px; height: 158px;">
              <img alt="" width="390" height="158" src="${item.img}">
              <div class="brief">
                <p class="title">${item.title}</p>
                <p class="time">${item.time}</p>
              </div>
            </div>
          </div>`
          );
        });
    },
  };

  window.CategoryModule = CategoryModule;
});
