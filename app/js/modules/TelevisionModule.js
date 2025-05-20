$(function() {
  window.televisionKeyboard = {
    cursorX: 0,
    cursorY: 0,
  };
  window.televisionFilterKeyboard = {
    cursor: 0,
    selected: [],
  };
  var TelevisionModule = {
    itemInRow: 4,
    timeHideTVControls: 0,
    iptvPlayer: null,
    handleKeyDown: function(event) {
      if (!$("#televisionPage").is(":visible")) {
        return;
      }
      const keyCode = event.keyCode || event.which;
      if ($("#filterChannels").is(":visible")) {
        if (keyCode === window.keyboard.TOP) {
          window.televisionFilterKeyboard.cursor = Math.max(
            window.televisionFilterKeyboard.cursor - 1,
            0
          );
        } else if (keyCode === window.keyboard.BOTTOM) {
          window.televisionFilterKeyboard.cursor = Math.min(
            window.televisionFilterKeyboard.cursor + 1,
            window.channelCategories.length
          );
        } else if (keyCode === window.keyboard.ENTER) {
          var selectedItem =
            window.channelCategories[
              window.televisionFilterKeyboard.cursor - 1
            ];
          if (selectedItem) {
            if (
              window.televisionFilterKeyboard.selected.includes(selectedItem)
            ) {
              window.televisionFilterKeyboard.selected = window.televisionFilterKeyboard.selected.filter(
                (item) => item !== selectedItem
              );
            } else {
              window.televisionFilterKeyboard.selected.push(selectedItem);
            }
          } else {
            window.televisionFilterKeyboard.selected = [];
          }

          this.renderChannels();
          window.televisionKeyboard.cursorX = 0;
          window.televisionKeyboard.cursorY = 0;
          this.renderCursor();
        } else if (
          window.keyboard.BACK.includes(keyCode) ||
          window.keyboard.BUTTON_YELLOW.includes(keyCode)
        ) {
          $("#filterChannels").toggle();
          $("#televisionPlayer").toggle();
        }

        this.renderCategories();

        return;
      }
      // Hide filter channels
      if (keyCode === window.keyboard.RIGHT) {
        if (window.televisionKeyboard.cursorX === this.itemInRow - 1) {
          if (
            window.filteredChannels[
              (window.televisionKeyboard.cursorY + 1) * this.itemInRow
            ]
          ) {
            window.televisionKeyboard.cursorX = 0;
            window.televisionKeyboard.cursorY++;
          }
        } else {
          var nextCursorX = Math.min(
            window.televisionKeyboard.cursorX + 1,
            this.itemInRow - 1
          );
          if (
            window.filteredChannels[
              nextCursorX + window.televisionKeyboard.cursorY * this.itemInRow
            ]
          ) {
            window.televisionKeyboard.cursorX = nextCursorX;
          }
        }
      } else if (keyCode === window.keyboard.LEFT) {
        if (window.televisionKeyboard.cursorX === 0) {
          if (
            window.filteredChannels[
              this.itemInRow -
                1 +
                (window.televisionKeyboard.cursorY - 1) * this.itemInRow
            ]
          ) {
            window.televisionKeyboard.cursorX = this.itemInRow - 1;
            window.televisionKeyboard.cursorY--;
          }
        } else {
          window.televisionKeyboard.cursorX = Math.max(
            window.televisionKeyboard.cursorX - 1,
            0
          );
        }
      } else if (keyCode === window.keyboard.TOP) {
        window.televisionKeyboard.cursorY = Math.max(
          window.televisionKeyboard.cursorY - 1,
          0
        );
      } else if (keyCode === window.keyboard.BOTTOM) {
        var nextCursorY = Math.min(
          window.televisionKeyboard.cursorY + 1,
          Math.ceil(window.filteredChannels.length / this.itemInRow) - 1
        );
        if (
          !window.filteredChannels[
            window.televisionKeyboard.cursorX + nextCursorY * this.itemInRow
          ]
        ) {
          window.televisionKeyboard.cursorX =
            (window.filteredChannels.length % this.itemInRow) - 1;
        }
        window.televisionKeyboard.cursorY = nextCursorY;
      } else if (keyCode === window.keyboard.ENTER) {
        var activeChannel =
          window.filteredChannels[
            window.televisionKeyboard.cursorX +
              window.televisionKeyboard.cursorY * this.itemInRow
          ];
        if (activeChannel) {
          $("#televisionPlayer")
            .removeClass("not-fullscreen")
            .addClass("fullscreen");
        }
      } else if (window.keyboard.BACK.includes(keyCode)) {
        if ($("#televisionPlayer").hasClass("fullscreen")) {
          $("#televisionPlayer")
            .removeClass("fullscreen")
            .addClass("not-fullscreen");

          if (this.timeHideTVControls) {
            clearTimeout(this.timeHideTVControls);
          }
          $("#header").show();
          $("#televisionPlayerInfo").show();
        } else {
          window.televisionFilterKeyboard.selected = [];
          $.router.onhashchange("#/");
        }
      } else if (window.keyboard.BUTTON_YELLOW.includes(keyCode)) {
        $("#filterChannels").toggle();
        $("#televisionPlayer").toggle();
      }

      this.renderCursor();
    },
    initIPTVPlayer: function() {
      if (!$("#televisionPage").is(":visible")) {
        return;
      }
      try {
        var activeChannel =
          window.filteredChannels[
            window.televisionKeyboard.cursorX +
              window.televisionKeyboard.cursorY * 4
          ];
        var video,
          url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
          url2 = `${location.protocol}//${activeChannel.server}/dash/master-${activeChannel.ipAddress}/live.mpd`;
        console.log("=======================", url2, activeChannel.name);
        video = document.getElementById("iptv-video");
        this.iptvPlayer = dashjs.MediaPlayer().create();
        this.iptvPlayer.initialize();
        this.iptvPlayer.attachView(video);
        this.iptvPlayer.setAutoPlay(true);
        this.iptvPlayer.attachSource(url2);

        $("#channelTitle").html(activeChannel.name);
        $("#channelCategory").html(activeChannel.category.join(", "));
      } catch (e) {
        console.error("Error initializing video player:", e);
      }
    },
    changeSourceIPTV: function() {
      if (!$("#televisionPage").is(":visible")) {
        return;
      }
      var activeChannel =
        window.filteredChannels[
          window.televisionKeyboard.cursorX +
            window.televisionKeyboard.cursorY * 4
        ];
      if (activeChannel) {
        var url = "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
          url2 = `${location.protocol}//${activeChannel.server}/dash/master-${activeChannel.ipAddress}/live.mpd`;
        console.log("=======================", url2, activeChannel.name);
        this.iptvPlayer.attachSource(url2);

        $("#channelTitle").html(activeChannel.name);
        $("#channelCategory").html(activeChannel.category.join(", "));

        if ($("#televisionPlayer").hasClass("fullscreen")) {
          $("#televisionPlayerInfo").show();
          this.timeHideTVControls = setTimeout(() => {
            $("#header").fadeOut(2000);
            $("#televisionPlayerInfo").fadeOut(2000);
          }, 3000);
        }
      }
    },
    renderCursor: function() {
      if (!$("#televisionPage").is(":visible")) {
        return;
      }
      $("#televisionCursor").css({
        transform: `translate(${window.televisionKeyboard.cursorX *
          (152 + 36)}px, ${window.televisionKeyboard.cursorY * (123 + 36)}px)`,
      });

      var televisionOuter = $("#televisionContent").get(0);
      var televisionInner = $("#televisionList").get(0);
      var children = televisionInner.children;
      var child =
        children[
          window.televisionKeyboard.cursorX +
            window.televisionKeyboard.cursorY * this.itemInRow
        ];
      if (child) {
        var top = child.offsetTop;
        var bottom = top + child.clientHeight;
        var outerTop = televisionOuter.scrollTop;
        var outerBottom = outerTop + televisionOuter.clientHeight;
        if (top < outerTop) {
          televisionOuter.scrollTop = top;
        } else if (bottom > outerBottom) {
          televisionOuter.scrollTop = bottom - televisionOuter.clientHeight;
        }

        this.changeSourceIPTV();
      }
    },
    renderChannels: function() {
      if (!$("#televisionPage").is(":visible")) {
        return;
      }
      window.filteredChannels = window.channels;
      var filteredCategories = window.televisionFilterKeyboard.selected;
      if (filteredCategories.length > 0) {
        window.filteredChannels = window.channels.filter(function(item) {
          return filteredCategories.some(function(selectedItem) {
            return item.category.includes(selectedItem);
          });
        });
      }

      $("#televisionTitle").html(
        `<strong>` +
          i18njs.get("TV Channels") +
          `</strong> <span>` +
          window.filteredChannels.length +
          ` of ` +
          window.channels.length +
          `</span>`
      );
      $("#televisionList").empty();
      window.filteredChannels.forEach(function(item, index) {
        $("#televisionList").append(
          `<div class="television-item active">
          <div class="television-item-inner">
            <img alt="" width="152" height="86" src="` +
            item.image +
            `">
          </div>
          <p class="title">` +
            item.name +
            `</p>
        </div>`
        );
      });
    },
    renderCategories: function() {
      if (!$("#televisionPage").is(":visible")) {
        return;
      }
      if (window.televisionFilterKeyboard.selected.length > 0) {
        $("#televisionFilter").html(
          window.televisionFilterKeyboard.selected.join(", ")
        );
      } else {
        $("#televisionFilter").html(i18njs.get("Any category"));
      }
      $("#filterChannels .filter-channels-inner").html(
        `<div class="filter-channels-item` +
          (window.televisionFilterKeyboard.cursor === 0 ? " active" : "") +
          `">
                <div>
                  <div>Any</div>
                  <div class="count">` +
          window.channels.length +
          `</div>
                </div>
              </div>`
      );
      window.channelCategories.forEach(function(item, index) {
        $("#filterChannels .filter-channels-inner").append(
          `<div class="filter-channels-item` +
            (window.televisionFilterKeyboard.cursor === index + 1
              ? " active"
              : "") +
            (window.televisionFilterKeyboard.selected.includes(item)
              ? " selected"
              : "") +
            `">
                <div>
                  <div>
                    <span class="icon">
                      <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                          <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
                      </svg>
                    </span>` +
            item +
            `</div>
                  <div class="count">` +
            window.channelCategoriesCount[item] +
            `</div>
                </div>
              </div>`
        );
      });
    },
  };

  window.TelevisionModule = TelevisionModule;
});
