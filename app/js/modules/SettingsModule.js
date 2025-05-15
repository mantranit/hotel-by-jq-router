$(function() {
  window.settingsKeyboard = {
    cursor: 0,
  };
  var SettingsModule = {
    handleKeyDown: function(event) {
      const keyCode = event.keyCode || event.which;
      if ($("#settingsPage").is(":visible")) {
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
            window.location.href = "#/settings/language";
          }
          if (window.settingsKeyboard.cursor === 1) {
            window.location.href = "#/settings/parental-lock";
          }
        } else if (window.keyboard.BACK.includes(keyCode)) {
          window.location.href = "#/";
        }

        this.renderOptions();
      }
    },

    renderOptions: function() {
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
