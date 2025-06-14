$(function() {
  window.settingsLanguageKeyboard = {
    cursor: 0,
  };
  var SettingsLanguageModule = {
    handleKeyDown: function(event) {
      if (!$("#settingsLanguagePage").is(":visible")) {
        return;
      }
      const keyCode = event.keyCode || event.which;
      if (keyCode === window.keyboard.TOP) {
        window.settingsLanguageKeyboard.cursor = Math.max(
          window.settingsLanguageKeyboard.cursor - 1,
          0
        );
      } else if (keyCode === window.keyboard.BOTTOM) {
        window.settingsLanguageKeyboard.cursor = Math.min(
          window.settingsLanguageKeyboard.cursor + 1,
          window.siteLanguages.length - 1
        );
      } else if (keyCode === window.keyboard.ENTER) {
        i18njs.setLang(
          window.siteLanguages[window.settingsLanguageKeyboard.cursor].code
        );
        $.router.onhashchange("#/settings");
      } else if (window.keyboard.BACK.includes(keyCode)) {
        $.router.onhashchange("#/settings");
      }

      this.renderOptions();
    },

    renderOptions: function() {
      if (!$("#settingsLanguagePage").is(":visible")) {
        return;
      }
      $("#settingLanguageList").empty();
      window.siteLanguages.forEach((item, index) => {
        $("#settingLanguageList").append(
          `<div class="setting-option-wrapper-language-item">
            <div class="setting-option ` +
            (item.code === i18njs.getCurrentLang() ? "active" : "") +
            `">
                <span>` +
            item.name +
            `</span>
                <span class="icon">
                  <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
                  </svg>
                </span>
            </div>
          </div>`
        );
      });

      $("#settingLanguageCursor").css({
        transform: `translateY(${window.settingsLanguageKeyboard.cursor *
          56}px)`,
      });
    },
  };

  window.SettingsLanguageModule = SettingsLanguageModule;
});
