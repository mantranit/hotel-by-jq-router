$(function() {
  window.settingsKeyboard = {
    cursor: 0,
  };
  var SettingsModule = {
    handleKeyDown: function(event) {
      if (!$("#settingsPage").is(":visible")) {
        return;
      }
      const keyCode = event.keyCode || event.which;
      if (keyCode === window.keyboard.TOP) {
        window.settingsKeyboard.cursor = Math.max(
          window.settingsKeyboard.cursor - 1,
          0
        );
      } else if (keyCode === window.keyboard.BOTTOM) {
        window.settingsKeyboard.cursor = Math.min(
          window.settingsKeyboard.cursor + 1,
          1
        );
      } else if (keyCode === window.keyboard.ENTER) {
        if (window.settingsKeyboard.cursor === 0) {
          $.router.onhashchange("#/settings/language");
        }
        if (window.settingsKeyboard.cursor === 1) {
          $.router.onhashchange("#/settings/parental-lock");
        }
      } else if (window.keyboard.BACK.includes(keyCode)) {
        $.router.onhashchange("#/");
      }

      this.renderOptions();
    },

    renderOptions: function() {
      if (!$("#settingsPage").is(":visible")) {
        return;
      }
      const currentLanguage = window.siteLanguages.find(
        (item) => item.code === i18njs.getCurrentLang()
      );
      $("#settingOptionLanguage .setting-option").text(currentLanguage.name);
      if (window.settingsKeyboard.cursor === 0) {
        $("#settingOptionLanguage .setting-option").addClass("active");
        $("#settingOptionParentLock .setting-option").removeClass("active");
      } else {
        $("#settingOptionLanguage .setting-option").removeClass("active");
        $("#settingOptionParentLock .setting-option").addClass("active");
      }
    },
  };

  window.SettingsModule = SettingsModule;
});
