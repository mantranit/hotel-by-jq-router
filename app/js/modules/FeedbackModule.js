$(function() {
  window.feedbackKeyboard = {
    cursor: 0,
    cursorSelect: 0,
  };
  var FeedbackModule = {
    handleKeyDown: function(event) {
      if (!$("#feedbackPage").is(":visible")) {
        return;
      }
      const keyCode = event.keyCode || event.which;
      if (keyCode === window.keyboard.RIGHT) {
        if (
          window.feedbackList[window.feedbackKeyboard.cursor].type === "star"
        ) {
          window.feedbackList.forEach(function(item, index) {
            item.selected = Math.min(5, item.selected + 1);
          });
        }
      } else if (keyCode === window.keyboard.LEFT) {
        if (
          window.feedbackList[window.feedbackKeyboard.cursor].type === "star"
        ) {
          window.feedbackList.forEach(function(item, index) {
            item.selected = Math.max(1, item.selected - 1);
          });
        }
      } else if (keyCode === window.keyboard.TOP) {
        if (
          window.feedbackList[window.feedbackKeyboard.cursor] &&
          window.feedbackList[window.feedbackKeyboard.cursor].type === "select"
        ) {
          const prevCursorSelect = window.feedbackKeyboard.cursorSelect - 1;
          if (prevCursorSelect <= -1) {
            window.feedbackKeyboard.cursor = Math.max(
              window.feedbackKeyboard.cursor - 1,
              0
            );
          } else {
            window.feedbackKeyboard.cursorSelect = prevCursorSelect;
          }
        } else {
          window.feedbackKeyboard.cursor = Math.max(
            window.feedbackKeyboard.cursor - 1,
            0
          );
        }
      } else if (keyCode === window.keyboard.BOTTOM) {
        if (
          window.feedbackList[window.feedbackKeyboard.cursor] &&
          window.feedbackList[window.feedbackKeyboard.cursor].type === "select"
        ) {
          const nextCursorSelect = window.feedbackKeyboard.cursorSelect + 1;
          if (
            nextCursorSelect >=
            window.feedbackList[window.feedbackKeyboard.cursor].options.length
          ) {
            window.feedbackKeyboard.cursor = Math.min(
              window.feedbackKeyboard.cursor + 1,
              window.feedbackList.length
            );
          } else {
            window.feedbackKeyboard.cursorSelect = nextCursorSelect;
          }
        } else {
          window.feedbackKeyboard.cursor = Math.min(
            window.feedbackKeyboard.cursor + 1,
            window.feedbackList.length
          );
        }
      } else if (keyCode === window.keyboard.ENTER) {
        if ($("#feedbackAlert").is(":visible")) {
          window.feedbackList.forEach(function(item, index) {
            item.selected = 1;
            item.value = 0;
          });
          window.feedbackKeyboard.cursor = 0;
          window.feedbackKeyboard.cursorSelect = 0;
          $.router.onhashchange("#/");
          return;
        } else if (
          window.feedbackKeyboard.cursor === window.feedbackList.length
        ) {
          console.log("Submit feedback");
          $("#feedbackAlert").fadeIn(200);
          return;
        } else if (
          window.feedbackList[window.feedbackKeyboard.cursor] &&
          window.feedbackList[window.feedbackKeyboard.cursor].type === "star"
        ) {
          window.feedbackList[window.feedbackKeyboard.cursor].value =
            window.feedbackList[window.feedbackKeyboard.cursor].selected;
        } else if (
          window.feedbackList[window.feedbackKeyboard.cursor] &&
          window.feedbackList[window.feedbackKeyboard.cursor].type === "select"
        ) {
          window.feedbackList[window.feedbackKeyboard.cursor].value =
            window.feedbackList[window.feedbackKeyboard.cursor].options[
              window.feedbackKeyboard.cursorSelect
            ];
        }
        // go to next feedback
        window.feedbackKeyboard.cursor = Math.min(
          window.feedbackKeyboard.cursor + 1,
          window.feedbackList.length
        );
      } else if (window.keyboard.BACK.includes(keyCode)) {
        $.router.onhashchange("#/");
      }

      this.renderFeedback();
      this.scrollTo();
    },

    scrollTo: function() {
      if (!$("#feedbackPage").is(":visible")) {
        return;
      }
      var feedbackContent = $("#feedbackContent").get(0);
      var feedbackContentInner = $("#feedbackContentInner").get(0);
      var children = feedbackContentInner.children;
      var cursor = window.feedbackKeyboard.cursor;
      var cursorElement = children[cursor];
      if (cursorElement) {
        var cursorRect = cursorElement.getBoundingClientRect();
        var feedbackContentRect = feedbackContent.getBoundingClientRect();
        var offsetTop = cursorRect.top - feedbackContentRect.top;
        if (offsetTop < 0) {
          feedbackContent.scrollTop += offsetTop;
        } else if (
          offsetTop + cursorElement.offsetHeight >
          feedbackContent.offsetHeight
        ) {
          feedbackContent.scrollTop +=
            offsetTop -
            feedbackContent.offsetHeight +
            cursorElement.offsetHeight;
        }
      }
    },

    renderFeedback: function() {
      if (!$("#feedbackPage").is(":visible")) {
        return;
      }
      if (window.feedbackKeyboard.cursor === window.feedbackList.length) {
        $("#feedbackSubmit").addClass("site-button--active");
      } else {
        $("#feedbackSubmit").removeClass("site-button--active");
      }
      $("#feedbackContentInner").empty();
      window.feedbackList.forEach(function(item, index) {
        if (item.type === "star") {
          $("#feedbackContentInner").append(
            `<div class="feedback-option-wrapper ` +
              (window.feedbackKeyboard.cursor === index ? "active" : "") +
              `">
            <div class="feedback-option-name">` +
              item.name +
              `</div>
            <div class="feedback-option-star">
              <span class="icons8-star${
                parseInt(item.value.toString(), 10) >= 1 ? "-filled" : ""
              }"></span>
              <span class="icons8-star${
                parseInt(item.value.toString(), 10) >= 2 ? "-filled" : ""
              }"></span>
              <span class="icons8-star${
                parseInt(item.value.toString(), 10) >= 3 ? "-filled" : ""
              }"></span>
              <span class="icons8-star${
                parseInt(item.value.toString(), 10) >= 4 ? "-filled" : ""
              }"></span>
              <span class="icons8-star${
                parseInt(item.value.toString(), 10) >= 5 ? "-filled" : ""
              }"></span>
              <div class="feedback-option-star-cursor" style="transform: translate(` +
              50 * (item.selected - 1) +
              `px, 0px)"></div>
            </div>
          </div>`
          );
        } else if (item.type === "select") {
          var optionHtml = "";
          item.options.forEach(function(option, index) {
            optionHtml +=
              `<div class="feedback-option-select-item"><span>` +
              option +
              `</span>` +
              (item.value === option
                ? `<span class="icon">
                    <svg
                      id="btn_selected"
                      width="65"
                      height="59"
                      viewBox="0 0 65 59"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z"
                        id="Shape"
                      ></path>
                    </svg>
                  </span>`
                : "") +
              `</div>`;
          });
          $("#feedbackContentInner").append(
            `<div class="feedback-option-wrapper ` +
              (window.feedbackKeyboard.cursor === index ? "active" : "") +
              `">
            <div class="feedback-option-name">` +
              item.name +
              `</div>
            <div class="feedback-option-select-wrapper">
              <div class="feedback-option-select">` +
              optionHtml +
              `<div class="feedback-option-select-cursor" style="transform: translate(0px, ` +
              window.feedbackKeyboard.cursorSelect * 50 +
              `px);"></div>
              </div>
            </div>
          </div>`
          );
        }
      });
    },
  };

  window.FeedbackModule = FeedbackModule;
});
