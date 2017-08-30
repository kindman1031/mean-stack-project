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
