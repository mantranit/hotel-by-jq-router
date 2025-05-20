/*!
 * jQ-Router JQuery Plugin v4.6.1
 * https://github.com/muzammilkm/jq-router
 *
 * Copyright 2017, Muzammil Khaja Mohammed
 * Licensed under the MIT license.
 * https://github.com/muzammilkm/jq-router/blob/master/LICENSE
 *
 * Date: Sat Mar 2 9:25:00 2019 +0530
 */

(function($, window) {
  var router,
    current = {
      route: {},
      params: {},
    };

  router = (function() {
    var s = {
        routes: {},
      },
      isFirstTime = true,
      defaultRoute,
      expr = {
        Param_Replacer: "([^/]+)",
        Param_Matcher: /:([\w\d]+)/g,
      };

    /**
     * Get current route params
     * @return {object} params
     */
    s.getCurrentParams = function() {
      return current.params;
    };

    /**
     * Get current route
     * @return {object} route
     */
    s.getCurrentRoute = function() {
      return current.route;
    };

    /**
     * Get route by name
     * @param {string} routeName
     * @return {object} route
     */
    s.getRouteName = function(routeName) {
      var s = this;
      return s.routes[routeName];
    };

    /**
     * Get route params
     * @param {object} route
     * @return {object} params
     */
    s.getRouteParams = function(route) {
      var s = this,
        params = {},
        match = route.urlExpr.exec(route.url);

      for (var i = 0; i < route.params.length; i++) {
        params[route.params[i]] = match[i + 1];
      }

      return $.extend({}, s.paramService.getParams(), params);
    };

    /**
     * Navigates to given route name & params
     * @param {string} routeName
     * @param {object} params
     * @return {object} this
     */
    s.go = function(routeName, params) {
      var s = this,
        url = s.href(routeName, params);
      if (url) {
        s.paramService.setParams(params);
        // window.location.assign(url);
        // $("#hashchange").val(url);
        s.onhashchange(url);
      }
      return s;
    };

    /**
     * Get url for given route name & params
     * @param {string} routeName
     * @param {object} params
     * @return {string}
     */
    s.href = function(routeName, params) {
      routeName = routeName || defaultRoute;
      var s = this,
        route = s.routes[routeName];
      if (!route) {
        return;
      }
      return s.paramReplacer(route.relativeUrl, route, params);
    };

    /**
     * Check route params are modified or not
     * @param {string} routeName
     * @param {object} params
     * @return {bool}
     */
    s.isRouteParamChanged = function(routeName, params) {
      var s = this;
      return (
        s.href(routeName, params) !== s.href(routeName, s.getCurrentParams())
      );
    };

    /**
     * Return matched route based on url
     * @param {string} url
     * @return {object} route
     */
    s.match = function(url) {
      var s = this,
        route;
      for (var routeName in s.routes) {
        if (
          !s.routes[routeName].abstract &&
          s.routes[routeName].urlExpr.exec(url) !== null
        ) {
          route = s.routes[routeName];
          break;
        }
      }
      return route;
    };

    /**
     * Listen to url change events & should not be called outside of router.
     * @param {string} hash
     * @return {object} this
     */
    s.onhashchange = function(hash) {
      $.cookie("hash", hash);
      var s = this,
        matchedRoute = s.match(hash),
        matchedParams;

      if (matchedRoute) {
        matchedRoute.previousUrl = current.route.url || hash;
        matchedRoute.url = hash;
        matchedParams = s.getRouteParams(matchedRoute);

        $(window).trigger(s.events.routeMatched, [matchedRoute, matchedParams]);

        s.renderEngine
          .processRoute(matchedRoute, matchedParams)
          .then(function() {
            $(window).trigger(s.events.routeChangeStart, [
              matchedRoute,
              matchedParams,
            ]);
            s.renderEngine.render(matchedRoute, matchedParams);
            current.route = matchedRoute;
            current.params = matchedParams;
            $(window).trigger(s.events.routeChangeSuccess, [
              matchedRoute,
              matchedParams,
            ]);
          });
      } else {
        $(window).trigger(s.events.routeNotMatched, [
          matchedRoute,
          matchedParams,
        ]);
        if (defaultRoute) {
          s.go(defaultRoute);
        }
      }
      return s;
    };

    /**
     * Replace Params for given string with route & params
     * @param {string}
     * @param {object} route
     * @param {object} params
     * @returns {string}
     */
    s.paramReplacer = function(str, route, params) {
      if (!str) {
        return;
      }
      for (var i = 0; i < route.params.length; i++) {
        str = str.replace(":" + route.params[i], params[route.params[i]]);
      }

      return str;
    };

    /**
     * Initialize the router & this should be invoked on document ready.
     * @param {string} viewSelector
     * @param {string} routeName
     * @param {object} params
     * @return {object} this
     */
    s.run = function(viewSelector, routeName, params) {
      var s = this;
      if (isFirstTime) {
        // if (
        //   window.location.pathname.lastIndexOf(".") === -1 &&
        //   window.location.pathname.substr(-1) !== "/"
        // ) {
        //   window.location.pathname = window.location.pathname + "/";
        //   return;
        // }
        s.renderEngine.setViewSelector(viewSelector);
        // $(window).on("hashchange", function() {
        //   s.onhashchange(window.location.hash);
        // });
        var route = s.match($.cookie("hash"));
        if (!route) {
          s.go(routeName, params);
        } else {
          s.onhashchange($.cookie("hash"));
        }
        isFirstTime = false;
      }
      return s;
    };

    /**
     * Set route data by preparing params & expression.
     * @param {object} data
     * @param {bool} isCacheTempalte default to true
     * @return {object} this
     */
    s.setData = function(data, isCacheTempalte) {
      var s = this;

      isCacheTempalte = isCacheTempalte === undefined ? true : isCacheTempalte;
      s.routes = {};
      for (var routeName in data) {
        var segments = routeName.split("."),
          _routeName = [],
          relativeUrl = "",
          urlExpr = "",
          route = (s.routes[routeName] = jQuery.extend(
            true,
            {},
            data[routeName]
          )),
          paramMatch;

        route.name = routeName;
        route.segments = [];
        route.params = [];
        for (var i = 0; i < segments.length; i++) {
          _routeName.push(segments[i]);
          var segment = _routeName.join(".");

          relativeUrl += data[segment].url;
          route.segments.push(segment);
        }

        while ((paramMatch = expr.Param_Matcher.exec(relativeUrl)) !== null) {
          route.params.push(paramMatch[1]);
        }
        urlExpr = new RegExp(
          "^" +
            relativeUrl.replace(expr.Param_Matcher, expr.Param_Replacer) +
            "$"
        );
        route.relativeUrl = relativeUrl;
        route.urlExpr = urlExpr;
        route.cache = route.hasOwnProperty("cache")
          ? route.cache
          : isCacheTempalte;
      }
      return s;
    };

    /**
     * Set default route name, if route is not found will resort to this.
     * @param {string} name
     * @return {object} this
     */
    s.setDefault = function(name) {
      var s = this;
      defaultRoute = name;
      return s;
    };

    return s;
  })();

  $.router = router;
})(jQuery, window);
/*!
 * jQ-Router JQuery Plugin v4.6.1
 * https://github.com/muzammilkm/jq-router
 *
 * Copyright 2017, Muzammil Khaja Mohammed
 * Licensed under the MIT license.
 * https://github.com/muzammilkm/jq-router/blob/master/LICENSE
 *
 * Date: Sat Mar 2 9:25:00 2019 +0530
 */

(function($, window, router) {
  router.events = Object.freeze({
    renderViewSuccess: "jqRouter.renderViewSuccess",
    routeChangeStart: "jqRouter.routeChangeStart",
    routeChangeSuccess: "jqRouter.routeChangeSuccess",
    routeMatched: "jqRouter.routeMatched",
    routeNotMatched: "jqRouter.routeNotsMatched",
    viewDestroyed: "jqRouter.viewDestroyed",
  });

  /**
   * Subscribe route change started event.
   * @param {function} handler
   * @return {object} this
   */
  router.onRouteBeforeChange = function(handler) {
    var s = this;
    $(window).on(s.events.routeChangeStart, handler);
    return s;
  };

  /**
   * Subscribe route change sucess event.
   * @param {function} handler
   * @return {object} this
   */
  router.onRouteChanged = function(handler) {
    var s = this;
    $(window).on(s.events.routeChangeSuccess, handler);
    return s;
  };

  /**
   * Subscribe route matched event.
   * @param {function} handler
   * @return {object} this
   */
  router.onRouteMatched = function(handler) {
    var s = this;
    $(window).on(s.events.routeMatched, handler);
    return s;
  };

  /**
   * Subscribe route not matched event.
   * @param {function} handler
   * @return {object} this
   */
  router.onRouteNotMatched = function(handler) {
    var s = this;
    $(window).on(s.events.routeNotMatched, handler);
    return s;
  };

  /**
   * Subscribe view change event.
   * @param {function} handler
   * @return {object} this
   */
  router.onViewChange = function(handler) {
    var s = this;
    $(window).on(s.events.renderViewSuccess, handler);
    return s;
  };

  /**
   * Subscribe view destroy event.
   * @param {function} handler
   * @return {object} this
   */
  router.onViewDestroyed = function(handler) {
    var s = this;
    $(window).on(s.events.viewDestroyed, handler);
    return s;
  };
})(jQuery, window, $.router);
/*!
 * jQ-Router JQuery Plugin v4.6.1
 * https://github.com/muzammilkm/jq-router
 *
 * Copyright 2017, Muzammil Khaja Mohammed
 * Licensed under the MIT license.
 * https://github.com/muzammilkm/jq-router/blob/master/LICENSE
 *
 * Date: Sat Mar 2 9:25:00 2019 +0530
 */

(function($, router) {
  router.paramService = (function() {
    var s = {},
      params;

    s.setParams = function(p) {
      params = p;
    };

    s.getParams = function() {
      return params;
    };

    return s;
  })();
})(jQuery, $.router);

/*!
 * jQ-Router JQuery Plugin v4.6.1
 * https://github.com/muzammilkm/jq-router
 *
 * Copyright 2017, Muzammil Khaja Mohammed
 * Licensed under the MIT license.
 * https://github.com/muzammilkm/jq-router/blob/master/LICENSE
 *
 * Date: Sat Mar 2 9:25:00 2019 +0530
 */

(function($, router) {
  router.renderEngine = (function() {
    var s = {},
      templateCache = {},
      viewSelector;

    /**
     * Raise view destroy event before rendering the view.
     * @param {string} url
     * @return {object} renderEngine
     */
    s.clean = function(segments, till) {
      var s = this;
      for (var i = segments.length - 1; i >= till; i--) {
        var _route = router.getRouteName(segments[i]);
        $(window).trigger(router.events.viewDestroyed, [_route]);
      }
      return s;
    };

    /**
     * Download the template from server via ajax call.
     * @param {string} url
     * @param {bool} cache
     * @return {object} deferred
     */
    s.getViewTemplate = function(url, templateUrl, cache) {
      // return $.ajax({
      //   type: "GET",
      //   url: url,
      //   cache: cache,
      //   dataType: "html",
      // }).then(function(content) {
      //   templateCache[templateUrl] = content;
      // });
      if (templateUrl === "templates/welcome.html") {
        templateCache[
          templateUrl
        ] = `<div id="welcomePage" class="page welcome-page">
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
</div>`;
        return;
      }
      if (templateUrl === "templates/home.html") {
        templateCache[templateUrl] = `<div id="homePage" class="page home-page">
  <div class="video-background">
    <div class="flowplayer-embed-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; width:100%;">
      <video muted autoplay loop src="http://103.153.72.195:8080/video/HITEC_Scandic_Video_No_Sound.mp4" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></video>
    </div>
    <div class="overlay" style="background: url(assets/images/icons/shadow.png);"></div>
  </div>
  <div class="menu-container">
    <div class="navigate back" id="btnArrowLeft">
      <svg
        id="btn_arrow_left"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 24 40"
      >
        <path
          fillRule="nonzero"
          stroke="none"
          d="M19.651 0L23 3.408 6.66 20 23 36.63 19.688 40 1.693 21.685 0 20l1.693-1.685z"
        />
      </svg>
    </div>
    <div class="navigate next" id="btnArrowRight">
      <svg
        id="btn_arrow_right"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 24 40"
      >
        <path
          fillRule="nonzero"
          stroke="none"
          d="M3.494 0L0 3.408 17.05 20 0 36.63 3.456 40l18.778-18.315L24 20l-1.766-1.685z"
        />
      </svg>
    </div>
    <div class="menu-wrapper">
      <div class="menu-cursor" id="menuCursor" style="transform: translate(0px, 0px);">
        <div>&nbsp;</div>
      </div>
      <div class="menu-scroller" id="menuScroller" style="transform: translateX(0px);">
        <div class="menu-item" style="flex-basis: 236px; height: 236px;">
          <div class="a">
            <div class="icon"><svg id="icon-tv" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 130 130">
              <g fillrule="nonzero">
                <path d="M19 23v58.66h92V23H19zm3.68 3.666h84.64v51.327H22.68V26.666zm16.215 58.66a1.847 1.847 0 0 0-1.668 2.005 1.85 1.85 0 0 0 2.013 1.661h51.52a1.852 1.852 0 0 0 1.617-.91c.33-.572.33-1.274 0-1.847a1.852 1.852 0 0 0-1.617-.91H38.895z"></path>
              </g>
            </svg></div>
            <div class="text">
              <span>Television</span>
            </div>
          </div>
        </div>
      </div>
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
</div>`;
        return;
      }
      if (templateUrl === "templates/television.html") {
        templateCache[
          templateUrl
        ] = `<div id="televisionPage" class="page television-page">
  <div class="television-wrapper">
    <div class="television-container">
      <div class="television-left">
        <div class="television-header">
          <div class="television-title" id="televisionTitle"><strong>TV Channels </strong><span>19 of 19</span></div>
          <div class="television-filters">
            <div class="television-filter-category" id="televisionFilter">Any category</div>
          </div>
        </div>
        <div class="television-left-content" id="televisionContent">
          <div class="television-cursor" id="televisionCursor"></div>
          <div class="television-list" id="televisionList">
            <div class="television-item active">
              <div class="television-item-inner" style="width: 152px; height: 86px;"><img alt="" width="152" height="86" src="http://103.153.72.195:8080/channellist/icon/BBC_World_News.png"></div>
              <p class="title">BBC WORLD NEWS</p>
            </div>
          </div>
        </div>
      </div>
      <div class="television-right">
        <div class="television-right-header">
          <div class="television-header">
            <div class="television-title"><strong>&nbsp;</strong></div>
          </div>
          <div class="television-right-content">
            <div class="television-player not-fullscreen" id="televisionPlayer">
              <div class="television-player-header"></div>
              <div class="television-react-player">
                <video class="video-js" id="iptv-video" style="width: 100%; height: 100%"></video>
              </div>
              <div class="television-player-info" id="televisionPlayerInfo">
                <div class="channel-title" id="channelTitle">1. BBC WORLD NEWS</div>
                <div class="channel-category" id="channelCategory">News, Drama</div>
                <div class="television-control">
                  <div class="television-control-content">
                     <button>
                        <span class="icon">
                           <svg id="btn_back" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                              <g fill-rule="evenodd">
                                 <path fill-rule="nonzero" d="M16.553 19H8.9c-.587 0-1.063-.452-1.063-1.01s.476-1.01 1.063-1.01h7.654c2.936 0 5.316-2.261 5.316-5.05 0-2.789-2.38-5.05-5.316-5.05H3.594l3.094 2.98c.36.4.337.998-.056 1.37a1.104 1.104 0 0 1-1.443.054L.309 6.587a.975.975 0 0 1 0-1.424L5.252.467c.237-.353.678-.53 1.11-.447.43.084.763.412.835.824a.993.993 0 0 1-.51 1.037L3.595 4.86h12.97c4.11.003 7.439 3.17 7.436 7.075-.003 3.905-3.337 7.068-7.447 7.065z"></path>
                              </g>
                           </svg>
                        </span>
                        Back
                     </button>
                     <button>
                        <span class="icon icon-double">
                           <svg id="btn_volume" xmlns="http://www.w3.org/2000/svg">
                              <g fill-rule="evenodd">
                                 <rect width="22" height="22" x="30" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
                                 <rect width="22" height="22" x="1" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
                                 <text font-family="ArialMT, Arial" font-size="20">
                                    <tspan x="6" y="19">+</tspan>
                                 </text>
                                 <text font-family="ArialMT, Arial" font-size="20">
                                    <tspan x="35" y="19">−</tspan>
                                 </text>
                              </g>
                           </svg>
                        </span>
                        Volume
                     </button>
                     <button>
                        <span class="icon icon-double">
                           <svg id="btn_channel" xmlns="http://www.w3.org/2000/svg">
                              <g fill-rule="evenodd">
                                 <rect width="22" height="22" x="30" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
                                 <path d="M12 9l4 5H8zM41 15l4-5h-8z"></path>
                                 <rect width="22" height="22" x="1" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
                              </g>
                           </svg>
                        </span>
                        Channels
                     </button>
                  </div>
               </div>
              </div>
            </div>
            <div class="filter-channels" id="filterChannels" style="display: none;">
              <div class="filter-channels-content">
                 <div class="filter-channels-inner">
                    <div class="filter-channels-item selected active">
                       <div>
                          <div>Any</div>
                          <div class="count">19</div>
                       </div>
                    </div>
                    <div class="filter-channels-item  ">
                       <div>
                          <div>Culture</div>
                          <div class="count">1</div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
 </div>
  <div class="left-bottom-buttons-wrapper">
     <div class="left-bottom-buttons">
        <button>
           <span class="icon">
              <svg id="btn_back" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                 <g fill-rule="evenodd">
                    <path fill-rule="nonzero" d="M16.553 19H8.9c-.587 0-1.063-.452-1.063-1.01s.476-1.01 1.063-1.01h7.654c2.936 0 5.316-2.261 5.316-5.05 0-2.789-2.38-5.05-5.316-5.05H3.594l3.094 2.98c.36.4.337.998-.056 1.37a1.104 1.104 0 0 1-1.443.054L.309 6.587a.975.975 0 0 1 0-1.424L5.252.467c.237-.353.678-.53 1.11-.447.43.084.763.412.835.824a.993.993 0 0 1-.51 1.037L3.595 4.86h12.97c4.11.003 7.439 3.17 7.436 7.075-.003 3.905-3.337 7.068-7.447 7.065z"></path>
                 </g>
              </svg>
           </span>
           <span>Back</span>
        </button>
        <button>
           <span class="icon">
              <svg id="btn_navigate" xmlns="http://www.w3.org/2000/svg">
                 <g fill-rule="evenodd">
                    <path stroke="none" fill-rule="nonzero" d="M20.8 16.043V9.949c0-.15.076-.286.199-.357a.35.35 0 0 1 .411.017l4.407 3.039a.39.39 0 0 1 .183.35.416.416 0 0 1-.183.358l-4.407 3.029a.435.435 0 0 1-.212.081.295.295 0 0 1-.2-.064.408.408 0 0 1-.198-.36zM5.2 9.949a.408.408 0 0 0-.199-.357.35.35 0 0 0-.411.017L.183 12.648a.39.39 0 0 0-.183.35.416.416 0 0 0 .183.358l4.407 3.029a.435.435 0 0 0 .212.081.295.295 0 0 0 .2-.064c.123-.07.2-.21.198-.36V9.95zM16.051 20.8c.15 0 .286.076.357.199a.35.35 0 0 1-.017.411l-3.039 4.407a.39.39 0 0 1-.35.183.416.416 0 0 1-.358-.183L9.615 21.41a.435.435 0 0 1-.081-.212.295.295 0 0 1 .064-.2c.07-.123.21-.2.36-.198h6.093zM16.051 5.2a.408.408 0 0 0 .357-.199.35.35 0 0 0-.017-.411L13.352.183a.39.39 0 0 0-.35-.183.416.416 0 0 0-.358.183L9.615 4.59a.435.435 0 0 0-.081.212.295.295 0 0 0 .064.2c.07.123.21.2.36.198h6.093z"></path>
                    <circle stroke="none" cx="13" cy="13" r="4.333"></circle>
                 </g>
              </svg>
           </span>
           <span>Navigation</span>
        </button>
        <button>
           <span class="icon">
              <svg id="btn_ok" xmlns="http://www.w3.org/2000/svg">
                 <g fill-rule="evenodd">
                    <rect width="26" height="22" x="1" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
                    <path fill-rule="nonzero" d="M9.665 8C7.438 8 6 9.541 6 11.927 6 14.401 7.442 16 9.673 16c2.232 0 3.674-1.592 3.674-4.055C13.347 9.55 11.902 8 9.665 8zm5.294 0v8h1.837v-2.989l.581-.594L19.857 16H22l-3.369-4.867L21.694 8H19.55l-2.755 2.82V8h-1.837zM9.663 9.846c1.157 0 1.847.8 1.847 2.14 0 1.337-.7 2.168-1.827 2.168-1.156 0-1.846-.81-1.846-2.168 0-.502.132-2.14 1.826-2.14z"></path>
                 </g>
              </svg>
           </span>
           <span>Watch</span>
        </button>
     </div>
  </div>
  <div class="right-bottom-buttons-wrapper">
    <div class="right-bottom-buttons">
      <button>
        <div class="icon" style="background-color: rgb(231, 191, 17);"></div>
        <div class="text"><span>Category</span></div>
      </button>
    </div>
  </div>
</div>`;
        return;
      }
      if (templateUrl === "templates/connectivity.html") {
        templateCache[
          templateUrl
        ] = `<div id="connectivityPage" class="page connectivity-page">
  <div class="site-page-wrapper connectivity-wrapper">
     <h2 class="site-page-title">Connect My Device</h2>
     <div class="site-page-content ">
        <div class="connectivity-content">
           <div class="connectivity-cursor" id="connectivityCursor" style="width: 404px; height: 94px; transform: translate(0px, 110px);"></div>
           <ul class="connectivity-list" id="connectivityList">
              <li class="connectivity-item"><i class="sources-icon-androidwindows"></i><span>Screen Sharing</span></li>
              <li class="connectivity-item"><i class="sources-icon-settings_bluetooth"></i><span>Bluetooth</span></li>
              <li class="connectivity-item"><i class="sources-icon-usb"></i><span>USB</span></li>
              <li class="connectivity-item"><i class="sources-icon-settings_input_hdmi"></i><span>Sources List</span></li>
              <li class="connectivity-item"><i class="sources-icon-airplay"></i><span>Apple TV</span></li>
              <li class="connectivity-item"><i class="sources-icon-cast"></i><span>ChromeCast</span></li>
           </ul>
        </div>
     </div>
  </div>
  <div class="site-modal site-alert" id="connectivityAlert" style="display: none;">
    <div class="site-modal-inner">
       <h3 class="site-modal-title">USB</h3>
       <div class="site-alert-icon">
          <svg id="dialog_alert" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
             <path fill-rule="nonzero" d="M50 0C22.413 0 0 22.413 0 50s22.413 50 50 50 50-22.413 50-50S77.587 0 50 0zm0 4.545C75.13 4.545 95.455 24.87 95.455 50c0 25.13-20.324 45.455-45.455 45.455C24.87 95.455 4.545 75.13 4.545 50 4.545 24.87 24.87 4.545 50 4.545zM31.796 29.523a2.273 2.273 0 0 0-1.585 3.902L46.786 50 30.211 66.575a2.273 2.273 0 1 0 3.214 3.214L50 53.214l16.575 16.575a2.273 2.273 0 1 0 3.214-3.214L53.214 50l16.575-16.575a2.273 2.273 0 1 0-3.214-3.214L50 46.786 33.425 30.211a2.273 2.273 0 0 0-1.629-.688z"></path>
          </svg>
       </div>
       <p class="intro">Open USB Browser</p>
       <div class="modal-action"><button type="button" class="site-button site-button--active ">OK</button></div>
    </div>
 </div>
  <div class="left-bottom-buttons-wrapper">
     <div class="left-bottom-buttons">
        <button>
           <span class="icon">
              <svg id="btn_back" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                 <g fill-rule="evenodd">
                    <path fill-rule="nonzero" d="M16.553 19H8.9c-.587 0-1.063-.452-1.063-1.01s.476-1.01 1.063-1.01h7.654c2.936 0 5.316-2.261 5.316-5.05 0-2.789-2.38-5.05-5.316-5.05H3.594l3.094 2.98c.36.4.337.998-.056 1.37a1.104 1.104 0 0 1-1.443.054L.309 6.587a.975.975 0 0 1 0-1.424L5.252.467c.237-.353.678-.53 1.11-.447.43.084.763.412.835.824a.993.993 0 0 1-.51 1.037L3.595 4.86h12.97c4.11.003 7.439 3.17 7.436 7.075-.003 3.905-3.337 7.068-7.447 7.065z"></path>
                 </g>
              </svg>
           </span>
           Back
        </button>
        <button>
           <span class="icon">
              <svg id="btn_navigate" xmlns="http://www.w3.org/2000/svg">
                 <g fill-rule="evenodd">
                    <path stroke="none" fill-rule="nonzero" d="M20.8 16.043V9.949c0-.15.076-.286.199-.357a.35.35 0 0 1 .411.017l4.407 3.039a.39.39 0 0 1 .183.35.416.416 0 0 1-.183.358l-4.407 3.029a.435.435 0 0 1-.212.081.295.295 0 0 1-.2-.064.408.408 0 0 1-.198-.36zM5.2 9.949a.408.408 0 0 0-.199-.357.35.35 0 0 0-.411.017L.183 12.648a.39.39 0 0 0-.183.35.416.416 0 0 0 .183.358l4.407 3.029a.435.435 0 0 0 .212.081.295.295 0 0 0 .2-.064c.123-.07.2-.21.198-.36V9.95zM16.051 20.8c.15 0 .286.076.357.199a.35.35 0 0 1-.017.411l-3.039 4.407a.39.39 0 0 1-.35.183.416.416 0 0 1-.358-.183L9.615 21.41a.435.435 0 0 1-.081-.212.295.295 0 0 1 .064-.2c.07-.123.21-.2.36-.198h6.093zM16.051 5.2a.408.408 0 0 0 .357-.199.35.35 0 0 0-.017-.411L13.352.183a.39.39 0 0 0-.35-.183.416.416 0 0 0-.358.183L9.615 4.59a.435.435 0 0 0-.081.212.295.295 0 0 0 .064.2c.07.123.21.2.36.198h6.093z"></path>
                    <circle stroke="none" cx="13" cy="13" r="4.333"></circle>
                 </g>
              </svg>
           </span>
           Navigation
        </button>
     </div>
  </div>
  <div class="right-bottom-buttons-wrapper">
     <div class="right-bottom-buttons">
        <button>
           <div class="icon" style="background-color: rgb(255, 0, 0);"></div>
           <div class="text"><span>Television</span></div>
        </button>
        <button>
           <div class="icon" style="background-color: rgb(20, 63, 123);"></div>
           <div class="text"><span>Language</span></div>
        </button>
     </div>
  </div>
</div>`;
        return;
      }
      if (templateUrl === "templates/category.html") {
        templateCache[
          templateUrl
        ] = `<div id="categoryPage" class="page category-page">
  <div class="site-page-wrapper category-wrapper">
    <h2 class="site-page-title" id="categoryTitle">Dining</h2>
    <div class="site-page-content ">
      <div class="category-content" id="categoryContent">
        <div class="category-cursor" id="categoryCursor"></div>
        <div class="category-list category" id="categoryList">
          <div class="category-item">
            <div class="category-item-inner" style="width: 390px; height: 158px;">
              <img alt="" width="390" height="158" src="http://103.153.72.195:8080/c/i/65779f4293008bc9191a6a6b27a4d1f1.jpg">
              <div class="brief">
                <p class="title">Breakfasts</p>
                <p class="time">07:00-11:00</p>
              </div>
            </div>
          </div>
          <div class="category-item">
            <div class="category-item-inner" style="width: 390px; height: 158px;">
              <img alt="" width="390" height="158" src="http://103.153.72.195:8080/c/i/e4810e983e79f0481a27a6d0355ca16d.jpg">
              <div class="brief">
                <p class="title">Starters</p>
                <p class="time">07:00-23:00</p>
              </div>
            </div>
          </div>
          <div class="category-item">
            <div class="category-item-inner" style="width: 390px; height: 158px;">
              <img alt="" width="390" height="158" src="http://103.153.72.195:8080/c/i/e91ab8d57beecff16499268c3ee5f7cd.jpg">
              <div class="brief">
                <p class="title">Salads</p>
                <p class="time">07:00-23:00</p>
              </div>
            </div>
          </div>
          <div class="category-item">
            <div class="category-item-inner" style="width: 390px; height: 158px;">
              <img alt="" width="390" height="158" src="http://103.153.72.195:8080/c/i/42ce7e8e9f153fbb4c9c333c0194af65.jpg">
              <div class="brief">
                <p class="title">Soups</p>
                <p class="time">10:00-20:00</p>
              </div>
            </div>
          </div>
          <div class="category-item">
            <div class="category-item-inner" style="width: 390px; height: 158px;">
              <img alt="" width="390" height="158" src="http://103.153.72.195:8080/c/i/009808affb6c6322dee201c0dc5739d5.jpg">
              <div class="brief">
                <p class="title">Mains</p>
                <p class="time">10:00-23:00</p>
              </div>
            </div>
          </div>
          <div class="category-item">
            <div class="category-item-inner" style="width: 390px; height: 158px;">
              <img alt="" width="390" height="158" src="http://103.153.72.195:8080/c/i/e2ae3e583ed772713686864079fb6281.jpg">
              <div class="brief">
                <p class="title">Desserts</p>
                <p class="time">24 hours</p>
              </div>
            </div>
          </div>
          <div class="category-item">
            <div class="category-item-inner" style="width: 390px; height: 158px;">
              <img alt="" width="390" height="158" src="http://103.153.72.195:8080/c/i/e6d40d613e7995c63af20a358ae58ffe.jpg">
              <div class="brief">
                <p class="title">Drinks</p>
                <p class="time">24 hours</p>
              </div>
            </div>
          </div>
          <div class="category-item">
            <div class="category-item-inner" style="width: 390px; height: 158px;">
              <img alt="" width="390" height="158" src="http://103.153.72.195:8080/c/i/1a54f71a6a81c8a836b50f6b80b8470d.jpg">
              <div class="brief">
                <p class="title">Hot Drinks</p>
                <p class="time">24 hours</p>
              </div>
            </div>
          </div>
          <div class="category-item">
            <div class="category-item-inner" style="width: 390px; height: 158px;">
              <img alt="" width="390" height="158" src="http://103.153.72.195:8080/c/i/e03c22b7d4f2e6df5821c7d3d1fd2c29.jpg">
              <div class="brief">
                <p class="title">Alcohol</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="left-bottom-buttons-wrapper">
    <div class="left-bottom-buttons">
      <button>
        <span class="icon">
          <svg id="btn_back" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <g fill-rule="evenodd">
              <path fill-rule="nonzero" d="M16.553 19H8.9c-.587 0-1.063-.452-1.063-1.01s.476-1.01 1.063-1.01h7.654c2.936 0 5.316-2.261 5.316-5.05 0-2.789-2.38-5.05-5.316-5.05H3.594l3.094 2.98c.36.4.337.998-.056 1.37a1.104 1.104 0 0 1-1.443.054L.309 6.587a.975.975 0 0 1 0-1.424L5.252.467c.237-.353.678-.53 1.11-.447.43.084.763.412.835.824a.993.993 0 0 1-.51 1.037L3.595 4.86h12.97c4.11.003 7.439 3.17 7.436 7.075-.003 3.905-3.337 7.068-7.447 7.065z"></path>
            </g>
          </svg>
        </span>
        Back
      </button>
      <button>
        <span class="icon">
          <svg id="btn_navigate" xmlns="http://www.w3.org/2000/svg">
            <g fill-rule="evenodd">
              <path stroke="none" fill-rule="nonzero" d="M20.8 16.043V9.949c0-.15.076-.286.199-.357a.35.35 0 0 1 .411.017l4.407 3.039a.39.39 0 0 1 .183.35.416.416 0 0 1-.183.358l-4.407 3.029a.435.435 0 0 1-.212.081.295.295 0 0 1-.2-.064.408.408 0 0 1-.198-.36zM5.2 9.949a.408.408 0 0 0-.199-.357.35.35 0 0 0-.411.017L.183 12.648a.39.39 0 0 0-.183.35.416.416 0 0 0 .183.358l4.407 3.029a.435.435 0 0 0 .212.081.295.295 0 0 0 .2-.064c.123-.07.2-.21.198-.36V9.95zM16.051 20.8c.15 0 .286.076.357.199a.35.35 0 0 1-.017.411l-3.039 4.407a.39.39 0 0 1-.35.183.416.416 0 0 1-.358-.183L9.615 21.41a.435.435 0 0 1-.081-.212.295.295 0 0 1 .064-.2c.07-.123.21-.2.36-.198h6.093zM16.051 5.2a.408.408 0 0 0 .357-.199.35.35 0 0 0-.017-.411L13.352.183a.39.39 0 0 0-.35-.183.416.416 0 0 0-.358.183L9.615 4.59a.435.435 0 0 0-.081.212.295.295 0 0 0 .064.2c.07.123.21.2.36.198h6.093z"></path>
              <circle stroke="none" cx="13" cy="13" r="4.333"></circle>
            </g>
          </svg>
        </span>
        Navigation
      </button>
    </div>
  </div>
  <div class="right-bottom-buttons-wrapper">
    <div class="right-bottom-buttons">
      <button>
        <div class="icon" style="background-color: rgb(255, 0, 0);"></div>
        <div class="text"><span>Television</span></div>
      </button>
      <button>
        <div class="icon" style="background-color: rgb(20, 63, 123);"></div>
        <div class="text"><span>Language</span></div>
      </button>
    </div>
  </div>
</div>`;
        return;
      }
      if (templateUrl === "templates/wake-up-call.html") {
        templateCache[
          templateUrl
        ] = `<div id="wakeUpCallPage" class="page wake-up-call-page">
  <div class="wake-up-call-background" id="wakeUpCallBackground" style="background-image: url('assets/images/wakeup/image/01.jpg');">
    <audio src="assets/images/wakeup/audio/01.mp3" autoplay=""></audio>
  </div>
  <div class="site-page-wrapper wake-up-call-wrapper">
    <h2 class="site-page-title">Wake-up Call</h2>
    <div class="site-page-content ">
      <div class="wake-up-call-content">
        <div class="wake-up-call-content-inner" id="wakeUpCallContent">
          <div class="wake-up-call-option active ">
            <span>Inspiration Morning</span>
            <span class="wake-up-call-option-icon">
              <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
              </svg>
            </span>
          </div>
          <div class="wake-up-call-option  selected">
            <span>Birds in a Forest</span>
            <span class="wake-up-call-option-icon">
              <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
              </svg>
            </span>
          </div>
          <div class="wake-up-call-option  ">
            <span>Morning Touch</span>
            <span class="wake-up-call-option-icon">
              <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
              </svg>
            </span>
          </div>
          <div class="wake-up-call-option  ">
            <span>Brand New Day</span>
            <span class="wake-up-call-option-icon">
              <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
              </svg>
            </span>
          </div>
          <div class="wake-up-call-option  ">
            <span>Summer Jump</span>
            <span class="wake-up-call-option-icon">
              <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
              </svg>
            </span>
          </div>
        </div>
        <div class="wake-up-call-button"><button id="wakeUpCallSelectTime" type="button" class="site-button  ">Select time</button></div>
      </div>
    </div>
  </div>
  <div class="left-bottom-buttons-wrapper">
    <div class="left-bottom-buttons">
      <button>
        <span class="icon">
          <svg id="btn_back" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <g fill-rule="evenodd">
              <path fill-rule="nonzero" d="M16.553 19H8.9c-.587 0-1.063-.452-1.063-1.01s.476-1.01 1.063-1.01h7.654c2.936 0 5.316-2.261 5.316-5.05 0-2.789-2.38-5.05-5.316-5.05H3.594l3.094 2.98c.36.4.337.998-.056 1.37a1.104 1.104 0 0 1-1.443.054L.309 6.587a.975.975 0 0 1 0-1.424L5.252.467c.237-.353.678-.53 1.11-.447.43.084.763.412.835.824a.993.993 0 0 1-.51 1.037L3.595 4.86h12.97c4.11.003 7.439 3.17 7.436 7.075-.003 3.905-3.337 7.068-7.447 7.065z"></path>
            </g>
          </svg>
        </span>
        Back
      </button>
      <button>
        <span class="icon icon-double">
          <svg id="btn_channel" xmlns="http://www.w3.org/2000/svg">
            <g fill-rule="evenodd">
              <rect width="22" height="22" x="30" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
              <path d="M12 9l4 5H8zM41 15l4-5h-8z"></path>
              <rect width="22" height="22" x="1" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
            </g>
          </svg>
        </span>
        Select
      </button>
      <button>
        <span class="icon">
          <svg id="btn_ok" xmlns="http://www.w3.org/2000/svg">
            <g fill-rule="evenodd">
              <rect width="26" height="22" x="1" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
              <path fill-rule="nonzero" d="M9.665 8C7.438 8 6 9.541 6 11.927 6 14.401 7.442 16 9.673 16c2.232 0 3.674-1.592 3.674-4.055C13.347 9.55 11.902 8 9.665 8zm5.294 0v8h1.837v-2.989l.581-.594L19.857 16H22l-3.369-4.867L21.694 8H19.55l-2.755 2.82V8h-1.837zM9.663 9.846c1.157 0 1.847.8 1.847 2.14 0 1.337-.7 2.168-1.827 2.168-1.156 0-1.846-.81-1.846-2.168 0-.502.132-2.14 1.826-2.14z"></path>
            </g>
          </svg>
        </span>
        Confirm
      </button>
    </div>
  </div>
  <div class="right-bottom-buttons-wrapper">
    <div class="right-bottom-buttons">
      <button>
        <div class="icon" style="background-color: rgb(255, 0, 0);"></div>
        <div class="text"><span>Television</span></div>
      </button>
      <button>
        <div class="icon" style="background-color: rgb(20, 63, 123);"></div>
        <div class="text"><span>Language</span></div>
      </button>
    </div>
  </div>
</div>`;
        return;
      }
      if (templateUrl === "templates/feedback.html") {
        templateCache[
          templateUrl
        ] = `<div id="feedbackPage" class="page feedback-page">
  <div class="site-page-wrapper feedback-wrapper">
    <h2 class="site-page-title">Feedback form</h2>
    <div class="site-page-content ">
      <div class="feedback-content" id="feedbackContent">
        <div class="feedback-content-inner" id="feedbackContentInner">
          <div class="feedback-option-wrapper active">
            <div class="feedback-option-name">Atmosphere</div>
            <div class="feedback-option-star">
              <span class="icons8-star"></span><span class="icons8-star"></span><span class="icons8-star"></span><span class="icons8-star"></span><span class="icons8-star"></span>
              <div class="feedback-option-star-cursor" style="transform: translate(0px, 0px);"></div>
            </div>
          </div>
          <div class="feedback-option-wrapper ">
            <div class="feedback-option-name">Why did you choose us?</div>
            <div class="feedback-option-select-wrapper">
              <div class="feedback-option-select">
                <div class="feedback-option-select-item"><span>Location</span></div>
                <div class="feedback-option-select-item"><span>Price</span></div>
                <div class="feedback-option-select-item"><span>Recommendations</span></div>
                <div class="feedback-option-select-cursor" style="transform: translate(0px, 0px); opacity: 0;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="feedback-button"><button id="feedbackSubmit" type="button" class="site-button  ">Send</button></div>
    </div>
  </div>
  <div class="site-modal site-alert" id="feedbackAlert" style="display: none;">
    <div class="site-modal-inner">
      <div class="site-alert-icon">
        <svg id="dialog_success" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 20">
          <path d="M19.293 5.293l-10.293 10.293-4.293-4.293c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414l5 5c0.391 0.391 1.024 0.391 1.414 0l11-11c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0z"></path>
        </svg>
      </div>
      <p>Feedback sent. Thank you.</p>
      <div class="modal-action"><button type="button" class="site-button site-button--active ">OK</button></div>
    </div>
  </div>
  <div class="left-bottom-buttons-wrapper">
    <div class="left-bottom-buttons">
      <button>
        <span class="icon">
          <svg id="btn_back" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <g fill-rule="evenodd">
              <path fill-rule="nonzero" d="M16.553 19H8.9c-.587 0-1.063-.452-1.063-1.01s.476-1.01 1.063-1.01h7.654c2.936 0 5.316-2.261 5.316-5.05 0-2.789-2.38-5.05-5.316-5.05H3.594l3.094 2.98c.36.4.337.998-.056 1.37a1.104 1.104 0 0 1-1.443.054L.309 6.587a.975.975 0 0 1 0-1.424L5.252.467c.237-.353.678-.53 1.11-.447.43.084.763.412.835.824a.993.993 0 0 1-.51 1.037L3.595 4.86h12.97c4.11.003 7.439 3.17 7.436 7.075-.003 3.905-3.337 7.068-7.447 7.065z"></path>
            </g>
          </svg>
        </span>
        Back
      </button>
      <button>
        <span class="icon icon-double">
          <svg id="btn_channel" xmlns="http://www.w3.org/2000/svg">
            <g fill-rule="evenodd">
              <rect width="22" height="22" x="30" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
              <path d="M12 9l4 5H8zM41 15l4-5h-8z"></path>
              <rect width="22" height="22" x="1" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
            </g>
          </svg>
        </span>
        Select
      </button>
      <button>
        <span class="icon">
          <svg id="btn_ok" xmlns="http://www.w3.org/2000/svg">
            <g fill-rule="evenodd">
              <rect width="26" height="22" x="1" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
              <path fill-rule="nonzero" d="M9.665 8C7.438 8 6 9.541 6 11.927 6 14.401 7.442 16 9.673 16c2.232 0 3.674-1.592 3.674-4.055C13.347 9.55 11.902 8 9.665 8zm5.294 0v8h1.837v-2.989l.581-.594L19.857 16H22l-3.369-4.867L21.694 8H19.55l-2.755 2.82V8h-1.837zM9.663 9.846c1.157 0 1.847.8 1.847 2.14 0 1.337-.7 2.168-1.827 2.168-1.156 0-1.846-.81-1.846-2.168 0-.502.132-2.14 1.826-2.14z"></path>
            </g>
          </svg>
        </span>
        Confirm
      </button>
    </div>
  </div>
  <div class="right-bottom-buttons-wrapper">
    <div class="right-bottom-buttons">
      <button>
        <div class="icon" style="background-color: rgb(255, 0, 0);"></div>
        <div class="text"><span>Television</span></div>
      </button>
      <button>
        <div class="icon" style="background-color: rgb(20, 63, 123);"></div>
        <div class="text"><span>Language</span></div>
      </button>
    </div>
  </div>
</div>`;
        return;
      }
      if (templateUrl === "templates/settings.html") {
        templateCache[
          templateUrl
        ] = `<div id="settingsPage" class="page settings-page">
  <div class="site-page-wrapper settings-wrapper">
     <h2 class="site-page-title">Settings</h2>
     <div class="site-page-content ">
        <div class="settings-content">
           <div class="settings-content-inner">
              <div class="setting-option-wrapper" id="settingOptionLanguage">
                 <label class="setting-option-label">Application Language</label>
                 <div class="setting-option setting-option--language ">English</div>
              </div>
              <div class="setting-option-wrapper" id="settingOptionParentLock">
                 <label class="setting-option-label">Parental Lock</label>
                 <div class="setting-option setting-option--lock active">Disabled</div>
              </div>
           </div>
        </div>
     </div>
  </div>
  <div class="left-bottom-buttons-wrapper">
     <div class="left-bottom-buttons">
        <button>
           <span class="icon">
              <svg id="btn_back" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                 <g fill-rule="evenodd">
                    <path fill-rule="nonzero" d="M16.553 19H8.9c-.587 0-1.063-.452-1.063-1.01s.476-1.01 1.063-1.01h7.654c2.936 0 5.316-2.261 5.316-5.05 0-2.789-2.38-5.05-5.316-5.05H3.594l3.094 2.98c.36.4.337.998-.056 1.37a1.104 1.104 0 0 1-1.443.054L.309 6.587a.975.975 0 0 1 0-1.424L5.252.467c.237-.353.678-.53 1.11-.447.43.084.763.412.835.824a.993.993 0 0 1-.51 1.037L3.595 4.86h12.97c4.11.003 7.439 3.17 7.436 7.075-.003 3.905-3.337 7.068-7.447 7.065z"></path>
                 </g>
              </svg>
           </span>
           Back
        </button>
        <button>
           <span class="icon">
              <svg id="btn_navigate" xmlns="http://www.w3.org/2000/svg">
                 <g fill-rule="evenodd">
                    <path stroke="none" fill-rule="nonzero" d="M20.8 16.043V9.949c0-.15.076-.286.199-.357a.35.35 0 0 1 .411.017l4.407 3.039a.39.39 0 0 1 .183.35.416.416 0 0 1-.183.358l-4.407 3.029a.435.435 0 0 1-.212.081.295.295 0 0 1-.2-.064.408.408 0 0 1-.198-.36zM5.2 9.949a.408.408 0 0 0-.199-.357.35.35 0 0 0-.411.017L.183 12.648a.39.39 0 0 0-.183.35.416.416 0 0 0 .183.358l4.407 3.029a.435.435 0 0 0 .212.081.295.295 0 0 0 .2-.064c.123-.07.2-.21.198-.36V9.95zM16.051 20.8c.15 0 .286.076.357.199a.35.35 0 0 1-.017.411l-3.039 4.407a.39.39 0 0 1-.35.183.416.416 0 0 1-.358-.183L9.615 21.41a.435.435 0 0 1-.081-.212.295.295 0 0 1 .064-.2c.07-.123.21-.2.36-.198h6.093zM16.051 5.2a.408.408 0 0 0 .357-.199.35.35 0 0 0-.017-.411L13.352.183a.39.39 0 0 0-.35-.183.416.416 0 0 0-.358.183L9.615 4.59a.435.435 0 0 0-.081.212.295.295 0 0 0 .064.2c.07.123.21.2.36.198h6.093z"></path>
                    <circle stroke="none" cx="13" cy="13" r="4.333"></circle>
                 </g>
              </svg>
           </span>
           Navigation
        </button>
     </div>
  </div>
  <div class="right-bottom-buttons-wrapper">
     <div class="right-bottom-buttons">
        <button>
           <div class="icon" style="background-color: rgb(255, 0, 0);"></div>
           <div class="text"><span>Television</span></div>
        </button>
        <button>
           <div class="icon" style="background-color: rgb(20, 63, 123);"></div>
           <div class="text"><span>Language</span></div>
        </button>
     </div>
  </div>
</div>`;
        return;
      }
      if (templateUrl === "templates/settings-language.html") {
        templateCache[
          templateUrl
        ] = `<div id="settingsLanguagePage" class="page setting-language-page">
  <div class="site-page-wrapper settings-language-wrapper">
     <h2 class="site-page-title">Choose language</h2>
     <div class="site-page-content ">
        <div class="settings-language-content">
           <div class="setting-option-wrapper-language">
            <div class="setting-option-wrapper-language-cursor" id="settingLanguageCursor"></div>
              <div class="setting-option-wrapper-language-inner" id="settingLanguageList">
                 <div class="setting-option-wrapper-language-item">
                    <div class="setting-option active">
                       <span>English</span>
                       <span class="icon">
                          <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                             <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
                          </svg>
                       </span>
                    </div>
                 </div>
                 <div class="setting-option-wrapper-language-item">
                    <div class="setting-option ">
                      <span>Vietnamese (Tiếng Việt)</span>
                      <span class="icon">
                        <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                           <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
                        </svg>
                     </span>
                    </div>
                 </div>
                 <div class="setting-option-wrapper-language-item">
                    <div class="setting-option ">
                      <span>Chinese Simplified (简体中文)</span>
                      <span class="icon">
                        <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                           <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
                        </svg>
                     </span>
                    </div>
                 </div>
                 <div class="setting-option-wrapper-language-item">
                    <div class="setting-option ">
                      <span>French (Français)</span>
                      <span class="icon">
                        <svg id="btn_selected" width="65" height="59" viewBox="0 0 65 59" version="1.1" xmlns="http://www.w3.org/2000/svg">
                           <path d="M63.0403036,0.0186150948 C62.9870646,0.0318899075 62.9338256,0.0517995779 62.8805866,0.0717109475 C62.4347098,0.18453921 62.048728,0.469929843 61.8158071,0.868148738 L26.9975161,54.7073434 L3.03997644,33.1504272 C2.62071907,32.6194686 1.92195792,32.3871739 1.26312516,32.5597362 C0.604294095,32.7322969 0.118487151,33.2831668 0.0186653471,33.9535015 C-0.0811581607,34.6238379 0.224965105,35.2875361 0.803939407,35.6459322 L26.1989315,58.5833406 C26.5716043,58.9085523 27.0707201,59.0545667 27.5631798,58.9815595 C28.0556412,58.9085523 28.4882075,58.6297999 28.7544024,58.2116696 L64.6907119,2.67340773 C65.0833497,2.11590128 65.1033148,1.3791959 64.7439508,0.801779771 C64.3845886,0.224361949 63.7124452,-0.0809400538 63.0403036,0.0186150948 Z" id="Shape"></path>
                        </svg>
                     </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
     </div>
  </div>
  <div class="left-bottom-buttons-wrapper">
     <div class="left-bottom-buttons">
        <button>
           <span class="icon">
              <svg id="btn_back" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                 <g fill-rule="evenodd">
                    <path fill-rule="nonzero" d="M16.553 19H8.9c-.587 0-1.063-.452-1.063-1.01s.476-1.01 1.063-1.01h7.654c2.936 0 5.316-2.261 5.316-5.05 0-2.789-2.38-5.05-5.316-5.05H3.594l3.094 2.98c.36.4.337.998-.056 1.37a1.104 1.104 0 0 1-1.443.054L.309 6.587a.975.975 0 0 1 0-1.424L5.252.467c.237-.353.678-.53 1.11-.447.43.084.763.412.835.824a.993.993 0 0 1-.51 1.037L3.595 4.86h12.97c4.11.003 7.439 3.17 7.436 7.075-.003 3.905-3.337 7.068-7.447 7.065z"></path>
                 </g>
              </svg>
           </span>
           Back
        </button>
        <button>
           <span class="icon icon-double">
              <svg id="btn_channel" xmlns="http://www.w3.org/2000/svg">
                 <g fill-rule="evenodd">
                    <rect width="22" height="22" x="30" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
                    <path d="M12 9l4 5H8zM41 15l4-5h-8z"></path>
                    <rect width="22" height="22" x="1" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
                 </g>
              </svg>
           </span>
           Select
        </button>
        <button>
           <span class="icon">
              <svg id="btn_ok" xmlns="http://www.w3.org/2000/svg">
                 <g fill-rule="evenodd">
                    <rect width="26" height="22" x="1" y="1" fill="none" stroke="currentColor" stroke-width="2" rx="5"></rect>
                    <path fill-rule="nonzero" d="M9.665 8C7.438 8 6 9.541 6 11.927 6 14.401 7.442 16 9.673 16c2.232 0 3.674-1.592 3.674-4.055C13.347 9.55 11.902 8 9.665 8zm5.294 0v8h1.837v-2.989l.581-.594L19.857 16H22l-3.369-4.867L21.694 8H19.55l-2.755 2.82V8h-1.837zM9.663 9.846c1.157 0 1.847.8 1.847 2.14 0 1.337-.7 2.168-1.827 2.168-1.156 0-1.846-.81-1.846-2.168 0-.502.132-2.14 1.826-2.14z"></path>
                 </g>
              </svg>
           </span>
           Confirm
        </button>
     </div>
  </div>
  <div class="right-bottom-buttons-wrapper">
     <div class="right-bottom-buttons">
        <button>
           <div class="icon" style="background-color: rgb(255, 0, 0);"></div>
           <div class="text"><span>Television</span></div>
        </button>
        <button>
           <div class="icon" style="background-color: rgb(20, 63, 123);"></div>
           <div class="text"><span>Language</span></div>
        </button>
     </div>
  </div>
</div>`;
        return;
      }
      return $.ajax({
        type: "GET",
        url: url,
        cache: cache,
        dataType: "html",
      }).then(function(content) {
        templateCache[templateUrl] = content;
      });
    };

    /**
     * Check route template available in template cache or download the template.
     * @param {object} route
     * @return {object} deferred
     */
    s.processRoute = function(route, params) {
      var s = this,
        requests = [];

      for (var i = 0; i < route.segments.length; i++) {
        var _route = router.getRouteName(route.segments[i]);
        if (Array.isArray(_route.resolve)) {
          for (var j = 0; j < _route.resolve.length; j++) {
            var cb = _route.resolve[j];
            if (typeof cb === "function") {
              requests.push(cb(route, params));
            }
          }
        } else if (typeof _route.resolve === "function") {
          requests.push(_route.resolve(route, params));
        }

        if (!templateCache[_route.templateUrl] || !_route.cache) {
          var templateUrl = router.paramReplacer(
            _route.templateUrl,
            _route,
            params
          );
          requests.push(
            s.getViewTemplate(templateUrl, _route.templateUrl, _route.cache)
          );
        }
      }

      return $.when.apply($, requests);
    };

    /**
     * Render changed route from template cache & notify successfully rendered view.
     * @param {object} route
     * @param {object} params
     * @return {object} this
     */
    s.render = function(route, params) {
      var currentRoute = router.getCurrentRoute(),
        reload = $.isEmptyObject(currentRoute);

      for (var i = 0; i < route.segments.length; i++) {
        var _route = router.getRouteName(route.segments[i]),
          $page = $(viewSelector + ":eq(" + i + ")");

        if (!reload) {
          reload =
            route.segments[i] !== currentRoute.segments[i] ||
            i + 1 === route.segments.length ||
            router.isRouteParamChanged(route.segments[i], params);
          if (reload) {
            s.clean(currentRoute.segments, i);
          }
        }

        if (reload) {
          $page.html(templateCache[_route.templateUrl]);
          $(window).trigger(router.events.renderViewSuccess, [
            _route,
            route,
            params,
          ]);
        }
      }
      return this;
    };

    /**
     * Set view selector for render engine to be used.
     * @param {string} selector
     * @return {object} this
     */
    s.setViewSelector = function(selector) {
      viewSelector = selector;
      return this;
    };

    return s;
  })();
})(jQuery, $.router);
