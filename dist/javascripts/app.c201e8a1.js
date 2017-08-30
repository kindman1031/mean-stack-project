'use strict';

window.stickyTopOffset = 75;

window.isIframe = (window.location != window.parent.location) ? true : false;

function swalConfig(){
  swal.setDefaults({
    confirmButtonColor:   '#2b98f0'
  })
};
swalConfig();

var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};
var hashArrayByVar = function (theCollection, varName) {
    if (!Array.isArray(theCollection) || theCollection.length < 1) {
        return theCollection;
    }

    var hashObj = {};

    _.map(theCollection, function (item) {
        if (_.has(item, varName)) {
            hashObj[item[varName]] = item;
        }
    });

    theCollection[varName + '_hash'] = hashObj;

    return theCollection;
};

var hashArrayByID = function (theCollection) {
    return hashArrayByVar(theCollection, 'id');
};

function getPosition(element) {
    var xPosition = 0;
    var yPosition = 0;

    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return {x: xPosition, y: yPosition};
}

function getScrollXY() {
    var x = 0, y = 0;
    if (typeof( window.pageYOffset ) == 'number') {
        // Netscape
        x = window.pageXOffset;
        y = window.pageYOffset;
    } else if (document.body && ( document.body.scrollLeft || document.body.scrollTop )) {
        // DOM
        x = document.body.scrollLeft;
        y = document.body.scrollTop;
    } else if (document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop )) {
        // IE6 standards compliant mode
        x = document.documentElement.scrollLeft;
        y = document.documentElement.scrollTop;
    }
    return {
        x: x,
        y: y
    };
}

// Remove the ugly Facebook appended hash
// <https://github.com/jaredhanson/passport-facebook/issues/12>
(function removeFacebookAppendedHash() {
  if (!window.location.hash || window.location.hash !== '#_=_')
    return;
  if (window.history && window.history.replaceState)
    return window.history.replaceState("", document.title, window.location.pathname);
  // Prevent scrolling by storing the page's current scroll offset
  var scroll = {
    top: document.body.scrollTop,
    left: document.body.scrollLeft
  };
  window.location.hash = "";
  // Restore the scroll offset, should be flicker free
  document.body.scrollTop = scroll.top;
  document.body.scrollLeft = scroll.left;
}());

(function(exports){

  var config = {

    /* List all the roles you wish to use in the app
     * You have a max of 31 before the bit shift pushes the accompanying integer out of
     * the memory footprint for an integer
     */
    roles :[
      'public',
      'user',
      'admin'
    ],

    /*
     Build out all the access levels you want referencing the roles listed above
     You can use the "*" symbol to represent access to all roles.

     The left-hand side specifies the name of the access level, and the right-hand side
     specifies what user roles have access to that access level. E.g. users with user role
     'user' and 'admin' have access to the access level 'user'.
     */
    accessLevels : {
      'public' : "*",
      'anon': ['public'],
      'user' : ['user', 'admin'],
      'admin': ['admin']
    }
  };

  /*
   Method to build a distinct bit mask for each role
   It starts off with "1" and shifts the bit to the left for each element in the
   roles array parameter
   */

  function buildRoles(roles){

    var bitMask = "01";
    var userRoles = {};

    for(var role in roles){
      var intCode = parseInt(bitMask, 2);
      userRoles[roles[role]] = {
        bitMask: intCode,
        title: roles[role]
      };
      bitMask = (intCode << 1 ).toString(2)
    }

    return userRoles;
  }

  /*
   This method builds access level bit masks based on the accessLevelDeclaration parameter which must
   contain an array for each access level containing the allowed user roles.
   */
  function buildAccessLevels(accessLevelDeclarations, userRoles){

    var accessLevels = {};
    for(var level in accessLevelDeclarations){

      if(typeof accessLevelDeclarations[level] == 'string'){
        if(accessLevelDeclarations[level] == '*'){

          var resultBitMask = '';

          for( var role in userRoles){
            resultBitMask += "1"
          }
          //accessLevels[level] = parseInt(resultBitMask, 2);
          accessLevels[level] = {
            bitMask: parseInt(resultBitMask, 2)
          };
        }
        else console.log("Access Control Error: Could not parse '" + accessLevelDeclarations[level] + "' as access definition for level '" + level + "'")

      }
      else {

        var resultBitMask = 0;
        for(var role in accessLevelDeclarations[level]){
          if(userRoles.hasOwnProperty(accessLevelDeclarations[level][role]))
            resultBitMask = resultBitMask | userRoles[accessLevelDeclarations[level][role]].bitMask
          else console.log("Access Control Error: Could not find role '" + accessLevelDeclarations[level][role] + "' in registered roles while building access for '" + level + "'")
        }
        accessLevels[level] = {
          bitMask: resultBitMask
        };
      }
    }

    return accessLevels;
  }

  exports.config = config;
  exports.userRoles = buildRoles(config.roles);
  exports.accessLevels = buildAccessLevels(config.accessLevels, exports.userRoles);

  // Angular bridge
  if('undefined' !== typeof angular){
    var module = angular.module('routingConfig', []);
    module.provider('RoutingConfig', function () {
      'use strict';

      this.config = exports.config;
      this.userRoles = exports.userRoles;
      this.accessLevels = exports.accessLevels;

      this.$get = function() {
        return {}
      }
    });
  }
})(typeof exports === 'undefined' ? this['routingConfig'] = {} : exports);

(function() {
  'use strict';

  angular.module('app',
    [
      'ngAnimate',
      'ngCookies',
      'ngResource',
      'ngSanitize',
      'ngTouch',
      'routingConfig',
      'hj.uiSrefFastclick',
      'btford.socket-io',
      'restangular',
      'ui.router',
      'ui.bootstrap',
      'ui.router.tabs',
      'ui.utils',
      'angular-loading-bar',
      'angular-progress-arc',
      'uiGmapgoogle-maps',
      'ngToast',
      'flow',
      'oitozero.ngSweetAlert',
      'duScroll',
      'jsonFormatter'
    ]
  ).config(["RestangularProvider", function restangularConfig(RestangularProvider) {
      RestangularProvider.setBaseUrl('/api/');
      RestangularProvider.setDefaultHeaders({
        'Accept': 'application/json'
      });
    }]).config( ["$provide", function stateProvideConfig($provide){
      return $provide.decorator('$state', ["$delegate", "$rootScope", function($delegate, $rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, state, params) {
          $delegate.next = state;
          $delegate.toParams = params;
        });
        return $delegate;
      }]);
    }]).config( ["uiGmapGoogleMapApiProvider", function uiGmapConfig(uiGmapGoogleMapApiProvider){
      uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCn71x0Uxf1_eIcrRmmgv3kR5NUNocnPKU',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
      });
    }]).run(["$log", "$window", "$rootScope", "$timeout", "$location", "$urlRouter", "$state", "Restangular", "uiGmapGoogleMapApi", "bodyClass", "scrollToTop", "Auth", "validationPatterns", function appRun($log, $window, $rootScope, $timeout, $location, $urlRouter, $state, Restangular, uiGmapGoogleMapApi, bodyClass, scrollToTop, Auth, validationPatterns) {
      $rootScope.validationPatterns = validationPatterns;

      var updateBody = function(){
        updateBodyClasses();
      };

      var updateBodyClasses = function(){
        $rootScope.bodyClasses = bodyClass.toString();
      };

      // Intercept state change, make sure we're authorized
      $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        //$log.log('$stateChangeStart', arguments);

        event.preventDefault();
        $urlRouter.update(true); // add this!

        var authorize = function(){
          return Auth.authorize(toState.data.access);
        };

        var checkRouteAuth = function(){
          //$log.info('checkRouteAuth()');

          if(!('data' in toState) || !('access' in toState.data)){
            //$log.error("Access undefined for this state");
            //$state.go('login');
            return;
          }
          if(authorize()){
            //$log.info('Access granted, moving forward');
            $state.go(toState.name, toParams, {notify: false})
              .then(function() {
                $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
              });
          } else if (!authorize()) {
            //$log.error("Seems like you tried accessing a route you don't have access to...");

            if(fromState.url === '^') {
              if(Auth.isLoggedIn()) {
                $state.go('');
              } else {
                $state.go('home');
              }
            } else {
              $state.go('home', {path: $location.path()});
            }
          }
        };

        if(Auth.checkedSession){
          checkRouteAuth();
        } else {
          //$log.error('Auth.checkedSession is false, checking session and running event.preventDefault()');
          Auth.getSession().then(function(resp){
            //$log.info('User logged in.');
            checkRouteAuth();
          }, function(err){
            //$log.info('User not logged in.');
            checkRouteAuth();
          }).finally(function(){
            //$log.info('Session checked.');
          });
        }
      });

      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        //$log.info('$stateChangeSuccess');
        updateBody();
      });

      // If API call shoots a 403 Forbidden or 401, hard redirect to login
      Restangular.setErrorInterceptor(
        function(response, deferred, responseHandler) {
          if (response.status === 401 || response.status === 403) {
            var url = response.config.url;
            //$log.error(url.indexOf('/api/'), url.indexOf('/api/auth/session'));
            if(url.indexOf('/api/') >= 0 && url.indexOf('/api/auth/session') == -1){
              $window.location.href='/';
              return false;
            }
          }
          return response; // stop the promise chain
        }
      );

      $rootScope.scrollToTop = scrollToTop;

      $rootScope.viewport = '';
      $rootScope.mediaquery = function () {
        if ($(".bootstrap-view-xs").css("display") == "block") {
          $rootScope.viewport = 'xs';
        }
        else if ($(".bootstrap-view-sm").css("display") == "block") {
          $rootScope.viewport = 'sm';
        }
        else if ($(".bootstrap-view-md").css("display") == "block") {
          $rootScope.viewport = 'md';
        }
        else if ($(".bootstrap-view-lg").css("display") == "block") {
          $rootScope.viewport = 'lg';
        }
        //console.log("$rootScope.viewport: ", $rootScope.viewport);
        return $rootScope.viewport;
      };
      $rootScope.mediaquery();

      $(window).on('resize', function () {
        $rootScope.$apply($rootScope.mediaquery);
      });

      $rootScope.gmapsReady = false;
      uiGmapGoogleMapApi.then(function (gmaps) {
        $rootScope.gmapsReady = true;
      });

      //watching the value of the currentUser variable.
      $rootScope.currentUser = Auth.user;

      $rootScope.$watch('currentUser', function (user) {
        updateBody();
      });

      // set default timezone
      moment.tz.setDefault("America/Chicago");
    }]);

}());

angular.module("app").run(["$templateCache", function($templateCache) {$templateCache.put("components/armoireTypeAdmin-directive/armoireTypeAdmin.html","\n<form class=\"armoire-type armoire-type-admin\" name=\"newTypeForm\" ng-submit=\"update()\">\n  <div class=\"panel\" ng-class=\"{\'panel-default\':item.id, \'panel-info\':!item.id}\">\n    <div class=\"panel-heading\">\n      <div class=\"panel-title\">\n        <span ng-if=\"!item.id\">New Armoire Type</span>\n        <span ng-if=\"item.id\">{{ item.title }}</span>\n      </div>\n    </div>\n\n    <div class=\"panel-body\">\n      <div class=\"row\">\n        <div class=\"form-group col-xs-12 col-sm-8\">\n          <input class=\"form-control\" placeholder=\"Title\" ng-model=\"item.title\" required>\n        </div>\n\n        <div class=\"form-group col-xs-12 col-sm-4\">\n          <div class=\"input-group\">\n            <span class=\"input-group-addon\"><i class=\"fa fa-dollar\"></i></span>\n            <input class=\"form-control\" placeholder=\"Price\" ng-model=\"item.price\" required>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"form-group\">\n        <textarea class=\"form-control textarea-small\" rows=\"6\" placeholder=\"Description\" ng-model=\"item.description\" required></textarea>\n      </div>\n\n      <h5>Features</h5>\n\n      <div class=\"row\">\n        <div class=\"col-xs-12 col-sm-4 col-md-3\">\n          <div class=\"checkbox\">\n            <label>\n              <input type=\"checkbox\" ng-model=\"item.features.chargeDryCleaning\"> Charge for Dry Cleaning\n            </label>\n          </div>\n        </div>\n\n        <div class=\"col-xs-12 col-sm-4\">\n          <div class=\"checkbox\">\n            <label>\n              <input type=\"checkbox\" ng-model=\"item.features.chargeDeliveries\"> Charge for Deliveries\n            </label>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"panel-footer\">\n      <div ng-if=\"!item.id\">\n        <button type=\"submit\" class=\"btn btn-sm btn-info\"\n                ng-disabled=\"item.sending || newTypeForm.$invalid || newTypeForm.$pristine\">Add\n        </button>\n      </div>\n\n      <div ng-if=\"item.id\">\n        <button type=\"submit\" class=\"btn btn-sm btn-primary\"\n                ng-disabled=\"item.sending || newTypeForm.$invalid || newTypeForm.$pristine\">Update\n        </button>\n\n        <button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"destroy()\">Destroy</button>\n      </div>\n    </div>\n</form>\n");
$templateCache.put("components/avatarUpload-modal/avatarUpload.html","<div class=\"modal-body\">\n  <div flow-init=\"{singleFile:true}\" flow-file-added=\"!!{png:1,gif:1,jpg:1,jpeg:1}[$file.getExtension()]\">\n    <div class=\"text-center\">\n      <div ng-if=\"!$flow.files.length\">\n        <img src=\"http://www.placehold.it/200x200/EFEFEF/AAAAAA&amp;text=no+image\" class=\"img-circle\">\n      </div>\n\n      <div ng-if=\"$flow.files.length\">\n        <img class=\"img-responsive img-rounded\" style=\"display: inline-block\" flow-img=\"$flow.files[0]\">\n      </div>\n    </div>\n\n    <p>&nbsp;</p>\n\n    <div class=\"text-center\">\n      <button class=\"btn btn-primary\" ng-if=\"!$flow.files.length\" flow-btn=\"\">Select image<input type=\"file\" style=\"visibility: hidden; position: absolute;\"></button>\n      <button class=\"btn btn-primary\" ng-if=\"$flow.files.length\" ng-click=\"ok($flow.files[0])\">Save</button>\n      <button class=\"btn btn-warning\" ng-click=\"cancel()\">Cancel</button>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("components/billing-directive/billing.directive.html","<form name=\"billingForm\" ng-submit=\"updateCard()\" ng-init=\"hide=true\">\n  <h3>\n    <i class=\"fa fa-fw fa-credit-card h6\"></i>\n    Billing\n  </h3>\n\n  <div collapse=\"hide\">\n    <div class=\"row\">\n      <div class=\"col-xs-12\">\n        <div class=\"form-group\" show-errors>\n          <label for=\"billing_card_name\">Name on Card</label>\n          <input class=\"form-control\" id=\"billing_card_name\" required floating-label ng-model=\"card.name\">\n        </div>\n      </div>\n    </div>\n\n    <div class=\"row\">\n      <div class=\"col-sm-8\">\n        <div class=\"form-group\" show-errors>\n          <label for=\"billing_card_number\">Card Number</label>\n          <input class=\"form-control\" id=\"billing_card_number\" clear-on-focus required floating-label ng-model=\"card.number\">\n        </div>\n      </div>\n\n      <div class=\"col-sm-4\">\n        <div class=\"form-group\" show-errors>\n          <label for=\"billing_card_cvc\">CVC/Security Code</label>\n          <input class=\"form-control\" id=\"billing_card_cvc\" required floating-label ng-model=\"card.cvc\">\n        </div>\n      </div>\n    </div>\n\n    <div class=\"row\">\n      <div class=\"col-xs-8\">\n        <div class=\"form-group\" show-errors>\n          <label for=\"billing_card_exp_month\">Exp. Month</label>\n          <select class=\"form-control\" id=\"billing_card_exp_month\" required floating-label ng-options=\"month.val as month.label for month in expirations.months\" ng-model=\"card.exp_month\"></select>\n        </div>\n      </div>\n\n      <div class=\"col-xs-4\">\n        <div class=\"form-group\" show-errors>\n          <label for=\"billing_card_exp_year\">Exp. Year</label>\n          <select class=\"form-control\" id=\"billing_card_exp_year\" required floating-label ng-options=\"year for year in expirations.years\" ng-model=\"card.exp_year\" ng-change=\'checkValue()\'></select>\n        </div>\n      </div>\n    </div>\n\n    <button type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"billingForm.$pristine\">Update Billing</button>\n\n    <div ng-if=\"!mini\">\n\n      <hr/>\n\n      <h4>\n        Charges\n      </h4>\n\n      <ul class=\"list-unstyled\" ng-if=\"charges.length\">\n        <li ng-repeat=\"charge in charges\">\n          <div class=\"row\">\n            <h5 class=\"col-xs-8\">\n              [{{ (charge.created * 1000) | date:\'MM/dd/yyyy\' }}]\n              {{ charge.description }}\n            </h5>\n            <h5 class=\"col-xs-4 text-right\">\n              <small>$</small>\n              {{ charge.amount | centscurrency }}\n            </h5>\n          </div>\n          <div class=\"row\">\n            <p class=\"col-xs-8\">\n              <span ng-if=\"charge.source.object == \'card\'\">{{ charge.source.brand }} ending in {{ charge.source.last4 }}</span>\n              <span ng-if=\"charge.source.object != \'card\'\">&nbsp;</span>\n            </p>\n            <p class=\"col-xs-4 text-right\">\n              <small class=\"text-warning\" ng-if=\"charge.amount_refunded > 0\">\n                <span ng-if=\"charge.refunded\">Full Refund</span>\n                <span ng-if=\"!charge.refunded\">Partial Refund: ${{ charge.amount_refunded | centscurrency }}</span>\n              </small>\n            </p>\n          </div>\n\n          <hr ng-if=\"!$last\"/>\n        </li>\n      </ul>\n\n      <div ng-if=\"!charges.length\">\n        <p>\n          You have not added any armoires, so there are no charges yet.\n        </p>\n      </div>\n    </div>\n\n    <div collapse=\"!hide\" class=\"text-center\">\n      <h2>\n        <i class=\"fa fa-cog fa-spin\">&nbsp;</i>\n      </h2>\n    </div>\n  </div>\n\n  <hr/>\n\n  <h5 class=\"text-info\">\n    Disclaimer\n  </h5>\n\n  <p>\n    We do NOT store credit card information. That data is stored on Stripe.com. This is done for the security of our customers.\n  </p>\n</form>\n");
$templateCache.put("components/calendar-directive/calendar.html","<div class=\"header\">\n  <i class=\"fa fa-angle-left\" ng-click=\"previous()\"></i>\n  <span>{{month.format(\"MMMM, YYYY\")}}</span>\n  <i class=\"fa fa-angle-right\" ng-click=\"next()\"></i>\n</div>\n<div class=\"week names\">\n  <span class=\"day\">Sun</span>\n  <span class=\"day\">Mon</span>\n  <span class=\"day\">Tue</span>\n  <span class=\"day\">Wed</span>\n  <span class=\"day\">Thu</span>\n  <span class=\"day\">Fri</span>\n  <span class=\"day\">Sat</span>\n</div>\n<div class=\"week\" ng-repeat=\"week in weeks\">\n  <span class=\"day\"\n        ng-class=\"{ today: day.isToday, \'different-month\': !day.isCurrentMonth, selected: day.date.isSame(selected) }\"\n        ng-click=\"select(day)\" ng-repeat=\"day in week.days\">{{day.number}}</span>\n</div>\n");
$templateCache.put("components/charges-directive/charges.directive.html","<div class=\"panel panel-default charges\">\n  <div class=\"panel-heading\">\n    <i class=\"fa fa-fw fa-list\"></i>\n    Charges\n  </div>\n\n  <div class=\"panel-body\">\n\n  </div>\n</div>\n");
$templateCache.put("components/clothingItem-directive/clothingItem.html","<div class=\"clothingItem-img\">\n\n  <img\n    class=\"img-responsive img-rounded light-shadow\"\n    style=\"width: 100%;\"\n    ng-src=\"{{ item.image.thumbnail }}\"\n    on-img-error=\"https://placehold.it/150x150?text=Armoire\" />\n\n  <div class=\"clothingItem-labels text-center\">\n    <span class=\"label label-info\">{{ item.type.title }}</span>\n  </div>\n\n</div>\n\n<div class=\"clothingItem-details text-center light-shadow\">\n  <p>\n    {{ item.name }}\n  </p>\n\n  <div class=\"clothingItem-cta\" ng-hide=\"hideDeliverButton\" ng-switch=\"item.status\">\n    <button ng-switch-when=\"inarmoire\" class=\"btn btn-xs btn-block btn-primary\" ng-click=\"onDeliver({itemId: item.id})\">Deliver</button>\n    <span ng-switch-when=\"indelivery\" class=\"btn btn-xs btn-block btn-warning\">Awaiting Delivery</span>\n  </div>\n</div>\n");
$templateCache.put("components/clothingTypeAdmin-directive/clothingTypeAdmin.html","<form class=\"clothing-type clothing-type-admin\" name=\"newTypeForm\" ng-submit=\"update()\">\n  <div class=\"panel\" ng-class=\"{\'panel-default\':item.id, \'panel-info\':!item.id}\">\n    <div class=\"panel-heading\">\n      <div class=\"panel-title\">\n        <span ng-if=\"!item.id\">New Clothing Type</span>\n        <span ng-if=\"item.id\">{{ item.title }}</span>\n      </div>\n    </div>\n\n    <div class=\"panel-body\">\n      <div class=\"row\">\n        <div class=\"form-group col-xs-12 col-sm-8\">\n          <input class=\"form-control\" placeholder=\"Title\" ng-model=\"item.title\" required>\n        </div>\n\n        <div class=\"form-group col-xs-12 col-sm-4\">\n          <div class=\"input-group\">\n            <span class=\"input-group-addon\"><i class=\"fa fa-dollar\"></i></span>\n            <input class=\"form-control\" placeholder=\"Price\" ng-model=\"item.price\" required>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"form-group\">\n        <textarea class=\"form-control textarea-small\" placeholder=\"Description\" ng-model=\"item.description\" rows=\"3\"></textarea>\n      </div>\n    </div>\n\n    <div class=\"panel-footer\">\n      <div ng-if=\"!item.id\">\n        <button type=\"submit\" class=\"btn btn-sm btn-info\"\n                ng-disabled=\"item.sending || newTypeForm.$invalid || newTypeForm.$pristine\">Add\n        </button>\n      </div>\n\n      <div ng-if=\"item.id\">\n        <button type=\"submit\" class=\"btn btn-sm btn-primary\"\n                ng-disabled=\"item.sending || newTypeForm.$invalid || newTypeForm.$pristine\">Update\n        </button>\n\n        <button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"destroy()\">Destroy</button>\n      </div>\n    </div>\n  </div>\n</form>\n");
$templateCache.put("components/deliverItems-modal/deliverItems.html","<div class=\"modal-body delivery-items-modal\">\n  <div>\n    <h4 class=\"delivery-items-modal__heading\">Select Items to Dropoff</h4>\n    <p class=\"delivery-items-modal__help\">Click image to select item</p>\n    <div class=\"row\">\n      <div class=\"col-xs-6 col-sm-6 col-md-4\" ng-repeat=\"item in items | filter:q | orderBy: \'-createdAt\'\">\n        <div class=\"delivery-items-modal__item\" ng-if=\"item.status === \'inarmoire\'\">\n          <i class=\"fa fa-check delivery-items-modal__item__check\" ng-if=\"item.selected\"></i>\n          <img class=\"delivery-items-modal__item__img img-responsive img-rounded light-shadow\"\n            ng-class=\"{\'delivery-items-modal__item__img--active\': item.selected}\"\n            ng-click=\"toggleItem(item)\"\n            ng-src=\"{{ item.image.thumbnail }}\"\n            on-img-error=\"https://placehold.it/150x150?text=Armoire\"/>\n          <p class=\"delivery-items-modal__item__name\">{{ item.name }}</p>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div collapse=\"!itemsSelected\">\n    <div collapse=\"!deliveryTime\">\n      <h4 class=\"delivery-items-modal__heading\">Dropoff Time</h4>\n      <p>{{ deliveryTime | date:\'MM/dd/yyyy @ hh:mm a\' }}</p>\n      <a class=\"btn btn-info\" ng-click=\"deliveryTime = null\">Choose another time</a>\n    </div>\n    <div collapse=\"deliveryTime\">\n      <h4 class=\"delivery-items-modal__heading\">Choose Dropoff Time</h4>\n      <div class=\"row\">\n        <div class=\"col-xs-7 col-sm-5\">\n          <div class=\"form-group\">\n            <label for=\"delivery.day\">Day</label>\n            <select class=\"form-control\" id=\"delivery.day\" ng-model=\"deliveryDay\" placeholder=\"Day\">\n              <option ng-repeat=\"group in groups\" value=\"{{$index}}\">{{ group[0].format(\'dddd, MMM Do\') }}</option>\n            </select>\n          </div>\n        </div>\n\n        <div class=\"col-xs-5 col-sm-7\" collapse=\"!deliveryDay\">\n          <div class=\"form-group\">\n            <label for=\"delivery.time\">Time</label>\n            <select class=\"form-control\" id=\"delivery.time\" ng-model=\"deliveryTime\" np-options=\"slot in groups[deliveryDay]\">\n              <option ng-repeat=\"slot in groups[deliveryDay]\" value=\"{{ slot.format() }}\">\n                @{{ slot.format(\'LT\') }}\n              </option>\n            </select>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <hr/>\n  <div class=\"text-center\">\n    <button class=\"btn btn-primary\" ng-disabled=\"!itemsSelected || !deliveryTime\" ng-click=\"ok()\">Deliver</button>\n    <button class=\"btn btn-warning\" ng-click=\"cancel()\">Cancel</button>\n  </div>\n</div>\n");
$templateCache.put("components/deliveryItem-directive/deliveryItem.html","<h4>\n  <span ng-if=\"delivery.delivered\">\n    {{ delivery.deliveredAtReadable }}\n  </span>\n\n  <span ng-if=\"!delivery.delivered\">\n    {{ delivery.dateReadable }}\n  </span>\n\n  <br>\n\n  <small access-level=\"accessLevels.admin\">\n    <a ui-sref=\"^.customer.show({id: delivery.customer.id})\">{{ delivery.customer.firstName }} {{ delivery.customer.lastName }}</a>\n  </small>\n</h4>\n\n<div class=\"btn-group btn-group-sm margin-bottom\">\n  <!-- Details -->\n  <button class=\"btn btn-default\" ng-click=\"hideDetails = !hideDetails\"><i class=\"fa fa-fw fa-lg fa-search\"></i> Details</button>\n  <!-- MAP -->\n  <a class=\"btn btn-default\" ng-href=\"http://maps.apple.com/?q={{ delivery.customer.addressReadable }}\" target=\"map\"><i\n    class=\"fa fa-fw fa-lg fa-globe\"></i> Map</a>\n</div>\n\n<div access-level=\"accessLevels.admin\">\n  <div class=\"btn-group btn-group-sm margin-bottom\" ng-if=\"!delivery.delivered\">\n    <!-- Start/Finish -->\n    <button class=\"btn btn-primary\" ng-if=\"!delivery.active && !delivery.canceled && !delivery.delivered\" ng-click=\"activateDelivery()\"><i\n      class=\"fa fa-fw fa-lg fa-flag-o\"></i> Start\n    </button>\n\n    <button class=\"btn btn-success\" ng-if=\"delivery.active && !delivery.canceled\" ng-click=\"finishDelivery()\"><i\n      class=\"fa fa-fw fa-lg fa-flag-checkered\"></i> Finish\n    </button>\n\n    <!-- Cancel -->\n    <button class=\"btn btn-danger\" ng-if=\"!delivery.canceled\" ng-click=\"cancelDelivery()\"><i class=\"fa fa-fw fa-lg fa-ban\"></i> Cancel</button>\n\n    <button class=\"btn btn-danger\" ng-if=\"delivery.canceled\"><i class=\"fa fa-fw fa-lg fa-circle-o\"></i> Un-Cancel</button>\n  </div>\n</div>\n\n<div class=\"details\" collapse=\"hideDetails\" ng-init=\"hideDetails = delivery.delivered\">\n  <div class=\"row\">\n    <div class=\"col-sm-5\">\n\n      <h5>Address</h5>\n\n      <p>\n        <address>\n          {{ delivery.customer.address.street_1 }}\n          {{ delivery.customer.address.street_2 }}\n          <br/>\n          {{ delivery.customer.address.city }}, {{ delivery.customer.address.state }}, {{ delivery.customer.address.zip }}\n          <br/>\n          {{ delivery.customer.address.country }}\n        </address>\n      </p>\n    </div>\n\n    <div class=\"col-sm-7\">\n      <h5>Contents</h5>\n\n      <div ng-if=\"delivery.armoire\">\n        <p>\n          <strong>Armoire:</strong> {{ delivery.armoire.type.title }} <br/>\n          <strong>Ordered:</strong> {{ delivery.armoire.createdAtReadable }} <br/>\n          <strong>Name:</strong> {{ delivery.armoire.name }}\n        </p>\n      </div>\n\n      <div ng-if=\"delivery.clothing\">\n        <div class=\"row\">\n          <div class=\"col-xs-6 col-sm-4 col-sm-3 col-md-2\" ng-repeat=\"item in delivery.clothing | filter:q | orderBy: \'-createdAt\'\">\n            <div clothing-item item=\"item\" hide-deliver-button=\"true\"></div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!--<json-formatter json=\"this\"></json-formatter>-->\n");
$templateCache.put("components/deliveryMap-directive/deliveryMap.html","<ui-gmap-google-map id=\"{{ uid }}\" center=\"map.center\" zoom=\"map.zoom\" draggable=\"{{ map.draggable }}\" options=\"map.options\" ng-if=\"map.markers\">\n    <ui-gmap-marker coords=\"marker.coords\" options=\"marker.options\" events=\"marker.events\" idKey=\"marker.id\" ng-repeat=\"marker in map.markers\"></ui-gmap-marker>\n</ui-gmap-google-map>");
$templateCache.put("components/login-directive/login.html","<form ng-submit=\"login()\" class=\"text-center\">\n  <button class=\"btn btn-lg btn-primary\">Login with &nbsp;<i class=\"fa fa-facebook-square\"></i></button>\n</form>\n");
$templateCache.put("components/mainMenu-directive/mainMenu.html","<div id=\"main-menu\" class=\"navbar navbar-inverted navbar-fixed-top\" role=\"navigation\">\n  <label class=\"pull-right\" id=\"side-menu-button\" for=\"side-menu-toggle\">\n\n    <div id=\"side-menu-icon text-white\" class=\"\">\n      <!--<i id=\"side-menu-icon-marka\" class=\"\"></i>-->\n        <span class=\"fa-stack fa-lg\">\n          <i class=\"fa fa-circle-thin fa-stack-2x\"></i>\n          <i class=\"anim-fade anim-scale fa fa-stack-1x fa-reorder\"></i>\n        </span>\n    </div>\n  </label>\n\n  <!--<a id=\"back-btn\" class=\"btn btn-default btn-sm\" ng-click=\"goUp()\"><i class=\"fa fa-chevron-left fa-fw\"></i></a>-->\n\n  <div class=\"container\">\n    <div class=\"navbar-header\">\n      <a class=\"navbar-brand\" ui-sref=\"home\" style=\"position: relative; width: 80px\">\n        <!--Armoire-->\n        <!--<img src=\"/image/logos/Armoire-Light.png\" height=\"80%\" class=\"css-center\">-->\n        <img src=\"/images/Armoire-white.fc38aab7.png\" height=\"100%\" class=\"\">\n      </a>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("components/messages-directive/messages.html","");
$templateCache.put("components/newArmoire-modal/newArmoire.html","<form name=\"armoireForm\">\n  <div class=\"modal-header\">\n    New Armoire\n  </div>\n\n  <div class=\"modal-body\">\n    <div class=\"form-group\"  show-errors>\n      <label for=\"name\">Armoire Name</label>\n      <input name=\"name\" class=\"form-control\" ng-model=\"armoire.name\" required>\n    </div>\n\n    <h4>Delivery Date</h4>\n\n    <div class=\"row\">\n      <div class=\"col-xs-12 col-sm-6\">\n        <label for=\"name\">Date</label>\n        <div class=\"input-group\">\n          <input type=\"text\" class=\"form-control\" name=\"date\" ng-show=\"armoire.date\"\n                 datepicker-popup=\"{{date.format}}\"\n                 ng-model=\"armoire.date\"\n                 is-open=\"date.opened\"\n                 min-date=\"date.minDate\"\n                 datepicker-options=\"date.options\"\n                 date-disabled=\"disabled(armoire.date, mode)\"\n                 ng-required=\"true\"\n                 close-text=\"Close\" />\n\n          <span class=\"\" ng-class=\"{\'input-group-btn\':armoire.date}\">\n            <button type=\"button\" class=\"btn btn-primary\" ng-click=\"date.open($event)\"><i class=\"fa fa-calendar\"></i></button>\n          </span>\n        </div>\n      </div>\n\n      <div class=\"col-xs-12 col-sm-6\">\n        <div class=\"form-group\">\n          <label for=\"time\">Time</label>\n          <input name=\"time\" class=\"form-control\" type=\"time\" required>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"modal-footer\">\n    <div class=\"text-center\">\n      <button class=\"btn btn-primary\" ng-if=\"armoireForm.$valid && armoireForm.$dirty\" ng-click=\"ok()\">Save</button>\n      <button class=\"btn btn-warning\" ng-click=\"cancel()\">Cancel</button>\n    </div>\n  </div>\n</form>\n");
$templateCache.put("components/newArmoireItem-directive/newArmoireItem.directive.html","<form name=\"itemForm\">\n  <div class=\"well light-shadow\">\n    <div class=\"text-center\" ng-show=\"newItem.sending\">\n      <h3><i class=\"fa fa-cog fa-spin\"></i></h3>\n    </div>\n\n    <div ng-show=\"!newItem.sending\"\n       flow-init=\"{singleFile:true}\"\n       flow-file-added=\"onImgAdded({file: $file})\">\n      <h5>Add Item</h5>\n\n      <div class=\"row\">\n        <div class=\"col-xs-12 col-sm-6 col-md-3\">\n\n          <div class=\"form-group\">\n            <label for=\"newItem.name\">Name</label>\n            <input id=\"newItem.name\" class=\"form-control\" ng-model=\"newItem.name\" required >\n          </div>\n        </div>\n\n        <div class=\"col-xs-12 col-sm-6 col-md-3\">\n          <hr class=\"breakout hr-light visible-xs\"/>\n          <div class=\"form-group\">\n            <label for=\"newItem.type\">Type</label>\n            <select id=\"newItem.type\"\n                    class=\"form-control\"\n                    ng-model=\"newItem.type\"\n                    ng-options=\"item.id as item.title for item in clothingTypes\"\n                    required >\n            </select>\n          </div>\n        </div>\n      </div>\n      <div class=\"row\">\n        <div class=\"col-xs-12 col-sm-6 col-md-3\">\n          <h5>Options</h5>\n\n          <div class=\"row\">\n            <div class=\"col-xs-12\">\n              <div class=\"checkbox\">\n                <label>\n                  <input type=\"checkbox\" ng-model=\"newItem.features.dryClean\"> Dry Clean\n                </label>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"col-xs-12 col-sm-6 col-md-3\">\n          <hr class=\"breakout hr-light visible-xs\"/>\n\n          <div>\n            <div class=\"\" ng-if=\"newItem.img.uri\">\n              <img class=\"img-responsive\" ng-src=\"{{ newItem.img.uri }}\"/>\n\n              <p>&nbsp;</p>\n            </div>\n\n            <span class=\"btn btn-block btn-primary\" flow-btn flow-attrs=\"{accept:\'image/*\'}\">\n              <span ng-if=\"!newItem.img.uri\">Add photo</span>\n              <span ng-if=\"newItem.img.uri\">Change photo</span>\n            </span>\n          </div>\n        </div>\n      </div>\n\n      <hr class=\"breakout hr-light\"/>\n\n      <div class=\"btn-group \">\n        <button class=\"btn btn-primary\" type=\"submit\" ng-click=\"saveItem({flow: $flow})\" ng-disabled=\"itemForm.$invalid || itemForm.$pristine || !newItem.img.uri\">Add</button>\n        <button class=\"btn btn-danger\" type=\"button\" ng-click=\"resetItem({flow: $flow});\">Cancel</button>\n      </div>\n    </div>\n  </div>\n</form>\n");
$templateCache.put("components/sideMenu-directive/sideMenu.html","<div id=\"side-menu\">\n  <label class=\"close-btn\" for=\"side-menu-toggle\">\n    <i class=\"fa fa-close fa-lg\"></i>\n  </label>\n\n  <div class=\"header\">\n    <span access-level=\"accessLevels.anon\">Welcome</span>\n        <span access-level=\"accessLevels.user\">\n            <div class=\"welcome\">Welcome</div>\n            {{ user.firstName }}\n        </span>\n  </div>\n\n  <ul class=\"list-unstyled user\" access-level=\"accessLevels.admin\" >\n    <li ui-sref-active-eq=\"active\"><a ui-sref=\"admin.index\" title=\"Home\">\n      <i class=\"fa fa-fw fa-home\"></i>\n      Admin\n    </a></li>\n\n    <li ui-sref-active-eq=\"active\"><a ui-sref=\"admin.customer\" title=\"Customers\">\n      <i class=\"fa fa-fw fa-users\"></i>\n      Customers\n    </a></li>\n\n    <li ui-sref-active-eq=\"active\"><a ui-sref=\"admin.delivery\" title=\"Deliveries\">\n      <i class=\"fa fa-fw fa-truck\"></i>\n      Deliveries\n    </a></li>\n\n    <li ui-sref-active-eq=\"active\"><a ui-sref=\"admin.pricing.armoire\" title=\"Pricing\">\n      <i class=\"fa fa-fw fa-dollar\"></i>\n      Pricing\n    </a></li>\n\n    <!--\n    <li ui-sref-active-eq=\"active\"><a ui-sref=\"admin.support\" title=\"Support\">\n      <i class=\"fa fa-fw fa-comments\"></i> Support\n    </a></li>\n    -->\n  </ul>\n\n  <ul class=\"list-unstyled user\" data-access-level=\"accessLevels.user\">\n    <li ui-sref-active-eq=\"active\"><a ui-sref=\"customer.armoires\" title=\"Armoires\">\n      <i class=\"fa fa-fw fa-suitcase\"></i>\n      Armoires\n    </a></li>\n\n    <li ui-sref-active-eq=\"active\"><a ui-sref=\"customer.index\" title=\"All Clothes\">\n      <i class=\"fa fa-fw fa-tags\"></i>\n      All Clothes\n    </a></li>\n\n\n\n    <li ui-sref-active-eq=\"active\"><a ui-sref=\"customer.billing\" title=\"Billing\">\n      <i class=\"fa fa-fw fa-credit-card\"></i>\n      Billing\n    </a></li>\n\n    <li ui-sref-active-eq=\"active\"><a ui-sref=\"customer.support\" title=\"Support\">\n      <i class=\"fa fa-fw fa-life-ring\"></i>\n      Support\n    </a></li>\n  </ul>\n\n  <ul class=\"list-unstyled user\" access-level=\"accessLevels.user\">\n    <li ui-sref-active-eq=\"active\">\n      <a ui-sref=\"profile\"><i class=\"fa fa-fw fa-user\"></i> Profile </a>\n      <a ui-sref=\"logout\"><i class=\"fa fa-fw fa-sign-out\"></i> Logout </a>\n    </li>\n  </ul>\n\n  <ul class=\"list-unstyled\">\n    <li data-access-level=\"accessLevels.anon\" ui-sref-active-eq=\"active\"><a ui-sref=\"login\">Login</a></li>\n    <li data-access-level=\"accessLevels.anon\" ui-sref-active-eq=\"active\"><a ui-sref=\"signup\">Signup</a></li>\n    <!--<li ui-sref-active-eq=\"active\"><a ui-sref=\"about\">About</a></li>-->\n    <!--<li ui-sref-active-eq=\"active\"><a ui-sref=\"contact\">Contact</a></li>-->\n  </ul>\n</div>\n");
$templateCache.put("components/slot-directive/slot.html","{{ slot.format(slotFormat) }}\n");
$templateCache.put("components/slots-directive/slots.html","\n<!--<ul class=\"slots list-unstyled\">\n  <li class=\"h5\" ng-repeat-start=\"group in groups\">{{ group[0].format(\'dddd\') }} <small>{{ group[0].format(\'MMMM Do\') }}</small></li>\n\n  <li>\n    <ul class=\"list-unstyled row\">\n      <li class=\"col-xs-6 col-sm-4 col-md-3\" slot=\"slot\" slot-format=\"LT\" ng-repeat=\"slot in group\"></li>\n    </ul>\n  </li>\n1\n  <li ng-repeat-end=\"\">&nbsp;</li>\n</ul>\n-->\n\n<div class=\"row\">\n  <div class=\"col-xs-7 col-sm-4\">\n    <div class=\"form-group\">\n      <label for=\"delivery.day\">Day</label>\n      <select class=\"form-control\" id=\"delivery.day\" ng-model=\"deliveryDay\"placeholder=\"Day\">\n        <option ng-repeat=\"group in groups\" value=\"{{$index}}\">{{ group[0].format(\'dddd, MMM Do\') }}</option>\n      </select>\n    </div>\n  </div>\n\n  <div class=\"col-xs-5 col-sm-8\" collapse=\"!deliveryDay\">\n    <div class=\"form-group\">\n      <label for=\"delivery.time\">Time</label>\n      <select class=\"form-control\" id=\"delivery.time\" ng-model=\"selectedSlot\" np-options=\"slot in groups[deliveryDay]\" >\n        <option ng-repeat=\"slot in groups[deliveryDay]\" value=\"{{ slot.format() }}\">@ {{ slot.format(\'LT\') }}</option>\n      </select>\n    </div>\n  </div>\n</div>\n\n<json-formatter class=\"json-formatter json-formatter-dark\" json=\"this\"></json-formatter>\n");
$templateCache.put("components/termsAndConditions/termsAndConditions.tpl.html","<h2>\n    Terms and Conditions\n</h2>\n\n<p>\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur semper congue rutrum. Maecenas id felis magna.\n    Nunc eleifend sagittis est, ac luctus est blandit non. Pellentesque ac maximus nisi, quis suscipit odio. Suspendisse\n    varius purus nibh, tristique gravida magna rhoncus ac. Donec sit amet neque nisi. Nulla non suscipit augue.\n    In blandit purus risus, id dictum orci euismod a. Vivamus egestas orci ipsum, in egestas est tempus vitae.\n    Phasellus sit amet lorem iaculis, finibus massa ut, eleifend arcu. Cras in erat id ligula tempor ornare.\n    Curabitur eleifend ac est sit amet pulvinar. Aenean ac elementum turpis. Donec porta dui non leo auctor laoreet.\n    Vestibulum aliquet maximus justo ac hendrerit. Cras vestibulum lacus vel felis pulvinar pulvinar.\n</p>\n\n<p>\n    Vestibulum ex mauris, placerat quis ipsum et, egestas feugiat eros. Fusce dignissim pellentesque risus, non\n    efficitur nibh cursus id. Quisque eget eleifend purus, ut malesuada nisl. Nam feugiat massa eget libero ornare\n    cursus. Proin eros ex, suscipit ac velit et, aliquet facilisis libero. Mauris accumsan maximus porta. Fusce sit amet\n    nunc eu ex venenatis ultrices eget vel ligula. Phasellus gravida tincidunt nisi, at faucibus lorem placerat non.\n    Mauris congue ultrices nunc, eu facilisis orci tincidunt a. Aenean sit amet pellentesque leo. Sed sit amet velit\n    vitae lacus aliquam placerat sed nec nunc. In euismod sit amet enim vel ultricies. Nulla varius porttitor auctor.\n    Sed egestas faucibus velit eu tincidunt. Fusce at interdum nunc.\n</p>\n\n<p>\n    Vestibulum sit amet augue orci. Nulla sagittis pharetra arcu, ac tincidunt quam. Ut vestibulum nec lacus quis\n    sollicitudin. Duis nulla erat, vulputate vitae rutrum vitae, ornare eget metus. Proin condimentum odio dui,\n    ullamcorper commodo sapien luctus quis. Vestibulum aliquet tincidunt arcu at viverra. Sed consectetur leo id tortor\n    facilisis, sit amet vestibulum nunc tempus. Donec ut fermentum massa. Lorem ipsum dolor sit amet, consectetur\n    adipiscing elit. Praesent elementum ex consequat nisi sollicitudin congue. Nullam non ligula tortor. Ut rutrum\n    facilisis eros commodo auctor. Aliquam gravida urna neque, eu ullamcorper est mattis id. Ut consequat mattis\n    scelerisque.\n</p>\n\n<p>\n    Vivamus vestibulum purus nec pretium aliquam. Proin consectetur egestas massa, non fermentum purus ullamcorper in.\n    Cras sagittis enim magna. Donec auctor magna vitae mauris rhoncus, eget ornare augue porttitor. Sed vel tellus at\n    risus viverra congue. Praesent vel vehicula enim. Nulla sagittis, ligula consectetur pharetra sagittis, turpis purus\n    egestas nisl, eu finibus lectus velit sed tellus. Nam posuere aliquet nisi at interdum. Praesent velit nulla,\n    lobortis luctus auctor at, venenatis et diam.\n</p>\n\n<p>\n    Aenean tristique vulputate elit non auctor. Praesent pretium dui lacus, nec eleifend ipsum porttitor in. Vestibulum\n    commodo orci at nunc facilisis ultricies. Donec nisi sem, imperdiet nec porta id, sodales sit amet dolor. Class\n    aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec sed blandit quam, vel\n    congue neque. Mauris luctus odio sed turpis sodales, nec tristique libero imperdiet. Curabitur felis nisl, porta ac\n    ante eget, vehicula gravida ipsum. Nulla sagittis non nisl et sodales. Praesent ultrices enim in orci iaculis, quis\n    mollis turpis varius.\n</p>\n\n<p>\n    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur semper congue rutrum. Maecenas id felis magna.\n    Nunc eleifend sagittis est, ac luctus est blandit non. Pellentesque ac maximus nisi, quis suscipit odio. Suspendisse\n    varius purus nibh, tristique gravida magna rhoncus ac. Donec sit amet neque nisi. Nulla non suscipit augue.\n    In blandit purus risus, id dictum orci euismod a. Vivamus egestas orci ipsum, in egestas est tempus vitae.\n    Phasellus sit amet lorem iaculis, finibus massa ut, eleifend arcu. Cras in erat id ligula tempor ornare.\n    Curabitur eleifend ac est sit amet pulvinar. Aenean ac elementum turpis. Donec porta dui non leo auctor laoreet.\n    Vestibulum aliquet maximus justo ac hendrerit. Cras vestibulum lacus vel felis pulvinar pulvinar.\n</p>\n\n<p>\n    Vestibulum ex mauris, placerat quis ipsum et, egestas feugiat eros. Fusce dignissim pellentesque risus, non\n    efficitur nibh cursus id. Quisque eget eleifend purus, ut malesuada nisl. Nam feugiat massa eget libero ornare\n    cursus. Proin eros ex, suscipit ac velit et, aliquet facilisis libero. Mauris accumsan maximus porta. Fusce sit amet\n    nunc eu ex venenatis ultrices eget vel ligula. Phasellus gravida tincidunt nisi, at faucibus lorem placerat non.\n    Mauris congue ultrices nunc, eu facilisis orci tincidunt a. Aenean sit amet pellentesque leo. Sed sit amet velit\n    vitae lacus aliquam placerat sed nec nunc. In euismod sit amet enim vel ultricies. Nulla varius porttitor auctor.\n    Sed egestas faucibus velit eu tincidunt. Fusce at interdum nunc.\n</p>\n\n<p>\n    Vestibulum sit amet augue orci. Nulla sagittis pharetra arcu, ac tincidunt quam. Ut vestibulum nec lacus quis\n    sollicitudin. Duis nulla erat, vulputate vitae rutrum vitae, ornare eget metus. Proin condimentum odio dui,\n    ullamcorper commodo sapien luctus quis. Vestibulum aliquet tincidunt arcu at viverra. Sed consectetur leo id tortor\n    facilisis, sit amet vestibulum nunc tempus. Donec ut fermentum massa. Lorem ipsum dolor sit amet, consectetur\n    adipiscing elit. Praesent elementum ex consequat nisi sollicitudin congue. Nullam non ligula tortor. Ut rutrum\n    facilisis eros commodo auctor. Aliquam gravida urna neque, eu ullamcorper est mattis id. Ut consequat mattis\n    scelerisque.\n</p>\n\n<p>\n    Vivamus vestibulum purus nec pretium aliquam. Proin consectetur egestas massa, non fermentum purus ullamcorper in.\n    Cras sagittis enim magna. Donec auctor magna vitae mauris rhoncus, eget ornare augue porttitor. Sed vel tellus at\n    risus viverra congue. Praesent vel vehicula enim. Nulla sagittis, ligula consectetur pharetra sagittis, turpis purus\n    egestas nisl, eu finibus lectus velit sed tellus. Nam posuere aliquet nisi at interdum. Praesent velit nulla,\n    lobortis luctus auctor at, venenatis et diam.\n</p>\n\n<p>\n    Aenean tristique vulputate elit non auctor. Praesent pretium dui lacus, nec eleifend ipsum porttitor in. Vestibulum\n    commodo orci at nunc facilisis ultricies. Donec nisi sem, imperdiet nec porta id, sodales sit amet dolor. Class\n    aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec sed blandit quam, vel\n    congue neque. Mauris luctus odio sed turpis sodales, nec tristique libero imperdiet. Curabitur felis nisl, porta ac\n    ante eget, vehicula gravida ipsum. Nulla sagittis non nisl et sodales. Praesent ultrices enim in orci iaculis, quis\n    mollis turpis varius.\n</p>\n\n<button class=\"btn btn-default\" ng-click=\"scrollToTop(\'TOC\'); $parent.hideToC = true; $parent.tocInput = true;\">\n    <i class=\"fa fa-arrow-up fa-fw\"></i>\n    Back to Top\n</button>\n");
$templateCache.put("components/userAvatar-directive/userAvatar.html","<div class=\"text-center\">\n  <img ng-hide=\"!user.avatar.thumbnail\" ng-src=\"{{ user.avatar.thumbnail }}\" class=\"img-circle\">\n  <img ng-show=\"!user.avatar.thumbnail\" src=\"http://www.placehold.it/200x200/EFEFEF/AAAAAA&amp;text=no+profile+image\" class=\"img-circle\">\n  <p>&nbsp;</p>\n  <button class=\"btn btn-primary\" ng-click=\"openAvatarModal()\">Upload Photo</button>\n</div>\n");
$templateCache.put("components/states/404/404.html","\n\n<div class=\"text-center\">\n  <h1>OOPS</h1>\n\n  <p>Not entirely sure how you got here. Moving along.</p>\n\n  <p>{{cTime | number:2}}</p>\n\n  <!--\n  <progress-arc\n    data-complete=\"cPer\"\n    ></progress-arc>\n    -->\n</div>\n\n");
$templateCache.put("components/states/about/about.html","<h1>About Armoire</h1>\n\n<p class=\"lead\">Armoire is your personal trunk in the cloud. Order an armoire and it will show up to you door with an assistant that will help you categorize, photograph, and tag everything you put in it.</p>\n\n<p>After that just open the app on your phone, pick an article of clothing, tell us where to send it, and it will be on it\'s way and to you within a few days.</p>\n\n<p>Seasonal storage has never been easier.</p>\n\n<hr/>\n\n<h3>FAQ</h3>\n\n<div ng-repeat=\"(fIndex, f) in faq\" ng-init=\"fC = false\" ng-click=\"fC = !fC\">\n    <h5 class=\"text-success\">\n        {{f.question }}\n    </h5>\n\n    <div collapse=\"fC\">\n        <small>\n            {{ f.answer }}\n        </small>\n    </div>\n\n    <hr ng-if=\"!$last\">\n</div>");
$templateCache.put("components/states/admin/admin.html","<div access-level=\"accessLevels.admin\">\n    <div id=\"uiView\" ui-view></div>\n</div>\n\n<div access-level=\"accessLevels.anon\">\n    <sweet-alerter type=\"warning\" title=\"Oops\" text=\"Log in please.\"></sweet-alerter>\n    <div login-interface></div>\n</div>\n");
$templateCache.put("components/states/contact/contact.html","<h1>\n    Contact\n</h1>\n\n<hr/>\n\n<form>\n    <div class=\"form-group\">\n        <label for=\"emailInput\">Email</label>\n        <input id=\"emailInput\" class=\"form-control\" ng-model=\"emailInput\">\n    </div>\n\n    <div class=\"form-group\">\n        <label for=\"nameInput\">Name</label>\n        <input id=\"nameInput\" class=\"form-control\" ng-model=\"nameInput\">\n    </div>\n\n    <div class=\"form-group\">\n        <label for=\"messageInput\">Message</label>\n        <textarea class=\"form-control\" ng-model=\"messageInput\" id=\"messageInput\" rows=\"8\"></textarea>\n    </div>\n\n    <div class=\"form-group\">\n        <button type=\"submit\" class=\"btn btn-primary\">Submit</button>\n    </div>\n</form>");
$templateCache.put("components/states/customer/customer.html","<div id=\"uiView\" ui-view></div>\n");
$templateCache.put("components/states/forgot-password/forgot-password.html","<p>&nbsp;</p>\n\n<div small-center-with-logo>\n  <div class=\"well\">\n    <h5>Forgot Password</h5>\n\n    <div collapse=\"sentEmail\">\n      <form name=\"resetForm\" ng-submit=\"submit()\">\n        <div class=\"form-group\">\n          <input class=\"form-control\" placeholder=\"Email\" ng-model=\"email\" required>\n        </div>\n\n        <button class=\"btn btn-primary\" type=\"submit\" ng-disabled=\"resetForm.$invalid || resetForm.$pristine\">Reset Password</button>\n        <button type=\"submit\" class=\"btn btn-default\" ui-sref=\"home\">Back</button>\n      </form>\n    </div>\n\n    <div collapse=\"!sentEmail\">\n      <div class=\"well\">\n        <p>Please check your email for the link to reset your password.</p>\n      </div>\n    </div>\n  </div>\n</div>\n\n\n");
$templateCache.put("components/states/home/home.html","<p>&nbsp;</p>\n\n<div class=\"text-center\" small-center-with-logo access-level=\"accessLevels.anon\">\n  <div class=\"well\">\n    <form name=\"localForm\" ng-submit=\"loginLocal()\">\n      <div class=\"form-group\" show-errors>\n        <label for=\"emailInput\">Email</label>\n        <input type=\"email\" class=\"form-control\" id=\"emailInput\" placeholder=\"Email\" ng-model=\"email\" required  floating-label>\n      </div>\n\n      <div class=\"form-group\" show-errors>\n        <label for=\"passwordInput\">Password</label>\n        <input type=\"password\" class=\"form-control\" id=\"passwordInput\" placeholder=\"Password\" ng-model=\"password\" required  floating-label>\n      </div>\n\n      <div class=\"form-group\">\n        <button type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"localForm.$invalid || localForm.$pristine\">Login</button>\n        <button class=\"btn btn-info\" ui-sref=\"signup\">Sign Up</button>\n      </div>\n    </form>\n\n    <a ui-sref=\"forgot-password\">Forgot Password?</a>\n  </div>\n</div>\n\n\n<div class=\"text-center\" small-center-with-logo access-level=\"accessLevels.user\">\n  <p>\n    Thank you for using Armoire! Please use the menu to the right to navigate around the app. And make sure to ask any questions you have using the Support section.\n  </p>\n</div>\n");
$templateCache.put("components/states/logout/logout.html","<p>Logging out</p>\n");
$templateCache.put("components/states/profile/profile.html","<alert ng-repeat=\"alert in alerts\" type=\"{{alert.type}}\" close=\"closeAlert($index)\"><span ng-bind-html=\"alert.msg\"></span></alert>\n\n<user-avatar user=\"user\"></user-avatar>\n<hr/>\n\n<div class=\"row text-center\">\n  <div class=\"col-xs-6 col-sm-3\">\n    <h4 class=\"\">\n      {{ user.armoires.length }}\n    </h4>\n    <span class=\"label label-info\">Armoires</span>\n  </div>\n\n  <div class=\"col-xs-6 col-sm-3\">\n    <h4 class=\"\">\n      {{ user.totalItems }}\n    </h4>\n    <span class=\"label label-info\">Items</span>\n  </div>\n\n  <div class=\"col-xs-6 col-sm-3\">\n    <h4 class=\"\">\n      {{ user.deliveries.length }}\n    </h4>\n    <span class=\"label label-info\">Deliveries</span>\n  </div>\n\n  <div class=\"col-xs-6 col-sm-3\">\n    <h4 class=\"\">\n      {{ user.supportConvo.messages.length }}\n    </h4>\n    <span class=\"label label-info\">Support Convos</span>\n  </div>\n</div>\n\n<p>&nbsp;</p>\n\n<form name=\"generalForm\" class=\"well\" ng-submit=\"generalFormSubmit()\">\n  <h3><i class=\"fa fa-fw fa-user h6\"></i> Info</h3>\n\n  <div class=\"row\">\n    <div class=\"col-sm-6\">\n      <div class=\"form-group\"  show-errors>\n        <label for=\"firstNameInput\">First Name</label>\n        <input id=\"firstNameInput\" class=\"form-control\"\n               placeholder=\"First Name\"\n               floating-label\n               ng-model=\"user.firstName\">\n      </div>\n    </div>\n\n    <div class=\"col-sm-6\">\n      <div class=\"form-group\"  show-errors>\n        <label for=\"lastNameInput\">Last Name</label>\n        <input id=\"lastNameInput\" class=\"form-control\"\n               placeholder=\"Last Name\"\n               floating-label\n               ng-model=\"user.lastName\">\n      </div>\n    </div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-sm-6\">\n      <div class=\"form-group\"  show-errors>\n        <label for=\"emailInput\">Email</label>\n        <input id=\"emailInput\" class=\"form-control\"\n               type=\"email\"\n               placeholder=\"Email\"\n               floating-label\n               ng-model=\"user.local.email\">\n      </div>\n    </div>\n\n    <div class=\"col-sm-6\">\n      <div class=\"form-group\"  show-errors>\n        <label for=\"phoneInput\">Phone Number</label>\n        <input id=\"phoneInput\" class=\"form-control\"\n               type=\"tel\"\n               placeholder=\"Phone\"\n               floating-label\n               ng-model=\"user.phone\">\n      </div>\n    </div>\n  </div>\n\n  <button type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"generalForm.$invalid || generalForm.$pristine\">Update</button>\n</form>\n\n<form name=\"addressForm\" class=\"well\" ng-submit=\"addressFormSubmit()\">\n  <h3><i class=\"fa fa-fw fa-building-o h6\"></i> Address</h3>\n\n  <div class=\"row\">\n    <div class=\"col-sm-8\">\n      <div class=\"form-group\"  show-errors>\n        <label for=\"aStreetInput\">Street</label>\n        <input id=\"aStreetInput\" class=\"form-control\"\n               placeholder=\"Street\"\n               floating-label\n               ng-model=\"user.address.street_1\">\n      </div>\n    </div>\n\n    <div class=\"col-sm-4\">\n      <div class=\"form-group\"  show-errors>\n        <label for=\"aStreetSecondaryInput\">Apt/Suite</label>\n        <input id=\"aStreetSecondaryInput\" class=\"form-control\"\n               placeholder=\"Apt/Suite\"\n               floating-label\n               ng-model=\"user.address.street_2\">\n      </div>\n    </div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-sm-8\">\n      <div class=\"form-group\"  show-errors>\n        <label for=\"aCityInput\">City</label>\n        <input id=\"aCityInput\" class=\"form-control\"\n               placeholder=\"City\"\n               floating-label\n               ng-model=\"user.address.city\"\n               typeahead=\"city for city in cities | filter:$viewValue | limitTo:8\">\n      </div>\n    </div>\n\n    <div class=\"col-sm-4\">\n      <div class=\"form-group\"  show-errors>\n        <label for=\"aZipInput\">Zip</label>\n        <input id=\"aZipInput\" class=\"form-control\"\n               placeholder=\"Zip\"\n               floating-label\n               ng-model=\"user.address.zip\">\n      </div>\n    </div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-xs-6\">\n      <div class=\"form-group\"  show-errors>\n        <label for=\"aStateInput\">State</label>\n        <select id=\"aStateInput\" name=\"aStateInput\" class=\"form-control\"\n                floating-label\n                ng-model=\"user.address.state\"\n                ng-options=\"state.state as state.state for state in states\"></select>\n      </div>\n    </div>\n\n    <div class=\"col-xs-6\">\n      <div class=\"form-group\"  show-errors>\n        <label for=\"aCountryInput\">Country</label>\n        <select id=\"aCountryInput\" class=\"form-control\"\n                floating-label\n                ng-model=\"user.address.country\"\n                ng-options=\"country.country as country.country for country in regions\"></select>\n      </div>\n    </div>\n  </div>\n\n  <button class=\"btn btn-primary\" ng-disabled=\"addressForm.$invalid || addressForm.$pristine\">Update Address</button>\n</form>\n\n<!-- Billing -->\n<div billing user=\"user\" mini=\"true\" class=\"well\"></div>\n<!-- /Billing -->\n\n<form name=\"passwordForm\" class=\"well\" ng-submit=\"passwordFormSubmit()\">\n  <h3><i class=\"fa fa-fw fa-key h6\"></i> Password</h3>\n\n  <div class=\"row\">\n    <div class=\"form-group col-sm-6\" floating-label show-errors>\n      <label for=\"passwordInput\">Password</label>\n      <input id=\"passwordInput\" name=\"passwordInput\" class=\"form-control\"\n             required\n             type=\"password\"\n             placeholder=\"6-20 chars. 1 capitol. 1 number.\"\n             floating-label\n             ng-model=\"password\"\n             ng-pattern=\"validationPatterns.password\">\n    </div>\n\n    <div class=\"form-group col-sm-6\" floating-label show-errors>\n      <label for=\"passwordRepeatInput\">Repeat</label>\n      <input id=\"passwordRepeatInput\" name=\"passwordRepeatInput\" class=\"form-control\"\n             type=\"password\"\n             required\n             placeholder=\"Repeat new password\"\n             floating-label\n             ng-model=\"passwordRepeatInput\"\n             require-mirror-input=\"passwordInput\">\n    </div>\n  </div>\n\n  <!--<span class=\"help-block\"><small>Password must be 6 - 20 characters, and must include at least one upper case letter, one lower case letter, and one numeric digit.</small></span>-->\n\n  <button type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"passwordForm.$invalid || passwordForm.$pristine\">Update\n    Password\n  </button>\n</form>\n");
$templateCache.put("components/states/reset-password/reset-password.html","<form name=\"resetForm\" class=\"well col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3\" ng-submit=\"submit()\">\n  <h5>Reset Password</h5>\n\n  <div class=\"form-group\">\n    <input class=\"form-control\" type=\"password\" placeholder=\"Password\" ng-model=\"password\" required>\n  </div>\n\n  <div class=\"form-group\">\n    <input class=\"form-control\" type=\"password\" placeholder=\"Password Confirm\" ng-model=\"passwordConfirm\" required>\n  </div>\n\n  <button class=\"btn btn-primary\" type=\"submit\" ng-disabled=\"resetForm.$invalid || resetForm.$pristine || passwordConfirm != password\">Reset Password</button>\n</form>\n");
$templateCache.put("components/states/signup/signup.html","\n<form name=\"nameForm\" ng-submit=\"formSubmit()\">\n  <div class=\"row\">\n    <div small-center-with-logo></div>\n  </div>\n\n  <div class=\"well\">\n    <h3 class=\"text-dark\">Sign Up</h3>\n\n    <div class=\"row\">\n      <div class=\"col-sm-6\">\n        <div class=\"form-group\" floating-label show-errors>\n          <label for=\"user_firstName\">First Name</label>\n          <input id=\"user_firstName\" name=\"user_firstName\" class=\"form-control\"\n                 type=\"text\"\n                 required\n                 placeholder=\"Must be at least 3 characters long.\"\n                 ng-model=\"user.firstName\"\n                 ng-pattern=\"validationPatterns.firstName\">\n        </div>\n      </div>\n\n      <div class=\"col-sm-6\">\n        <div class=\"form-group\" floating-label show-errors>\n          <label for=\"user_lastName\">Last Name</label>\n          <input id=\"user_lastName\" name=\"user_lastName\" class=\"form-control\"\n                 type=\"text\"\n                 required\n                 placeholder=\"Must be at least 3 characters long.\"\n                 ng-model=\"user.lastName\"\n                 ng-pattern=\"validationPatterns.lastName\">\n        </div>\n      </div>\n    </div>\n\n    <div class=\"row\">\n      <div class=\"col-sm-6\">\n        <div class=\"form-group\" floating-label show-errors>\n          <label for=\"user_email\">Email</label>\n          <input id=\"user_email\" name=\"user_email\" class=\"form-control\"\n                 type=\"email\"\n                 required\n                 placeholder=\"Email\"\n                 ng-model=\"user.local.email\">\n        </div>\n      </div>\n\n      <div class=\"col-sm-6\">\n        <div class=\"form-group\" floating-label show-errors>\n          <label for=\"phoneInput\">Phone Number</label>\n          <input id=\"phoneInput\" class=\"form-control\"\n                 type=\"tel\"\n                 required\n                 ng-model=\"user.phone\"\n                 placeholder=\"Phone\">\n        </div>\n      </div>\n    </div>\n\n    <div class=\"row\">\n      <div class=\"col-sm-6\">\n        <div class=\"form-group\" floating-label show-errors>\n          <label for=\"user_password\">Password</label>\n          <input id=\"user_password\" name=\"user_password\" class=\"form-control\"\n                 type=\"password\"\n                 required\n                 ng-model=\"user.local.password\"\n                 placeholder=\"6-20 chars. 1 capitol. 1 number.\"\n                 ng-pattern=\"validationPatterns.password\">\n        </div>\n      </div>\n\n      <div class=\"col-sm-6\">\n        <div class=\"form-group\" floating-label show-errors>\n          <label for=\"user_passwordRepeat\">Repeat</label>\n          <input id=\"user_passwordRepeat\" name=\"user_passwordRepeat\" class=\"form-control\"\n                 type=\"password\"\n                 required\n                 ng-model=\"user.local.passwordRepeat\"\n                 require-mirror-input=\"user_password\">\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <button type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"nameForm.$invalid || nameForm.$pristine\">Sign Up</button>\n  <button class=\"btn btn-info\" ui-sref=\"home\"><i class=\"fa fa-fw fa-chevron-left\"></i> Login</button>\n</form>\n\n<div class=\"loading loading-fullscreen\" collapse=\"!processing\">\n  <div class=\"icon-container\">\n    <div class=\"fa-stack\">\n      <i class=\"fa fa-spin fa-stack-1x fa-circle-o-notch\"></i>\n      <i class=\"fa fa-spin fa-stack-2x fa-circle-o-notch\"></i>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("components/states/admin/customer/customer.html","<div ui-view >\n  <div class=\"well well-sm\">\n    <div class=\"form-group\">\n      <input class=\"form-control\" placeholder=\"Search\" ng-model=\"search\">\n    </div>\n\n    <div class=\"breakout\">\n      <table class=\"table table-striped\">\n        <thead>\n        <tr>\n          <th>Name</th>\n          <th class=\"hidden-xs\">Email</th>\n          <th>\n            <small>Items</small>\n            /Armoires\n          </th>\n          <th class=\"hidden-xs\">Billable</th>\n          <th class=\"hidden-xs\">Details</th>\n        </tr>\n        </thead>\n\n        <tbody>\n        <tr class=\"cursor-pointer\"\n            ng-repeat=\"user in users | filter:search\"\n            ui-sref=\".show({ id: user.id })\"\n            ng-class=\"{\'info\':user.isCurrentUser}\"\n          >\n          <td>\n            <span ng-if=\"user.isCurrentUser\">\n              <strong><i>YOU</i></strong>\n            </span>\n\n            <span ng-if=\"!user.isCurrentUser\">\n              {{ user.firstName }} {{ user.lastName }}\n            </span>\n          </td>\n          <td class=\"hidden-xs\">{{ user.local.email }}</td>\n          <td>\n            <small>\n              {{ user.totalItems }}\n            </small>\n            /\n            {{ user.armoires.length }}\n          </td>\n          <td class=\"hidden-xs\">\n            <i class=\"fa\" ng-class=\"{\'fa-check-circle\':user.isBillable, \'fa-exclamation-circle\':!user.isBillable}\"></i>\n          </td>\n          <td class=\"hidden-xs\">\n            <ul class=\"list-inline list-inline-tight\" style=\"margin-bottom:0\">\n            <li ng-if=\"user.isAdmin\"><small class=\"label label-info\">ADMIN</small></li>\n            <li ng-if=\"!user.isProfileComplete\"><small class=\"label label-danger\">Incomplete Profile</small></li>\n            <li ng-if=\"!fetchedUser.seeded\"><small class=\"label label-default\">Seeded</small></li>\n            </ul>\n          </td>\n        </tr>\n        </tbody>\n      </table>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("components/states/admin/delivery/delivery.html","<div class=\"panel panel-primary\" collapse=\"currentDeliveries.length == 0\">\n  <div class=\"panel-heading pointer\" ng-click=\"hideCurrent = !hideCurrent\">\n    Current\n\n    <small>\n      <strong>({{ currentDeliveries.length }})</strong>\n    </small>\n\n    <div class=\"pull-right\">\n      <i class=\"fa fa-lg fa-chevron-up\" ng-if=\"!hideCurrent\"></i>\n      <i class=\"fa fa-lg fa-chevron-down\" ng-if=\"hideCurrent\"></i>\n    </div>\n  </div>\n\n  <div class=\"panel-body\">\n    <div collapse=\"!hideCurrent\">\n      {{ currentDeliveries.length }} deliveries\n    </div>\n\n    <div collapse=\"hideCurrent\">\n      <ul class=\"list-unstyled\">\n        <li ng-repeat=\"(dI, d) in currentDeliveries\" ng-init=\"dCollapsed = true;\">\n          <div delivery-item delivery=\"d\" on-update=\"refresh()\"></div>\n          <hr ng-if=\"!$last\"/>\n        </li>\n      </ul>\n\n      <div ng-if=\"!currentDeliveries.length\">\n        <p>No current deliveries...</p>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"panel panel-default\" collapse=\"futureDeliveries.length == 0\">\n  <div class=\"panel-heading pointer\" ng-click=\"hideUpcoming = !hideUpcoming\">\n    Upcoming\n\n    <small>\n      <strong>({{ futureDeliveries.length }})</strong>\n    </small>\n\n    <div class=\"pull-right\">\n      <i class=\"fa fa-lg fa-chevron-up\" ng-if=\"!hideUpcoming\"></i>\n      <i class=\"fa fa-lg fa-chevron-down\" ng-if=\"hideUpcoming\"></i>\n    </div>\n  </div>\n\n  <div class=\"panel-body\">\n    <div collapse=\"!hideUpcoming\">\n      {{ futureDeliveries.length }} deliveries\n    </div>\n\n    <div collapse=\"hideUpcoming\">\n      <ul class=\"list-unstyled\">\n        <li ng-repeat=\"(dI, d) in futureDeliveries\" ng-init=\"dCollapsed = true;\">\n          <div delivery-item delivery=\"d\" on-update=\"refresh()\"></div>\n          <hr ng-if=\"!$last\"/>\n        </li>\n      </ul>\n\n      <div ng-if=\"!futureDeliveries.length\">\n        <p>No upcoming deliveries...</p>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"panel panel-success\" collapse=\"finishedDeliveries.length == 0\">\n  <div class=\"panel-heading pointer\" ng-click=\"hideCompleted = !hideCompleted\">\n    Completed\n\n    <small>\n      <strong>({{ finishedDeliveries.length }})</strong>\n    </small>\n\n    <div class=\"pull-right\">\n      <i class=\"fa fa-lg fa-chevron-up\" ng-if=\"!hideCompleted\"></i>\n      <i class=\"fa fa-lg fa-chevron-down\" ng-if=\"hideCompleted\"></i>\n    </div>\n  </div>\n\n  <div class=\"panel-body\">\n    <div collapse=\"!hideCompleted\">\n      {{ finishedDeliveries.length }} deliveries\n    </div>\n\n    <div collapse=\"hideCompleted\">\n      <ul class=\"list-unstyled\">\n        <li ng-repeat=\"(dI, d) in finishedDeliveries | orderBy:\'modifiedAt\'\">\n          <div delivery-item delivery=\"d\" on-update=\"refresh()\"></div>\n          <hr ng-if=\"!$last\"/>\n        </li>\n      </ul>\n\n      <div ng-if=\"!finishedDeliveries.length\">\n        <p>No finished deliveries...</p>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"panel panel-danger\" collapse=\"canceledDeliveries.length == 0\">\n  <div class=\"panel-heading pointer\" ng-click=\"hideCancelled = !hideCancelled\">\n    Cancelled\n\n    <small>\n      <strong>({{ canceledDeliveries.length }})</strong>\n    </small>\n\n    <div class=\"pull-right\">\n      <i class=\"fa fa-lg fa-chevron-up\" ng-if=\"!hideCancelled\"></i>\n      <i class=\"fa fa-lg fa-chevron-down\" ng-if=\"hideCancelled\"></i>\n    </div>\n  </div>\n\n  <div class=\"panel-body\">\n    <div collapse=\"!hideCancelled\">\n      {{ canceledDeliveries.length }} deliveries\n    </div>\n\n    <div collapse=\"hideCancelled\">\n      <ul class=\"list-unstyled\">\n        <li ng-repeat=\"(dI, d) in canceledDeliveries | orderBy:\'modifiedAt\'\">\n          <div delivery-item delivery=\"d\" on-update=\"refresh()\"></div>\n          <hr ng-if=\"!$last\"/>\n        </li>\n      </ul>\n\n      <div ng-if=\"!canceledDeliveries.length\">\n        <p>No cancelled deliveries...</p>\n      </div>\n    </div>\n  </div>\n</div>\n\n\n<!--<json-formatter json=\"this\"></json-formatter>-->\n");
$templateCache.put("components/states/admin/index/index.html","<div class=\"row\">\n  <div class=\" text-center col-xs-12 col-sm-4\">\n    <a ui-sref=\"admin.customer\" class=\"btn btn-block btn-primary btn-big\">\n      <i class=\"fa fa-2x fa-users\"></i>\n      <br/>\n      Customers\n    </a>\n  </div>\n\n  <div class=\" text-center col-xs-12 col-sm-4\">\n    <a ui-sref=\"admin.delivery\" class=\"btn btn-block btn-primary btn-big\">\n      <i class=\"fa fa-2x fa-truck\"></i>\n      <br/>\n      Deliveries\n    </a>\n  </div>\n\n  <div class=\" text-center col-xs-12 col-sm-4\">\n    <a ui-sref=\"admin.pricing\" class=\"btn btn-block btn-primary btn-big\">\n      <i class=\"fa fa-2x fa-money\"></i>\n      <br/>Pricing\n    </a>\n  </div>\n</div>\n\n<div id=\"uiView\" ui-view></div>\n");
$templateCache.put("components/states/admin/pricing/armoire.html","<div armoire-type-admin item=\"newType\" on-create=\"onNewType()\"></div>\n\n<div class=\"anim-fade anim-scale\" armoire-type-admin item=\"item\" on-destroy=\"onDestroy()\" ng-repeat=\"item in armoireTypes | orderBy: \'-createdAt\'\"></div>\n\n<p>&nbsp;</p>\n");
$templateCache.put("components/states/admin/pricing/clothing.html","<div clothing-type-admin item=\"newType\" on-create=\"onNewType()\"></div>\n\n<div class=\"anim-fade anim-scale\" clothing-type-admin item=\"item\" on-destroy=\"onDestroy()\" ng-repeat=\"item in clothingTypes | orderBy: \'-createdAt\'\"></div>\n\n<p>&nbsp;</p>\n");
$templateCache.put("components/states/admin/pricing/pricing.html","<tabs data=\"tabData\"></tabs>\n\n<p>&nbsp;</p>\n\n<ui-view></ui-view>\n");
$templateCache.put("components/states/admin/stats/stats.html","<div class=\"well\">\n  <h6><a ui-sref=\"^.index\"><i class=\"fa fa-fw fa-angle-left\"></i> Admin</a></h6>\n\n  <h3>Deliveries</h3>\n  <div id=\"deliveries-new-chart\" class=\"ct-chart\"></div>\n\n  <h3>New Users</h3>\n  <div id=\"users-new-chart\" class=\"ct-chart\"></div>\n\n  <h3>Referals</h3>\n  <div id=\"users-referral-chart\" class=\"ct-chart\"></div>\n\n  <h3>Cash Flow</h3>\n  <div id=\"cash-chart\" class=\"ct-chart\"></div>\n</div>\n");
$templateCache.put("components/states/admin/support/support.html","<ul class=\"breadcrumb\">\n  <li><a ui-sref=\"^.index\">Admin</a></li>\n  <li>Customers</li>\n</ul>\n\n<div class=\"well\">\n  <!--<h6><a ui-sref=\"^.index\"><i class=\"fa fa-fw fa-angle-left\"></i> Admin</a></h6>-->\n  <div class=\"form-group\">\n    <input class=\"form-control\" placeholder=\"Search\" ng-model=\"search\">\n  </div>\n\n  <table class=\"table table-striped\">\n    <thead>\n    <tr>\n      <th>Name</th>\n      <th class=\"hidden-xs\">Email</th>\n      <th class=\"hidden-xs\">Messages</th>\n      <th>Last Message</th>\n    </tr>\n    </thead>\n\n    <tbody>\n    <tr class=\"cursor-pointer\" ng-repeat=\"user in users | orderBy: \'-supportConvo.modifiedAt | filter:search\'\" ui-sref=\"admin.customersDetail({ id: user.id })\" ng-class=\"{\'info\':user.isCurrentUser}\">\n      <td>\n          <span ng-if=\"user.isCurrentUser\">\n            <strong><i>YOU</i></strong>\n          </span>\n\n          <span ng-if=\"!user.isCurrentUser\">\n            {{ user.firstName }} {{ user.lastName }}\n          </span>\n      </td>\n      <td class=\"hidden-xs\">{{ user.local.email }}</td>\n      <td class=\"hidden-xs\">{{ user.supportConvo.messages.length }}</td>\n      <td>{{ user.supportConvo.modifiedAtReadable }}</td>\n    </tr>\n    </tbody>\n  </table>\n</div>\n");
$templateCache.put("components/states/customer/armoires/armoires.html","<ui-view>\n  <div class=\"alert alert-warning\" ng-if=\"!currentUser.isBillable\">\n    <h4>Almost there...</h4>\n\n    <p>You need to update your billing information before adding any Armoires.</p>\n\n    <p>&nbsp;</p>\n    <a class=\"btn btn-primary\" ui-sref=\"profile\">Go to Profile</a>\n  </div>\n\n  <div ng-if=\"currentUser.isBillable && currentUser.armoires.length\">\n    <h4>My Armoires</h4>\n\n    <div ng-if=\"currentUser.armoires.length\">\n      <div class=\"row\">\n        <div class=\"armoire col-xs-12 col-sm-6 col-md-4 text-center\" ng-repeat=\"armoire in currentUser.armoires\">\n          <a class=\"btn btn-block btn-primary\" ui-sref=\".show({ armoireId: armoire.id })\">\n            <h4 class=\"text-white\">{{ armoire.name }}</h4>\n\n            <p class=\"text-white\">\n              {{ armoire.items | countNonDelivered }} <small>items</small>\n            </p>\n\n            <p class=\"label label-info\">\n              {{ armoire.type.title }}\n            </p>\n          </a>\n        </div>\n      </div>\n    </div>\n    <hr/>\n  </div>\n\n  <h4>Add Another</h4>\n\n  <div class=\"row\">\n    <div class=\"col-xs-12 col-sm-6\" ng-repeat=\"aType in armoireTypes | orderBy: \'price\'\">\n      <ul class=\"list-unstyled\">\n        <li class=\"well\">\n          <p class=\"h4\">{{ aType.title }}</p>\n\n          <p ng-bind-html=\"aType.description\"></p>\n          <button class=\"btn btn-primary\" ui-sref=\".create({ armoireType: aType.id })\">Choose {{ aType.title }}</button>\n        </li>\n      </ul>\n    </div>\n  </div>\n</ui-view>\n");
$templateCache.put("components/states/customer/billing/billing.html","<div billing user=\"user\" class=\"well\"></div>\n");
$templateCache.put("components/states/customer/index/index.html","<div class=\"alert alert-warning\" ng-if=\"!user.isBillable\">\n  <h4>Almost there...</h4>\n\n  <p>You need to update your billing information before adding any Armoires.</p>\n\n  <p>&nbsp;</p>\n\n  <a class=\"btn btn-primary\" ui-sref=\"profile\">Go to Profile</a>\n</div>\n\n<div class=\"well\" ng-show=\"user.isBillable\">\n  <div class=\"form-group\">\n    <input class=\"form-control\" placeholder=\"Search\" ng-model=\"q\">\n  </div>\n</div>\n\n<div class=\"row\" ng-show=\"user.isBillable\">\n  <div class=\"col-xs-6 col-sm-4 col-sm-3 col-md-2\" ng-repeat=\"item in clothes | filter:q | orderBy: \'-createdAt\'\" ng-hide=\"item.status === \'delivered\'\">\n    <div clothing-item item=\"item\" hide-deliver-button=\"true\"></div>\n  </div>\n</div>\n");
$templateCache.put("components/states/customer/settings/settings.html","<h3>Info</h3>\n\n<div class=\"row\">\n    <div class=\"col-sm-6\">\n        <div class=\"form-group\">\n            <label for=\"fNameInput\">First Name</label>\n            <input id=\"fNameInput\" class=\"form-control\" ng-model=\"user.fName\" placeholder=\"First Name\">\n        </div>\n    </div>\n\n    <div class=\"col-sm-6\">\n        <div class=\"form-group\">\n            <label for=\"lNameInput\">Last Name</label>\n            <input id=\"lNameInput\" class=\"form-control\" ng-model=\"user.lName\" placeholder=\"Last Name\">\n        </div>\n    </div>\n</div>\n\n<div class=\"form-group\">\n    <label for=\"emailInput\">Email</label>\n    <input id=\"emailInput\" class=\"form-control\" ng-model=\"user.email\" type=\"email\" placeholder=\"Email\">\n</div>\n\n<hr/>\n\n<h3>Address</h3>\n\n<div class=\"row\">\n    <div class=\"col-sm-8\">\n        <div class=\"form-group\">\n            <!--<label for=\"aStreetInput\">Street</label>-->\n            <input id=\"aStreetInput\" class=\"form-control\" ng-model=\"user.aStreet\" placeholder=\"Street\">\n        </div>\n    </div>\n\n    <div class=\"col-sm-4\">\n        <div class=\"form-group\">\n            <!--<label for=\"aStreetSecondaryInput\">Last Name</label>-->\n            <input id=\"aStreetSecondaryInput\" class=\"form-control\" ng-model=\"user.aStreetSecondary\" placeholder=\"Apt\">\n        </div>\n    </div>\n</div>\n\n<div class=\"row\">\n    <div class=\"col-sm-8\">\n        <div class=\"form-group\">\n            <!--<label for=\"aCityInput\">Last Name</label>-->\n            <input id=\"aCityInput\" class=\"form-control\" ng-model=\"user.aCity\" placeholder=\"City\" typeahead=\"city for city in aStateInput.cities | filter:$viewValue | limitTo:8\">\n        </div>\n    </div>\n\n    <div class=\"col-sm-4\">\n        <div class=\"form-group\">\n            <!--<label for=\"aZipInput\">Zip</label>-->\n            <input id=\"aZipInput\" class=\"form-control\" ng-model=\"user.aZip\" placeholder=\"Zip\">\n        </div>\n    </div>\n</div>\n\n<div class=\"row\">\n    <div class=\"col-xs-6\">\n        <div class=\"form-group\">\n            <label>State</label>\n            <select id=\"aStateInput\" ng-model=\"user.aState\" class=\"form-control\" ng-options=\"state as state.state for state in aCountryInput.states\"></select>\n        </div>\n    </div>\n\n    <div class=\"col-xs-6\">\n        <div class=\"form-group\">\n            <label>Country</label>\n            <select id=\"aCountryInput\" ng-model=\"user.aCountry\" class=\"form-control\" ng-options=\"country as country.country for country in regions\"></select>\n        </div>\n    </div>\n</div>\n\n<hr/>\n\n<h3>Password</h3>\n\n<div class=\"row\">\n    <div class=\"form-group col-sm-4\">\n        <label for=\"currentPasswordInput\">Current Password</label>\n        <input id=\"currentPasswordInput\" class=\"form-control\" ng-model=\"currentPassword\" type=\"password\" placeholder=\"Current password\">\n    </div>\n\n    <div class=\"form-group col-sm-4\">\n        <label for=\"passwordInput\">Password</label>\n        <input id=\"passwordInput\" class=\"form-control\" ng-model=\"password\" type=\"password\" placeholder=\"New password\">\n    </div>\n\n    <div class=\"form-group col-sm-4\">\n        <label>Repeat</label>\n        <input class=\"form-control\" ng-model=\"passwordRepeatInput\" type=\"password\" placeholder=\"Repeat new password\">\n    </div>\n</div>\n\n<button class=\"btn btn-primary\">Update</button>");
$templateCache.put("components/states/customer/support/support.html","<div class=\"messages\">\n  <ul class=\"list-unstyled\">\n    <li class=\"message\" ng-repeat=\"message in support.messages\" ng-class=\"{\'from-user\':message.owner.id == currentUser.id}\">\n      <div class=\"message-body\" ng-bind-html=\"message.content\"></div>\n\n      <div class=\"message-footer\">\n        <div class=\"label label-primary\" ng-if=\"message.owner.id == currentUser.id\">You</div>\n        <div class=\"label label-info\" ng-if=\"!message.owner\">App</div>\n        <div class=\"label label-success\" ng-if=\"message.owner && message.owner.id != currentUser.id\">{{ message.owner.firstName}} {{ message.owner.lastName}}</div>\n\n            <span class=\"message-date\">\n              <small>&nbsp; {{ message.createdAtReadable }}</small>\n            </span>\n      </div>\n    </li>\n  </ul>\n</div>\n\n<div id=\"reply-box\" class=\"panel\">\n  <div class=\"container\">\n    <form name=\"messageForm\" class=\"panel-body\" ng-submit=\"sendMessage()\">\n\n      <div class=\"form-group\">\n        <textarea id=\"message\" name=\"message\" class=\"form-control\" placeholder=\"How can we assist you?\" ng-model=\"message\" required ng-disabled=\"sendingMessage\"></textarea>\n      </div>\n\n      <button type=\"submit\" class=\"btn btn-block btn-primary\" ng-disabled=\"messageForm.$invalid || messageForm.$pristine || sendingMessage\">Send</button>\n    </form>\n  </div>\n</div>\n\n<div id=\"after-messages\"></div>\n");
$templateCache.put("components/states/admin/customer/show/armoire.html","<div ui-view class=\"well\">\n  <div ng-if=\"!fetchedUser.armoires.length\">\n    No Armoires yet.\n  </div>\n\n  <ul class=\"list-inline armoire-list row\">\n    <li class=\"armoire-list-item col-xs-12 col-sm-6 col-md-3\" ng-repeat=\"armoire in fetchedUser.armoires\">\n      <div class=\"btn btn-primary btn-block\" ui-sref=\".single({ armoireId: armoire.id })\">\n        <h4 class=\"text-white\">\n          {{ armoire.name }}\n        </h4>\n\n        <ul class=\"list-unstyled\">\n          <li>\n            <h6 class=\"text-info\">\n              <strong>{{ armoire.type.title }}</strong>\n              <span class=\"text-muted\"> - </span>\n              <strong>{{ armoire.items.length }} Items</strong>\n            </h6>\n          </li>\n          <li>{{ armoire.createdAtReadable }}</li>\n          <li>&nbsp;</li>\n        </ul>\n      </div>\n    </li>\n  </ul>\n</div>\n");
$templateCache.put("components/states/admin/customer/show/armoire.single.html","<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <h4>\n      {{ armoire.name }}\n    </h4>\n  </div>\n</div>\n\n<div class=\"row\">\n  <div class=\"col-sm-12\">\n    <h5 class=\"hidden-xs\">\n      Info\n    </h5>\n\n    <ul class=\"list-unstyled\">\n      <li>\n        Type:\n        <strong>{{ armoire.type.title }}</strong>\n      </li>\n      <li>\n        Ordered:\n        <strong>{{ armoire.createdAtReadable }}</strong>\n      </li>\n      <li>\n        Total Items:\n        <strong>{{ armoire.items.length }}</strong>\n      </li>\n    </ul>\n  </div>\n</div>\n\n<hr/>\n\n<div class=\"pull-right\">\n  <div class=\"text-right\" collapse=\"addNew\">\n    <a class=\"btn btn-primary\" ng-click=\"showAddNew()\">\n      <i class=\"fa fa-fw fa-plus\"></i>\n      Add Item\n    </a>\n  </div>\n\n  <div class=\"text-right\" collapse=\"!addNew\">\n    <a class=\"btn btn-danger\" ng-click=\"hideAddNew()\">\n      <i class=\"fa fa-fw fa-minus\"></i>\n      Cancel\n    </a>\n  </div>\n</div>\n\n<div collapse=\"!addNew\">\n  <new-armoire-item\n    new-item=\"newItem\"\n    armoire=\"armoire\"\n    clothing-types=\"clothingTypes\"\n    reset-item=\"resetItem(flow)\"\n    on-img-added=\"onImgAdded(file)\"\n    save-item=\"saveItem(flow)\">\n    </new-armoire-item>\n</div>\n\n<h5>\n  Items\n</h5>\n\n<p>&nbsp;</p>\n\n<ul class=\"list-unstyled row\">\n  <li class=\"col-xs-6 col-sm-4 col-md-3 col-lg-2\" ng-repeat=\"item in armoire.items\" ng-if=\"item.status != \'delivered\'\">\n    <div clothing-item item=\"item\"></div>\n  </li>\n</ul>\n");
$templateCache.put("components/states/admin/customer/show/billing.html","<div class=\"customer-billing well\">\n\n  <div class=\"row\" ng-if=\"fetchedUser.isProfileComplete\">\n    <div class=\"col-xs-12\">\n      <form name=\"billingChargeForm\" class=\"well\" ng-submit=\"addCharge(newCharge, billingChargeForm.$valid)\">\n        <h4><i class=\"fa fa-fw fa-credit-card h6\"></i>Charge Customer</h4>\n\n        <div class=\"row\">\n          <div class=\"col-xs-12\">\n            <div class=\"form-group\" show-errors>\n              <label for=\"amountInput\">Amount</label>\n              <div class=\"input-group\">\n                <div class=\"input-group-addon\">$</div>\n                <input id=\"amountInput\" type=\"number\" step=\"any\" class=\"form-control\" placeholder=\"Amount\" ng-model=\"newCharge.amount\">\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"row\">\n          <div class=\"col-xs-12\">\n            <div class=\"form-group\" show-errors>\n              <label for=\"descrInput\">Description</label>\n              <input id=\"descrInput\" type=\"text\" class=\"form-control\" placeholder=\"Description\" ng-model=\"newCharge.description\">\n            </div>\n          </div>\n        </div>\n        <button type=\"submit\" class=\"btn btn-primary\" ng-disabled=\"billingChargeForm.$pristine\">Submit Charge</button>\n      </form>\n\n    </div>\n  </div>\n  <div class=\"row\" ng-if=\"fetchedUser.isProfileComplete\">\n    <div class=\"col-xs-12\">\n      <h4>Charges</h4>\n\n      <ul class=\"list-unstyled\" ng-if=\"showCharges && charges.length\">\n        <li ng-repeat=\"charge in charges\">\n          <div class=\"row\">\n            <h5 class=\"col-xs-8\">\n              [{{ (charge.created * 1000) | date:\'MM/dd/yyyy\' }}]\n              {{ charge.description }}\n            </h5>\n            <h5 class=\"col-xs-4 text-right\">\n              <small>$</small>\n              {{ charge.amount | centscurrency }}\n            </h5>\n          </div>\n          <div class=\"row\">\n            <p class=\"col-xs-8\">\n              <span ng-if=\"charge.source.object == \'card\'\">{{ charge.source.brand }} ending in {{ charge.source.last4 }}</span>\n              <span ng-if=\"charge.source.object != \'card\'\">&nbsp;</span>\n            </p>\n            <p class=\"col-xs-4 text-right\">\n              <small class=\"text-warning\" ng-if=\"charge.amount_refunded > 0\">\n                <span ng-if=\"charge.refunded\">Full Refund</span>\n                <span ng-if=\"!charge.refunded\">Partial Refund: ${{ charge.amount_refunded | centscurrency }}</span>\n              </small>\n            </p>\n          </div>\n\n          <hr ng-if=\"!$last\"/>\n        </li>\n      </ul>\n\n      <div ng-if=\"showCharges && !charges.length\">\n        <p>Customer does not have any charges.</p>\n      </div>\n\n      <div ng-if=\"!showCharges\">\n        <p>Loading charges...</p>\n      </div>\n\n    </div>\n  </div>\n\n  <div class=\"row\" ng-if=\"!fetchedUser.isProfileComplete\">\n    <div class=\"col-xs-12\">\n      User needs to complete profile first!\n    </div>\n  </div>\n\n</div>\n");
$templateCache.put("components/states/admin/customer/show/delivery.html","<div class=\"well\">\n  <ul class=\"list-unstyled\">\n    <li ng-repeat=\"delivery in fetchedUser.deliveries\">\n      <div delivery-item delivery=\"delivery\"></div>\n      <hr ng-if=\"!$last\"/>\n    </li>\n  </ul>\n</div>\n\n<div class=\"well\" ng-if=\"!fetchedUser.deliveries.length\">\n  No deliveries for this customer.\n</div>\n");
$templateCache.put("components/states/admin/customer/show/profile.html","<div class=\"well well-sm\">\n  <div class=\"row\">\n    <div class=\"col-xs-12 col-sm-3\">\n      <h4>Email</h4>\n\n      <p>{{ fetchedUser.local.email }}</p>\n    </div>\n\n    <div class=\"col-xs-6 col-sm-3\">\n      <h4>Phone</h4>\n\n      <p>\n        <a href=\"tel:{{ fetchedUser.phone }}\" ng-if=\"fetchedUser.phone\">{{ fetchedUser.phone }}</a>\n        <strong class=\"text-danger\" ng-if=\"!fetchedUser.phone\">N/A</strong>\n      </p>\n    </div>\n\n    <div class=\"col-xs-6 col-sm-3\">\n      <h4>Billable</h4>\n\n      <p class=\"text-success\" ng-if=\"fetchedUser.isBillable\">\n        YES!\n      </p>\n\n      <p class=\"text-danger\" ng-if=\"!fetchedUser.isBillable\">\n        <strong>NO!</strong><br/>\n      </p>\n    </div>\n\n    <div class=\"col-xs-12 col-sm-3\">\n      <h4>Address</h4>\n      <address class=\"vcard\" ng-if=\"fetchedUser.address\">\n                <span class=\"adr\">\n                    <span class=\"street-address\">{{ fetchedUser.address.street_1 }} {{ fetchedUser.address.street_2 }}</span> <br/>\n                    <span class=\"locality\">{{ fetchedUser.address.city }}</span>,\n                    <span class=\"region\">{{ fetchedUser.address.state }}</span> <br/>\n                    <span class=\"postal-code\">{{ fetchedUser.address.zip }}</span>\n                    <span class=\"country-name\">{{ fetchedUser.address.country }}</span>\n                </span>\n      </address>\n\n      <div class=\"text-danger\" ng-if=\"!fetchedUser.address\">\n        <strong>N/A</strong>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("components/states/admin/customer/show/show.html","<h3>\n  {{ fetchedUser.firstName }} {{ fetchedUser.lastName }}\n</h3>\n\n<ul class=\"list-inline list-inline-tight\">\n  <li ng-if=\"fetchedUser.isAdmin\"><small class=\"label label-info\">ADMIN</small></li>\n  <li ng-if=\"fetchedUser.id === currentUser.id\"><small class=\"label label-info\">YOU</small></li>\n  <li ng-if=\"fetchedUser.isProfileComplete\"><small class=\"label label-success\">Completed Profile</small></li>\n  <li ng-if=\"!fetchedUser.isProfileComplete\"><small class=\"label label-danger\">Incomplete Profile</small></li>\n  <li ng-if=\"!fetchedUser.seeded\"><small class=\"label label-default\">Seeded</small></li>\n</ul>\n\n<tabs data=\"tabData\"></tabs>\n\n<div class=\"well well-sm\">\n  <ui-view></ui-view>\n</div>\n\n");
$templateCache.put("components/states/admin/customer/show/supportConvo.html","<div class=\"well well-sm messages\">\n  <ul class=\"list-unstyled\">\n    <li class=\"message\" ng-repeat=\"message in support.messages\" ng-class=\"{\'from-user\':message.owner.id == currentUser.id}\">\n      <div class=\"message-body\" ng-bind-html=\"message.content\"></div>\n\n      <div class=\"message-footer\">\n        <div class=\"label label-primary\" ng-if=\"message.owner.id == currentUser.id\">You</div>\n        <div class=\"label label-info\" ng-if=\"!message.owner\">App</div>\n        <div class=\"label label-success\" ng-if=\"message.owner && message.owner.id != currentUser.id\">{{ message.owner.firstName}} {{ message.owner.lastName}}</div>\n\n            <span class=\"message-date\">\n              <small>&nbsp; {{ message.createdAtReadable }}</small>\n            </span>\n      </div>\n\n      <hr ng-if=\"!$last\"/>\n\n    </li>\n  </ul>\n</div>\n\n<div id=\"reply-box\" class=\"panel breakout\">\n  <div class=\"container\">\n    <form name=\"messageForm\" class=\"panel-body\" ng-submit=\"sendSupportMessage()\">\n\n      <div class=\"form-group\">\n        <textarea id=\"message\" name=\"message\" class=\"form-control\" placeholder=\"Reply\" ng-model=\"message\" required ng-disabled=\"sendingMessage\"></textarea>\n      </div>\n\n      <button type=\"submit\" class=\"btn btn-block btn-primary\" ng-disabled=\"messageForm.$invalid || messageForm.$pristine || sendingMessage\">Send</button>\n    </form>\n  </div>\n</div>\n\n<div id=\"after-messages\"></div>\n");
$templateCache.put("components/states/admin/delivery/show/show.html","<h1>Delivery Detail</h1>\n");
$templateCache.put("components/states/customer/armoires/create/create.html","<form name=\"armoireForm\" ng-submit=\"saveArmoire()\">\n  <div class=\"well\">\n    <div class=\"row\">\n      <div class=\"col-xs-12 col-md-6\">\n        <h4>{{ armoireType.title }} Armoire <small>${{ armoireType.price }}</small></h4>\n\n        <div class=\"form-group\">\n          <label for=\"armoire.name\">Name This Armoire</label>\n          <input id=\"armoire.name\" ng-model=\"armoire.name\" class=\"form-control\" placeholder=\"Formal wear, casual wear, etc\" required floating-label>\n        </div>\n      </div>\n\n      <div class=\"col-xs-12 col-md-6\">\n        <div collapse=\"!armoire.deliveryTime\">\n          <h5>Dropoff Time</h5>\n\n          <p>{{ armoire.deliveryTimeReadable }}</p>\n          <a class=\"btn btn-info\" ng-click=\"armoire.deliveryTime = null\">Choose another time</a>\n        </div>\n\n        <div collapse=\"armoire.deliveryTime\">\n          <h5>Choose Dropoff Time</h5>\n\n          <div class=\"row\">\n            <div class=\"col-xs-7 col-sm-5\">\n              <div class=\"form-group\">\n                <label for=\"delivery.day\">Day</label>\n                <select class=\"form-control\" id=\"delivery.day\" ng-model=\"deliveryDay\"placeholder=\"Day\" ng-disabled=\"!armoire.name\">\n                  <option ng-repeat=\"group in groups\" value=\"{{$index}}\">{{ group[0].format(\'dddd, MMM Do\') }}</option>\n                </select>\n              </div>\n            </div>\n\n            <div class=\"col-xs-5 col-sm-7\" collapse=\"!deliveryDay\">\n              <div class=\"form-group\">\n                <label for=\"delivery.time\">Time</label>\n                <select class=\"form-control\" id=\"delivery.time\" ng-model=\"armoire.deliveryTime\" np-options=\"slot in groups[deliveryDay]\" >\n                  <option ng-repeat=\"slot in groups[deliveryDay]\" value=\"{{ slot.format() }}\">@ {{ slot.format(\'LT\') }}</option>\n                </select>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <button class=\"btn btn-block btn-lg btn-primary\" type=\"submit\" ng-disabled=\"armoireForm.$invalid || armoireForm.$pristine\">\n    <i class=\"fa fa-plus\"></i>\n    Add\n  </button>\n</form>\n\n<!--<json-formatter class=\"json-formatter json-formatter-dark\" json=\"armoire\"></json-formatter>-->\n");
$templateCache.put("components/states/customer/armoires/index/index.html","");
$templateCache.put("components/states/customer/armoires/show/show.html","<div collapse=\"showNewItem\">\n  <div ng-hide=\"true\" class=\"pull-right\" data-access-level=\"accessLevels.admin\">\n    <button class=\"btn btn-lg btn-primary\" ng-click=\"showNewItem = true\"><i class=\"fa fa-plus\"></i></button>\n  </div>\n\n  <h4>{{ armoire.name }}</h4>\n  <span class=\"label label-info\">{{ armoire.type.title }}</span>\n  <span class=\"label label-info\">{{ armoire.items.length }} items</span>\n</div>\n\n\n<div collapse=\"!showNewItem\" class=\"\">\n  <div new-armorie-item armoire=\"armoire\"></div>\n</div>\n\n<hr class=\"hr-clear\"/>\n\n<div>\n  <div class=\"well light-shadow\">\n    <div class=\"\">\n      <input id=\"search\" class=\"form-control\" ng-model=\"q\" placeholder=\"Search\">\n    </div>\n  </div>\n\n  <div class=\"row\">\n    <div class=\"col-xs-6 col-sm-4 col-sm-3 col-md-2\" ng-repeat=\"item in armoire.items | filter:q | orderBy: \'-createdAt\'\"  ng-hide=\"item.status === \'delivered\'\">\n      <div clothing-item item=\"item\" on-deliver=\"openDeliverItemsModal(itemId)\"></div>\n    </div>\n  </div>\n</div>\n\n\n<!--<json-formatter json=\"this\"></json-formatter>-->\n");}]);
'user strict';

(function(){
  angular.module('app').service('Armoire', ["$log", "Restangular", function($log, Restangular){
    var Armoire = Restangular.service('armoire');

    Restangular.extendModel('armoire', function(model){
      return model;
    });

    return Armoire;
  }]);
})();

'user strict';

(function(){
  angular.module('app').service('Clothing', ["$log", "Restangular", function($log, Restangular){
    var Clothing = Restangular.service('clothing');

    Restangular.extendModel('clothing', function(model){
      return model;
    });

    return Clothing;
  }]);
})();

'user strict';

(function(){
  angular.module('app').service('Delivery', ["$log", "Restangular", function($log, Restangular){
    var Delivery = Restangular.service('delivery');

    Restangular.extendModel('delivery', function(model){
      return model;
    });

    return Delivery;
  }]);
})();

(function() {
  'user strict';

  angular
    .module('app')
    .service('User', ["Restangular", "$rootScope", function(Restangular, $rootScope) {
    var User = Restangular.service('user');

    Restangular.extendModel('user', function(model) {
      model.isCurrentUser = $rootScope.user.id == model.id;

      var armoire = model.all('armoire');
      armoire.item = armoire.all('item');

      model.updateAvatar = {
        post: function(message) {
          return model.customPOST(message, 'avatar');
        }
      };

      model.armoire = armoire;

      model.billing = {
        get: function() {
          return model.customGET('billing');
        },
        post: function(message) {
          return model.customPOST(message, 'billing');
        }
      };

      model.charge = {
        post: function(message) {
          return model.customPOST(message, 'charge');
        }
      };

      model.support = {
        get: function() {
          return model.customGET('support');
        },
        post: function(message) {
          return model.customPOST(message, 'support');
        }
      };

      return model;
    });

    return User;
  }]);
})();

'use strict';

angular.module('app').directive('accessLevel', ["Auth", function (Auth) {
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      var prevDisp = element.css('display')
        , userRole
        , accessLevel;

      $scope.accessLevels = Auth.accessLevels;
      $scope.user = Auth.user;

      $scope.$watch('user', function (user) {
        if (angular.isDefined(user.role))
          userRole = user.role;
        updateCSS();
      }, true);

      attrs.$observe('accessLevel', function (al) {
        if (al) accessLevel = $scope.$eval(al);
        updateCSS();
      });

      function updateCSS() {
        if (userRole && accessLevel) {
          if (!Auth.authorize(accessLevel, userRole))
            element.css('display', 'none');
          else
            element.css('display', prevDisp);
        }
      }
    }
  };
}]);

'use strict';

angular.module('app').directive('addressBasedGoogleMap', function () {
  return {
    restrict: "A",
    template: "<div id='addressMap'></div>",
    scope: {
      address: "=",
      zoom: "="
    },
    controller: ["$scope", function ($scope) {
      var geocoder;
      var latlng;
      var map;
      var marker;
      var initialize = function () {
        geocoder = new google.maps.Geocoder();
        latlng = new google.maps.LatLng(-34.397, 150.644);
        var mapOptions = {
          zoom: $scope.zoom,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map
        (document.getElementById('addressMap'), mapOptions);
      };
      var markAdressToMap = function () {
        geocoder.geocode({ 'address': $scope.address },
          function (results, status)
          {
            if (status == google.maps.GeocoderStatus.OK) {
              map.setCenter(results[0].geometry.location);
              marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
              });
            }
          });
      };
      $scope.$watch("address", function () {
        if ($scope.address != undefined) {
          markAdressToMap();
        }
      });
      initialize();
    }],
  };
});

'use strict';

angular.module('app').factory('appSocket', ["socketFactory", "events", function (socketFactory, events) {
  var appSocket = socketFactory({
    //ioSocket: '/socket.io/'
  });
  appSocket.forward('error');
  return appSocket;
}]);

(function() {
  'use strict';

  angular.module('app').factory('armoireRepo',
    ["Restangular", function(Restangular) {
      var endpoint = Restangular.one('armoire');

      // Public API here
      return {
        list: function(q) {
          q = q || '';
          return endpoint.getList("", {
            q: q
          }).then(
            function(res) {
              return res;
            },
            function(err) {
              return err;
            }
          );
        },
        get: function(id) {
          return endpoint.one(id).get().then(
            function(res) {
              return res;
            },
            function(err) {
              return err;
            }
          );
        }
      };
    }]
  );
})();

(function() {
  'use strict';

  angular.module('app')
    .directive('armoireTypeAdmin',
    ["$log", "$timeout", "SweetAlert", "pricingRepo", function ($log, $timeout, SweetAlert, pricingRepo) {

    var _postLink = function (scope, el, attrs) {
      scope.item = scope.item || {};

      scope.create = function(){
        scope.item.sending = true;
        pricingRepo.armoireType.post(scope.item).then(
          function(succ){
            SweetAlert.success('Yay!', 'Armoire created');
            if(scope.onCreate){
              scope.onCreate();
            }
          },
          function(err){
            SweetAlert.error('Whoops!', 'Could create armoire.');
          }
        ).finally(
          function(){
            scope.item.sending = false;
          }
        );
      };

      scope.update = function(){
        if(scope.item.fromServer){
          scope.item.patch().then(
            function(succ){
              SweetAlert.success('Yay!', 'Armoire updated');
              if(scope.onUpdate){
                scope.onUpdate();
              }
            }, function(err){
              SweetAlert.error('Whoops!', 'Could update armoire.');
            }
          );
        } else {
          scope.create();
        }
      };

      scope.destroy = function(){
        SweetAlert.swal({
            title: "Are you sure?",
            text: "Your will not be able to undo this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true},
          function(isConfirm){
            if(isConfirm){
              SweetAlert.success('Yay!', 'Armoire destroyed');
              scope.item.remove().then(
                function(succ){
                  if(scope.onDestroy){
                    scope.onDestroy();
                  }
                },
                function(err){
                  SweetAlert.error('Whoops!', 'Could destroy armoire.');
                }
              );
            }
          });
      };
    };

    return {
      restrict: 'AE',
      scope: {
        item: '=',
        onCreate: '&onCreate',
        onUpdate: '&onUpdate',
        onDestroy: '&onDestroy'
      },
      templateUrl: 'components/armoireTypeAdmin-directive/armoireTypeAdmin.html',
      link: _postLink
    };
  }]);

}());

(function() {
  'use strict';

  angular.module('app')
    .constant('defaultUser', {
      role: routingConfig.userRoles.public
    })
    .factory('Auth', ["$q", "$timeout", "$log", "$window", "$http", "$rootScope", "$cookieStore", "Restangular", "appSocket", "User", "defaultUser", "events", function ($q, $timeout, $log, $window, $http, $rootScope, $cookieStore, Restangular, appSocket, User, defaultUser, events) {
      var endpoint = Restangular.one('auth');

      var accessLevels = routingConfig.accessLevels;
      var userRoles = routingConfig.userRoles;
      var currentUser = $cookieStore.get('user') || { role: userRoles.public };

      $cookieStore.remove('user');

      var changeUser = function(user) {
        angular.extend(currentUser, user);

        // Delete everything that is not in the default user
        if(user.role == userRoles.public){
          //console.log('Found public user, cleaning house.');
          _.forIn(currentUser, function(value, key){
            if(!defaultUser.hasOwnProperty(key)){
              //console.log('deleting ' + key);
              delete currentUser[key];
            }
          });
        } else {
          // Logged in user
        }
        $cookieStore.put('user', currentUser);
      };

      var authService = {};
      authService.accessLevels = routingConfig.accessLevels;
      authService.userRoles = routingConfig.userRoles;
      authService.checkedSession = false;
      authService.user = currentUser;

      authService.authorize = function(accessLevel, role) {
        if(role === undefined) {
          role = currentUser.role;
        }

        return accessLevel.bitMask & role.bitMask;
      };

      authService.getUser = function(userId){
        //$log.info('auth.getUser()', arguments);
        userId = userId || currentUser.id;

        var deferred = $q.defer();

        User.one(userId).get().then(function(user){
          changeUser(user);
          authService.checkedSession = true;
          $log.info(user);
          deferred.resolve(currentUser);
        }, function(err){
          changeUser(defaultUser);
          authService.checkedSession = true;
          deferred.reject(err);
        });

        return deferred.promise;
      };

      authService.getSession = function(){
        //$log.info('auth.getSession()', arguments);

        var deferred = $q.defer();

        endpoint.one('session').get().then(
          function(userObj){
            changeUser(userObj);
            deferred.notify('user is logged in, getting user details');
            authService.getUser(userObj.id).then(function(resp){
              deferred.resolve(resp);
            }, function(err){
              deferred.reject(err);
            });
          },
          function(err){
            authService.checkedSession = true;
            changeUser(defaultUser);
            deferred.reject(err);
          }
        );
        return deferred.promise;
      };

      authService.isLoggedIn = function() {
        return angular.isDefined(currentUser.id) ;
      };

      authService.login = function (user) {
        var deferred = $q.defer();

        endpoint.post('login', {
          email: user.email,
          password: user.password,
          rememberMe: true
        }).then(
          function (user) {
            changeUser(user);
            authService.getUser(user.id).then(
              function(){
                deferred.resolve(currentUser);
              },
              function(err){
                deferred.reject(err);
              }
            );
          }, function (err) {
            deferred.reject(err);
          }
        );
        return deferred.promise;
      };

      authService.logout = function (callback, errCallback) {
        var cb = callback || angular.noop;
        var errCb = errCallback || angular.noop;

        endpoint.one('logout').get().then(function (res) {
            if(cb)
              cb();
          },
          function (err) {
            if(errCb)
              errCb(err.data);
          }
        );
        changeUser(defaultUser);
      };

      authService.signup = function(user){
        return endpoint.post('signup', user).then(
          function(user){
            authService.checkedSession = true;
            changeUser(user);
            return currentUser;
          },
          function(err){
            return err;
          }
        );
      };

      authService.forgotPassword = function(email){
        return endpoint.post('forgot-password', {
          email: email
        });
      };

      authService.resetPassword = function(token, password, passwordConfirm){
        return endpoint.one('reset-password').post(token, {
          password: password,
          passwordConfirm: passwordConfirm
        });
      };

      return authService;
    }]
  );

}());

(function() {
  'use strict';

  angular.module('app')
    .controller('ModalAvatarUploadController',
      ["$scope", "$log", "$modalInstance", "user", function($scope, $log, $modalInstance, user) {
        $scope.ok = function(flowFile) {
          var fileReader = new FileReader();
          fileReader.onload = function(event) {
            var uri = event.target.result;
            $modalInstance.close({
              name: flowFile.name,
              uri: uri
            });
          };
          fileReader.readAsDataURL(flowFile.file);
        };
        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      }]
    );
})();

angular.module('app').directive('billing', ["$log", "$rootScope", "$timeout", "SweetAlert", function($log, $rootScope, $timeout, SweetAlert) {

  var _postLink = function(scope, el, attrs) {
    var now = new Date();

    scope.hide = true;

    scope.expirations = {
      months: [{
        val: 1,
        label: '1 - January'
      }, {
        val: 2,
        label: '2 - February'
      }, {
        val: 3,
        label: '3 - March'
      }, {
        val: 4,
        label: '4 - April'
      }, {
        val: 5,
        label: '5 - May'
      }, {
        val: 6,
        label: '6 - June'
      }, {
        val: 7,
        label: '7 - July'
      }, {
        val: 8,
        label: '8 - August'
      }, {
        val: 9,
        label: '9 - September'
      }, {
        val: 10,
        label: '10 - October'
      }, {
        val: 11,
        label: '11 - November'
      }, {
        val: 12,
        label: '12 - December'
      }],
      years: []
    };

    for (var i = 0; i < 10; i++) {
      scope.expirations.years.push(now.getFullYear() + i);
    }

    scope.$watch('user', function(val) {
      if (val) {
        refresh();
      }
    });

    var refresh = function() {
      scope.user.billing.get().then(
        function(succ) {
          $timeout(function() {
            // card
            var card = {};
            if (angular.isDefined(succ.billingData.cards.data[0])) {
              card = succ.billingData.cards.data[0];
            }
            // charges
            var charges = {};
            if (angular.isDefined(succ.billingData.charges)) {
              charges = succ.billingData.charges.data;
            }

            card.name = card.name || scope.user.firstName + ' ' + scope.user.lastName;
            card.exp_month = card.exp_month || scope.expirations.months[now.getMonth() - 1].val;
            card.exp_year = card.exp_year || scope.expirations.years[0];
            card.number = card.id ? 'xxxx-xxxx-xxxx-'.concat(card.last4) : '';
            scope.card = card;
            scope.charges = charges;
            scope.hide = false;
          });
        }
      );
    };

    scope.updateCard = function() {
      scope.user.billing.post(scope.card).then(
        function(succ) {
          $log.info(succ);
          SweetAlert.success('Yay!', 'Credit card updated');
          $rootScope.$broadcast('billingUpdated');
        },
        function(err) {
          $log.error(err);
          SweetAlert.error('Whoops!', 'Could not validate credit card.');
        }
      );
    };
  };

  return {
    restrict: 'AE',
    scope: {
      user: '=',
      mini: '=',
      onCreate: '&onCreate',
      onUpdate: '&onUpdate',
      onDestroy: '&onDestroy'
    },
    templateUrl: 'components/billing-directive/billing.directive.html',
    link: _postLink
  };
}]);

'use strict';
(function () {
  angular.module('app')
    .factory('bodyClass',
    ["$log", "$state", "$stateParams", "Auth", function ($log, $state, $stateParams, Auth) {
      var list = [];

      var toString = function(){
        generate();
        var str = list.join(' ').replace(/[.]/g, '-');
        return str;
      };

      var addClass = function (clss) {
        list.push(clss);
      };

      var genAuthClasses = function(){
        if(Auth.isLoggedIn() && Auth.checkedSession){
          addClass('logged-in');
          addClass('role-'.concat(Auth.user.role.title));
        } else {
          addClass('logged-out');
        }
      };

      var genStateClasses = function (state) {
        if (angular.isDefined(state.parent)) {
          genStateClasses(state.parent);
        }

        if (angular.isDefined(state.data)) {
          if (angular.isDefined(state.data.bodyClass)) {
            addClass(state.data.bodyClass);
          } else {
            addClass(state.self.name);
          }
          // Add dynamic slug to body class
          if (angular.isDefined($stateParams.slug)) {
            addClass($stateParams.slug);
          }
        }
      };

      var generate = function () {
        list = [];
        //$log.info($state.$current);
        genStateClasses($state.$current);
        genAuthClasses();
      };

      // Public API here
      return {
        generate: generate,

        list: function () {
          return list;
        },

        toString: toString
      };
    }]
  );
})();

'use strict';

(function(){
  angular.module('app').directive("calendar", function() {
    return {
      restrict: "E",
      templateUrl: "components/calendar-directive//calendar.html",
      scope: {
        selected: "="
      },
      link: function(scope, el, attrs) {
        el.addClass('calendar');

        scope.selected = _removeTime(scope.selected || moment());
        scope.month = scope.selected.clone();

        var start = scope.selected.clone();
        start.date(1);
        _removeTime(start.day(0));

        _buildMonth(scope, start, scope.month);

        scope.select = function(day) {
          scope.selected = day.date;
        };

        scope.next = function() {
          var next = scope.month.clone();
          _removeTime(next.month(next.month()+1)).date(1);
          scope.month.month(scope.month.month()+1);
          _buildMonth(scope, next, scope.month);
        };

        scope.previous = function() {
          var previous = scope.month.clone();
          _removeTime(previous.month(previous.month()-1).date(1));
          scope.month.month(scope.month.month()-1);
          _buildMonth(scope, previous, scope.month);
        };
      }
    };

    function _removeTime(date) {
      return date.day(0).hour(0).minute(0).second(0).millisecond(0);
    }

    function _buildMonth(scope, start, month) {
      scope.weeks = [];
      var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
      while (!done) {
        scope.weeks.push({ days: _buildWeek(date.clone(), month) });
        date.add(1, "w");
        done = count++ > 2 && monthIndex !== date.month();
        monthIndex = date.month();
      }
    }

    function _buildWeek(date, month) {
      var days = [];
      for (var i = 0; i < 7; i++) {
        days.push({
          name: date.format("dd").substring(0, 1),
          number: date.date(),
          isCurrentMonth: date.month() === month.month(),
          isToday: date.isSame(new Date(), "day"),
          date: date
        });
        date = date.clone();
        date.add(1, "d");
      }
      return days;
    }
  });
})();

'use strict';
(function () {
  /**
   * @ngdoc filter
   * @name app.filter:capitalize
   * @function
   * @description
   * # capitalize
   * Filter in the app.
   */
  angular.module('app')
    .filter('capitalize',
    function () {
      return function (input, scope) {
        if (input != null) {
          input = input.toLowerCase();
          input = input.replace(/_/g, ' ');
          return input.substring(0, 1).toUpperCase() + input.substring(1);
        }
      }
    });
})();

'user strict';

(function(){
  angular.module('app').filter('centscurrency', ["$filter", function($filter) {
    return function(cents) {
      return $filter('currency')(cents / 100, '', 2);
    };
  }]);
})();

'use strict';

(function(){
  angular.module('app').directive("charges", function() {
    return {
      restrict: "EA",
      templateUrl: "components/charges-directive/charges.directive.html",
      scope: {
        user: "="
      },
      link: function (scope, el, attrs) {
        var self = this
          , now = new Date();

        scope.hide = true;

        scope.charges = [];

        var refresh = function() {
          scope.user.charges.get().then(
            function(succ) {
              console.log(succ);
              scope.charges = succ.data;
              scope.hide = false;
            }
          );

        };

        /**
         * Watch user changes
         */
        scope.$watch('user', function(val){
          if(val){
            refresh();
          }
        });
      }
    }
  });
})();

(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name app.charges
   * @requires Restangular
   * @description
   * # Charges
   * Factory in the app.
   */
  angular.module('app').factory('charges',
    ["Restangular", function (Restangular) {
      var endpoint = Restangular.one('charges');

      // Public API here
      return {
        list: function(q){
          q = q || '';
          return endpoint.getList("", { q: q }).then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          );
        },
        getById: function(id){
          return endpoint.one(id).get().then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          );
        }
      };
    }]
  );
})();

angular.module('app').directive('clearOnFocus', ["$log", "$timeout", function ($log, $timeout) {

  var _postLink = function (scope, el, attrs) {

    var defaultVal = el.val();

    $timeout(function(){
      defaultVal = el.val();
      //$log.info('clearOnFocus', defaultVal);
    });

    el.bind("focus", function(e) {
      if(el.val() == defaultVal || isCreditCard()) el.val('');
    });

    el.bind("blur", function(e) {
      if( el.val() == '') el.val(defaultVal);
    });

    var isCreditCard = function(){
      var isCC = el.val().lastIndexOf('xxxx-') > -1;
      defaultVal = el.val();
      return isCC;
    }
  };

  return {
    restrict: 'A',
    link: _postLink
  }
}]);

(function() {
  'use strict';

  angular.module('app')
    .directive('clothingItem', ["$log", "$timeout", "Clothing", "Delivery", function($log, $timeout, Clothing, Delivery) {

      var _postLink = function(scope, el, attrs) {
        el.addClass('clothingItem');
        scope.item = scope.item || {};
        scope.selectTimeframe = false;

        scope.selectDeliveryTimeframe = function (){
          scope.selectTimeframe = true;
        };

        scope.cancelDeliveryTimeframe = function(){
          scope.selectTimeframe = false;
        };

      };

      return {
        restrict: 'AE',
        scope: {
          item: '=',
          hideDeliverButton: '@',
          onDeliver: '&'
        },
        templateUrl: 'components/clothingItem-directive/clothingItem.html',
        link: _postLink
      };
    }]);

}());

(function () {
  'use strict';
  /**
   * @ngdoc service
   * @name app.clothingItemRepo
   * @requires Restangular
   * @description
   * # clothingItemRepo
   * Factory in the app.
   */
  angular.module('app').factory('clothingItemRepo',
    ["Restangular", function (Restangular) {
      var endpoint = Restangular.one('clothingItem');

      // Public API here
      return {
        list: function(q){
          q = q || '';
          return endpoint.getList("", { q: q }).then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          );
        },
        getById: function(id){
          return endpoint.one(id).get().then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          );
        }
      };
    }]
  );
})();

(function() {
  'use strict';

  angular.module('app')
    .directive('clothingTypeAdmin',
      ["$log", "$timeout", "SweetAlert", "pricingRepo", function($log, $timeout, SweetAlert, pricingRepo) {

        var _postLink = function(scope, el, attrs) {
          scope.item = scope.item || {};

          scope.create = function() {
            scope.item.sending = true;
            pricingRepo.clothingType.post(scope.item).then(
              function(succ) {
                SweetAlert.success('Yay!', 'Clothing created');
                if (scope.onCreate) {
                  scope.onCreate();
                }
              },
              function(err) {
                SweetAlert.error('Whoops!', 'Could create clothing.');
              }
            ).finally(
              function() {
                scope.item.sending = false;
              }
            );
          };

          scope.update = function() {
            if (scope.item.fromServer) {
              scope.item.patch().then(
                function(succ) {
                  SweetAlert.success('Yay!', 'Clothing updated');
                  if (scope.onUpdate) {
                    scope.onUpdate();
                  }
                },
                function(err) {
                  SweetAlert.error('Whoops!', 'Could update clothing.');
                }
              );
            } else {
              scope.create();
            }
          };

          scope.destroy = function() {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "Your will not be able to undo this!",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: true
              },
              function(isConfirm) {
                if (isConfirm) {
                  scope.item.remove().then(
                    function(succ) {
                      SweetAlert.success('Yay!', 'Clothing destroyed');
                      if (scope.onDestroy) {
                        scope.onDestroy();
                      }
                    },
                    function(err) {
                      SweetAlert.error('Whoops!', 'Could destroy clothing.');
                    }
                  );
                }
              });
          };
        };

        return {
          restrict: 'AE',
          scope: {
            item: '=',
            onCreate: '&onCreate',
            onUpdate: '&onUpdate',
            onDestroy: '&onDestroy'
          },
          templateUrl: 'components/clothingTypeAdmin-directive/clothingTypeAdmin.html',
          link: _postLink
        };
      }]);

}());

(function () {
  'use strict';
  /**
   * @ngdoc service
   * @name app.clothingTypeRepo
   * @requires Restangular
   * @description
   * # clothingTypeRepo
   * Factory in the app.
   */
  angular.module('app').factory('clothingTypeRepo',
    ["Restangular", function (Restangular) {
      var endpoint = Restangular.one('clothingType');

      // Public API here
      return {
        list: function(q){
          q = q || '';
          return endpoint.getList("", { q: q }).then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          );
        },
        getById: function(id){
          return endpoint.one(id).get().then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          );
        }
      };
    }]
  );
})();

'user strict';

(function(){
  angular.module('app').filter('collection', function() {
    return function(collection) {

      return collection;
    };
  });
})();

(function() {
  'use strict';

  angular.module('app')
    .filter('countNonDelivered',
      function() {
        return function(itemsArr, scope) {
          return _.filter(itemsArr, function(item) {
            return item.status !== 'delivered';
          }).length;
        };
      });
})();

"use strict";
(function () {
  /**
   * @ngdoc directive
   * @name app.directive:countrySelect
   * @restrict A
   * @element div
   *
   * @param {express} ngModel Two way binding of the variable you'd like to update.
   *
   * @description
   * Places a <code>select</code> element with a list of countries.
   */
  angular.module('app').directive('countrySelect',
    ["$parse", function ($parse) {
      var countries = [
        "United States",
        "Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola",
        "Anguilla", "Antarctica", "Antigua And Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria",
        "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
        "Bermuda", "Bhutan", "Bolivia, Plurinational State of", "Bonaire, Sint Eustatius and Saba", "Bosnia and Herzegovina",
        "Botswana", "Bouvet Island", "Brazil",
        "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
        "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China",
        "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo",
        "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba",
        "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
        "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)",
        "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia",
        "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
        "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea",
        "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City State)",
        "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran, Islamic Republic of", "Iraq",
        "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya",
        "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan",
        "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
        "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia, The Former Yugoslav Republic Of",
        "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique",
        "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of",
        "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
        "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger",
        "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau",
        "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
        "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation",
        "Rwanda", "Saint Barthelemy", "Saint Helena, Ascension and Tristan da Cunha", "Saint Kitts and Nevis", "Saint Lucia",
        "Saint Martin (French Part)", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
        "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
        "Sint Maarten (Dutch Part)", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
        "South Georgia and the South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
        "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic",
        "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-Leste",
        "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
        "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
        "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu",
        "Venezuela, Bolivarian Republic of", "Viet Nam", "Virgin Islands, British", "Virgin Islands, U.S.",
        "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"
      ];

      return {
        restrict: 'E',
        template: '<select class="form-control"><option>' + countries.join('</option><option>') + '</option></select>',
        replace: true,
        link: function (scope, elem, attrs) {
          if (!!attrs.ngModel) {
            var assignCountry = $parse(attrs.ngModel).assign;

            elem.bind('change', function (e) {
              assignCountry(elem.val());
            });

            scope.$watch(attrs.ngModel, function (country) {
              elem.val(country);
            });
          }
        }
      };
    }]);
})();

(function() {
  'use strict';

  angular.module('app').controller('ModalDeliverItemsController',
    ["$scope", "$log", "$modalInstance", "items", "slots", "selectedItemId", function($scope, $log, $modalInstance, items, slots, selectedItemId) {
      $log.info('ModalDeliverItemsController');

      $scope.items = items; // resolved by calling controller
      $scope.slots = slots; // resolved by calling controller
      $scope.groups = [
        []
      ];
      $scope.selectedItems = [];
      $scope.itemsSelected = false;
      $scope.deliveryDay = null;
      $scope.deliveryTime = null;

      $scope.toggleItem = function(item) {
        item.selected = !item.selected;
        $scope.itemsSelected = anySelectedItems();
      };

      $scope.ok = function() {
        // get all selected items
        $scope.selectedItems = _.filter($scope.items, function(item){ return item.selected === true; });
        $modalInstance.close({
          items: $scope.selectedItems,
          deliveryTime: $scope.deliveryTime
        });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      resetAllItems();
      // prepare grouped slots
      groupSlots($scope.slots);
      // select passed in item
      getSelectedItem(selectedItemId);

      function resetAllItems(){
        _.each($scope.items, function(item){ item.selected = false; });
      }

      function getSelectedItem(selectedItemId) {
        var itemToSelect = _.find($scope.items, function(item){ return item.id === selectedItemId; });
        if(itemToSelect && !itemToSelect.selected){
          $scope.toggleItem(itemToSelect);
        }
      }

      function groupSlots(slots) {
        if (!slots.length) {
          return;
        }
        var cutoff = moment(slots[0]).add(1, 'days').hour(0).minute(0).subtract(1, 'minutes');
        _.each(slots, function(slot) {
          var mDate = moment(slot);
          if (mDate.isAfter(cutoff)) {
            $scope.groups.push([]);
            cutoff = moment(slot).add(1, 'days').hour(0).minute(0).subtract(1, 'minutes');
          }
          $scope.groups[$scope.groups.length - 1].push(mDate);
        });
      }

      function anySelectedItems(){
        var selItems = _.find($scope.items, function(item){ return item.selected; });
        return selItems ? true: false;
      }
    }]
  );
})();

angular.module('app').directive('deliveryItem', ["$log", "$timeout", "SweetAlert", "Delivery", "Armoire", "Clothing", function ($log, $timeout, SweetAlert, Delivery, Armoire, Clothing) {

  var _postLink = function (scope, el, attrs) {
    scope.delivery = scope.delivery || {};

    var patch = function(){
      scope.delivery.patch(
        _.pick(scope.delivery, "cancelled", "active", "deliveredAt")
      ).then(
        function(delivery){
          if(scope.onUpdate){
            scope.onUpdate();
          } else {
            scope.delivery = delivery;
          }
        },
        function(err){
          SweetAlert.error('Oops...', 'Error updating delivery.');
        }
      );
    };

    scope.cancelDeliver = function(){
      scope.delivery.cancelled = false;
      patch();
    };

    scope.activateDelivery = function(){
      scope.delivery.active = true;
      patch();
    };

    scope.finishDelivery = function(){
      scope.delivery.active = false;
      scope.delivery.deliveredAt = new Date();
      scope.delivery.delivered = true;
      patch();
    };

    scope.$watch('delivery.deliveredAt', function(newVal){
      //scope.delivery.delivered = _.isDate(scope.delivery.deliveredAt);
    });

    scope.$watch('delivery.armoire', function(newVal){
      if(newVal){
        if(angular.isDefined(scope.delivery.armoire.id)){
          if(scope.delivery.armoire.fromServer)
            return;

          Armoire.one(scope.delivery.armoire.id).get().then(
            function(armoire){
              scope.delivery.armoire = armoire;
            },
            function(err){

            }
          )
        }
      }
    });

    scope.$watch('delivery.clothing', function(newVal){
      if(newVal){
        _.forEach(scope.delivery.clothing, function(item){
          if(item.fromServer)
            return;

          Clothing.one(item.id).get().then(
            function(clothing){
              item = clothing;
            },
            function(err){

            }
          )
        });
      }
    });
  };

  return {
    restrict: 'AE',
    scope: {
      delivery: '=',
      onCreate: '&onCreate',
      onUpdate: '&onUpdate',
      onDestroy: '&onDestroy'
    },
    templateUrl: 'components/deliveryItem-directive/deliveryItem.html',
    link: _postLink
  }
}]);

'use strict';
(function () {
  angular.module('app')
    .directive('deliveryMap', ["$window", "uiGmapGoogleMapApi", "views", function ($window, uiGmapGoogleMapApi, views) {
      var _postLink = function postLink(scope, element, attrs) {
        scope.uid = _.uniqueId('gmap-');
        scope.marker = null;

        uiGmapGoogleMapApi.then(function (gmaps) {
          getMarker(gmaps);
        });

        var getMarker = function (gmaps) {
          var gc = new gmaps.Geocoder();
          gc.geocode({address: attrs.address}, function (result, status) {

            console.log('found ' + attrs.address, result, status);

            switch (status) {
              case 'OK':
              {
                getMarkerSuccess(result);
                break;
              }
              default:
              {
                getMarkerError(result, status);
                break;
              }
            }
          });
        };

        var getMarkerSuccess = function (result) {
          var gcResult = result[0];

          // See https://code.google.com/p/gmaps-api-issues/issues/detail?id=6285
          scope.map.markers[0] = {
            id: _.uniqueId(),
            coords: {
              latitude: gcResult.geometry.location.k,
              longitude: gcResult.geometry.location.B
            },
            options: {
              draggable: false,
              //labelContent: gcResult.formatted_address,
              labelAnchor: "100 0",
              labelClass: "marker-labels"
            }
          };

          scope.map.center = {
            latitude: gcResult.geometry.location.k,
            longitude: gcResult.geometry.location.B
          };

          $($window).trigger('resize');
        };

        var getMarkerError = function (result, status) {

        };

        scope.map = {
          center: {
            latitude: 41.8369,
            longitude: 87.6847
          },
          zoom: 14,
          draggable: scope.delivery.active,
          markers: [],
          options: {
            scrollwheel: false
          }
        };

        scope.$watch('delivery.current', function () {
          scope.map.draggable = scope.delivery.active;
        });
      };
      return {
        templateUrl: 'components/deliveryMap-directive/deliveryMap.html',
        restrict: 'E',
        scope: {
          delivery: '='
        },
        link: _postLink
      };
    }]
  );
})();

(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name app.deliveryRepo
   * @requires Restangular
   * @description
   * # deliveryRepo
   * Factory in the app.
   */
  angular.module('app').factory('deliveryRepo',
    ["Restangular", function (Restangular) {
      var endpoint = Restangular.one('delivery');

      // Public API here
      return {
        list: function(q){
          q = q || '';
          return endpoint.getList("", { q: q }).then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          );
        },
        getById: function(id){
          return endpoint.one(id).get().then(
            function(res){
              res.moment = moment(res.date);
              return res;
            },
            function(err){
              return err;
            }
          );
        },
        slots: function(){
          return endpoint.one('slots').get().then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          );
        }
      };
    }]
  );
})();

(function() {
  'use strict';

  var all = {
    auth: {
      login: 'auth.login',
      logout: 'auth.logout',
    },
    supportConvo: {
      newMessage: 'supportConvo.newMessage'
    }
  };

  angular.module('app').constant('events', all);
})();

'use strict';
(function () {
  /**
   * @ngdoc service
   * @name app.faked
   * @description
   * # faked
   * Factory in the app.
   */
  angular.module('app').factory('faked',
    ["$q", "user", function($q, user) {
      var userRoles = routingConfig.userRoles;

      var users = [
        {
          username: 'admin@armoire.com',
          password: 'pass',
          role: userRoles.admin
        },
        {
          username: 'customer@armoire.com',
          password: 'pass',
          role: userRoles.user
        },
        {
          username: 'customer2@armoire.com',
          password: 'pass',
          role: userRoles.user
        },
        {
          username: 'customer3@armoire.com',
          password: 'pass',
          role: userRoles.user
        }
      ];

      _.each(users, function (u, key) {
        u.id = key;
        u.firstName = faker.name.firstName();
        u.lastName = faker.name.lastName();
        u.aCity = "Chicago";
        u.aCountry = 'United States';
        u.aState = 'Illinois';
        u.phone = faker.phone.phoneNumber();
        u.avatar = faker.internet.avatar();
        u.email = faker.internet.email();
        u.createdAt = faker.date.past();
        u.lastLogin = faker.date.recent();

        switch (key) {
          case 0:
          {
            u.aStreet = "900 N Michigan Ave";
            u.aStreetSecondary = null;
            u.aZip = "60611";
            break;
          }

          case 1:
          {
            u.aStreet = "2043 W Addison St";
            u.aStreetSecondary = "#2";
            u.aZip = "60618";
            break;
          }

          case 2:
          {
            user.aStreet = "3128 N Broadway St";
            user.aStreetSecondary = null;
            user.aZip = "60657";
            break;
          }

          case 3:
          {
            u.aStreet = "3458 N Halsted St";
            u.aStreetSecondary = null;
            u.aZip = "60657";
            break;
          }

          default:
          {
            u.aStreet = faker.address.streetAddress();
            u.aStreetSecondary = faker.address.secondaryAddress();
            u.aZip = faker.address.zipCode();
            break;
          }
        }
        u = new user(u);
      });
      users = hashArrayByID(users);
      //console.log(users);


      var itemTypes = [
        {
          name: 'Dresses',
        },
        {
          name: 'Sweaters',
        },
        {
          name: 'Shirts/Polos',
        },
        {
          name: 'Jackets/Blazers',
        },
        {
          name: 'Skirts',
        },
        {
          name: 'Suits',
        },
        {
          name: 'Accessories',
        }
      ];
      _.each(itemTypes, function (item, index) {
        item.id = index + 1;
      });
      itemTypes = hashArrayByID(itemTypes);

      var items = [];
      for (var i = 1; i < 50; i++) {
        var item = {};
        item.name = faker.lorem.sentence(2);
        item.photo = faker.image.fashion();
        item.type = _.sample(itemTypes, 1)[0].id;
        item.userId = _.sample(users, 1)[0].id;
        items.push(item);
      }

      var deliveries = [];
      for (var i = 1; i < 12; i++) {
        var delivery = {
          id: i,
          enabled: true,
          userId: _.sample(users, 1)[0].id,
          createAt: faker.date.future(),
          deliverAt: faker.date.future(),
          current: false,
          delivered: false,
          deliveredAt: undefined
        };
        deliveries.push(delivery);
      }
      _.each(deliveries, function (d) {
        d.delivered = faker.helpers.randomNumber() == 0;
        if (d.completed) {
          d.deliveredAt = faker.date.future();
        }
        d.createdDate = moment(d.createdAt);
        d.deliveryDate = moment(d.deliverAt);
        d.deliveredDate = moment(d.deliveredAt);
      });

      // Set the first one as the current delivery
      deliveries[0].current = true;
      deliveries[0].current = false;

      deliveries = hashArrayByID(deliveries);

      return {
        users: users,
        deliveries: deliveries,
        items: items,
        itemTypes: itemTypes
      };
    }]
  );
})();

'use strict';
(function () {
  /**
   * @ngdoc service
   * @name app.faq
   * @description
   * # faq
   * Constant in the app.
   */
  angular.module('app')
    .constant('faq', [
      {
        question: 'Where is Armoire available?',
        answer: 'Currently, only in Chicago, IL, USA. We hand deliver the armoire and take them to our storage facility. San Francisco and New York City are next inline.'
      },
      {
        question: 'What conditions are the armoire stored in?',
        answer: 'Our storage facility is temperature and humidity controlled and has video surveillance 24 hours a day, 365 days a year.'
      }
    ]);
})();

angular.module('app').directive('file', function(){
  return {
    scope: {
      file: '='
    },
    link: function(scope, el, attrs){
      el.bind('change', function(event){
        var files = event.target.files;
        var file = files[0];
        scope.file = file ? file.name : undefined;
        scope.$apply();
      });
    }
  };
});

(function() {
  'use strict';

  angular.module('app')
    .directive('floatingLabel', ["$log", "$timeout", function($log, $timeout) {
      return {
        restrict: 'A',
        link: function(scope, el, attrs) {

          var parent = el.parent();
          parent.addClass('floating-label');

          var label = el.parent().find('label');
          label.addClass('control-label');

          var isSelectInput = el[0].tagName.toLowerCase() == 'select';

          el.on('input focus blur change propertychange', function(e) {
            checkValue(e);
          });

          scope.$on('destroy', function() {
            el.off('input focus blur change');
          });

          // If we assign the value programatically from outside the directive, this detects it.
          attrs.$observe('ngModel', function(value) { // Got ng-model bind path here
            scope.$watch(value, function(newValue) { // Watch given path for changes
              checkValue();
            });
          });

          var checkValue = function(e) {
            $timeout(function() {
              var hasValue = 'undefined' !== attrs.ngModel;
              var hasFocus = false;
              var addFocusClass = false;

              ///*
              if (isSelectInput) {
                switch (el.val()) {
                  case null:
                  case undefined:
                  case '?':
                    {
                      hasValue = false;
                      break;
                    }
                  default:
                    {
                      hasValue = true;
                    }
                }
              } else if (!isSelectInput) {
                hasValue = (el.val().length > 0);
              }
              //*/

              if (e) {
                hasFocus = e.type === 'focus';
              }

              addFocusClass = hasFocus ? true : hasValue;
              parent.toggleClass('focused', addFocusClass);
            });

          };

          $timeout(function() {
            checkValue();
          });
        }
      };
    }]);

}());

'use strict';
(function () {
  angular.module('app')
    .factory('geolocation',
    ["$q", function ($q) {
      var location = {};

      var deferredCache = {
        getLocation: undefined
      };

      var deferred = $q.defer();

      var getLocation = function () {
        if (deferredCache.getLocation) {
          return deferred.getLocation;
        }

        deferredCache.getLocation = $q.defer();

        var returnPosition = function (position) {
          console.log(position);
          location = position;
          deferredCache.getLocation.resolve(position);
          delete deferredCache.getLocation;
        };

        var returnError = function (error) {
          if (error) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                deferredCache.getLocation.reject("User denied the request for Geolocation.");
                break;
              case error.POSITION_UNAVAILABLE:
                deferredCache.getLocation.reject("Location information is unavailable.");
                break;
              case error.TIMEOUT:
                deferredCache.getLocation.reject("The request to get user location timed out.");
                break;
              case error.UNKNOWN_ERROR:
                deferredCache.getLocation.reject("An unknown error occurred.");
                break;
            }
          } else {
            deferredCache.getLocation.reject("Geolocation is not supported.");
          }
          delete deferredCache.getLocation;
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(returnPosition, returnError);
        } else {
          returnError();
        }

        return deferredCache.getLocation.promise;
      };

      // Public API here
      return {
        location: location,
        getLocation: getLocation
      }
    }]
  );
})();

'use strict';
(function () {
  /**
   * @ngdoc service
   * @name app.imageRepo
   * @requires Restangular
   * @description
   * # imageRepo
   * Factory in the app.
   */
  angular.module('app').factory('imageRepo',
    ["Restangular", function (Restangular) {
      var endpoint = Restangular.one('image');

      // Public API here
      return {
        list: function(q){
          q = q || '';
          return endpoint.getList("", { q: q }).then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          )
        },
        getById: function(id){
          return endpoint.one(id).get().then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          )
        }
      }
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc directive
   * @name app.directive:loginInterface
   * @description
   * # loginInterface
   */
  angular.module('app').directive('login',
    ["$state", "$location", "$timeout", "$log", "Restangular", "Auth", "redirectToUrlAfterLogin", function ($state, $location, $timeout, $log, Restangular, Auth, redirectToUrlAfterLogin) {
      var _postLink = function (scope, element, attrs) {
        scope.username = '';
        scope.password = '';
        scope.rememberme = true;

        scope.login = function () {
          //console.info('scope', scope);
        };
      };

      return {
        templateUrl: 'components/login/login.html',
        restrict: 'EA',
        link: _postLink
      };
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:MainController',
   * @description
   * # MainCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/</code>
   */
  angular.module('app').controller('MainController',
    ["$scope", "$log", "$window", "SweetAlert", "Auth", function ($scope, $log, $window, SweetAlert, Auth) {
      $scope.accessLevels = Auth.accessLevels;

      $scope.$on('socket:error', function (ev, data) {
        $log.error(ev, data);
      });

      $scope.loginLocal = function(){
        Auth.login({
          email: $scope.email,
          password: $scope.password
        }).then(function(user){
          if(angular.isDefined(user.homePath)){
            //$location.path(user.homePath);
            $window.location.href = user.homePath;
          }
        }, function(err){
          SweetAlert.error("Oops...", "Invalid email & password");
        });
      };
    }]
  );
})();

(function() {
'use strict';
  /**
   * @ngdoc directive
   * @name app.directive:mainMenu
   * @description
   * # mainMenu
   */
  angular.module('app').directive('mainMenu',
    ["$rootScope", "$window", "$state", "Auth", function ($rootScope, $window, $state, Auth) {
      var _postLink = function postLink(scope, element, attrs) {
        scope.accessLevels = Auth.accessLevels;
        scope.sideMenuOpen = false;
        scope.adminCollapse = true;
        scope.userCollapse = true;

        scope.onSearchSubmit = function (event) {
          $state.go('state({ query: ' + scope.queryTerm + '})');
        };

        // Sidebar functionality
        var _sideMenuCB = $('#side-menu-toggle');
        var _sideMenuBTN = $('#side-menu-button');

        /*
         if(!isMobile.any()){
         _sideMenuBTN.hover(function(e){
         console.log('sidebar toggle button hover')
         if(!isSideMenuOpen()){
         _sideMenuCB.prop('checked', true);
         }
         });
         }
         */

        function onSideMenuChanged(e) {
          scope.$apply(function () {
            scope.sideMenuOpen = isSideMenuOpen();
            $rootScope.$broadcast('sideMenuToggle', scope.sideMenuOpen);
          });
        }

        function isSideMenuOpen() {
          var opened = _sideMenuCB.prop('checked');
          return opened;
        }

        function collapse() {
          scope.navCollapsed = true;
        }

        function checkViewport() {
          switch (scope.viewport) {
            case 'xs':
            {
              collapse();
              scope.userCollapsed = false;
              break;
            }
            default:
            {
              scope.navCollapsed = false;
              break;
            }
          }
        }

        function onWindowResize(event) {
          checkViewport();
        }

        angular.element($window).bind("resize", function (e) {
          onWindowResize();
        });

        _sideMenuCB.change(function (e) {
          onSideMenuChanged();
        });

        $rootScope.$on('$stateChangeStart', function (e) {
          checkViewport();
        });

        checkViewport();
      };

      return {
        templateUrl: 'components/mainMenu-directive/mainMenu.html',
        restrict: 'E',
        replace: true,
        link: _postLink
      };
    }]
  );
})();

'use strict';
(function () {
  angular.module('app')
    .directive('momentFormat',
    function () {
      return {
        template: '<div></div>',
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
          element.text('this is the momentFormat directive');
        }
      };
    });
})();

'use strict';

(function() {
  /**
   * @ngdoc function
   * @name app.controller:ModalNewArmoireController
   * @description
   * # ModalNewArmoireController
   * Controller of the modal that handles adding a new Armoire.
   *
   */
  angular.module('app').controller('ModalNewArmoireController',
    ["$scope", "$log", "$modalInstance", "user", function ($scope, $log, $modalInstance, user) {
      $log.info('ModalNewArmoireController');

      $scope.armoire = {};

      $scope.date = {
        opened: false,
        options: {
          formatYear: 'yy',
          startingDay: 1
        },
        formats: ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate']
      };

      //$scope.date.format = $scope.date.formats[0];
      $scope.date.format = "MMMM dd, yyyy";

      $scope.date.clear = function(){
        $scope.armoire.date = null;
      };

      $scope.date.disabled = function(date, mode) {
        return ( mode === 'day' && ( $scope.armoire.date.getDay() === 0 || $scope.armoire.date.getDay() === 6 ) );
      };

      $scope.date.today = function() {
        $scope.armoire.date = new Date();
      };

      $scope.date.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.date.opened = true;
      };

      //$scope.date.today();

      $scope.ok = function (img) {
        $modalInstance.close($scope.armoire);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }]

  );
})();

(function() {
  'use strict';

  angular.module('app')
    .directive('newArmoireItem',
      ["pricingRepo", function(pricingRepo) {

        var _postLink = function(scope, el, attrs) {

        };

        return {
          templateUrl: 'components/newArmoireItem-directive/newArmoireItem.directive.html',
          restrict: 'AE',
          scope: {
            newItem: '=',
            armoire: '=',
            clothingTypes: '=',
            resetItem: '&',
            onImgAdded: '&',
            saveItem: '&'
          },
          link: _postLink
        };
      }]);
})();

(function() {
  'use strict';

  angular.module('app')
    .constant('focusConfig', {
      focusClass: 'focused'
    })

  .directive('onFocus', ["focusConfig", function(focusConfig) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$focused = false;
        element
          .bind('focus', function(evt) {
            element.addClass(focusConfig.focusClass);
            scope.$apply(function() {
              ngModel.$focused = true;
            });
          })
          .bind('blur', function(evt) {
            element.removeClass(focusConfig.focusClass);
            scope.$apply(function() {
              ngModel.$focused = false;
            });
          });
      }
    };
  }]);
})();

(function() {
  'use strict';

  angular.module('app')
    .directive('onImgError',
    function () {

    var _link = function (scope, element, attr) {
      element.on('error', function() {
        element.attr('src', attr.onImgError);
      });
    };

    return {
      restrict: 'A',
      link: _link
    };
  });

}());

(function () {
  'use strict';

  angular.module('app').factory('pricingRepo',
    ["Restangular", function (Restangular) {
      var endpoint    = Restangular.one('pricing');
      var armoireEP   = endpoint.all('armoire');
      var clothingEP  = endpoint.all('clothing');

      // Public API here
      return {
        armoireType: armoireEP,
        clothingType: clothingEP
      };
    }]
  );
})();

(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name app.factory:redirectToUrlAfterLogin
   * @description
   * # redirectToUrlAfterLogin
   * Factory in the app.
   */
  angular.module('app').factory('redirectToUrlAfterLogin',
    function () {
      // Public API here
      return {
        url: '',
        isActive: function () {
          var self = this;
          return self.url !== '';
        },
        reset: function () {
          var self = this;
          self.url = '';
        }
      };
    }
  );
})();

'use strict';
(function () {
  /**
   * @ngdoc service
   * @name app.regions
   * @description
   * # regions
   * Constant in the app.
   */
  angular.module('app')
    .constant('regions', [
      {
        country: 'United States',
        states: [
          {
            state: 'Illinois',
            cities: [
              'Chicago'
            ]
          }
        ]
      }
    ]);
})();

'use strict';

(function(){
  angular.module('app').directive('requireMirrorInput', function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstInput = '#' + attrs.requireMirrorInput;
        elem.add(firstInput).on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val() === $(firstInput).val();
            ctrl.$setValidity('inputmatch', v);
          });
        });
      }
    }
  });
})();

(function() {
  'use strict';

  angular.module('app').config(
    ["$httpProvider", "$locationProvider", "$urlRouterProvider", "$stateProvider", "RoutingConfigProvider", "views", function appRoutingConfig($httpProvider, $locationProvider, $urlRouterProvider, $stateProvider, RoutingConfigProvider, views) {
      $locationProvider.html5Mode(true);

      var accessLevels = RoutingConfigProvider.accessLevels;

      // define default routes
      $urlRouterProvider.when('/customer','/customer/armoire');
      $urlRouterProvider.when('/pricing','/pricing/armoire');

      $stateProvider
        //--------------------------------------
        // PUBLIC
        //--------------------------------------
        .state('home', {
          url: '/',
          templateUrl: 'components/states/home/home.html',
          controller: 'MainController',
          data: {
            access: accessLevels.public
          }
        })
        .state('about', {
          url: '/about',
          templateUrl: 'components/states/about/about.html',
          controller: 'AboutController',
          data: {
            access: accessLevels.anon
          }
        })
        .state('contact', {
          url: '/contact',
          templateUrl: 'components/states/contact/contact.html',
          controller: 'ContactController',
          data: {
            access: accessLevels.anon
          }
        })
        .state('sitemap', {
          url: '/site-map/',
          templateUrl: 'components/states/site-map/site-map.html',
          controller: 'LoginController',
          data: {
            access: accessLevels.anon
          }
        })
        .state('signup', {
          url: '/signup/',
          templateUrl: 'components/states/signup/signup.html',
          controller: 'SignupController',
          data: {
            access: accessLevels.anon
          }
        })
        //--------------------------------------
        // Errors
        //--------------------------------------
        .state('404', {
          url: '/404',
          templateUrl: 'components/states/404/404.html',
          controller: 'NotFoundController',
          data: {
            access: accessLevels.public
          }
        })
        //--------------------------------------
        // SIGNUP, PROFILE, LOGOUT
        //--------------------------------------
        .state('forgot-password', {
          url: '/forgot-password',
          templateUrl: 'components/states/forgot-password/forgot-password.html',
          controller: 'ForgotPasswordController',
          data: {
            access: accessLevels.anon
          }
        })
        .state('reset-password', {
          url: '/reset-password/:token',
          templateUrl: 'components/states/reset-password/reset-password.html',
          controller: 'ResetPasswordController',
          data: {
            access: accessLevels.anon
          }
        })
        //--------------------------------------
        // USER
        //--------------------------------------
        .state('profile', {
          url: '/profile/',
          templateUrl: 'components/states/profile/profile.html',
          controller: 'ProfileController',
          data: {
            access: accessLevels.user
          }
        })
        .state('logout', {
          url: '/logout',
          templateUrl: 'components/states/logout/logout.html',
          controller: 'LogoutController',
          data: {
            access: accessLevels.user
          }
        })
        //--------------------------------------
        // ADMIN
        //--------------------------------------
        .state('admin', {
          abstract: true,
          url: '/admin',
          templateUrl: 'components/states/admin/admin.html',
          controller: 'AdminController',
          data: {
            access: accessLevels.admin
          }
        })
        .state('admin.index', {
          url: '',
          templateUrl: 'components/states/admin/index/index.html',
          controller: 'AdminIndexController',
          data: {
            access: accessLevels.admin
          }
        })
        .state('admin.customer', {
          url: '/customers',
          templateUrl: 'components/states/admin/customer/customer.html',
          controller: 'AdminCustomersController',
          resolve: {
            User: 'User',
            users: ["User", function(User){
              return User.getList();
            }]
          }
        })
        .state('admin.customer.show', {
          url: '/:id',
          templateUrl: 'components/states/admin/customer/show/show.html',
          controller: 'AdminCustomersShowController',
          resolve: {
            User: 'User',
            fetchedUser: ["User", "$stateParams", function(User, $stateParams){
              return User.one($stateParams.id).get();
            }]
          }
        })
        .state('admin.customer.show.profile', {
          url: '/profile',
          templateUrl: 'components/states/admin/customer/show/profile.html'
        })
        .state('admin.customer.show.armoire', {
          url: '/armoire',
          templateUrl: 'components/states/admin/customer/show/armoire.html'
        })
        .state('admin.customer.show.billing', {
          url: '/billing',
          controller: 'AdminCustomersBillingController',
          templateUrl: 'components/states/admin/customer/show/billing.html'
        })
        .state('admin.customer.show.armoire.single', {
          url: '/:armoireId',
          controller: 'AdminCustomersArmoireSingleController',
          templateUrl: 'components/states/admin/customer/show/armoire.single.html',
          resolve: {
            pricingRepo: 'pricingRepo',
            clothingTypes: ["pricingRepo", function(pricingRepo){
              return pricingRepo.clothingType.getList();
            }],
            Armoire: 'Armoire',
            armoire: ["Armoire", "$stateParams", function(Armoire, $stateParams){
              return Armoire.one($stateParams.armoireId).get();
            }]
          }
        })
        .state('admin.customer.show.delivery', {
          url: '/delivery',
          templateUrl: 'components/states/admin/customer/show/delivery.html'
        })
        .state('admin.customer.show.supportConvo', {
          url: '/support-convo',
          controller: 'AdminCustomersShowSupportController',
          templateUrl: 'components/states/admin/customer/show/supportConvo.html',
          resolve: {
            Auth: 'Auth',
            support: ["Auth", function(Auth){
              return Auth.user.support.get();
            }]
          }
        })
        .state('admin.delivery', {
          url: '/delivery',
          templateUrl: 'components/states/admin/delivery/delivery.html',
          controller: 'AdminDeliveriesController',
          resolve: {
            Delivery: 'Delivery',
            deliveries: ["Delivery", function(Delivery){
              return Delivery.getList();
            }]
          }
        })
        .state('admin.delivery.show', {
          url: '/delivery/:id',
          templateUrl: 'components/states/admin/delivery/show/show.html',
          controller: 'AdminDeliveriesShowController',
        })
        .state('admin.pricing', {
          url: '/pricing',
          templateUrl: 'components/states/admin/pricing/pricing.html',
          controller: 'AdminPricingController',
        })
        .state('admin.pricing.armoire', {
          url: '/armoire',
          controller: 'AdminPricingArmoireController',
          templateUrl: 'components/states/admin/pricing/armoire.html',
          resolve: {
            pricingRepo: 'pricingRepo',
            armoireTypes: ["pricingRepo", function(pricingRepo){
              return pricingRepo.armoireType.getList();
            }]
          }
        })
        .state('admin.pricing.clothingItem', {
          url: '/clothingItems',
          controller: 'AdminPricingClothingItemController',
          templateUrl: 'components/states/admin/pricing/clothing.html',
          resolve: {
            pricingRepo: 'pricingRepo',
            clothingTypes: ["pricingRepo", function(pricingRepo){
              return pricingRepo.clothingType.getList();
            }]
          }
        })
        .state('admin.support', {
          url: '/support',
          templateUrl: 'components/states/admin/support/support.html',
          controller: 'AdminSupportController',
          resolve: {
            User: 'User',
            users: ["User", function(User){
              return User.getList();
            }]
          }
        })
        .state('admin.stats', {
          url: '/stats',
          templateUrl: 'components/states/admin/stats/stats.html',
          controller: 'AdminStatsController'
        })
        //--------------------------------------
        // CUSTOMER
        //--------------------------------------
        .state('customer', {
          url: '/customer',
          templateUrl: 'components/states/customer/customer.html',
          controller: 'CustomerController',
          data: {
            access: accessLevels.user
          }
        })
        .state('customer.index', {
          url: '/',
          templateUrl: 'components/states/customer/index/index.html',
          controller: 'CustomerIndexController',
          resolve: {
            Auth: 'Auth',
            Clothing: 'Clothing',
            clothes: ["Auth", "Clothing", function(Auth, Clothing){
              return Clothing.one('byUser').one(Auth.user.id).get();
            }]
          }
        })
        .state('customer.armoires', {
          url: '/armoire',
          templateUrl: 'components/states/customer/armoires/armoires.html',
          controller: 'CustomerArmoiresController',
          resolve: {
            pricingRepo: 'pricingRepo',
            armoireTypes: ["pricingRepo", function(pricingRepo){
              return pricingRepo.armoireType.getList();
            }]
          }
        })
        .state('customer.armoires.create', {
          url: '/create/:armoireType',
          controller: 'CustomerArmoiresCreateController',
          templateUrl: 'components/states/customer/armoires/create/create.html',
          resolve: {
            pricingRepo: 'pricingRepo',
            armoireType: ["pricingRepo", "$stateParams", function(pricingRepo, $stateParams){
              return pricingRepo.armoireType.one($stateParams.armoireType).get();
            }],
            deliveryRepo: 'deliveryRepo',
            slots: ["deliveryRepo", function(deliveryRepo){
              return deliveryRepo.slots();
            }]
          }
        })
        .state('customer.armoires.show', {
          url: '/:armoireId',
          controller: 'CustomerArmoiresShowController',
          templateUrl: 'components/states/customer/armoires/show/show.html',
          resolve: {
            pricingRepo: 'pricingRepo',
            clothingTypes: ["pricingRepo", function(pricingRepo){
              return pricingRepo.clothingType.getList();
            }],
            Armoire: 'Armoire',
            armoire: ["Armoire", "$stateParams", function(Armoire, $stateParams){
              return Armoire.one($stateParams.armoireId).get();
            }],
            deliveryRepo: 'deliveryRepo',
            slots: ["deliveryRepo", function(deliveryRepo){
              return deliveryRepo.slots();
            }]
          }
        })
        .state('customer.billing', {
          url: '/billing',
          templateUrl: 'components/states/customer/billing/billing.html',
          controller: 'CustomerBillingController'
        })
        .state('customer.support', {
          url: '/support',
          templateUrl: 'components/states/customer/support/support.html',
          controller: 'CustomerSupportController',
          resolve: {
            Auth: 'Auth',
            support: ["Auth", function(Auth){
              return Auth.user.support.get();
            }]
          },
          data: {
            access: accessLevels.user
          }
        });

        $urlRouterProvider.otherwise('/404');

      // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
      $urlRouterProvider.rule(function($injector, $location) {
        if($location.protocol() === 'file'){
          return;
        }

        var path = $location.path();
        // Note: misnomer. This returns a query object, not a search string
        var search = $location.search();
        var params;

        // check to see if the path already ends in '/'
        if (path[path.length - 1] === '/') {
          return;
        }

        // If there was no search string / query params, return with a `/`
        if (Object.keys(search).length === 0) {
          return path + '/';
        }

        // Otherwise build the search string and return a `/?` prefix
        params = [];
        angular.forEach(search, function(v, k){
          params.push(k + '=' + v);
        });
        return path + '/?' + params.join('&');
      });

      // 404
      /*
      $httpProvider.interceptors.push(function($q, $location) {
        return {
          'responseError': function(response) {
            //console.log(response.config.url);
            if(Auth.checkedSession) {
              if ((response.status === 401 || response.status === 403) && response.config.url != '/api/auth/session') {
                $location.path('/login');
              }
            }
            return $q.reject(response);
          }
        };
      });
      */
    }]
  );

}());

(function() {
  'use strict';

  angular.module('app')
    .directive("scrollTo", ["$window", function($window) {
      return {
        restrict: "AC",
        compile: function() {

          var document = $window.document;

          function scrollInto(idOrName, offset) { //find element with the give id of name and scroll to the first element it finds
            if (idOrName == 'top' || idOrName == 'Top') {
              scrollInto('main');
              return;
            }
            if (!idOrName) {
              $window.scrollTo(0, 0);
              return;
            }

            //check if an element can be found with id attribute
            var el = document.getElementById(idOrName);
            if (!el) { //check if an element can be found with name attribute if there is no such id
              //el = document.getElementsByName(idOrName);

              if (el && el.length)
                el = el[0];
              else
                el = null;
            }

            if (el) { // if an element is found, scroll to the element

              var menu_offset = $('#main').cssInt('margin-top'),
                offset = offset || 0,
                time = 500;

              var top = $(el).offset().top;
              var final_top = top - offset - menu_offset;

              time = time || 500;
              //$("html, body").animate({ scrollTop: 0 }, 500, 'easeOutQuad');

              $("html, body").bind("scroll mousedown DOMMouseScroll mousewheel keyup", function() {
                $('html, body').stop();
                deferred.resolve();
              });

              $("html, body").animate({
                scrollTop: final_top
              }, time, function() {
                $("html, body").unbind("scroll mousedown DOMMouseScroll mousewheel keyup");
              });
            }
            // otherwise, ignore
          }

          return function(scope, element, attr) {
            element.bind("click", function(event) {
              scrollInto(attr.scrollTo, attr.offset);
            });
          };
        }
      };
    }]);
})();

"use strict";
(function () {
  /**
   * @ngdoc service
   * @name app.factory:scrollToTop
   */
  angular.module('app').factory("scrollToTop",
    ["$q", "$rootScope", function ($q, $rootScope) {
      return function (time, target_id, offset_by_menu) {
        var deferred = $q.defer();
        var _target_position = 0;
        ;

        if (getScrollXY().y > 15) {
          time = time || 300;
          //$("html, body").animate({ scrollTop: 0 }, 500, 'easeOutQuad');

          $("html, body").bind("scroll mousedown DOMMouseScroll mousewheel keyup", function () {
            $('html, body').stop();
            deferred.resolve();
          });

          if (angular.isDefined(target_id)) {
            var el = document.querySelector("#".concat(target_id));
            if (el) {
              _target_position = 0 - el.getBoundingClientRect().top;
              console.log('#'.concat(target_id, ' top:', _target_position), el)

              if (offset_by_menu) {
                var menu_el = document.getElementById('main-navigation');
                var menu_offset = parseInt(window.getComputedStyle(menu_el).getPropertyValue('height'));
                console.log('menu offset: ', menu_offset);
                _target_position -= menu_offset;
              }
            }
          }

          $("html, body").animate({scrollTop: _target_position}, time, function () {
            $("html, body").unbind("scroll mousedown DOMMouseScroll mousewheel keyup");
            deferred.resolve();
          });
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      };
    }]
  );
})();

'use strict';

(function(){
  angular.module('app').directive('showErrors', function() {
    return {
      restrict: 'A',
      require:  '^form',
      link: function (scope, el, attrs, formCtrl) {
        // find the text box element, which has the 'name' attribute
        var inputEl   = el[0].querySelector("[name]");
        // convert the native text box element to an angular element
        var inputNgEl = angular.element(inputEl);
        // get the name on the text box so we know the property to check
        // on the form controller
        var inputName = inputNgEl.attr('name');

        // only apply the has-error class after the user leaves the text box
        inputNgEl.bind('blur', function() {
          el.toggleClass('has-error', formCtrl[inputName].$invalid);
        })
      }
    }
  });
})();

'use strict';
(function () {
  angular.module('app')
    .directive('sideMenu',
    ["$rootScope", "Auth", function ($rootScope, Auth) {
      var _postLink = function postLink(scope, element, attrs) {
        scope.user = Auth.user;

        function onSideMenuChanged(e, args) {
        }

        $('#content-wrapper').click(onMainClick);

        function onMainClick(e) {
          closeSidebar();
        }

        function closeSidebar() {
          $('#side-menu-toggle').prop('checked', false);
        }

        $rootScope.$on('sideMenuToggle', onSideMenuChanged);
        $rootScope.$on('$stateChangeStart', closeSidebar);
      };

      return {
        templateUrl: 'components/sideMenu-directive/sideMenu.html',
        restrict: 'E',
        replace: true,
        link: _postLink
      };
    }]
  );
})();

'use strict';

(function () {
  angular.module('app')
    .directive('slot',
    ["$log", function ($log) {
      var _postLink = function postLink(scope, element, attrs) {
        //$log.info('SLOT');
      };

      return {
        templateUrl: 'components/slot-directive/slot.html',
        restrict: 'A',
        scope: {
          slot: '=',
          slotFormat: '@'
        },
        link: _postLink
      };
    }]
  );
})();

'use strict';

(function () {
  angular.module('app')
    .directive('slots',
    ["$log", function ($log) {
      var _postLink = function postLink(scope, element, attrs) {
        scope.groups = [];

        scope.$watch('slots', function(){
          groupSlots(scope.slots);
        });

        function groupSlots(slots){
          if(!slots.length)
            return;

          scope.groups = [[]];
          var cutoff = moment(slots[0]).add(1, 'days').hour(0).minute(0).subtract(1, 'minutes');
          _.each(scope.slots, function(slot){
            var mDate = moment(slot);

            if(mDate.isAfter(cutoff)){
              scope.groups.push([]);
              cutoff = moment(slot).add(1, 'days').hour(0).minute(0).subtract(1, 'minutes');
            }

            scope.groups[scope.groups.length - 1].push(mDate);
          });

          $log.info(scope.groups);
        }
      };

      return {
        templateUrl: 'components/slots-directive/slots.html',
        restrict: 'A',
        link: _postLink,
        scope: {
          slots: '=',
          selectedSlot: '='
        }
      };
    }]
  );
})();

'use strict';

(function(){
  angular.module('app').directive('smallCenterWithLogo', function() {
    return {
      restrict: 'AE',
      link: function(scope, el, attrs){
        el.addClass('col-xs-10 col-xs-offset-1 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4');
        el.prepend( '<img src="/images/Armoire-Logo.69c154b3.png" style="width: 100%"><p>&nbsp;</p>');
      }
    };
  });
})();

(function() {
  'use strict';

  angular.module('app')
    .directive('userAvatar',
      ["$log", "$modal", "views", function($log, $modal, views) {

        var _link = function(scope, el, attrs) {

          /*
           *
           */
          scope.openAvatarModal = function() {
            var modalInstance = $modal.open({
              templateUrl: 'components/avatarUpload-modal/avatarUpload.html',
              controller: 'ModalAvatarUploadController',
              size: 'sm',
              resolve: {
                user: function() {
                  return scope.user;
                }
              }
            });

            modalInstance.result.then(function(img) {
              uploadAvatar(img);
            }, function() {
              $log.info('Modal dismissed at: ' + new Date());
            });

            $log.info(modalInstance);
          };

          function uploadAvatar(imgObj){
            scope.user.updateAvatar
              .post({img: imgObj})
              .then(function(updatedUser){
                scope.user = updatedUser;
              }, function(error){
                $log.warn('error: ', error);
              });
          }

        };

        return {
          restrict: 'E',
          scope: {
            user: '='
          },
          templateUrl: 'components/userAvatar-directive/userAvatar.html',
          link: _link
        };
      }]);

}());

'use strict';

(function(){
  angular.module('app').constant('validationPatterns', {
    //password    : '^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,16}$', // Password must be at least 4 characters, no more than 16 characters, and must include at least one upper case letter, one lower case letter, and one numeric digit.
    password    : '(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{6,20})$', // 6-20 characters. 1 number, 1 letter
    phoneNumber : '\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})$',
    firstName   : '^([a-zA-Z]).{2,30}\s*',
    lastName    : '^([a-zA-Z]).{2,30}\s*'
  });
})();

(function () {
  'use strict';

  var viewsBase = '/';
  var componentsBase = viewsBase.concat('components/');
  var statesBase = componentsBase.concat('states/');

  var all = {
    includes: {
      toc: componentsBase.concat('termsAndConditions/termsAndConditions.html')
    },
    modals: {
      avatarUpload: componentsBase.concat('avatarUpload-modal/avatarUpload.html'),
      newArmoire: componentsBase.concat('newArmoire-modal/newArmoire.html'),
      deliverItems: componentsBase.concat('deliveryItems-modal/deliveryItems.html')
    }
  };

  angular.module('app').constant('views', all);
})();

'use strict';

(function(){
  /**
   * @ngdoc function
   * @name app.controller:NotFoundController
   * @description
   * # NotFoundCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/about</code>
   */
  angular.module('app').controller('NotFoundController',
    ["$scope", "$state", "$timeout", function ($scope, $state, $timeout) {
      $scope.time = 3;
      $scope.cTime = 3;
      $scope.increment = .01;
      $scope.callbackTime = $scope.increment * 1000;

      var countdown = function(){
        $scope.cTime -= $scope.increment;
        $scope.cPer = ($scope.time - $scope.cTime)/$scope.time;
        if($scope.cTime <= 0){
          $state.go('home');
          return;
        }
        $timeout(countdown, $scope.callbackTime);
      };
      countdown();
    }]
  );
})();

'use strict';

(function(){
  /**
   * @ngdoc function
   * @name app.controller:AboutCtrl
   * @description
   * # AboutCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/about</code>
   */
  angular.module('app').controller('AboutController',
    ["$scope", "faq", function ($scope, faq) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];

      $scope.faq = faq;
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:AdminController
   * @description
   * # AdminController
   * Controller of the app
   *
   * ## Route
   * <code>/admin</code>
   */
  angular.module('app').controller('AdminController',
    ["$scope", function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:ContactCtrl
   * @description
   * # ContactCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/contact</code>
   */
  angular.module('app').controller('ContactController',
    ["$scope", "Auth", function ($scope, Auth) {
      if (Auth.isLoggedIn()) {
        $scope.emailInput = Auth.user.email;
        $scope.nameInput = Auth.user.fName + ' ' + Auth.user.lName;
      }
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:CustomerCtrl
   * @description
   * # CustomerCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/customer</code>
   */
  angular.module('app').controller('CustomerController',
    ["$scope", function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }]
  );
})();

'use strict';

(function() {
  /**
   * @ngdoc function
   * @name app.controller:ForgotPasswordController
   * @description
   * # ForgotPasswordController
   * Controller of the app
   *
   * ## Route
   * <code>/forgot-password</code>
   */
  angular.module('app').controller('ForgotPasswordController',
    ["$scope", "$log", "SweetAlert", "Auth", function ($scope, $log, SweetAlert, Auth) {
      $scope.sentEmail = false;

      $scope.submit = function(){
        Auth.forgotPassword($scope.email).then(
          function(resp){
            $scope.sentEmail = true;
            SweetAlert.success('Yay', 'Check your email!');
            $log.info(resp);
          },
          function(err){
            $log.error(err);
            SweetAlert.error('Oops', 'We did not find a user with that email.');
          }
        );
      }
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:LogoutCtrl
   * @description
   * # LogoutCtrl
   * Controller of the app.
   *
   * ## Route
   * <code>/logout</code>
   */
  angular.module('app').controller('LogoutController',
    ["$scope", "$state", "SweetAlert", "Auth", function ($scope, $state, SweetAlert, Auth) {
      function logoutCb(){
        SweetAlert.success("Success!", "You've logged out!");
        $state.go('home');
      }

      Auth.logout(logoutCb);
    }]
  );
})();

(function(){
  'use strict';

  /**
   * @ngdoc function
   * @name app.controller:ProfileController
   *
   * @description
   * # ProfileController
   * Controller for a user's profile.
   *
   * ## Route
   * <code>/profile</code>
   */
  angular.module('app').controller('ProfileController',
    ["$log", "$rootScope", "$scope", "$state", "$timeout", "SweetAlert", "$modal", "Auth", "regions", "views", function ($log, $rootScope, $scope, $state, $timeout, SweetAlert, $modal, Auth, regions, views) {
      $log.info(Auth.user);

      $scope.user = Auth.user;
      $scope.processing = false;

      //-------------------------------------------------------------
      // Alerts
      //-------------------------------------------------------------
      $scope.alerts = [];
      $scope.addAlert = function(type, msg) {
        type = type || 'success';
        $scope.alerts.push({type: type, msg: msg});
      };

      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.checkProfileComplete = function(){
        if(!$scope.user.isProfileComplete){
          $scope.addAlert(
            'warning',
            '<strong>Wait</strong><br/>You need to finish your profile before you can add any armoires!'
          );
        }else if(!$scope.user.profileCompletedAlertShown){
          // clear all alerts
          $scope.alerts = [];
          // tell API we showed alert
          $scope.user.patch({
            profileCompletedAlertShown: true,
          });
          SweetAlert.success("Success!", "Your profile is now complete.");
        }
      };

      //TODO: Need to get user after address update and billing update!!
      $rootScope.$on('billingUpdated', function(){
        refreshUserObj();
      });

      $scope.checkProfileComplete();

      //-------------------------------------------------------------
      // GENERAL
      //-------------------------------------------------------------
      $scope.generalFormSubmit = function(){
        $scope.processing = true;
        $scope.user.patch({
          firstName: $scope.user.firstName,
          lastName: $scope.user.lastName,
          phone: $scope.user.phone,
          local: $scope.user.local
          }).then(function(user){
            SweetAlert.success("Yay!", "Info updated");
            refreshUserObj();
        },
        function(err){

        });
      };


      //-------------------------------------------------------------
      // ADDRESS
      //-------------------------------------------------------------
      $scope.regions = regions;
      $scope.cities = [];
      $scope.states = [];

      $scope.addressFormSubmit = function(){
        $scope.processing = true;
        $scope.user.patch({
          address: $scope.user.address
        }).then(function(user){
            SweetAlert.success("Yay!", "Address updated");
            refreshUserObj();
        },
        function(err){

        },
        function(){
          $scope.processing = false;
        });
      };

      $scope.$watch('user.address.country', function(newValue){
        if(newValue){
          $scope.states = _.findWhere(regions, { country: newValue}).states;
          if($scope.states.length){
            $scope.user.address.state = $scope.states[0].state;
          }
        }
      });

      $scope.$watch('user.address.state', function(newValue){
        if(newValue){
          $scope.cities = _.findWhere($scope.states, { state: newValue}).cities;
        }
      });

      $timeout(function(){
        if(!angular.isDefined($scope.user.address)){
          $scope.user.address = {};
          $scope.user.address.country = $scope.regions[0].country;
        }
      });

      //-------------------------------------------------------------
      // PASSWORD
      //-------------------------------------------------------------
      $scope.passwordFormSubmit = function(){
        $scope.user.patch({
          local: {
            password: $scope.password,
            email: $scope.user.local.email
          }
        }).then(function(user){
            SweetAlert.success("Yay!", "Password updated");
        },
        function(err){
          $log.error(err);
        },
        function(){
          $scope.processing = false;
        });
      };

      function refreshUserObj(){
        console.log('refreshUserObj');
        // get an updated user obj from API
        Auth
        .getUser()
        .then(function(user){
          $timeout(function(){
            $scope.user = user;
            $scope.checkProfileComplete();
          });
        });
      }
    }]
  );
})();

'use strict';

(function() {
  /**
   * @ngdoc function
   * @name app.controller:ResetPasswordController
   * @description
   * # ResetPasswordController
   * Controller of the app
   *
   * ## Route
   * <code>/reset-password</code>
   */
  angular.module('app').controller('ResetPasswordController',
    ["$scope", "$log", "$state", "$stateParams", "SweetAlert", "Auth", function ($scope, $log, $state, $stateParams, SweetAlert, Auth) {
      $scope.submit = function(){
        Auth.resetPassword($stateParams.token, $scope.password, $scope.passwordConfirm).then(
          function(resp){
            $log.info(resp);
            $state.go('home');
          },
          function(err){
            $log.error(err);
            SweetAlert.error('Oops', 'Expired link.');
          }
        );
      }
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:SignupController
   * @description
   * # SignupController
   * Controller of the app
   *
   * ## Route
   * <code>/signup</code>
   */
  angular.module('app').controller('SignupController',
    ["$scope", "$timeout", "$state", "Auth", "views", function ($scope, $timeout, $state, Auth, views) {
      $scope.user = {
      };

      $scope.views = views;

      $scope.processing = false;

      $scope.formSubmit = function () {
        $scope.processing = true;
        Auth.signup({
          firstName : $scope.user.firstName,
          lastName  : $scope.user.lastName,
          phone     : $scope.user.phone,
          email     : $scope.user.local.email,
          password  : $scope.user.local.password
        }).then(function(res){
          console.log(res);
          $state.go('profile');
        }, function(err){
          console.log(err);
        });
      };
    }]
  );
})();

(function() {
  'use strict';

  /**
   * @ngdoc function
   * @name app.controller:AdminCustomersController
   * @description
   * # AdminCustomersController
   * Controller of the app
   *
   * ## Route
   * <code>/admin/customers</code>
   */
  angular.module('app').controller('AdminCustomersController',
    ["users", "$log", "$scope", "$timeout", "User", function (users, $log, $scope, $timeout, User) {
      $scope.users = users; // From ui-router resolve

      $scope.tabData   = [
        {
          heading: 'Profile',
          route:   'admin.customer.show.profile'
        },
        {
          heading: 'Armoire',
          route:   'admin.customer.show.armoire'
        },
        {
          heading: 'Billing',
          route:   'admin.customer.show.billing'
        },
        {
          heading: 'Delivery',
          route:   'admin.customer.show.delivery'
        },
        {
          heading: 'Support',
          route:   'admin.customer.show.supportConvo'
        }
      ];

      $scope.$watch('tabData', function(newVal){
        //$log.info(newVal);
        var selected = _.findWhere(newVal, {active:true});
        if(selected){
          switch(selected.heading){
            case 'Profile':{
              break;
            }
            case 'Armoire':{
              break;
            }
            case 'Delivery':{
              break;
            }
            case 'Support':{
              break;
            }
            default: break;
          }
        }
      }, true);

      $scope.$watch('q', function(newValue){
        $timeout(function(){
          //list();
        });
      });

      function list(){
        User.getList($scope.q).then(list_callback, list_errCallback);
      }

      function list_callback(res){
        $scope.users = res;
      }

      function list_errCallback(err){

      }
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:AdminDeliveriesCtrl
   * @description
   * # AdminDeliveriesCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/admin/delivery</code>
   */
  angular.module('app').controller('AdminDeliveriesController',
    ["deliveries", "$scope", "$log", "$timeout", "$filter", "Delivery", "geolocation", function (deliveries, $scope, $log, $timeout, $filter, Delivery, geolocation) {
      $scope.deliveries = deliveries; // Resolved by UI-Router

      $scope.now = moment();

      /*
      $scope.$watch('q', function(newValue){
        $timeout(function(){
          list();
        })
      });
      */

      $scope.hideCompleted = true;
      $scope.hideCancelled = true;

      $scope.$watch('deliveries', processDeliveries);

      function list(){
        Delivery.getList($scope.q).then(list_callback, list_errCallback);
      }

      $scope.refresh = function(){
        processDeliveries();
        list();
      };

      function list_callback(succ){
        $scope.deliveries = succ;
        processDeliveries();
      }

      function list_errCallback(err){

      }

      var processDeliveries = function(){
        _.each($scope.deliveries, function(delivery){
          delivery.dateMoment = moment(delivery.date);

          if(delivery.deliveredAt) {
            delivery.delivered = true;
            delivery.deliveredAtMoment = moment(delivery.deliveredAt);
          }
        });

        updateFilters();
      };

      var updateFilters = function () {
        $log.info('updateFilters');

        $scope.currentDeliveries = $filter('filter')($scope.deliveries, {
          enabled: true,
          active: true,
          delivered: false
        });

        $scope.futureDeliveries = $filter('filter')($scope.deliveries, {
          enabled: true,
          delivered: false,
          active: false
        });
        $scope.finishedDeliveries = $filter('filter')($scope.deliveries, {
          enabled: true,
          delivered: true
        });
        $scope.canceledDeliveries = $filter('filter')($scope.deliveries, {enabled: false, cancelled: true});
      };

      geolocation.getLocation().then(
        function (location) {
          //console.log(location);
          _.each($scope.users, function (user) {
            console.log(user);

            user.getDistance().then(
              function (result) {
                console.log(result);
              }
            );
          });
        },
        function (error) {
          console.error(error);
        }
      );

      processDeliveries();
    }]
  );
})();

'use strict';

(function() {
  /**
   * @ngdoc function
   * @name app.controller:AdminIndexCtrl
   * @description
   * # AdminIndexCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/admin/</code>
   */
  angular.module('app').controller('AdminIndexController',
    ["$scope", function ($scope) {

    }]
  );
})();

(function() {
  'use strict';

  angular.module('app')
    .controller('AdminPricingController',
      ["$scope", "$log", "$timeout", function($scope, $log, $timeout) {
        $timeout(function() {
          $(".nav").sticky({
            topSpacing: stickyTopOffset
          });
        });

        $scope.tabData = [{
          heading: 'Armoires',
          route: 'admin.pricing.armoire'
        }, {
          heading: 'Clothing Items',
          route: 'admin.pricing.clothingItem'
        }];

      }]);
})();

(function() {
  'use strict';

  angular.module('app')
    .controller('AdminPricingArmoireController',
      ["armoireTypes", "$scope", "$log", "SweetAlert", "pricingRepo", function(armoireTypes, $scope, $log, SweetAlert, pricingRepo) {
        $scope.armoireTypes = armoireTypes; // Resolved by UI router

        $scope.newType = {};

        var refreshTypes = function() {
          $scope.types = [];

          pricingRepo.armoireType.getList().then(function(types) {
            $scope.armoireTypes = types;
          }, function(err) {
            $log.error(err);
            SweetAlert.error('Whoops!', 'Error loading types.');
          });
        };

        $scope.onNewType = function() {
          $scope.newType = {};
          refreshTypes();
        };

        $scope.onDestroy = function() {
          refreshTypes();
        };
      }]);
})();

(function () {
  'use strict';

  angular.module('app')
    .controller('AdminPricingClothingItemController',
    ["clothingTypes", "$scope", "$log", "SweetAlert", "pricingRepo", function (clothingTypes, $scope, $log, SweetAlert, pricingRepo) {
      $scope.clothingTypes = clothingTypes; // Resolved by UI router

      $scope.newType = {};

      var refreshTypes = function() {
        $scope.types = [];

        pricingRepo.clothingType.getList().then(function (types) {
          $scope.clothingTypes = types;
        }, function (err) {
          $log.error(err);
          swal('Oops', 'Error loading types.', 'error');
        });
      };

      $scope.onNewType = function(){
        $scope.newType = {};
        refreshTypes();
      };

      $scope.onDestroy = function(){
        refreshTypes();
      };
    }]);
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:AdminStatsCtrl
   * @description
   * # AdminStatsCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/admin/stats</code>
   */
  angular.module('app').controller('AdminStatsController',
    ["$scope", function ($scope) {
      var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      var charts = {
        newDeliveries: {
          id: '#delivery-new-chart',
          data: {
            labels: days,
            series: [
              [1, 0, 2, 1, 0, 0, 4]
            ]
          },
          ops: {
            low: 0,
            showArea: true,
            showLine: false,
            showPoint: false
          }
        },
        newUsers: {
          id: '#users-new-chart',
          data: {
            labels: days,
            series: [
              [1, 5, 2, 10, 8, 7, 12],
              [20, 5, 2, 10, 18, 7, 22]
            ]
          },
          ops: {
            low: 0,
            showArea: true,
            showLine: false,
            showPoint: false
          }
        },
        referrals: {
          id: '#users-referral-chart',
          data: {
            labels: days,
            series: [
              [20, 5, 2, 10, 18, 7, 22]
            ]
          },
          ops: {
            low: 0,
            showArea: true,
            showLine: false,
            showPoint: false
          }
        },
        cashFlow: {
          id: '#cash-chart',
          data: {
            labels: days,
            series: [
              [-20, 50, 515, 85, -300, 5, 64]
            ]
          },
          ops: {
            low: -400,
            showArea: true,
            showLine: false,
            showPoint: false
          }
        }
      };

      _.each(charts, function (chartSet) {
        new Chartist.Line(chartSet.id, chartSet.data, chartSet.ops);
      });
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:AdminSupportController
   * @description
   * # AdminSupportController
   * Controller of the app
   *
   * ## Route
   * <code>/admin/support</code>
   */
  angular.module('app').controller('AdminSupportController',
    ["users", "$scope", "$timeout", "User", function (users, $scope, $timeout, User) {
      $scope.users = users; // Resolved by UI-Router
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:CustomerArmoiresController
   * @description
   * # CustomerArmoiresController
   * Controller of the app
   *
   * ## Route
   * <code>/customer/armoire</code>
   */
  angular.module('app').controller('CustomerArmoiresController',
    ["armoireTypes", "$scope", "$log", "$timeout", "SweetAlert", "views", "User", "Auth", function (armoireTypes, $scope, $log, $timeout, SweetAlert, views, User, Auth) {
      $scope.armoireTypes = armoireTypes; // Resolved by UI-Router

      $scope.currentUser = Auth.user;

      $scope.$watch('q', function(newValue){
        $log.info('q', newValue);
        $timeout(function(){
          $scope.refresh();
        })
      });

      $scope.refresh = function(){
        Auth.user.armoire.getList().then(
          function(armoires){
            $scope.currentUser.armoires = armoires;
          },
          function(err){
            SweetAlert.error("Oops...", "Problem loading your armoires. Please try again shortly.");
          }
        );
      };
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:CustomerBillingController
   * @description
   * # CustomerBillingController
   * Controller of the app
   *
   * ## Route
   * <code>/customer/billing-info</code>
   */
  angular.module('app').controller('CustomerBillingController',
    ["$scope", function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }]
  );
})();

'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:CustomerIndexCtrl
   * @description
   * # CustomerIndexCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/customer/</code>
   */
  angular.module('app').controller('CustomerIndexController',
    ["clothes", "$scope", function (clothes, $scope) {
      $scope.clothes = clothes; // Resolved by UI-Router
    }]
  );
})();

'use strict';
(function () {
  /**
   * @ngdoc function
   * @name app.controller:CustomersettingsCtrl
   * @description
   * # CustomersettingsCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/customer/settings</code>
   */
  angular.module('app').controller('CustomerSettingsController',
    ["$scope", "regions", "User", function ($scope, regions, User) {
      $scope.regions = regions;

      $scope.expirations = {
        months: [
          '1 - January',
          '2 - February',
          '3 - March',
          '4 - April',
          '5 - May',
          '6 - June',
          '7 - July',
          '8 - August',
          '9 - September',
          '10 - October',
          '11 - November',
          '12 - December'
        ],
        years: [
          2014,
          2015,
          2016,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023,
          2024
        ]
      };
    }]
  );
})();

'use strict';

(function() {
  angular.module('app')
    .controller('CustomerSupportController',
    ["support", "$log", "$scope", "$stateParams", "$q", "$timeout", "$document", "User", "Auth", function (support, $log, $scope, $stateParams, $q, $timeout, $document, User, Auth) {
      $scope.support = support;
      //$scope.support = Auth.user.support;
      $scope.message = '';
      $scope.sending = false;

      $timeout(function(){
        $("#reply-box").sticky({bottomSpacing:1});
      });

      $scope.gotoBottom = function(duration) {
        var dPerMessage = 300; // Milliseconds
        duration = duration || dPerMessage * $scope.support.messages.length;
        //$log.info(duration, $scope.supportConvo.messages);
        var someElement = angular.element(document.getElementById('after-messages'));
        $document.scrollToElement(someElement, 0, duration);
      };

      var refresh = function(){
        var deferred = $q.defer();

        Auth.user.support.get().then(
          function(succ){
            $scope.support = succ;
            processConvos();
            deferred.resolve(succ);
          },
          function(err){
            deferred.reject(err);
          }
        );
        return deferred.promise;
      };

      var processConvos = function(){
        _.each($scope.support.messages, function(message){
          /*
          if(message.owner){
            message.isUser = Auth.user.id === message.owner.id
          } else {
            message.isUser = false;
          }
          */
        });
        $timeout(function(){
          $scope.gotoBottom();
        });
      };

      processConvos();

      ///*
      $scope.sendMessage = function(){
        $scope.sending = true;
        Auth.user.support.post({
          message: $scope.message
        }).then(
          function(){
            $scope.message = '';
            refresh().then(function(){
              $scope.sending = false;
            });
          },
          function(err){

          }
        )
      };
    }]
  );
})();

(function() {
  'use strict';
  angular.module('app')
    .controller('AdminCustomersArmoireSingleController',
      ["$log", "fetchedUser", "$scope", "$stateParams", "$timeout", "armoire", "clothingTypes", "Armoire", "Clothing", "SweetAlert", function($log, fetchedUser, $scope, $stateParams, $timeout,
        armoire, clothingTypes, Armoire, Clothing, SweetAlert) {
        $scope.armoire = armoire; // Resolved by UI-Router
        $scope.clothingTypes = clothingTypes; // Resolved by UI-Router

        $scope.addNew = false;

        var defaultItem = {
          sending: false,
          name: '',
          type: '',
          img: {
            name: '',
            uri: ''
          },
          options: {

          }
        };

        $scope.armoire = _.findWhere($scope.fetchedUser.armoires, {
          id: $stateParams.armoireId
        });
        $scope.showAddNew = function() {
          $scope.addNew = true;
        };
        $scope.hideAddNew = function() {
          $scope.addNew = false;
        };

        $scope.resetItem = function($flow) {
          $timeout(function() {
            if($flow){
              $flow.cancel();
            }
            $scope.newItem = angular.copy(defaultItem);
            $scope.addNew = false;
          });
        };
        $scope.resetItem();

        $scope.onImgAdded = function(flowFile) {
          var fileReader = new FileReader();
          fileReader.onload = function(event) {
            var uri = event.target.result;
            $timeout(function() {
              $scope.newItem.img = {
                name: flowFile.name,
                uri: uri
              };
            });
          };
          fileReader.readAsDataURL(flowFile.file);
        };

        $scope.saveItem = function($flow) {
          SweetAlert.swal({
            title: 'Saving...',
            text: '<h3><i class="fa fa-cog fa-spin"></i></h3>',
            html: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
          });

          $scope.newItem.armoire = armoire.id;
          $scope.newItem.sending = true;
          Clothing.post($scope.newItem).then(
            function(succ) {
              SweetAlert.success('FANTASTIC', 'Item added!');
              $scope.refresh();
            },
            function(err) {
              SweetAlert.error('OOPS', 'Could not add item! Try again in a few minutes.');
              $scope.resetItem($flow);
            }
          ).finally(function() {
            $scope.newItem.sending = false;
            SweetAlert.swal.close();
          });
          $scope.resetItem($flow);
        };

        $scope.refresh = function() {
          Armoire.one(armoire.id).get().then(
            function(resp) {
              $scope.armoire = resp;
            },
            function(err) {
              SweetAlert.error('OOPS', 'Could not load armoire.');
            }
          );
        };

      }]
    );
})();

(function() {
  'use strict';

  angular.module('app')
    .controller('AdminCustomersBillingController', AdminCustomersBillingController);

  function AdminCustomersBillingController(fetchedUser, $scope, $timeout, $log, SweetAlert) {
    $scope.showCharges = false;
    $scope.charges = [];

    $scope.addCharge = function(chargeObj, isValid){
      if(!isValid){
        return;
      }

      $scope.fetchedUser.charge.post(chargeObj).then(
        function(succ){
          $log.info(succ.latestCharge);
          resetChargeObj();
          // insert charge
          $scope.charges.unshift(succ.latestCharge);

          SweetAlert.success('Yay!', 'Charge was applied.');
        },
        function(err){
          $log.error(err);
          SweetAlert.error('Whoops!', 'Could not charge customer.');
        }
      );
    };

    function getCharges(){
      $scope.showCharges = false;
      $scope.charges = [];

      $scope.fetchedUser.billing
        .get()
        .then(function(billedUser) {
          $timeout(function() {
            // get charges
            $scope.charges = billedUser.billingData.charges.data;
            // ready to show charges
            $scope.showCharges = true;
          });
        });
    }

    function resetChargeObj(){
      $timeout(function () {
        $scope.newCharge = {
          amount: '',
          description: ''
        };
      });
    }

    function init(){
      resetChargeObj();
      if ($scope.fetchedUser.isProfileComplete) {
        getCharges();
      }
    }

    init();
  }
  AdminCustomersBillingController.$inject = ["fetchedUser", "$scope", "$timeout", "$log", "SweetAlert"];

})();

'use strict';

(function () {
  angular.module('app')
    .controller('AdminCustomersShowController',
    ["fetchedUser", "$scope", "$stateParams", "$log", "$q", "$timeout", "$document", "User", "Auth", function (fetchedUser, $scope, $stateParams, $log, $q, $timeout, $document, User, Auth) {
      $scope.fetchedUser = fetchedUser; // Resolved by ui-state
      $scope.currentUser = Auth.user;

      $timeout(function(){
        $(".nav").sticky({topSpacing:stickyTopOffset});
      });
    }]
  );
})();

'use strict';

(function () {
  angular.module('app')
    .controller('AdminCustomersShowSupportController',
    ["support", "$scope", "$stateParams", "$log", "$q", "$timeout", "$document", "User", "Auth", "appSocket", function (support, $scope, $stateParams, $log, $q, $timeout, $document, User, Auth, appSocket) {
      $scope.support = support; // Resolved by UI-Router
      $scope.currentUser = Auth.user;
      $scope.message = '';
      $scope.sendingMessage = false;

      $scope.gotoBottom = function () {
        var duration = 1000;
        var someElement = angular.element(document.getElementById('after-messages'));
        $document.scrollToElement(someElement, 0, duration);
      };

      var processMessages = function(supportConvo){
        _.each(supportConvo.messages, function (message) {
        });
        return supportConvo;
      };

      var refreshMessages = function () {
        var deferred = $q.defer();

        $scope.fetchedUser.support.get().then(
          function (supportConvo) {
            $scope.support = processMessages(supportConvo);

            $timeout(function () {
              $scope.gotoBottom();
            });

            deferred.resolve(supportConvo);
          },
          function (err) {
            deferred.reject(err);
          }
        );
        return deferred.promise;
      };

      appSocket.on('socket:user.supportConvo.message', function(ev, data){
        $log.info(ev, data);
      });

      $scope.sendSupportMessage = function(){
        if($scope.message.length < 3){
          $log.error($scope.message, 'length too short');
          return;
        }
        $scope.sendingMessage = true;
        $scope.fetchedUser.support.post({
          message: $scope.message
        }).then(
          function(succ){
            /*
            appSocket.emit('user.supportConvo.message', {
              owner: Auth.user.id,
              recipient: $stateParams.id,
              message: message
            });
            */
            $scope.message = '';
            // refreshMessages().then(function(){
            //   $scope.sendingMessage = false;
            // });
          },
          function(err){

          }
        )
      };
    }]
  );
})();

'use strict';

(function() {
  angular.module('app')
    .controller('AdminDeliveriesShowCtrl',
    ["$scope", "$stateParams", "deliveryRepo", function ($scope, $stateParams, deliveryRepo) {
    }]
  );
})();

(function() {
  'use strict';

  angular.module('app')
    .controller('CustomerArmoiresCreateController',
      ["armoireType", "slots", "$scope", "$log", "$state", "$stateParams", "Auth", "SweetAlert", "Armoire", function(armoireType, slots, $scope, $log, $state, $stateParams, Auth, SweetAlert, Armoire) {
        $scope.armoireType = armoireType; // Resolved by UI-Router
        $scope.slots = slots; // Resolved by UI-Router
        $scope.armoire = {
          type: $stateParams.armoireType,
          owner: Auth.user.id,
          name: '',
          deliveryTime: null
        };

        $scope.saveArmoire = function() {
          Auth.user.armoire.post($scope.armoire).then(
            function(succ) {
              SweetAlert.success('Yay!', 'Armoire added');
              $scope.refresh(); // Inherited from parent.
              $state.go('^.show', {
                armoireId: succ.id
              });
            },
            function(err) {
              SweetAlert.error('Oops', 'We could not add an armoire at this time. Please try again later.');
            }
          );
        };

        $scope.$watch('armoire.deliveryTime', function(val) {
          $scope.armoire.deliveryTimeReadable = moment(val).format('MMMM Do, YYYY @ h:mm a');
        });

        function groupSlots(slots) {
          if (!slots.length) {
            return;
          }

          $scope.groups = [
            []
          ];
          var cutoff = moment(slots[0]).add(1, 'days').hour(0).minute(0).subtract(1, 'minutes');
          _.each(slots, function(slot) {
            var mDate = moment(slot);

            if (mDate.isAfter(cutoff)) {
              $scope.groups.push([]);
              cutoff = moment(slot).add(1, 'days').hour(0).minute(0).subtract(1, 'minutes');
            }

            $scope.groups[$scope.groups.length - 1].push(mDate);
          });
        }
        groupSlots(slots);
      }]);
})();


(function() {
  'use strict';

  angular.module('app')
    .controller('CustomerArmoiresShowController',
      ["armoire", "clothingTypes", "slots", "$scope", "$log", "$modal", "Armoire", "SweetAlert", function(armoire, clothingTypes, slots, $scope, $log, $modal, Armoire, SweetAlert) {
        $scope.armoire = armoire; // Resolved by UI-Router
        $scope.clothingTypes = clothingTypes; // Resolved by UI-Router
        $scope.slots = slots; // Resolved by UI-Router

        $scope.openDeliverItemsModal = function(itemId) {
          itemId = itemId || 0;

          var modalInstance = $modal.open({
            templateUrl: 'components/deliverItems-modal/deliverItems.html',
            controller: 'ModalDeliverItemsController',
            size: 'lg',
            animation: false,
            resolve: {
              items: function() {
                return $scope.armoire.items;
              },
              slots: function() {
                return $scope.slots;
              },
              selectedItemId: function() {
                return itemId;
              }
            }
          });

          modalInstance.result.then(function(retObj) {
            $log.warn('retObj: ', retObj);
            Armoire
              .one($scope.armoire.id)
              .post('addDelivery', retObj).then(
              function(updatedArmoire) {
                $log.info('succ: ', updatedArmoire);
                $scope.armoire = updatedArmoire;
                SweetAlert.success('Yay!', 'Delivery created');
              },
              function(err) {
                $log.info('err: ', err);
                SweetAlert.error('Oops', 'We could not create this delivery at this time. Please try again later.');
              }
            );
          }, function() {
            $log.info('Modal dismissed at: ' + new Date());
          });

          $log.info(modalInstance);
        };

      }]);
})();

//# sourceMappingURL=app.js.212bf847.map
