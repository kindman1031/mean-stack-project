(function() {
  'use strict';

  angular.module('app').config(
    function appRoutingConfig($httpProvider, $locationProvider, $urlRouterProvider, $stateProvider, RoutingConfigProvider, views) {
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
            users: function(User){
              return User.getList();
            }
          }
        })
        .state('admin.customer.show', {
          url: '/:id',
          templateUrl: 'components/states/admin/customer/show/show.html',
          controller: 'AdminCustomersShowController',
          resolve: {
            User: 'User',
            fetchedUser: function(User, $stateParams){
              return User.one($stateParams.id).get();
            }
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
            clothingTypes: function(pricingRepo){
              return pricingRepo.clothingType.getList();
            },
            Armoire: 'Armoire',
            armoire: function(Armoire, $stateParams){
              return Armoire.one($stateParams.armoireId).get();
            }
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
            support: function(Auth){
              return Auth.user.support.get();
            }
          }
        })
        .state('admin.delivery', {
          url: '/delivery',
          templateUrl: 'components/states/admin/delivery/delivery.html',
          controller: 'AdminDeliveriesController',
          resolve: {
            Delivery: 'Delivery',
            deliveries: function(Delivery){
              return Delivery.getList();
            }
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
            armoireTypes: function(pricingRepo){
              return pricingRepo.armoireType.getList();
            }
          }
        })
        .state('admin.pricing.clothingItem', {
          url: '/clothingItems',
          controller: 'AdminPricingClothingItemController',
          templateUrl: 'components/states/admin/pricing/clothing.html',
          resolve: {
            pricingRepo: 'pricingRepo',
            clothingTypes: function(pricingRepo){
              return pricingRepo.clothingType.getList();
            }
          }
        })
        .state('admin.support', {
          url: '/support',
          templateUrl: 'components/states/admin/support/support.html',
          controller: 'AdminSupportController',
          resolve: {
            User: 'User',
            users: function(User){
              return User.getList();
            }
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
            clothes: function(Auth, Clothing){
              return Clothing.one('byUser').one(Auth.user.id).get();
            }
          }
        })
        .state('customer.armoires', {
          url: '/armoire',
          templateUrl: 'components/states/customer/armoires/armoires.html',
          controller: 'CustomerArmoiresController',
          resolve: {
            pricingRepo: 'pricingRepo',
            armoireTypes: function(pricingRepo){
              return pricingRepo.armoireType.getList();
            }
          }
        })
        .state('customer.armoires.create', {
          url: '/create/:armoireType',
          controller: 'CustomerArmoiresCreateController',
          templateUrl: 'components/states/customer/armoires/create/create.html',
          resolve: {
            pricingRepo: 'pricingRepo',
            armoireType: function(pricingRepo, $stateParams){
              return pricingRepo.armoireType.one($stateParams.armoireType).get();
            },
            deliveryRepo: 'deliveryRepo',
            slots: function(deliveryRepo){
              return deliveryRepo.slots();
            }
          }
        })
        .state('customer.armoires.show', {
          url: '/:armoireId',
          controller: 'CustomerArmoiresShowController',
          templateUrl: 'components/states/customer/armoires/show/show.html',
          resolve: {
            pricingRepo: 'pricingRepo',
            clothingTypes: function(pricingRepo){
              return pricingRepo.clothingType.getList();
            },
            Armoire: 'Armoire',
            armoire: function(Armoire, $stateParams){
              return Armoire.one($stateParams.armoireId).get();
            },
            deliveryRepo: 'deliveryRepo',
            slots: function(deliveryRepo){
              return deliveryRepo.slots();
            }
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
            support: function(Auth){
              return Auth.user.support.get();
            }
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
    }
  );

}());
