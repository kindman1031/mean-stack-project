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
