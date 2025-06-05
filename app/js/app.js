import "../scss/app.scss";

import "./modules/LocaleModule";
import "./modules/WelcomeModule";
import "./modules/HomeModule";
import "./modules/TelevisionModule";
import "./modules/ConnectivityModule";
import "./modules/CategoryModule";
import "./modules/WakeUpCallModule";
import "./modules/FeedbackModule";
import "./modules/SettingsModule";
import "./modules/SettingsLanguageModule";

// header
import "./modules/AppModule";

var vm = window.vm || {};
(function($) {
  vm.welcomeVM = function(route, param) {
    window.WelcomeModule.renderPage();
    window.WelcomeModule.renderContent();
    document.body.onkeydown = function(event) {
      window.WelcomeModule.handleKeyDown(event);
    };
  };

  vm.homeVM = function(route, param) {
    window.HomeModule.renderPage();
    window.HomeModule.renderMenu();
    document.body.onkeydown = function(event) {
      window.HomeModule.handleKeyDown(event);
    };
  };

  vm.televisionVM = function(route, param) {
    window.TelevisionModule.renderPage();
    window.TelevisionModule.initIPTVPlayer();
    window.TelevisionModule.renderChannels();
    window.TelevisionModule.renderCursor();
    window.TelevisionModule.renderCategories();
    document.body.onkeydown = function(event) {
      window.TelevisionModule.handleKeyDown(event);
    };
  };

  vm.connectivityVM = function(route, param) {
    window.ConnectivityModule.renderPage();
    window.ConnectivityModule.renderSources();
    document.body.onkeydown = function(event) {
      window.ConnectivityModule.handleKeyDown(event);
    };
  };

  vm.categoryVM = function(route, param) {
    var categoryId = route.split("/").pop();
    window.CategoryModule.renderPage();
    window.CategoryModule.renderCategory(categoryId);
    window.CategoryModule.renderCursor();
    document.body.onkeydown = function(event) {
      window.CategoryModule.handleKeyDown(event);
    };
  };

  vm.productVM = function(route, param) {
    console.log(param);
    $("#categoryName").text(categories[param.categoryId]);
    $("#subCategoryName").text(
      subCategories[param.categoryId][param.subCategoryId]
    );
    $("#btnBack").attr("href", "#/categories/" + param.categoryId);

    $("#products").empty();
    products[param.categoryId][param.subCategoryId].forEach(function(
      item,
      index
    ) {
      var href = $.router.href("productDetail", {
        categoryId: param.categoryId,
        subCategoryId: param.subCategoryId,
        productId: index,
      });

      $("#products").append(
        "<li><a href='" + href + "'>" + item.name + "</a></li>"
      );
    });
  };

  vm.productDetailVM = function(route, param) {
    $("#categoryName").text(categories[param.categoryId]);
    $("#subCategoryName").text(
      subCategories[param.categoryId][param.subCategoryId]
    );
    $("#btnBack").attr(
      "href",
      "#/categories/" +
        param.categoryId +
        "/sub-categories/" +
        param.subCategoryId
    );

    var product =
      products[param.categoryId][param.subCategoryId][param.productId];

    $("#productName").text(product.name);
    $("#price").text(product.price);
    $("#rating").text(product.rating);
  };

  vm.wakeUpCallVM = function(route, param) {
    window.WakeUpCallModule.renderPage();
    window.WakeUpCallModule.renderTrack();
    document.body.onkeydown = function(event) {
      window.WakeUpCallModule.handleKeyDown(event);
    };
  };

  vm.feedbackVM = function(route, param) {
    window.FeedbackModule.renderPage();
    window.FeedbackModule.renderFeedback();
    window.FeedbackModule.scrollTo();
    document.body.onkeydown = function(event) {
      window.FeedbackModule.handleKeyDown(event);
    };
  };

  vm.settingsVM = function(route, param) {
    window.SettingsModule.renderPage();
    window.SettingsModule.renderOptions();
    document.body.onkeydown = function(event) {
      window.SettingsModule.handleKeyDown(event);
    };
  };
  vm.settingsLanguageVM = function(route, param) {
    window.SettingsLanguageModule.renderPage();
    window.SettingsLanguageModule.renderOptions();
    document.body.onkeydown = function(event) {
      window.SettingsLanguageModule.handleKeyDown(event);
    };
  };

  vm.navigateTo = function(hash) {
    $.cookie("hash", hash);
    var categoriesRegex = /categories\/(.+)/;
    var page = hash.split("/").pop();
    if (page === "welcome") {
      vm.welcomeVM();
    } else if (page === "") {
      vm.homeVM();
    } else if (page === "television") {
      vm.televisionVM();
    } else if (page === "connectivity") {
      vm.connectivityVM();
    } else if (categoriesRegex.test(hash)) {
      vm.categoryVM(hash);
    } else if (page === "product") {
      vm.productVM();
    } else if (page === "productDetail") {
      vm.productDetailVM();
    } else if (page === "wake-up-call") {
      vm.wakeUpCallVM();
    } else if (page === "feedback") {
      vm.feedbackVM();
    } else if (page === "settings") {
      vm.settingsVM();
    } else if (page === "settings-language") {
      vm.settingsLanguageVM();
    }
  };

  // $.when($.ready).then(function() {
  //   var hash = $.cookie("hash");
  //   if (!hash) {
  //     hash = "#/welcome";
  //   }
  //   vm.navigateTo(hash);
  // });
})(jQuery);
