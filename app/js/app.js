import "../scss/app.scss";

import "./modules/LocaleModule";
import "./modules/HomeModule";
import "./modules/TelevisionModule";
import "./modules/ConnectivityModule";
import "./modules/KeyboardModule";

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

  routes["store"] = {
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

  routes["categoryDetail"] = {
    url: "#/categories/:categoryId",
    templateUrl: "templates/category.html",
    viewModel: vm["categoryVM"],
  };

  routes["subCategoryDetail"] = {
    url: "#/categories/:categoryId/sub-categories/:subCategoryId",
    templateUrl: "templates/product.html",
    viewModel: vm["productVM"],
  };

  routes["productDetail"] = {
    url:
      "#/categories/:categoryId/sub-categories/:subCategoryId/products/:productId",
    templateUrl: "templates/product-detail.html",
    viewModel: vm["productDetailVM"],
  };

  $.router
    .setData(routes)
    .setDefault(defaultRoute)
    .onRouteChanged(function(e, route, param) {
      route.viewModel(route, param);
    });

  $.when($.ready).then(function() {
    $.router.run("#app", "welcome");
  });
})(jQuery);
