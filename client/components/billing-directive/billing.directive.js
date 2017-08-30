angular.module('app').directive('billing', function($log, $rootScope, $timeout, SweetAlert) {

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
});
