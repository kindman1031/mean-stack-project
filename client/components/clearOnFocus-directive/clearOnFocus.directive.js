angular.module('app').directive('clearOnFocus', function ($log, $timeout) {

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
});
