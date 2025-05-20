import "../scss/app.scss";

import "./modules/KeyboardModule";
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

(function($) {
  var routes = {},
    defaultRoute = "welcome";

  routes["welcome"] = {
    url: "#/welcome",
    templateUrl: "templates/welcome.html",
    viewModel: vm["welcomeVM"],
  };

  routes["home"] = {
    url: "#/",
    templateUrl: "templates/home.html",
    viewModel: vm["homeVM"],
  };

  routes["television"] = {
    url: "#/television",
    templateUrl: "templates/television.html",
    viewModel: vm["televisionVM"],
  };

  routes["connectivity"] = {
    url: "#/connectivity",
    templateUrl: "templates/connectivity.html",
    viewModel: vm["connectivityVM"],
  };

  routes["category"] = {
    url: "#/categories/:categoryId",
    templateUrl: "templates/category.html",
    viewModel: vm["categoryVM"],
  };

  // routes["subCategoryDetail"] = {
  //   url: "#/categories/:categoryId/sub-categories/:subCategoryId",
  //   templateUrl: "templates/product.html",
  //   viewModel: vm["productVM"],
  // };

  // routes["productDetail"] = {
  //   url:
  //     "#/categories/:categoryId/sub-categories/:subCategoryId/products/:productId",
  //   templateUrl: "templates/product-detail.html",
  //   viewModel: vm["productDetailVM"],
  // };

  routes["wakeUpCall"] = {
    url: "#/wake-up-call",
    templateUrl: "templates/wake-up-call.html",
    viewModel: vm["wakeUpCallVM"],
  };

  routes["feedback"] = {
    url: "#/feedback",
    templateUrl: "templates/feedback.html",
    viewModel: vm["feedbackVM"],
  };

  routes["settings"] = {
    url: "#/settings",
    templateUrl: "templates/settings.html",
    viewModel: vm["settingsVM"],
  };

  routes["settings-language"] = {
    url: "#/settings/language",
    templateUrl: "templates/settings-language.html",
    viewModel: vm["settingsLanguageVM"],
  };

  $.router
    .setData(routes)
    .setDefault(defaultRoute)
    .onRouteBeforeChange(function(e, route, params) {
      document.onkeydown = function() {};
    })
    .onRouteChanged(function(e, route, param) {
      route.viewModel(route, param);
    });

  $.when($.ready).then(function() {
    $.router.run("#app", "welcome");
  });
})(jQuery);
