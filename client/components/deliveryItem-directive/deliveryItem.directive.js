angular.module('app').directive('deliveryItem', function ($log, $timeout, SweetAlert, Delivery, Armoire, Clothing) {

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
});
