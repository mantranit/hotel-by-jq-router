$(function() {
  var KeyboardModule = {
    init: function() {
      this.bindEvents();
    },

    bindEvents: function() {
      $(document).on("keydown", this.handleKeyDown);
    },

    handleKeyDown: function(event) {
      event.preventDefault();
      const keyCode = event.keyCode || event.which;
      if ($("#welcome").is(":visible")) {
        if (keyCode === 13) {
          window.location.href = "#/";
        }
      }
    },
  };

  KeyboardModule.init();
});
