$(function() {
  var WelcomeModule = {
    handleKeyDown: function(event) {
      if (!$("#welcomePage").is(":visible")) {
        return;
      }
      const keyCode = event.keyCode || event.which;
      console.log("WelcomeModule keyCode", keyCode);
      if (keyCode === keyboard.ENTER) {
        $.router.onhashchange("#/");
      }
    },
  };

  window.WelcomeModule = WelcomeModule;
});
