$(function() {
  window.categoryKeyboard = {
    cursorX: 0,
    cursorY: 0,
  };
  var CategoryModule = {
    itemInRow: 2,
    handleKeyDown: function(event) {
      if (!$("#categoryPage").is(":visible")) {
        return;
      }
      const keyCode = event.keyCode || event.which;
      if (keyCode === window.keyboard.RIGHT) {
        var nextCursorX = Math.min(
          window.categoryKeyboard.cursorX + 1,
          this.itemInRow - 1
        );
        if (
          window.currentCategory[
            nextCursorX + window.categoryKeyboard.cursorY * this.itemInRow
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
          Math.ceil(window.currentCategory.length / this.itemInRow) - 1
        );
        if (
          window.currentCategory[
            window.categoryKeyboard.cursorX + nextCursorY * this.itemInRow
          ]
        ) {
          window.categoryKeyboard.cursorY = nextCursorY;
        } else {
          if (
            window.currentCategory[
              window.categoryKeyboard.cursorX - 1 + nextCursorY * this.itemInRow
            ]
          ) {
            window.categoryKeyboard.cursorX =
              window.categoryKeyboard.cursorX - 1;
            window.categoryKeyboard.cursorY = nextCursorY;
          }
        }
      } else if (keyCode === window.keyboard.ENTER) {
        // go to subcategory
      } else if (window.keyboard.BACK.includes(keyCode)) {
        $.router.onhashchange("#/");
      }

      this.renderCursor();
    },

    renderCursor: function() {
      if (!$("#categoryPage").is(":visible")) {
        return;
      }
      $("#categoryCursor").css({
        transform: `translate(${window.categoryKeyboard.cursorX *
          (390 + 20)}px, ${window.categoryKeyboard.cursorY * (158 + 20)}px)`,
      });

      var categoryOuter = $("#categoryContent").get(0);
      var categoryInner = $("#categoryList").get(0);
      if (categoryOuter.clientHeight >= categoryInner.clientHeight) {
        $("#categoryContent").css({
          "overflow-y": "hidden",
        });
      } else {
        $("#categoryContent").css({
          "overflow-y": "scroll",
        });
      }
      var children = categoryInner.children;

      var child =
        children[
          window.categoryKeyboard.cursorX +
            window.categoryKeyboard.cursorY * this.itemInRow
        ];
      if (child) {
        var top = child.offsetTop;
        var bottom = top + child.clientHeight;
        var outerTop = categoryOuter.scrollTop;
        var outerBottom = outerTop + categoryOuter.clientHeight;
        if (top < outerTop) {
          categoryOuter.scrollTop = top - 3;
        } else if (bottom > outerBottom) {
          categoryOuter.scrollTop = bottom - categoryOuter.clientHeight;
        }
      }
    },

    renderCategory: function(categoryId) {
      if (!$("#categoryPage").is(":visible")) {
        return;
      }
      window.currentCategory = window.dining.filter(
        (item) => item.parentId === categoryId
      );

      $("#categoryTitle").text("Dining");

      $("#categoryList").empty();
      window.currentCategory.forEach(function(item, index) {
        $("#categoryList").append(
          `<div class="category-item">
            <div class="category-item-inner">
              <img alt="" width="390" height="158" src="${item.img}">
              <div class="brief" style="background-image: url(assets/images/icons/pagelist_bg_v3.png);">
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
