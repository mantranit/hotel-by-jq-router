$(function() {
  var WelcomeModule = {
    handleKeyDown: function(event) {
      if (!$("#welcomePage").is(":visible")) {
        return;
      }
      const keyCode = event.keyCode || event.which;
      if (keyCode === keyboard.ENTER) {
        vm.navigateTo("#/");
      }
    },

    renderContent: function() {
      if (!$("#welcomePage").is(":visible")) {
        return;
      }
      $("#welcomeTitle").html(
        i18njs.get("welcome.Dear") + "<strong>" + "Mr. Tuấn Lê" + "</strong>"
      );
      $("#welcomeBrief").html(i18njs.get("welcome.Brief"));
      $("#welcomeContinue").html(i18njs.get("welcome.Continue"));
    },

    renderPage: function() {
      $("#app").html(`<div id="welcomePage" class="page welcome-page">
  <div class="video-background">
    <div class="flowplayer-embed-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; width:100%;">
      <video muted autoplay loop src="http://103.153.72.195:8080/video/HITEC_Scandic_Video_No_Sound.mp4" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></video>
    </div>
  </div>
  <div class="welcome-wrapper">
    <h1 id="welcomeTitle">DEAR</h1>
    <div class="welcome"><p id="welcomeBrief">Welcome</p></div>
    <div class="button-continue">
      <span class="a" id="welcomeContinue">Continue</span>
    </div>
  </div>
  <div class="right-bottom-buttons-wrapper">
    <div class="right-bottom-buttons">
        <button>
          <div class="icon" style="background-color: #FF0000"></div>
          <div class="text">
            <span id="buttonTelevision">Television</span>
          </div>
        </button>
        <button>
          <div class="icon" style="background-color: #143F7B"></div>
          <div class="text">
            <span id="buttonLanguage">Language</span>
          </div>
        </button>
    </div>
  </div>
  <div class="cover"></div>
</div>`);
    },
  };

  window.WelcomeModule = WelcomeModule;
});
